import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../api/client';
import { register } from '../api/auth';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register({
        displayName,
        email,
        password,
      });

      navigate('/login');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setError(t('auth.register.accountExists'));
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
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.description')}</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="displayName">
              {t('auth.register.displayName')}
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              autoComplete="name"
              required
            />
          </div>

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
              ? t('auth.register.creating')
              : t('auth.register.createAccount')}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login">{t('auth.register.logIn')}</Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
