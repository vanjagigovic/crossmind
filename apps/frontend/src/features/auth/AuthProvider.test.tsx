import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

const { mockGetUser, mockSaveAuth, mockClearAuth } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockSaveAuth: vi.fn(),
  mockClearAuth: vi.fn(),
}))

vi.mock('./auth-storage', () => ({
  getUser: mockGetUser,
  saveAuth: mockSaveAuth,
  clearAuth: mockClearAuth,
}))

const user = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  isGuest: false,
}

function TestComponent() {
  const {
    user: currentUser,
    isAuthenticated,
    setAuth,
    clearSession,
  } = useAuth()

  return (
    <div>
      <p>{currentUser?.displayName ?? 'No user'}</p>
      <p>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>

      <button
        onClick={() =>
          setAuth('access-token', 'refresh-token', user)
        }
      >
        Set auth
      </button>

      <button onClick={clearSession}>
        Clear session
      </button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockReturnValue(null)
  })

  it('starts unauthenticated when there is no stored user', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText('No user')).toBeTruthy()
    expect(screen.getByText('Not authenticated')).toBeTruthy()
    expect(mockGetUser).toHaveBeenCalledTimes(1)
  })

  it('loads the stored user on initialization', () => {
    mockGetUser.mockReturnValue(user)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    expect(screen.getByText('Test User')).toBeTruthy()
    expect(screen.getByText('Authenticated')).toBeTruthy()
  })

  it('sets authentication state and saves auth data', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

  fireEvent.click(screen.getByText('Set auth'))

    expect(screen.getByText('Test User')).toBeTruthy()
    expect(screen.getByText('Authenticated')).toBeTruthy()

    expect(mockSaveAuth).toHaveBeenCalledWith(
      'access-token',
      'refresh-token',
      user,
    )
  })

  it('clears authentication state and auth data', () => {
    mockGetUser.mockReturnValue(user)

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    fireEvent.click(screen.getByText('Clear session'))

    expect(screen.getByText('No user')).toBeTruthy()
    expect(screen.getByText('Not authenticated')).toBeTruthy()
    expect(mockClearAuth).toHaveBeenCalledTimes(1)
  })
})