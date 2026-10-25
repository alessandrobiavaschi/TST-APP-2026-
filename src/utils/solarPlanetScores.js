import { CORRENTE_KEYS } from '../testLogic.js'
import { massimiPerRecord } from './testStorici.js'

function toPct(value, max) {
  if (!max || max <= 0) return 0
  return Math.round((Math.max(0, Number(value) || 0) / max) * 100)
}

function sumRawScores(record, keys) {
  return keys.reduce((acc, key) => acc + (Number(record?.[key]) || 0), 0)
}

function maxTheoreticalForKeys(keys, rawRecord) {
  const massimi = massimiPerRecord(rawRecord).naturePerCampo
  return keys.reduce((acc, key) => acc + (massimi[key] || 0), 0)
}

const BLU_LUNARE_KEYS = [
  CORRENTE_KEYS.BLU_1,
  CORRENTE_KEYS.BLU_2,
  CORRENTE_KEYS.BLU_3,
]

/**
 * Peso percentuale (0–100) per ciascun pianeta del sistema solare emotivo.
 * @param {string} planetId
 * @param {{ correnti?: object[], rawRecord?: object }} params
 */
export function getSolarPlanetScore(planetId, { correnti = [], rawRecord = {} } = {}) {
  const byFamily = Object.fromEntries(
    correnti.map((c) => [String(c.familyKey || '').toLowerCase(), Number(c.peso) || 0]),
  )

  switch (planetId) {
    case 'flemma':
      return byFamily.verde ?? 0
    case 'volitivita':
      return byFamily.rosso ?? 0
    case 'entusiasmo':
      return byFamily.giallo ?? 0
    case 'anaffettivita':
      return byFamily.grigio ?? 0
    case 'malinconia-lunare':
      return toPct(
        sumRawScores(rawRecord, BLU_LUNARE_KEYS),
        maxTheoreticalForKeys(BLU_LUNARE_KEYS, rawRecord),
      )
    case 'malinconia-solare':
      return toPct(
        rawRecord?.[CORRENTE_KEYS.BLU_4] || 0,
        massimiPerRecord(rawRecord).naturePerCampo[CORRENTE_KEYS.BLU_4] || 1,
      )
    default:
      return 0
  }
}
