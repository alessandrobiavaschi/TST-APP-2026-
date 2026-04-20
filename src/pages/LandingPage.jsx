import React, { useContext, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import AuthBox from '../components/AuthBox.jsx'
import VideoBackground0311 from '../components/VideoBackground0311.jsx'
import { AuthContext } from '../AuthContext.jsx'
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  requestPasswordReset as authRequestPasswordReset,
  getGoogleLoginErrorMessage,
} from '../auth.js'
import { auth } from '../firebaseConfig.js'
import LandingPreviewShowcase from '../components/report/LandingPreviewShowcase.jsx'
import LandingNarrativeRail from '../components/LandingNarrativeRail.jsx'

function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setLandingSkyOverride } = useSkyTheme()
  const currentUser = useContext(AuthContext)
  const [showAccessBox, setShowAccessBox] = useState(false)
  const [authError, setAuthError] = useState('')
  const [resetMessage, setResetMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [discoverProgress, setDiscoverProgress] = useState(0)
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

  const openAppPanel = (path) => {
    if (typeof window !== 'undefined') {
      const targetUrl = `${window.location.origin}${path}`
      const newWindow = window.open(targetUrl, '_blank', 'noopener,noreferrer')
      if (newWindow) return true
    }
    return false
  }

  const navigateToLogin = () => {
    const loginParams = new URLSearchParams(location.search.replace(/^\?/, ''))
    loginParams.set('accesso', '1')
    // #region agent log
    fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'post-fix',hypothesisId:'L6',location:'src/pages/LandingPage.jsx:64',message:'navigateToLogin called',data:{pathname:location.pathname,currentSearch:location.search,nextSearch:`?${loginParams.toString()}`},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    if (location.pathname === '/') {
      setShowAccessBox(true)
      window.requestAnimationFrame(() => {
        accessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
      // #region agent log
      fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'post-fix',hypothesisId:'L7',location:'src/pages/LandingPage.jsx:72',message:'access panel opened and scrolled on landing',data:{pathname:location.pathname,hasAccessSectionRef:Boolean(accessSectionRef.current)},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
      return
    }
    navigate({ pathname: '/', search: `?${loginParams.toString()}` }, { state: { openAccessBox: true } })
  }

  const handleStartClick = () => {
    setAuthError('')
    setResetMessage('')
    const hasAuthenticatedSession = Boolean(currentUser || auth?.currentUser)
    // #region agent log
    fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'post-fix',hypothesisId:'L6',location:'src/pages/LandingPage.jsx:78',message:'handleStartClick fired',data:{contextUser:Boolean(currentUser),firebaseUser:Boolean(auth?.currentUser),hasAuthenticatedSession,pathname:location.pathname},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    if (hasAuthenticatedSession) {
      // #region agent log
      fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'post-fix',hypothesisId:'L6',location:'src/pages/LandingPage.jsx:84',message:'authenticated start route chosen',data:{target:'/nuovo-test'},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
      navigate('/nuovo-test')
      return
    }
    navigateToLogin()
  }

  const scrollToAccessSection = ({ revealPanel = true } = {}) => {
    setAuthError('')
    setResetMessage('')
    if (!currentUser && revealPanel) {
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
    if (!auth) {
      setAuthError('Firebase non configurato. Aggiungi un file .env con le credenziali.')
      return
    }
    try {
      const user = await authSignInWithGoogle()
      if (user && !openAppPanel('/home')) navigate('/home')
    } catch (err) {
      setAuthError(getGoogleLoginErrorMessage(err))
    }
  }

  const handleAuthBoxEmailSubmit = async ({ email, password }) => {
    setAuthError('')
    setResetMessage('')
    if (!auth) {
      setAuthError('Firebase non configurato. Aggiungi un file .env con le credenziali.')
      return
    }
    setIsSubmitting(true)
    try {
      await authSignInWithEmail(email, password)
      if (!openAppPanel('/dashboard-operatore')) navigate('/dashboard-operatore')
    } catch (err) {
      setAuthError(err?.message || "Errore durante l'accesso.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthBoxRegisterSubmit = async ({ email, password, nome, cognome, confirmPassword }) => {
    setAuthError('')
    setResetMessage('')
    if (!auth) {
      setAuthError('Firebase non configurato. Aggiungi un file .env con le credenziali.')
      throw new Error('Firebase non configurato.')
    }
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
    try {
      await authRegisterWithEmail(email, password, nome, cognome)
      setResetMessage(
        "Ti abbiamo inviato un'email di conferma. Verifica il tuo indirizzo e poi accedi con le tue credenziali.",
      )
    } catch (err) {
      setAuthError(err?.message || 'Errore durante la registrazione.')
      throw err
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordResetRequest = async (emailAddress) => {
    setAuthError('')
    setResetMessage('')
    if (!auth) {
      setAuthError('Firebase non configurato. Aggiungi un file .env con le credenziali.')
      return
    }
    if (!emailAddress || !emailAddress.trim()) {
      setAuthError('Inserisci la tua email per reimpostare la password.')
      return
    }
    setIsSubmitting(true)
    try {
      await authRequestPasswordReset(emailAddress.trim())
      setResetMessage('Se esiste un account con questa email, e stata inviata una mail per reimpostare la password.')
    } catch (err) {
      setAuthError(err?.message || 'Errore durante la richiesta di reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    setLandingSkyOverride({ timeOfDay: 'sunset', weather: 'sereno' })
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
    if (location?.state?.openAccessBox) {
      setAuthError('')
      setResetMessage('')
      setShowAccessBox(true)
      // #region agent log
      fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'landing-pre-fix',hypothesisId:'L4',location:'src/pages/LandingPage.jsx:234',message:'openAccessBox from location.state',data:{pathname:location.pathname,search:location.search},timestamp:Date.now()})}).catch(()=>{})
      // #endregion
      navigate('.', { replace: true, state: {} })
    }
  }, [location, navigate])

  useEffect(() => {
    if (location.pathname !== '/') return
    const params = new URLSearchParams(location.search.replace(/^\?/, ''))
    if (params.get('accesso') !== '1') return
    params.delete('accesso')
    const rest = params.toString()
    setAuthError('')
    setResetMessage('')
    setShowAccessBox(true)
    // #region agent log
    fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'landing-pre-fix',hypothesisId:'L5',location:'src/pages/LandingPage.jsx:250',message:'openAccessBox from accesso query param',data:{pathname:location.pathname,searchBefore:location.search,searchAfter:rest ? `?${rest}` : ''},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    navigate(
      { pathname: '/', search: rest ? `?${rest}` : '', hash: location.hash || '' },
      { replace: true, state: {} },
    )
  }, [location.pathname, location.search, location.hash, navigate])

  useEffect(() => {
    if (showAccessBox && accessBoxRef.current) {
      accessBoxRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [showAccessBox])

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

  useEffect(() => {
    if (typeof window === 'undefined') return
    let rafId = null

    const updateDiscoverProgress = () => {
      rafId = null
      const targetSectionTop = heroMessageSectionRef.current?.offsetTop ?? window.innerHeight * 0.7
      const nextProgress = Math.max(0, Math.min(1, window.scrollY / Math.max(1, targetSectionTop)))
      setDiscoverProgress((prev) => (Math.abs(prev - nextProgress) < 0.01 ? prev : nextProgress))
    }

    const onScrollOrResize = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(updateDiscoverProgress)
    }

    updateDiscoverProgress()
    window.addEventListener('scroll', onScrollOrResize, { passive: true })
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', onScrollOrResize)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [])

  return (
    <div className="landing-apple-root page-video-bg-root">
      <VideoBackground0311 />
      <div className="landing-apple-inner">
        <div className="landing-vignette" aria-hidden="true" />
        <div className="landing-apple-overlay">
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

            <button
              type="button"
              className={`landing-apple-discover-cue ${discoverProgress < 0.04 ? 'is-idle' : ''}`}
              style={{ '--landing-discover-progress': discoverProgress }}
              onClick={() => scrollToSection(1)}
            >
              <span className="landing-apple-discover-cue-text">Scopri come funziona il Test Sonoro Temperamentale</span>
              <span className="landing-apple-discover-cue-arrow" aria-hidden="true">
                <span className="landing-apple-discover-cue-stem" />
                <span className="landing-apple-discover-cue-head" />
              </span>
            </button>

            <section ref={heroMessageSectionRef} className="landing-apple-hero landing-apple-hero--message">
              <p className="landing-apple-eyebrow">Esperienza sonora guidata</p>
              <div className="landing-apple-hero-copy">
                <h1 id="landing-apple-title" className="landing-apple-display-title">
                  Oltre quello che pensi, verso quello che senti.
                </h1>
                <p className="landing-apple-lead">
                  La musica è il mezzo con cui studiamo il tuo temperamento emotivo. Per questo, quando le parole non
                  arrivano, i suoni possono diventare una risposta. Il TST usa la musica in forma precognitiva: uno
                  strumento scientificamente potente per comprendere quali aree si attivano all&apos;ascolto di alcuni
                  suoni, cosa questo dice di te, di come stai e di come funzioni. La restituzione traduce le tue
                  indicazioni in immagini, grafici e parole semplici e utili per nominare la luminosità delle tue
                  risorse e scoprire le tue ombre.
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
                <p className="landing-apple-section-kicker">Perché funziona</p>
                <h2>Metodo, chiarezza, applicazione.</h2>
              </div>
              <div className="landing-apple-values-grid">
                <article>
                  <h3>Ascolto guidato</h3>
                  <p>
                    72 brevi frammenti sonori organizzati per timbro, ritmo, melodia e armonia: una sequenza
                    costruita per osservare il tuo modo di reagire.
                  </p>
                </article>
                <article>
                  <h3>Lettura operativa</h3>
                  <p>
                    Il risultato non è una diagnosi e non è un'etichetta, ma una mappa utile per comprendere il
                    tuo temperamento emotivo in modo innovativo. Il report si costruisce man mano che svolgi il test:
                    ogni risposta comunica alla macchina qualcosa su di te, come ti senti in relazione a un suono,
                    quali preferisci e quali ti suonano antipatici.
                  </p>
                </article>
                <article>
                  <h3>Uso concreto</h3>
                  <p>
                    La restituzione e leggibile sia in autonomia sia in contesti professionali di supporto, coaching
                    e accompagnamento relazionale.
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
              {!currentUser && (
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
