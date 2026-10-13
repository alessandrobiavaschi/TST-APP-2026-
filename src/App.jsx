import React, { Suspense, lazy, useState, useEffect, useLayoutEffect, useRef } from 'react'
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
import { useSkyTheme } from './SkyThemeContext.jsx'
import {
  clearLocalDeveloperSession,
  isLocalDeveloperAccessAvailable,
  restoreLocalDeveloperSession,
  startLocalDeveloperSession,
} from './localDeveloperAccess.js'
import SkyBackground from './components/SkyBackground.jsx'
import {
  buildChunkRecoveryUrl,
  CHUNK_RELOAD_STORAGE_KEY,
  isRecoverableChunkLoadError,
  shouldRetryChunkLoad,
} from './utils/chunkLoadRecovery.js'
import { useDialogFocus } from './hooks/useDialogFocus.js'
import './styles/app-shell.css'
import './App.css'
import './styles/tst-mobile.css'

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'))
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const NewTestPage = lazy(() => import('./pages/NewTestPage.jsx'))
const ResultsPage = lazy(() => import('./pages/ResultsPage.jsx'))
const ReportPage = lazy(() => import('./pages/ReportPage.jsx'))
const InfoPage = lazy(() => import('./pages/InfoPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const TstPage = lazy(() => import('./pages/TstPage.jsx'))
const TutorialPage = lazy(() => import('./pages/TutorialPage.jsx'))
const LocalDeveloperPage = lazy(() => import('./pages/LocalDeveloperPage.jsx'))

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

    if (!isRecoverableChunkLoadError(error)) return

    try {
      const now = Date.now()
      const lastAttempt = window.sessionStorage.getItem(CHUNK_RELOAD_STORAGE_KEY)
      if (!shouldRetryChunkLoad(lastAttempt, now)) return

      window.sessionStorage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now))
      window.location.replace(buildChunkRecoveryUrl(window.location.href, now))
    } catch (recoveryError) {
      console.warn('Recupero automatico del bundle non disponibile:', recoveryError)
    }
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

function RouteScrollReset() {
  const { pathname, search, hash } = useLocation()

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined
    if (hash) return undefined

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      document.documentElement.scrollTop = 0
      document.documentElement.scrollLeft = 0
      document.body.scrollTop = 0
      document.body.scrollLeft = 0
    }

    resetScroll()
    const frameId = window.requestAnimationFrame(resetScroll)
    return () => window.cancelAnimationFrame(frameId)
  }, [pathname, search, hash])

  return null
}

