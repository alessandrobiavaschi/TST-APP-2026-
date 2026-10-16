import { testSchema } from '../dbSchema.js'
import { FAMILY_ORDER, FAMILY_THEME } from '../config/reportFamilyTheme.js'
import { CAMPI_PER_COLORE, PASSI, SEZIONI } from '../config/tstSistema.js'
import { MASSIMI_TEORICI, calcolaCeste, normalizzaSuMassimo } from './cesteTst.js'
import { regoleDelTest } from './testStorici.js'

const REPORT_SECTION_DEFS = SEZIONI.map((s) => ({ key: s.id, label: s.nome, from: s.da, to: s.a }))

/** true se il record contiene almeno una risposta grezza (File_01 … File_72). */
export function hasRawAnswers(record = {}) {
  return PASSI.some((passo) => String(record?.[passo.campoDb] || '').trim() !== '')
}

/** File → macro sezione (Timbro … Armonia), come da manuale TST. */
export function getReportSectionForFile(fileNumber) {
  for (const section of REPORT_SECTION_DEFS) {
    if (fileNumber >= section.from && fileNumber <= section.to) return section.key
  }
  return null
}

function colorTotalsToChartRow(label, totals) {
  return {
    nome: label,
    Blu: totals.blu,
    Rosso: totals.rosso,
    Verde: totals.verde,
    Giallo: totals.giallo,
    Grigio: totals.grigio,
  }
}

/**
 * Totali per famiglia colore in ciascuna delle 5 sezioni del test e nei 4 rapporti,
 * ricalcolati dalle risposte grezze con il motore a ceste (src/utils/cesteTst.js).
 * `rapportiPunteggi` = stessi totali portati sul massimo teorico di ogni rapporto (0–100).
 */
export function computeSezioniTotalsFromRaw(rawRecord = {}) {
  const { perSezione, rapporti } = calcolaCeste(rawRecord, { regolePerPasso: regoleDelTest(rawRecord) })
  const sezioniTotals = Object.fromEntries(REPORT_SECTION_DEFS.map((section) => [section.key, perSezione[section.key]]))
  const sezioniData = REPORT_SECTION_DEFS.map((section) =>
    colorTotalsToChartRow(section.label, sezioniTotals[section.key]),
  )
  const rapportiPunteggi = Object.fromEntries(
    Object.entries(rapporti).map(([id, tot]) => [id, normalizzaSuMassimo(tot, MASSIMI_TEORICI.rapporti[id])]),
  )
  return { sezioniTotals, sezioniData, rapporti, rapportiPunteggi }
}

/** Totali aggregati per i 4 rapporti (natura, se, altro, agire). */
export function computeRapportiTotalsFromRaw(rawRecord = {}) {
  return computeSezioniTotalsFromRaw(rawRecord).rapporti
}

export function formatDateShort(value) {
  if (!value) return ''
  let date
  if (value.toDate) {
    date = value.toDate()
  } else {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) return ''
    date = parsed
  }
  return date.toLocaleDateString('it-IT')
}

/**
 * Punti grezzi per famiglia colore. Se il record ha le risposte grezze, i punti
 * si ricalcolano dalle ceste (regole attuali, o quelle della sua epoca per i
 * test storici: vedi testStorici.js); altrimenti si sommano i contatori salvati.
 * Un test storico che non si riesce a verificare mostra i totali salvati.
 */
export function computeColorTotals(record = {}) {
  const storica = record?._letturaStorica
  if (storica && !storica.verificato) return { ...storica.famiglie }
  if (hasRawAnswers(record)) return { ...calcolaCeste(record, { regolePerPasso: regoleDelTest(record) }).famiglie }
  const n = (value) => Number(value) || 0
  return Object.fromEntries(
    Object.entries(CAMPI_PER_COLORE).map(([colorKey, campi]) => [
      colorKey,
      campi.reduce((sum, campo) => sum + n(record[campo]), 0),
    ]),
  )
}

/** Punteggio 0–100 di ogni famiglia sul proprio massimo teorico (base per prevalenze e confronti). */
export function computeColorScores(record = {}) {
  return normalizzaSuMassimo(computeColorTotals(record))
}

