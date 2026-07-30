import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AuthBox from '../components/AuthBox.jsx'
import VideoBackground0311 from '../components/VideoBackground0311.jsx'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import { useAuth } from '../AuthContext.jsx'
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  requestPasswordReset as authRequestPasswordReset,
  getGoogleAuthDiagnosticEventName,
} from '../auth.js'
import '../styles/landing-nebula.css'

const PANELS_DATA = [
  {
    num: '01',
    color: '#7dabfa',
    eyebrow: "MUSICA COME LINGUAGGIO DELL'IDENTITÀ EMOTIVA",
    title: 'Perché un test sonoro?',
    paragraphs: [
      "La Musica è il mezzo più evoluto per la comunicazione emotiva. Il test non è un gioco è un primo concreto esempio di uso della musica a fini umanistici. I flussi sonori sono una lente per osservare l'area del sentire, oltre la sfera cognitiva.",
    ],
  },
  {
    num: '02',
    color: '#c4b5fd',
    eyebrow: 'COME CI SI MUOVE TRA SIMPATIA, ANTIPATIA E INDIFFERENZA ATTRAVERSO STIMOLI SONORI MUSICALI.',
    title: "TST illumina l'area del sentire",
    paragraphs: [
      'Il protocollo TST rivela le istintive reazioni emotive e affettive a stimoli sonori multipli che fanno parte delle qualità oggettive del codice musicale.',
      'I 5 elementi del codice musicale sono Timbro, Ritmo, Intervalli, Armonia e Melodia.',
      'Per "area del sentire" si intendono diverse tipologie di forze emotive che agiscono in maniera unica e irripetibile nell\'interiorità di ciascun individuo. Dal punto di vista musicale, queste aree sono sintetizzate in cinque grandi correnti di energia emotiva: Flemma, Entusiasmo, Malinconia-Nostalgia, Volitività e Anaffettività.',
    ],
  },
  {
    num: '03',
    color: '#5eead4',
    eyebrow: '72 PASSI BREVI, NESSUNA RISPOSTA GIUSTA O SBAGLIATA',
    title: 'Un percorso di ascolto guidato',
    paragraphs: [
      'TST è costituito da 72 brevi stimoli sonori e musicali, da sentire uno per volta.',
      'Sono organizzati per Timbri, Intervalli, Ritmi, Melodie ed Armonie.',
      'Associa in modo istintivo i flussi sonori alle tue sensazioni, emozioni e sentimenti individuando nella barra delle risposte quelli che corrispondono meglio alle tue percezioni.',
    ],
  },
  {
    num: '04',
    color: '#a5b4fc',
    eyebrow: 'DAI SUONI AI PROFILI TEMPERAMENTALI',
    title: 'Flussi musicali come rilevatori e rivelatori',
    paragraphs: [
      "La risonanza tra Musica e Disposizioni Intellettuali, Emotive e Spirituali dell'Uomo si è evidenziata nel corso dei secoli come elemento oggettivo conclamato.",
      'Basandosi su questa evidenza, TST entra nei dettagli di questa relazione utilizzando singoli suoni e flussi musicali come strumenti rilevatori e rivelatori di una complessità emotiva interiore che va oltre la sfera cognitiva.',
      "Le risposte date attraverso il questionario, opportunamente decodificate, creano un profilo interiore unico per ciascun individuo e una mappa sintetica dell'identità emotiva individuale.",
    ],
  },
  {
    num: '05',
    color: '#fbbf62',
    eyebrow: 'UNA MAPPA VISIVA DELLA STRUTTURA EMOTIVA',
    title: 'Cosa ottieni alla fine',
    paragraphs: [
      "Il report finale TST restituisce quattro indicatori dell'identità emotiva: la tua natura di base, il rapporto con te stesso, il rapporto con l'altro e il rapporto con l'agire, insieme alla rappresentazione visiva della tua complessità temperamentale.",
    ],
  },
  {
    num: '06',
    color: '#c4b5fd',
    eyebrow: 'LA PROCEDURA, LO STUDIO E LA BIBLIOGRAFIA',
    title: 'Elementi essenziali della procedura TST',
    paragraphs: [
      'Questa procedura nasce da anni di ricerca, studi e sperimentazioni di Franco Mussida, raccolti in libri, saggi e pubblicazioni*. Ne è derivata una procedura di rilevanza scientifica sul rapporto tra l\'oggettività del codice musicale e la realtà emotiva individuale.',
      "In questa versione informatica, il linguaggio è stato appositamente curato e scelto da Franco Mussida, dal comitato scientifico Co2, dal CPM Music Institute e dall'Università degli Studi di Pavia.",
      'Per iniziare subito il test, vai direttamente al pannello di accesso.',
    ],
    footnote:
      '*La Musica Ignorata (Skira, 2013); Le Chiavi Nascoste della Musica (Skira, 2016); Il Pianeta della Musica (Salani, 2019, oggi alla VI ed.)',
  },
]

const TIMELINE_DATA = [
  {
    color: '#7dabfa',
    label: 'Ippocrate & Galeno — Rudolf Steiner',
    text: 'L\'idea che ognuno porti dentro di sé una "cifra" affettiva propria accompagna il pensiero umano da millenni: è il concetto di temperamento. Già Ippocrate e Galeno immaginarono quattro grandi disposizioni — sanguigno, flemmatico, collerico, melanconico — e secoli dopo Rudolf Steiner le riprese e sviluppò nella sua pedagogia.',
  },
  {
    color: '#5eead4',
    label: 'Thomas & Chess — New York Longitudinal Study',
    text: "Ciò che gli antichi avevano saggiamente intuito è stato confermato dalla ricerca scientifica del Novecento: in studi durati vent'anni, come il New York Longitudinal Study, Thomas e Chess dimostrarono che le differenze temperamentali sono reali, misurabili e presenti fin dai primi mesi di vita.",
  },
  {
    color: '#a5b4fc',
    label: 'Cloninger',
    text: "Pochi anni dopo, Cloninger ne individuò le basi psicobiologiche, distinguendo ciò che nel temperamento è innato da ciò che matura con l'esperienza.",
  },
  {
    color: '#c4b5fd',
    label: 'Franco Mussida',
    text: 'Ai quattro temperamenti citati, Franco Mussida aggiunge una quinta disposizione: il ruolo della forza anaffettiva e intellettuale sulle componenti temperamentali.',
  },
]

function buildStarShadow() {
  return Array.from({ length: 90 }, () => {
    const x = Math.round(Math.random() * 2000)
    const y = Math.round(Math.random() * 4000)
    const o = (Math.random() * 0.6 + 0.3).toFixed(2)
    return `${x}px ${y}px rgba(255,255,255,${o})`
  }).join(',')
}

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
  const [revealed, setRevealed] = useState({})
  const [activePanelIndex, setActivePanelIndex] = useState(-1)
  const hasAuthenticatedSession = Boolean(currentUser)
  const accessBoxRef = useRef(null)
  const accessSectionRef = useRef(null)
  const starShadow = useMemo(() => buildStarShadow(), [])

  const scrollAccessSectionIntoView = useCallback(() => {
    if (typeof window === 'undefined') return
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        accessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }, [])

  const openAccessBox = useCallback(
    (mode = 'scelta') => {
      setAuthError('')
      setResetMessage('')
      setInitialAuthMode(mode)
      setShowAccessBox(true)
      scrollAccessSectionIntoView()
    },
    [scrollAccessSectionIntoView],
  )

  const navigateToLogin = () => {
    const loginParams = new URLSearchParams(location.search.replace(/^\?/, ''))
    loginParams.set('accesso', '1')
    if (location.pathname === '/') {
      openAccessBox()
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

  const scrollToPitch = () => {
    document.getElementById('tst-pitch')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      result.message || 'Se esiste un account con questa email, è stata inviata una mail per reimpostare la password.',
    )
  }

  useEffect(() => {
    queueMicrotask(() => setLandingSkyOverride({ timeOfDay: 'sunset', weather: 'sereno' }))
    return () => {
      setLandingSkyOverride(null)
    }
  }, [setLandingSkyOverride])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.classList.add('tst-route-landing')
    return () => document.body.classList.remove('tst-route-landing')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const onOpenAccess = () => openAccessBox('scelta')
    const onOpenAccessRegister = () => openAccessBox('register')
    window.addEventListener('tst:open-access', onOpenAccess)
    window.addEventListener('tst:open-access-register', onOpenAccessRegister)
    return () => {
      window.removeEventListener('tst:open-access', onOpenAccess)
      window.removeEventListener('tst:open-access-register', onOpenAccessRegister)
    }
  }, [openAccessBox])

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
    if (location?.state?.openAccessBox) {
      queueMicrotask(() => {
        openAccessBox(location.state.openRegister ? 'register' : 'scelta')
        navigate('.', { replace: true, state: {} })
      })
    }
  }, [location, navigate, openAccessBox])

  useEffect(() => {
    if (location.pathname !== '/') return
    const params = new URLSearchParams(location.search.replace(/^\?/, ''))
    if (params.get('accesso') !== '1') return
    params.delete('accesso')
    const rest = params.toString()
    queueMicrotask(() => {
      openAccessBox('scelta')
      navigate(
        { pathname: '/', search: rest ? `?${rest}` : '', hash: location.hash || '' },
        { replace: true, state: {} },
      )
    })
  }, [location.pathname, location.search, location.hash, navigate, openAccessBox])

  useEffect(() => {
    if (showAccessBox && accessBoxRef.current) {
      accessSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [showAccessBox])

  useEffect(() => {
    if (!authReady || !hasAuthenticatedSession) return
    if (showAccessBox) {
      navigate('/home', { replace: true })
    }
  }, [authReady, hasAuthenticatedSession, showAccessBox, navigate])

  // Reveal-on-scroll per pitch, slider intro, pannelli e metodologia
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const id = entry.target.getAttribute('data-reveal-id')
          if (id) {
            setRevealed((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
          }
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' },
    )
    document.querySelectorAll('[data-reveal-id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // Pannello attivo per la dot-nav laterale
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActivePanelIndex(parseInt(entry.target.getAttribute('data-panel-index'), 10))
          }
        })
      },
      { threshold: 0.5 },
    )
    document.querySelectorAll('[data-panel-index]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="tst-nebula">
      <div className="tst-nebula-bg" aria-hidden="true">
        <VideoBackground0311 className="tst-nebula-bg-video" />
        <div className="tst-nebula-bg-corner-vignette" />
        <div className="tst-nebula-bg-gradient" />
        <div className="tst-nebula-bg-stars" style={{ boxShadow: starShadow }} />
      </div>

      <main className="tst-nebula-main">
        <section data-screen-label="Hero" className="tst-nebula-hero">
          <div className="tst-nebula-hero-word">
            {'TST'.split('').map((letter, index) => (
              <span key={letter + index} style={{ animationDelay: `${index * 130}ms` }}>
                {letter}
              </span>
            ))}
          </div>
          <p className="tst-nebula-hero-sub tst-nebula-legible">
            Test Sonoro Temperamentale per la Rilevazione dell'Identità Emotiva
          </p>
          <button type="button" className="tst-nebula-hero-cta" onClick={scrollToPitch}>
            AVVIA
          </button>
          <div className="tst-nebula-chevron" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 9l6 6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        <div ref={accessSectionRef} className="tst-nebula-access">
          {!hasAuthenticatedSession && showAccessBox && (
            <div ref={accessBoxRef} className="tst-nebula-access-shell">
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
        </div>

        <section
          data-screen-label="Pitch"
          id="tst-pitch"
          data-reveal-id="pitch"
          className={`tst-nebula-pitch tst-nebula-reveal ${revealed.pitch ? 'is-revealed' : ''}`}
        >
          <p className="tst-nebula-pitch-lead tst-nebula-legible">
            TST è uno strumento scientifico-artistico musicale che rivela l'intima natura emotiva
            individuale.
          </p>
          <p className="tst-nebula-pitch-body tst-nebula-legible">
            Il test usa la musica come stimolo emozionale. Un protocollo unico privo di algoritmi che
            illumina le nostre profonde qualità interiori.
          </p>
          <button type="button" className="tst-nebula-pitch-cta" onClick={handleStartClick}>
            AVVIA IL TEST
          </button>
        </section>

        <section
          data-screen-label="Slider Intro"
          id="tst-slider-intro"
          data-reveal-id="sliderIntro"
          className={`tst-nebula-slider-intro tst-nebula-reveal ${revealed.sliderIntro ? 'is-revealed' : ''}`}
        >
          <span className="tst-nebula-eyebrow tst-nebula-legible">Perché il test sonoro</span>
          <h2 className="tst-nebula-slider-intro-title tst-nebula-legible">
            Sei passaggi per capire cosa ascolti e cosa rivela di te.
          </h2>
        </section>

        <div className="tst-nebula-panel-dots" aria-hidden="true">
          {PANELS_DATA.map((panel, index) => (
            <div
              key={panel.num}
              className={`tst-nebula-panel-dot ${activePanelIndex === index ? 'is-active' : ''}`}
              style={{ '--dot-color': panel.color }}
            />
          ))}
        </div>

        {PANELS_DATA.map((panel, index) => {
          const even = index % 2 === 0
          const revealId = `panel-${index}`
          return (
            <section
              key={panel.num}
              data-screen-label={`Panel ${panel.num}`}
              data-panel-index={index}
              data-reveal-id={revealId}
              className={`tst-nebula-panel ${even ? 'tst-nebula-panel--even' : 'tst-nebula-panel--odd'}`}
            >
              <div className="tst-nebula-panel-number">{panel.num}</div>
              <div
                className={`tst-nebula-panel-content ${revealed[revealId] ? 'is-revealed' : ''}`}
              >
                <span className="tst-nebula-eyebrow tst-nebula-legible" style={{ color: panel.color }}>
                  {panel.eyebrow}
                </span>
                <h3 className="tst-nebula-panel-title tst-nebula-legible">{panel.title}</h3>
                {panel.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} className="tst-nebula-panel-paragraph tst-nebula-legible">
                    {paragraph}
                  </p>
                ))}
                {panel.footnote && (
                  <p className="tst-nebula-panel-footnote tst-nebula-legible">{panel.footnote}</p>
                )}
              </div>
            </section>
          )
        })}

        <section
          data-screen-label="Metodologia"
          id="tst-method"
          data-reveal-id="method"
          className={`tst-nebula-method tst-nebula-reveal ${revealed.method ? 'is-revealed' : ''}`}
        >
          <div className="tst-nebula-method-head">
            <h2 className="tst-nebula-method-title tst-nebula-legible">
              Metodologia: il frutto di anni di ricerca
            </h2>
            <p className="tst-nebula-method-intro tst-nebula-legible">
              La procedura TST è stata collaudata in 40 anni di ricerca da Franco Mussida, soprattutto in
              contesti dove la fragilità affettiva è particolarmente accentuata, come istituti di pena e
              comunità di recupero.
            </p>
          </div>

          <div className="tst-nebula-timeline">
            {TIMELINE_DATA.map((item) => (
              <div key={item.label} className="tst-nebula-timeline-item">
                <div className="tst-nebula-timeline-marker">
                  <div className="tst-nebula-timeline-dot" style={{ '--dot-color': item.color }} />
                  <div className="tst-nebula-timeline-line" />
                </div>
                <div className="tst-nebula-timeline-body">
                  <span className="tst-nebula-timeline-label tst-nebula-legible" style={{ '--dot-color': item.color, color: item.color }}>
                    {item.label}
                  </span>
                  <p className="tst-nebula-timeline-text tst-nebula-legible">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="tst-nebula-footer">
          <button type="button" className="tst-nebula-back-top" onClick={scrollToTop}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 15l-6-6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Torna su
          </button>
          <div className="tst-nebula-footer-badge">TST</div>
        </footer>
      </main>
    </div>
  )
}

export default LandingPage
