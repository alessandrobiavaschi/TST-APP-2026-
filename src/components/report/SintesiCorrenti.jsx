import React, { useCallback, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import EmotionalShape from './EmotionalShape.jsx'
import ReportRadarChart from './ReportRadarChart.jsx'
import SectionDivider from './SectionDivider.jsx'
import { REPORT_CRITERION, SINTESI_UI, formatAttivazione } from './reportUiCopy.js'
import { normalizeFamigliaName } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { GlossaryLink } from './ReportGlossaryDrawer.jsx'
import InfoTip from './InfoTip.jsx'
import PercorsoRisposte from './PercorsoRisposte.jsx'
import MobileChartsViewer from './MobileChartsViewer.jsx'
import { buildProgressiveContentViewModel } from '../../utils/buildProgressiveContentViewModel.js'
import { NATURE as NATURE_TST } from '../../config/tstSistema.js'
import { getTestoNatura } from '../../content/testiFissiTemperamenti.js'
import { naturePdfDiFamiglia } from '../../utils/naturePdf.js'
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

// Fonti: docs/fonti-scientifiche/_estratto/MATRICE_TRACCIABILITA.md,
// docs/fonti-scientifiche/_estratto/STATI_D_ANIMO_IN_4_FAMIGLIE_salvataggio_automatico.txt,
// docs/fonti-scientifiche/testi-definitivi/Malinconia_lunare.pages e
// docs/fonti-scientifiche/Il Pianeta della Musica - FM.pdf.
//
// Testi invariati rispetto alla versione precedente (fundamentalPleasure, qualities,
// qualitiesByQuality, orientation, note): solo l'ORDINE in cui vengono mostrati è
// cambiato in SintesiCorrenti — famiglia → cosa rappresenta → composizione interna →
// natura prevalente → come si colloca. Uniche aggiunte nuove: `clarification` e
// `deepDiveParagraphs` per Blu (approfondimento facoltativo in disclosure).
const BRIEF_SUMMARY_BY_FAMILY = {
  Blu: {
    family: 'Malinconica',
    clarification: "La Malinconia non significa automaticamente tristezza o depressione.",
    fundamentalPleasure:
      "il piacere di stare con sé stessi, dell’introversione, dell’osservarsi interiormente e del riflettere su ciò che si è vissuto",
    orientation: "sé stessi, la memoria, la riflessione e l’interiorità",
    note: "La tristezza è solo uno dei volti dolorosi della malinconia.",
    deepDiveParagraphs: [
      "Il versante lunare della Malinconia, associato alla terza minore, orienta verso l’introspezione e il raccoglimento e, nelle forme più accentuate, verso la tristezza e la depressione. Il versante solare, associato alla terza maggiore, orienta invece verso l’apertura, la speranza, l’ottimismo e l’avvicinamento alla gioia.",
      "La natura specifica emersa dal test indica quale di queste manifestazioni risulta più presente nel tuo profilo: non esaurisce l’intera persona. Etichette come «Depressiva» appartengono al linguaggio del modello TST e non costituiscono una diagnosi clinica.",
    ],
  },
  Giallo: {
    family: 'Entusiasta',
    fundamentalPleasure:
      "il piacere del movimento, della curiosità, della scoperta del nuovo e dell’apertura verso il mondo",
    orientation: "il fuori, gli altri, la relazione, la natura, le attività e le possibilità",
    note: "",
  },
  Rosso: {
    family: 'Marziale',
    fundamentalPleasure:
      "il piacere del fare, del realizzare ciò che si desidera, del governarsi e del mettersi alla prova",
    orientation: "l’azione, la responsabilità, la decisione e la realizzazione",
    note: "",
  },
  Verde: {
    family: 'Flemmatica',
    fundamentalPleasure: "il piacere della lentezza, del riposo, della calma e della contemplazione",
    orientation:
      "la calma interiore — non per riflettere su sé stessi, ma per trovare quiete ed equilibrio affettivo",
    note: "",
  },
  Grigio: {
    family: 'Razionale',
    fundamentalPleasure:
      "il piacere del calcolo, della dubbiosità di origine intellettuale, dell’oggettività e della distanza affettiva",
    orientation: "il distacco, l’oggettività, l’analisi e la distanza dal coinvolgimento immediato",
    note: "",
  },
}

// Nature di ogni famiglia SOLO dai PDF: nomi da «Parole per TST», definizione
// (prima frase) da «Testi fissi». Il resto del riepilogo viene dal Pianeta della Musica.
const COLOR_KEY_BY_FAMILY_NAME = { Blu: 'blu', Rosso: 'rosso', Verde: 'verde', Giallo: 'giallo', Grigio: 'grigio' }

function primaFrase(testo = '') {
  const m = String(testo).trim().match(/^.*?[.!?](?=\s|$)/)
  return (m ? m[0] : String(testo)).trim()
}

function natureFamigliaPdf(familyName) {
  const colorKey = COLOR_KEY_BY_FAMILY_NAME[familyName]
  return NATURE_TST.filter((n) => n.colorKey === colorKey)
    .map((n) => ({ nome: n.nome, definizione: primaFrase(getTestoNatura(n.campoDb)?.testo || '') }))
    .sort((x, y) => naturePdfDiFamiglia(colorKey).indexOf(x.nome) - naturePdfDiFamiglia(colorKey).indexOf(y.nome))
}

function qualitiesPdf(familyName) {
  const nomi = natureFamigliaPdf(familyName).map((n) => `alla Natura ${n.nome}`)
  const elenco = nomi.length > 1 ? `${nomi.slice(0, -1).join(', ')} e ${nomi.at(-1)}` : nomi[0] || ''
  return `nature legate ${elenco}`
}

function qualitiesByQualityPdf(familyName) {
  return Object.fromEntries(natureFamigliaPdf(familyName).map((n) => [n.nome, n.definizione]))
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

function resolveBriefQuality({ familyName, sottodisposizione }) {
  // Natura prevalente con il nome del PDF; se manca, la prima natura della famiglia nel PDF.
  const nature = natureFamigliaPdf(familyName).map((n) => n.nome)
  const norm = (v) => String(v || '').trim().toLowerCase()
  return nature.find((nome) => norm(nome) === norm(sottodisposizione)) || nature[0] || ''
}

function buildBriefSummary({ familyName, sottodisposizione, correnteDominante }) {
  const copy = BRIEF_SUMMARY_BY_FAMILY[familyName] || BRIEF_SUMMARY_BY_FAMILY.Verde
  const quality = resolveBriefQuality({ familyName, sottodisposizione, correnteDominante })

  // Step 2 — cosa rappresenta la famiglia: testo originale (fundamentalPleasure +
  // orientation), invariato, solo con la chiarificazione anteposta per Blu.
  const familyParagraphs = []
  if (copy.clarification) familyParagraphs.push(copy.clarification)
  familyParagraphs.push(`In essa emerge ${copy.fundamentalPleasure}.`)
  familyParagraphs.push(`Chi ne fa parte orienta la propria energia emotiva verso ${copy.orientation}.`)

  // Step 3 — la famiglia contiene più nature: testo generico originale.
  const qualitiesByQuality = qualitiesByQualityPdf(familyName in COLOR_KEY_BY_FAMILY_NAME ? familyName : 'Verde')
  const compositionParagraph = `Al suo interno si distinguono ${qualitiesPdf(familyName in COLOR_KEY_BY_FAMILY_NAME ? familyName : 'Verde')}.`

  // Step 5 — natura prevalente: prima frase del suo testo nei «Testi fissi».
  const qualitiesByQualityText = qualitiesByQuality[quality]
  const natureFitParagraph = qualitiesByQualityText ? qualitiesByQualityText : ''

  const deepDiveParagraphs = [...(copy.note ? [copy.note] : []), ...(copy.deepDiveParagraphs || [])]

  return {
    introFamily: copy.family,
    introQuality: quality,
    familyParagraphs,
    compositionParagraph,
    natureFitParagraph,
    qualitiesByQuality,
    deepDiveParagraphs,
  }
}

function capitalizeSentence(text) {
  if (!text) return ''
  const trimmed = text.trim()
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`
}

// Trasforma "Natura {Qualità}" in ipertesto con definizione solo quando il testo
// editoriale della famiglia nomina esplicitamente entrambe le qualità in questo modo
// (oggi: Rosso/Marziale). Per le altre famiglie il testo resta invariato.
function renderCompositionSentence({ compositionParagraph, qualitiesByQuality, activeTip, onToggleTip, idPrefix }) {
  const keys = qualitiesByQuality ? Object.keys(qualitiesByQuality) : []
  const linkableKeys = keys.filter((key) => compositionParagraph.includes(`Natura ${key}`))
  if (linkableKeys.length < 2) return compositionParagraph

  const pattern = new RegExp(`(Natura (?:${linkableKeys.join('|')}))`, 'g')
  return compositionParagraph.split(pattern).map((part, index) => {
    const key = linkableKeys.find((k) => part === `Natura ${k}`)
    if (!key) return part
    const tipId = `${idPrefix}-${key}`
    return (
      <InfoTip
        key={`${tipId}-${index}`}
        term={part}
        tip={capitalizeSentence(qualitiesByQuality[key])}
        open={activeTip === tipId}
        onToggle={() => onToggleTip(tipId)}
      />
    )
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

function familySectionIntro() {
  return [
    'Il tuo profilo non è fatto da una sola famiglia: esplora come si compone il tuo profilo emotivo tramite i grafici.',
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

function OtherFamiliesLine({ families = [] }) {
  if (!families.length) return null
  const nodes = families.map((f) => (
    <strong key={f.name} style={f.colore ? { color: f.colore } : undefined}>
      {f.name}
    </strong>
  ))
  const joined = nodes.reduce((acc, node, i) => {
    if (i === 0) return [node]
    if (i === nodes.length - 1) return [...acc, ' e ', node]
    return [...acc, ', ', node]
  }, [])
  const verb = families.length > 1 ? 'sono presenti le famiglie' : 'è presente la famiglia'
  const suffix = families.length > 1 ? ', in ordine di intensità' : ''
  return (
    <p className="sintesi-editorial-body">
      Nel tuo profilo {verb} {joined}{suffix}.
    </p>
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
  globalProfileContract = null,
  contentCards = null,
  rawRecord = null,
}) {
  const prefersReducedMotion = useReducedMotion()
  const [activeDetailFamily, setActiveDetailFamily] = useState(null)
  const [hoveredFamilyKey, setHoveredFamilyKey] = useState(null)
  // Definizioni delle nature (Volitiva/Collerica, ecc.) esposte come ipertesto: un solo
  // popover aperto alla volta tra i trigger InfoTip di questa sezione.
  const [activeTip, setActiveTip] = useState(null)
  const toggleTip = (id) => setActiveTip((cur) => (cur === id ? null : id))

  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [chartsViewerOpen, setChartsViewerOpen] = useState(false)
  const [desktopSlideIndex, setDesktopSlideIndex] = useState(0)
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

  const briefSummary = buildBriefSummary({
    familyName: dominantFamilyName,
    sottodisposizione,
    correnteDominante,
  })
  const familyIntroParagraphs = familySectionIntro()

  // Lettura compatta della composizione (Livello 1): solo Famiglie principali,
  // quasi-parità e al massimo una componente secondaria — niente formule o marginali.
  const compositionViewModel = useMemo(
    () => buildProgressiveContentViewModel({
      ranking: globalProfileContract?.ranking,
      contentCards: contentCards || {},
    }),
    [globalProfileContract, contentCards],
  )

  // Definizione della natura realmente emersa dal test (briefSummary.introQuality):
  // esposta come ipertesto solo quando il testo editoriale la definisce (es. Verde non
  // ha qualitiesByQuality, nessun ipertesto generato).
  const personalQualityDefinition = briefSummary.qualitiesByQuality?.[briefSummary.introQuality]
    ? capitalizeSentence(briefSummary.qualitiesByQuality[briefSummary.introQuality])
    : ''

  // Altre famiglie realmente significative nel profilo (quasi paritarie tra le primary
  // più l'eventuale companion), per la frase compatta finale: nome nel colore della
  // famiglia, niente badge/etichette separate.
  const otherFamiliesSeen = new Set([dominantFamilyName])
  const otherFamilies = []
  const addOtherFamily = (item) => {
    if (!item) return
    const name = item.content?.nome || item.familyName
    if (!name || otherFamiliesSeen.has(name)) return
    otherFamiliesSeen.add(name)
    otherFamilies.push({ name, colore: item.colore })
  }
  compositionViewModel.primaryFamilies.forEach(addOtherFamily)
  addOtherFamily(compositionViewModel.compactCompanion)

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
      id: 'radar',
      tabLabel: 'Radar 1-7',
      badge: '01 / 04 · Scala 1-7',
      title: 'Punteggio Relativo (Scala 1-7)',
      subtitle: 'Punteggio 1-7 per famiglia — passa il cursore o seleziona un vertice per il dettaglio.',
    },
    {
      id: 'geometria',
      tabLabel: 'Forma Emotiva',
      badge: '02 / 04 · Geometria',
      title: 'La Geometria Emotiva',
      subtitle: 'Mappa della silhouette emotiva: l\'estensione dei petali indica l\'intensità (scala 1–7), mentre il nucleo centrale ne rappresenta l\'equilibrio armonico.',
    },
    {
      id: 'nature',
      tabLabel: 'Nature',
      badge: '03 / 04 · Nature',
      title: 'Correnti e Nature di tutte le famiglie',
      subtitle: `Le nature di ogni famiglia. Prima la prevalente, ${dominantPresenceLabel.title}, poi le altre per peso nel profilo.`,
    },
    {
      id: 'percorso',
      tabLabel: 'Percorso Risposte',
      badge: '04 / 04 · Mappa Passi',
      title: 'Il Percorso delle 72 Risposte',
      subtitle: 'Mappa completa delle 72 risposte ordinate per traccia e intensità emotiva.',
    },
  ]

  const currentSlide = desktopSlides[desktopSlideIndex] || desktopSlides[0]

  // Grafici della sezione 1.2 per il visore mobile: stessi componenti e stessi dati del desktop.
  const mobileChartSlides = isMobileViewport
    ? [
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
        {/* Unified Editorial Summary Card */}
        <div className="sintesi-editorial-card">
          <div className="sintesi-editorial-text">
            <p className="sintesi-editorial-body sintesi-editorial-body--lead">
              La tua famiglia emotiva prevalente è{' '}
              <strong className="sintesi-editorial-highlight">{briefSummary.introFamily}</strong>.
            </p>
            {briefSummary.familyParagraphs.map((paragraph) => (
              <p key={paragraph} className="sintesi-editorial-body">
                {paragraph}
              </p>
            ))}
            <p className="sintesi-editorial-body">
              {renderCompositionSentence({
                compositionParagraph: briefSummary.compositionParagraph,
                qualitiesByQuality: briefSummary.qualitiesByQuality,
                activeTip,
                onToggleTip: toggleTip,
                idPrefix: 'composition',
              })}{' '}
              Nel tuo caso, emerge in particolare la natura{' '}
              {personalQualityDefinition ? (
                <InfoTip
                  term={briefSummary.introQuality}
                  tip={personalQualityDefinition}
                  open={activeTip === 'personal-quality'}
                  onToggle={() => toggleTip('personal-quality')}
                />
              ) : (
                <strong className="sintesi-editorial-highlight">{briefSummary.introQuality}</strong>
              )}.
            </p>
            {briefSummary.deepDiveParagraphs.length > 0 ? (
              <SintesiDisclosure
                id="sintesi-editorial-approfondisci"
                title={`Approfondisci la famiglia ${briefSummary.introFamily}`}
              >
                {briefSummary.deepDiveParagraphs.map((paragraph) => (
                  <p key={paragraph} className="sintesi-correnti__narrative-p">
                    {renderBriefSummaryParagraph(paragraph)}
                  </p>
                ))}
              </SintesiDisclosure>
            ) : null}
            <OtherFamiliesLine families={otherFamilies} />
          </div>
        </div>

        <SectionDivider />

        {/* b) Dati (numeri, percentuali e radar: composizione del profilo, sempre visibile) */}
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

          {/* Sottocorrenti */}
          {summarySottocorrenti.length > 0 ? (
          <div className="sintesi-mobile-subcurrents">
            <h3 className="sintesi-mobile-section-title">
              Correnti della famiglia {dominantPresenceLabel.title.toLowerCase()}
            </h3>
            <p className="sintesi-mobile-explanation">
              All’interno di questa famiglia, il test evidenzia le nature specifiche che
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

        {/* Grafici: su mobile si aprono a tutto schermo e si scorrono di lato */}
        <div className="sintesi-mobile-visuals">
          <h3 className="sintesi-mobile-section-title">Visualizzazione Grafica</h3>
          <p className="sintesi-mobile-explanation">
            La forma visiva del tuo carattere emotivo. Le 5 componenti convivono nello stesso spazio.
          </p>
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

  return (
    <section
      id="prima-sintesi-risultato"
      className="sintesi-correnti"
      aria-labelledby="sintesi-correnti-heading"
      style={{ '--sc-accent': accentColor }}
    >
      <div className="sintesi-correnti__summary">
        {/* Unified Editorial Summary Card */}
        <div className="sintesi-editorial-card">
          <div className="sintesi-editorial-text">
            <p className="sintesi-editorial-body sintesi-editorial-body--lead">
              La tua famiglia emotiva prevalente è{' '}
              <strong className="sintesi-editorial-highlight">{briefSummary.introFamily}</strong>.
            </p>
            {briefSummary.familyParagraphs.map((paragraph) => (
              <p key={paragraph} className="sintesi-editorial-body">
                {paragraph}
              </p>
            ))}
            <p className="sintesi-editorial-body">
              {renderCompositionSentence({
                compositionParagraph: briefSummary.compositionParagraph,
                qualitiesByQuality: briefSummary.qualitiesByQuality,
                activeTip,
                onToggleTip: toggleTip,
                idPrefix: 'composition',
              })}{' '}
              Nel tuo caso, emerge in particolare la natura{' '}
              {personalQualityDefinition ? (
                <InfoTip
                  term={briefSummary.introQuality}
                  tip={personalQualityDefinition}
                  open={activeTip === 'personal-quality'}
                  onToggle={() => toggleTip('personal-quality')}
                />
              ) : (
                <strong className="sintesi-editorial-highlight">{briefSummary.introQuality}</strong>
              )}.
            </p>
            {briefSummary.deepDiveParagraphs.length > 0 ? (
              <SintesiDisclosure
                id="sintesi-editorial-approfondisci"
                title={`Approfondisci la famiglia ${briefSummary.introFamily}`}
              >
                {briefSummary.deepDiveParagraphs.map((paragraph) => (
                  <p key={paragraph} className="sintesi-correnti__narrative-p">
                    {renderBriefSummaryParagraph(paragraph)}
                  </p>
                ))}
              </SintesiDisclosure>
            ) : null}
            <OtherFamiliesLine families={otherFamilies} />
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

          <div className="sintesi-charts-slides-container">
            {/* Navigatore Tabs in alto */}
            <div className="sintesi-charts-tabs" role="tablist" aria-label="Grafici della sintesi">
              {desktopSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={desktopSlideIndex === idx}
                  className={`sintesi-charts-tab-btn${desktopSlideIndex === idx ? ' is-active' : ''}`}
                  onClick={() => setDesktopSlideIndex(idx)}
                >
                  {slide.tabLabel}
                </button>
              ))}
            </div>

            {/* Stage della slide */}
            <div className="sintesi-chart-slide-stage">
              {/* Header */}
              <div className="sintesi-chart-slide-header">
                <div className="sintesi-chart-slide-header-left">
                  <span className="sintesi-chart-slide-badge">{currentSlide.badge}</span>
                  <h3 className="sintesi-chart-slide-title">{currentSlide.title}</h3>
                  <p className="sintesi-chart-slide-subtitle">{currentSlide.subtitle}</p>
                </div>
                <div className="sintesi-chart-slide-arrows">
                  <button
                    type="button"
                    className="sintesi-chart-arrow-btn"
                    onClick={() => setDesktopSlideIndex((prev) => Math.max(0, prev - 1))}
                    disabled={desktopSlideIndex === 0}
                    aria-label="Slide precedente"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="sintesi-chart-arrow-btn"
                    onClick={() => setDesktopSlideIndex((prev) => Math.min(desktopSlides.length - 1, prev + 1))}
                    disabled={desktopSlideIndex === desktopSlides.length - 1}
                    aria-label="Slide successiva"
                  >
                    ›
                  </button>
                </div>
              </div>

              {/* Contenuto della slide */}
              <div className="sintesi-chart-slide-content">
                {desktopSlideIndex === 0 && (
                  <div className="sintesi-slide-single-chart">
                    <div className="sintesi-correnti__total-radar" style={{ width: '100%', maxWidth: 580 }}>
                      <ReportRadarChart
                        data={totalScoreRadarData}
                        color={accentColor}
                        height={420}
                        outerRadius="72%"
                        domain={[1, 7]}
                        className="sintesi-correnti__total-radar-chart"
                        ariaLabel="Grafico radar del total score delle cinque famiglie emotive"
                        onFamilySelect={(key) => {
                          const radarItem = totalScoreRadarData.find((d) => d.familyKey === key)
                          if (radarItem) setActiveDetailFamily(radarItem)
                        }}
                      />
                    </div>
                  </div>
                )}

                {desktopSlideIndex === 1 && (
                  <div className="sintesi-slide-single-chart">
                    <div style={{ width: '100%', maxWidth: 640, minHeight: 480 }}>
                      <EmotionalShape 
                        familiesData={ordered} 
                        height="100%"
                        activeFamilyKey={hoveredFamilyKey || activeDetailFamily?.familyKey}
                        onFamilySelect={(key) => {
                          const radarItem = totalScoreRadarData.find((d) => d.familyKey === key)
                          if (radarItem) setActiveDetailFamily(radarItem)
                        }}
                        onFamilyHover={setHoveredFamilyKey}
                      />
                    </div>
                  </div>
                )}

                {desktopSlideIndex === 2 && (
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

                {desktopSlideIndex === 3 && (
                  <div className="sintesi-slide-single-chart" style={{ width: '100%' }}>
                    <PercorsoRisposte record={rawRecord} />
                  </div>
                )}
              </div>

              {/* Footer della slide */}
              <div className="sintesi-chart-slide-footer">
                <button
                  type="button"
                  className="sintesi-chart-nav-text-btn"
                  onClick={() => setDesktopSlideIndex((prev) => Math.max(0, prev - 1))}
                  disabled={desktopSlideIndex === 0}
                >
                  ← Precedente
                </button>
                <div className="sintesi-chart-slide-dots" aria-label="Indicatori slide">
                  {desktopSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      className={`sintesi-chart-dot${desktopSlideIndex === idx ? ' is-active' : ''}`}
                      onClick={() => setDesktopSlideIndex(idx)}
                      aria-label={`Vai a slide ${idx + 1}: ${slide.tabLabel}`}
                      aria-current={desktopSlideIndex === idx ? 'true' : undefined}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="sintesi-chart-nav-text-btn"
                  onClick={() => setDesktopSlideIndex((prev) => Math.min(desktopSlides.length - 1, prev + 1))}
                  disabled={desktopSlideIndex === desktopSlides.length - 1}
                >
                  Successiva →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
