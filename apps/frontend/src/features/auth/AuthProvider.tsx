import {
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { User } from './api/auth'
import {
  AuthContext,
  type AuthContextValue,
} from './AuthContext'
import {
  clearAuth,
  getUser,
  saveAuth,
} from './auth-storage'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => getUser())

  function setAuth(
    accessToken: string,
    refreshToken: string,
    nextUser: User,
  ) {
    saveAuth(accessToken, refreshToken, nextUser)
    setUser(nextUser)
  }

  function clearSession() {
    clearAuth()
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      setAuth,
      clearSession,
    }),
    [user],
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}