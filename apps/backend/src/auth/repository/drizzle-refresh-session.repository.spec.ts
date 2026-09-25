import { describe, expect, it, vi, beforeEach } from "vitest";

import { DrizzleRefreshSessionRepository } from "./drizzle-refresh-session.repository.js";

describe("DrizzleRefreshSessionRepository", () => {
  let repository: DrizzleRefreshSessionRepository;

  const database = {
    client: {
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new DrizzleRefreshSessionRepository(
      database as any,
    );
  });

  it("should create a refresh session", async () => {
    const session = {
      id: "session-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date("2026-09-24T12:00:00.000Z"),
      createdAt: new Date("2026-09-17T12:00:00.000Z"),
      revokedAt: null,
    };

    const returning = vi.fn().mockResolvedValue([session]);

    database.client.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning,
      }),
    });

    const result = await repository.create({
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: session.expiresAt,
    });

    expect(result).toEqual(session);

    expect(database.client.insert).toHaveBeenCalled();
  });

  it("should find a refresh session by id", async () => {
    const session = {
      id: "session-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date("2026-09-24T12:00:00.000Z"),
      createdAt: new Date("2026-09-17T12:00:00.000Z"),
      revokedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([session]);

    database.client.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const result = await repository.findById("session-1");

    expect(result).toEqual(session);
  });

  it("should return null when refresh session does not exist", async () => {
    const limit = vi.fn().mockResolvedValue([]);

    database.client.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const result = await repository.findById("missing-session");

    expect(result).toBeNull();
  });

  it("should revoke a refresh session", async () => {
    const where = vi.fn().mockResolvedValue(undefined);

    database.client.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where,
      }),
    });

    await repository.revoke("session-1");

    expect(database.client.update).toHaveBeenCalled();
  });
});