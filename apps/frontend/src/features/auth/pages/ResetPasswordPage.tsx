import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../api/client';
import { resetPassword } from '../api/auth';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    setError('');

    if (!token) {
      setError(t('auth.resetPassword.invalidToken'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.resetPassword.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: password,
      });

      navigate('/login');
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setError(t('auth.resetPassword.expiredLink'));
      } else {
        setError(t('auth.genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <p>CrossMind</p>
          <h1>{t('auth.resetPassword.title')}</h1>
          <p>{t('auth.resetPassword.description')}</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="password">
              {t('auth.resetPassword.newPassword')}
            </label>

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
            <label htmlFor="confirmPassword">
              {t('auth.resetPassword.confirmPassword')}
            </label>

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
            {isLoading
              ? t('auth.resetPassword.resetting')
              : t('auth.resetPassword.resetPassword')}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            <Link to="/login">{t('auth.resetPassword.backToLogin')}</Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
