import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSkyTheme } from '../../SkyThemeContext.jsx'
import VideoBackground0311 from '../VideoBackground0311.jsx'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import HeroScreen from './HeroScreen'
import NavbarTST from './NavbarTST'
import ReportSectionController from './ReportSectionController'
import RoomRevealContent from './RoomRevealContent'
import { getReportGroups, REPORT_GROUPS, SECTION_TO_GROUP } from './reportSectionsConfig'
import { SHOW_TRACCE_SECTION, shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'
import { resolveReportScrollTarget, scrollToReportSection } from './reportSectionNavUtils'
import ReportHelpModal from './ReportHelpModal'
import ReportGlossaryDrawer from './ReportGlossaryDrawer'
import ProfiloEmotivo from './ProfiloEmotivo'
import TracceReport from './TracceReport'
import SezionePortatoEsperienziale from './SezionePortatoEsperienziale'
import ParoleStatiAnimo from './ParoleStatiAnimo'
import EmotionalIntegrations from './EmotionalIntegrations.jsx'
import FamilyBrowseCarousel from './FamilyBrowseCarousel.jsx'
import SectionDivider from './SectionDivider'
import ReportPartDivider from './ReportPartDivider.jsx'
import FioreCorrenti from './FioreCorrenti'
import { buildCorrentDataFromRecord } from '../../utils/galassiaData.js'
import { buildLessicoAnaliticoViewModel } from '../../utils/galassiaLessicoViewModel.js'
import { buildProgressiveContentViewModel } from '../../utils/buildProgressiveContentViewModel.js'
import { REPORT_NAV_UI, REPORT_SHELL_UI, SINTESI_UI, COMPOSIZIONE_UI } from './reportUiCopy.js'
import { SECTION_INTROS } from '../../content/reportRestitution.js'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

// PERFORMANCE: componenti pesanti caricati on-demand.
// - GalassiaView: importata solo quando si attiva "Galassia" la prima volta.
// - QuattroRapporti: porta con sé recharts (bundle pesante).
const GalassiaView = lazy(() => import('./GalassiaView'))
const ForMusiciansView = lazy(() => import('./ForMusiciansView.jsx'))
const QuattroRapporti = lazy(() => import('./QuattroRapporti'))
const SintesiCorrenti = lazy(() => import('./SintesiCorrenti'))

/* ── Fallback Suspense: 3 dot pulsanti del colore corrente ──────────── */
function DotsSpinner({ color = '#4ade80' }) {
  const reduceMotion = useReducedMotion()
  return (
    <div
      className="report-tst-spinner"
      role="status"
      aria-label={REPORT_SHELL_UI.loadingInline}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="report-tst-spinner__dot"
          style={{ backgroundColor: color }}
          animate={reduceMotion ? undefined : { opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }
          }
        />
      ))}
    </div>
  )
}

/* ── Loader full-screen del report (mini-fiore + "TST") ─────────────── */
function ReportLoader({ correnti }) {
  return (
    <div className="report-tst-loader" role="status" aria-label={REPORT_SHELL_UI.loading}>
      <FioreCorrenti correnti={correnti} size={60} pulse ariaLabel="Caricamento report TST" />
      <span className="report-tst-loader__label">TST</span>
    </div>
  )
}

const MOBILE_REPORT_MEDIA_QUERY = '(max-width: 768px)'

function isMobileReportViewport() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia(MOBILE_REPORT_MEDIA_QUERY).matches
}

/* ── Hash sync helpers ──────────────────────────────────────────────── */
function readModalitaFromHash() {
  if (typeof window === 'undefined') return 'report'
  if (window.location.hash === '#galassia') {
    return isMobileReportViewport() ? 'report' : 'galassia'
  }
  if (window.location.hash === '#for-musicians') return 'for-musicians'
  if (window.location.hash === '#famiglie') return 'famiglie'
  if (window.location.hash === '#tutte-famiglie') return 'tutte-famiglie'
  return 'report'
}

// Voci del percorso di lettura laterale che aprono una stanza di
// approfondimento indipendente (invece di scrollare nel report principale).
const ROOM_BY_GROUP = {
  'report-group-relazioni': 'famiglie',
}
// "Forza delle tue correnti emotive" e "Dizionario emotivo" non hanno una
// stanza dedicata: il loro contenuto è già inline nelle stanze 04/05.
const SCROLL_ANCHOR_BY_GROUP = {
  'report-group-forza-correnti': 'report-tst-portato',
  'report-group-educazione': 'report-tst-parole',
}
// report-group-profilo-generale è sempre "aperto" nel percorso principale:
// nessuna stanza lo nasconde, quindi il suo target di scroll resta stabile.
const STATIC_GROUP_OPEN = { 'report-group-profilo-generale': true }

