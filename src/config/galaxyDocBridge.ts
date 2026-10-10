/**
 * Ponte verso i contenuti dei documenti CPM / Integrazioni
 * ("STATI D'ANIMO IN 4 FAMIGLIE", "TEST DI RILEVAZIONE...", liste parole).
 * La galassia usa soprattutto `glyph` + colori; le parole restano per approfondimento opzionale.
 *
 * Le sfumature di accentHex riflettono le indicazioni di colore del PDF
 * (Blu notte / Blu scuro / Blu medio / Blu reale / Celeste, Rosso / Amaranto,
 * Verde, Giallo / Giallo dorato, Grigio scuro / Grigio chiaro).
 */

export type GalaxyGlyphKind =
  | 'well'
  | 'crescent'
  | 'wave_ring'
  | 'sun_minor'
  | 'summit'
  | 'zigzag'
  | 'pool'
  | 'burst'
  | 'pulse_arc'
  | 'shard'
  | 'rings'

import { getAggettiviForRawKey } from '../content/paroleTst.js'
import { getNaturaByCampo } from './tstSistema.js'

/** Intervallo/parametro: si legge sempre dal sistema unico (config/tstSistema.js). */
const intervalloDi = (rawKey: string): string => getNaturaByCampo(rawKey)?.intervallo || ''

export interface RawDocVisual {
  glyph: GalaxyGlyphKind
  accentHex: string
  /** Etichetta breve della sfumatura come da PDF (es. "Blu notte", "Amaranto"). */
  shadeLabel: string
  intervalNote: string
  lexiconChips: string[]
}

/** Rosa dei venti nel materiale CPM (solo geometria sul canvas, senza testo). */
export type WindBracket =
  | { angleRad: number; spanRad: number }
  | { atCenter: true }

export const DISPOSITION_WIND: Record<string, WindBracket> = {
  malinconica_nostalgica: { angleRad: Math.PI, spanRad: Math.PI * 0.45 },
  collerico_volitiva: { angleRad: 0, spanRad: Math.PI * 0.45 },
  flemmatica: { atCenter: true },
  entusiasmo: { angleRad: Math.PI / 2, spanRad: Math.PI * 0.45 },
  agnostica_anaffettiva: { angleRad: -Math.PI / 2, spanRad: Math.PI * 0.35 },
}

export const RAW_DOC_VISUAL: Record<string, RawDocVisual> = {
  BLU_1_Depressiva: {
    glyph: 'well',
    accentHex: '#172554',
    shadeLabel: 'Blu notte / Blu scuro',
    intervalNote: `${intervalloDi('BLU_1_Depressiva')} · Blu notte / Blu scuro`,
    lexiconChips: getAggettiviForRawKey('BLU_1_Depressiva'),
  },
  BLU_2_Lunare: {
    glyph: 'crescent',
    accentHex: '#1e40af',
    shadeLabel: 'Blu medio',
    intervalNote: `${intervalloDi('BLU_2_Lunare')} · Blu medio`,
    lexiconChips: getAggettiviForRawKey('BLU_2_Lunare'),
  },
  BLU_3_Nostalgia: {
    glyph: 'wave_ring',
    accentHex: '#1d4ed8',
    shadeLabel: 'Blu reale',
    intervalNote: `${intervalloDi('BLU_3_Nostalgia')} · Blu reale`,
    lexiconChips: getAggettiviForRawKey('BLU_3_Nostalgia'),
  },
  BLU_4_Solare: {
    glyph: 'sun_minor',
    accentHex: '#7dd3fc',
    shadeLabel: 'Celeste',
    intervalNote: `${intervalloDi('BLU_4_Solare')} · Celeste`,
    lexiconChips: getAggettiviForRawKey('BLU_4_Solare'),
  },
  ROSSO_1_Assertivita: {
    glyph: 'summit',
    accentHex: '#dc2626',
    shadeLabel: 'Rosso',
    intervalNote: `${intervalloDi('ROSSO_1_Assertivita')} · Rosso`,
    lexiconChips: getAggettiviForRawKey('ROSSO_1_Assertivita'),
  },
  ROSSO_2_Dubbio_Collera: {
    glyph: 'zigzag',
    accentHex: '#9f2b68',
    shadeLabel: 'Amaranto',
    intervalNote: `${intervalloDi('ROSSO_2_Dubbio_Collera')} · Amaranto`,
    lexiconChips: getAggettiviForRawKey('ROSSO_2_Dubbio_Collera'),
  },
  VERDE_1_CalmaContemplativa: {
    glyph: 'pool',
    accentHex: '#15803d',
    shadeLabel: 'Verde',
    intervalNote: `${intervalloDi('VERDE_1_CalmaContemplativa')} · Verde`,
    lexiconChips: getAggettiviForRawKey('VERDE_1_CalmaContemplativa'),
  },
  VERDE_2_CalmaFisica: {
    glyph: 'rings',
    accentHex: '#4ade80',
    shadeLabel: 'Verde chiaro',
    intervalNote: `${intervalloDi('VERDE_2_CalmaFisica')} · Verde chiaro`,
    lexiconChips: getAggettiviForRawKey('VERDE_2_CalmaFisica'),
  },
  GIALLO_1_Gioia_Entusiasmo: {
    glyph: 'burst',
    accentHex: '#eab308',
    shadeLabel: 'Giallo',
    intervalNote: `${intervalloDi('GIALLO_1_Gioia_Entusiasmo')} · Giallo`,
    lexiconChips: getAggettiviForRawKey('GIALLO_1_Gioia_Entusiasmo'),
  },
  GIALLO_2_Volitivo_Passionale: {
    glyph: 'pulse_arc',
    accentHex: '#d97706',
    shadeLabel: 'Giallo dorato',
    intervalNote: `${intervalloDi('GIALLO_2_Volitivo_Passionale')} · Giallo dorato`,
    lexiconChips: getAggettiviForRawKey('GIALLO_2_Volitivo_Passionale'),
  },
  GRIGIO_1_Anaffettiva: {
    glyph: 'shard',
    accentHex: '#475569',
    shadeLabel: 'Grigio',
    intervalNote: `${intervalloDi('GRIGIO_1_Anaffettiva')} · Grigio`,
    lexiconChips: getAggettiviForRawKey('GRIGIO_1_Anaffettiva'),
  },
  GRIGIO_2_Distaccata: {
    glyph: 'rings',
    accentHex: '#94a3b8',
    shadeLabel: 'Grigio chiaro',
    intervalNote: `${intervalloDi('GRIGIO_2_Distaccata')} · Grigio chiaro`,
    lexiconChips: getAggettiviForRawKey('GRIGIO_2_Distaccata'),
  },
}

export function getRawDocVisual(rawKey: string): RawDocVisual | null {
  return RAW_DOC_VISUAL[rawKey] ?? null
}

/** Una riga sintetica sul modello identità emotiva / codice musicale (solo testo breve). */
export const GALAXY_MODEL_EPIGRAPH =
  "Musica come linguaggio non verbale: flussi sonori che rivelano temperamenti e stati d'animo (modello CPM / integrazioni)."
