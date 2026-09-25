import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { guest, login } from '../api/auth'
import { saveAuth } from '../auth-storage'

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await login({ email, password })
      saveAuth(response.accessToken, response.refreshToken, response.user)
      navigate('/')
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError('Invalid email or password')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGuestLogin() {
    setError('')
    setIsLoading(true)

    try {
      const response = await guest()
      saveAuth(response.accessToken, response.refreshToken, response.user)
      navigate('/')
    } catch {
      setError('Unable to continue as guest. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <p>CrossMind</p>
          <h1>Log in</h1>
          <p>Log in to continue playing CrossMind.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="auth-primary-action"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          className="auth-secondary-action"
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          Continue as guest
        </button>

        <footer className="auth-footer">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register">Register</Link>
          </p>
        </footer>
      </section>
    </main>
  )
}