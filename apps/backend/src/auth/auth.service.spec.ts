import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthService } from "./auth.service.js";

describe("AuthService", () => {
  let authService: AuthService;

  const userService = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    updatePassword: vi.fn(),
  };

  const passwordService = {
    hash: vi.fn(),
    verify: vi.fn(),
  };

  const jwtTokenService = {
    generateAccessToken: vi.fn(),
    generateRefreshToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
  };

  const refreshSessionRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    revoke: vi.fn(),
    revokeByFamilyId: vi.fn(),
  };

  const tokenHashService = {
    hash: vi.fn(),
    matches: vi.fn(),
  };

  const passwordResetTokenRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findByTokenHash: vi.fn(),
    markAsUsed: vi.fn(),
  };

  const passwordResetEmailService = {
    send: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    tokenHashService.hash.mockReturnValue("hashed-refresh-token");

    authService = new AuthService(
      userService as any,
      passwordService as any,
      jwtTokenService as any,
      refreshSessionRepository as any,
      tokenHashService as any,
      passwordResetTokenRepository as any,
      passwordResetEmailService as any,
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
  it("should login an existing user", async () => {
    userService.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "vanja@test.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    });

    passwordService.verify.mockResolvedValue(true);

    jwtTokenService.generateAccessToken.mockResolvedValue(
      "access-token",
    );

    jwtTokenService.generateRefreshToken.mockResolvedValue(
      "refresh-token",
    );

    const result = await authService.login({
      email: " Vanja@Test.com ",
      password: "password123",
    });

    expect(userService.findByEmail).toHaveBeenCalledWith(
      "vanja@test.com",
    );

    expect(passwordService.verify).toHaveBeenCalledWith(
      "password123",
      "hashed-password",
    );

    expect(jwtTokenService.generateAccessToken).toHaveBeenCalledWith({
      sub: "user-1",
      isGuest: false,
    });

    expect(jwtTokenService.generateRefreshToken).toHaveBeenCalledWith({
      sub: "user-1",
      isGuest: false,
      sid: expect.any(String),
    });

    expect(tokenHashService.hash).toHaveBeenCalledWith(
      "refresh-token",
    );

     expect(refreshSessionRepository.create).toHaveBeenCalledWith({
      userId: "user-1",
      familyId: expect.any(String),
      tokenHash: "hashed-refresh-token",
      expiresAt: expect.any(Date),
    });

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: "user-1",
        email: "vanja@test.com",
        displayName: "Vanja",
        isGuest: false,
      },
    });
  });

  it("should reject invalid credentials", async () => {
    userService.findByEmail.mockResolvedValue({
      id: "user-1",
      email: "vanja@test.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    });

    passwordService.verify.mockResolvedValue(false);

    await expect(
      authService.login({
        email: "vanja@test.com",
        password: "wrong-password",
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
    expect(jwtTokenService.generateRefreshToken).not.toHaveBeenCalled();
  });

  it("should create and login a guest user", async () => {
    userService.create.mockResolvedValue({
      id: "guest-1",
      email: null,
      passwordHash: null,
      displayName: "Guest",
      isGuest: true,
    });

    jwtTokenService.generateAccessToken.mockResolvedValue(
      "access-token",
    );

    jwtTokenService.generateRefreshToken.mockResolvedValue(
      "refresh-token",
    );

    const result = await authService.guest();

    expect(userService.create).toHaveBeenCalledWith({
      displayName: "Guest",
      isGuest: true,
    });

    expect(jwtTokenService.generateAccessToken).toHaveBeenCalledWith({
      sub: "guest-1",
      isGuest: true,
    });

    expect(jwtTokenService.generateRefreshToken).toHaveBeenCalledWith({
      sub: "guest-1",
      isGuest: true,
      sid: expect.any(String),
    });

    expect(tokenHashService.hash).toHaveBeenCalledWith(
      "refresh-token",
    );

    expect(refreshSessionRepository.create).toHaveBeenCalledWith({
      userId: "guest-1",
      familyId: expect.any(String),
      tokenHash: "hashed-refresh-token",
      expiresAt: expect.any(Date),
    });

    expect(result).toEqual({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: "guest-1",
        email: null,
        displayName: "Guest",
        isGuest: true,
      },
    });
  });

  it("should refresh tokens for a valid refresh session", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      revokedAt: null,
    });

    tokenHashService.matches.mockReturnValue(true);

    userService.findById.mockResolvedValue({
      id: "user-1",
      email: "vanja@test.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    });

    jwtTokenService.generateAccessToken.mockResolvedValue(
      "new-access-token",
    );

    jwtTokenService.generateRefreshToken.mockResolvedValue(
      "new-refresh-token",
    );

    refreshSessionRepository.create.mockResolvedValue({
      id: "session-2",
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-new-refresh-token",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      revokedAt: null,
    });


    tokenHashService.hash.mockReturnValueOnce("hashed-new-refresh-token");
    
    const result = await authService.refresh("refresh-token");

    expect(refreshSessionRepository.create).toHaveBeenCalledWith({
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-new-refresh-token",
      expiresAt: expect.any(Date),
    });

    expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(
      "refresh-token",
    );

    expect(refreshSessionRepository.findById).toHaveBeenCalledWith(
      "session-1",
    );

    expect(tokenHashService.matches).toHaveBeenCalledWith(
      "refresh-token",
      "hashed-refresh-token",
    );

    expect(userService.findById).toHaveBeenCalledWith("user-1");

    expect(refreshSessionRepository.revoke).toHaveBeenCalledWith(
      "session-1",
    );

    expect(jwtTokenService.generateAccessToken).toHaveBeenCalledWith({
      sub: "user-1",
      isGuest: false,
    });

    expect(jwtTokenService.generateRefreshToken).toHaveBeenCalledWith({
      sub: "user-1",
      isGuest: false,
      sid: expect.any(String),
    });

    expect(result).toEqual({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      user: {
        id: "user-1",
        email: "vanja@test.com",
        displayName: "Vanja",
        isGuest: false,
      },
    });
  });

  it("should reject refresh when session does not exist", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue(null);

    await expect(
      authService.refresh("refresh-token"),
    ).rejects.toThrow(UnauthorizedException);

    expect(refreshSessionRepository.findById).toHaveBeenCalledWith(
      "session-1",
    );

    expect(tokenHashService.matches).not.toHaveBeenCalled();
    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
    expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it("should reject refresh when session is revoked", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      revokedAt: new Date(),
    });

    await expect(
      authService.refresh("refresh-token"),
    ).rejects.toThrow(UnauthorizedException);

    expect(tokenHashService.matches).not.toHaveBeenCalled();
    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
    expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it("should revoke the entire refresh token family when a revoked token is reused", async () => {
  jwtTokenService.verifyRefreshToken.mockResolvedValue({
    sub: "user-1",
    isGuest: false,
    sid: "session-1",
  });

  refreshSessionRepository.findById.mockResolvedValue({
    id: "session-1",
    userId: "user-1",
    familyId: "family-1",
    tokenHash: "hashed-refresh-token",
    expiresAt: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    revokedAt: new Date(),
  });

  await expect(
    authService.refresh("refresh-token"),
  ).rejects.toThrow(UnauthorizedException);

  expect(
    refreshSessionRepository.revokeByFamilyId,
  ).toHaveBeenCalledWith("family-1");

  expect(tokenHashService.matches).not.toHaveBeenCalled();
  expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
  expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  expect(jwtTokenService.generateRefreshToken).not.toHaveBeenCalled();
});

  it("should reject refresh when session is expired", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() - 60_000),
      createdAt: new Date(),
      revokedAt: null,
    });

    await expect(
      authService.refresh("refresh-token"),
    ).rejects.toThrow(UnauthorizedException);

    expect(tokenHashService.matches).not.toHaveBeenCalled();
    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
    expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it("should reject refresh when token hash does not match", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      revokedAt: null,
    });

    tokenHashService.matches.mockReturnValue(false);

    await expect(
      authService.refresh("refresh-token"),
    ).rejects.toThrow(UnauthorizedException);

    expect(tokenHashService.matches).toHaveBeenCalledWith(
      "refresh-token",
      "hashed-refresh-token",
    );

    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
    expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it("should reject refresh when session belongs to another user", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue({
      id: "session-1",
      userId: "user-2",
      familyId: "family-1",
      tokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      revokedAt: null,
    });

    tokenHashService.matches.mockReturnValue(true);

    await expect(
      authService.refresh("refresh-token"),
    ).rejects.toThrow(UnauthorizedException);

    expect(tokenHashService.matches).toHaveBeenCalledWith(
      "refresh-token",
      "hashed-refresh-token",
    );

    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
    expect(userService.findById).not.toHaveBeenCalled();
    expect(jwtTokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it("should revoke the refresh session on logout", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue({
      id: "session-1",
      userId: "user-1",
      familyId: "family-1",
      tokenHash: "hashed-refresh-token",
      expiresAt: new Date(Date.now() + 60_000),
      createdAt: new Date(),
      revokedAt: null,
    });

    await authService.logout("refresh-token");

    expect(jwtTokenService.verifyRefreshToken).toHaveBeenCalledWith(
      "refresh-token",
    );

    expect(refreshSessionRepository.findById).toHaveBeenCalledWith(
      "session-1",
    );

    expect(refreshSessionRepository.revoke).toHaveBeenCalledWith(
      "session-1",
    );
  });

  it("should do nothing on logout when the refresh token is invalid", async () => {
    jwtTokenService.verifyRefreshToken.mockRejectedValue(
      new Error("Invalid token"),
    );

    await authService.logout("invalid-refresh-token");

    expect(refreshSessionRepository.findById).not.toHaveBeenCalled();
    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
  });

  it("should do nothing on logout when the session does not exist", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
      sid: "session-1",
    });

    refreshSessionRepository.findById.mockResolvedValue(null);

    await authService.logout("refresh-token");

    expect(refreshSessionRepository.findById).toHaveBeenCalledWith(
      "session-1",
    );

    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
  });

  it("should do nothing on logout when the token has no session id", async () => {
    jwtTokenService.verifyRefreshToken.mockResolvedValue({
      sub: "user-1",
      isGuest: false,
    });

    await authService.logout("refresh-token");

    expect(refreshSessionRepository.findById).not.toHaveBeenCalled();
    expect(refreshSessionRepository.revoke).not.toHaveBeenCalled();
  });

  it("should create a password reset token for an existing user", async () => {
    const user = {
      id: "user-1",
      email: "vanja@example.com",
      passwordHash: "hashed-password",
      displayName: "Vanja",
      isGuest: false,
    };

    userService.findByEmail.mockResolvedValue(user);

    const result = await authService.forgotPassword({
      email: "vanja@example.com",
    });

    expect(result).toEqual({
      message: "If an account with that email exists, a password reset link has been sent",
    });

    expect(passwordResetTokenRepository.create).toHaveBeenCalledTimes(1);

    expect(passwordResetTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    );
  });

  it("should return the same response when the user does not exist", async () => {
    userService.findByEmail.mockResolvedValue(null);

    const result = await authService.forgotPassword({
      email: "unknown@example.com",
    });

    expect(result).toEqual({
      message: "If an account with that email exists, a password reset link has been sent",
    });

    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
  });

  it("should normalize the email before looking up the user", async () => {
    userService.findByEmail.mockResolvedValue(null);

    await authService.forgotPassword({
      email: "  VANJA@EXAMPLE.COM  ",
    });

    expect(userService.findByEmail).toHaveBeenCalledWith(
      "vanja@example.com",
    );
  });

  it("should reset the password with a valid reset token", async () => {
    const resetToken = {
      id: "reset-token-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
      usedAt: null,
    };

    const user = {
      id: "user-1",
      email: "vanja@example.com",
      passwordHash: "old-password-hash",
      displayName: "Vanja",
      isGuest: false,
    };

    passwordResetTokenRepository.findByTokenHash.mockResolvedValue(
      resetToken,
    );

    tokenHashService.hash.mockReturnValue("hashed-token");

    userService.findById.mockResolvedValue(user);

    passwordService.hash.mockResolvedValue("new-password-hash");

    await authService.resetPassword({
      token: "raw-reset-token",
      newPassword: "new-password",
    });

    expect(passwordService.hash).toHaveBeenCalledWith("new-password");

    expect(userService.updatePassword).toHaveBeenCalledWith(
      "user-1",
      "new-password-hash",
    );

    expect(passwordResetTokenRepository.markAsUsed).toHaveBeenCalledWith(
      "reset-token-1",
    );
  });

  it("should reject an invalid reset token", async () => {
    passwordResetTokenRepository.findByTokenHash.mockResolvedValue(null);

    tokenHashService.hash.mockReturnValue("hashed-token");

    await expect(
      authService.resetPassword({
        token: "invalid-token",
        newPassword: "new-password",
      }),
    ).rejects.toThrow("Invalid or expired password reset token");
  });

  it("should reject an expired reset token", async () => {
    const resetToken = {
      id: "reset-token-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date(Date.now() - 60 * 60 * 1000),
      createdAt: new Date(),
      usedAt: null,
    };

    passwordResetTokenRepository.findByTokenHash.mockResolvedValue(
      resetToken,
    );

    tokenHashService.hash.mockReturnValue("hashed-token");

    await expect(
      authService.resetPassword({
        token: "expired-token",
        newPassword: "new-password",
      }),
    ).rejects.toThrow("Invalid or expired password reset token");
  });

  it("should reject an already used reset token", async () => {
    const resetToken = {
      id: "reset-token-1",
      userId: "user-1",
      tokenHash: "hashed-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
      usedAt: new Date(),
    };

    passwordResetTokenRepository.findByTokenHash.mockResolvedValue(
      resetToken,
    );

    tokenHashService.hash.mockReturnValue("hashed-token");

    await expect(
      authService.resetPassword({
        token: "used-token",
        newPassword: "new-password",
      }),
    ).rejects.toThrow("Invalid or expired password reset token");
  });

});