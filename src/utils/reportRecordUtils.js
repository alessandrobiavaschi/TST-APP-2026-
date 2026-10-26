import { testSchema } from '../dbSchema.js'
import { FAMILY_ORDER, FAMILY_THEME } from '../config/reportFamilyTheme.js'
import { CAMPI_PER_COLORE, PASSI, SEZIONI } from '../config/tstSistema.js'
import { MASSIMI_TEORICI, calcolaCeste, normalizzaSuMassimo } from './cesteTst.js'
import { massimiDelTest, massimiPerRecord, opzioniCalcoloDelTest } from './testStorici.js'
import {
  STATO_ANIMO_FINALE_OPTIONS,
  DIFFICOLTA_DETTAGLIO_OPTIONS,
  AREE_TEST,
} from '../config/domandeFinali.js'

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
  const { perSezione, rapporti } = calcolaCeste(rawRecord, opzioniCalcoloDelTest(rawRecord))
  const massimi = massimiDelTest(rawRecord) || MASSIMI_TEORICI
  const sezioniTotals = Object.fromEntries(REPORT_SECTION_DEFS.map((section) => [section.key, perSezione[section.key]]))
  const sezioniData = REPORT_SECTION_DEFS.map((section) =>
    colorTotalsToChartRow(section.label, sezioniTotals[section.key]),
  )
  const rapportiPunteggi = Object.fromEntries(
    Object.entries(rapporti).map(([id, tot]) => [id, normalizzaSuMassimo(tot, massimi.rapporti[id])]),
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
  if (hasRawAnswers(record)) return { ...calcolaCeste(record, opzioniCalcoloDelTest(record)).famiglie }
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
  return normalizzaSuMassimo(computeColorTotals(record), (massimiDelTest(record) || MASSIMI_TEORICI).famiglie)
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
 * Divide un totale intero (es. la percentuale di una famiglia) tra più voci in
 * proporzione ai loro valori, con arrotondamento a resto maggiore: le parti intere
 * sommano sempre esattamente a `totale`. Se tutti i valori sono 0 restituisce zeri.
 */
export function ripartisciTotaleIntero(values = [], totale = 0) {
  const safe = values.map((v) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : 0))
  const sum = safe.reduce((a, b) => a + b, 0)
  const target = Math.max(0, Math.round(Number(totale) || 0))
  if (sum <= 0 || target <= 0) return safe.map(() => 0)
  const raw = safe.map((v) => (v / sum) * target)
  const out = raw.map((r) => Math.floor(r))
  const resti = raw.map((r, idx) => ({ idx, frac: r - out[idx] }))
    .sort((a, b) => b.frac - a.frac || a.idx - b.idx)
  const diff = target - out.reduce((a, b) => a + b, 0)
  for (let i = 0; i < diff; i++) out[resti[i].idx] += 1
  return out
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

/**
 * Famiglia prevalente: confronto sui punteggi normalizzati sul massimo teorico.
 * `record` (facoltativo) sceglie i massimi del modello con cui è stato fatto il test.
 */
export function getDominantColorInfo(totals = {}, record) {
  const scores = normalizzaSuMassimo(totals, massimiPerRecord(record).famiglie)
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

/**
 * Formatta un valore di cella conforme allo standard RFC 4180.
 * Risolve bug di serializzazione come [object Object] per Timestamp Firestore e Date.
 */
export function formatCellValue(value) {
  if (value == null) return ''
  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString()
  }
  if (typeof value === 'object' && ('seconds' in value || '_seconds' in value)) {
    const s = value.seconds ?? value._seconds
    const ms = ('nanoseconds' in value ? value.nanoseconds : (value._nanoseconds || 0)) / 1e6
    const d = new Date(s * 1000 + ms)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString()
  }
  if (typeof value === 'object') {
    return ''
  }
  const str = String(value)
  if (str === '[object Object]') return ''
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Calcola l'età esatta in anni compiuti al momento del test.
 */
export function computeAge(birthDate, testDate) {
  if (!birthDate) return ''
  let b = null
  if (typeof birthDate?.toDate === 'function') b = birthDate.toDate()
  else if (birthDate instanceof Date) b = birthDate
  else if (typeof birthDate === 'object' && ('seconds' in birthDate || '_seconds' in birthDate)) {
    b = new Date((birthDate.seconds ?? birthDate._seconds) * 1000)
  } else {
    b = new Date(birthDate)
  }
  if (!b || Number.isNaN(b.getTime())) return ''

  let ref = null
  if (testDate) {
    if (typeof testDate?.toDate === 'function') ref = testDate.toDate()
    else if (testDate instanceof Date) ref = testDate
    else if (typeof testDate === 'object' && ('seconds' in testDate || '_seconds' in testDate)) {
      ref = new Date((testDate.seconds ?? testDate._seconds) * 1000)
    } else {
      ref = new Date(testDate)
    }
  }
  if (!ref || Number.isNaN(ref.getTime())) ref = new Date()

  let age = ref.getFullYear() - b.getFullYear()
  const m = ref.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && ref.getDate() < b.getDate())) {
    age -= 1
  }
  return age >= 0 ? age : ''
}

