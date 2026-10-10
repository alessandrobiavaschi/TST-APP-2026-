import { computeColorScores, hasRawAnswers } from './reportRecordUtils.js'
import { CAMPI_PER_COLORE, FAMIGLIE, NATURE } from '../config/tstSistema.js'
import { calcolaCeste, percentualeNatura } from './cesteTst.js'

/** Etichetta salvata in Disposizione_Prevalente: nome della famiglia dal PDF. */
export const DISPOSITION_LABEL_BY_COLOR = Object.freeze(
  Object.fromEntries(FAMIGLIE.map((f) => [f.colorKey, f.nome])),
)

const CURRENT_KEYS_BY_COLOR = CAMPI_PER_COLORE

/** Etichetta salvata in Sottodisposizione_Prevalente: nome della natura dal PDF. */
const SUBDISPOSITION_LABEL_BY_KEY = Object.freeze(
  Object.fromEntries(NATURE.map((n) => [n.campoDb, n.nome])),
)

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

/** Famiglia prevalente: punteggi normalizzati sul massimo teorico di ogni famiglia. */
export function getDominantDispositionKey(record = {}) {
  return findPositiveMaximum(Object.entries(computeColorScores(record)))
}

export function getDominantDisposition(record = {}) {
  return DISPOSITION_LABEL_BY_COLOR[getDominantDispositionKey(record)] || ''
}

/** Natura prevalente dentro la famiglia prevalente, normalizzata sul massimo teorico della natura. */
export function getDominantSubdisposition(record = {}) {
  const colorKey = getDominantDispositionKey(record)
  const currentKey = findPositiveMaximum(
    (CURRENT_KEYS_BY_COLOR[colorKey] || []).map((key) => [key, percentualeNatura(key, record[key])]),
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

/**
 * Riallinea un record salvato alle regole attuali (fonte unica tstSistema.js):
 * se ci sono le risposte grezze, ricalcola contatori delle nature, portato e
 * campi prevalenti dalle ceste. I test senza risposte grezze restano com'erano.
 * Aggiunge `_ceste` (tabella natura × portato) per report e Galassia.
 */
export function normalizzaRecordTst(record = {}) {
  if (!record || !hasRawAnswers(record)) return record
  const { ceste, campiNature, campiPortato } = calcolaCeste(record)
  const ricalcolato = { ...record, ...campiNature, ...campiPortato }
  return { ...ricalcolato, ...computeTestResultFields(ricalcolato), _ceste: ceste }
}

