// Motore logico del Test Temperamentale (TST).
//
// Tutte le regole (nature, famiglie, risposte, pesi, riconferme) si leggono da
// src/config/tstSistema.js (fonte unica). Questo modulo espone la stessa API
// storica usata da test, report e Galassia, derivandola da lì.

import {
  CAMPI_NATURE,
  CAMPI_PER_COLORE,
  NATURE,
  PORTATI,
  REGOLE_RISPOSTE,
  getPasso,
} from './config/tstSistema.js'
import { MASSIMI_TEORICI, cestaPerRisposta } from './utils/cesteTst.js'

// Blocco C: Portato Esperienziale
export const PORTATO_KEYS = Object.freeze(
  Object.fromEntries(PORTATI.map((p) => [p.id.toUpperCase(), p.campoDb])),
)

// Blocco D: Correnti emotive (una per natura; chiavi = campi Firestore storici)
export const CORRENTE_KEYS = Object.freeze(
  Object.fromEntries(NATURE.map((n) => [n.campoDb.split('_').slice(0, 2).join('_'), n.campoDb])),
)

const NATURA_CAMPO_BY_ID = Object.fromEntries(NATURE.map((n) => [n.id, n.campoDb]))
const PORTATO_CAMPO_BY_ID = Object.fromEntries(PORTATI.map((p) => [p.id, p.campoDb]))

function toLegacyEntry(regola) {
  return {
    correnteKey: NATURA_CAMPO_BY_ID[regola.natura],
    portatoKey: PORTATO_CAMPO_BY_ID[regola.portato],
    baseValue: regola.punti,
  }
}

function toDizionario(regole) {
  return Object.freeze(Object.fromEntries(regole.map((r) => [r.risposta, toLegacyEntry(r)])))
}

function toOpzioni(regole) {
  return Object.freeze(regole.map((r) => ({ id: r.risposta, ...toLegacyEntry(r) })))
}

// DIZIONARIO 1 (le 15 sensazioni) — l'ordine delle chiavi è l'ordine dei bottoni.
export const DIZIONARIO_1 = toDizionario(REGOLE_RISPOSTE.SENSAZIONI)

// DIZIONARIO 2 (i 14 aggettivi).
export const DIZIONARIO_2 = toDizionario(REGOLE_RISPOSTE.AGGETTIVI)

export const AFFINITA_BASE_OPZIONI = toOpzioni(REGOLE_RISPOSTE.AFFINITA_BASE)
export const AFFINITA_ECCEZIONE_OPZIONI = toOpzioni(REGOLE_RISPOSTE.AFFINITA_ECCEZIONE)
export const AFFINITA_STANDARD_OPZIONI = toOpzioni(REGOLE_RISPOSTE.AFFINITA_STANDARD)

const LOGIC_TYPE_BY_TIPO = {
  SENSAZIONI: 'DIZIONARIO_1',
  AGGETTIVI: 'DIZIONARIO_2',
  AFFINITA_BASE: 'AFFINITA_BASE',
  AFFINITA_ECCEZIONE: 'AFFINITA_ECCEZIONE',
  AFFINITA_STANDARD: 'AFFINITA_STANDARD',
}

/** Peso del passo (2 per i passi 42–46, altrimenti 1). */
export function getScoreWeightForFile(fileNumber) {
  return getPasso(fileNumber)?.peso || 1
}

/**
 * Gruppo di domanda storico (A, B, C, C_BIS, D, E, F) usato dall'interfaccia del test.
 * Attenzione: NON coincide con la sezione musicale (vedi SEZIONI in tstSistema.js).
 */
export function getQuestionGroupForFile(fileNumber) {
  const passo = getPasso(fileNumber)
  if (!passo) return 'B'
  if (passo.riconferma) return 'C_BIS'
  switch (passo.tipoDomanda) {
    case 'AFFINITA_BASE': return 'A'
    case 'AGGETTIVI': return 'C'
    case 'AFFINITA_ECCEZIONE': return 'D'
    case 'AFFINITA_STANDARD': return passo.numero === 58 ? 'F' : 'E'
    default: return 'B'
  }
}

/** Quale tabella di risposte usa ogni passo. */
export function getLogicTypeForFile(fileNumber) {
  const passo = getPasso(fileNumber)
  return passo ? LOGIC_TYPE_BY_TIPO[passo.tipoDomanda] || null : null
}

/** Numero del file audio effettivamente riprodotto al passo (le riconferme riascoltano). */
export function getAudioFileForStep(fileNumber) {
  return getPasso(fileNumber)?.audio || fileNumber
}

// Calcola il delta di punteggio per una risposta: una sola cesta (natura × portato).
export function computeScoreDeltaForAnswer({
  fileNumber,
  answerLabel,
  affinitaOptionId,
  isConfirmation = false,
}) {
  const cesta = cestaPerRisposta({
    fileNumber,
    risposta: answerLabel || affinitaOptionId,
    isConfirmation,
  })
  if (!cesta) return {}
  return {
    [cesta.natura.campoDb]: cesta.punti,
    [cesta.portato.campoDb]: cesta.punti,
  }
}

/** Massimo sommabile per ogni corrente (natura) se ogni passo contribuisse al meglio. */
export const THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY = Object.freeze(
  Object.fromEntries(CAMPI_NATURE.map((campo) => [campo, MASSIMI_TEORICI.naturePerCampo[campo] || 0])),
)

/** Totali teorici per famiglia colore (somma delle nature della famiglia). */
export const THEORETICAL_MAX_COLOR_TOTALS = Object.freeze(
  Object.fromEntries(
    Object.entries(CAMPI_PER_COLORE).map(([colorKey, campi]) => [
      colorKey,
      campi.reduce((sum, campo) => sum + (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[campo] || 0), 0),
    ]),
  ),
)
