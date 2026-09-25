import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DatabaseService } from "../../db/database.service.js";
import { passwordResetTokens } from "../../db/schema/index.js";
import type { PasswordResetToken } from "../domain/password-reset-token.js";
import type {
  CreatePasswordResetTokenData,
  PasswordResetTokenRepository,
} from "./password-reset-token.repository.js";

@Injectable()
export class DrizzlePasswordResetTokenRepository
  implements PasswordResetTokenRepository
{
  constructor(private readonly database: DatabaseService) {}

  async create(
    data: CreatePasswordResetTokenData,
  ): Promise<PasswordResetToken> {
    const result = await this.database.client
      .insert(passwordResetTokens)
      .values(data)
      .returning();

    return this.toDomain(result[0]);
  }

  async findById(id: string): Promise<PasswordResetToken | null> {
    const result = await this.database.client
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.id, id))
      .limit(1);

    const token = result[0];

    if (!token) {
      return null;
    }

    return this.toDomain(token);
  }

  async findByTokenHash(
  tokenHash: string,
): Promise<PasswordResetToken | null> {
  const result = await this.database.client
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  const token = result[0];

  if (!token) {
    return null;
  }

  return this.toDomain(token);
}

  async markAsUsed(id: string): Promise<void> {
    await this.database.client
      .update(passwordResetTokens)
      .set({
        usedAt: new Date(),
      })
      .where(eq(passwordResetTokens.id, id));
  }

  private toDomain(
    token: typeof passwordResetTokens.$inferSelect,
  ): PasswordResetToken {
    return {
      id: token.id,
      userId: token.userId,
      tokenHash: token.tokenHash,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
      usedAt: token.usedAt,
    };
  }
}