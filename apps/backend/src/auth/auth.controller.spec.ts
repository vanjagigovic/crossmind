import { describe, expect, it, vi, beforeEach } from "vitest";
import { AuthController } from "./auth.controller.js";

describe("AuthController", () => {
    let authController: AuthController;

    const authService = {
        register: vi.fn(),
        login: vi.fn(),
        guest: vi.fn(),
        refresh: vi.fn(),
        logout: vi.fn(),
        forgotPassword: vi.fn(),
        resetPassword: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        authController = new AuthController(authService as any);
    });

    it("should register a user", async () => {
        const dto = {
            email: "vanja@test.com",
            password: "password123",
            displayName: "Vanja",
        };

        authService.register.mockResolvedValue({
            id: "user-1",
            email: "vanja@test.com",
            displayName: "Vanja",
            isGuest: false,
        });

        const result = await authController.register(dto);

        expect(authService.register).toHaveBeenCalledWith(dto);
        expect(result).toEqual({
            id: "user-1",
            email: "vanja@test.com",
            displayName: "Vanja",
            isGuest: false,
        });
    });

    it("should login a user", async () => {
        const dto = {
            email: "vanja@test.com",
            password: "password123",
        };

        authService.login.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });

        const result = await authController.login(dto);

        expect(authService.login).toHaveBeenCalledWith(dto);
        expect(result).toEqual({
            accessToken: "access-token",
            refreshToken: "refresh-token",
        });
    });

    it("should create a guest session", async () => {
        authService.guest.mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
            user: {
                id: "guest-1",
                email: null,
                displayName: "Guest",
                isGuest: true,
            },
        });

        const result = await authController.guest();

        expect(authService.guest).toHaveBeenCalled();
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

    it("should refresh an access token", async () => {
        const dto = {
            refreshToken: "refresh-token",
        };

        authService.refresh.mockResolvedValue({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
        });

        const result = await authController.refresh(dto);

        expect(authService.refresh).toHaveBeenCalledWith(
            "refresh-token",
        );

        expect(result).toEqual({
            accessToken: "new-access-token",
            refreshToken: "new-refresh-token",
        });
    });

    it("should logout a user", async () => {
        const dto = {
            refreshToken: "refresh-token",
        };

        authService.logout.mockResolvedValue(undefined);

        const result = await authController.logout(dto);

        expect(authService.logout).toHaveBeenCalledWith(
            "refresh-token",
        );

        expect(result).toBeUndefined();
    });
    it("should request a password reset", async () => {
        const dto = {
            email: "vanja@example.com",
        };

        const result = {
            message:
                "If an account with that email exists, a password reset link has been sent",
        };

        authService.forgotPassword.mockResolvedValue(result);

        await expect(authController.forgotPassword(dto)).resolves.toEqual(result);

        expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
    });

    it("should reset the password", async () => {
  const dto = {
    token: "raw-reset-token",
    newPassword: "new-password",
  };

  const result = {
    message: "Password has been reset successfully",
  };

  authService.resetPassword.mockResolvedValue(result);

  await expect(
    authController.resetPassword(dto),
  ).resolves.toEqual(result);

  expect(authService.resetPassword).toHaveBeenCalledWith(dto);
});

});