import { computeColorScores, hasRawAnswers } from './reportRecordUtils.js'
import {
  CAMPI_PER_COLORE,
  FAMIGLIE,
  NATURE,
  VERSIONE_MODELLO,
  VERSIONE_MODELLO_LEGACY,
} from '../config/tstSistema.js'
import { calcolaCeste, percentualeNatura } from './cesteTst.js'
import { leggiTestStorico } from './testStorici.js'

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

/** Versione del modello con cui è stato calcolato un record salvato. */
export function versioneModelloDi(record = {}) {
  return record?.versione_modello || VERSIONE_MODELLO_LEGACY
}

/**
 * Ricalcola un record con le regole del modello corrente (fonte unica
 * tstSistema.js): contatori delle nature, portato e campi prevalenti dalle
 * ceste. Aggiunge `_ceste` (tabella natura × portato) per report e Galassia.
 * Non va applicato ai test di versioni precedenti senza una scelta esplicita:
 * cambierebbe i risultati che la persona ha già ricevuto.
 */
export function ricalcolaRecordTst(record = {}) {
  if (!record || !hasRawAnswers(record)) return record
  const { ceste, campiNature, campiPortato } = calcolaCeste(record)
  const ricalcolato = { ...record, ...campiNature, ...campiPortato }
  return {
    ...ricalcolato,
    ...computeTestResultFields(ricalcolato),
    _ceste: ceste,
    versione_modello: VERSIONE_MODELLO,
  }
}

/**
 * Prepara un record salvato per la lettura (report, archivio risultati).
 * - Test del modello corrente: ricalcolati dalle risposte grezze.
 * - Test di versioni precedenti (o senza `versione_modello`): restituiti con i
 *   punteggi e le prevalenze salvati, così i risultati storici non cambiano.
 * Non scrive mai su Firestore.
 */
export function normalizzaRecordTst(record = {}) {
  if (!record || typeof record !== 'object') return record
  const versione = versioneModelloDi(record)
  if (versione === VERSIONE_MODELLO_LEGACY) return { ...leggiTestStorico(record), versione_modello: versione }
  if (versione !== VERSIONE_MODELLO) return { ...record, versione_modello: versione }
  return ricalcolaRecordTst(record)
}
