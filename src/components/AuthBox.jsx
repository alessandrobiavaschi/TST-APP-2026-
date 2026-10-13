import React, { useState, useEffect, useId } from 'react'
import { NavLink } from 'react-router-dom'
import { isFirebaseAuthConfigured } from '../firebaseConfig.js'

const MODE_CHOICE = 'scelta'
const MODE_LOGIN_EMAIL = 'login-email'
const MODE_REGISTER = 'register'
const MODE_FORGOT_PASSWORD = 'forgot-password'

/**
 * Box unico per accesso: scelta (Google / email / registrati / ospite) e form email/registrazione nello stesso contenitore.
 * Props: onGoogleSignIn, onEmailSubmit({ email, password }), onRegisterSubmit({ email, password, nome, cognome, confirmPassword }),
 *        onPasswordReset(email), onGuestEnter, onClose (opzionale), authError, resetMessage, isSubmitting
 */
function AuthBox({
  initialMode = MODE_CHOICE,
  onGoogleSignIn,
  onEmailSubmit,
  onRegisterSubmit,
  onPasswordReset,
  onGuestEnter,
  onClose,
  authError = '',
  resetMessage = '',
  isSubmitting = false,
}) {
  const [mode, setMode] = useState(initialMode)
  const fieldId = useId()
  const emailFieldId = `${fieldId}-email`
  const passwordFieldId = `${fieldId}-password`
  const confirmPasswordFieldId = `${fieldId}-confirm-password`
  const nomeFieldId = `${fieldId}-nome`
  const cognomeFieldId = `${fieldId}-cognome`

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nome, setNome] = useState('')
  const [cognome, setCognome] = useState('')

  const handleBackToChoice = () => {
    setMode(MODE_CHOICE)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setNome('')
    setCognome('')
  }

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault()
    if (email && email.trim()) {
      try {
        await Promise.resolve(onPasswordReset(email.trim()))
      } catch {
        /* parent sets authError */
      }
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      await Promise.resolve(onEmailSubmit({ email, password }))
    } catch {
      /* parent sets authError */
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    try {
      await Promise.resolve(
        onRegisterSubmit({ email, password, nome, cognome, confirmPassword }),
      )
      setMode(MODE_LOGIN_EMAIL)
    } catch {
      /* parent sets authError */
    }
  }

  const handlePasswordResetClick = () => {
    setMode(MODE_FORGOT_PASSWORD)
  }

  if (mode === MODE_FORGOT_PASSWORD) {
    return (
      <section
        className="landing-access-panel"
        aria-label="Recupera password"
      >
        <div className="landing-access-panel-inner">
          <button
            type="button"
            className="landing-auth-back"
            onClick={handleBackToChoice}
          >
            ← Torna alle opzioni
          </button>
          <h3 className="landing-auth-panel-title">Ho dimenticato la password</h3>
          <p className="landing-auth-panel-description">
            Inserisci l&apos;email dell&apos;account: ti invieremo un link per reimpostare la password.
          </p>
          <form className="auth-form landing-auth-form" onSubmit={handleForgotPasswordSubmit}>
            <label className="auth-field" htmlFor={emailFieldId}>
              <span>Email</span>
              <input
                id={emailFieldId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                required
                autoComplete="email"
              />
            </label>
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            {resetMessage && <p className="auth-success">{resetMessage}</p>}
            <button
              type="submit"
              className="auth-primary-button landing-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Invio in corso…' : 'Invia link per reimpostare la password'}
            </button>
          </form>
        </div>
      </section>
    )
  }

  if (mode === MODE_LOGIN_EMAIL) {
    return (
      <section
        className="landing-access-panel"
        aria-label="Accedi con email e password"
      >
        <div className="landing-access-panel-inner">
          <button
            type="button"
            className="landing-auth-back"
            onClick={handleBackToChoice}
          >
            ← Torna alle opzioni
          </button>
          <h3 className="landing-auth-panel-title">Accesso operatore</h3>
          <p className="landing-auth-panel-description">
            Inserisci le tue credenziali per accedere all&apos;area operatore e salvare i risultati dei test.
            La conferma email e obbligatoria prima del primo accesso.
          </p>
          <form className="auth-form landing-auth-form" onSubmit={handleLoginSubmit}>
            <label className="auth-field" htmlFor={emailFieldId}>
              <span>Email</span>
              <input
                id={emailFieldId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                required
                autoComplete="email"
              />
            </label>
            <label className="auth-field" htmlFor={passwordFieldId}>
              <span>Password</span>
              <input
                id={passwordFieldId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caratteri"
                required
                autoComplete="current-password"
              />
            </label>
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            {resetMessage && <p className="auth-success">{resetMessage}</p>}
            <button
              type="submit"
              className="auth-primary-button landing-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Accesso in corso…' : 'Accedi'}
            </button>
          </form>
          <div className="landing-auth-alt">
            <button
              type="button"
              className="landing-login-google landing-auth-google-inline"
              onClick={onGoogleSignIn}
              disabled={isSubmitting}
            >
              <span className="landing-login-google-inner">
                <span className="landing-login-google-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path fill="#EA4335" d="M12 11.8v3.7h5.2c-.2 1.2-.9 2.3-2 3.1l3.3 2.5c1.9-1.7 3-4.1 3-7 0-.7-.1-1.3-.2-1.9H12z" />
                    <path fill="#34A853" d="M6.6 14.3l-.8.7-2.6 2c1.6 3.1 4.8 5.3 8.5 5.3 2.6 0 4.8-.9 6.3-2.4l-3.3-2.5c-.9.6-2 1-3.1 1-2.4 0-4.5-1.6-5.3-3.7z" />
                    <path fill="#4A90E2" d="M3.2 7.1C2.5 8.3 2.1 9.6 2.1 11s.4 2.7 1.1 3.9l3.5-2.7c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9z" />
                    <path fill="#FBBC05" d="M12 4.7c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.8 1.8 14.6.9 12 .9 8.3.9 5.1 3.1 3.2 7.1l3.8 2.9C7.5 6.3 9.6 4.7 12 4.7z" />
                  </svg>
                </span>
                <span className="landing-login-google-label">Accedi con Google</span>
              </span>
            </button>
            <button
              type="button"
              className="auth-link-button landing-auth-link"
              onClick={handlePasswordResetClick}
              disabled={isSubmitting}
            >
              Ho dimenticato la password
            </button>
            <button
              type="button"
              className="auth-link-button landing-auth-link"
              onClick={() => setMode(MODE_REGISTER)}
              disabled={isSubmitting}
            >
              Non hai un account? Registrati
            </button>
            <p className="landing-auth-privacy-note landing-auth-privacy-note--compact">
              <NavLink to="/info#privacy" className="landing-auth-privacy-link">
                Informativa privacy
              </NavLink>
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (mode === MODE_REGISTER) {
    return (
      <section
        className="landing-access-panel"
        aria-label="Crea un nuovo account"
      >
        <div className="landing-access-panel-inner">
          <button
            type="button"
            className="landing-auth-back"
            onClick={handleBackToChoice}
          >
            ← Torna alle opzioni
          </button>
          <h3 className="landing-auth-panel-title">Crea un account operatore</h3>
          <p className="landing-auth-panel-description">
            Gli account sono riservati a operatori autorizzati. Compila i dati anagrafici e scegli una password sicura.
            Dopo la registrazione dovrai confermare l&apos;email dal link ricevuto prima di poter entrare.
          </p>
          <form className="auth-form landing-auth-form" onSubmit={handleRegisterSubmit}>
            <label className="auth-field" htmlFor={nomeFieldId}>
              <span>Nome</span>
              <input
                id={nomeFieldId}
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Il tuo nome"
                required
                autoComplete="given-name"
              />
            </label>
            <label className="auth-field" htmlFor={cognomeFieldId}>
              <span>Cognome</span>
              <input
                id={cognomeFieldId}
                type="text"
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                placeholder="Il tuo cognome"
                required
                autoComplete="family-name"
              />
            </label>
            <label className="auth-field" htmlFor={emailFieldId}>
              <span>Email</span>
              <input
                id={emailFieldId}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                required
                autoComplete="email"
              />
            </label>
            <label className="auth-field" htmlFor={passwordFieldId}>
              <span>Password</span>
              <input
                id={passwordFieldId}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 6 caratteri"
                required
                autoComplete="new-password"
              />
            </label>
            <label className="auth-field" htmlFor={confirmPasswordFieldId}>
              <span>Conferma password</span>
              <input
                id={confirmPasswordFieldId}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ripeti la password"
                required
                autoComplete="new-password"
              />
            </label>
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            {resetMessage && <p className="auth-success">{resetMessage}</p>}
            <button
              type="submit"
              className="auth-primary-button landing-auth-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrazione in corso…' : 'Registrati'}
            </button>
          </form>
          <button
            type="button"
            className="auth-link-button landing-auth-link"
            onClick={() => setMode(MODE_LOGIN_EMAIL)}
            disabled={isSubmitting}
          >
            Hai già un account? Accedi
          </button>
          <p className="landing-auth-privacy-note">
            Leggi l&apos;{' '}
            <NavLink to="/info#privacy" className="landing-auth-privacy-link">
              Informativa privacy
            </NavLink>
            {' '}prima di registrarti.
          </p>
        </div>
      </section>
    )
  }

  // MODE_CHOICE: le 4 opzioni
  return (
    <section
      className="landing-access-panel"
      aria-label="Opzioni di accesso al Test Temperamentale"
    >
      <div className="landing-access-panel-inner">
        {onClose && (
          <button
            type="button"
            className="landing-auth-back"
            onClick={onClose}
          >
            ← Indietro
          </button>
        )}
        {authError && (
          <div className="auth-error-box" style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
            <p className="auth-error" role="alert" style={{ marginBottom: '0.6rem' }}>
              {authError}
            </p>
            {typeof window !== 'undefined' &&
              window.location.hostname !== 'localhost' &&
              window.location.hostname !== '127.0.0.1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="auth-primary-button"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      color: '#fff',
                      fontSize: '13px',
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                    onClick={() => {
                      const port = window.location.port ? `:${window.location.port}` : ''
                      window.location.href = `http://localhost${port}${window.location.pathname}?accesso=1`
                    }}
                  >
                    Passa a localhost per accedere con Google
                  </button>
                  <a
                    href="https://console.firebase.google.com/project/tst-2026-database/authentication/settings"
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{
                      fontSize: '12px',
                      color: '#8b5cf6',
                      textDecoration: 'underline',
                      textAlign: 'center',
                    }}
                  >
                    Apri Firebase Console per autorizzare {window.location.hostname} ↗
                  </a>
                </div>
              )}
          </div>
        )}
        {resetMessage && <p className="auth-success" style={{ marginBottom: '1rem' }}>{resetMessage}</p>}
        {!isFirebaseAuthConfigured && (
          <p className="auth-error" role="alert" style={{ marginBottom: '1rem' }}>
            Firebase Auth non è configurato in questo ambiente. Controlla le variabili VITE_FIREBASE_* nel file .env
            (locale) o nelle variabili d&apos;ambiente del deploy, poi riavvia o rifai il build.
          </p>
        )}
        <button
          type="button"
          className="landing-login-google"
          onClick={onGoogleSignIn}
          disabled={isSubmitting}
        >
          <span className="landing-login-badge">Consigliato</span>
          <span className="landing-login-google-inner">
            <span className="landing-login-google-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path
                  fill="#EA4335"
                  d="M12 11.8v3.7h5.2c-.2 1.2-.9 2.3-2 3.1l3.3 2.5c1.9-1.7 3-4.1 3-7 0-.7-.1-1.3-.2-1.9H12z"
                />
                <path
                  fill="#34A853"
                  d="M6.6 14.3l-.8.7-2.6 2c1.6 3.1 4.8 5.3 8.5 5.3 2.6 0 4.8-.9 6.3-2.4l-3.3-2.5c-.9.6-2 1-3.1 1-2.4 0-4.5-1.6-5.3-3.7z"
                />
                <path
                  fill="#4A90E2"
                  d="M3.2 7.1C2.5 8.3 2.1 9.6 2.1 11s.4 2.7 1.1 3.9l3.5-2.7c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M12 4.7c1.4 0 2.6.5 3.6 1.4l2.7-2.7C16.8 1.8 14.6.9 12 .9 8.3.9 5.1 3.1 3.2 7.1l3.8 2.9C7.5 6.3 9.6 4.7 12 4.7z"
                />
              </svg>
            </span>
            <span className="landing-login-google-text">
              <span className="landing-login-google-label">Accedi con Google</span>
              <span className="landing-login-google-hint">
                Più veloce, senza password. Opzione consigliata.
              </span>
            </span>
          </span>
        </button>

        <button
          type="button"
          className="landing-login-secondary"
          onClick={() => setMode(MODE_LOGIN_EMAIL)}
          disabled={isSubmitting}
        >
          Accedi con email e password
        </button>

        <button
          type="button"
          className="landing-login-ghost"
          onClick={() => setMode(MODE_REGISTER)}
          disabled={isSubmitting}
        >
          Crea un nuovo account
        </button>

        <button
          type="button"
          className="landing-login-ghost landing-login-guest"
          onClick={onGuestEnter}
          disabled={isSubmitting}
        >
          Entra come ospite
        </button>

        <button
          type="button"
          className="landing-login-ghost landing-auth-forgot-choice"
          onClick={() => setMode(MODE_FORGOT_PASSWORD)}
          disabled={isSubmitting}
        >
          Ho dimenticato la password
        </button>

        <p className="landing-auth-privacy-note">
          Prima di accedere o registrarti puoi leggere l&apos;{' '}
          <NavLink to="/info#privacy" className="landing-auth-privacy-link">
            Informativa privacy
          </NavLink>
          .
        </p>
      </div>
    </section>
  )
}

export default AuthBox
