import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { User } from './api/auth'
import {
  clearAuth,
  getUser,
  saveAuth,
} from './auth-storage'

type AuthContextValue = {
  user: User | null
  isAuthenticated: boolean
  setAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => void
  clearSession: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

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

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}