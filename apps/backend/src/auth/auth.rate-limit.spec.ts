import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { describe, expect, it, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { ThrottlerModule } from "@nestjs/throttler";

import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

describe("Auth rate limiting", () => {
    let app: INestApplication;

    const authService = {
        login: vi.fn().mockResolvedValue({
            accessToken: "access-token",
            refreshToken: "refresh-token",
        }),
        forgotPassword: vi.fn().mockResolvedValue({
            message: "If the email exists, a reset link has been sent.",
        }),
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ThrottlerModule.forRoot({
                    throttlers: [
                        {
                            ttl: 60_000,
                            limit: 5,
                        },
                    ],
                }),
            ],
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: authService,
                },
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        await app.init();
    });

    afterAll(async () => {
        await app?.close();
    });

    it("should rate limit login requests", async () => {
        for (let i = 0; i < 5; i++) {
            const response = await request(app.getHttpServer())
                .post("/auth/login")
                .send({
                    email: "vanja@test.com",
                    password: "password123",
                });

            expect(response.status).toBe(201);
        }

        const response = await request(app.getHttpServer())
            .post("/auth/login")
            .send({
                email: "vanja@test.com",
                password: "password123",
            });

        expect(response.status).toBe(429);
    });

    it("should rate limit forgot-password requests", async () => {
        for (let i = 0; i < 3; i++) {
            const response = await request(app.getHttpServer())
                .post("/auth/forgot-password")
                .send({
                    email: "vanja@test.com",
                });

            expect(response.status).toBe(201);
        }

        const response = await request(app.getHttpServer())
            .post("/auth/forgot-password")
            .send({
                email: "vanja@test.com",
            });

        expect(response.status).toBe(429);
    });
});