import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import EmotionalShape from './EmotionalShape.jsx'
import ReportRadarChart from './ReportRadarChart.jsx'
import { REPORT_CRITERION, SINTESI_UI, formatAttivazione } from './reportUiCopy.js'
import { normalizeFamigliaName } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { GlossaryLink } from './ReportGlossaryDrawer.jsx'
import FamigliePresenti from './FamigliePresenti.jsx'
import MobileChartsViewer from './MobileChartsViewer.jsx'
import { colors } from '../../design-tokens'
import './SintesiCorrenti.css'

void motion

/**
 * SintesiCorrenti — distribuzione delle cinque famiglie emotive.
 * Apertura visuale: hero compatto, chip chiave, grafici; narrativa in disclosure.
 */

const FAMILY_REF = {
  Verde: { color: colors.famiglie.verde.hex },
  Blu: { color: colors.famiglie.blu.hex },
  Rosso: { color: colors.famiglie.rosso.hex },
  Giallo: { color: colors.famiglie.giallo.hex },
  Grigio: { color: colors.famiglie.grigio.hex },
}
const FAMILY_ORDER = ['Verde', 'Blu', 'Rosso', 'Giallo', 'Grigio']

const TOTAL_SCORE_RADAR_AXES = [
  { key: 'verde', corrente: 'Flemmatica' },
  { key: 'rosso', corrente: 'Marziale' },
  { key: 'blu', corrente: 'Malinconica' },
  { key: 'giallo', corrente: 'Entusiasta' },
  { key: 'grigio', corrente: 'Razionale' },
]

const FAMILY_LAYOUT = {
  Giallo: { cx: 200, cy: 78, angle: -90 },
  Rosso: { cx: 92, cy: 168, angle: -8 },
  Blu: { cx: 308, cy: 168, angle: 8 },
  Verde: { cx: 278, cy: 292, angle: -12 },
  Grigio: { cx: 122, cy: 298, angle: 12 },
}

// Etichette visibili delle famiglie nelle liste con le percentuali (senza nature).
const FAMILY_PRESENCE_LABELS = {
  verde: { title: 'Flemmatica' },
  giallo: { title: 'Entusiasta' },
  rosso: { title: 'Marziale' },
  grigio: { title: 'Razionale' },
  blu: { title: 'Malinconica' },
}

const MIN_ELLIPSE_RX = 42
const MAX_ELLIPSE_RX = 74
const MIN_ELLIPSE_RY = 16
const MAX_ELLIPSE_RY = 30
const FAMILY_PANEL_TINT = {
  Verde: '220, 235, 221',
  Blu: '218, 228, 238',
  Rosso: '239, 222, 219',
  Giallo: '243, 235, 211',
  Grigio: '231, 233, 236',
}

function hexToRgb(hex) {
  if (typeof hex !== 'string') return null
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return null
  const int = parseInt(h, 16)
  if (Number.isNaN(int)) return null
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function colorDistance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
}

function getFamilyLogical(c) {
  if (c.familyName) return c.familyName
  if (c.familyKey) {
    const map = { verde: 'Verde', grigio: 'Grigio', blu: 'Blu', rosso: 'Rosso', giallo: 'Giallo' }
    return map[c.familyKey.toLowerCase()]
  }
  if (c.nome) {
    const map = {
      calma: 'Verde',
      anaffettività: 'Grigio',
      malinconia: 'Blu',
      volitività: 'Rosso',
      entusiasmo: 'Giallo',
    }
    return map[c.nome.toLowerCase()]
  }
  return null
}

function assignFamilies(correnti) {
  return correnti.map((c, idx) => {
    const logical = getFamilyLogical(c)
    if (logical) return logical

    const refRgb = FAMILY_ORDER.map((name) => ({ name, rgb: hexToRgb(FAMILY_REF[name].color) }))
    const rgb = hexToRgb(c.colore)
    let bestFamily = FAMILY_ORDER[idx % FAMILY_ORDER.length]
    let bestDist = Infinity
    refRgb.forEach((ref) => {
      const dist = colorDistance(rgb, ref.rgb)
      if (dist < bestDist) {
        bestDist = dist
        bestFamily = ref.name
      }
    })
    return bestFamily
  })
}

function pctAttivazione(peso) {
  return formatAttivazione(peso)
}

