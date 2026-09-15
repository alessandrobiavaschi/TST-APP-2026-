import { computeColorTotals } from './reportRecordUtils.js'

export const DISPOSITION_LABEL_BY_COLOR = Object.freeze({
  blu: 'Malinconia',
  rosso: 'Volitività',
  giallo: 'Entusiasmo',
  verde: 'Calma',
  grigio: 'Anaffettività',
})

const CURRENT_KEYS_BY_COLOR = Object.freeze({
  blu: ['BLU_1_Depressiva', 'BLU_2_Lunare', 'BLU_3_Nostalgia', 'BLU_4_Solare'],
  rosso: ['ROSSO_1_Assertivita', 'ROSSO_2_Dubbio_Collera'],
  verde: ['VERDE_1_CalmaContemplativa', 'VERDE_2_CalmaFisica'],
  giallo: ['GIALLO_1_Gioia_Entusiasmo', 'GIALLO_2_Volitivo_Passionale'],
  grigio: ['GRIGIO_1_Anaffettiva'],
})

const SUBDISPOSITION_LABEL_BY_KEY = Object.freeze({
  BLU_1_Depressiva: 'Depressiva',
  BLU_2_Lunare: 'Lunare',
  BLU_3_Nostalgia: 'Nostalgica',
  BLU_4_Solare: 'Solare',
  ROSSO_1_Assertivita: 'Fermezza volitiva',
  ROSSO_2_Dubbio_Collera: 'Rabbia / Collera',
  VERDE_1_CalmaContemplativa: 'Calma contemplativa',
  VERDE_2_CalmaFisica: 'Calma fisica',
  GIALLO_1_Gioia_Entusiasmo: 'Gioia / Entusiasmo',
  GIALLO_2_Volitivo_Passionale: 'Volitivo / Passionale',
  GRIGIO_1_Anaffettiva: 'Anaffettiva',
})

/**
 * Politica metodologica per le parità. I campi storici accettano un solo
 * valore: a parità vince il primo candidato nell'ordine dichiarato.
 */
export const TIE_BREAK_POLICY = 'stable-declared-order'

export function findPositiveMaximum(entries) {
  let bestKey = ''
  let bestValue = 0
  entries.forEach(([key, value]) => {
    const numeric = Number(value) || 0
    if (numeric > bestValue) {
      bestKey = key
      bestValue = numeric
    }
  })
  return bestKey
}

export function getDominantDispositionKey(record = {}) {
  return findPositiveMaximum(Object.entries(computeColorTotals(record)))
}

export function getDominantDisposition(record = {}) {
  return DISPOSITION_LABEL_BY_COLOR[getDominantDispositionKey(record)] || ''
}

export function getDominantSubdisposition(record = {}) {
  const colorKey = getDominantDispositionKey(record)
  const currentKey = findPositiveMaximum(
    (CURRENT_KEYS_BY_COLOR[colorKey] || []).map((key) => [key, record[key]]),
  )
  return SUBDISPOSITION_LABEL_BY_KEY[currentKey] || ''
}

export function getDominantExperientialCarry(record = {}) {
  const key = findPositiveMaximum([
    ['Simpatia', record.PE_Simpatia],
    ['Antipatia', record.PE_Antipatia],
    ['Indifferenza', record.PE_Indifferenza],
  ])
  return key
}

/** Deriva in un solo punto i campi finali persistiti e poi consumati dal report. */
export function computeTestResultFields(record = {}) {
  const fields = {
    Disposizione_Prevalente: getDominantDisposition(record),
    Sottodisposizione_Prevalente: getDominantSubdisposition(record),
    Portato_Esperienziale_Prevalente: getDominantExperientialCarry(record),
  }
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => Boolean(value)))
}

/** Elimina soltanto valori non persistibili, senza alterare 0, false o stringhe vuote. */
export function compactTestRecord(record = {}) {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null),
  )
}
