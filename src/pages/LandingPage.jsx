import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import AuthBox from '../components/AuthBox.jsx'
import VideoBackground0311 from '../components/VideoBackground0311.jsx'
import { useAuth } from '../AuthContext.jsx'
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  requestPasswordReset as authRequestPasswordReset,
  getGoogleAuthDiagnosticEventName,
} from '../auth.js'
import LandingPreviewShowcase from '../components/report/LandingPreviewShowcase.jsx'
import LandingNarrativeRail from '../components/LandingNarrativeRail.jsx'

function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLandingSkyOverride } = useSkyTheme()
  const { user: currentUser, authReady } = useAuth()
  const [showAccessBox, setShowAccessBox] = useState(false)
  const [initialAuthMode, setInitialAuthMode] = useState('scelta')
  const [authError, setAuthError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const hasAuthenticatedSession = Boolean(currentUser)
  const accessBoxRef = useRef(null)
  const heroIntroSectionRef = useRef(null)
  const heroMessageSectionRef = useRef(null)
  const accessSectionRef = useRef(null)
  const valuesSectionRef = useRef(null)
  const previewSectionRef = useRef(null)
  const narrativeRailSectionRef = useRef(null)
  const tornaSuSectionRef = useRef(null)

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

  const navigateToLogin = () => {
    const loginParams = new URLSearchParams(location.search.replace(/^\?/, ''))
    loginParams.set('accesso', '1')
    if (location.pathname === '/') {
      setShowAccessBox(true)
      window.requestAnimationFrame(() => {
        accessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      return
    }
    navigate({ pathname: '/', search: `?${loginParams.toString()}` }, { state: { openAccessBox: true } })
  }

  const handleStartClick = () => {
    setAuthError('')
    setResetMessage('')
    if (hasAuthenticatedSession) {
      navigate('/nuovo-test')
      return
    }
    navigateToLogin()
  }

  const scrollToAccessSection = ({ revealPanel = true } = {}) => {
    setAuthError('')
    setResetMessage('')
    if (!hasAuthenticatedSession && revealPanel) {
      setShowAccessBox(true)
    }
    window.requestAnimationFrame(() => {
      accessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const getLandingSections = () =>
    [
      heroIntroSectionRef.current,
      heroMessageSectionRef.current,
      valuesSectionRef.current,
      narrativeRailSectionRef.current,
      accessSectionRef.current,
      previewSectionRef.current,
      tornaSuSectionRef.current,
    ].filter(Boolean)

  const scrollToSection = (sectionIndex) => {
    const sections = getLandingSections()
    const targetSection = sections[sectionIndex]
    if (!targetSection) return
    if (sectionIndex === 0) {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      return
    }
    window.requestAnimationFrame(() => {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const handleAuthBoxEmailSubmit = async ({ email, password }) => {
    setAuthError('')
    setResetMessage('')
    setIsSubmitting(true)
    const result = await authSignInWithEmail(email, password)
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

  const handleAuthBoxRegisterSubmit = async ({ email, password, nome, cognome, confirmPassword }) => {
    setAuthError('')
    setResetMessage('')
    if (!nome?.trim() || !cognome?.trim()) {
      const msg = 'Inserisci nome e cognome per creare un account operatore.'
      setAuthError(msg)
      throw new Error(msg)
    }
    if (password !== confirmPassword) {
      const msg = 'Le password non coincidono.'
      setAuthError(msg)
      throw new Error(msg)
    }
    setIsSubmitting(true)
    const result = await authRegisterWithEmail(email, password, nome, cognome)
    setIsSubmitting(false)
    if (!result.success) {
      const errorMessage = result.message || 'Errore durante la registrazione.'
      setAuthError(errorMessage)
      throw new Error(errorMessage)
    }
    setAuthError('')
    setResetMessage(
      result.message ||
        "Ti abbiamo inviato un'email di conferma. Verifica il tuo indirizzo e poi accedi con le tue credenziali.",
    )
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
      result.message || 'Se esiste un account con questa email, e stata inviata una mail per reimpostare la password.',
    )
  }

  useEffect(() => {
    // queueMicrotask evita il trigger sincrono di setState dentro useEffect
    queueMicrotask(() => setLandingSkyOverride({ timeOfDay: 'sunset', weather: 'sereno' }))
  }, [setLandingSkyOverride])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.classList.add('tst-route-landing')
    return () => document.body.classList.remove('tst-route-landing')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onOpenAccess = () => {
      setAuthError('')
      setResetMessage('')
      setShowAccessBox(true)
    }
    window.addEventListener('tst:open-access', onOpenAccess)
    return () => window.removeEventListener('tst:open-access', onOpenAccess)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const eventName = getGoogleAuthDiagnosticEventName()
    const onGoogleDiagnostic = (event) => {
      if (event?.detail?.stage === 'redirect-result-empty') {
        setResetMessage('')
        setAuthError(event?.detail?.message || '')
        setShowAccessBox(true)
        return
      }
      const nextMessage =
        event?.detail?.message ||
        "Errore durante l'accesso con Google. Apri la console Firebase per i dettagli."
      setAuthError(nextMessage)
      setShowAccessBox(true)
    }
    window.addEventListener(eventName, onGoogleDiagnostic)
    return () => window.removeEventListener(eventName, onGoogleDiagnostic)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const applyViewportState = (event) => {
      setIsMobileViewport(Boolean(event.matches))
    }
    applyViewportState(mediaQuery)
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applyViewportState)
      return () => mediaQuery.removeEventListener('change', applyViewportState)
    }
    mediaQuery.addListener(applyViewportState)
    return () => mediaQuery.removeListener(applyViewportState)
  }, [])

  useEffect(() => {
    if (location?.state?.openAccessBox) {
      queueMicrotask(() => {
        setAuthError('')
        setResetMessage('')
        setInitialAuthMode(location.state.openRegister ? 'register' : 'scelta')
        setShowAccessBox(true)
        navigate('.', { replace: true, state: {} })
      })
    }
  }, [location, navigate])

  useEffect(() => {
    if (location.pathname !== '/') return
    const params = new URLSearchParams(location.search.replace(/^\?/, ''))
    if (params.get('accesso') !== '1') return
    params.delete('accesso')
    const rest = params.toString()
    queueMicrotask(() => {
      setAuthError('')
      setResetMessage('')
      setShowAccessBox(true)
      navigate(
        { pathname: '/', search: rest ? `?${rest}` : '', hash: location.hash || '' },
        { replace: true, state: {} },
      )
    })
  }, [location.pathname, location.search, location.hash, navigate])

  useEffect(() => {
    if (showAccessBox && accessBoxRef.current) {
      accessBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [showAccessBox])

  useEffect(() => {
    if (!authReady || !hasAuthenticatedSession) return
    // Reindirizza solo se l'utente si è appena autenticato tramite il box di accesso
    // (flow mobile Google login). Negli altri casi lasciamo la landing visibile anche ai loggati.
    if (showAccessBox) {
      navigate('/home', { replace: true })
    }
  }, [authReady, hasAuthenticatedSession, showAccessBox, navigate])

  useEffect(() => {
    if (typeof window === 'undefined') return
    let rafId = null

    const updateActiveSection = () => {
      rafId = null
      const sections = getLandingSections()
      if (!sections.length) return
      const offsetAnchor = window.scrollY + 140
      let nextIndex = 0
      for (let index = 0; index < sections.length; index += 1) {
        if (sections[index].offsetTop <= offsetAnchor) {
          nextIndex = index
        }
      }
      setActiveSectionIndex((prev) => (prev === nextIndex ? prev : nextIndex))
    }

    const handleViewportChange = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(updateActiveSection)
    }

    updateActiveSection()
    window.addEventListener('scroll', handleViewportChange, { passive: true })
    window.addEventListener('resize', handleViewportChange)
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleViewportChange)
      window.removeEventListener('resize', handleViewportChange)
    }
  }, [])

  if (isMobileViewport) {
    return (
      <div className="landing-mobile-hero">
        {/* Hero section */}
        <div className="landing-mobile-section">
          <p className="landing-mobile-eyebrow">Test Sonoro Temperamentale</p>
          <h1 className="landing-mobile-headline">
            La tua natura<br />in 72 ascolti.
          </h1>
          <p className="landing-mobile-sub">
            TST NON È UN QUIZ. È UNO STRUMENTO ARTISTICO-SCIENTIFICO CHE RIVELA L&apos;INTIMA NATURA EMOTIVA
            INDIVIDUALE.
          </p>
          <div className="landing-mobile-ctas">
            <button type="button" className="landing-mobile-cta-primary" onClick={handleStartClick}>
              Avvia il test
            </button>
            <button type="button" className="landing-mobile-cta-link" onClick={() => scrollToAccessSection({ revealPanel: false })}>
              Scopri di più ›
            </button>
          </div>
        </div>

        {/* Feature tile 1 */}
        <div className="landing-mobile-tile landing-mobile-tile--light">
          <p className="landing-mobile-tile-eyebrow">72 frammenti sonori</p>
          <h2 className="landing-mobile-tile-title">La musica come lente emotiva</h2>
          <p className="landing-mobile-tile-body">
            Il test usa la musica come stimolo emozionale. Un protocollo unico privo di algoritmi che illumina le nostre
            profonde qualità interiori.
          </p>
        </div>

        {/* Feature tile 2 */}
        <div className="landing-mobile-tile landing-mobile-tile--dark">
          <p className="landing-mobile-tile-eyebrow">Risultati</p>
          <h2 className="landing-mobile-tile-title">Un report clinico sulla tua natura</h2>
          <p className="landing-mobile-tile-body">
            Scopri la tua Disposizione Prevalente, il tuo Portato Esperienziale e la mappa delle tue correnti emotive.
          </p>
        </div>

        {/* Access section */}
        {!hasAuthenticatedSession && (
          <div className="landing-mobile-auth" ref={accessSectionRef}>
            <p className="landing-mobile-auth-title">Accedi per iniziare</p>
            {!showAccessBox ? (
              <div className="landing-mobile-ctas">
                <button type="button" className="landing-mobile-cta-primary" onClick={() => setShowAccessBox(true)}>
                  Login / Crea account
                </button>
              </div>
            ) : (
              <div ref={accessBoxRef}>
                <AuthBox
                  onGoogleSignIn={handleGoogleLogin}
                  onEmailSubmit={handleAuthBoxEmailSubmit}
                  onRegisterSubmit={handleAuthBoxRegisterSubmit}
                  onPasswordReset={handlePasswordResetRequest}
                  onGuestEnter={() => navigate('/nuovo-test', { state: { mode: 'guest' } })}
                  onClose={() => setShowAccessBox(false)}
                  authError={authError}
                  resetMessage={resetMessage}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`landing-apple-root page-video-bg-root${
        isMobileViewport ? ' landing-apple-root--mobile-static' : ''
      }`}
    >
      {!isMobileViewport && <VideoBackground0311 />}
      <div className="landing-apple-inner">
        {!isMobileViewport && <div className="landing-vignette" aria-hidden="true" />}
        <div className="landing-apple-overlay">
          {!isMobileViewport && (
            <header className="landing-apple-header">
              <div className="landing-apple-logo">
                <span className="landing-apple-logo-mark">TST</span>
                <span className="landing-apple-logo-sub">Test Temperamentale</span>
              </div>
              <button
                type="button"
                className="landing-apple-mini-cta"
                onClick={handleStartClick}
              >
                Inizia
              </button>
            </header>
          )}

          <aside className="landing-apple-progress-rail" aria-label="Navigazione sezioni">
            {[
              'Hero intro',
              'Hero messaggio',
              'Valore',
              'Percorso',
              'Accesso',
              'Preview',
              'Torna su',
            ].map((label, index) => (
              <button
                key={label}
                type="button"
                className={`landing-apple-progress-dot ${activeSectionIndex === index ? 'is-active' : ''}`}
                onClick={() => scrollToSection(index)}
                aria-label={`Vai a ${label}`}
                aria-current={activeSectionIndex === index ? 'true' : undefined}
              />
            ))}
          </aside>

          <main className="landing-apple-main" aria-labelledby="landing-apple-title">
            <section ref={heroIntroSectionRef} className="landing-apple-hero landing-apple-hero--intro">
              <div className="landing-apple-hero-intro">
                <h1 className="landing-wind-title landing-apple-intro-title" aria-label="TST">
                  <span className="wind-title-wrapper">
                    <span className="wind-title-layer wind-title-layer--base">TST</span>
                    <span className="wind-title-layer wind-title-layer--shift1">TST</span>
                    <span className="wind-title-layer wind-title-layer--shift2">TST</span>
                  </span>
                </h1>
                <p className="landing-apple-intro-subtitle">TEST SONORO TEMPERAMENTALE</p>
                <button type="button" className="landing-apple-start-cta" onClick={handleStartClick}>
                  Avvia
                </button>
              </div>
            </section>

            <section ref={heroMessageSectionRef} className="landing-apple-hero landing-apple-hero--message">
              <p className="landing-apple-eyebrow">Esperienza sonora guidata</p>
              <div className="landing-apple-hero-copy">
                <h1 id="landing-apple-title" className="landing-apple-display-title">
                  TST NON È UN QUIZ. È UNO STRUMENTO ARTISTICO-SCIENTIFICO CHE RIVELA L’INTIMA NATURA EMOTIVA
                  INDIVIDUALE.
                </h1>
                <p className="landing-apple-lead">
                  Il test usa la musica come stimolo emozionale. Un protocollo unico privo di algoritmi che illumina le
                  nostre profonde qualità interiori
                </p>
              </div>
              <div className="landing-apple-hero-actions">
                <button
                  type="button"
                  className="landing-apple-cta landing-apple-cta--primary"
                  onClick={handleStartClick}
                >
                  Avvia il test
                </button>
              </div>
            </section>

            <section ref={valuesSectionRef} className="landing-apple-values" aria-label="Valore del test">
              <div className="landing-apple-section-head">
                <p className="landing-apple-section-kicker">Tre passaggi</p>
                <h2>TRE PASSAGGI PER STILARE UNA MAPPA DELLA PROPRIA NATURA EMOTIVA, PER CONOSCERSI INTIMAMENTE</h2>
              </div>
              <div className="landing-apple-values-grid">
                <article>
                  <h3>Perché un test sonoro?</h3>
                  <p>
                    La Musica è il mezzo più evoluto per la comunicazione emotiva. Il test non è un gioco è un primo
                    concreto esempio di uso della musica a fini umanistici. I flussi sonori sono una lente per
                    osservare l’area del sentire, oltre la sfera cognitiva.
                  </p>
                </article>
                <article>
                  <h3>Cosa si osserva: l&apos;area del sentire</h3>
                  <p>
                    Il protocollo TST rivela le istintive reazioni emotive e affettive a forme simboliche del Codice
                    Musical
                  </p>
                  <p>
                    Osserva l’area del sentire: come ci si muove tra simpatia, antipatia e indifferenza rispetto a
                    singoli stimoli musicali.
                  </p>
                </article>
                <article>
                  <h3>Un percorso di ascolto guidato</h3>
                  <p>
                    È fatto da 72 brevi frammenti sonori da sentire, uno alla volta, organizzati per timbro,
                    intervalli, ritmo, melodia e armonia.
                  </p>
                  <p>
                    Associa in modo istintivo i suoni alle tue sensazioni e barra le risposte che corrispondono alle
                    tue percezioni.
                  </p>
                </article>
              </div>
              <div className="landing-apple-section-actions">
                <button
                  type="button"
                  className="landing-apple-cta landing-apple-cta--secondary"
                  onClick={() => scrollToAccessSection({ revealPanel: true })}
                >
                  Inizia dal tuo accesso
                </button>
              </div>
            </section>

            <section
              ref={narrativeRailSectionRef}
              className="landing-apple-narrative-rail-section"
              aria-label="Perché il test sonoro"
            >
              <LandingNarrativeRail />
            </section>

            <section
              ref={accessSectionRef}
              className="landing-apple-access"
              aria-label="Accesso al Test Temperamentale"
            >
              {!hasAuthenticatedSession && (
                <>
                  {!showAccessBox && (
                    <div className="landing-apple-access-intro">
                      <button
                        type="button"
                        className="landing-apple-cta landing-apple-cta--primary"
                        onClick={() => setShowAccessBox(true)}
                      >
                        Apri accesso
                      </button>
                    </div>
                  )}
                  {showAccessBox && (
                    <div ref={accessBoxRef} className="landing-apple-auth-shell">
                      <AuthBox
                        initialMode={initialAuthMode}
                        onGoogleSignIn={handleGoogleLogin}
                        onEmailSubmit={handleAuthBoxEmailSubmit}
                        onRegisterSubmit={handleAuthBoxRegisterSubmit}
                        onPasswordReset={handlePasswordResetRequest}
                        onGuestEnter={() => navigate('/nuovo-test', { state: { mode: 'guest' } })}
                        onClose={() => setShowAccessBox(false)}
                        authError={authError}
                        resetMessage={resetMessage}
                        isSubmitting={isSubmitting}
                      />
                    </div>
                  )}
                </>
              )}
            </section>

            <section
              ref={previewSectionRef}
              className="landing-apple-preview-stack"
              aria-label="Anteprima della restituzione"
            >
              <div className="landing-apple-section-head landing-apple-preview-stack__head">
                <p className="landing-apple-section-kicker">Preview</p>
                <h2>Guarda in breve come si legge il report.</h2>
                <p>
                  Quello che vedi qui è solo un&apos;anteprima: testi e grafici sono esemplificativi e non corrispondono
                  al tuo profilo reale. Il radar mostra tre esempi che alternano per farti capire come si legge una
                  restituzione.
                </p>
              </div>
              <div className="landing-apple-preview-wrap landing-apple-preview-wrap--landing-xl">
                <LandingPreviewShowcase
                  chartHeight={300}
                  onStart={() => {
                    trackLandingPreviewEvent('landing_preview_cta_click', { cta: 'avvia_test' })
                    handleStartClick()
                  }}
                  onTrack={(eventName, payload) => trackLandingPreviewEvent(eventName, payload)}
                />
              </div>
            </section>

            <section
              ref={tornaSuSectionRef}
              className="landing-apple-back-top"
              aria-label="Torna all'inizio della pagina"
            >
              <button
                type="button"
                className="landing-apple-scroll-cue"
                onClick={() => scrollToSection(0)}
              >
                <span className="landing-apple-scroll-cue-line" aria-hidden="true" />
                <span className="landing-apple-scroll-cue-arrow landing-apple-scroll-cue-arrow--up" aria-hidden="true" />
                <span className="landing-apple-scroll-cue-label">Torna su</span>
              </button>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