function buildTotalScoreRadarData(totalScores = {}, correnti = [], assignedFamilies = []) {
  // Consuma direttamente il contratto dati di Claude se presente
  const hasContractValues = correnti.some(c => c && 'valoreAssoluto' in c && 'scala1a7' in c)

  if (hasContractValues) {
    const sumRaw = correnti.reduce((acc, c) => acc + (Number(c.valoreAssoluto) || 0), 0)
    const max = Math.max(...correnti.map(c => Number(c.valoreAssoluto) || 0), 0)
    const familyLabels = {
      blu: 'Malinconica',
      giallo: 'Entusiasta',
      rosso: 'Marziale',
      verde: 'Flemmatica',
      grigio: 'Razionale',
    }
    return TOTAL_SCORE_RADAR_AXES.map((axis) => {
      const c = correnti.find(item => String(item.familyKey || '').toLowerCase() === axis.key.toLowerCase())
      const rawValue = c ? (Number(c.valoreAssoluto) || 0) : 0
      const valore = c ? (Number(c.scala1a7) || 0) : 1
      const distributionPercent = c ? (Number(c.peso) || 0) : 0
      return {
        corrente: axis.corrente,
        valore,
        rawValue,
        totalRawPoints: sumRaw,
        maxRawPoints: max,
        familyKey: axis.key,
        familyLabel: familyLabels[axis.key] || axis.corrente,
        distributionPercent,
      }
    })
  }

  // Fallback se i campi del contratto dati mancano
  const valuesByKey = {
    blu: Number(totalScores.blu) || 0,
    rosso: Number(totalScores.rosso) || 0,
    verde: Number(totalScores.verde) || 0,
    giallo: Number(totalScores.giallo) || 0,
    grigio: Number(totalScores.grigio) || 0,
  }

  const hasTotalScores = Object.values(valuesByKey).some((value) => value > 0)

  if (!hasTotalScores) {
    correnti.forEach((corrente, index) => {
      const familyName = assignedFamilies[index] || corrente?.familyName || ''
      const key = corrente?.familyKey || FAMILY_THEME[normalizeFamigliaName(familyName)]?.key
      if (key && Object.prototype.hasOwnProperty.call(valuesByKey, key)) {
        valuesByKey[key] = Number(corrente?.peso) || 0
      }
    })
  }

  const sumRaw = Object.values(valuesByKey).reduce((a, b) => a + b, 0)
  const max = Math.max(...TOTAL_SCORE_RADAR_AXES.map((axis) => valuesByKey[axis.key] || 0), 0)

  return TOTAL_SCORE_RADAR_AXES.map((axis) => {
    const rawValue = valuesByKey[axis.key] || 0
    const valore = max > 0 ? Math.min(7, Math.max(1, Math.round((rawValue / max) * 7))) : 1
    const distributionPercent = sumRaw > 0 ? Number(((rawValue / sumRaw) * 100).toFixed(1)) : 0
    const familyLabels = {
      blu: 'Malinconica',
      giallo: 'Entusiasta',
      rosso: 'Marziale',
      verde: 'Flemmatica',
      grigio: 'Razionale',
    }
    return {
      corrente: axis.corrente,
      valore,
      rawValue,
      totalRawPoints: sumRaw,
      maxRawPoints: max,
      familyKey: axis.key,
      familyLabel: familyLabels[axis.key] || axis.corrente,
      distributionPercent,
    }
  })
}


function familyPresenceLabel(item = {}, fallbackFamily = '') {
  const key = String(item.familyKey || '').toLowerCase()
  const normalized = normalizeFamigliaName(fallbackFamily || item.familyName || '')
  const themeKey = FAMILY_THEME[normalized]?.key
  const label = FAMILY_PRESENCE_LABELS[key || themeKey]
  if (label) return label
  return {
    title: item.label || item.macroLabel || item.nome || fallbackFamily,
  }
}


