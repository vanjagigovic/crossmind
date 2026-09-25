import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService as NestJwtService, JwtSignOptions } from "@nestjs/jwt";

import type { JwtPayload } from "./jwt-payload.js";

@Injectable()
export class JwtTokenService {
  constructor(
    private readonly jwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const expiresIn = this.configService.getOrThrow<string>(
      "JWT_ACCESS_EXPIRES_IN",
    ) as JwtSignOptions["expiresIn"];

    return this.jwtService.signAsync(payload, {
      expiresIn,
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const secret = this.configService.getOrThrow<string>(
      "JWT_REFRESH_SECRET",
    );

    const expiresIn = this.configService.getOrThrow<string>(
      "JWT_REFRESH_EXPIRES_IN",
    ) as JwtSignOptions["expiresIn"];

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
  const secret = this.configService.getOrThrow<string>(
    "JWT_REFRESH_SECRET",
  );

  return this.jwtService.verifyAsync<JwtPayload>(token, {
    secret,
  });
}
}