const FAMIGLIE_GROUP = REPORT_GROUPS.find((g) => g.id === 'report-group-relazioni')

/**
 * <ReportTST /> — ROOT della nuova esperienza report (post-CONTEXT).
 *
 * Evoluzione di `ReportShell`: orchestra hero, navbar, modalità Report/Galassia/Musicians/Dettaglio
 * (sincronizzate con l'hash dell'URL), loader full-screen e i componenti dettagliati
 * distribuiti in una sequenza verticale a stanze fullscreen.
 */
export default function ReportShell({
  reportData,
  onDownload,
  onNavigateHome,
  onNavigateArchive,
  onRilleggiIntroduzione,
}) {
  const navigate = useNavigate()
  const skyTheme = useSkyTheme()
  const timeOfDay = skyTheme?.timeOfDay || 'morning'
  const weather = skyTheme?.weather || 'sereno'
  const visualProfile = skyTheme?.visualProfile || { tone: 'medium', warmth: 'neutral', intensity: 'normal' }
  const reduceMotion = useReducedMotion()

  const [modalita, setModalita] = useState(readModalitaFromHash)
  
  // Refs for accessibility focus restoration
  const famiglieEntryBtnRef = useRef(null)
  const famiglieBackButtonRef = useRef(null)
  const tutteFamiglieEntryBtnRef = useRef(null)
  const tutteFamiglieBackButtonRef = useRef(null)
  const musiciansEntryBtnRef = useRef(null)
  const musiciansBackButtonRef = useRef(null)
  const galassiaEntryBtnRef = useRef(null)
  const galassiaLayerRef = useRef(null)
  const previousModalitaRef = useRef(modalita)
  /** Monta Galassia al primo accesso e la tiene in DOM (overlay) per preservare stato e scroll del report. */
  const [galassiaEverOpened, setGalassiaEverOpened] = useState(
    () => readModalitaFromHash() === 'galassia',
  )
  const [isMobileViewport, setIsMobileViewport] = useState(isMobileReportViewport)
  const [helpOpen, setHelpOpen] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [glossaryFocusId, setGlossaryFocusId] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [scientificScopeOpen, setScientificScopeOpen] = useState(true)
  const [rapportiSlideActive, setRapportiSlideActive] = useState(false)
  const heroRef = useRef(null)
  const progressBarRef = useRef(null)
  const rapportiAnchorRef = useRef(null)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined
    const mediaQuery = window.matchMedia(MOBILE_REPORT_MEDIA_QUERY)
    const handleViewportChange = (event) => setIsMobileViewport(event.matches)
    setIsMobileViewport(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleViewportChange)
    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [])

  useEffect(() => {
    if (modalita !== 'report') return undefined
    const handleScroll = () => {
      const bar = progressBarRef.current
      if (!bar) return
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0
      bar.style.width = `${pct}%`
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [modalita])

  useEffect(() => {
    if (modalita !== 'report') return undefined
    const el = rapportiAnchorRef.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => setRapportiSlideActive(entry.isIntersecting),
      { rootMargin: '-96px 0px -96px 0px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [modalita])

  const openGlossary = useCallback((focusId = null) => {
    setGlossaryFocusId(focusId)
    setGlossaryOpen(true)
  }, [])

  const closeGlossary = useCallback(() => {
    setGlossaryOpen(false)
    setGlossaryFocusId(null)
  }, [])

  const changeModalita = useCallback((next) => {
    setModalita((current) => {
      if (next === current) return current
      if (next === 'galassia' && isMobileViewport) return current
      if (next === 'galassia') setGalassiaEverOpened(true)
      try {
        const url = `${window.location.pathname}${window.location.search}#${next}`
        window.history.replaceState(null, '', next === 'report' ? window.location.pathname + window.location.search : url)
      } catch {
        window.location.hash = next === 'report' ? '' : next
      }
      return next
    })
  }, [isMobileViewport])

  const openModalita = useCallback((next, event) => {
    void event
    changeModalita(next)
  }, [changeModalita])

  useEffect(() => {
    if (isMobileViewport && modalita === 'galassia') {
      changeModalita('report')
    }
  }, [changeModalita, isMobileViewport, modalita])

  useEffect(() => {
    const previousMode = previousModalitaRef.current
    previousModalitaRef.current = modalita
    if (modalita === 'report') {
      if (previousMode === 'famiglie') {
        requestAnimationFrame(() => famiglieEntryBtnRef.current?.focus())
      } else if (previousMode === 'tutte-famiglie') {
        requestAnimationFrame(() => tutteFamiglieEntryBtnRef.current?.focus())
      } else if (previousMode === 'for-musicians') {
        requestAnimationFrame(() => musiciansEntryBtnRef.current?.focus())
      } else if (previousMode === 'galassia') {
        requestAnimationFrame(() => galassiaEntryBtnRef.current?.focus())
      }
    } else if (modalita === 'for-musicians') {
      requestAnimationFrame(() => musiciansBackButtonRef.current?.focus())
    } else if (modalita === 'famiglie') {
      requestAnimationFrame(() => famiglieBackButtonRef.current?.focus())
    } else if (modalita === 'tutte-famiglie') {
      requestAnimationFrame(() => tutteFamiglieBackButtonRef.current?.focus())
    } else if (modalita === 'galassia') {
      requestAnimationFrame(() => galassiaLayerRef.current?.focus())
    }
  }, [modalita])

  useEffect(() => {
    if (modalita === 'report') return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') changeModalita('report')
      if (event.key !== 'Tab') return
      const layer = document.querySelector(`[data-report-mode="${modalita}"]`)
      if (!layer) return
      const focusable = [...layer.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => !element.closest('[inert]'))
      if (focusable.length === 0) {
        event.preventDefault()
        layer.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalita, changeModalita])

  const enterReport = useCallback(() => {
    const target = document.getElementById('report-group-profilo-generale')
    if (target) {
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
      window.history.pushState(null, '', '#report-group-profilo-generale')
      window.requestAnimationFrame(() => {
        document.getElementById('report-group-profilo-generale-heading')?.focus({ preventScroll: true })
      })
    }
  }, [reduceMotion])

  const startNewTest = useCallback(() => {
    navigate('/nuovo-test', { state: { startAtProfile: true } })
  }, [navigate])

  const hasReportData = Boolean(reportData && typeof reportData === 'object')
  const {
    utente = { nome: '' },
    profilo = {},
    correnti = [],
    sottocorrenti = [],
    profiloEmotivo = { sezioni: [] },
    rapporti = [],
    portato = {},
    famiglieLessico = {},
    filtroMusicale = {},
    musicista = {},
    sintesi = {},
    paroleEmerse = [],
    coloriCorrenti = {},
    colorTotals = {},
    approfondimento = { sezioniData: [], sezioniTest: null },
    rawRecord = {},
    sottodisposizionePrevalente = '',
    globalProfileContract = null,
  } = hasReportData ? reportData : {}

  const correnteColore = profilo?.colore || '#4ade80'
  const isAlternateMode = modalita !== 'report'
  const showEmotionalIntegrations = shouldShowEmotionalIntegrations(profilo)
  const roomMetaById = useMemo(
    () => Object.fromEntries(getReportGroups(profilo).map((group) => [group.id, group])),
    [profilo],
  )

  // Stessa fonte già usata da ProfiloEmotivo per il blocco "Le altre famiglie del tuo
  // profilo" (contentCards + globalProfileContract.ranking, dominante escluso): qui
  // si riunisce in un'unica lista, ordinata per presenza, per la stanza sfogliabile
  // aperta dal pulsante "Approfondisci tutte le famiglie".
  const allOtherFamilies = useMemo(() => {
    const dominantFamilyKey = profiloEmotivo?.dominantFamilyKey
    const viewModel = buildProgressiveContentViewModel({
      ranking: globalProfileContract?.ranking,
      contentCards: profiloEmotivo?.contentCards || {},
      excludeFamilyKeys: dominantFamilyKey ? [dominantFamilyKey] : [],
    })
    const merged = [
      ...viewModel.primaryFamilies,
      ...viewModel.companionFamilies,
      ...viewModel.theoreticalFamilies,
      ...viewModel.marginalFamilies,
    ]
    const seen = new Set()
    return merged.filter((card) => {
      if (seen.has(card.familyKey)) return false
      seen.add(card.familyKey)
      return true
    })
  }, [profiloEmotivo?.dominantFamilyKey, profiloEmotivo?.contentCards, globalProfileContract?.ranking])

  const correntData = useMemo(
    () => buildCorrentDataFromRecord(rawRecord || {}),
    [rawRecord],
  )

  const lessicoAnalitico = useMemo(() => {
    if (!hasReportData) return null
    return buildLessicoAnaliticoViewModel({
      rawRecord,
      correnti,
      correntiByPeso: reportData.correntiByPeso || [],
      sottocorrenti,
      dominantColorName: profilo?.famiglia || '',
      sottodisposizionePrevalente,
    })
  }, [hasReportData, rawRecord, correnti, reportData.correntiByPeso, sottocorrenti, profilo?.famiglia, sottodisposizionePrevalente])

  const correntiLite = useMemo(
    () => correnti.map((c) => ({ nome: c.nome, colore: c.colore, peso: c.peso })),
    [correnti],
  )
  const correntiNomeColore = useMemo(
    () =>
      correnti.map((c) => ({
        nome: c.nome,
        colore: c.colore,
        descrizioneBreve: c.descrizioneBreve || '',
        familyName: c.familyName || '',
        macroLabel: c.label || '',
      })),
    [correnti],
  )

  const reportIdentityKey = useMemo(() => {
    if (!rawRecord || typeof rawRecord !== 'object') return ''
    const stamp = rawRecord.Data_Ora_Fine_Test
    const stampKey =
      stamp && typeof stamp === 'object' && stamp !== null && 'seconds' in stamp
        ? String(stamp.seconds)
        : String(stamp ?? '')
    return [rawRecord.Nome, rawRecord.Cognome, stampKey].join('|')
  }, [rawRecord])

  const resetReportViewport = useCallback(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [])

  useEffect(() => {
    if (!hasReportData || !reportIdentityKey) return
    const requestedMode = readModalitaFromHash()
    resetReportViewport()
    setModalita(requestedMode)
    if (requestedMode !== 'report') {
      if (requestedMode === 'galassia') setGalassiaEverOpened(true)
      return
    }
    try {
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    } catch {
      window.location.hash = ''
    }
  }, [hasReportData, reportIdentityKey, resetReportViewport])

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 450)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!loaded || !reportIdentityKey) return
    resetReportViewport()
  }, [loaded, reportIdentityKey, resetReportViewport])

  useEffect(() => {
    const onHashChange = () => {
      const next = readModalitaFromHash()
      if (next === 'galassia') setGalassiaEverOpened(true)
      setModalita(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!isAlternateMode) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isAlternateMode])

  const handleNavigateSection = useCallback(
    (sectionId, { onScrollComplete } = {}) => {
      const groupId = SECTION_TO_GROUP[sectionId] || sectionId
      const roomId = ROOM_BY_GROUP[groupId]
      if (roomId) {
        changeModalita(roomId)
        onScrollComplete?.()
        return
      }
      const targetId = SCROLL_ANCHOR_BY_GROUP[groupId]
        || resolveReportScrollTarget(sectionId, { groupOpen: STATIC_GROUP_OPEN })
      scrollToReportSection(targetId, {
        reduceMotion: true,
        onLockChange: (locked) => {
          if (!locked) onScrollComplete?.()
        },
      })
    },
    [changeModalita],
  )

  if (!hasReportData) {
    return (
      <div className="page" lang="it">
        <section className="page-card">
          <h1 className="report-display-title">{REPORT_SHELL_UI.unavailableTitle}</h1>
          <p className="results-empty-message">
            {REPORT_SHELL_UI.unavailableMessage}
          </p>
        </section>
      </div>
    )
  }

  return (
    <div
      className="report-tst"
      data-time-of-day={timeOfDay}
      data-weather={weather}
      data-sky-tone={visualProfile.tone}
      data-sky-warmth={visualProfile.warmth}
      data-sky-intensity={visualProfile.intensity}
      style={{
        '--corrente-primaria': correnteColore,
        '--corrente-primaria-chiara': profilo?.coloreChiara || correnteColore,
        '--corrente-primaria-media': profilo?.coloreMedia || correnteColore,
      }}
      lang="it"
    >
      <div className="report-tst-scroll-bg" aria-hidden="true" />
      <motion.div className="report-tst-cosmic-bg" aria-hidden="true" />
      <motion.div className="report-page-wrapper__stars" aria-hidden="true" />
      <VideoBackground0311 showOverlay className="report-page-wrapper__video" />
      <div className="report-xp-progress" aria-hidden="true">
        <div ref={progressBarRef} className="report-xp-progress-bar" style={{ width: '0%' }} />
      </div>
      {scientificScopeOpen && (
        <div className="report-scientific-scope" role="note">
          <p className="report-scientific-scope__text">
            Il TST descrive le risposte date agli stimoli sonori in questa somministrazione. Non è uno
            strumento diagnostico, non sostituisce una valutazione clinica e non definisce in modo fisso
            personalità o stato psicologico. Le interpretazioni sono ipotesi descrittive interne al modello TST.
          </p>
          <button
            type="button"
            className="report-scientific-scope__close"
            aria-label="Chiudi l'avviso sul perimetro scientifico del TST"
            onClick={() => setScientificScopeOpen(false)}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      )}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="report-loader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ position: 'fixed', inset: 0, zIndex: 200 }}
          >
            <ReportLoader correnti={correntiNomeColore} />
          </motion.div>
        )}
      </AnimatePresence>

      <ReportHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        accentColor={correnteColore}
        onOpenGlossary={() => {
          setHelpOpen(false)
          openGlossary()
        }}
        onRilleggiIntroduzione={
          onRilleggiIntroduzione
            ? () => {
                setHelpOpen(false)
                onRilleggiIntroduzione()
              }
            : undefined
        }
      />

      <ReportGlossaryDrawer
        open={glossaryOpen}
        onClose={closeGlossary}
        accentColor={correnteColore}
        initialFocusId={glossaryFocusId}
      />

      <div
        className={`report-tst-report${isAlternateMode ? ' report-tst-report--covered' : ''}`}
        aria-label={REPORT_SHELL_UI.reportAria}
      >
        {/* ── STANZA 00: HOME FULLSCREEN ──────────────────────────────── */}
        <div
          id="report-hero"
          ref={heroRef}
          className="report-tst-hero-wrap report-room-section report-room-section--home"
          aria-hidden={isAlternateMode}
          inert={isAlternateMode ? true : undefined}
        >
          <HeroScreen
            familyName={profilo?.correnteDominante}
            heroResult={profilo?.heroResult}
            disposizione={profilo?.disposizione}
            userName={utente?.nome || ''}
            correnteColore={correnteColore}
            correnteColoreChiara={profilo?.coloreChiara}
            correnteColoreMedia={profilo?.coloreMedia}
            correnti={correntiLite}
            rawRecord={rawRecord}
            portato={portato}
            onReadReport={enterReport}
            onDownload={onDownload}
            onNavigateArchive={onNavigateArchive}
            testDate={rawRecord.Data_Ora_Fine_Test || rawRecord.Data_Test}
          />
        </div>

        <NavbarTST
          forceVisible={modalita !== 'report'}
          modalita={modalita}
          onModalitaChange={changeModalita}
          userName={utente?.nome || ''}
          correnteColore={correnteColore}
          correnteDominante={profilo?.correnteDominante || ''}
          profilo={profilo}
          onDownload={onDownload}
          onOpenHelp={() => setHelpOpen(true)}
        />

        <div
          className={`report-tst-layout${rapportiSlideActive ? ' report-tst-layout--rapporti-slide' : ''}`}
          aria-hidden={isAlternateMode}
          inert={isAlternateMode ? true : undefined}
        >
          <ReportSectionController
            profilo={profilo}
            musicista={musicista}
            onNavigate={handleNavigateSection}
          />

          <div className="report-tst-layout__main">
            <p className="report-tst-layout-hint sr-only">{REPORT_NAV_UI.layoutHint}</p>
            <div className="report-tst-body__groups report-rooms-container">

              <ReportPartDivider index={1} title="La tua identità emotiva" />

              {/* ── STANZA 01: OVERVIEW FULLSCREEN (Sintesi + Grafici) ── */}
              <section id="report-group-profilo-generale" className="report-room-section report-room-section--overview">
                <header className="report-room-header">
                  <span className="report-room-badge">0{roomMetaById['report-group-profilo-generale']?.stepLabel}</span>
                  <h2
                    id="report-group-profilo-generale-heading"
                    className="report-room-title"
                    tabIndex="-1"
                  >
                    {roomMetaById['report-group-profilo-generale']?.title || SINTESI_UI.title}
                  </h2>
                </header>
                <RoomRevealContent id="report-tst-sintesi" className="report-tst-section-anchor">
                  <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                    <SintesiCorrenti
                      correnti={correnti}
                      correnteDominante={profilo?.correnteDominante || ''}
                      focus={profilo?.focus || ''}
                      userName={utente?.nome || ''}
                      correnteColore={correnteColore}
                      famiglia={profilo?.famiglia || ''}
                      sintesiLead={sintesi?.lead}
                      sintesiKeyFacts={sintesi?.keyFacts}
                      sintesiLeadExtended={sintesi?.leadExtended}
                      sintesiParagrafi={sintesi?.paragrafi}
                      datiRadar={sintesi?.datiRadar}
                      totalScores={colorTotals}
                      sottocorrenti={sottocorrenti}
                      onOpenGlossary={openGlossary}
                      sottodisposizione={sottodisposizionePrevalente}
                      portato={portato}
                      stepPrefix="1"
                      globalProfileContract={globalProfileContract}
                      contentCards={profiloEmotivo?.contentCards}
                      rawRecord={rawRecord}
                    />
                  </Suspense>
                </RoomRevealContent>
              </section>

              <SectionDivider />

              {/* ── STANZA 02: IDENTITÀ EMOTIVA E NATURA ────────────────── */}
              <section id="stanza-identita" className="report-room-section report-room-section--identita">
                <header className="report-room-header">
                  <span className="report-room-badge">0{roomMetaById['stanza-identita']?.stepLabel}</span>
                  <h2 id="pe-section-title" className="report-room-title">
                    {roomMetaById['stanza-identita']?.title}
                  </h2>
                </header>
                <RoomRevealContent id="report-tst-famiglia" className="report-tst-section-anchor">
                  <ProfiloEmotivo
                    sezioni={profiloEmotivo?.sezioni || []}
                    famiglia={profilo?.famiglia || ''}
                    profilo={profilo}
                    accentColor={correnteColore}
                    stepPrefix="2"
                    contentCards={profiloEmotivo?.contentCards}
                    globalRanking={globalProfileContract?.ranking}
                    dominantFamilyKey={profiloEmotivo?.dominantFamilyKey}
                    onOpenAllFamilies={(event) => openModalita('tutte-famiglie', event)}
                    allFamiliesEntryBtnRef={tutteFamiglieEntryBtnRef}
                  />
                </RoomRevealContent>
              </section>

              <ReportPartDivider index={2} title="Come cambia nei diversi ambiti" />

              {/* ── STANZA 03: I QUATTRO RAPPORTI ───────────────────────── */}
              <section id="report-tst-rapporti" className="report-room-section report-room-section--rapporti">
                <header className="report-room-header">
                  <span className="report-room-badge">0{roomMetaById['report-tst-rapporti']?.stepLabel}</span>
                  <h2 className="report-room-title">{roomMetaById['report-tst-rapporti']?.title}</h2>
                </header>
                <div id="stanza-rapporti" ref={rapportiAnchorRef} className="report-tst-section-anchor">
                  <RoomRevealContent>
                    <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                      <QuattroRapporti
                        rapporti={rapporti}
                        coloriCorrenti={coloriCorrenti}
                        profilo={profilo}
                        sottocorrenti={sottocorrenti}
                        step="3.4"
                      />
                    </Suspense>
                  </RoomRevealContent>
                </div>
              </section>

              <SectionDivider />

              {/* ── STANZA 04: PORTATO ESPERIENZIALE E VITALITÀ ─────────── */}
              <section id="report-group-forza-correnti" className="report-room-section report-room-section--portato">
                <header className="report-room-header">
                  <span className="report-room-badge">0{roomMetaById['report-group-forza-correnti']?.stepLabel}</span>
                  <h2 className="report-room-title">{roomMetaById['report-group-forza-correnti']?.title}</h2>
                </header>
                <RoomRevealContent id="report-tst-portato" className="report-tst-section-anchor">
                  <SezionePortatoEsperienziale
                    portato={portato}
                    correnteColore={correnteColore}
                  />
                </RoomRevealContent>
                {SHOW_TRACCE_SECTION ? (
                  <>
                    <SectionDivider />
                    <TracceReport correnteColore={correnteColore} />
                  </>
                ) : null}
              </section>

              <SectionDivider />

              {/* ── STANZA 05: LESSICO EMOTIVO E PAROLE ─────────────────── */}
              <section id="report-group-educazione" className="report-room-section report-room-section--lessico">
                <header className="report-room-header">
                  <span className="report-room-badge">0{roomMetaById['report-group-educazione']?.stepLabel}</span>
                  <h2 className="report-room-title">{roomMetaById['report-group-educazione']?.title}</h2>
                </header>
                <RoomRevealContent id="report-tst-parole" className="report-tst-section-anchor">
                  <ParoleStatiAnimo
                    correnti={correntiNomeColore}
                    famiglieLessico={famiglieLessico}
                    correnteDominante={profilo?.correnteDominante || ''}
                    famiglia={profilo?.famiglia || ''}
                  />
                </RoomRevealContent>
              </section>

              {showEmotionalIntegrations ? (
                <>
                  <SectionDivider />

                  {/* ── STANZA 06: FAMIGLIE EMOTIVE IN RELAZIONE ────────────── */}
                  <section id="report-group-relazioni" className="report-room-section report-room-section--preview">
                    <header className="report-room-header">
                      <span className="report-room-badge">0{roomMetaById['report-group-relazioni']?.stepLabel}</span>
                      <h2 className="report-room-title">{roomMetaById['report-group-relazioni']?.title}</h2>
                    </header>
                    <RoomRevealContent>
                      <p className="report-room-preview-lead">{SECTION_INTROS.mappa.intro}</p>
                      <button
                        ref={famiglieEntryBtnRef}
                        type="button"
                        className="report-room-preview-cta"
                        onClick={(event) => openModalita('famiglie', event)}
                      >
                        Apri Famiglie in relazione
                      </button>
                    </RoomRevealContent>
                  </section>
                </>
              ) : null}

              <SectionDivider />

              <RoomRevealContent
                as="section"
                className="report-final-views"
                aria-label="Altre letture del report"
              >
                <button
                  ref={musiciansEntryBtnRef}
                  type="button"
                  className="report-final-view-card"
                  onClick={(event) => openModalita('for-musicians', event)}
                >
                  <span className="report-final-view-card__title">Lettura musicale</span>
                  <span className="report-final-view-card__subtitle">
                    Aree sonore e lettura musicale
                  </span>
                </button>
                {!isMobileViewport ? (
                  <button
                    ref={galassiaEntryBtnRef}
                    type="button"
                    className="report-final-view-card"
                    onClick={(event) => openModalita('galassia', event)}
                  >
                    <span className="report-final-view-card__title">Galassia</span>
                    <span className="report-final-view-card__subtitle">
                      Vista interattiva tridimensionale
                    </span>
                  </button>
                ) : null}
              </RoomRevealContent>
            </div>

            {/* Azioni di chiusura */}
            <div className="report-tst-actions">
              <button type="button" onClick={onNavigateArchive} className="report-tst-action-btn report-tst-action-btn--primary">
                {REPORT_SHELL_UI.archive}
              </button>
              <button type="button" onClick={startNewTest} className="report-tst-action-btn">
                Nuovo test
              </button>
              <button type="button" onClick={onNavigateHome} className="report-tst-action-btn report-tst-action-btn--ghost">
                {REPORT_SHELL_UI.home}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STANZA SEPARATA: FAMIGLIE IN RELAZIONE ──────────────────────────── */}
      {showEmotionalIntegrations ? (
        <div
          tabIndex="-1"
          className={`report-tst-dettaglio-layer${modalita === 'famiglie' ? ' is-open' : ''}`}
          data-report-mode="famiglie"
          role="dialog"
          aria-modal={modalita === 'famiglie'}
          aria-label="Le cinque famiglie emotive in relazione tra loro"
          aria-hidden={modalita !== 'famiglie'}
          inert={modalita !== 'famiglie' ? true : undefined}
        >
          <div className="report-tst-dettaglio-container">
            <header className="report-dettaglio-header">
              <button
                ref={famiglieBackButtonRef}
                type="button"
                className="report-dettaglio-back-btn"
                onClick={() => changeModalita('report')}
              >
                ← Torna al report principale
              </button>
              <p className="report-dettaglio-eyebrow">TST — Livello di Approfondimento</p>
              <h1 className="report-dettaglio-title">{FAMIGLIE_GROUP?.title}</h1>
              {SECTION_INTROS.mappa.intro ? (
                <p className="report-dettaglio-lead">{SECTION_INTROS.mappa.intro}</p>
              ) : null}
            </header>

            <div className="report-detail-navigation__workspace">
              <EmotionalIntegrations
                correnti={correnti}
                rawRecord={rawRecord}
                profilo={profilo}
              />
            </div>

            <footer className="report-dettaglio-footer">
              <button
                type="button"
                className="report-dettaglio-back-btn report-dettaglio-back-btn--bottom"
                onClick={() => changeModalita('report')}
              >
                ← Torna al report principale
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {/* ── STANZA SEPARATA: LE ALTRE FAMIGLIE DEL PROFILO ──────────────────── */}
      {allOtherFamilies.length > 0 ? (
        <div
          tabIndex="-1"
          className={`report-tst-dettaglio-layer${modalita === 'tutte-famiglie' ? ' is-open' : ''}`}
          data-report-mode="tutte-famiglie"
          role="dialog"
          aria-modal={modalita === 'tutte-famiglie'}
          aria-label={COMPOSIZIONE_UI.title}
          aria-hidden={modalita !== 'tutte-famiglie'}
          inert={modalita !== 'tutte-famiglie' ? true : undefined}
        >
          <div className="report-tst-dettaglio-container">
            <header className="report-dettaglio-header">
              <button
                ref={tutteFamiglieBackButtonRef}
                type="button"
                className="report-dettaglio-back-btn"
                onClick={() => changeModalita('report')}
              >
                ← Torna al report principale
              </button>
              <p className="report-dettaglio-eyebrow">TST — Livello di Approfondimento</p>
              <h1 className="report-dettaglio-title">{COMPOSIZIONE_UI.title}</h1>
              <p className="report-dettaglio-lead">{COMPOSIZIONE_UI.lead}</p>
            </header>

            <div className="report-detail-navigation__workspace">
              <FamilyBrowseCarousel
                families={allOtherFamilies}
                isActive={modalita === 'tutte-famiglie'}
              />
            </div>

            <footer className="report-dettaglio-footer">
              <button
                type="button"
                className="report-dettaglio-back-btn report-dettaglio-back-btn--bottom"
                onClick={() => changeModalita('report')}
              >
                ← Torna al report principale
              </button>
            </footer>
          </div>
        </div>
      ) : null}

      {/* ── STANZA SEPARATA: GALASSIA ──────────────────────────────────────── */}
      {galassiaEverOpened && !isMobileViewport ? (
        <div
          ref={galassiaLayerRef}
          tabIndex="-1"
          className={`report-tst-galassia-layer${modalita === 'galassia' ? ' is-open' : ''}`}
          data-report-mode="galassia"
          role="dialog"
          aria-modal={modalita === 'galassia'}
          aria-label={REPORT_SHELL_UI.galassiaAria}
          aria-hidden={modalita !== 'galassia'}
          inert={modalita !== 'galassia' ? true : undefined}
        >
          <div className="report-tst-galassia">
            <Suspense fallback={<DotsSpinner color={correnteColore} />}>
              <GalassiaView
                correntData={correntData}
                paroleEmerse={paroleEmerse}
                lessicoCorrenti={correnti}
                famiglieLessico={famiglieLessico}
                rapporti={rapporti}
                portato={portato}
                onOpenGlossary={openGlossary}
                lessicoAnalitico={lessicoAnalitico}
              />
            </Suspense>
          </div>
        </div>
      ) : null}

      {/* ── STANZA SEPARATA: MUSICIANS ─────────────────────────────────────── */}
      <div
        className={`report-tst-musicians-layer${modalita === 'for-musicians' ? ' is-open' : ''}`}
        data-report-mode="for-musicians"
        aria-label="For Musicians: lettura musicale del profilo e Aree sonore"
        aria-hidden={modalita !== 'for-musicians'}
        inert={modalita !== 'for-musicians' ? true : undefined}
      >
        <Suspense fallback={<DotsSpinner color={correnteColore} />}>
          <ForMusiciansView
            musicista={musicista}
            profilo={profilo}
            approfondimento={approfondimento}
            filtroMusicale={filtroMusicale}
            portato={portato}
            colorTotals={colorTotals}
            accentColor={correnteColore}
            onClose={() => changeModalita('report')}
            backButtonRef={musiciansBackButtonRef}
          />
        </Suspense>
      </div>
    </div>
  )
}
