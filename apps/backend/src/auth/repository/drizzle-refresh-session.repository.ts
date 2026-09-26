import { Injectable } from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";

import { DatabaseService } from "../../db/database.service.js";
import { refreshSessions } from "../../db/schema/index.js";
import type { RefreshSession } from "../domain/refresh-session.js";
import type {
  CreateRefreshSessionData,
  RefreshSessionRepository,
} from "./refresh-session.repository.js";

@Injectable()
export class DrizzleRefreshSessionRepository
  implements RefreshSessionRepository {
  constructor(private readonly database: DatabaseService) { }

  async create(
    data: CreateRefreshSessionData,
  ): Promise<RefreshSession> {
    const result = await this.database.client
      .insert(refreshSessions)
      .values(data)
      .returning();

    return this.toDomain(result[0]);
  }

  async findById(id: string): Promise<RefreshSession | null> {
    const result = await this.database.client
      .select()
      .from(refreshSessions)
      .where(eq(refreshSessions.id, id))
      .limit(1);

    const session = result[0];

    if (!session) {
      return null;
    }

    return this.toDomain(session);
  }

  async revoke(id: string): Promise<void> {
    await this.database.client
      .update(refreshSessions)
      .set({
        revokedAt: new Date(),
      })
      .where(eq(refreshSessions.id, id));
  }

  async revokeByFamilyId(familyId: string): Promise<void> {
    await this.database.client
      .update(refreshSessions)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(refreshSessions.familyId, familyId),
          isNull(refreshSessions.revokedAt),
        ),
      );
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.database.client
      .update(refreshSessions)
      .set({
        revokedAt: new Date(),
      })
      .where(
        and(
          eq(refreshSessions.userId, userId),
          isNull(refreshSessions.revokedAt),
        ),
      );
  }

  private toDomain(
    session: typeof refreshSessions.$inferSelect,
  ): RefreshSession {
    return {
      id: session.id,
      userId: session.userId,
      familyId: session.familyId,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
      revokedAt: session.revokedAt,
    };
  }
}