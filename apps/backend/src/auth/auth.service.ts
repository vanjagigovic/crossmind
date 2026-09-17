import { ConflictException, Injectable } from "@nestjs/common";

import { UserService } from "../user/user.service.js";
import { PasswordService } from "./security/password.service.js";
import type { RegisterDto } from "./dto/register.dto.js";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
  ) {}

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
}