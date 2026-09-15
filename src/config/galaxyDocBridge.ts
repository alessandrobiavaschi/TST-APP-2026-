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
    intervalNote: 'Seconda min/Mag · Blu notte/scuro',
    lexiconChips: getAggettiviForRawKey('BLU_1_Depressiva'),
  },
  BLU_2_Lunare: {
    glyph: 'crescent',
    accentHex: '#1e40af',
    shadeLabel: 'Blu medio',
    intervalNote: 'Terza min · Blu medio',
    lexiconChips: getAggettiviForRawKey('BLU_2_Lunare'),
  },
  BLU_3_Nostalgia: {
    glyph: 'wave_ring',
    accentHex: '#1d4ed8',
    shadeLabel: 'Blu reale',
    intervalNote: 'Settima min/Mag · Blu reale (saudade)',
    lexiconChips: getAggettiviForRawKey('BLU_3_Nostalgia'),
  },
  BLU_4_Solare: {
    glyph: 'sun_minor',
    accentHex: '#7dd3fc',
    shadeLabel: 'Celeste',
    intervalNote: 'Terza Mag · Celeste',
    lexiconChips: getAggettiviForRawKey('BLU_4_Solare'),
  },
  ROSSO_1_Assertivita: {
    glyph: 'summit',
    accentHex: '#dc2626',
    shadeLabel: 'Rosso',
    intervalNote: 'Quarta · Rosso',
    lexiconChips: getAggettiviForRawKey('ROSSO_1_Assertivita'),
  },
  ROSSO_2_Dubbio_Collera: {
    glyph: 'zigzag',
    accentHex: '#9f2b68',
    shadeLabel: 'Amaranto',
    intervalNote: 'Quarta eccedente · Amaranto',
    lexiconChips: getAggettiviForRawKey('ROSSO_2_Dubbio_Collera'),
  },
  VERDE_1_CalmaContemplativa: {
    glyph: 'pool',
    accentHex: '#15803d',
    shadeLabel: 'Verde',
    intervalNote: 'Quinta · Verde contemplativo',
    lexiconChips: getAggettiviForRawKey('VERDE_1_CalmaContemplativa'),
  },
  VERDE_2_CalmaFisica: {
    glyph: 'rings',
    accentHex: '#4ade80',
    shadeLabel: 'Verde chiaro',
    intervalNote: 'Quinta eccedente · Verde calma fisica',
    lexiconChips: getAggettiviForRawKey('VERDE_2_CalmaFisica'),
  },
  GIALLO_1_Gioia_Entusiasmo: {
    glyph: 'burst',
    accentHex: '#eab308',
    shadeLabel: 'Giallo',
    intervalNote: 'Sesta · Giallo (gioia)',
    lexiconChips: getAggettiviForRawKey('GIALLO_1_Gioia_Entusiasmo'),
  },
  GIALLO_2_Volitivo_Passionale: {
    glyph: 'pulse_arc',
    accentHex: '#d97706',
    shadeLabel: 'Giallo dorato',
    intervalNote: 'Prima · Giallo dorato (passione)',
    lexiconChips: getAggettiviForRawKey('GIALLO_2_Volitivo_Passionale'),
  },
  GRIGIO_1_Anaffettiva: {
    glyph: 'shard',
    accentHex: '#475569',
    shadeLabel: 'Grigio',
    intervalNote: 'Ottava · Grigio (anaffettivo)',
    lexiconChips: getAggettiviForRawKey('GRIGIO_1_Anaffettiva'),
  },
}

export function getRawDocVisual(rawKey: string): RawDocVisual | null {
  return RAW_DOC_VISUAL[rawKey] ?? null
}

/** Una riga sintetica sul modello identità emotiva / codice musicale (solo testo breve). */
export const GALAXY_MODEL_EPIGRAPH =
  "Musica come linguaggio non verbale: flussi sonori che rivelano temperamenti e stati d'animo (modello CPM / integrazioni)."