export function allocateRoundedPercentages(values = []) {
  const safeValues = values.map((value) => {
    const numericValue = Number(value)
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0
  })
  const sum = safeValues.reduce((a, b) => a + b, 0)
  if (sum <= 0) {
    return safeValues.map(() => 0)
  }

  const pctRaw = safeValues.map(v => (v / sum) * 100)
  const pctRounded = pctRaw.map(p => Math.floor(p))
  const roundedSum = pctRounded.reduce((a, b) => a + b, 0)

  const remainders = pctRaw.map((p, idx) => ({ idx, frac: p - pctRounded[idx] }))
  remainders.sort((a, b) => b.frac - a.frac || a.idx - b.idx)

  const diff = 100 - roundedSum
  for (let i = 0; i < diff; i++) {
    pctRounded[remainders[i].idx] += 1
  }

  return pctRounded
}

/**
 * Peso relativo delle famiglie come in un grafico a torta: punti della famiglia
 * diviso punti totali, × 100. Le 5 percentuali sommano sempre a 100 (arrotondamento
 * a resto maggiore). Il radar 1-7 è un calcolo separato (normalizeLevels).
 */
export function computeRelativePercentages(totals = {}) {
  const keys = ['verde', 'blu', 'rosso', 'giallo', 'grigio']
  const values = keys.map(k => Number(totals?.[k]) || 0)
  const pctRounded = allocateRoundedPercentages(values)

  const result = {}
  keys.forEach((k, idx) => {
    result[k] = pctRounded[idx]
  })
  return result
}

export const DOMINANT_COLOR_NAME_BY_KEY = {
  blu: 'Blu',
  rosso: 'Rosso',
  verde: 'Verde',
  giallo: 'Giallo',
  grigio: 'Grigio',
}

/**
 * Ordine canonico di tie-break sui pareggi tra famiglie: stessa policy usata per
 * costruire `reportData.correnti[]` (vedi FAMILY_ORDER in config/reportFamilyTheme.js),
 * cosi' la famiglia "dominante" annunciata coincide sempre con la prima riga a parità
 * di punteggio nella classifica famiglie.
 */
const TIE_BREAK_KEY_ORDER = FAMILY_ORDER.map((familyName) => FAMILY_THEME[familyName].key)

/** Famiglia prevalente: confronto sui punteggi normalizzati sul massimo teorico. */
export function getDominantColorInfo(totals = {}) {
  const scores = normalizzaSuMassimo(totals)
  let dominantKey = TIE_BREAK_KEY_ORDER[0]
  let dominantValue = Number(scores[dominantKey]) || 0
  for (let i = 1; i < TIE_BREAK_KEY_ORDER.length; i += 1) {
    const key = TIE_BREAK_KEY_ORDER[i]
    const value = Number(scores[key]) || 0
    if (value > dominantValue) {
      dominantValue = value
      dominantKey = key
    }
  }
  return {
    dominantKey,
    dominantColorName: DOMINANT_COLOR_NAME_BY_KEY[dominantKey] || DOMINANT_COLOR_NAME_BY_KEY[TIE_BREAK_KEY_ORDER[0]],
  }
}

export function normalizeLevels(totals) {
  const values = Object.values(totals)
  const max = Math.max(...values, 0)
  const result = {}
  Object.entries(totals).forEach(([key, value]) => {
    if (max <= 0) {
      result[key] = 1
    } else if (value <= 0) {
      result[key] = 1
    } else {
      const scaled = Math.round((value / max) * 7)
      result[key] = Math.min(7, Math.max(1, scaled))
    }
  })
  return result
}

/** Scarica la matrice dati (100 colonne) del singolo test come CSV. */
export function downloadCsvSingleRecord(record) {
  if (!record || !record.raw) return
  const headerKeys = Object.keys(testSchema)
  const header = ['id', ...headerKeys]

  const escapeValue = (value) => {
    if (value == null) return ''
    if (value.toDate) {
      return value.toDate().toISOString()
    }
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const idFromRaw = (raw) => [raw?.Nome, raw?.Cognome].filter((v) => v != null && String(v).trim()).join(' ').trim() || ''
  const id = escapeValue(idFromRaw(record.raw))
  const row = [id, ...headerKeys.map((key) => escapeValue(record.raw[key]))].join(',')
  const csvContent = [header.join(','), row].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'tst_matrice_dati.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
