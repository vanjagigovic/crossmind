import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'

const mockUseAuth = vi.fn()

vi.mock('../useAuth', () => ({
    useAuth: () => mockUseAuth(),
}))

describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to login', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
        })

        render(
            <MemoryRouter initialEntries={['/create']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/create" element={<div>Protected page</div>} />
                    </Route>

                    <Route path="/login" element={<div>Login page</div>} />
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByText('Login page')).toBeTruthy()
        expect(screen.queryByText('Protected page')).toBeNull()
    })

    it('renders protected content for authenticated users', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
        })

        render(
            <MemoryRouter initialEntries={['/create']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/create" element={<div>Protected page</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>,
        )

        expect(screen.getByText('Protected page')).toBeTruthy()
    })
})