function LocalDeveloperNewTestEntry() {
  const location = useLocation()
  const navigate = useNavigate()
  const isGuestSession = location.state?.mode === 'guest'

  useEffect(() => {
    if (isGuestSession) return
    navigate('/nuovo-test', {
      replace: true,
      state: { ...(location.state || {}), mode: 'guest', localDeveloper: true },
    })
  }, [isGuestSession, location.state, navigate])

  if (!isGuestSession) {
    return <div className="page" aria-busy="true" aria-label="Preparazione test locale" />
  }

  return <NewTestPage />
}

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [localDeveloperUser, setLocalDeveloperUser] = useState(() => restoreLocalDeveloperSession())
  const [authReady, setAuthReady] = useState(() => Boolean(localDeveloperUser))
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
  const accountMenuRef = useRef(null)
  const accountButtonRef = useRef(null)
  const localDeveloperAccessAvailable = isLocalDeveloperAccessAvailable()
  const effectiveUser = localDeveloperUser || currentUser || auth?.currentUser || null
  const isLocalDeveloper = Boolean(localDeveloperUser)
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

  useDialogFocus(mobileNavDrawerRef, {
    open: !testSessionActive && mobileNavOpen,
    onClose: () => setMobileNavOpen(false),
  })

  useEffect(() => {
    if (!mobileNavOpen) return undefined
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
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
    navigate(isAuthenticated ? '/home' : '/', { replace: true })
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
      // Già sulla landing: l'evento custom basta (LandingPage apre e scrolla al pannello da sé).
      // Una navigate() qui in più farebbe scattare anche gli effetti di LandingPage che
      // reagiscono a location.state/location.search, richiamando openAccessBox() una seconda
      // (e terza) volta in corsa con questa — la causa dello scroll-to-login che non si fermava
      // in una posizione coerente (o non partiva affatto).
      window.dispatchEvent(new CustomEvent('tst:open-access'))
      return
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
    if (isAuthenticated) {
      navigate('/home')
      return
    }
    if (location.pathname === '/home' && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tst:open-home-auth'))
      navigate('/home', { state: { openLogin: true, openRegister: true } })
      return
    }
    if (location.pathname === '/' && typeof window !== 'undefined') {
      // Vedi handleLoginClick: già sulla landing, l'evento custom basta.
      window.dispatchEvent(new CustomEvent('tst:open-access-register'))
      return
    }
    const loginParams = new URLSearchParams(
      location.pathname === '/' ? location.search.replace(/^\?/, '') : '',
    )
    loginParams.set('accesso', '1')
    const loginSearch = `?${loginParams.toString()}`
    navigate({ pathname: '/', search: loginSearch, state: { openAccessBox: true, openRegister: true } })
  }

  const enterLocalDeveloperMode = () => {
    const user = startLocalDeveloperSession({ available: localDeveloperAccessAvailable })
    setLocalDeveloperUser(user)
    setAuthReady(true)
    setMobileNavOpen(false)
    navigate('/home', { replace: true })
  }

  const logout = async () => {
    if (localDeveloperUser) {
      clearLocalDeveloperSession()
      setLocalDeveloperUser(null)
    } else if (auth) {
      await signOut(auth)
    }
    setCurrentUser(null)
    setIsAccountMenuOpen(false)
    setMobileNavOpen(false)
    navigate('/', { replace: true })
  }

  const handleLogoutClick = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Errore durante il logout:', error)
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
  const isReportPage = location.pathname === '/risultati/report' || location.pathname === '/report-preview'
  const isTestFlowPage = location.pathname === '/nuovo-test'

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        authReady,
        logout,
        isLocalDeveloper,
        localDeveloperAccessAvailable,
        enterLocalDeveloperMode,
      }}
    >
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
        {location.pathname !== '/' && !isReportPage && (
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
                !isReportPage &&
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
                  {localDeveloperAccessAvailable && (
                    <button
                      type="button"
                      className="header-login-button"
                      onClick={enterLocalDeveloperMode}
                    >
                      Accesso sviluppo
                    </button>
                  )}
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
                        {localDeveloperAccessAvailable && (
                          <button
                            type="button"
                            className="app-mobile-nav-action app-mobile-nav-action--primary"
                            onClick={enterLocalDeveloperMode}
                          >
                            Accesso sviluppo
                          </button>
                        )}
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
            location.pathname === '/' || isReportPage
              ? ' app-main--landing'
              : ''
          }${location.pathname === '/' ? ' app-main--landing-home' : ''}`}
        >
          <div
            className={`app-main-inner${
              location.pathname === '/' || isReportPage
                ? ' app-main-inner--landing'
                : ''
            }`}
          >
            <AppErrorBoundary>
              <RouteScrollReset />
              <Suspense fallback={<div className="page" aria-busy="true" aria-label="Caricamento pagina" />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route
                  path="/nuovo-test"
                  element={
                    isLocalDeveloper
                      ? <LocalDeveloperNewTestEntry />
                      : <NewTestPage />
                  }
                />
                <Route path="/tutorial" element={<TutorialPage />} />
                <Route path="/tst" element={<TstPage />} />
                <Route
                  path="/risultati"
                  element={
                    isLocalDeveloper
                      ? <LocalDeveloperPage section="results" />
                      : <ResultsPage />
                  }
                />
                <Route path="/risultati/report" element={<ReportPage />} />
                <Route path="/report-preview" element={<ReportPage />} />
                <Route path="/dashboard-operatore" element={<Navigate to="/home" replace />} />
                <Route
                  path="/profilo"
                  element={
                    isLocalDeveloper
                      ? <LocalDeveloperPage section="profile" />
                      : <ProfilePage />
                  }
                />
                <Route path="/info" element={<InfoPage />} />
              </Routes>
              </Suspense>
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
