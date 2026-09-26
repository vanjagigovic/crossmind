import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes, randomUUID } from "node:crypto";

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
import type { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import type { ResetPasswordDto } from "./dto/reset-password.dto.js";
import {
  PASSWORD_RESET_TOKEN_REPOSITORY,
  type PasswordResetTokenRepository,
} from "./repository/password-reset-token.repository.js";
import { PasswordResetEmailService } from "./email/password-reset-email.service.js";


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
    @Inject(REFRESH_SESSION_REPOSITORY)
    private readonly refreshSessionRepository: RefreshSessionRepository,
    private readonly tokenHashService: TokenHashService,
    @Inject(PASSWORD_RESET_TOKEN_REPOSITORY)
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly passwordResetEmailService: PasswordResetEmailService,
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

  async forgotPassword(dto: ForgotPasswordDto) {
  const email = dto.email.trim().toLowerCase();

  const user = await this.userService.findByEmail(email);

  const message =
    "If an account with that email exists, a password reset link has been sent";

  if (!user || user.isGuest) {
    return { message };
  }

  const token = randomBytes(32).toString("hex");

  const tokenHash = this.tokenHashService.hash(token);

  const expiresAt = new Date(
    Date.now() + 60 * 60 * 1000,
  );

 await this.passwordResetTokenRepository.create({
  userId: user.id,
  tokenHash,
  expiresAt,
});

if (user.email) {
  await this.passwordResetEmailService.send(
    user.email,
    token,
  );
}

return { message };
}

async resetPassword(dto: ResetPasswordDto) {
  const tokenHash = this.tokenHashService.hash(dto.token);

  const resetToken =
    await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

  if (!resetToken) {
    throw new UnauthorizedException(
      "Invalid or expired password reset token",
    );
  }

  if (resetToken.usedAt) {
    throw new UnauthorizedException(
      "Invalid or expired password reset token",
    );
  }

  if (resetToken.expiresAt <= new Date()) {
    throw new UnauthorizedException(
      "Invalid or expired password reset token",
    );
  }

  const user = await this.userService.findById(resetToken.userId);

  if (!user || user.isGuest) {
    throw new UnauthorizedException(
      "Invalid or expired password reset token",
    );
  }

  const passwordHash = await this.passwordService.hash(
    dto.newPassword,
  );

  await this.userService.updatePassword(
    user.id,
    passwordHash,
  );

  await this.passwordResetTokenRepository.markAsUsed(
    resetToken.id,
  );

  return {
    message: "Password has been reset successfully",
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
      session.familyId,
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
    familyId?: string,
  ) {
    const sessionId = randomUUID();
    const sessionFamilyId = familyId ?? randomUUID();

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
      familyId: sessionFamilyId,
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