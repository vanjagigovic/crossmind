import { Injectable } from "@nestjs/common";

@Injectable()
export class PasswordResetEmailService {
  async send(
    email: string,
    token: string,
  ): Promise<void> {
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;

    console.log(`Password reset link for ${email}: ${resetLink}`);
  }
}