export default function SintesiCorrenti({
  correnti = [],
  _userName = '',
  correnteColore = '',
  famiglia = '',
  datiRadar: _datiRadar = null,
  totalScores = null,
  sottocorrenti = [],
  onOpenGlossary: _onOpenGlossary,
  stepPrefix = '1',
  rawRecord: _rawRecord = null,
  globalProfileContract = null,
  contentCards = null,
}) {
  const prefersReducedMotion = useReducedMotion()
  const [activeDetailFamily, setActiveDetailFamily] = useState(null)
  const [hoveredFamilyKey, setHoveredFamilyKey] = useState(null)

  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [chartsViewerOpen, setChartsViewerOpen] = useState(false)
  const [desktopSlideIndex, setDesktopSlideIndex] = useState(0)
  // Altezza reale dello stage dei grafici su desktop: il radar la riceve in px
  // così il grafico occupa lo spazio disponibile senza sforare lo schermo.
  const chartStageRef = useRef(null)
  const [chartStageHeight, setChartStageHeight] = useState(0)
  useEffect(() => {
    const node = chartStageRef.current
    if (!node || typeof ResizeObserver === 'undefined') return undefined
    const update = () => setChartStageHeight(Math.round(node.clientHeight))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [isMobileViewport])
  const closeChartsViewer = useCallback(() => setChartsViewerOpen(false), [])
  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const media = window.matchMedia('(max-width: 768px)')
    const sync = () => setIsMobileViewport(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])



  const families = useMemo(() => assignFamilies(correnti), [correnti])



  const ordered = useMemo(() => {
    return correnti
      .map((c, idx) => {
        const famName = families[idx]
        return {
          ...c,
          _idx: idx,
          color: c.colore || FAMILY_REF[famName]?.color,
          family: famName,
          familyKey: c.familyKey || (famName ? famName.toLowerCase() : ''),
        }
      })
      .sort((a, b) => (Number(b.peso) || 0) - (Number(a.peso) || 0))
  }, [correnti, families])

  const totalScoreRadarData = useMemo(
    () => buildTotalScoreRadarData(totalScores || {}, correnti, families),
    [totalScores, correnti, families],
  )

  const accentColor =
    correnteColore || ordered[0]?.color || correnti[0]?.colore || FAMILY_REF.Verde.color

  const dominantFamilyName = normalizeFamigliaName(famiglia)
  const dominantPresenceLabel = familyPresenceLabel({ familyName: dominantFamilyName }, dominantFamilyName)

  React.useEffect(() => {
    if (totalScoreRadarData.length > 0 && !activeDetailFamily) {
      const dominant = totalScoreRadarData.find(
        (d) => d.familyKey.toLowerCase() === (famiglia || '').toLowerCase()
      )
      setActiveDetailFamily(dominant || totalScoreRadarData[0])
    }
  }, [totalScoreRadarData, famiglia, activeDetailFamily])


  const familySottocorrenti = (Array.isArray(sottocorrenti) ? sottocorrenti : [])
    .filter((sub) => normalizeFamigliaName(sub?.familyName) === dominantFamilyName)
    .sort((a, b) => {
      if ((Number(b.percentuale) || 0) !== (Number(a.percentuale) || 0)) {
        return (Number(b.percentuale) || 0) - (Number(a.percentuale) || 0)
      }
      return (Number(b.valore) || 0) - (Number(a.valore) || 0)
    })

  const summarySottocorrenti = familySottocorrenti

  // Slide «Nature»: le correnti di TUTTE le famiglie, raggruppate per famiglia.
  // Ordine: prevalente per prima, poi le altre per peso decrescente nel profilo.
  const natureGroups = (() => {
    const byFamily = new Map()
    ;(Array.isArray(sottocorrenti) ? sottocorrenti : []).forEach((sub) => {
      const fam = normalizeFamigliaName(sub?.familyName)
      if (!byFamily.has(fam)) byFamily.set(fam, [])
      byFamily.get(fam).push(sub)
    })
    const pesoOf = (fam) => Number(ordered.find((o) => normalizeFamigliaName(o.family) === fam)?.peso) || 0
    return [...byFamily.entries()]
      .map(([fam, subs]) => ({
        family: fam,
        title: familyPresenceLabel({ familyName: fam }, fam).title,
        peso: pesoOf(fam),
        isDominant: fam === dominantFamilyName,
        subs: [...subs].sort((a, b) =>
          (Number(b.percentuale) || 0) - (Number(a.percentuale) || 0) || (Number(b.valore) || 0) - (Number(a.valore) || 0)),
      }))
      .sort((a, b) => (b.isDominant - a.isDominant) || (b.peso - a.peso) || (FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family)))
  })()

  const sottocorrenteDisplayName = (nome) => {
    if (nome === 'Lunare') return 'Natura Lunare'
    if (nome === 'Nostalgia' || nome === 'Nostalgica' || nome === 'Nostalgico') return 'Nostalgica'
    return nome
  }

  const viewport = { once: true, amount: 0.15 }

  const selectFamilyByKey = (key) => {
    const radarItem = totalScoreRadarData.find((d) => d.familyKey === key)
    if (radarItem) setActiveDetailFamily(radarItem)
  }

  const desktopSlides = [
    {
      id: 'geometria',
      tabLabel: 'Forma Emotiva',
      title: 'La Forma Emotiva',
      subtitle: 'Composizione visiva delle cinque energie temperamentali: l’ampiezza dei petali esprime l’armonia e la presenza delle diverse propensioni.',
    },
    {
      id: 'radar',
      tabLabel: 'Radar d\'Insieme',
      title: 'Visione d\'Insieme',
      subtitle: 'Distribuzione simultanea delle cinque qualità emotive.',
    },
    {
      id: 'nature',
      tabLabel: 'Nature del Profilo',
      title: 'Le Nature delle Famiglie',
      subtitle: `Le sfumature qualitative emerse dal test: in evidenza la famiglia prevalente, ${dominantPresenceLabel.title}, insieme alle altre manifestazioni del profilo.`,
    },
  ]

  const currentSlide = desktopSlides[desktopSlideIndex] || desktopSlides[0]

  // Grafici della sezione 1.2 per il visore mobile: stessi componenti e stessi dati del desktop.
  const mobileChartSlides = isMobileViewport
    ? [
        {
          id: 'forma',
          title: 'Forma emotiva',
          caption: 'La silhouette delle tue energie: l\'estensione dei petali indica l\'intensità (scala 1–7), mentre il nucleo centrale ne rappresenta l\'equilibrio armonico.',
          content: (
            <EmotionalShape
              familiesData={ordered}
              height="min(68vh, 580px)"
              activeFamilyKey={hoveredFamilyKey || activeDetailFamily?.familyKey}
              onFamilySelect={selectFamilyByKey}
              onFamilyHover={setHoveredFamilyKey}
            />
          ),
        },
        {
          id: 'radar',
          title: 'Radar delle famiglie',
          caption: 'Punteggio da 1 a 7 per ogni famiglia. Tocca un vertice per il valore esatto.',
          content: (
            <ReportRadarChart
              data={totalScoreRadarData}
              color={accentColor}
              height={460}
              outerRadius="80%"
              domain={[1, 7]}
              fullscreen
              className="sintesi-correnti__total-radar-chart"
              ariaLabel="Grafico radar del total score delle cinque famiglie emotive"
              onFamilySelect={selectFamilyByKey}
            />
          ),
        },
      ]
    : []

  if (isMobileViewport) {
    return (
      <section
        id="prima-sintesi-risultato"
        className="sintesi-correnti sintesi-correnti--mobile"
        aria-labelledby="sintesi-correnti-heading"
        style={{ '--sc-accent': accentColor }}
      >
        {/* b) Dati (composizione del profilo) */}
        <div id="report-tst-grafici" className="report-tst-section-anchor sintesi-mobile-activation">
          <div className="sintesi-family-intro" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <ReportPassageHeader
              step={`${stepPrefix}.2`}
              eyebrow="Distribuzione"
              title={SINTESI_UI.distribuzioneTitle}
              accentColor={accentColor}
            />
            <FamigliePresenti globalProfileContract={globalProfileContract} contentCards={contentCards} />
          </div>

          {/* Sottocorrenti racchiuse in cassetto nerd chiuso di default */}
          {summarySottocorrenti.length > 0 ? (
            <details className="sintesi-mobile-nerd-accordion">
              <summary className="sintesi-mobile-nerd-summary">
                <span>Vedi dettagli e correnti di {dominantPresenceLabel.title.toLowerCase()}</span>
                <span className="sintesi-mobile-nerd-chevron" aria-hidden="true">▾</span>
              </summary>
              <div className="sintesi-mobile-subcurrents">
                <ul className="sintesi-mobile-subcurrents-list">
                  {summarySottocorrenti.map((sub) => (
                    <li key={sub.rawKey} className="sintesi-mobile-subcurrent-card">
                      <div className="sintesi-mobile-subcurrent-info">
                        <span
                          className="sintesi-mobile-subcurrent-dot"
                          style={{ backgroundColor: sub.colore }}
                        />
                        <span className="sintesi-mobile-subcurrent-name">{sottocorrenteDisplayName(sub.nome)}</span>
                        <span className="sintesi-mobile-subcurrent-val" title={sub.misurabile !== false ? REPORT_CRITERION.attivazione : "Non misurabile nel test"}>
                          {sub.misurabile !== false ? pctAttivazione(sub.percentuale) : 'N.D.'}
                        </span>
                      </div>
                      <div className="sintesi-mobile-subcurrent-track">
                        <motion.div
                          className="sintesi-mobile-subcurrent-fill"
                          style={{ backgroundColor: sub.colore }}
                          initial={prefersReducedMotion ? false : { width: '0%' }}
                          whileInView={{ width: `${sub.misurabile !== false ? Math.min(100, Math.max(0, sub.percentuale)) : 0}%` }}
                          viewport={viewport}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ) : null}

        {/* Grafici: su mobile si aprono a tutto schermo e si scorrono di lato */}
        <div className="sintesi-mobile-visuals">
          <h3 className="sintesi-mobile-section-title">Visualizzazione Grafica</h3>
          <div className="mcv-entry" style={{ '--mcv-accent': accentColor }}>
            <ul className="mcv-entry__chips" aria-label="Grafici disponibili">
              {mobileChartSlides.map((slide) => (
                <li key={slide.id} className="mcv-entry__chip">{slide.title}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mcv-entry__open"
              onClick={() => setChartsViewerOpen(true)}
            >
              Apri i grafici
            </button>
          </div>
          <MobileChartsViewer
            open={chartsViewerOpen}
            onClose={closeChartsViewer}
            title={SINTESI_UI.distribuzioneTitle}
            slides={mobileChartSlides}
            accentColor={accentColor}
          />
        </div>
        </div>
      </section>
    )
  }

  const lastSlideIndex = desktopSlides.length - 1
  const goToSlide = (idx) => setDesktopSlideIndex(Math.min(lastSlideIndex, Math.max(0, idx)))
  const handleTabsKeyDown = (event) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = Math.min(lastSlideIndex, Math.max(0, desktopSlideIndex + step))
    goToSlide(next)
    event.currentTarget.querySelectorAll('[role="tab"]')[next]?.focus()
  }
  const radarHeight = chartStageHeight > 0 ? Math.max(300, chartStageHeight) : 420

  return (
    <section
      id="prima-sintesi-risultato"
      className="sintesi-correnti"
      aria-labelledby="sintesi-correnti-heading"
      style={{ '--sc-accent': accentColor }}
    >
      <div className="sintesi-correnti__summary">
        <div id="report-tst-grafici" className="report-tst-section-anchor sintesi-correnti__container sintesi-correnti__order-visuals">
          <div className="sintesi-family-intro sintesi-family-intro--charts">
            <ReportPassageHeader
              step={`${stepPrefix}.2`}
              eyebrow="Distribuzione"
              title={SINTESI_UI.distribuzioneTitle}
              accentColor={accentColor}
            />
            <FamigliePresenti globalProfileContract={globalProfileContract} contentCards={contentCards} />
          </div>

          {/* Tavola dei grafici: comandi a sinistra, grafico a destra, tutto in una schermata */}
          <div className="sintesi-charts-board">
            <div className="sintesi-charts-board__side">
              <div
                className="sintesi-charts-tabs sintesi-charts-tabs--vertical"
                role="tablist"
                aria-label="Grafici della sintesi"
                aria-orientation="vertical"
                onKeyDown={handleTabsKeyDown}
              >
                {desktopSlides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    id={`sintesi-chart-tab-${slide.id}`}
                    type="button"
                    role="tab"
                    aria-selected={desktopSlideIndex === idx}
                    aria-controls="sintesi-chart-panel"
                    tabIndex={desktopSlideIndex === idx ? 0 : -1}
                    className={`sintesi-charts-tab-btn${desktopSlideIndex === idx ? ' is-active' : ''}`}
                    onClick={() => goToSlide(idx)}
                  >
                    {slide.tabLabel}
                  </button>
                ))}
              </div>

              <div className="sintesi-charts-board__caption">
                <h3 className="sintesi-chart-slide-title">{currentSlide.title}</h3>
                <p className="sintesi-chart-slide-subtitle">{currentSlide.subtitle}</p>
              </div>

              <div className="sintesi-charts-board__nav">
                <button
                  type="button"
                  className="sintesi-chart-arrow-btn"
                  onClick={() => goToSlide(desktopSlideIndex - 1)}
                  disabled={desktopSlideIndex === 0}
                  aria-label="Grafico precedente"
                >
                  ‹
                </button>
                <span className="sintesi-charts-board__counter" aria-live="polite">
                  {desktopSlideIndex + 1} di {desktopSlides.length}
                </span>
                <button
                  type="button"
                  className="sintesi-chart-arrow-btn"
                  onClick={() => goToSlide(desktopSlideIndex + 1)}
                  disabled={desktopSlideIndex === lastSlideIndex}
                  aria-label="Grafico successivo"
                >
                  ›
                </button>
              </div>
            </div>

            <div
              ref={chartStageRef}
              id="sintesi-chart-panel"
              role="tabpanel"
              aria-labelledby={`sintesi-chart-tab-${currentSlide.id}`}
              className={`sintesi-charts-board__stage sintesi-charts-board__stage--${currentSlide.id}`}
            >
              {currentSlide.id === 'geometria' && (
                <div className="sintesi-charts-board__fill">
                  <EmotionalShape
                    familiesData={ordered}
                    height="100%"
                    activeFamilyKey={hoveredFamilyKey || activeDetailFamily?.familyKey}
                    onFamilySelect={selectFamilyByKey}
                    onFamilyHover={setHoveredFamilyKey}
                  />
                </div>
              )}

              {currentSlide.id === 'radar' && (
                <div className="sintesi-correnti__total-radar sintesi-charts-board__fill">
                  <ReportRadarChart
                    data={totalScoreRadarData}
                    color={accentColor}
                    height={radarHeight}
                    outerRadius="76%"
                    domain={[1, 7]}
                    className="sintesi-correnti__total-radar-chart"
                    ariaLabel="Grafico radar del total score delle cinque famiglie emotive"
                    onFamilySelect={selectFamilyByKey}
                  />
                </div>
              )}

              {currentSlide.id === 'nature' && (
                <div className="sintesi-slide-single-chart" style={{ width: '100%' }}>
                  {natureGroups.length > 0 ? (
                    <div className="sintesi-correnti__nature-grid">
                      {natureGroups.map((group) => (
                        <div
                          key={group.family}
                          className={`sintesi-correnti__subcurrents${group.isDominant ? ' is-dominant' : ''}`}
                          style={{ width: '100%', marginTop: 0, '--nature-accent': FAMILY_REF[group.family]?.color }}
                        >
                          <div className="sintesi-correnti__subcurrents-head">
                            <span className="sintesi-correnti__subcurrents-title">
                              {group.title}
                              {group.isDominant ? <span className="sintesi-correnti__nature-tag">prevalente</span> : null}
                            </span>
                            <span className="sintesi-correnti__subcurrents-count" title="Peso della famiglia sul totale del profilo">
                              {Math.round(group.peso)}%
                            </span>
                          </div>
                          <ul className="sintesi-correnti__subcurrents-list">
                            {group.subs.map((sub) => (
                              <li key={sub.rawKey} className="sintesi-correnti__subcurrent">
                                <div className="sintesi-correnti__subcurrent-info">
                                  <span
                                    className="sintesi-correnti__subcurrent-dot"
                                    style={{ backgroundColor: sub.colore }}
                                    aria-hidden="true"
                                  />
                                  <span className="sintesi-correnti__subcurrent-name">{sottocorrenteDisplayName(sub.nome)}</span>
                                  <span className="sintesi-correnti__subcurrent-value" title={sub.misurabile !== false ? REPORT_CRITERION.attivazione : "Non misurabile nel test"}>
                                    {sub.misurabile !== false ? pctAttivazione(sub.percentuale) : 'N.D.'}
                                  </span>
                                </div>
                                <div className="sintesi-correnti__subcurrent-track">
                                  <motion.div
                                    className="sintesi-correnti__subcurrent-fill"
                                    style={{ backgroundColor: sub.colore }}
                                    initial={prefersReducedMotion ? false : { width: '0%' }}
                                    whileInView={{ width: `${sub.misurabile !== false ? Math.min(100, Math.max(0, sub.percentuale)) : 0}%` }}
                                    viewport={viewport}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                  />
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'rgba(248, 250, 252, 0.7)', textAlign: 'center', padding: '2rem 1rem' }}>
                      Nessuna informazione aggiuntiva disponibile sulle nature per questa combinazione.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
