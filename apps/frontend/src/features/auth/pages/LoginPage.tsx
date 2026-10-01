import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../api/client';
import { guest, login } from '../api/auth';
import { useAuth } from '../useAuth';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      setAuth(response.accessToken, response.refreshToken, response.user);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setError(t('auth.login.invalidCredentials'));
      } else {
        setError(t('auth.genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGuestLogin() {
    setError('');
    setIsLoading(true);

    try {
      const response = await guest();
      setAuth(response.accessToken, response.refreshToken, response.user);
      navigate('/');
    } catch {
      setError(t('auth.login.guestError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <header className="auth-header">
          <p>CrossMind</p>
          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.description')}</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">{t('auth.email')}</label>
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
            <label htmlFor="password">{t('auth.password')}</label>
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
            {isLoading ? t('auth.login.loggingIn') : t('auth.login.title')}
          </button>
        </form>

        <div className="auth-links">
          <Link to="/forgot-password">{t('auth.login.forgotPassword')}</Link>
        </div>

        <div className="auth-divider">
          <span>{t('auth.login.or')}</span>
        </div>

        <button
          className="auth-secondary-action"
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          {t('auth.login.continueAsGuest')}
        </button>

        <footer className="auth-footer">
          <p>
            {t('auth.login.noAccount')}{' '}
            <Link to="/register">{t('auth.login.register')}</Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
