import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../../api/client';
import { forgotPassword } from '../api/auth';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await forgotPassword({ email });
      setMessage(response.message);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(t('auth.forgotPassword.sendError'));
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
          <h1>{t('auth.forgotPassword.title')}</h1>
          <p>{t('auth.forgotPassword.description')}</p>
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

          {message && (
            <p className="auth-message" role="status">
              {message}
            </p>
          )}

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
              ? t('auth.forgotPassword.sending')
              : t('auth.forgotPassword.sendResetLink')}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            <Link to="/login">{t('auth.forgotPassword.backToLogin')}</Link>
          </p>
        </footer>
      </section>
    </main>
  );
}
