import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../../../api/client'
import { resetPassword } from '../api/auth'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    setError('')

    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword({
        token,
        newPassword: password,
      })

      navigate('/login')
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setError('This reset link is invalid or has expired.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <p>CrossMind</p>
          <h1>Reset password</h1>
          <p>Enter your new password below.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="password">New password</label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
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
            {isLoading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            <Link to="/login">Back to login</Link>
          </p>
        </footer>
      </section>
    </main>
  )
}