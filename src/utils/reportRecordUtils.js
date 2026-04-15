import { testSchema } from '../dbSchema.js'

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
