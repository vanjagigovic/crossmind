import type { User } from './api/auth'

const ACCESS_TOKEN_KEY = 'crossmind_access_token'
const REFRESH_TOKEN_KEY = 'crossmind_refresh_token'
const USER_KEY = 'crossmind_user'

export function saveAuth(
  accessToken: string,
  refreshToken: string,
  user: User,
) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function getUser(): User | null {
  const user = localStorage.getItem(USER_KEY)

  if (!user) {
    return null
  }

  return JSON.parse(user) as User
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}