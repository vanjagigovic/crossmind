import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";

import { UserService } from "../user/user.service.js";
import type { RegisterDto } from "./dto/register.dto.js";
import type { LoginDto } from "./dto/login.dto.js";
import {
  REFRESH_SESSION_REPOSITORY,
  type RefreshSessionRepository,
} from "./repository/refresh-session.repository.js";
import { JwtTokenService } from "./security/jwt.service.js";
import { PasswordService } from "./security/password.service.js";
import { TokenHashService } from "./security/token-hash.service.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
    @Inject(REFRESH_SESSION_REPOSITORY)
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly tokenHashService: TokenHashService,
  ) { }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("Email is already registered");
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.userService.create({
      email,
      passwordHash,
      displayName: dto.displayName.trim(),
      isGuest: false,
    });

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      isGuest: user.isGuest,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userService.findByEmail(email);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordMatches = await this.passwordService.verify(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const payload = {
      sub: user.id,
      isGuest: user.isGuest,
    };

    const accessToken =
      await this.jwtTokenService.generateAccessToken(payload);

    const refreshToken = await this.createRefreshSession(
      user.id,
      user.isGuest,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isGuest: user.isGuest,
      },
    };
  }

  async guest() {
    const user = await this.userService.create({
      displayName: "Guest",
      isGuest: true,
    });

    const payload = {
      sub: user.id,
      isGuest: true,
    };

    const accessToken =
      await this.jwtTokenService.generateAccessToken(payload);

    const refreshToken = await this.createRefreshSession(
      user.id,
      true,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isGuest: user.isGuest,
      },
    };
  }

  async refresh(refreshToken: string) {
    const payload =
      await this.jwtTokenService.verifyRefreshToken(refreshToken);

    if (!payload.sid) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const session =
      await this.refreshSessionRepository.findById(payload.sid);

    if (!session) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (session.revokedAt) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const tokenMatches = this.tokenHashService.matches(
      refreshToken,
      session.tokenHash,
    );

    if (!tokenMatches) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (session.userId !== payload.sub) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.refreshSessionRepository.revoke(session.id);

    const accessToken =
      await this.jwtTokenService.generateAccessToken({
        sub: user.id,
        isGuest: user.isGuest,
      });

    const newRefreshToken = await this.createRefreshSession(
      user.id,
      user.isGuest,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isGuest: user.isGuest,
      },
    };
  }

  private async createRefreshSession(
    userId: string,
    isGuest: boolean,
  ) {
    const sessionId = randomUUID();

    const payload = {
      sub: userId,
      isGuest,
      sid: sessionId,
    };

    const refreshToken =
      await this.jwtTokenService.generateRefreshToken(payload);

    const tokenHash = this.tokenHashService.hash(refreshToken);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    );

    await this.refreshSessionRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });

    return refreshToken;
  }

  async logout(refreshToken: string): Promise<void> {
    let payload;

    try {
      payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);
    } catch {
      return;
    }

    if (!payload.sid) {
      return;
    }

    const session = await this.refreshSessionRepository.findById(payload.sid);

    if (!session) {
      return;
    }

    await this.refreshSessionRepository.revoke(session.id);
  }
}