import { describe, expect, it } from "vitest";

import { TokenHashService } from "./token-hash.service.js";

describe("TokenHashService", () => {
    it("should generate a SHA-256 hash", () => {
        const service = new TokenHashService();

        const result = service.hash("refresh-token");

        expect(result).toHaveLength(64);
        expect(result).toMatch(/^[a-f0-9]+$/);
    });

    it("should generate the same hash for the same token", () => {
        const service = new TokenHashService();

        const first = service.hash("refresh-token");
        const second = service.hash("refresh-token");

        expect(first).toBe(second);
    });

    it("should generate different hashes for different tokens", () => {
        const service = new TokenHashService();

        const first = service.hash("refresh-token-1");
        const second = service.hash("refresh-token-2");

        expect(first).not.toBe(second);
    });

    it("should return true when token matches the expected hash", () => {
        const service = new TokenHashService();

        const token = "refresh-token";
        const expectedHash = service.hash(token);

        const result = service.matches(token, expectedHash);

        expect(result).toBe(true);
    });

    it("should return false when token does not match the expected hash", () => {
        const service = new TokenHashService();

        const token = "refresh-token";
        const expectedHash = service.hash("different-token");

        const result = service.matches(token, expectedHash);

        expect(result).toBe(false);
    });

});