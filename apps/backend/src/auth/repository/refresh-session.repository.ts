import type { RefreshSession } from "../domain/refresh-session.js";

export const REFRESH_SESSION_REPOSITORY = Symbol(
  "REFRESH_SESSION_REPOSITORY",
);

export interface CreateRefreshSessionData {
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshSessionRepository {
  create(data: CreateRefreshSessionData): Promise<RefreshSession>;

  findById(id: string): Promise<RefreshSession | null>;

  revoke(id: string): Promise<void>;
}