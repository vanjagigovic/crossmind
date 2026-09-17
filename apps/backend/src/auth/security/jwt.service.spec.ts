import { describe, expect, it, vi, beforeEach } from "vitest";

import { JwtTokenService } from "./jwt.service.js";

describe("JwtTokenService", () => {
    let jwtTokenService: JwtTokenService;

    const jwtService = {
        signAsync: vi.fn(),
        verifyAsync: vi.fn(),
    };

    const configService = {
        getOrThrow: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        jwtTokenService = new JwtTokenService(
            jwtService as any,
            configService as any,
        );
    });

    it("should generate an access token", async () => {
        configService.getOrThrow
            .mockReturnValueOnce("15m");

        jwtService.signAsync.mockResolvedValue("access-token");

        const payload = {
            sub: "user-1",
            isGuest: false,
        };

        const result = await jwtTokenService.generateAccessToken(payload);

        expect(configService.getOrThrow).toHaveBeenCalledWith(
            "JWT_ACCESS_EXPIRES_IN",
        );

        expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
            expiresIn: "15m",
        });

        expect(result).toBe("access-token");
    });

    it("should generate a refresh token with a separate secret", async () => {
        configService.getOrThrow
            .mockReturnValueOnce("refresh-secret")
            .mockReturnValueOnce("7d");

        jwtService.signAsync.mockResolvedValue("refresh-token");

        const payload = {
            sub: "user-1",
            isGuest: false,
        };

        const result = await jwtTokenService.generateRefreshToken(payload);

        expect(configService.getOrThrow).toHaveBeenNthCalledWith(
            1,
            "JWT_REFRESH_SECRET",
        );

        expect(configService.getOrThrow).toHaveBeenNthCalledWith(
            2,
            "JWT_REFRESH_EXPIRES_IN",
        );

        expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
            secret: "refresh-secret",
            expiresIn: "7d",
        });

        expect(result).toBe("refresh-token");
    });

    it("should verify a refresh token", async () => {
        configService.getOrThrow.mockReturnValue("refresh-secret");
        jwtService.verifyAsync.mockResolvedValue({
            sub: "user-1",
            isGuest: false,
            sid: "session-1",
        });

        const result = await jwtTokenService.verifyRefreshToken(
            "refresh-token",
        );

        expect(configService.getOrThrow).toHaveBeenCalledWith(
            "JWT_REFRESH_SECRET",
        );

        expect(jwtService.verifyAsync).toHaveBeenCalledWith(
            "refresh-token",
            {
                secret: "refresh-secret",
            },
        );

        expect(result).toEqual({
            sub: "user-1",
            isGuest: false,
            sid: "session-1",
        });
    });
});
