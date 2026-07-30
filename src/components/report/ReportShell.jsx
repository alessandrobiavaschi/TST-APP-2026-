import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import VideoBackground0311 from '../VideoBackground0311.jsx'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import HeroScreen from './HeroScreen'
import NavbarTST from './NavbarTST'
import ReportSectionController from './ReportSectionController'
import ReportSectionGroup from './ReportSectionGroup'
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
import DialogoCorrenti from './DialogoCorrenti.jsx'
import SectionDivider from './SectionDivider'
import FioreCorrenti from './FioreCorrenti'
import { buildCorrentDataFromRecord } from '../../utils/galassiaData.js'
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
  return 'report'
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
  const [groupOpen, setGroupOpen] = useState(getDefaultGroupOpenState)
  const heroRef = useRef(null)
  const progressBarRef = useRef(null)

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

  // Ogni apertura report: hero in cima. Rispetta pero il deep-link #galassia.
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

  // Loader full-screen: si chiude appena la prima paint è pronta.
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 450)
    return () => window.clearTimeout(t)
  }, [])

  // Dopo il loader il layout può spostare lo scroll: riallinea la hero.
  useEffect(() => {
    if (!loaded || !reportIdentityKey) return
    resetReportViewport()
  }, [loaded, reportIdentityKey, resetReportViewport])

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
    if (!isAlternateMode) return undefined
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isAlternateMode])

  const toggleDetailGroup = useCallback((groupId) => {
    setGroupOpen((prev) => {
      const next = { ...prev }
      const shouldOpen = !prev[groupId]

      detailGroups.forEach((group) => {
        next[group.id] = shouldOpen && group.id === groupId
      })

      return next
    })
  }, [detailGroups])

  const handleNavigateSection = useCallback(
    (sectionId, { onScrollComplete } = {}) => {
      const groupId = SECTION_TO_GROUP[sectionId]
      const nextGroupOpen = groupId ? { ...groupOpen, [groupId]: true } : groupOpen
      if (groupId && !groupOpen[groupId]) {
        setGroupOpen((prev) => ({ ...prev, [groupId]: true }))
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

      if (groupId && !groupOpen[groupId]) {
        requestAnimationFrame(scroll)
      } else {
        scroll()
      }
    },
    [groupOpen],
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
      <div className="report-tst-cosmic-bg" aria-hidden="true" />
      <div className="report-page-wrapper__stars" aria-hidden="true" />
      <VideoBackground0311 showOverlay className="report-page-wrapper__video" />
      <div className="report-page-wrapper__vignette" aria-hidden="true" />
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
            <div
              id="report-hero"
              ref={heroRef}
              className="report-tst-hero-wrap"
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
              className="report-tst-layout"
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
                <div className="report-tst-body__groups">

                  {/* ── Risultati del test — sezione sempre aperta ────────── */}
                  <section id="report-group-profilo-generale" className="report-section-open">
                    <h2 className="report-section-open__title">Risultati del test</h2>
                    <div className="report-section-open__inner">
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
                            sottodisposizione={rawRecord?.Sottodisposizione_Prevalente || ''}
                            portato={portato}
                            stepPrefix="1"
                          />
                        </Suspense>
                      </div>
                      <SectionDivider />
                      <div id="report-tst-famiglia" className="report-tst-section-anchor">
                        <ProfiloEmotivo
                          sezioni={profiloEmotivo?.sezioni || []}
                          famiglia={profilo?.famiglia || ''}
                          profilo={profilo}
                          accentColor={correnteColore}
                          stepPrefix="1"
                        />
                      </div>
                      <SectionDivider />
                      <div id="report-tst-rapporti" className="report-tst-section-anchor">
                        <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                          <QuattroRapporti
                            rapporti={rapporti}
                            coloriCorrenti={coloriCorrenti}
                            profilo={profilo}
                            step="1.4"
                          />
                        </Suspense>
                      </div>
                      <SectionDivider />
                      <div id="report-tst-dialogo" className="report-tst-section-anchor">
                        <DialogoCorrenti
                          colorTotals={coloriCorrenti}
                          accentColor={correnteColore}
                          stepPrefix="1"
                          step="1.6"
                        />
                      </div>
                    </div>
                  </section>

                  {/* ── Indice degli approfondimenti finali ───────────────── */}
                  <section className="report-detail-navigation" aria-labelledby="report-detail-navigation-title">
                    <header className="report-detail-navigation__header">
                      <p className="report-detail-navigation__eyebrow">Approfondisci</p>
                      <h2 id="report-detail-navigation-title" className="report-identity-detail-title">
                        Il dettaglio della tua identità emotiva
                      </h2>
                      <p className="report-detail-navigation__lead">
                        Scegli un capitolo per approfondire le correnti, il lessico emotivo o il rapporto con le aree sonore del test. Si apre un capitolo alla volta.
                      </p>
                    </header>

                    <div className="report-detail-navigation__grid">
                      {detailGroups.map((group, idx) => (
                    <ReportSectionGroup
                      key={group.id}
                      id={group.id}
                      title={group.title}
                      intro={group.intro}
                      stepLabel={String(idx + 1)}
                      isOpen={Boolean(groupOpen[group.id])}
                      onToggle={() => toggleDetailGroup(group.id)}
                    >
                      {group.id === 'report-group-forza-correnti' ? (
                        <>
                          <div id="report-tst-portato" className="report-tst-section-anchor">
                            <SezionePortatoEsperienziale
                              portato={portato}
                              correnteColore={correnteColore}
                              step={String(idx + 1)}
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
                        <div id="report-tst-parole" className="report-tst-section-anchor">
                          <ParoleStatiAnimo
                            correnti={correntiNomeColore}
                            famiglieLessico={famiglieLessico}
                            correnteDominante={profilo?.correnteDominante || ''}
                            famiglia={profilo?.famiglia || ''}
                            step={String(idx + 1)}
                          />
                        </div>
                      ) : null}

                      {group.id === 'report-group-approfondimento' ? (
                        <div id="report-tst-approfondimento" className="report-tst-section-anchor">
                          <Suspense fallback={<DotsSpinner color={correnteColore} />}>
                            <ApprofondimentoSezioni
                              sezioniData={approfondimento?.sezioniData}
                              sezioniTest={approfondimento?.sezioniTest}
                              filtroMusicale={filtroMusicale}
                              correnteColore={correnteColore}
                              step={String(idx + 1)}
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
                          step={String(idx + 1)}
                        />
                      ) : null}
                        </ReportSectionGroup>
                      ))}
                    </div>
                  </section>

                  <section className="report-final-views" aria-label="Altre letture del report">
                    <button
                      type="button"
                      className="report-final-view-card"
                      onClick={() => changeModalita('galassia')}
                    >
                      <span className="report-final-view-card__title">Galassia</span>
                      <span className="report-final-view-card__subtitle">
                        Lettura interattiva del report
                      </span>
                    </button>
                    <button
                      type="button"
                      className="report-final-view-card"
                      onClick={() => changeModalita('for-musicians')}
                    >
                      <span className="report-final-view-card__title">For Musicians</span>
                      <span className="report-final-view-card__subtitle">
                        Approfondisci il tuo profilo da un punto di vista musicale
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
              />
            </Suspense>
          </div>
        </div>
      ) : null}

      <div
        className={`report-tst-musicians-layer${modalita === 'for-musicians' ? ' is-open' : ''}`}
        aria-label="For Musicians: lettura musicale del profilo"
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
          />
        </Suspense>
      </div>
    </div>
  )
}
