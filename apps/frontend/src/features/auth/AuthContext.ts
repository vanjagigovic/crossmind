import { createContext } from 'react'

import type { User } from './api/auth'

export type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => void
  clearSession: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)