/**
 * Ricava un ID pseudonimizzato e anonimo (GDPR compliant).
 * Non restituisce MAI nome o cognome in chiaro.
 */
export function getPseudonymId(record = {}) {
  const raw = record?.raw || record || {}
  const candidate = String(record?.id || raw.ID_Utente || '').trim()
  const fullName = [raw.Nome, raw.Cognome].filter(Boolean).map((s) => String(s).trim()).join(' ')
  if (candidate && (!fullName || (candidate !== fullName && !candidate.includes(fullName)))) {
    return candidate
  }
  const seed = `${fullName}_${raw.Data_Test || ''}_${raw.Data_Nascita || ''}`
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const hex = Math.abs(hash).toString(16).padStart(6, '0').slice(-6).toUpperCase()
  return `SUBJ_${hex}`
}

/**
 * Intestazioni canoniche per la Matrice Dati Standard di Ricerca Sociale (SPSS / R / Stata).
 */
export const RESEARCH_MATRIX_HEADERS = Object.freeze([
  'ID_Soggetto',
  'Data_Test',
  'Data_Nascita',
  'Eta',
  'Titolo_Studio',
  'Pratica_Musicale',
  'Strumento_Suonato',
  // 72 item grezzi
  ...Array.from({ length: 72 }, (_, i) => `File_${String(i + 1).padStart(2, '0')}`),
  // Portato esperienziale
  'PE_Simpatia',
  'PE_Antipatia',
  'PE_Indifferenza',
  'Portato_Esperienziale_Prevalente',
  // 12 nature emotive
  'BLU_1_Depressiva',
  'BLU_2_Lunare',
  'BLU_3_Nostalgia',
  'BLU_4_Solare',
  'ROSSO_1_Assertivita',
  'ROSSO_2_Dubbio_Collera',
  'VERDE_1_CalmaContemplativa',
  'VERDE_2_CalmaFisica',
  'GIALLO_1_Gioia_Entusiasmo',
  'GIALLO_2_Volitivo_Passionale',
  'GRIGIO_1_Anaffettiva',
  'GRIGIO_2_Distaccata',
  // 5 totali di famiglia colore
  'Totale_BLU',
  'Totale_ROSSO',
  'Totale_VERDE',
  'Totale_GIALLO',
  'Totale_GRIGIO',
  // Disposizioni sintetiche
  'Disposizione_Prevalente',
  'Sottodisposizione_Prevalente',
  // Stato d animo e dummy dicotomiche 0/1
  'Stato_Animo_Finale',
  ...STATO_ANIMO_FINALE_OPTIONS.map((o) => o.value),
  // Difficoltà test e dummy dicotomiche 0/1
  'Difficolta_Test',
  'Difficolta_Dettaglio',
  ...DIFFICOLTA_DETTAGLIO_OPTIONS.map((o) => o.value),
  // Aree agio e dummy dicotomiche 0/1
  'Area_Maggior_Agio',
  ...AREE_TEST.map((a) => `Area_Maggior_Agio_${a.value}`),
  'Area_Minor_Agio',
  ...AREE_TEST.map((a) => `Area_Minor_Agio_${a.value}`),
  // Feedback e metadati
  'Qualita_Suoni',
  'Osservazioni_Finali',
  'Data_Ora_Fine_Test',
  'versione_modello',
])

/**
 * Costruisce una riga per la Matrice Dati Standard di Ricerca Sociale.
 */
