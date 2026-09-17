import { Module } from "@nestjs/common";

import { UserModule } from "../user/user.module.js";
import { AuthService } from "./auth.service.js";
import { PasswordService } from "./security/password.service.js";
import { AuthController } from "./auth.controller.js";

@Module({
    imports: [UserModule],
    controllers: [AuthController],
    providers: [AuthService, PasswordService],
    exports: [AuthService, PasswordService],
})
export class AuthModule { }