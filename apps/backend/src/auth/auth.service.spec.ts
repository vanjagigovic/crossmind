import { ConflictException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";

describe("AuthService", () => {
  let authService: AuthService;

  const userService = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
  };

  const passwordService = {
    hash: vi.fn(),
    verify: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    authService = new AuthService(
      userService as any,
      passwordService as any,
    );
  });

  it("should register a new user", async () => {
    userService.findByEmail.mockResolvedValue(null);

    passwordService.hash.mockResolvedValue("hashed-password");

    userService.create.mockResolvedValue({
      id: "user-1",
      email: "vanja@test.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    });

    const result = await authService.register({
      email: " Vanja@Test.com ",
      password: "password123",
      displayName: " Vanja ",
    });

    expect(userService.findByEmail).toHaveBeenCalledWith(
      "vanja@test.com",
    );

    expect(passwordService.hash).toHaveBeenCalledWith(
      "password123",
    );

    expect(userService.create).toHaveBeenCalledWith({
      email: "vanja@test.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    });

    expect(result).toEqual({
      id: "user-1",
      email: "vanja@test.com",
      displayName: "Vanja",
      isGuest: false,
    });

    expect(result).not.toHaveProperty("passwordHash");
  });

  it("should reject an already registered email", async () => {
    userService.findByEmail.mockResolvedValue({
      id: "existing-user",
      email: "vanja@test.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    });

    await expect(
      authService.register({
        email: "vanja@test.com",
        password: "password123",
        displayName: "Vanja",
      }),
    ).rejects.toThrow(ConflictException);

    expect(passwordService.hash).not.toHaveBeenCalled();

    expect(userService.create).not.toHaveBeenCalled();
  });
});