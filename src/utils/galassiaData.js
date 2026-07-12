/**
 * Adattatore dati per <GalassiaView />.
 *
 * Costruisce la prop `correntData` (array di 5 correnti) a partire dal record
 * grezzo del report TST, riusando ESCLUSIVAMENTE i punteggi gia' calcolati dal
 * motore di scoring (testLogic) e i contenuti del modello (dispositions +
 * galaxyDocBridge). Non inventa numeri di scoring: i pesi sono percentuali
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
import { DISPOSITIONS } from '../config/dispositions'
import { RAW_DOC_VISUAL } from '../config/galaxyDocBridge'
import {
  THEORETICAL_MAX_COLOR_TOTALS,
  THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY,
} from '../testLogic.js'

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/** Da chiave grezza a etichetta leggibile, es. 'ROSSO_2_Dubbio_Collera' -> 'Dubbio Collera'. */
function rawKeyToLabel(rawKey) {
  const base = String(rawKey).split('_').slice(2).join(' ').replaceAll('_', ' ').trim() || String(rawKey)
  return base.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Prima frase di una descrizione (taglio sul primo punto). */
function firstSentence(text) {
  const t = String(text || '').trim()
  if (!t) return ''
  const dot = t.indexOf('.')
  return (dot > 0 ? t.slice(0, dot + 1) : t).trim()
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
        peso: toPct(rawRecord?.[rawKey], THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[rawKey]),
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
      descrizione: firstSentence(disposition.narrativeShort),
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
export const EXAMPLE_CORRENT_DATA = [
  {
    id: 'flemmatica',
    nome: 'Flemmatica',
    familyKey: 'verde',
    colore: '#22c55e',
    peso: 82,
    descrizione:
      'La corrente flemmatica custodisce calma, lentezza e contemplazione: una base di equilibrio che modula gli eccessi.',
    statiDanimo: ['Calmo', 'Rilassato', 'Pacato', 'Tranquillo', 'Sereno', 'Equilibrato'],
    sottoCorrenti: [
      {
        id: 'VERDE_1_Calma',
        nome: 'Calma',
        colore: '#15803d',
        peso: 82,
        descrizione: 'Quinta / Quinta eccedente · Verde calma',
        statiDanimo: ['Rilassato', 'Calmo', 'Pacifico', 'Tranquillo', 'Contemplativo', 'Quieto'],
      },
    ],
  },
  {
    id: 'collerico_volitiva',
    nome: 'Collerico / Volitiva',
    familyKey: 'rosso',
    colore: '#ef4444',
    peso: 41,
    descrizione:
      'Questa corrente sostiene l’azione e la direzione intenzionale: in forma armonica porta decisione e responsabilità.',
    statiDanimo: ['Determinato', 'Sicuro', 'Risoluto', 'Coraggioso', 'Fiero'],
    sottoCorrenti: [
      {
        id: 'ROSSO_1_Assertivita',
        nome: 'Assertivita',
        colore: '#dc2626',
        peso: 46,
        descrizione: 'Quarta · Rosso',
        statiDanimo: ['Stabile', 'Sicuro', 'Determinato', 'Risoluto', 'Coraggioso'],
      },
      {
        id: 'ROSSO_2_Dubbio_Collera',
        nome: 'Dubbio Collera',
        colore: '#9f2b68',
        peso: 31,
        descrizione: 'Quarta eccedente · Amaranto',
        statiDanimo: ['Incerto', 'Dubbioso', 'Rabbioso', 'Irato', 'Diffidente'],
      },
    ],
  },
  {
    id: 'malinconica_nostalgica',
    nome: 'Malinconica / Nostalgica',
    familyKey: 'blu',
    colore: '#3b82f6',
    peso: 28,
    descrizione:
      'Questa corrente orienta all’interiorità: riflessione, memoria e ascolto profondo di ciò che si è vissuto.',
    statiDanimo: ['Pensieroso', 'Nostalgico', 'Sereno', 'Riconoscente', 'Triste'],
    sottoCorrenti: [
      {
        id: 'BLU_1_Depressiva',
        nome: 'Depressiva',
        colore: '#172554',
        peso: 14,
        descrizione: 'Seconda min/Mag · Blu notte/scuro',
        statiDanimo: ['Angosciato', 'Afflitto', 'Depresso', 'Ansioso', 'Mesto'],
      },
      {
        id: 'BLU_2_Lunare',
        nome: 'Lunare',
        colore: '#1e40af',
        peso: 22,
        descrizione: 'Terza min · Blu medio',
        statiDanimo: ['Pensieroso', 'Triste', 'Preoccupato', 'Cupo', 'Lunatico'],
      },
      {
        id: 'BLU_3_Nostalgia',
        nome: 'Nostalgica',
        colore: '#1d4ed8',
        peso: 18,
        descrizione: 'Settima min/Mag · Blu reale (saudade)',
        statiDanimo: ['Nostalgico', 'Rimpiangente', 'Riconoscente', 'Grato', 'Desiderante'],
      },
      {
        id: 'BLU_4_Solare',
        nome: 'Solare',
        colore: '#7dd3fc',
        peso: 30,
        descrizione: 'Terza Mag · Celeste',
        statiDanimo: ['Ottimista', 'Sereno', 'Fiducioso', 'Lieto', 'Speranzoso'],
      },
    ],
  },
  {
    id: 'entusiasmo',
    nome: 'Entusiasmo',
    familyKey: 'giallo',
    colore: '#eab308',
    peso: 9,
    descrizione:
      'Questa corrente esprime curiosità, movimento e slancio vitale verso il nuovo.',
    statiDanimo: ['Gioioso', 'Vivace', 'Entusiasta', 'Curioso', 'Solare'],
    sottoCorrenti: [
      {
        id: 'GIALLO_1_Gioia_Entusiasmo',
        nome: 'Gioia Entusiasmo',
        colore: '#eab308',
        peso: 11,
        descrizione: 'Sesta · Giallo (gioia)',
        statiDanimo: ['Gioioso', 'Allegro', 'Entusiasta', 'Euforico', 'Curioso'],
      },
      {
        id: 'GIALLO_2_Volitivo_Passionale',
        nome: 'Volitivo Passionale',
        colore: '#d97706',
        peso: 6,
        descrizione: 'Prima · Giallo dorato (passione)',
        statiDanimo: ['Innamorato', 'Appassionato', 'Ardente', 'Impetuoso', 'Illuminato'],
      },
    ],
  },
  {
    id: 'agnostica_anaffettiva',
    nome: 'Agnostica / Anaffettiva',
    familyKey: 'grigio',
    colore: '#9ca3af',
    peso: 1,
    descrizione:
      'Questa corrente introduce distanza osservativa e calcolo: se ben orientata favorisce lucidità e discernimento.',
    statiDanimo: ['Lucido', 'Distaccato', 'Imperturbabile', 'Saggio', 'Indifferente'],
    sottoCorrenti: [
      {
        id: 'GRIGIO_1_Distaccato_Nichilista',
        nome: 'Distaccato Nichilista',
        colore: '#475569',
        peso: 1,
        descrizione: 'Ottava · Grigio scuro (gelo distaccato)',
        statiDanimo: ['Apatico', 'Freddo', 'Distaccato', 'Indifferente', 'Imperturbabile'],
      },
      {
        id: 'GRIGIO_2_Intellettuale_Saggio',
        nome: 'Intellettuale Saggio',
        colore: '#94a3b8',
        peso: 1,
        descrizione: 'Ottava (polo evoluto) · Grigio chiaro',
        statiDanimo: ['Saggio', 'Dedito', 'Devoto', 'Beato', 'Illuminato'],
      },
    ],
  },
]