export function buildResearchMatrixRow(record = {}) {
  const raw = record?.raw || record || {}
  const colorTotals = computeColorTotals(raw)
  const idSoggetto = getPseudonymId(record)
  const eta = computeAge(raw.Data_Nascita, raw.Data_Test)

  const parseCodes = (str) =>
    String(str || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

  const statiAnimo = parseCodes(raw.Stato_Animo_Finale)
  const difficoltaDettagli = parseCodes(raw.Difficolta_Dettaglio)
  const areeMaggiorAgio = parseCodes(raw.Area_Maggior_Agio).map((c) => c.toUpperCase())
  const areeMinorAgio = parseCodes(raw.Area_Minor_Agio).map((c) => c.toUpperCase())

  const formatDateOnly = (val) => {
    if (val == null) return ''
    if (typeof val?.toDate === 'function') return val.toDate().toISOString().slice(0, 10)
    if (val instanceof Date) return Number.isNaN(val.getTime()) ? '' : val.toISOString().slice(0, 10)
    if (typeof val === 'object' && ('seconds' in val || '_seconds' in val)) {
      const s = val.seconds ?? val._seconds
      const d = new Date(s * 1000)
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
    }
    const str = String(val).trim()
    if (str === '[object Object]') return ''
    return str.slice(0, 10)
  }

  const rowMap = {
    ID_Soggetto: idSoggetto,
    Data_Test: formatDateOnly(raw.Data_Test),
    Data_Nascita: formatDateOnly(raw.Data_Nascita),
    Eta: eta,
    Titolo_Studio: raw.Titolo_Studio || '',
    Pratica_Musicale: raw.Pratica_Musicale || '',
    Strumento_Suonato: raw.Strumento_Suonato || '',
  }

  for (let i = 1; i <= 72; i += 1) {
    const key = `File_${String(i).padStart(2, '0')}`
    rowMap[key] = raw[key] ?? ''
  }

  rowMap.PE_Simpatia = raw.PE_Simpatia ?? 0
  rowMap.PE_Antipatia = raw.PE_Antipatia ?? 0
  rowMap.PE_Indifferenza = raw.PE_Indifferenza ?? 0
  rowMap.Portato_Esperienziale_Prevalente = raw.Portato_Esperienziale_Prevalente || ''

  rowMap.BLU_1_Depressiva = raw.BLU_1_Depressiva ?? 0
  rowMap.BLU_2_Lunare = raw.BLU_2_Lunare ?? 0
  rowMap.BLU_3_Nostalgia = raw.BLU_3_Nostalgia ?? 0
  rowMap.BLU_4_Solare = raw.BLU_4_Solare ?? 0
  rowMap.ROSSO_1_Assertivita = raw.ROSSO_1_Assertivita ?? 0
  rowMap.ROSSO_2_Dubbio_Collera = raw.ROSSO_2_Dubbio_Collera ?? 0
  rowMap.VERDE_1_CalmaContemplativa = raw.VERDE_1_CalmaContemplativa ?? 0
  rowMap.VERDE_2_CalmaFisica = raw.VERDE_2_CalmaFisica ?? 0
  rowMap.GIALLO_1_Gioia_Entusiasmo = raw.GIALLO_1_Gioia_Entusiasmo ?? 0
  rowMap.GIALLO_2_Volitivo_Passionale = raw.GIALLO_2_Volitivo_Passionale ?? 0
  rowMap.GRIGIO_1_Anaffettiva = raw.GRIGIO_1_Anaffettiva ?? 0
  rowMap.GRIGIO_2_Distaccata = raw.GRIGIO_2_Distaccata ?? 0

  rowMap.Totale_BLU = colorTotals.blu ?? 0
  rowMap.Totale_ROSSO = colorTotals.rosso ?? 0
  rowMap.Totale_VERDE = colorTotals.verde ?? 0
  rowMap.Totale_GIALLO = colorTotals.giallo ?? 0
  rowMap.Totale_GRIGIO = colorTotals.grigio ?? 0

  rowMap.Disposizione_Prevalente = raw.Disposizione_Prevalente || ''
  rowMap.Sottodisposizione_Prevalente = raw.Sottodisposizione_Prevalente || ''

  rowMap.Stato_Animo_Finale = raw.Stato_Animo_Finale || ''
  STATO_ANIMO_FINALE_OPTIONS.forEach((opt) => {
    rowMap[opt.value] = statiAnimo.includes(opt.value) ? 1 : 0
  })

  rowMap.Difficolta_Test = raw.Difficolta_Test || ''
  rowMap.Difficolta_Dettaglio = raw.Difficolta_Dettaglio || ''
  DIFFICOLTA_DETTAGLIO_OPTIONS.forEach((opt) => {
    rowMap[opt.value] = difficoltaDettagli.includes(opt.value) ? 1 : 0
  })

  rowMap.Area_Maggior_Agio = raw.Area_Maggior_Agio || ''
  AREE_TEST.forEach((area) => {
    rowMap[`Area_Maggior_Agio_${area.value}`] = areeMaggiorAgio.includes(area.value) ? 1 : 0
  })

  rowMap.Area_Minor_Agio = raw.Area_Minor_Agio || ''
  AREE_TEST.forEach((area) => {
    rowMap[`Area_Minor_Agio_${area.value}`] = areeMinorAgio.includes(area.value) ? 1 : 0
  })

  rowMap.Qualita_Suoni = raw.Qualita_Suoni || ''
  rowMap.Osservazioni_Finali = raw.Osservazioni_Finali || ''
  rowMap.Data_Ora_Fine_Test = formatCellValue(raw.Data_Ora_Fine_Test)
  rowMap.versione_modello = raw.versione_modello || ''

  return RESEARCH_MATRIX_HEADERS.map((header) => formatCellValue(rowMap[header]))
}

/**
 * Genera il contenuto testuale CSV della matrice di ricerca per uno o più record.
 */
export function buildResearchMatrixCsv(records = []) {
  const safeRecords = Array.isArray(records) ? records : [records].filter(Boolean)
  const rows = safeRecords.map((r) => buildResearchMatrixRow(r).join(','))
  return [RESEARCH_MATRIX_HEADERS.join(','), ...rows].join('\n')
}

/**
 * Scarica il file CSV conforme alla Matrice Dati Standard di Ricerca Sociale.
 */
export function downloadResearchMatrixCsv(records = [], filename = 'tst_matrice_ricerca_standard.csv') {
  const csvContent = buildResearchMatrixCsv(records)
  if (typeof document === 'undefined') return csvContent
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return csvContent
}

/**
 * Scarica la matrice dati del singolo test conforme allo Standard di Ricerca Sociale
 * (anonima, con Età calcolata, variabili dummy 0/1 per risposte multiple, date ISO RFC 4180).
 */
export function downloadCsvSingleRecord(record) {
  if (!record || !record.raw) return
  const id = getPseudonymId(record)
  const safeFilename = `tst_matrice_ricerca_${id}.csv`
  return downloadResearchMatrixCsv([record], safeFilename)
}

/**
 * Calcola il nome file standard per il download della matrice di un singolo record.
 */
export function getSingleRecordMatrixFilename(record) {
  if (!record || !record.raw) return 'tst_matrice_singola.csv'
  const idFromRaw = [record.raw.Nome, record.raw.Cognome]
    .filter(Boolean)
    .join('_')
    .trim()
    .replace(/\s+/g, '_')
  const safeName = idFromRaw.replace(/[^a-zA-Z0-9à-úÀ-Ú_]/g, '') || 'test'
  const dateStr = record.raw.Data_Ora_Fine_Test || record.raw.Data_Test
  let dateSuffix = ''
  if (dateStr) {
    if (typeof dateStr?.toDate === 'function') {
      dateSuffix = `_${dateStr.toDate().toISOString().slice(0, 10)}`
    } else if (dateStr instanceof Date) {
      dateSuffix = `_${dateStr.toISOString().slice(0, 10)}`
    } else {
      const match = String(dateStr).match(/\d{4}-\d{2}-\d{2}/)
      if (match) {
        dateSuffix = `_${match[0]}`
      } else {
        const cleaned = String(dateStr).slice(0, 10).replace(/[^0-9]/g, '')
        if (cleaned) dateSuffix = `_${cleaned}`
      }
    }
  }
  return `tst_matrice_${safeName}${dateSuffix}.csv`
}

/**
 * Genera il contenuto CSV per la matrice di un singolo record conforme a testSchema (con areaId).
 */
export function buildSingleRecordMatrixCsv(record) {
  if (!record || !record.raw) return ''
  const headerKeys = Object.keys(testSchema)
  const header = ['id', 'areaId', ...headerKeys]

  const idFromRaw = (raw) =>
    [raw?.Nome, raw?.Cognome].filter((v) => v != null && String(v).trim()).join(' ').trim() || ''
  const id = formatCellValue(idFromRaw(record.raw))
  const areaId = formatCellValue(record.raw.areaId || '')
  const row = [id, areaId, ...headerKeys.map((key) => formatCellValue(record.raw[key]))].join(',')
  return [header.join(','), row].join('\n')
}

/**
 * Scarica la matrice gestionale completa (backup Firestore con schema originale) di un singolo record.
 */
export function downloadCsvSingleRecordGestionale(record, customFilename) {
  if (!record || !record.raw) return
  const filename = customFilename || getSingleRecordMatrixFilename(record)
  const csvContent = buildSingleRecordMatrixCsv(record)

  if (typeof document === 'undefined') return csvContent
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  return csvContent
}
