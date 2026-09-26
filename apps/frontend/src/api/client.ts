import {
  getAccessToken,
  getRefreshToken,
  saveAuth,
  clearAuth,
} from '../features/auth/auth-storage'
import type { AuthResponse } from '../features/auth/api/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

let refreshPromise: Promise<AuthResponse> | null = null

export class ApiError extends Error {
  public readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path)
}

export async function post<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await sendRequest(path, options)

  if (response.status !== 401 || path === '/auth/refresh') {
    return handleResponse<T>(response)
  }

  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    clearAuth()
    throw new ApiError(401, 'Authentication required')
  }

  try {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(refreshToken)
    }

    const auth = await refreshPromise

    saveAuth(
      auth.accessToken,
      auth.refreshToken,
      auth.user,
    )

    const retryResponse = await sendRequest(path, options)

    return handleResponse<T>(retryResponse)
  } catch (error) {
    clearAuth()

    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(401, 'Authentication required')
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<AuthResponse> {
  try {
    const response = await sendRequest(
      '/auth/refresh',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      },
      true,
    )

    return await handleResponse<AuthResponse>(response)
  } finally {
    refreshPromise = null
  }
}

async function sendRequest(
  path: string,
  options?: RequestInit,
  skipAccessToken = false,
): Promise<Response> {
  const token = getAccessToken()
  const headers = new Headers(options?.headers)

  if (token && !skipAccessToken) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })
}

async function handleResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `Request failed with status ${response.status}`,
    )
  }

  return response.json() as Promise<T>
}