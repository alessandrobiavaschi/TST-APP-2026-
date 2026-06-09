import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import HeroScreen from './HeroScreen'
import NavbarTST from './NavbarTST'
import ReportSectionController from './ReportSectionController'
import ReportSectionGroup from './ReportSectionGroup'
import {
  REPORT_GROUPS,
  SECTION_TO_GROUP,
  getDefaultGroupOpenState,
  getVisibleReportSections,
} from './reportSectionsConfig'
import { SHOW_TRACCE_SECTION, shouldShowEmotionalIntegrations } from './reportFeatureFlags.js'
import { scrollToReportSection } from './reportSectionNavUtils'
import ReportHelpModal from './ReportHelpModal'
import ReportGlossaryDrawer from './ReportGlossaryDrawer'
import SintesiCorrenti from './SintesiCorrenti'
import DialogoCorrenti from './DialogoCorrenti'
import ProfiloEmotivo from './ProfiloEmotivo'
import { PROFILO_CHAPTER_EVENT } from './profiloChapterNav.js'
import ApprofondimentoSezioni from './ApprofondimentoSezioni'
import TracceReport from './TracceReport'
import SezionePortatoEsperienziale from './SezionePortatoEsperienziale'
import ParoleStatiAnimo from './ParoleStatiAnimo'
import EmotionalIntegrations from './EmotionalIntegrations.jsx'
import SectionDivider from './SectionDivider'
import FioreCorrenti from './FioreCorrenti'
import { buildCorrentDataFromRecord } from '../../utils/galassiaData.js'
import { REPORT_NAV_UI, REPORT_SHELL_UI } from './reportUiCopy.js'
import '../../styles/report-tst.css'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

// PERFORMANCE: componenti pesanti caricati on-demand.
// - GalassiaView: importata solo quando si attiva "Galassia" la prima volta.
// - QuattroRapporti: porta con sé recharts (bundle pesante).
const GalassiaView = lazy(() => import('./GalassiaView'))
const QuattroRapporti = lazy(() => import('./QuattroRapporti'))

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
  return window.location.hash === '#galassia' ? 'galassia' : 'report'
}

/**
 * <ReportTST /> — ROOT della nuova esperienza report (post-CONTEXT).
 *
 * Evoluzione di `ReportShell`: orchestra hero, navbar, modalità Report/Galassia
 * (sincronizzate con l'hash dell'URL), modal "Come leggere", loader full-screen
 * e i componenti dettagliati data-driven da `reportData`.
 *
 * Tutti i dati arrivano da `reportData` (vedi utils/buildReportData.js): qui non
 * si esegue alcun nuovo scoring.
 *
 * Props:
 *   - reportData: struttura unica (vedi buildReportData)
 *   - onDownload, onNavigateHome, onNavigateArchive: callback azioni
 */
