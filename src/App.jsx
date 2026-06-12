import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import './firebaseConfig.js'
import { auth } from './firebaseConfig.js'
import {
  consumeGoogleRedirectResult,
  clearGoogleRedirectPending,
} from './auth.js'
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
import TutorialPage from './pages/TutorialPage.jsx'
import { useSkyTheme } from './SkyThemeContext.jsx'
import SkyBackground from './components/SkyBackground.jsx'
import './styles/app-shell.css'
import './App.css'
import './styles/tst-mobile.css'

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Errore inatteso' }
  }

  componentDidCatch(error, errorInfo) {
    console.error('AppErrorBoundary:', error?.message, errorInfo?.componentStack)
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
            {import.meta.env.DEV && this.state.errorMessage ? (
              <p className="results-empty-message" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {this.state.errorMessage}
              </p>
            ) : null}
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
  const [authReady, setAuthReady] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [ritualFocusActive, setRitualFocusActive] = useState(false)
  const [testSessionActive, setTestSessionActive] = useState(false)
  const [cookieConsent, setCookieConsent] = useState(null) // 'necessary' | 'all' | null
  const { enabled: soundEnabled, toggleEnabled: toggleSound } = useUiSounds()
  const {
    visualProfile,
    config,
    setStaticMode,
    forceRandomWeatherChange,
  } = useSkyTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const mobileNavToggleRef = useRef(null)
  const mobileNavDrawerRef = useRef(null)
  const prevMobileNavOpenRef = useRef(false)
  const accountMenuRef = useRef(null)
  const accountButtonRef = useRef(null)
  const effectiveUser = currentUser || auth?.currentUser || null
  const isAuthenticated = Boolean(effectiveUser)

  useEffect(() => {
    if (!auth) {
      setAuthReady(true)
      return
    }

    let cancelled = false
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (cancelled) return
      setCurrentUser(user)
      setAuthReady(true)
    })

    const completeRedirectLogin = async () => {
      const result = await consumeGoogleRedirectResult()
      if (cancelled) return

      const redirectUser = result?.user || auth.currentUser || null

      if (redirectUser) {
        setCurrentUser(redirectUser)
        if (
          typeof window !== 'undefined' &&
          (window.location.pathname === '/' || window.location.search.includes('tst_google_auth'))
        ) {
          navigate('/home', { replace: true })
        }
      }
    }

    void completeRedirectLogin()
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [navigate])

  useEffect(() => {
    if (!authReady || !isAuthenticated) return
    // Se l'autenticazione è andata a buon fine ma l'app è rimasta sulla landing,
    // portiamo l'utente alla home (caso tipico del login Google via redirect su mobile).
    if (location.pathname === '/') {
      navigate('/home', { replace: true })
    }
  }, [authReady, isAuthenticated, location.pathname, navigate])

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined

    const handlePointerDown = (event) => {
      const menu = accountMenuRef.current
      const button = accountButtonRef.current
      if (!menu || !button) return
      if (menu.contains(event.target) || button.contains(event.target)) return
      setIsAccountMenuOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
        accountButtonRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAccountMenuOpen])

  useEffect(() => {
    const onRitualFocus = (event) => {
      const isActive = Boolean(event?.detail?.active)
      setRitualFocusActive(isActive)
    }
    window.addEventListener('tst:ritual-focus', onRitualFocus)
    return () => window.removeEventListener('tst:ritual-focus', onRitualFocus)
  }, [])

  useEffect(() => {
    const onTestSessionActive = (event) => {
      const isActive = Boolean(event?.detail?.active)
      setTestSessionActive(isActive)
      if (isActive) {
        setMobileNavOpen(false)
      }
    }
    window.addEventListener('tst:test-session-active', onTestSessionActive)
    return () => window.removeEventListener('tst:test-session-active', onTestSessionActive)
  }, [])

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
    clearGoogleRedirectPending()
    setIsAccountMenuOpen(false)
    navigate('/', { replace: true })
  }

  const handleChangeWeatherClick = () => {
    if (!forceRandomWeatherChange) return
    forceRandomWeatherChange()
  }

  const handleToggleSkyBackgroundMode = () => {
    setStaticMode(!config?.staticMode)
  }

  const handleLoginClick = () => {
    setMobileNavOpen(false)
    if (isAuthenticated) {
      navigate('/home')
      return
    }
    if (location.pathname === '/home' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tst:open-home-auth'))
      navigate('/home', { state: { openLogin: true } })
      return
    }
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

  const handleLandingStartClick = () => {
    if (isAuthenticated) {
      setMobileNavOpen(false)
      navigate('/nuovo-test')
      return
    }
    handleLoginClick()
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
  const isReportPage = location.pathname === '/risultati/report'
  const isTestFlowPage = location.pathname === '/nuovo-test'

  return (
    <AuthContext.Provider value={{ user: effectiveUser, authReady }}>
      <div
        className={`app-shell app-with-sky${
          cookieConsent === null && !testSessionActive ? ' has-gdpr-banner' : ''
        }${ritualFocusActive ? ' is-ritual-focus' : ''}${
          isReportPage || isTestFlowPage ? ' app-shell--immersive' : ''
        }${isReportPage ? ' app-shell--report' : ''}${
          isTestFlowPage ? ' app-shell--test-flow' : ''
        }`}
        data-sky-tone={skyTone}
        data-sky-warmth={skyWarmth}
      >
        {location.pathname !== '/' && location.pathname !== '/risultati/report' && (
          <SkyBackground />
        )}
        <header
          className={`app-header${location.pathname === '/' ? ' app-header--landing' : ''}${
            isReportPage || isTestFlowPage ? ' app-header--report' : ''
          }`}
        >
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
              {isAuthenticated ? (
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
              {location.pathname === '/' && (
                <button
                  type="button"
                  className="header-landing-start-button"
                  onClick={handleLandingStartClick}
                >
                  Inizia
                </button>
              )}
              {location.pathname !== '/' && (
                <button
                  type="button"
                  className={`header-background-toggle ${config?.staticMode ? 'is-on' : 'is-off'}`}
                  onClick={handleToggleSkyBackgroundMode}
                  aria-pressed={Boolean(config?.staticMode)}
                  aria-label={config?.staticMode ? 'Attiva sfondo video' : 'Attiva sfondo statico'}
                  title={config?.staticMode ? 'Sfondo statico' : 'Sfondo video'}
                >
                  {config?.staticMode ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
                      <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z" />
                    </svg>
                  )}
                </button>
              )}
              {location.pathname !== '/' &&
                location.pathname !== '/risultati/report' &&
                currentUser && (
                <button
                  type="button"
                  className="header-weather-button"
                  onClick={handleChangeWeatherClick}
                >
                  Cambia il meteo
                </button>
              )}
              {!isAuthenticated && (
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
              {isAuthenticated && (
                <div className="header-avatar-wrapper">
                  <button
                    ref={accountButtonRef}
                    type="button"
                    className="header-avatar"
                    aria-expanded={isAccountMenuOpen}
                    aria-haspopup="menu"
                    aria-controls="header-account-menu"
                    onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  >
                    <span className="header-avatar-initials">{getUserInitials()}</span>
                  </button>
                  {isAccountMenuOpen && (
                    <div
                      ref={accountMenuRef}
                      id="header-account-menu"
                      className="header-account-menu"
                      role="menu"
                    >
                      <button
                        type="button"
                        role="menuitem"
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
                        role="menuitem"
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
        <div
          className={`app-mobile-nav-layer ${!testSessionActive && mobileNavOpen ? 'is-open' : ''}`}
          aria-hidden={testSessionActive || !mobileNavOpen}
        >
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
            aria-label="Menu di navigazione"
          >
            {/* ── Drawer head: user info + close ── */}
            <div className="app-mobile-drawer-head">
              <div className="app-mobile-drawer-user-block">
                {isAuthenticated ? (
                  <>
                    <div className="app-mobile-drawer-avatar">{getUserInitials()}</div>
                    <div className="app-mobile-drawer-user-info">
                      <div className="app-mobile-drawer-user-name">
                        {currentUser?.displayName || currentUser?.email?.split('@')[0] || ''}
                      </div>
                      <div className="app-mobile-drawer-user-email">{currentUser?.email || ''}</div>
                    </div>
                  </>
                ) : (
                  <div className="app-mobile-drawer-guest-label">Menu</div>
                )}
              </div>
              <button
                type="button"
                className="app-mobile-drawer-close"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Chiudi menu"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18"/>
                </svg>
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="app-mobile-drawer-scroll">
              {/* Nav section */}
              <div>
                <div className="app-mobile-drawer-section-title">Navigazione</div>
                <nav className="app-mobile-nav-links" aria-label="Collegamenti">
                  {isAuthenticated ? (
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

              {/* Env section (not on landing) */}
              {location.pathname !== '/' && (
                <div className="app-mobile-drawer-env">
                  <div className="app-mobile-drawer-section-title">Ambiente</div>
                  <div className="app-mobile-drawer-toggle-row">
                    <span>Suoni interfaccia</span>
                    <button
                      type="button"
                      className={`app-mobile-toggle-pill ${soundEnabled ? 'is-on' : ''}`}
                      onClick={toggleSound}
                      aria-pressed={soundEnabled}
                      aria-label={soundEnabled ? 'Disattiva suoni interfaccia' : 'Attiva suoni interfaccia'}
                    />
                  </div>
                  <div className="app-mobile-drawer-toggle-row" style={{ marginTop: 6 }}>
                    <span>Sfondo statico</span>
                    <button
                      type="button"
                      className={`app-mobile-toggle-pill ${config?.staticMode ? 'is-on' : ''}`}
                      onClick={handleToggleSkyBackgroundMode}
                      aria-pressed={Boolean(config?.staticMode)}
                      aria-label={config?.staticMode ? 'Attiva sfondo video' : 'Attiva sfondo statico'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Footer: logout ── */}
            {isAuthenticated && (
              <div className="app-mobile-drawer-footer">
                <button
                  type="button"
                  className="app-mobile-drawer-logout"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </div>
            )}
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
                <Route path="/tutorial" element={<TutorialPage />} />
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
        {cookieConsent === null && !testSessionActive && (
          <div className="gdpr-banner" role="region" aria-label="Consenso cookie">
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
