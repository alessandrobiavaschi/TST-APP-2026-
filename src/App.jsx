import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, onIdTokenChanged, signOut } from 'firebase/auth'
import './firebaseConfig.js'
import { auth } from './firebaseConfig.js'
import { consumeGoogleRedirectResult } from './auth.js'
import { AuthContext } from './AuthContext.jsx'
import { useUiSounds } from './UiSoundProvider.jsx'
import LandingPage from './pages/LandingPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NewTestPage from './pages/NewTestPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import InfoPage from './pages/InfoPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import TstPage from './pages/TstPage.jsx'
import { useSkyTheme } from './SkyThemeContext.jsx'
import SkyBackground from './components/SkyBackground.jsx'
import './App.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Errore inatteso' }
  }

  componentDidCatch(_error, _errorInfo) {
    /* error UI in render */
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page">
          <section className="page-card">
            <h1 className="report-display-title">Si e verificato un errore</h1>
            <p className="results-empty-message">
              La schermata si e interrotta. Usa uno dei pulsanti qui sotto per continuare.
            </p>
            <div className="report-final-actions-buttons">
              <button
                type="button"
                className="nav-button primary"
                onClick={() => window.location.assign('/risultati')}
              >
                Torna ai risultati
              </button>
              <button
                type="button"
                className="nav-button secondary"
                onClick={() => window.location.assign('/home')}
              >
                Torna alla home
              </button>
            </div>
          </section>
        </div>
      )
    }
    return this.props.children
  }
}

function HeaderSoundToggleButton() {
  const { enabled, toggleEnabled } = useUiSounds()

  return (
    <button
      type="button"
      className={`header-sound-toggle ${enabled ? 'is-on' : 'is-off'}`}
      onClick={toggleEnabled}
      aria-label={enabled ? 'Disattiva i suoni dell interfaccia' : 'Attiva i suoni dell interfaccia'}
      aria-pressed={enabled}
    >
      <span className="header-sound-toggle-indicator" aria-hidden="true" />
      <span className="header-sound-toggle-text" aria-hidden="true">Suono</span>
    </button>
  )
}

