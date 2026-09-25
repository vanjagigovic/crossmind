import { beforeEach, describe, expect, it, vi } from "vitest";

import { DrizzlePasswordResetTokenRepository } from "./drizzle-password-reset-token.repository.js";

describe("DrizzlePasswordResetTokenRepository", () => {
  let repository: DrizzlePasswordResetTokenRepository;

  const database = {
    client: {
      insert: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    repository = new DrizzlePasswordResetTokenRepository(
      database as any,
    );
  });

  it("should create a password reset token", async () => {
    const token = {
      id: "token-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date("2026-09-24T12:00:00.000Z"),
      createdAt: new Date("2026-09-17T12:00:00.000Z"),
      usedAt: null,
    };

    const returning = vi.fn().mockResolvedValue([token]);

    database.client.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning,
      }),
    });

    const result = await repository.create({
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: token.expiresAt,
    });

    expect(result).toEqual(token);
    expect(database.client.insert).toHaveBeenCalled();
  });

  it("should find a password reset token by id", async () => {
    const token = {
      id: "token-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date("2026-09-24T12:00:00.000Z"),
      createdAt: new Date("2026-09-17T12:00:00.000Z"),
      usedAt: null,
    };

    const limit = vi.fn().mockResolvedValue([token]);

    database.client.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const result = await repository.findById("token-1");

    expect(result).toEqual(token);
  });

  it("should return null when password reset token does not exist", async () => {
    const limit = vi.fn().mockResolvedValue([]);

    database.client.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit,
        }),
      }),
    });

    const result = await repository.findById("missing-token");

    expect(result).toBeNull();
  });

  it("should mark a password reset token as used", async () => {
    const where = vi.fn().mockResolvedValue(undefined);

    database.client.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where,
      }),
    });

    await repository.markAsUsed("token-1");

    expect(database.client.update).toHaveBeenCalled();
  });

  it("should find a password reset token by token hash", async () => {
  const token = {
    id: "token-1",
    userId: "user-1",
    tokenHash: "hashed-token",
    expiresAt: new Date("2026-09-24T12:00:00.000Z"),
    createdAt: new Date("2026-09-17T12:00:00.000Z"),
    usedAt: null,
  };

  const limit = vi.fn().mockResolvedValue([token]);

  database.client.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit,
      }),
    }),
  });

  const result = await repository.findByTokenHash("hashed-token");

  expect(result).toEqual(token);
});
});