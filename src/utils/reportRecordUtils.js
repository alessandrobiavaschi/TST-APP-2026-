import { testSchema } from '../dbSchema.js'
import {
  computeScoreDeltaForAnswer,
  getQuestionGroupForFile,
  getLogicTypeForFile,
} from '../testLogic.js'

const REPORT_SECTION_DEFS = [
  { key: 'A_TIMBRO', label: 'Timbro', from: 1, to: 28 },
  { key: 'B_INTERVALLI', label: 'Intervalli', from: 29, to: 41 },
  { key: 'C_RITMO', label: 'Ritmo', from: 42, to: 51 },
  { key: 'D_MELODIA', label: 'Melodia', from: 52, to: 58 },
  { key: 'E_ARMONIA', label: 'Armonia', from: 59, to: 72 },
]

function emptyColorTotals() {
  return { blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }
}

function correnteKeyToColorKey(key) {
  if (!key) return null
  if (key.startsWith('BLU_')) return 'blu'
  if (key.startsWith('ROSSO_')) return 'rosso'
  if (key.startsWith('VERDE_')) return 'verde'
  if (key.startsWith('GIALLO_')) return 'giallo'
  if (key.startsWith('GRIGIO_')) return 'grigio'
  return null
}

/** File → macro sezione (Timbro … Armonia), come da manuale TST. */
export function getReportSectionForFile(fileNumber) {
  for (const section of REPORT_SECTION_DEFS) {
    if (fileNumber >= section.from && fileNumber <= section.to) return section.key
  }
  return null
}

function sumSectionTotals(sezioniTotals, sectionKeys) {
  const out = emptyColorTotals()
  sectionKeys.forEach((key) => {
    const totals = sezioniTotals[key]
    if (!totals) return
    out.blu += totals.blu
    out.rosso += totals.rosso
    out.verde += totals.verde
    out.giallo += totals.giallo
    out.grigio += totals.grigio
  })
  return out
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
 * Ricostruisce i totali per famiglia colore in ciascuna delle 5 sezioni del test
 * (replay di computeScoreDeltaForAnswer sui File_01…File_72).
 */
export function computeSezioniTotalsFromRaw(rawRecord = {}) {
  const sezioniTotals = REPORT_SECTION_DEFS.reduce((acc, section) => {
    acc[section.key] = emptyColorTotals()
    return acc
  }, {})

  for (let fileNumber = 1; fileNumber <= 72; fileNumber += 1) {
    const fileKey = `File_${String(fileNumber).padStart(2, '0')}`
    const rawAnswer = rawRecord[fileKey]
    if (!rawAnswer) continue

    const reportSection = getReportSectionForFile(fileNumber)
    if (!reportSection) continue

    const group = getQuestionGroupForFile(fileNumber)
    const logicType = getLogicTypeForFile(fileNumber)
    if (!logicType) continue

    const params = {
      fileNumber,
      isConfirmation: group === 'C_BIS',
    }

    if (
      logicType === 'AFFINITA_BASE' ||
      logicType === 'AFFINITA_ECCEZIONE' ||
      logicType === 'AFFINITA_STANDARD'
    ) {
      params.affinitaOptionId = rawAnswer
    } else {
      params.answerLabel = rawAnswer
    }

    const delta = computeScoreDeltaForAnswer(params)
    if (!delta || Object.keys(delta).length === 0) continue

    Object.entries(delta).forEach(([key, value]) => {
      const colorKey = correnteKeyToColorKey(key)
      if (!colorKey) return
      sezioniTotals[reportSection][colorKey] += value
    })
  }

  const sezioniData = REPORT_SECTION_DEFS.map((section) =>
    colorTotalsToChartRow(section.label, sezioniTotals[section.key]),
  )

  const rapporti = {
    natura: sumSectionTotals(sezioniTotals, ['A_TIMBRO', 'B_INTERVALLI', 'E_ARMONIA']),
    se: sumSectionTotals(sezioniTotals, ['B_INTERVALLI', 'D_MELODIA']),
    altro: sumSectionTotals(sezioniTotals, ['A_TIMBRO', 'D_MELODIA']),
    agire: sumSectionTotals(sezioniTotals, ['C_RITMO', 'D_MELODIA']),
  }

  return { sezioniTotals, sezioniData, rapporti }
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

export function computeColorTotals(record = {}) {
  const blu =
    (record.BLU_1_Depressiva || 0) +
    (record.BLU_2_Lunare || 0) +
    (record.BLU_3_Nostalgia || 0) +
    (record.BLU_4_Solare || 0)
  const rosso =
    (record.ROSSO_1_Assertivita || 0) +
    (record.ROSSO_2_Dubbio_Collera || 0)
  const verde = record.VERDE_1_Calma || 0
  const giallo =
    (record.GIALLO_1_Gioia_Entusiasmo || 0) +
    (record.GIALLO_2_Volitivo_Passionale || 0)
  const grigio =
    (record.GRIGIO_1_Distaccato_Nichilista || 0) +
    (record.GRIGIO_2_Intellettuale_Saggio || 0)

  return { blu, rosso, verde, giallo, grigio }
}

export const DOMINANT_COLOR_NAME_BY_KEY = {
  blu: 'Blu',
  rosso: 'Rosso',
  verde: 'Verde',
  giallo: 'Giallo',
  grigio: 'Grigio',
}

export function getDominantColorInfo(totals = {}) {
  const normalizedTotals = {
    blu: Number(totals.blu) || 0,
    rosso: Number(totals.rosso) || 0,
    verde: Number(totals.verde) || 0,
    giallo: Number(totals.giallo) || 0,
    grigio: Number(totals.grigio) || 0,
  }
  const [dominantKey] = Object.entries(normalizedTotals).reduce(
    (acc, cur) => (cur[1] > acc[1] ? cur : acc),
    ['blu', 0],
  )
  return {
    dominantKey,
    dominantColorName: DOMINANT_COLOR_NAME_BY_KEY[dominantKey] || 'Blu',
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