const MOBILE_NAV_FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [cookieConsent, setCookieConsent] = useState(null) // 'necessary' | 'all' | null
  const {
    visualProfile,
    config,
    setStaticMode,
    setSkyFallbackPreset,
    forceRandomWeatherChange,
  } = useSkyTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const mobileNavToggleRef = useRef(null)
  const mobileNavDrawerRef = useRef(null)
  const prevMobileNavOpenRef = useRef(false)

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!auth) return
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      setCurrentUser(user)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!auth) return
    void consumeGoogleRedirectResult()
  }, [])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const id = window.requestAnimationFrame(() => {
      const root = mobileNavDrawerRef.current
      if (!root) return
      const nodes = [...root.querySelectorAll(MOBILE_NAV_FOCUSABLE)].filter(
        (el) => !el.closest('[aria-hidden="true"]') && el.getAttribute('tabindex') !== '-1',
      )
      nodes[0]?.focus({ preventScroll: true })
    })
    return () => window.cancelAnimationFrame(id)
  }, [mobileNavOpen])

  useEffect(() => {
    if (!mobileNavOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setMobileNavOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const root = mobileNavDrawerRef.current
      if (!root) return
      const nodes = [...root.querySelectorAll(MOBILE_NAV_FOCUSABLE)].filter(
        (el) => !el.closest('[aria-hidden="true"]') && el.getAttribute('tabindex') !== '-1',
      )
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileNavOpen])

  useEffect(() => {
    if (prevMobileNavOpenRef.current && !mobileNavOpen) {
      mobileNavToggleRef.current?.focus({ preventScroll: true })
    }
    prevMobileNavOpenRef.current = mobileNavOpen
  }, [mobileNavOpen])

  useEffect(() => {
    try {
      const storedConsent = window.localStorage.getItem('tst_gdpr_consent')
      if (storedConsent === 'necessary' || storedConsent === 'all') {
        setCookieConsent(storedConsent)
      } 
    } catch (error) {
      console.error('Errore nel leggere il consenso cookie:', error)
    }
  }, [])

  const handleLogoClick = () => {
    navigate('/')
  }

  const handleChangeWeatherClick = () => {
    if (!forceRandomWeatherChange) return
    // #region agent log
    fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a9db1d'},body:JSON.stringify({sessionId:'a9db1d',runId:'pre-fix',hypothesisId:'H5',location:'src/App.jsx:201',message:'change weather button pressed',data:{pathname:location.pathname,hasForceRandomWeatherChange:Boolean(forceRandomWeatherChange)},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    forceRandomWeatherChange()
  }

  const handleToggleSkyBackgroundMode = () => {
    setStaticMode(!config?.staticMode)
  }

  const handleToggleSkyFallbackPreset = () => {
    const nextPreset = config?.skyFallbackPreset === 'profondo' ? 'calmo' : 'profondo'
    setSkyFallbackPreset(nextPreset)
  }

  const handleLoginClick = () => {
    setMobileNavOpen(false)
    if (location.pathname === '/' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tst:open-access'))
    }
    const loginParams = new URLSearchParams(
      location.pathname === '/' ? location.search.replace(/^\?/, '') : '',
    )
    loginParams.set('accesso', '1')
    const loginSearch = `?${loginParams.toString()}`
    navigate({ pathname: '/', search: loginSearch, state: { openAccessBox: true } })
  }

  const handleRegisterClick = () => {
    setMobileNavOpen(false)
    if (location.pathname === '/home' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tst:open-home-auth'))
    }
    navigate('/home', { state: { openLogin: true, openRegister: true } })
  }

  const handleLogoutClick = async () => {
    if (!auth) return
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Errore durante il logout:', error)
    } finally {
      setIsAccountMenuOpen(false)
      navigate('/')
    }
  }

  const handleAcceptNecessaryCookies = () => {
    try {
      window.localStorage.setItem('tst_gdpr_consent', 'necessary')
    } catch (error) {
      console.error('Errore nel salvare il consenso cookie (necessari):', error)
    }
    setCookieConsent('necessary')
  }

  const handleAcceptAllCookies = () => {
    try {
      window.localStorage.setItem('tst_gdpr_consent', 'all')
    } catch (error) {
      console.error('Errore nel salvare il consenso cookie (tutti):', error)
    }
    setCookieConsent('all')
  }

  const getUserInitials = () => {
    if (!currentUser) return ''
    const displayName = (currentUser.displayName || '').trim()
    let source = displayName
    if (!source && currentUser.email) {
      source = currentUser.email.split('@')[0]
    }
    if (!source) return ''
    const parts = source.split(' ').filter(Boolean)
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  const skyTone = visualProfile?.tone || 'medium'
  const skyWarmth = visualProfile?.warmth || 'neutral'

  return (
    <AuthContext.Provider value={currentUser}>
      <div
        className={`app-shell app-with-sky${cookieConsent === null ? ' has-gdpr-banner' : ''}`}
        data-sky-tone={skyTone}
        data-sky-warmth={skyWarmth}
        data-sky-fallback-preset={config?.skyFallbackPreset || 'calmo'}
      >
        {location.pathname !== '/' && <SkyBackground />}
        <header className={`app-header${location.pathname === '/' ? ' app-header--landing' : ''}`}>
          <div className="app-header-inner">
            <button
              ref={mobileNavToggleRef}
              type="button"
              className="app-header-menu-toggle"
              aria-expanded={mobileNavOpen}
              aria-controls="app-mobile-nav-drawer"
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              <span className="app-header-menu-toggle-bar" aria-hidden="true" />
              <span className="app-header-menu-toggle-bar" aria-hidden="true" />
              <span className="app-header-menu-toggle-bar" aria-hidden="true" />
              <span className="visually-hidden">Apri o chiudi menu di navigazione</span>
            </button>
            <button
              type="button"
              className="app-header-logo"
              onClick={() => {
                setMobileNavOpen(false)
                handleLogoClick()
              }}
              aria-label="Vai alla pagina iniziale"
            >
              <span className="app-logo-mark">TST</span>
              <div className="app-logo-copy">
                <span className="app-logo-title">Test Temperamentale</span>
              </div>
            </button>
            <nav className="app-header-nav app-header-nav--desktop" aria-label="Navigazione principale">
              {currentUser ? (
                <>
                  <NavLink to="/home" className="app-header-link">
                    La mia area
                  </NavLink>
                  <NavLink to="/nuovo-test" className="app-header-link">
                    Nuovo test
                  </NavLink>
                  <NavLink to="/risultati" className="app-header-link">
                    Risultati
                  </NavLink>
                  <NavLink to="/tst" className="app-header-link">
                    Scopri il TST
                  </NavLink>
                  <NavLink to="/info" className="app-header-link">
                    Contatti
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/info" className="app-header-link">
                    Contatti
                  </NavLink>
                </>
              )}
            </nav>
            <div className="app-header-account">
              <HeaderSoundToggleButton />
              {location.pathname !== '/' && (
                <button
                  type="button"
                  className={`header-background-toggle ${config?.staticMode ? 'is-on' : 'is-off'}`}
                  onClick={handleToggleSkyBackgroundMode}
                  aria-pressed={Boolean(config?.staticMode)}
                  aria-label={config?.staticMode ? 'Attiva sfondo video' : 'Attiva sfondo statico'}
                >
                  {config?.staticMode ? 'Sfondo statico' : 'Sfondo video'}
                </button>
              )}
              {location.pathname !== '/' && (
                <button
                  type="button"
                  className={`header-background-preset-toggle header-background-preset-toggle--${config?.skyFallbackPreset || 'calmo'}`}
                  onClick={handleToggleSkyFallbackPreset}
                  aria-label="Cambia preset colore dello sfondo statico"
                >
                  Preset {config?.skyFallbackPreset === 'profondo' ? 'Profondo' : 'Calmo'}
                </button>
              )}
              {location.pathname !== '/' && currentUser && (
                <button
                  type="button"
                  className="header-weather-button"
                  onClick={handleChangeWeatherClick}
                >
                  Cambia il meteo
                </button>
              )}
              {!currentUser && (
                <>
                  <button
                    type="button"
                    className="header-register-button"
                    onClick={handleRegisterClick}
                  >
                    Crea account
                  </button>
                  <button
                    type="button"
                    className="header-login-button"
                    onClick={handleLoginClick}
                  >
                    Login
                  </button>
                </>
              )}
              {currentUser && (
                <div className="header-avatar-wrapper">
                  <button
                    type="button"
                    className="header-avatar"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  >
                    <span className="header-avatar-initials">{getUserInitials()}</span>
                  </button>
                  {isAccountMenuOpen && (
                    <div className="header-account-menu">
                      <button
                        type="button"
                        className="header-account-menu-item"
                        onClick={() => {
                          setIsAccountMenuOpen(false)
                          navigate('/profilo')
                        }}
                      >
                        Info di contatto
                      </button>
                      <button
                        type="button"
                        className="header-account-menu-item"
                        onClick={handleLogoutClick}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
        <div className={`app-mobile-nav-layer ${mobileNavOpen ? 'is-open' : ''}`} aria-hidden={!mobileNavOpen}>
          <button
            type="button"
            className="app-mobile-nav-backdrop"
            aria-label="Chiudi menu"
            onClick={() => setMobileNavOpen(false)}
          />
          <div
            ref={mobileNavDrawerRef}
            id="app-mobile-nav-drawer"
            className="app-mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-mobile-nav-sheet-title"
          >
            <div className="app-mobile-nav-sheet-handle" aria-hidden="true" />
            <p id="app-mobile-nav-sheet-title" className="app-mobile-nav-sheet-title">
              Menu
            </p>
            <nav className="app-mobile-nav-links" aria-label="Collegamenti">
              {currentUser ? (
                <>
                  <NavLink
                    to="/home"
                    className="app-mobile-nav-link"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    La mia area
                  </NavLink>
                  <NavLink
                    to="/nuovo-test"
                    className="app-mobile-nav-link"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Nuovo test
                  </NavLink>
                  <NavLink
                    to="/risultati"
                    className="app-mobile-nav-link"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Risultati
                  </NavLink>
                  <NavLink
                    to="/tst"
                    className="app-mobile-nav-link"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Scopri il TST
                  </NavLink>
                  <NavLink
                    to="/info"
                    className="app-mobile-nav-link"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Contatti
                  </NavLink>
                </>
              ) : (
                <>
                  <div className="app-mobile-nav-actions">
                    <button
                      type="button"
                      className="app-mobile-nav-action app-mobile-nav-action--primary"
                      onClick={handleLoginClick}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="app-mobile-nav-action app-mobile-nav-action--secondary"
                      onClick={handleRegisterClick}
                    >
                      Crea account
                    </button>
                  </div>
                  <NavLink
                    to="/info"
                    className="app-mobile-nav-link"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    Contatti
                  </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
        <main
          className={`app-main${
            location.pathname === '/' || location.pathname === '/risultati/report'
              ? ' app-main--landing'
              : ''
          }${location.pathname === '/' ? ' app-main--landing-home' : ''}`}
        >
          <div
            className={`app-main-inner${
              location.pathname === '/' || location.pathname === '/risultati/report'
                ? ' app-main-inner--landing'
                : ''
            }`}
          >
            <AppErrorBoundary>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/nuovo-test" element={<NewTestPage />} />
                <Route path="/tst" element={<TstPage />} />
                <Route path="/risultati" element={<ResultsPage />} />
                <Route path="/risultati/report" element={<ReportPage />} />
                <Route path="/dashboard-operatore" element={<Navigate to="/home" replace />} />
                <Route path="/profilo" element={<ProfilePage />} />
                <Route path="/info" element={<InfoPage />} />
              </Routes>
            </AppErrorBoundary>
          </div>
        </main>
        {cookieConsent === null && (
          <div className="gdpr-banner">
            <p className="gdpr-banner-text">
              Questo sito utilizza cookie tecnici necessari al funzionamento del servizio e, solo previo
              tuo consenso esplicito, strumenti di analisi per migliorare l&apos;esperienza d&apos;uso.
              Puoi scegliere se consentire soltanto i cookie necessari oppure anche quelli di analisi.
              Per maggiori dettagli consulta l&apos;{' '}
              <NavLink to="/info#privacy" className="gdpr-banner-link">
                Informativa privacy
              </NavLink>
              .
            </p>
            <div className="gdpr-banner-actions">
              <button
                type="button"
                className="gdpr-banner-button gdpr-banner-button--secondary"
                onClick={handleAcceptNecessaryCookies}
              >
                Solo cookie necessari
              </button>
              <button
                type="button"
                className="gdpr-banner-button gdpr-banner-button--primary"
                onClick={handleAcceptAllCookies}
              >
                Accetta tutti
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthContext.Provider>
  )
}

export default App
