import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import VideoBackground0311 from '../VideoBackground0311.jsx'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import HeroScreen from './HeroScreen'
import NavbarTST from './NavbarTST'
import ReportSectionController from './ReportSectionController'
import ReportSectionGroup from './ReportSectionGroup'
import ReportDetailTabs from './ReportDetailTabs'
import {
  getDefaultGroupOpenState,
  getReportGroups,
  SECTION_TO_GROUP,
} from './reportSectionsConfig'
import { SHOW_TRACCE_SECTION, shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'
import { resolveReportScrollTarget, scrollToReportSection } from './reportSectionNavUtils'
import ReportHelpModal from './ReportHelpModal'
import ReportGlossaryDrawer from './ReportGlossaryDrawer'
import ProfiloEmotivo from './ProfiloEmotivo'
import TracceReport from './TracceReport'
import SezionePortatoEsperienziale from './SezionePortatoEsperienziale'
import ParoleStatiAnimo from './ParoleStatiAnimo'
import EmotionalIntegrations from './EmotionalIntegrations.jsx'
import SectionDivider from './SectionDivider'
import FioreCorrenti from './FioreCorrenti'
import { buildCorrentDataFromRecord } from '../../utils/galassiaData.js'
import { buildLessicoAnaliticoViewModel } from '../../utils/galassiaLessicoViewModel.js'
import { REPORT_NAV_UI, REPORT_SHELL_UI } from './reportUiCopy.js'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

// PERFORMANCE: componenti pesanti caricati on-demand.
// - GalassiaView: importata solo quando si attiva "Galassia" la prima volta.
// - QuattroRapporti: porta con sé recharts (bundle pesante).
const GalassiaView = lazy(() => import('./GalassiaView'))
const ForMusiciansView = lazy(() => import('./ForMusiciansView.jsx'))
const QuattroRapporti = lazy(() => import('./QuattroRapporti'))
const SintesiCorrenti = lazy(() => import('./SintesiCorrenti'))
const ApprofondimentoSezioni = lazy(() => import('./ApprofondimentoSezioni'))

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

/* ── Hash sync helpers ──────────────────────────────────────────────── */
function readModalitaFromHash() {
  if (typeof window === 'undefined') return 'report'
  if (window.location.hash === '#galassia') return 'galassia'
  if (window.location.hash === '#for-musicians') return 'for-musicians'
  if (window.location.hash === '#dettaglio') return 'dettaglio'
  return 'report'
}

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
  const [modalita, setModalita] = useState(readModalitaFromHash)
  /** Monta Galassia al primo accesso e la tiene in DOM (overlay) per preservare stato e scroll del report. */
  const [galassiaEverOpened, setGalassiaEverOpened] = useState(
    () => readModalitaFromHash() === 'galassia',
  )
  const [helpOpen, setHelpOpen] = useState(false)
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [glossaryFocusId, setGlossaryFocusId] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [scientificScopeOpen, setScientificScopeOpen] = useState(true)
  const [groupOpen, setGroupOpen] = useState(() => ({
    ...getDefaultGroupOpenState(),
    'report-group-forza-correnti': true,
  }))
  const [rapportiSlideActive, setRapportiSlideActive] = useState(false)
  const heroRef = useRef(null)
  const progressBarRef = useRef(null)
  const rapportiAnchorRef = useRef(null)

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

  const { scrollYProgress: rapportiEnter } = useScroll({
    target: rapportiAnchorRef,
    offset: ['start 80%', 'start 35%'],
  })
  const { scrollYProgress: rapportiExit } = useScroll({
    target: rapportiAnchorRef,
    offset: ['end 80%', 'end 35%'],
  })
  const lightProgress = useTransform([rapportiEnter, rapportiExit], ([enter, exit]) =>
    Math.min(1, Math.max(0, enter - exit)),
  )

  const contentOpacity = useTransform(lightProgress, [0.7, 0.95], [0, 1])
  const contentY = useTransform(lightProgress, [0.7, 0.95], [16, 0])

  const openGlossary = useCallback((focusId = null) => {
    setGlossaryFocusId(focusId)
    setGlossaryOpen(true)
  }, [])

  const closeGlossary = useCallback(() => {
    setGlossaryOpen(false)
    setGlossaryFocusId(null)
  }, [])

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
  } = hasReportData ? reportData : {}

  const correnteColore = profilo?.colore || '#4ade80'
  const isAlternateMode = modalita !== 'report'
  const showEmotionalIntegrations = shouldShowEmotionalIntegrations(profilo)
  const reportGroups = useMemo(() => getReportGroups(profilo), [profilo])
  const detailGroups = useMemo(
    () => reportGroups.filter(
      (group) => group.id !== 'report-group-hero'
        && group.id !== 'report-group-profilo-generale'
        && group.id !== 'report-tst-rapporti',
    ),
    [reportGroups],
  )

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
    if (requestedMode === 'galassia') {
      setGalassiaEverOpened(true)
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

  const changeModalita = (next) => {
    if (next === modalita) return
    if (next === 'galassia') setGalassiaEverOpened(true)
    setModalita(next)
    try {
      const url = `${window.location.pathname}${window.location.search}#${next}`
      window.history.replaceState(null, '', next === 'report' ? window.location.pathname + window.location.search : url)
    } catch {
      window.location.hash = next === 'report' ? '' : next
    }
  }

  useEffect(() => {
    if (!isAlternateMode) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isAlternateMode])

  const activateDetailTab = useCallback((groupId) => {
    setGroupOpen((prev) => {
      const next = { ...prev }
      detailGroups.forEach((group) => {
        next[group.id] = group.id === groupId
      })
      return next
    })
  }, [detailGroups])

  const activeDetailGroupId = useMemo(
    () => detailGroups.find((group) => groupOpen[group.id])?.id ?? detailGroups[0]?.id,
    [detailGroups, groupOpen],
  )

  const handleNavigateSection = useCallback(
    (sectionId, { onScrollComplete } = {}) => {
      const groupId = SECTION_TO_GROUP[sectionId]
      const isDetailGroup = Boolean(groupId) && detailGroups.some((group) => group.id === groupId)
      const wasOpen = groupId ? Boolean(groupOpen[groupId]) : true
      const nextGroupOpen = !groupId
        ? groupOpen
        : isDetailGroup
          ? {
              ...groupOpen,
              ...Object.fromEntries(detailGroups.map((group) => [group.id, group.id === groupId])),
            }
          : { ...groupOpen, [groupId]: true }

      if (groupId && !wasOpen) {
        if (isDetailGroup) {
          activateDetailTab(groupId)
        } else {
          setGroupOpen((prev) => ({ ...prev, [groupId]: true }))
        }
      }

      const scroll = () => {
        const targetId = resolveReportScrollTarget(sectionId, { groupOpen: nextGroupOpen })
        scrollToReportSection(targetId, {
          reduceMotion: true,
          onLockChange: (locked) => {
            if (!locked) onScrollComplete?.()
          },
        })
      }

      if (groupId && !wasOpen) {
        requestAnimationFrame(scroll)
      } else {
        scroll()
      }
    },
    [groupOpen, detailGroups, activateDetailTab],
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
      style={{ '--corrente-primaria': correnteColore }}
      lang="it"
    >
      <div className="report-tst-scroll-bg" aria-hidden="true" />
      <motion.div className="report-tst-cosmic-bg" aria-hidden="true" />
      <motion.div className="report-page-wrapper__stars" aria-hidden="true" />
      <VideoBackground0311 showOverlay className="report-page-wrapper__video" />
      <motion.div className="report-page-wrapper__vignette" aria-hidden="true" />
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

      <main
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
            naturaName={profilo?.natura}
            disposizione={profilo?.disposizione}
            userName={utente?.nome || ''}
            fraseChiave={profilo?.fraseChiave}
            correnteColore={correnteColore}
            correnteColoreChiara={profilo?.coloreChiara}
            correnteColoreMedia={profilo?.coloreMedia}
            famigliaColore={profilo?.famiglia}
            correnti={correntiLite}
            rawRecord={rawRecord}
            portato={portato}
            onOpenGlossary={openGlossary}
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

              {/* ── STANZA 01: OVERVIEW FULLSCREEN (Sintesi + Grafici) ── */}
              <section id="stanza-overview" className="report-room-section report-room-section--overview">
                <header className="report-room-header">
                  <span className="report-room-badge">Stanza 01</span>
                  <h2 className="report-room-title">Overview dei Risultati</h2>
                </header>
                <div id="report-tst-sintesi" className="report-tst-section-anchor">
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
                    />
                  </Suspense>
                </div>
              </section>

              <SectionDivider />

              {/* ── STANZA 02: IDENTITÀ EMOTIVA E NATURA ────────────────── */}
              <section id="stanza-identita" className="report-room-section report-room-section--identita">
                <header className="report-room-header">
                  <span className="report-room-badge">Stanza 02</span>
                  <h2 className="report-room-title">Identità Emotiva e Natura</h2>
                </header>
                <div id="report-tst-famiglia" className="report-tst-section-anchor">
                  <ProfiloEmotivo
                    sezioni={profiloEmotivo?.sezioni || []}
                    famiglia={profilo?.famiglia || ''}
                    profilo={profilo}
                    accentColor={correnteColore}
                    stepPrefix="2"
                  />
                </div>
              </section>

              <SectionDivider />

              {/* ── STANZA 03: I QUATTRO RAPPORTI ───────────────────────── */}
              <section id="stanza-rapporti" className="report-room-section report-room-section--rapporti">
                <header className="report-room-header">
                  <span className="report-room-badge">Stanza 03</span>
                  <h2 className="report-room-title">I Quattro Rapporti</h2>
                </header>
                <motion.div
                  id="report-tst-rapporti"
                  ref={rapportiAnchorRef}
                  className="report-tst-section-anchor"
                  style={{ opacity: contentOpacity, y: contentY }}
                >
                  <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                    <QuattroRapporti
                      rapporti={rapporti}
                      coloriCorrenti={coloriCorrenti}
                      profilo={profilo}
                      sottocorrenti={sottocorrenti}
                      step="3"
                    />
                  </Suspense>
                </motion.div>
              </section>

              <SectionDivider />

              {/* ── STANZA 04: PORTATO ESPERIENZIALE E VITALITÀ ─────────── */}
              <section id="stanza-portato" className="report-room-section report-room-section--portato">
                <header className="report-room-header">
                  <span className="report-room-badge">Stanza 04</span>
                  <h2 className="report-room-title">Portato Esperienziale e Vitalità</h2>
                </header>
                <div id="report-tst-portato" className="report-tst-section-anchor">
                  <SezionePortatoEsperienziale
                    portato={portato}
                    correnteColore={correnteColore}
                  />
                </div>
                {SHOW_TRACCE_SECTION ? (
                  <>
                    <SectionDivider />
                    <TracceReport correnteColore={correnteColore} />
                  </>
                ) : null}
              </section>

              <SectionDivider />

              {/* ── STANZA 05: LESSICO EMOTIVO E PAROLE ─────────────────── */}
              <section id="stanza-lessico" className="report-room-section report-room-section--lessico">
                <header className="report-room-header">
                  <span className="report-room-badge">Stanza 05</span>
                  <h2 className="report-room-title">Lessico Emotivo e Parole</h2>
                </header>
                <div id="report-tst-parole" className="report-tst-section-anchor">
                  <ParoleStatiAnimo
                    correnti={correntiNomeColore}
                    famiglieLessico={famiglieLessico}
                    correnteDominante={profilo?.correnteDominante || ''}
                    famiglia={profilo?.famiglia || ''}
                  />
                </div>
              </section>

              <SectionDivider />

              {/* ── STANZA SEPARATA CTA: ENTRA NEL DETTAGLIO ────────────── */}
              <section className="report-room-section report-room-section--dettaglio-cta" aria-labelledby="report-dettaglio-cta-title">
                <div className="report-dettaglio-cta-card">
                  <span className="report-room-badge">Stanza Separata</span>
                  <h2 id="report-dettaglio-cta-title" className="report-dettaglio-cta-title">
                    Stanza del Dettaglio Analitico
                  </h2>
                  <p className="report-dettaglio-cta-lead">
                    Entra nello spazio di approfondimento completo per consultare tutti i dati analitici, la forza delle correnti e le matrici relazionali.
                  </p>
                  <button
                    type="button"
                    className="report-dettaglio-cta-button"
                    onClick={() => changeModalita('dettaglio')}
                  >
                    ENTRA NEL DETTAGLIO
                  </button>
                </div>
              </section>

              <section className="report-final-views" aria-label="Altre letture del report">
                <button
                  type="button"
                  className="report-final-view-card"
                  onClick={() => changeModalita('dettaglio')}
                >
                  <span className="report-final-view-card__title">Dettaglio</span>
                  <span className="report-final-view-card__subtitle">
                    Stanza separata dell'approfondimento analitico
                  </span>
                </button>
                <button
                  type="button"
                  className="report-final-view-card"
                  onClick={() => changeModalita('for-musicians')}
                >
                  <span className="report-final-view-card__title">Musicians</span>
                  <span className="report-final-view-card__subtitle">
                    Stanza separata per Aree sonore e lettura musicale
                  </span>
                </button>
                <button
                  type="button"
                  className="report-final-view-card"
                  onClick={() => changeModalita('galassia')}
                >
                  <span className="report-final-view-card__title">Galassia</span>
                  <span className="report-final-view-card__subtitle">
                    Stanza interattiva tridimensionale
                  </span>
                </button>
              </section>
            </div>

            {/* Azioni di chiusura */}
            <div className="report-tst-actions">
              <button type="button" onClick={onNavigateHome} className="report-tst-action-btn">
                {REPORT_SHELL_UI.home}
              </button>
              <button type="button" onClick={onNavigateArchive} className="report-tst-action-btn">
                {REPORT_SHELL_UI.archive}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── STANZA SEPARATA: IL DETTAGLIO ─────────────────────────────────── */}
      <div
        className={`report-tst-dettaglio-layer${modalita === 'dettaglio' ? ' is-open' : ''}`}
        role="dialog"
        aria-modal={modalita === 'dettaglio'}
        aria-label="Stanza del Dettaglio Analitico"
        aria-hidden={modalita !== 'dettaglio'}
        inert={modalita !== 'dettaglio' ? true : undefined}
      >
        <div className="report-tst-dettaglio-container">
          <header className="report-dettaglio-header">
            <button
              type="button"
              className="report-dettaglio-back-btn"
              onClick={() => changeModalita('report')}
            >
              ← Torna al report principale
            </button>
            <p className="report-dettaglio-eyebrow">TST — Livello di Approfondimento</p>
            <h1 className="report-dettaglio-title">Stanza del Dettaglio</h1>
            <p className="report-dettaglio-lead">
              Qui trovi la consultazione dettagliata di ciascuna area analitica del test.
            </p>
          </header>

          <ReportDetailTabs
            groups={detailGroups}
            activeId={activeDetailGroupId}
            onSelect={activateDetailTab}
          />

          <div className="report-detail-navigation__workspace">
            {detailGroups.map((group) => {
              if (group.id !== activeDetailGroupId) return null
              return (
                <ReportSectionGroup
                  key={group.id}
                  id={group.id}
                  title={group.title}
                  intro={group.intro}
                >
                  {group.id === 'report-group-forza-correnti' ? (
                    <>
                      <div id="report-tst-portato-detail" className="report-tst-section-anchor">
                        <SezionePortatoEsperienziale
                          portato={portato}
                          correnteColore={correnteColore}
                        />
                      </div>
                      {SHOW_TRACCE_SECTION ? (
                        <>
                          <SectionDivider />
                          <TracceReport correnteColore={correnteColore} />
                        </>
                      ) : null}
                    </>
                  ) : null}

                  {group.id === 'report-group-educazione' ? (
                    <div id="report-tst-parole-detail" className="report-tst-section-anchor">
                      <ParoleStatiAnimo
                        correnti={correntiNomeColore}
                        famiglieLessico={famiglieLessico}
                        correnteDominante={profilo?.correnteDominante || ''}
                        famiglia={profilo?.famiglia || ''}
                      />
                    </div>
                  ) : null}

                  {group.id === 'report-group-approfondimento' ? (
                    <div id="report-tst-approfondimento-detail" className="report-tst-section-anchor">
                      <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                        <ApprofondimentoSezioni
                          sezioniData={approfondimento?.sezioniData}
                          sezioniTest={approfondimento?.sezioniTest}
                          filtroMusicale={filtroMusicale}
                          correnteColore={correnteColore}
                        />
                      </Suspense>
                    </div>
                  ) : null}

                  {group.id === 'report-group-relazioni' && showEmotionalIntegrations ? (
                    <EmotionalIntegrations
                      correnti={correnti}
                      rawRecord={rawRecord}
                      profilo={profilo}
                      onOpenGalassia={() => changeModalita('galassia')}
                    />
                  ) : null}
                </ReportSectionGroup>
              )
            })}
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

      {/* ── STANZA SEPARATA: GALASSIA ──────────────────────────────────────── */}
      {galassiaEverOpened ? (
        <div
          className={`report-tst-galassia-layer${modalita === 'galassia' ? ' is-open' : ''}`}
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
          />
        </Suspense>
      </div>
    </div>
  )
}

