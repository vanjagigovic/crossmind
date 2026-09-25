import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from "../user/user.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtTokenService } from "./security/jwt.service.js";
import { PasswordService } from "./security/password.service.js";
import { DrizzleRefreshSessionRepository } from "./repository/drizzle-refresh-session.repository.js";
import { REFRESH_SESSION_REPOSITORY } from "./repository/refresh-session.repository.js";
import { TokenHashService } from "./security/token-hash.service.js";
import { DrizzlePasswordResetTokenRepository } from "./repository/drizzle-password-reset-token.repository.js";
import { PASSWORD_RESET_TOKEN_REPOSITORY } from "./repository/password-reset-token.repository.js";
import { PasswordResetEmailService } from "./email/password-reset-email.service.js";

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>("JWT_ACCESS_SECRET"),
      }),
    }),
  ],
  controllers: [AuthController],
 providers: [
  AuthService,
  PasswordService,
  JwtTokenService,
  TokenHashService,
  DrizzleRefreshSessionRepository,
  PasswordResetEmailService,
  {
    provide: REFRESH_SESSION_REPOSITORY,
    useExisting: DrizzleRefreshSessionRepository,
  },
  DrizzlePasswordResetTokenRepository,
  {
    provide: PASSWORD_RESET_TOKEN_REPOSITORY,
    useExisting: DrizzlePasswordResetTokenRepository,
  },
],
  exports: [
    AuthService,
    PasswordService,
    JwtTokenService,
  ],
})
export class AuthModule {}