/**
 * Adattatore dati per <GalassiaView />.
 *
 * Costruisce la prop `correntData` (array di 5 correnti) a partire dal record
 * grezzo del report TST, riusando ESCLUSIVAMENTE i punteggi gia' calcolati dal
 * motore di scoring (testLogic) e i contenuti del modello (dispositions +
 * galaxyDocBridge, testi da content/testiFissiTemperamenti.js). Non inventa numeri di scoring: i pesi sono percentuali
 * rispetto al massimo teorico di famiglia / sotto-corrente.
 *
 * Forma di `correntData` (un elemento per corrente):
 * {
 *   id: string,             // dispositionId, es. 'flemmatica'
 *   nome: string,           // etichetta leggibile, es. 'Flemmatica'
 *   colore: string,         // hex famiglia, es. '#22c55e'
 *   peso: number,           // 0-100 (accetta anche 0-1 lato componente)
 *   descrizione: string,    // descrizione breve della corrente (dal modello TST)
 *   statiDanimo: string[],  // stati d'animo principali della corrente
 *   sottoCorrenti: [        // sotto-correnti (satelliti)
 *     {
 *       id: string,
 *       nome: string,
 *       colore: string,
 *       peso: number,        // 0-100
 *       descrizione?: string,
 *       statiDanimo: string[],
 *     }
 *   ]
 * }
 */

import { computeColorTotals, computeRelativePercentages } from './reportRecordUtils.js'
import { getTestoNatura, getSintesiFamiglia } from '../content/testiFissiTemperamenti.js'
import { getNaturaByRawKey } from '../content/paroleTst.js'
import { DISPOSITIONS } from '../config/dispositions'
import { RAW_DOC_VISUAL } from '../config/galaxyDocBridge'
import { massimiPerRecord } from './testStorici.js'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/** Nome della natura dai «Testi fissi», es. 'ROSSO_2_Dubbio_Collera' -> 'Natura Collerica'. */
// Nome della natura come nel PDF «Parole per TST» (es. «Natura Lunare — Depressiva»).
function rawKeyToLabel(rawKey) {
  return getNaturaByRawKey(rawKey)?.nome || getTestoNatura(rawKey)?.titolo || String(rawKey)
}

/** Primi N elementi unici (preserva l'ordine). */
function uniqueTop(list, max) {
  const out = []
  for (const item of list) {
    if (!out.includes(item)) out.push(item)
    if (out.length >= max) break
  }
  return out
}

function toPct(value, max) {
  const v = Number(value) || 0
  const m = Number(max) || 0
  if (m <= 0) return 0
  return Math.round(clamp01(v / m) * 100)
}

/**
 * Costruisce `correntData` dai dati reali del report.
 * @param {object} rawRecord - il record grezzo (record.raw) con le 11 correnti emotive.
 */
export function buildCorrentDataFromRecord(rawRecord = {}) {
  const totals = computeColorTotals(rawRecord)
  const relativePcts = computeRelativePercentages(totals)

  return DISPOSITIONS.map((disposition) => {
    const { colorKey } = disposition
    const peso = relativePcts[colorKey] ?? 0

    const sottoCorrenti = disposition.rawKeys.map((rawKey) => {
      const doc = RAW_DOC_VISUAL[rawKey] || null
      return {
        id: rawKey,
        nome: rawKeyToLabel(rawKey),
        colore: doc?.accentHex || disposition.colorHex,
        peso: toPct(rawRecord?.[rawKey], massimiPerRecord(rawRecord).naturePerCampo[rawKey]),
        descrizione: doc?.intervalNote || '',
        statiDanimo: Array.isArray(doc?.lexiconChips) ? doc.lexiconChips.slice(0, 12) : [],
      }
    })

    const statiDanimo = uniqueTop(
      sottoCorrenti.flatMap((sub) => sub.statiDanimo),
      8,
    )

    return {
      id: disposition.dispositionId,
      nome: disposition.label,
      familyKey: disposition.colorKey,
      colore: disposition.colorHex,
      peso,
      descrizione: getSintesiFamiglia(colorKey),
      statiDanimo,
      sottoCorrenti,
    }
  })
}

/**
 * Dataset di esempio/fallback, coerente con i pesi indicati nella specifica
 * (Verde ~82, Rosso ~41, Blu medio, Giallo marginale, Grigio ~1). Serve a
 * testare il componente in isolamento e come fallback se `correntData` manca.
 */
const EXAMPLE_PESI = {
  flemmatica: 82,
  VERDE_1_CalmaContemplativa: 55,
  VERDE_2_CalmaFisica: 82,
  collerico_volitiva: 41,
  ROSSO_1_Assertivita: 46,
  ROSSO_2_Dubbio_Collera: 31,
  malinconica_nostalgica: 28,
  BLU_1_Depressiva: 14,
  BLU_2_Lunare: 22,
  BLU_3_Nostalgia: 18,
  BLU_4_Solare: 30,
  entusiasmo: 9,
  GIALLO_1_Gioia_Entusiasmo: 11,
  GIALLO_2_Volitivo_Passionale: 6,
  agnostica_anaffettiva: 1,
  GRIGIO_1_Anaffettiva: 1,
  GRIGIO_2_Distaccata: 1,
}

const EXAMPLE_ORDINE = ['flemmatica', 'collerico_volitiva', 'malinconica_nostalgica', 'entusiasmo', 'agnostica_anaffettiva']

/**
 * Stessa forma di buildCorrentDataFromRecord, ma con pesi fissi: nomi, descrizioni
 * e stati d'animo vengono dalle stesse fonti (Testi fissi + Parole per TST).
 */
export const EXAMPLE_CORRENT_DATA = EXAMPLE_ORDINE.map((id) => {
  const disposition = DISPOSITIONS.find((d) => d.dispositionId === id)
  const sottoCorrenti = disposition.rawKeys.map((rawKey) => {
    const doc = RAW_DOC_VISUAL[rawKey] || null
    return {
      id: rawKey,
      nome: rawKeyToLabel(rawKey),
      colore: doc?.accentHex || disposition.colorHex,
      peso: EXAMPLE_PESI[rawKey] ?? 0,
      descrizione: doc?.intervalNote || '',
      statiDanimo: Array.isArray(doc?.lexiconChips) ? doc.lexiconChips.slice(0, 12) : [],
    }
  })
  return {
    id,
    nome: disposition.label,
    familyKey: disposition.colorKey,
    colore: disposition.colorHex,
    peso: EXAMPLE_PESI[id] ?? 0,
    descrizione: getSintesiFamiglia(disposition.colorKey),
    statiDanimo: uniqueTop(sottoCorrenti.flatMap((sub) => sub.statiDanimo), 8),
    sottoCorrenti,
  }
})