export default function ReportShell({
  reportData,
  onDownload,
  onNavigateHome,
  onNavigateArchive,
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
  const [groupOpen, setGroupOpen] = useState(getDefaultGroupOpenState)
  const heroRef = useRef(null)
  const reduceMotion = useReducedMotion()

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
    statiAnimo = [],
    paroleEmerse = [],
    famiglieLessico = {},
    filtroMusicale = {},
    sintesi = {},
    coloriCorrenti = {},
    colorTotals = {},
    approfondimento = { sezioniData: [], sezioniTest: null },
    rawRecord = {},
  } = hasReportData ? reportData : {}

  const correnteColore = profilo?.colore || '#4ade80'
  const visibleReportSections = useMemo(
    () =>
      getVisibleReportSections(profilo).filter(
        (section) => section.id !== 'report-tst-filtro-musicale' || filtroMusicale?.hasData,
      ),
    [profilo, filtroMusicale],
  )
  const showEmotionalIntegrations = shouldShowEmotionalIntegrations(profilo)

  // Dati Galassia: costruiti dai punteggi reali (no scoring nuovo). Memoizzati.
  const correntData = useMemo(
    () => buildCorrentDataFromRecord(rawRecord || {}),
    [rawRecord],
  )

  // Liste leggere per i componenti (nome/colore/peso).
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

  // Loader full-screen: si chiude appena la prima paint è pronta.
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 450)
    return () => window.clearTimeout(t)
  }, [])

  // Sincronizzazione modalità ↔ hash dell'URL (deep-link a #galassia).
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
    if (modalita !== 'galassia') return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [modalita])

  const handleStartReport = () => {
    const target = document.getElementById('report-tst-sintesi')
    const scrollBehavior = reduceMotion ? 'auto' : 'smooth'
    if (target) target.scrollIntoView({ behavior: scrollBehavior, block: 'start' })
    else window.scrollTo({ top: window.innerHeight, behavior: scrollBehavior })
  }

  const toggleGroup = useCallback((groupId) => {
    setGroupOpen((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }, [])

  const ensureGroupOpen = useCallback((groupId) => {
    setGroupOpen((prev) => (prev[groupId] ? prev : { ...prev, [groupId]: true }))
  }, [])

  const handleNavigateSection = useCallback(
    (sectionId, { reduceMotion: motionPref, onScrollComplete } = {}) => {
      const groupId = SECTION_TO_GROUP[sectionId]
      const needsOpen = Boolean(groupId && !groupOpen[groupId])
      if (needsOpen) {
        setGroupOpen((prev) => ({ ...prev, [groupId]: true }))
      }
      if (sectionId.startsWith('report-chapter-')) {
        window.dispatchEvent(
          new CustomEvent(PROFILO_CHAPTER_EVENT, {
            detail: sectionId.replace('report-chapter-', ''),
          }),
        )
      }
      const doScroll = () => {
        scrollToReportSection(sectionId, {
          reduceMotion: motionPref ?? reduceMotion,
          onLockChange: (locked) => {
            if (!locked) onScrollComplete?.()
          },
        })
      }
      if (needsOpen) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(doScroll)
        })
      } else {
        doScroll()
      }
    },
    [groupOpen, reduceMotion],
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

      <NavbarTST
        heroRef={heroRef}
        forceVisible={modalita === 'galassia'}
        modalita={modalita}
        onModalitaChange={changeModalita}
        userName={utente?.nome || ''}
        correnteColore={correnteColore}
        correnteDominante={profilo?.correnteDominante || ''}
        onDownload={onDownload}
        onOpenHelp={() => setHelpOpen(true)}
      />

      <ReportHelpModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        accentColor={correnteColore}
        onOpenGlossary={() => {
          setHelpOpen(false)
          openGlossary()
        }}
      />

      <ReportGlossaryDrawer
        open={glossaryOpen}
        onClose={closeGlossary}
        accentColor={correnteColore}
        initialFocusId={glossaryFocusId}
      />

      <main
        className={`report-tst-report${modalita === 'galassia' ? ' report-tst-report--covered' : ''}`}
        aria-label={REPORT_SHELL_UI.reportAria}
        aria-hidden={modalita === 'galassia'}
        inert={modalita === 'galassia' ? true : undefined}
      >
            <div ref={heroRef} className="report-tst-hero-wrap">
              <HeroScreen
                naturaName={profilo?.natura}
                disposizione={profilo?.disposizione}
                fraseChiave={profilo?.fraseChiave}
                correnteColore={correnteColore}
                correnteColoreChiara={profilo?.coloreChiara}
                correnteColoreMedia={profilo?.coloreMedia}
                famigliaColore={profilo?.famiglia}
                correnti={correntiLite}
                onStartReport={handleStartReport}
                onStartGalassia={() => changeModalita('galassia')}
              />
            </div>

            <div className="report-tst-layout">
              <ReportSectionController
                accentColor={correnteColore}
                sections={visibleReportSections}
                groupOpen={groupOpen}
                onToggleGroup={toggleGroup}
                onEnsureGroupOpen={ensureGroupOpen}
                onNavigate={handleNavigateSection}
              />

              <div className="report-tst-layout__main">
                <p className="report-tst-layout-hint">{REPORT_NAV_UI.layoutHint}</p>
                <div className="report-tst-body__groups">
                {REPORT_GROUPS.map((group) => (
                  <ReportSectionGroup
                    key={group.id}
                    id={group.id}
                    title={group.title}
                    subtitle={group.subtitle}
                    intro={group.intro}
                    isOpen={Boolean(groupOpen[group.id])}
                    onToggle={() => toggleGroup(group.id)}
                  >
                    {group.id === 'report-group-identita' ? (
                      <>
                        <div id="report-tst-sintesi" className="report-tst-section-anchor">
                          <SintesiCorrenti
                            correnti={correnti}
                            correnteDominante={profilo?.correnteDominante || ''}
                            focus={profilo?.focus || ''}
                            userName={utente?.nome || ''}
                            correnteColore={correnteColore}
                            famiglia={profilo?.famiglia || ''}
                            sintesiLead={sintesi?.lead}
                            sintesiParagrafi={sintesi?.paragrafi}
                            datiRadar={sintesi?.datiRadar}
                            sottocorrenti={sottocorrenti}
                            onOpenGlossary={openGlossary}
                            sottodisposizione={rawRecord?.Sottodisposizione_Prevalente || ''}
                            portato={portato}
                          />
                        </div>
                        <div id="report-tst-dialogo" className="report-tst-section-anchor">
                          <DialogoCorrenti
                            colorTotals={colorTotals}
                            accentColor={correnteColore}
                          />
                        </div>
                      </>
                    ) : null}

                    {group.id === 'report-group-profilo' ? (
                      <div id="report-tst-profilo" className="report-tst-section-anchor">
                        <ProfiloEmotivo
                          sezioni={profiloEmotivo?.sezioni || []}
                          famiglia={profilo?.famiglia || ''}
                          profilo={profilo}
                          accentColor={correnteColore}
                        />
                      </div>
                    ) : null}

                    {group.id === 'report-group-rapporti' ? (
                      <>
                        <div id="report-tst-rapporti" className="report-tst-section-anchor">
                          <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                            <QuattroRapporti
                              rapporti={rapporti}
                              coloriCorrenti={coloriCorrenti}
                            />
                          </Suspense>
                        </div>
                        <SectionDivider />
                        <SezionePortatoEsperienziale
                          portato={portato}
                          correnteColore={correnteColore}
                        />
                        {showEmotionalIntegrations ? (
                          <>
                            <SectionDivider />
                            <EmotionalIntegrations
                              correnti={correnti}
                              rawRecord={rawRecord}
                              profilo={profilo}
                              onOpenGalassia={() => changeModalita('galassia')}
                            />
                          </>
                        ) : null}
                      </>
                    ) : null}

                    {group.id === 'report-group-lessico' ? (
                      <>
                        {SHOW_TRACCE_SECTION ? (
                          <>
                            <TracceReport correnteColore={correnteColore} />
                            <SectionDivider />
                          </>
                        ) : null}
                        <div id="report-tst-parole" className="report-tst-section-anchor">
                          <ParoleStatiAnimo
                            statiAnimo={statiAnimo}
                            paroleEmerse={paroleEmerse}
                            correnti={correntiNomeColore}
                            famiglieLessico={famiglieLessico}
                            correnteDominante={profilo?.correnteDominante || ''}
                          />
                        </div>
                      </>
                    ) : null}

                    {group.id === 'report-group-approfondimento' ? (
                      <div id="report-tst-approfondimento" className="report-tst-section-anchor">
                        <ApprofondimentoSezioni
                          sezioniData={approfondimento?.sezioniData}
                          sezioniTest={approfondimento?.sezioniTest}
                          filtroMusicale={filtroMusicale}
                        />
                      </div>
                    ) : null}
                  </ReportSectionGroup>
                ))}
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

      {galassiaEverOpened ? (
        <div
          className={`report-tst-galassia-layer${modalita === 'galassia' ? ' is-open' : ''}`}
          role="dialog"
          aria-modal={modalita === 'galassia'}
          aria-label={REPORT_SHELL_UI.galassiaAria}
          aria-hidden={modalita !== 'galassia'}
        >
          <div className="report-tst-galassia">
            <Suspense fallback={<DotsSpinner color={correnteColore} />}>
              <GalassiaView
                correntData={correntData}
                paroleEmerse={paroleEmerse}
                rapporti={rapporti}
                onOpenGlossary={openGlossary}
              />
            </Suspense>
          </div>
        </div>
      ) : null}
    </div>
  )
}
