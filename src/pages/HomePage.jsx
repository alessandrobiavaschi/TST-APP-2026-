import React, { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { signOut, deleteUser } from 'firebase/auth'
import { auth } from '../firebaseConfig.js'
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  requestPasswordReset as authRequestPasswordReset,
  getGoogleAuthDiagnosticEventName,
} from '../auth.js'
import { useAuth } from '../AuthContext.jsx'
import AuthBox from '../components/AuthBox.jsx'
import VideoBackground0311 from '../components/VideoBackground0311.jsx'
import LandingPreviewShowcase from '../components/report/LandingPreviewShowcase.jsx'
import { TEST_STORY_SLIDES } from '../components/TestStorySlider.jsx'
import { useSkyTheme } from '../SkyThemeContext.jsx'

function HomePage() {
  const { user: currentUser, authReady } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { setLandingSkyOverride } = useSkyTheme()
  const [showLoginSection, setShowLoginSection] = useState(
    Boolean(location.state && (location.state.openLogin || location.state.openAccessBox)),
  )
  const [isRegisterMode, setIsRegisterMode] = useState(
    Boolean(location.state && location.state.openRegister),
  )
  const [authError, setAuthError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountMessage, setAccountMessage] = useState('')
  const [accountError, setAccountError] = useState('')
  const accessSectionRef = useRef(null)

  // Sincronizza stato con location quando si naviga a /home con state diverso (es. da Login a Crea account)
  useEffect(() => {
    const state = location.state || {}
    queueMicrotask(() => {
      setShowLoginSection(Boolean(state.openLogin || state.openAccessBox))
      setIsRegisterMode(Boolean(state.openRegister))
    })
  }, [location.pathname, location.state])

  useEffect(() => {
    queueMicrotask(() => setLandingSkyOverride({ timeOfDay: 'sunset', weather: 'sereno' }))
  }, [setLandingSkyOverride])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onOpenHomeAuth = () => {
      setAuthError('')
      setResetMessage('')
      setShowLoginSection(true)
      setIsRegisterMode(true)
    }
    window.addEventListener('tst:open-home-auth', onOpenHomeAuth)
    return () => window.removeEventListener('tst:open-home-auth', onOpenHomeAuth)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const eventName = getGoogleAuthDiagnosticEventName()
    const onGoogleDiagnostic = (event) => {
      if (event?.detail?.stage === 'redirect-result-empty') {
        setResetMessage('')
        setAuthError(event?.detail?.message || '')
        setShowLoginSection(true)
        return
      }
      const nextMessage =
        event?.detail?.message ||
        "Errore durante l'accesso con Google. Apri la console Firebase per i dettagli."
      setAuthError(nextMessage)
      setShowLoginSection(true)
    }
    window.addEventListener(eventName, onGoogleDiagnostic)
    return () => window.removeEventListener(eventName, onGoogleDiagnostic)
  }, [])

  const trackLandingPreviewEvent = (eventName, payload = {}) => {
    if (typeof window === 'undefined') return
    const eventPayload = {
      event: eventName,
      source: 'landing_preview',
      ...payload,
      timestamp: Date.now(),
    }
    window.dispatchEvent(new CustomEvent('tst:analytics', { detail: eventPayload }))
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(eventPayload)
    }
  }

  const scrollToAccessSection = ({ openAuth = true } = {}) => {
    setAuthError('')
    setResetMessage('')
    if (openAuth) {
      setShowLoginSection(true)
    }
    requestAnimationFrame(() => {
      if (accessSectionRef.current) {
        accessSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  const handleGoogleLogin = async () => {
    setAuthError('')
    setResetMessage('')
    const result = await authSignInWithGoogle()
    if (!result.success) {
      setAuthError(result.message || "Errore durante l'accesso con Google.")
      return
    }
    if (result.needsRedirect) return
    navigate(result.nextRoute || '/home')
  }

  const handlePasswordResetRequest = async (emailAddress) => {
    setAuthError('')
    setResetMessage('')
    if (!emailAddress || !emailAddress.trim()) {
      setAuthError('Inserisci la tua email per reimpostare la password.')
      return
    }
    setIsSubmitting(true)
    const result = await authRequestPasswordReset(emailAddress.trim())
    setIsSubmitting(false)
    if (!result.success) {
      setAuthError(result.message || 'Errore durante la richiesta di reset password.')
      return
    }
    setResetMessage(
      result.message ||
        'Se esiste un account con questa email, è stata inviata una mail per reimpostare la password.',
    )
  }

  const handleAuthBoxEmailSubmit = async ({ email: em, password: pw }) => {
    setAuthError('')
    setResetMessage('')
    setIsSubmitting(true)
    const result = await authSignInWithEmail(em, pw)
    setIsSubmitting(false)
    if (!result.success) {
      setAuthError(result.message || "Errore durante l'accesso.")
      return
    }
    if (result.requiresEmailVerification && result.message) {
      setResetMessage(result.message)
    }
    navigate(result.nextRoute || '/home')
  }

  const handleAuthBoxRegisterSubmit = async ({
    email: em,
    password: pw,
    nome: n,
    cognome: c,
    confirmPassword: conf,
  }) => {
    setAuthError('')
    setResetMessage('')
    if (!n?.trim() || !c?.trim()) {
      const msg = 'Inserisci nome e cognome per creare un account operatore.'
      setAuthError(msg)
      throw new Error(msg)
    }
    if (pw !== conf) {
      const msg = 'Le password non coincidono.'
      setAuthError(msg)
      throw new Error(msg)
    }
    setIsSubmitting(true)
    const result = await authRegisterWithEmail(em, pw, n, c)
    setIsSubmitting(false)
    if (!result.success) {
      const errorMessage = result.message || 'Errore durante la registrazione.'
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    }
    setAuthError('')
    setResetMessage(
      result.message ||
        'Ti abbiamo inviato un\'email di conferma. Verifica il tuo indirizzo e poi accedi con le tue credenziali.',
    )
  }

  const handleLogout = async () => {
    setAccountError('')
    setAccountMessage('')
    try {
      if (auth) {
        await signOut(auth)
        setAccountMessage('Sei stato disconnesso.')
      }
    } catch (err) {
      setAccountError(err.message || 'Errore durante la disconnessione.')
    }
  }

  const handleDeleteAccount = async () => {
    setAccountError('')
    setAccountMessage('')
    if (!currentUser) {
      setAccountError('Nessun utente autenticato.')
      return
    }
    const confirmed = window.confirm(
      'Sei sicuro di voler cancellare definitivamente il tuo account operatore? Questa azione non è reversibile.',
    )
    if (!confirmed) return
    try {
      await deleteUser(currentUser)
      setAccountMessage('Il tuo account è stato cancellato. Puoi registrarti nuovamente in futuro.')
    } catch (err) {
      if (err?.code === 'auth/requires-recent-login') {
        setAccountError(
          'Per cancellare l\'account devi prima effettuare nuovamente il login, poi riprovare.',
        )
      } else {
        setAccountError(err.message || "Errore durante l'eliminazione dell'account.")
      }
    }
  }

  const handleModificaPassword = async () => {
    setAccountError('')
    setAccountMessage('')
    if (!currentUser?.email) {
      setAccountError('Impossibile inviare l\'email di reset.')
      return
    }
    const result = await authRequestPasswordReset(currentUser.email)
    if (!result.success) {
      setAccountError(result.message || 'Errore durante l\'invio dell\'email di reset.')
      return
    }
    setAccountMessage(
      result.message || 'È stata inviata un\'email per reimpostare la password al tuo indirizzo.',
    )
  }

  if (authReady && !currentUser) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          openAccessBox: showLoginSection || isRegisterMode,
          openRegister: isRegisterMode,
        }}
      />
    )
  }

  return (
    <div className={currentUser ? 'page my-area' : 'page'}>
      {currentUser ? (
        <>
          <header className="my-area-hero">
            <p className="my-area-eyebrow">Test Temperamentale</p>
            <h1 className="my-area-title">La mia area</h1>
            <p className="my-area-lead">
              Da qui avvii i test, consulti i risultati e gestisci il tuo profilo operatore.
            </p>
          </header>

          {!currentUser.emailVerified && (
            <div className="page-card" style={{ marginBottom: '1rem' }} role="status">
              <p className="auth-success" style={{ margin: 0 }}>
                Accesso attivo. Conferma l&apos;email ({currentUser.email}) dal link ricevuto — controlla anche
                Spam/Promozioni. Puoi usare l&apos;app anche prima della verifica.
              </p>
            </div>
          )}

          <div className="my-area-shell">
            <section className="my-area-actions" aria-labelledby="my-area-actions-title">
              <div className="my-area-actions-head">
                <h2 id="my-area-actions-title" className="my-area-actions-title">
                  Cosa vuoi fare ora?
                </h2>
                <p className="my-area-actions-hint">
                  Avvia un nuovo test o riprendi dalla lettura dei risultati.
                </p>
              </div>
              <div className="my-area-actions-grid">
                <button
                  type="button"
                  className="my-area-card my-area-card--primary"
                  onClick={() => navigate('/nuovo-test')}
                >
                  <span className="my-area-card-icon my-area-card-icon--play" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" focusable="false">
                      <path fill="currentColor" d="M8 5.5v13l10-6.5z" />
                    </svg>
                  </span>
                  <h3>Nuovo test</h3>
                  <p>Avvia subito il percorso sonoro da 72 passi.</p>
                </button>

                <button
                  type="button"
                  className="my-area-card"
                  onClick={() => navigate('/risultati')}
                >
                  <span className="my-area-card-icon my-area-card-icon--chart" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" focusable="false">
                      <path fill="currentColor" d="M5 19h14v2H3V5h2v14Zm3-2V9h3v8H8Zm5 0V4h3v13h-3Zm5 0v-6h3v6h-3Z" />
                    </svg>
                  </span>
                  <h3>Risultati</h3>
                  <p>Consulta report, archivio e sessioni precedenti.</p>
                </button>

                <button
                  type="button"
                  className="my-area-card"
                  onClick={() => navigate('/tst')}
                >
                  <span className="my-area-card-icon my-area-card-icon--book" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" focusable="false">
                      <path fill="currentColor" d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Zm2.5-.5a.5.5 0 0 0-.5.5v13.05A4.48 4.48 0 0 1 7.5 17H18V4H7.5Z" />
                    </svg>
                  </span>
                  <h3>Scopri il TST</h3>
                  <p>Rivedi struttura e finalità del test temperamentale.</p>
                </button>
              </div>
            </section>

            <div className="my-area-column my-area-column--main">
              <div className="my-area-account account-management">
                <h2>Gestione account operatore</h2>
                <p className="my-area-email-badge">
                  Utente collegato: <strong>{currentUser.email}</strong>
                </p>
                {accountError && <p className="auth-error">{accountError}</p>}
                {accountMessage && <p className="auth-success">{accountMessage}</p>}
                <div className="account-actions">
                  <button
                    type="button"
                    className="btn-account btn-account-logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  <button
                    type="button"
                    className="btn-account btn-account-password"
                    onClick={handleModificaPassword}
                  >
                    Modifica password
                  </button>
                  <button
                    type="button"
                    className="btn-account btn-account-danger"
                    onClick={handleDeleteAccount}
                  >
                    Elimina account
                  </button>
                </div>
                <div className="my-area-support">
                  <h3 className="my-area-support-title">Supporto e contatti</h3>
                  <p className="my-area-support-text">
                    Per dubbi sul funzionamento del test o problemi di accesso puoi scrivere a{' '}
                    <a href="mailto:info@tst.it">info@tst.it</a> oppure rivolgerti al tuo referente TST.
                  </p>
                </div>
              </div>
              <p className="my-area-footnote">
                I test che conduci sono collegati al tuo profilo operatore e archiviati in Risultati: report,
                archivi e confronto delle sessioni nel tempo.
              </p>
            </div>
          </div>
        </>
      ) : !authReady ? (
        <div className="page">
          <section className="page-card">
            <p>Verifica sessione in corso…</p>
          </section>
        </div>
      ) : (
        <div className="landing-flow-root page-video-bg-root">
          <VideoBackground0311 />
          <div className="landing-flow-inner">
            <div className="landing-flow-overlay">
              <header className="landing-flow-header">
                <div className="landing-flow-logo">
                  <span className="landing-flow-logo-mark">TST</span>
                  <span className="landing-flow-logo-sub">Test Temperamentale</span>
                </div>
                <button
                  type="button"
                  className="landing-top-access-button"
                  onClick={() => scrollToAccessSection({ openAuth: true })}
                >
                  Accesso
                </button>
              </header>

              <main className="landing-flow-main" aria-labelledby="landing-flow-title">
                <section className="landing-flow-hero">
                  <div className="landing-flow-hero-text">
                    <h1 id="landing-flow-title" className="landing-wind-title" aria-label="TST">
                      <span className="wind-title-wrapper">
                        <span className="wind-title-layer wind-title-layer--base">TST</span>
                        <span className="wind-title-layer wind-title-layer--shift1">TST</span>
                        <span className="wind-title-layer wind-title-layer--shift2">TST</span>
                      </span>
                    </h1>
                    <p className="landing-flow-hero-kicker">Test Temperamentale</p>
                    <p className="landing-flow-subtitle">
                      Uno spazio guidato per osservare la tua identita emotiva attraverso il suono.
                    </p>
                  </div>

                  <div className="landing-flow-cta">
                    <button
                      type="button"
                      className="landing-primary-cta"
                      onClick={() => scrollToAccessSection({ openAuth: true })}
                    >
                      Avvia il test
                    </button>
                    <p className="landing-flow-cta-hint">
                      Entra con account, email o modalita ospite. Il flusso resta invariato.
                    </p>
                  </div>
                </section>

                <section className="landing-flow-cascade" aria-label="Scopri il Test Temperamentale">
                  <div className="landing-flow-section">
                    <p className="landing-flow-kicker">Perché TST</p>
                    <h2 className="landing-flow-chapter-title">
                      TST NON È UN QUIZ. È UNO STRUMENTO ARTISTICO-SCIENTIFICO CHE RIVELA L&apos;INTIMA NATURA
                      EMOTIVA INDIVIDUALE.
                    </h2>
                    <p className="landing-flow-highlight">
                      Il test usa la musica come stimolo emozionale. Un protocollo unico privo di algoritmi che illumina
                      le nostre profonde qualità interiori.
                    </p>
                  </div>

                  <div className="landing-flow-section">
                    <p className="landing-flow-kicker">Come funziona</p>
                    <h2 className="landing-flow-chapter-title">
                      TRE PASSAGGI PER STILARE UNA MAPPA DELLA PROPRIA NATURA EMOTIVA, PER CONOSCERSI INTIMAMENTE
                    </h2>

                    <div className="landing-flow-steps-grid" aria-label="Card informative">
                      {TEST_STORY_SLIDES.map((slide, index) => (
                        <article key={slide.id} className="landing-flow-step-card">
                          <div className="landing-flow-step-card-head">
                            <span className="landing-flow-step-index landing-flow-step-index--display" aria-hidden="true">
                              {index + 1}
                            </span>
                            <h3>{slide.title}</h3>
                          </div>
                          <div className="landing-flow-step-body">
                            {slide.body.map((paragraph, paragraphIndex) => (
                              <p key={`${slide.id}-${paragraphIndex}`}>{paragraph}</p>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="landing-flow-section landing-flow-inline-cta">
                    <p className="landing-flow-inline-cta-text">
                      Se vuoi iniziare subito, vai direttamente al pannello di accesso.
                    </p>
                    <button
                      type="button"
                      className="landing-secondary-cta"
                      onClick={() => scrollToAccessSection({ openAuth: true })}
                    >
                      Vai all&apos;accesso
                    </button>
                  </div>
                </section>

                <section className="landing-flow-cascade landing-flow-cascade--access">
                  <div className="landing-flow-section">
                    <p className="landing-flow-kicker">Accesso</p>
                    <h2 className="landing-flow-chapter-title">
                      Prosegui dal tuo account o come ospite.
                    </h2>
                    <p className="landing-flow-paragraph">
                      L&apos;esperienza di autenticazione resta la stessa: Google, email/password,
                      registrazione operatore e ingresso ospite.
                    </p>
                  </div>

                  <section
                    id="landing-access"
                    ref={accessSectionRef}
                    className="landing-flow-access"
                    aria-label="Accesso al Test Temperamentale"
                  >
                    {showLoginSection ? (
                      <AuthBox
                        initialMode={isRegisterMode ? 'register' : 'scelta'}
                        onGoogleSignIn={handleGoogleLogin}
                        onEmailSubmit={handleAuthBoxEmailSubmit}
                        onRegisterSubmit={handleAuthBoxRegisterSubmit}
                        onPasswordReset={handlePasswordResetRequest}
                        onGuestEnter={() => navigate('/nuovo-test', { state: { mode: 'guest' } })}
                        onClose={() => setShowLoginSection(false)}
                        authError={authError}
                        resetMessage={resetMessage}
                        isSubmitting={isSubmitting}
                      />
                    ) : (
                      <div className="landing-access-placeholder">
                        <p>Apri il pannello di accesso per iniziare il test.</p>
                        <button
                          type="button"
                          className="landing-secondary-cta landing-primary-cta--compact"
                          onClick={() => setShowLoginSection(true)}
                        >
                          Apri accesso
                        </button>
                      </div>
                    )}
                  </section>

                  <div className="landing-flow-section landing-flow-inline-cta">
                    <p className="landing-flow-inline-cta-text">
                      Vuoi prima esplorare il metodo in dettaglio?
                    </p>
                    <div className="landing-flow-inline-cta-actions">
                      <button
                        type="button"
                        className="landing-secondary-cta"
                        onClick={() => navigate('/tst')}
                      >
                        Vedi come funziona
                      </button>
                      <button
                        type="button"
                        className="landing-secondary-cta"
                        onClick={() => navigate('/tutorial', { state: { fromPath: '/home' } })}
                      >
                        Tutorial ascolto
                      </button>
                    </div>
                  </div>
                </section>

                <section className="landing-flow-preview-wrap" aria-label="Anteprima della restituzione">
                  <LandingPreviewShowcase
                    onStart={() => {
                      trackLandingPreviewEvent('landing_preview_cta_click', { cta: 'avvia_test' })
                      scrollToAccessSection({ openAuth: true })
                    }}
                    onTrack={(eventName, payload) => trackLandingPreviewEvent(eventName, payload)}
                  />
                </section>
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage
