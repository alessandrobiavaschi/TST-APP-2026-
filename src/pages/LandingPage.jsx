import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useScroll, useTransform } from 'framer-motion'
import AuthBox from '../components/AuthBox.jsx'
import VideoBackground0311 from '../components/VideoBackground0311.jsx'
import LandingPanelsShowcase from '../components/landing/LandingPanelsShowcase.jsx'
import LandingIntroRackFocus from '../components/landing/LandingIntroRackFocus.jsx'
import { shouldPlayLandingIntro } from '../components/landing/landingIntroStorage.js'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import { useAuth } from '../AuthContext.jsx'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import {
  signInWithGoogle as authSignInWithGoogle,
  signInWithEmail as authSignInWithEmail,
  registerWithEmail as authRegisterWithEmail,
  requestPasswordReset as authRequestPasswordReset,
  getGoogleAuthDiagnosticEventName,
} from '../auth.js'
// CSS caricato in App.jsx (vedi commento lì)

const HERO_TITLE = 'TST'
const HERO_SUBTITLE = "Test Sonoro Temperamentale per la Rilevazione dell'Identità Emotiva"

const PANELS_DATA = [
  {
    num: '01',
    color: '#f9a8d4',
    eyebrow: 'ASCOLTATORI E MUSICISTI',
    title: 'Ognuno ascolta a modo suo',
    paragraphs: [
      'Ogni individuo è un ascoltatore. Come tale ha un suo specifico, individuale rapporto di relazione emotiva con il suono e con la Musica che il Test rileva e rivela.',
      'Ma non tutti gli ascoltatori sono persone che fanno Musica, o che fanno parte della categoria dei musicisti che con le emozioni ci dialoga e ci lavora.',
      'Per questo alla fine del test abbiamo creato una apposita sezione con un linguaggio più tecnico, dedicata a chi vuole entrare nel merito del rapporto tra la singola identità emotiva e la speciale sensibilità al suono che ogni musicista o aspirante musicista possiede.',
      'Si potrà così entrare in contatto il vocabolario del "sentire musicale".',
    ],
  },
  {
    num: '02',
    color: '#7dabfa',
    eyebrow: "MUSICA COME LINGUAGGIO DELL'IDENTITÀ EMOTIVA",
    title: 'Perché un Test sonoro?',
    paragraphs: [
      'La Musica è il mezzo più evoluto per la comunicazione emotiva.',
      "Il Test non è un gioco: è un primo concreto esempio di uso della Musica a scopi umanistici, formativi per una sempre più consapevole educazione emotiva delle persone nelle loro diverse fasi evolutive.",
      "Il TST è una lente per osservare gli effetti dei flussi sonori organizzati sull'area del sentire, oltre la sfera cognitiva.",
    ],
  },
  {
    num: '03',
    color: '#c4b5fd',
    eyebrow: 'COME CI SI MUOVE TRA SIMPATIA, ANTIPATIA E INDIFFERENZA ATTRAVERSO STIMOLI SONORI MUSICALI.',
    title: "TST illumina l'area del sentire",
    paragraphs: [
      'Il protocollo TST rivela le istintive reazioni emotive e affettive a stimoli sonori organizzati — singoli, multipli, di natura ritmica, elementi vibratori — che fanno parte delle qualità oggettive del Codice Musicale.',
      'I 5 elementi essenziali di questo Codice non verbale per la comunicazione emotiva sono Timbro, Ritmo, Intervalli, Armonia e Melodia: si trovano in tutti i generi e stili musicali, nessuno escluso, anche se assemblati in quantità, qualità e strutture diverse.',
      'Nel Test vengono però somministrati in forme archetipiche che non rimandano ad alcun genere o stile.',
      'Per "area del sentire" si intende un\'area privata, unica e irripetibile a seconda del singolo individuo: è di fatto la "struttura emotiva".',
      'È l\'insieme di 5 forze emotive che, per qualità e quantità, definiscono la singola identità emotiva: Flemma, Malinconia-Nostalgia, Marzialità (le forze coleriche volitive), Entusiasmo e Anaffettività.',
    ],
  },
  {
    num: '04',
    color: '#5eead4',
    eyebrow: '72 PASSI BREVI, NESSUNA RISPOSTA GIUSTA O SBAGLIATA',
    title: 'Un percorso di ascolto guidato',
    paragraphs: [
      'TST è costituito da 72 brevi stimoli sonori e musicali, da sentire uno per volta e da associare a una o più sensazioni suggerite.',
      'Sono organizzati per Timbri, Intervalli, Ritmi, Melodie ed Armonie.',
      'Associa in modo istintivo i flussi sonori alle tue sensazioni, emozioni e sentimenti individuando nella barra delle risposte quelli che corrispondono meglio alle tue percezioni.',
    ],
  },
  {
    num: '05',
    color: '#a5b4fc',
    eyebrow: 'DAI SUONI AI PROFILI TEMPERAMENTALI',
    title: 'Flussi musicali come rilevatori e rivelatori',
    paragraphs: [
      "La risonanza tra la Musica e il complesso di tutte le naturali disposizioni dell'Uomo si è evidenziata nel corso dei secoli come elemento oggettivo conclamato.",
      'Basandosi su questa evidenza, TST entra nei dettagli di questa relazione utilizzando singoli suoni e flussi musicali come strumenti rilevatori e rivelatori di una complessità emotiva interiore che va oltre la sfera cognitiva.',
      "Le risposte date attraverso il questionario, opportunamente decodificate, creano un profilo interiore unico per ciascun individuo e una mappa sintetica dell'identità emotiva individuale.",
    ],
  },
  {
    num: '06',
    color: '#fbbf62',
    eyebrow: 'UNA MAPPA VISIVA DELLA STRUTTURA EMOTIVA',
    title: 'Cosa ottieni alla fine',
    paragraphs: [
      "Il report finale TST restituisce quattro indicatori dell'identità emotiva:",
      "la tua natura di base, il rapporto con te stesso, il rapporto con l'altro e il rapporto con l'agire, insieme alla rappresentazione visiva della tua complessità temperamentale.",
      'Può essere il punto di partenza per una reale e profonda autoconoscenza di Sé.',
      'Aiuta a osservare con maggiore oggettività l\'importanza e il ruolo della sfera emotiva nella vita reale, dall\'ambizione individuale al rapporto con lo studio, il lavoro e il mondo delle relazioni.',
      'Data la speciale natura del Test abbiamo aggiunto restituzioni ancora più specifiche, che possono essere viste da tutti anche per mera curiosità, nell\'area "For Musicians".',
    ],
  },
  {
    num: '07',
    color: '#c4b5fd',
    eyebrow: 'LA PROCEDURA, LO STUDIO E LA BIBLIOGRAFIA',
    title: 'Elementi essenziali della procedura TST',
    paragraphs: [
      'Questa procedura nasce da anni di ricerca, studi e sperimentazioni di Franco Mussida, raccolti in libri, saggi e pubblicazioni*.',
      'Ne è derivata una procedura di rilevanza scientifica sul rapporto tra l\'oggettività del Codice Musicale e la realtà emotiva individuale.',
      "In questa versione informatica, il linguaggio è stato appositamente curato e scelto da Franco Mussida, dal comitato scientifico Co2, dal CPM Music Institute e dall'Università degli Studi di Pavia.",
      'Per iniziare subito il Test, vai direttamente al pannello di accesso.',
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

// Coordinate in vw/vh (non px fissi): il contenitore è agganciato al viewport
// (position: fixed), quindi un range fisso più grande dello schermo tagliava
// fuori la maggior parte dei punti, lasciando poche stelle visibili.
function buildStarShadow(count, { blur = 0, minOpacity = 0.3, maxOpacity = 0.9 } = {}) {
  return Array.from({ length: count }, () => {
    const x = (Math.random() * 100).toFixed(2)
    const y = (Math.random() * 100).toFixed(2)
    const o = (Math.random() * (maxOpacity - minOpacity) + minOpacity).toFixed(2)
    return `${x}vw ${y}vh ${blur}px rgba(255,255,255,${o})`
  }).join(',')
}

function LandingPage() {
  useDocumentTitle('Benvenuto')
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
  const hasAuthenticatedSession = Boolean(currentUser)
  const accessBoxRef = useRef(null)
  const accessSectionRef = useRef(null)
  const heroRef = useRef(null)
  const heroTitleRef = useRef(null)
  const heroSubRef = useRef(null)
  // Intro rack-focus: solo alla prima visita (vedi LandingIntroRackFocus.jsx)
  const [introState, setIntroState] = useState(() => (shouldPlayLandingIntro() ? 'playing' : 'off'))
  const handleIntroDone = useCallback(() => setIntroState('done'), [])
  const methodRef = useRef(null)
  const starShadow = useMemo(() => buildStarShadow(60, { minOpacity: 0.35, maxOpacity: 0.85 }), [])
  const starGlowShadow = useMemo(
    () => buildStarShadow(12, { blur: 1, minOpacity: 0.6, maxOpacity: 1 }),
    [],
  )

  // Sfondo video: sparisce (opacità 0) uscendo dall'Hero, lascia solo il
  // cielo stellato durante pitch/slider/pannelli, poi ricompare gradualmente
  // entrando in Metodologia — ma più scuro rispetto all'Hero, mai al 100%.
  const MAX_RETURN_OPACITY = 0.45
  const { scrollYProgress: heroFadeProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const { scrollYProgress: methodFadeProgress } = useScroll({
    target: methodRef,
    offset: ['start end', 'start 30%'],
  })
  const bgVideoOpacity = useTransform(
    [heroFadeProgress, methodFadeProgress],
    ([heroProgress, methodProgress]) =>
      Math.max(1 - heroProgress, methodProgress * MAX_RETURN_OPACITY),
  )

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
        scrollAccessSectionIntoView()
        return
      }
      const nextMessage =
        event?.detail?.message ||
        "Errore durante l'accesso con Google. Apri la console Firebase per i dettagli."
      setAuthError(nextMessage)
      setShowAccessBox(true)
      scrollAccessSectionIntoView()
    }
    window.addEventListener(eventName, onGoogleDiagnostic)
    return () => window.removeEventListener(eventName, onGoogleDiagnostic)
  }, [scrollAccessSectionIntoView])

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
    const hasAccessParam = params.get('accesso') === '1'
    const hasGoogleAuthParam = params.get('tst_google_auth') === '1'
    if (!hasAccessParam && !hasGoogleAuthParam) return
    params.delete('accesso')
    params.delete('tst_google_auth')
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


  return (
    <div className="tst-nebula">
      {introState === 'playing' && (
        <LandingIntroRackFocus
          title={HERO_TITLE}
          subtitle={HERO_SUBTITLE}
          targetTitleRef={heroTitleRef}
          targetSubRef={heroSubRef}
          onDone={handleIntroDone}
        />
      )}
      <div className="tst-nebula-bg" aria-hidden="true">
        <VideoBackground0311 className="tst-nebula-bg-video" style={{ opacity: bgVideoOpacity }} />
        <div className="tst-nebula-bg-corner-vignette" />
        <div className="tst-nebula-bg-gradient" />
        <div className="tst-nebula-bg-nebula-glow" />
        <div className="tst-nebula-bg-stars" style={{ boxShadow: starShadow }} />
        <div className="tst-nebula-bg-stars tst-nebula-bg-stars--glow" style={{ boxShadow: starGlowShadow }} />
      </div>

      <div className="tst-nebula-main">
        <section
          data-screen-label="Hero"
          className={`tst-nebula-hero${introState === 'playing' ? ' is-intro-playing' : ''}${introState !== 'off' ? ' is-intro-handoff' : ''}`}
          ref={heroRef}
        >
          <h1 className="tst-nebula-hero-word" ref={heroTitleRef}>
            {HERO_TITLE.split('').map((letter, index) => (
              <span key={letter + index} style={{ animationDelay: `${index * 130}ms` }}>
                {letter}
              </span>
            ))}
          </h1>
          <p className="tst-nebula-hero-sub tst-nebula-legible" ref={heroSubRef}>
            {HERO_SUBTITLE}
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
            Il Test usa la Musica come stimolo emozionale. Un protocollo unico privo di algoritmi che
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
          <span className="tst-nebula-eyebrow tst-nebula-legible">Perché il Test sonoro</span>
          <h2 className="tst-nebula-slider-intro-title tst-nebula-legible">
            Sette passaggi per capire cosa ascolti e cosa rivela di te.
          </h2>
        </section>

        <LandingPanelsShowcase panels={PANELS_DATA} />

        <section
          data-screen-label="Metodologia"
          id="tst-method"
          data-reveal-id="method"
          ref={methodRef}
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
      </div>
    </div>
  )
}

export default LandingPage
