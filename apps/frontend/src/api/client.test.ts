import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiError, get } from './client'

const {
    mockGetAccessToken,
    mockGetRefreshToken,
    mockSaveAuth,
    mockClearAuth,
} = vi.hoisted(() => ({
    mockGetAccessToken: vi.fn(),
    mockGetRefreshToken: vi.fn(),
    mockSaveAuth: vi.fn(),
    mockClearAuth: vi.fn(),
}))

vi.mock('../features/auth/auth-storage', () => ({
    getAccessToken: mockGetAccessToken,
    getRefreshToken: mockGetRefreshToken,
    saveAuth: mockSaveAuth,
    clearAuth: mockClearAuth,
}))

describe('api client', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.stubGlobal('fetch', vi.fn())
    })

    it('refreshes the access token and retries the original request after 401', async () => {
        mockGetAccessToken
            .mockReturnValueOnce('expired-access-token')
            .mockReturnValueOnce('new-access-token')

        mockGetRefreshToken.mockReturnValue('refresh-token')

        vi.mocked(fetch)
            .mockResolvedValueOnce(
                new Response(null, { status: 401 }),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        accessToken: 'new-access-token',
                        refreshToken: 'new-refresh-token',
                        user: {
                            id: 'user-1',
                            email: 'test@example.com',
                            displayName: 'Test User',
                            isGuest: false,
                        },
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({ message: 'Success' }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            )

        const result = await get<{ message: string }>('/protected')

        expect(result).toEqual({ message: 'Success' })

        expect(fetch).toHaveBeenCalledTimes(3)

        expect(fetch).toHaveBeenNthCalledWith(
            1,
            '/api/protected',
            expect.objectContaining({
                headers: expect.any(Headers),
            }),
        )

        expect(fetch).toHaveBeenNthCalledWith(
            2,
            '/api/auth/refresh',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    refreshToken: 'refresh-token',
                }),
            }),
        )

        expect(fetch).toHaveBeenNthCalledWith(
            3,
            '/api/protected',
            expect.objectContaining({
                headers: expect.any(Headers),
            }),
        )

        expect(mockSaveAuth).toHaveBeenCalledWith(
            'new-access-token',
            'new-refresh-token',
            {
                id: 'user-1',
                email: 'test@example.com',
                displayName: 'Test User',
                isGuest: false,
            },
        )
    })

    it('clears authentication when there is no refresh token', async () => {
        mockGetAccessToken.mockReturnValue('expired-access-token')
        mockGetRefreshToken.mockReturnValue(null)

        vi.mocked(fetch).mockResolvedValueOnce(
            new Response(null, { status: 401 }),
        )

        await expect(get('/protected')).rejects.toEqual(
            new ApiError(401, 'Authentication required'),
        )

        expect(mockClearAuth).toHaveBeenCalledTimes(1)
        expect(fetch).toHaveBeenCalledTimes(1)
    })

    it('clears authentication when refresh token is invalid', async () => {
        mockGetAccessToken.mockReturnValue('expired-access-token')
        mockGetRefreshToken.mockReturnValue('invalid-refresh-token')

        vi.mocked(fetch)
            .mockResolvedValueOnce(
                new Response(null, { status: 401 }),
            )
            .mockResolvedValueOnce(
                new Response(
                    JSON.stringify({
                        message: 'Invalid refresh token',
                    }),
                    {
                        status: 401,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                ),
            )

        await expect(get('/protected')).rejects.toEqual(
            new ApiError(
                401,
                'Request failed with status 401',
            ),
        )

        expect(mockClearAuth).toHaveBeenCalledTimes(1)
        expect(fetch).toHaveBeenCalledTimes(2)
    })

    it('shares one refresh request between concurrent 401 responses', async () => {
        mockGetAccessToken.mockReturnValue('expired-access-token')
        mockGetRefreshToken.mockReturnValue('refresh-token')

        const authResponse = {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            user: {
                id: 'user-1',
                email: 'test@example.com',
                displayName: 'Test User',
                isGuest: false,
            },
        }

        const refreshResponse = new Response(
            JSON.stringify(authResponse),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        )

        const protectedResponse = () =>
            new Response(
                JSON.stringify({ message: 'Success' }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )

        vi.mocked(fetch)
            .mockResolvedValueOnce(
                new Response(null, { status: 401 }),
            )
            .mockResolvedValueOnce(
                new Response(null, { status: 401 }),
            )
            .mockResolvedValueOnce(refreshResponse)
            .mockResolvedValueOnce(protectedResponse())
            .mockResolvedValueOnce(protectedResponse())

        const [firstResult, secondResult] = await Promise.all([
            get<{ message: string }>('/first'),
            get<{ message: string }>('/second'),
        ])

        expect(firstResult).toEqual({ message: 'Success' })
        expect(secondResult).toEqual({ message: 'Success' })

        expect(fetch).toHaveBeenCalledTimes(5)

        const refreshCalls = vi.mocked(fetch).mock.calls.filter(
            ([url]) => url === '/api/auth/refresh',
        )

        expect(refreshCalls).toHaveLength(1)

        expect(mockSaveAuth).toHaveBeenCalledTimes(2)
    })
})