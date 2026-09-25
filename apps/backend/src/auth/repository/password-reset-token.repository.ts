import type { PasswordResetToken } from "../domain/password-reset-token.js";

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol(
  "PASSWORD_RESET_TOKEN_REPOSITORY",
);

export interface CreatePasswordResetTokenData {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface PasswordResetTokenRepository {
  create(
    data: CreatePasswordResetTokenData,
  ): Promise<PasswordResetToken>;

  findById(id: string): Promise<PasswordResetToken | null>;

  markAsUsed(id: string): Promise<void>;

  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
}