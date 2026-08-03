import React, { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import EmotionalShape from './EmotionalShape.jsx'
import ReportRadarChart from './ReportRadarChart.jsx'
import SectionDivider from './SectionDivider.jsx'
import { REPORT_CRITERION, SINTESI_UI, formatAttivazione } from './reportUiCopy.js'
import { normalizeFamigliaName } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { GlossaryLink } from './ReportGlossaryDrawer.jsx'
import CalculationDisclosure from './CalculationDisclosure.jsx'
import './SintesiCorrenti.css'

void motion

/**
 * SintesiCorrenti — distribuzione delle cinque famiglie emotive.
 * Apertura visuale: hero compatto, chip chiave, grafici; narrativa in disclosure.
 */

const FAMILY_REF = {
  Verde: { color: '#16a34a' },
  Blu: { color: '#2563eb' },
  Rosso: { color: '#dc2626' },
  Giallo: { color: '#ca8a04' },
  Grigio: { color: '#6b7280' },
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

const FAMILY_PRESENCE_LABELS = {
  verde: { title: 'Flemmatica', detail: 'natura contemplativa' },
  giallo: { title: 'Entusiasta', detail: 'natura Gioioso-Sanguinico' },
  rosso: { title: 'Marziale', detail: 'natura volitivo-collerica' },
  grigio: { title: 'Razionale', detail: 'natura intellettuale-razionale' },
  blu: { title: 'Malinconica', detail: 'natura lunare' },
}

// Fonti: docs/fonti-scientifiche/_estratto/MATRICE_TRACCIABILITA.md e
// docs/fonti-scientifiche/_estratto/STATI_D_ANIMO_IN_4_FAMIGLIE_salvataggio_automatico.txt.
const BRIEF_SUMMARY_BY_FAMILY = {
  Blu: {
    family: 'Malinconica',
    fundamentalPleasure:
      "il piacere di stare con sé stessi, dell’introversione, dell’osservarsi interiormente e del riflettere su ciò che si è vissuto",
    qualities: "caratteristiche emotive lunari, solari e nostalgiche",
    qualitiesByQuality: {
      Lunare:
        "una caratteristica Lunare e una Solare. Quella Lunare opera nel chiuso dell’interiorità, su una visione riflessa dell’esperienza emotiva",
      Solare:
        "una caratteristica Lunare e una Solare. Quella Solare apre verso il mondo, portando speranza, serenità e fiducia nel futuro",
      Nostalgica:
        "una caratteristica riflessiva e una nostalgica. Quella Nostalgica porta a elaborare il passato attraverso il rimpianto o, nel suo volto più luminoso, attraverso la riconoscenza verso ciò che si è vissuto",
      Depressiva:
        "una caratteristica introspettiva e una depressiva. Quella Depressiva opera nel chiuso dell’interiorità, scandagliandone gli aspetti più scuri",
    },
    orientation: "sé stessi, la memoria, la riflessione e l’interiorità",
    note: "La tristezza è solo uno dei volti dolorosi della malinconia.",
    defaultQuality: "Lunare",
  },
  Giallo: {
    family: 'Entusiasta',
    fundamentalPleasure:
      "il piacere del movimento, della curiosità, della scoperta del nuovo e dell’apertura verso il mondo",
    qualities: "caratteristiche emotive legate alla gioia, all’entusiasmo, alla curiosità e alla solarità",
    qualitiesByQuality: {
      Solare:
        "una caratteristica Gioioso-Sanguinico e una Passionale. Quella Gioioso-Sanguinico si esprime con vivacità, positività e un moto naturale verso il fuori e verso gli altri",
      "Gioioso-Sanguinico":
        "una caratteristica Gioioso-Sanguinico e una Passionale. Quella Gioioso-Sanguinico si esprime con vivacità, positività e un moto naturale verso il fuori e verso gli altri",
      Passionale:
        "una caratteristica Gioioso-Sanguinico e una Passionale. Quella Passionale si esprime con intensità affettiva, trasporto e un profondo senso di fusione con ciò che si ama",
    },
    orientation: "il fuori, gli altri, la relazione, la natura, le attività e le possibilità",
    note: "",
    defaultQuality: "Gioioso-Sanguinico",
  },
  Rosso: {
    family: 'Marziale',
    fundamentalPleasure:
      "il piacere del fare, del realizzare ciò che si desidera, del governarsi e del mettersi alla prova",
    qualities: "caratteristiche emotive legate all’assertività volitiva, al dubbio e alla collera",
    qualitiesByQuality: {
      Assertiva:
        "una caratteristica Assertiva e una del Dubbio. Quella Assertiva si esprime con fermezza, determinazione e volontà di concretizzare nel presente",
      "Dubbio-collerica":
        "una caratteristica Assertiva e una del Dubbio. Quella del Dubbio porta all’esitazione e all’ambiguità; quando si esaspera, può trasformarsi in collera",
    },
    orientation: "l’azione, la responsabilità, la decisione e la realizzazione",
    note: "",
    defaultQuality: "Assertiva",
  },
  Verde: {
    family: 'Flemmatica',
    fundamentalPleasure: "il piacere della lentezza, del riposo, della calma e della contemplazione",
    qualities:
      "caratteristiche emotive legate alla pace interiore, alla moderazione, alla prudenza e all’osservazione contemplativa",
    orientation:
      "la calma interiore — non per riflettere su sé stessi, ma per trovare quiete ed equilibrio affettivo",
    note: "",
    defaultQuality: 'Contemplativa',
  },
  Grigio: {
    family: 'Razionale',
    fundamentalPleasure:
      "il piacere del calcolo, della dubbiosità di origine intellettuale, dell’oggettività e della distanza affettiva",
    qualities:
      "caratteristiche emotive legate all’anaffettività, al distacco, al nichilismo e alla dimensione intellettuale",
    qualitiesByQuality: {
      Anaffettiva:
        "una caratteristica Anaffettiva e una della Saggezza. Quella Anaffettiva agisce con gelido distacco intellettuale, osservando ogni cosa senza lasciarsi coinvolgere dalla sfera sentimentale",
      Distaccata:
        "una caratteristica Anaffettiva e una della Saggezza. Quella Anaffettiva agisce con gelido distacco intellettuale, osservando ogni cosa senza lasciarsi coinvolgere dalla sfera sentimentale",
      "Intellettuale-saggia":
        "una caratteristica Anaffettiva e una della Saggezza. Quella della Saggezza orienta lo stesso sguardo distaccato verso un’osservazione amorevole e compassionevole, aprendosi alla devozione e alla cura dell’altro",
    },
    orientation: "il distacco, l’oggettività, l’analisi e la distanza dal coinvolgimento immediato",
    note: "",
    defaultQuality: "Anaffettiva",
  },
}

function renderBriefSummaryParagraph(paragraph) {
  if (paragraph === "La tristezza è solo uno dei volti dolorosi della malinconia.") {
    return <>La tristezza è <em>solo</em> uno dei volti dolorosi della malinconia.</>
  }

  return paragraph
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

function resolveBriefQuality({ familyName, sottodisposizione, correnteDominante }) {
  const haystack = `${sottodisposizione || ''} ${correnteDominante || ''}`.toLowerCase()

  if (haystack.includes('nostalg')) return 'Nostalgica'
  if (haystack.includes('depress')) return 'Depressiva'
  if (haystack.includes('lunare')) return 'Lunare'
  if (haystack.includes('solare')) return familyName === 'Giallo' ? 'Gioioso-Sanguinico' : 'Solare'
  if (haystack.includes('assert') || haystack.includes('marziale')) return 'Assertiva'
  if (haystack.includes('dubbio') || haystack.includes('collera')) return 'Dubbio-collerica'
  if (haystack.includes('flemm') || haystack.includes('contemplat')) return 'Contemplativa'
  if (haystack.includes('gioia') || haystack.includes('entusiasm') || haystack.includes('sanguin')) return 'Gioioso-Sanguinico'
  if (haystack.includes('passion')) return 'Passionale'
  if (haystack.includes('saggio') || haystack.includes('intellett')) return 'Intellettuale-saggia'
  if (haystack.includes('distacc')) return 'Distaccata'
  if (haystack.includes('anaff')) return 'Anaffettiva'

  return BRIEF_SUMMARY_BY_FAMILY[familyName]?.defaultQuality || 'Contemplativa'
}

function buildBriefSummary({ familyName, sottodisposizione, correnteDominante }) {
  const copy = BRIEF_SUMMARY_BY_FAMILY[familyName] || BRIEF_SUMMARY_BY_FAMILY.Verde
  const quality = resolveBriefQuality({ familyName, sottodisposizione, correnteDominante })
  const qualitiesText = copy.qualitiesByQuality?.[quality] ?? copy.qualities

  const paragraphs = [
    `In essa emerge ${copy.fundamentalPleasure}.`,
    `Al suo interno si distinguono ${qualitiesText}.`,
    `Chi ne fa parte orienta la propria energia emotiva verso ${copy.orientation}.`,
  ]

  if (copy.note) paragraphs.push(copy.note)

  return {
    introFamily: copy.family,
    introQuality: quality,
    paragraphs,
  }
}

function familyPresenceLabel(item = {}, fallbackFamily = '') {
  const key = String(item.familyKey || '').toLowerCase()
  const normalized = normalizeFamigliaName(fallbackFamily || item.familyName || '')
  const themeKey = FAMILY_THEME[normalized]?.key
  const label = FAMILY_PRESENCE_LABELS[key || themeKey]
  if (label) return label
  return {
    title: item.label || item.macroLabel || item.nome || fallbackFamily,
    detail: item.nome && item.nome !== item.label ? item.nome : '',
  }
}

function familySectionIntro(dominantFamilyFullLabel) {
  return [
    'Nel tuo test visivo sono riportate tutte e cinque le componenti emotive.',
    `Dai risultati emerge una prevalenza della famiglia ${dominantFamilyFullLabel}; le altre famiglie rimangono comunque presenti e contribuiscono, con intensità differenti, alla costruzione della tua identità emotiva.`,
    'Verifica, attraverso i grafici, come le diverse componenti si relazionano tra loro.',
  ]
}

function SintesiDisclosure({ id, title, defaultOpen = false, children, className = '' }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `${id}-panel`

  if (!children) return null

  return (
    <div className={`sintesi-correnti__disclosure ${className}`.trim()}>
      <button
        type="button"
        id={`${id}-trigger`}
        className="sintesi-correnti__disclosure-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sintesi-correnti__disclosure-title">{title}</span>
        <span className="sintesi-correnti__disclosure-chevron" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={`${id}-trigger`}
          className="sintesi-correnti__disclosure-panel"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}


export default function SintesiCorrenti({
  correnti = [],
  correnteDominante = '',
  _userName = '',
  correnteColore = '',
  famiglia = '',
  datiRadar: _datiRadar = null,
  totalScores = null,
  sottocorrenti = [],
  onOpenGlossary: _onOpenGlossary,
  sottodisposizione = '',
  stepPrefix = '1',
}) {
  const prefersReducedMotion = useReducedMotion()
  const [activeDetailFamily, setActiveDetailFamily] = useState(null)
  const [hoveredFamilyKey, setHoveredFamilyKey] = useState(null)

  const [isMobileViewport, setIsMobileViewport] = useState(false)
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

  const renderDetailPanel = () => {
    if (!activeDetailFamily) return null
    const colors = {
      verde: '#16a34a',
      blu: '#2563eb',
      rosso: '#dc2626',
      giallo: '#ca8a04',
      grigio: '#6b7280',
    }
    const activeKey = hoveredFamilyKey || activeDetailFamily.familyKey
    const activeItem = totalScoreRadarData.find(d => d.familyKey === activeKey) || activeDetailFamily
    const accent = colors[activeItem.familyKey] || '#94a3b8'
    const activeCapitalized = activeItem.familyKey ? (activeItem.familyKey.charAt(0).toUpperCase() + activeItem.familyKey.slice(1).toLowerCase()) : 'Verde'
    const activeBriefSummary = BRIEF_SUMMARY_BY_FAMILY[activeCapitalized] || BRIEF_SUMMARY_BY_FAMILY.Verde

    // Quality resolved for active family
    const resolvedQuality = resolveBriefQuality({
      familyName: activeCapitalized,
      sottodisposizione,
      correnteDominante
    })
    const qualitiesText = activeBriefSummary.qualitiesByQuality?.[resolvedQuality] ?? activeBriefSummary.qualities

    return (
      <div 
        className="sintesi-correnti__detail-panel" 
        style={{
          '--panel-accent': accent,
          borderLeft: `4px solid ${accent}`
        }}
      >
        <div className="detail-panel__header">
          <span className="detail-panel__status-dot" style={{ backgroundColor: accent }} />
          <h4 className="detail-panel__title">
            ANALISI DETTAGLIATA: {activeBriefSummary.family.toUpperCase()}
          </h4>
          <span className="detail-panel__subtitle-mono">METRICS & PROFILE COHERENCE</span>
        </div>

        {/* 3-Column Stats Dashboard */}
        <div className="detail-panel__metrics-grid">
          <div className="detail-panel__metric-card">
            <span className="detail-panel__metric-label">Risonanza (% del profilo)</span>
            <span className="detail-panel__metric-value">{activeItem.distributionPercent}%</span>
          </div>
          <div className="detail-panel__metric-card">
            <span className="detail-panel__metric-label">Scala Normalizzata (1-7)</span>
            <span className="detail-panel__metric-value">{activeItem.valore} <span className="detail-panel__metric-val-max">/ 7</span></span>
          </div>
          <div className="detail-panel__metric-card">
            <span className="detail-panel__metric-label">Punteggio Grezzo (punti)</span>
            <span className="detail-panel__metric-value">{activeItem.rawValue} <span className="detail-panel__metric-val-max">pt</span></span>
          </div>
        </div>

        {/* Scientific Explanation Block */}
        <div className="detail-panel__desc-block">
          <p className="detail-panel__desc-lead">
            La famiglia <strong>{activeBriefSummary.family}</strong> rappresenta {activeBriefSummary.fundamentalPleasure}.
          </p>
          <p className="detail-panel__desc-body">
            Al suo interno si distinguono {qualitiesText}. L'energia emotiva viene prevalentemente orientata verso <strong>{activeBriefSummary.orientation}</strong>.
          </p>
          {activeBriefSummary.note && (
            <p className="detail-panel__desc-note">
              * {activeBriefSummary.note}
            </p>
          )}
        </div>

        <CalculationDisclosure>
          <p className="calculation-disclosure__intro">
            Ogni risposta del test assegna punti a una corrente emotiva. Sommiamo poi i
            punti delle correnti che appartengono alla stessa famiglia. Alcuni passaggi
            del test hanno un peso maggiore, come previsto dal metodo.
          </p>
          <div className="calculation-disclosure__formula">
            <span className="formula-header">FORMULA DI RISONANZA & NORMALIZZAZIONE</span>
            <code className="formula-code">
              Risonanza = (Punti Grezzi / Punti Totali) * 100
              Scale_Value = (Punti Grezzi / Punteggio Massimo) * 7
            </code>
            <p className="formula-explanation">
              <strong>Nota Metodologica:</strong> La Risonanza (%) e il Valore in Scala (1-7) sono metriche distinte. La risonanza indica la quota di attivazione percentuale di ciascuna famiglia rispetto all'intero profilo emotivo (fette di una torta, somma = 100%). Il valore normalizzato (1-7) normalizza invece i punteggi ponendo la famiglia dominante al massimo (7/7) e proporzionando le altre per rendere l'intensità visivamente confrontabile.
            </p>
          </div>
        </CalculationDisclosure>
      </div>
    )
  }

  const briefSummary = buildBriefSummary({
    familyName: dominantFamilyName,
    sottodisposizione,
    correnteDominante,
  })
  const familyIntroParagraphs = familySectionIntro(briefSummary.introFamily)

  const familySottocorrenti = (Array.isArray(sottocorrenti) ? sottocorrenti : [])
    .filter((sub) => normalizeFamigliaName(sub?.familyName) === dominantFamilyName)
    .sort((a, b) => {
      if ((Number(b.percentuale) || 0) !== (Number(a.percentuale) || 0)) {
        return (Number(b.percentuale) || 0) - (Number(a.percentuale) || 0)
      }
      return (Number(b.valore) || 0) - (Number(a.valore) || 0)
    })

  const summarySottocorrenti = familySottocorrenti

  const sottocorrenteDisplayName = (nome) => {
    if (nome === 'Lunare') return 'Caratteristica Lunare'
    if (nome === 'Nostalgia') return 'Nostalgica'
    return nome
  }

  const viewport = { once: true, amount: 0.15 }
  const sectionFade = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport,
        transition: { duration: 0.45 },
      }

  if (isMobileViewport) {
    return (
      <section
        id="prima-sintesi-risultato"
        className="sintesi-correnti sintesi-correnti--mobile"
        aria-labelledby="sintesi-correnti-heading"
        style={{ '--sc-accent': accentColor }}
      >
        <ReportPassageHeader
          step={`${stepPrefix}.1`}
          eyebrow={SINTESI_UI.eyebrow}
          title={SINTESI_UI.title}
          lead={SINTESI_UI.subtitle}
          accentColor={accentColor}
          titleId="sintesi-correnti-heading"
        />

        {/* Unified Editorial Summary Card */}
        <div className="sintesi-editorial-card">
          <div className="sintesi-editorial-text">
            <p className="sintesi-editorial-body sintesi-editorial-body--lead">
              La tua famiglia emotiva prevalente è{' '}
              <strong className="sintesi-editorial-highlight">{briefSummary.introFamily}</strong> e la sua caratteristica emotiva
              (natura) prevalente è <strong className="sintesi-editorial-highlight">{briefSummary.introQuality}</strong>.
            </p>
            <p className="sintesi-editorial-body">
              Questa famiglia emotiva è una delle 5 forze emotive comuni a tutti.
            </p>
            {briefSummary.paragraphs.map((paragraph) => (
              <p key={paragraph} className="sintesi-editorial-body">
                {renderBriefSummaryParagraph(paragraph)}
              </p>
            ))}
          </div>
        </div>

        <SectionDivider />

        {/* b) Attivazione (numbers/bars come after explanation) */}
        <div id="report-tst-grafici" className="report-tst-section-anchor sintesi-mobile-activation">
          <div className="sintesi-family-intro" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <ReportPassageHeader
              step={`${stepPrefix}.2`}
              eyebrow="Distribuzione"
              title={SINTESI_UI.distribuzioneTitle}
              accentColor={accentColor}
            />
            <div className="sintesi-family-intro__text">
              {familyIntroParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <ul className="sintesi-mobile-bars-list">
            {ordered.map((c, i) => {
              const peso = Number(c.peso) || 0
              const barColor = c.color
              const label = familyPresenceLabel(c)
              const isActive = (hoveredFamilyKey || activeDetailFamily?.familyKey) === c.familyKey
              return (
                <li
                  className={`sintesi-mobile-bar-row${isActive ? ' sintesi-mobile-bar-row--active' : ''}`}
                  key={`bar-${c.nome}-${c._idx}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Rango ${i + 1}: natura ${label.title}, presenza ${pctAttivazione(peso)}`}
                  onMouseEnter={() => setHoveredFamilyKey(c.familyKey)}
                  onMouseLeave={() => setHoveredFamilyKey(null)}
                  onClick={() => {
                    const radarItem = totalScoreRadarData.find(d => d.familyKey === c.familyKey)
                    if (radarItem) setActiveDetailFamily(radarItem)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      const radarItem = totalScoreRadarData.find(d => d.familyKey === c.familyKey)
                      if (radarItem) setActiveDetailFamily(radarItem)
                    }
                  }}
                  style={{ cursor: 'pointer', borderRadius: '6px', padding: '0.25rem 0.5rem', transition: 'background-color 0.2s ease' }}
                >
                  <div className="sintesi-mobile-bar-row-info">
                    <div className="sintesi-mobile-bar-row-left">
                      <span className="sintesi-mobile-bar-rank">{String(i + 1).padStart(2, '0')}</span>
                      <span className="sintesi-mobile-bar-dot" style={{ backgroundColor: barColor }} />
                      <span className="sintesi-mobile-bar-name">
                        <strong>{label.title}</strong>
                        {i === 0 && (
                          <span className="sintesi-correnti__dominant-badge">NATURA PREVALENTE</span>
                        )}
                        {label.detail ? (
                          <span className="sintesi-mobile-bar-subname"> {label.detail}</span>
                        ) : null}
                      </span>
                    </div>
                    <span className="sintesi-mobile-bar-pct">Presenza {pctAttivazione(peso)}</span>
                  </div>
                  <div className="sintesi-mobile-bar-track">
                    <motion.div
                      className="sintesi-mobile-bar-fill"
                      style={{ backgroundColor: barColor }}
                      initial={prefersReducedMotion ? false : { width: '0%' }}
                      whileInView={{ width: `${Math.min(100, Math.max(0, peso))}%` }}
                      viewport={viewport}
                      transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 90, damping: 18, delay: i * 0.1 }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Sottocorrenti */}
        {summarySottocorrenti.length > 0 ? (
          <div className="sintesi-mobile-subcurrents">
            <h3 className="sintesi-mobile-section-title">
              Sottocategorie di {dominantPresenceLabel.title.toLowerCase()}
            </h3>
            <p className="sintesi-mobile-explanation">
              All’interno di questa famiglia, il test evidenzia le caratteristiche emotive specifiche che
              contribuiscono a definire meglio la tua appartenenza.
            </p>
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
        ) : null}

        {/* Visualizer and Legend (radar chart scaled for mobile viewport) */}
        <div className="sintesi-mobile-visuals">
          <h3 className="sintesi-mobile-section-title">Visualizzazione Grafica</h3>
          <p className="sintesi-mobile-explanation">
            La forma visiva del tuo carattere emotivo. Le 5 componenti convivono nello stesso spazio.
          </p>
          <div className="sintesi-mobile-radar-container">
            <div className="sintesi-correnti__total-radar">
              <p className="sintesi-correnti__radar-caption">
                Scala 1-7 distribuita sui vertici del grafico radar delle cinque famiglie.
              </p>
              <p className="sintesi-correnti__radar-hint">Passa il cursore sui vertici per i punteggi esatti.</p>
              <ReportRadarChart
                data={totalScoreRadarData}
                color={accentColor}
                height={300}
                outerRadius="72%"
                domain={[1, 7]}
                className="sintesi-correnti__total-radar-chart"
                ariaLabel="Grafico radar del total score delle cinque famiglie emotive"
                onFamilySelect={(key) => {
                  const radarItem = totalScoreRadarData.find(d => d.familyKey === key)
                  if (radarItem) setActiveDetailFamily(radarItem)
                }}
              />
            </div>
            <EmotionalShape 
              familiesData={ordered}
              activeFamilyKey={hoveredFamilyKey || activeDetailFamily?.familyKey}
              onFamilySelect={(key) => {
                const radarItem = totalScoreRadarData.find(d => d.familyKey === key)
                if (radarItem) setActiveDetailFamily(radarItem)
              }}
              onFamilyHover={setHoveredFamilyKey}
            />
          </div>
          {renderDetailPanel()}
        </div>


      </section>
    )
  }

  return (
    <section
      id="prima-sintesi-risultato"
      className="sintesi-correnti"
      aria-labelledby="sintesi-correnti-heading"
      style={{ '--sc-accent': accentColor }}
    >
      <ReportPassageHeader
        step={`${stepPrefix}.1`}
        eyebrow={SINTESI_UI.eyebrow}
        title={SINTESI_UI.title}
        lead={SINTESI_UI.subtitle}
        accentColor={accentColor}
        titleId="sintesi-correnti-heading"
      />

      <div className="sintesi-correnti__summary">
        {/* Unified Editorial Summary Card */}
        <div className="sintesi-editorial-card">
          <div className="sintesi-editorial-text">
            <p className="sintesi-editorial-body sintesi-editorial-body--lead">
              La tua famiglia emotiva prevalente è{' '}
              <strong className="sintesi-editorial-highlight">{briefSummary.introFamily}</strong> e la sua caratteristica emotiva
              (natura) prevalente è <strong className="sintesi-editorial-highlight">{briefSummary.introQuality}</strong>.
            </p>
            <p className="sintesi-editorial-body">
              Questa famiglia emotiva è una delle 5 forze emotive comuni a tutti.
            </p>
            {briefSummary.paragraphs.map((paragraph) => (
              <p key={paragraph} className="sintesi-editorial-body">
                {renderBriefSummaryParagraph(paragraph)}
              </p>
            ))}
          </div>
        </div>

        <div className="sintesi-divider-container" style={{ gridColumn: '1 / -1', width: '100%', marginBottom: '2.5rem' }}>
          <SectionDivider />
        </div>

        <div id="report-tst-grafici" className="report-tst-section-anchor sintesi-correnti__container sintesi-correnti__order-visuals">
          <div className="sintesi-family-intro" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <ReportPassageHeader
              step={`${stepPrefix}.2`}
              eyebrow="Distribuzione"
              title={SINTESI_UI.distribuzioneTitle}
              accentColor={accentColor}
            />
            <div className="sintesi-family-intro__text">
              {familyIntroParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="sintesi-correnti__analysis-grid">
            <motion.div
              className="sintesi-correnti__radar sintesi-correnti__order-radar"
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: prefersReducedMotion ? 0 : 0.12 }}
            >
              <div className="sintesi-correnti__visual-panel sintesi-correnti__visual-panel--radar">
                <div className="sintesi-correnti__total-radar">
                  <p className="sintesi-correnti__radar-caption">
                    Scala 1-7 derivata dai punteggi totali delle cinque famiglie.
                  </p>
                  <p className="sintesi-correnti__radar-hint">Passa il cursore sui vertici per i punteggi esatti.</p>
                  <ReportRadarChart
                    data={totalScoreRadarData}
                    color={accentColor}
                    height={420}
                    outerRadius="72%"
                    domain={[1, 7]}
                    className="sintesi-correnti__total-radar-chart"
                    ariaLabel="Grafico radar del total score delle cinque famiglie emotive"
                    onFamilySelect={(key) => {
                      const radarItem = totalScoreRadarData.find(d => d.familyKey === key)
                      if (radarItem) setActiveDetailFamily(radarItem)
                    }}
                  />
                </div>
              </div>
              <div className="sintesi-correnti__visual-panel sintesi-correnti__visual-panel--ellipses">
                <EmotionalShape 
                  familiesData={ordered} 
                  height="100%"
                  activeFamilyKey={hoveredFamilyKey || activeDetailFamily?.familyKey}
                  onFamilySelect={(key) => {
                    const radarItem = totalScoreRadarData.find(d => d.familyKey === key)
                    if (radarItem) setActiveDetailFamily(radarItem)
                  }}
                  onFamilyHover={setHoveredFamilyKey}
                />
              </div>
            </motion.div>

            <div className="sintesi-correnti__side-metrics">
              <div className="sintesi-correnti__data">
                <div className="sintesi-correnti__data-head">
                  <div className="sintesi-correnti__data-head-copy">
                    <span className="sintesi-correnti__kicker">{SINTESI_UI.distribuzioneTitle}</span>
                    {SINTESI_UI.distribuzioneOrderLabel ? (
                      <p className="sintesi-correnti__data-order">
                        {SINTESI_UI.distribuzioneOrderLabel}
                      </p>
                    ) : null}
                    {SINTESI_UI.distribuzioneCaption ? (
                      <p className="sintesi-correnti__data-caption">{SINTESI_UI.distribuzioneCaption}</p>
                    ) : null}
                  </div>
                </div>
                <ul className="sintesi-correnti__list sintesi-correnti__order-bars">
                  {ordered.map((c, i) => {
                    const peso = Number(c.peso) || 0
                    const barColor = c.color
                    const label = familyPresenceLabel(c)
                    const fillTransition = prefersReducedMotion
                      ? { duration: 0 }
                      : {
                          type: 'spring',
                          stiffness: 90,
                          damping: 18,
                          delay: i * 0.12,
                        }
                    const isActive = (hoveredFamilyKey || activeDetailFamily?.familyKey) === c.familyKey
                    return (
                      <li
                        className={`sintesi-correnti__row${isActive ? ' sintesi-correnti__row--active' : ''}`}
                        key={`${c.nome}-${c._idx}`}
                        tabIndex={0}
                        role="button"
                        aria-label={`Rango ${i + 1}: natura ${label.title}, presenza ${pctAttivazione(peso)}`}
                        onMouseEnter={() => setHoveredFamilyKey(c.familyKey)}
                        onMouseLeave={() => setHoveredFamilyKey(null)}
                        onClick={() => {
                          const radarItem = totalScoreRadarData.find(d => d.familyKey === c.familyKey)
                          if (radarItem) setActiveDetailFamily(radarItem)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            const radarItem = totalScoreRadarData.find(d => d.familyKey === c.familyKey)
                            if (radarItem) setActiveDetailFamily(radarItem)
                          }
                        }}
                        style={{ cursor: 'pointer', borderRadius: '6px', padding: '0.25rem 0.5rem', transition: 'background-color 0.2s ease' }}
                      >
                        <span className="sintesi-correnti__rank" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="sintesi-correnti__dot"
                          style={{ backgroundColor: barColor }}
                          aria-hidden
                        />
                        <span className="sintesi-correnti__row-name">
                          <span className="sintesi-correnti__row-macro">
                            {label.title}
                            {i === 0 && (
                              <span className="sintesi-correnti__dominant-badge">NATURA PREVALENTE</span>
                            )}
                          </span>
                          {label.detail ? (
                            <span className="sintesi-correnti__row-temp">{label.detail}</span>
                          ) : null}
                        </span>
                        <span className="sintesi-correnti__bar-track">
                          <motion.span
                            className="sintesi-correnti__bar-fill"
                            style={{ backgroundColor: barColor }}
                            initial={prefersReducedMotion ? false : { width: '0%' }}
                            whileInView={{ width: `${Math.min(100, Math.max(0, peso))}%` }}
                            viewport={viewport}
                            transition={fillTransition}
                          />
                        </span>
                        <span
                          className="sintesi-correnti__row-pct"
                          title={REPORT_CRITERION.attivazione}
                        >
                          <span className="sintesi-correnti__row-pct-label" aria-hidden="true">
                            {REPORT_CRITERION.attivazioneShort}
                          </span>
                          <span className="sr-only">{REPORT_CRITERION.attivazione}: </span>
                          {pctAttivazione(peso)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
                {renderDetailPanel()}
              </div>

              {familySottocorrenti.length > 0 ? (
                <div className="sintesi-correnti__subcurrents">
                  <div className="sintesi-correnti__subcurrents-head">
                    <span className="sintesi-correnti__subcurrents-title">
                      Sottocategorie di {dominantPresenceLabel.title.toLowerCase()}
                    </span>
                    <span className="sintesi-correnti__subcurrents-count">
                      {familySottocorrenti.length}
                    </span>
                  </div>
                  <p className="sintesi-correnti__subcurrents-caption">
                    Caratteristiche emotive specifiche che definiscono meglio la famiglia prevalente.
                  </p>
                  <ul className="sintesi-correnti__subcurrents-list">
                    {familySottocorrenti.map((sub) => (
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
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="sintesi-correnti__narrative sintesi-correnti__order-narrative">
        <SintesiDisclosure
          id="sintesi-visual-mobile"
          title={SINTESI_UI.visualToggle}
          className="sintesi-correnti__disclosure--visual-mobile"
        >
          <div className="sintesi-correnti__visual sintesi-correnti__visual--mobile-inline">
            <div className="sintesi-correnti__radar sintesi-correnti__order-radar">
              <div className="sintesi-correnti__visual-panel sintesi-correnti__visual-panel--radar">
                <div className="sintesi-correnti__total-radar">
                  <p className="sintesi-correnti__radar-caption">
                    Scala 1-7 derivata dai punteggi totali delle cinque famiglie.
                  </p>
                  <p className="sintesi-correnti__radar-hint">Passa il cursore sui vertici per i punteggi esatti.</p>
                  <ReportRadarChart
                    data={totalScoreRadarData}
                    color={accentColor}
                    height={300}
                    outerRadius="72%"
                    domain={[1, 7]}
                    className="sintesi-correnti__total-radar-chart"
                    ariaLabel="Grafico radar del total score delle delle cinque famiglie emotive"
                    onFamilySelect={(key) => {
                      const radarItem = totalScoreRadarData.find(d => d.familyKey === key)
                      if (radarItem) setActiveDetailFamily(radarItem)
                    }}
                  />
                </div>
              </div>
              <div className="sintesi-correnti__visual-panel sintesi-correnti__visual-panel--ellipses">
                <EmotionalShape 
                  familiesData={ordered} 
                  activeFamilyKey={hoveredFamilyKey || activeDetailFamily?.familyKey}
                  onFamilySelect={(key) => {
                    const radarItem = totalScoreRadarData.find(d => d.familyKey === key)
                    if (radarItem) setActiveDetailFamily(radarItem)
                  }}
                  onFamilyHover={setHoveredFamilyKey}
                />
              </div>
            </div>
          </div>
          {renderDetailPanel()}
        </SintesiDisclosure>


      </div>
    </section>
  )
}
