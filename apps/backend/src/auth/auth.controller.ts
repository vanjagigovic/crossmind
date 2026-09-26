import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ThrottlerGuard, Throttle  } from "@nestjs/throttler";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { LogoutDto } from "./dto/logout.dto.js";
import { ForgotPasswordDto } from "./dto/forgot-password.dto.js";
import { ResetPasswordDto } from "./dto/reset-password.dto.js";

@UseGuards(ThrottlerGuard)
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post("register")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post("login")
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Throttle({ default: { limit: 5, ttl: 60_000 } })
    @Post("guest")
    async guest() {
        return this.authService.guest();
    }

    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    @Post("refresh")
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refreshToken);
    }

    @Throttle({ default: { limit: 10, ttl: 60_000 } })
    @Post("logout")
    async logout(@Body() dto: LogoutDto) {
        return this.authService.logout(dto.refreshToken);
    }

    @Throttle({ default: { limit: 3, ttl: 15 * 60_000 } })
    @Post("forgot-password")
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto);
    }

    @Throttle({ default: { limit: 5, ttl: 15 * 60_000 } })
    @Post("reset-password")
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto);
    }
}