import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./dto/register.dto.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post("register")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post("login")
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post("guest")
    async guest() {
        return this.authService.guest();
    }

    @Post("refresh")
    async refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refreshToken);
    }
}