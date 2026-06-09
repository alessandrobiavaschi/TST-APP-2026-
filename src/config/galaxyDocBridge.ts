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
    lexiconChips: [
      'Terrorizzato',
      'Inorridito',
      'Angosciato',
      'Sgomento',
      'Afflitto',
      'Tormentato',
      'Scosso',
      'Depresso',
      'Pauroso',
      'Timoroso',
      'Inquieto',
      'Ansioso',
      'Angustiato',
      'Mesto',
      'Fibrillante',
      'Avvilito',
      'Chiuso',
    ],
  },
  BLU_2_Lunare: {
    glyph: 'crescent',
    accentHex: '#1e40af',
    shadeLabel: 'Blu medio',
    intervalNote: 'Terza min · Blu medio',
    lexiconChips: [
      'Pensieroso',
      'Triste',
      'Timido',
      'Pessimista',
      'Preoccupato',
      'Demotivato',
      'Amareggiato',
      'Ombroso',
      'Sconfortato',
      'Scoraggiato',
      'Scombussolato',
      'Vergognoso',
      'Cupo',
      'Fosco',
      'Turbato',
      'Lunatico',
      'Lamentoso',
    ],
  },
  BLU_3_Nostalgia: {
    glyph: 'wave_ring',
    accentHex: '#1d4ed8',
    shadeLabel: 'Blu reale',
    intervalNote: 'Settima min/Mag · Blu reale (saudade)',
    lexiconChips: [
      'Rimpiangente',
      'Afflitto',
      'Straziato',
      'Rammaricato',
      'Desolato',
      'Disperato',
      'Sconsolato',
      'Mortificato',
      'Abbandonato',
      'Nostalgico',
      'Compassionevole',
      'Accorato',
      'Rimembrante',
      'Desiderante',
      'Riconoscente',
      'Grato',
    ],
  },
  BLU_4_Solare: {
    glyph: 'sun_minor',
    accentHex: '#7dd3fc',
    shadeLabel: 'Celeste',
    intervalNote: 'Terza Mag · Celeste',
    lexiconChips: [
      'Ottimista',
      'Aperto',
      'Sereno',
      'Positivista',
      'Buono',
      'Simpatico',
      'Meravigliato',
      'Benevolente',
      'Lieto',
      'Leggero',
      'Mite',
      'Contento',
      'Chiaro',
      'Compassionevole',
      'Fiducioso',
      'Solidale',
      'Speranzoso',
      'Affettuoso',
      'Pietoso',
    ],
  },
  ROSSO_1_Assertivita: {
    glyph: 'summit',
    accentHex: '#dc2626',
    shadeLabel: 'Rosso',
    intervalNote: 'Quarta · Rosso',
    lexiconChips: [
      'Stabile',
      'Saldo',
      'Sicuro',
      'Certo',
      'Costante',
      'Determinato',
      'Decisionista',
      'Fermo',
      'Schietto',
      'Sincero',
      'Franco',
      'Fiero',
      'Risoluto',
      'Fedele',
      'Spavaldo',
      'Altero',
      'Ostinato',
      'Orgoglioso',
      'Coraggioso',
      'Impavido',
    ],
  },
  ROSSO_2_Dubbio_Collera: {
    glyph: 'zigzag',
    accentHex: '#9f2b68',
    shadeLabel: 'Amaranto',
    intervalNote: 'Quarta eccedente · Amaranto',
    lexiconChips: [
      'Incerto',
      'Inquieto',
      'Dubbioso',
      'Esitante',
      'Ambiguo',
      'Misterioso',
      'Indeciso',
      'Oscillante',
      'Precario',
      'Perplesso',
      'Irrisoluto',
      'Smarrito',
      'Elusivo',
      'Equivoco',
      'Criptico',
      'Enigmatico',
      'Infido',
      'Subdolo',
      'Rabbioso',
      'Rancoroso',
      'Irato',
      'Furioso',
      'Iracondo',
      'Travagliato',
      'Tribolato',
      'Odioso',
      'Diffidente',
      'Sospettoso',
      'Nevrotico',
    ],
  },
  VERDE_1_Calma: {
    glyph: 'pool',
    accentHex: '#15803d',
    shadeLabel: 'Verde',
    intervalNote: 'Quinta / Quinta eccedente · Verde calma',
    lexiconChips: [
      'Rilassato',
      'Calmo',
      'Gentile',
      'Disteso',
      'Pacato',
      'Placido',
      'Pacifico',
      'Tranquillo',
      'Estatico',
      'Serafico',
      'Contemplativo',
      'Sognante',
      'Equilibrato',
      'Quieto',
      'Tollerante',
      'Mistico',
      'Prudente',
      'Meditativo',
      'Ammirato',
      'Annoiato',
      'Pigro',
      'Oziante',
      'Svampito',
      'Indolente',
      'Ignavo',
    ],
  },
  GIALLO_1_Gioia_Entusiasmo: {
    glyph: 'burst',
    accentHex: '#eab308',
    shadeLabel: 'Giallo',
    intervalNote: 'Sesta · Giallo (gioia)',
    lexiconChips: [
      'Gioioso',
      'Cinetico',
      'Vivace',
      'Veloce',
      'Vitale',
      'Fluido',
      'Allegro',
      'Felice',
      'Festoso',
      'Entusiasta',
      'Esaltato',
      'Ardente',
      'Euforico',
      'Caloroso',
      'Reattivo',
      'Curioso',
      'Volitivo',
      'Dinamico',
      'Esuberante',
      'Solare',
      'Positivista',
      'Irrefrenabile',
    ],
  },
  GIALLO_2_Volitivo_Passionale: {
    glyph: 'pulse_arc',
    accentHex: '#d97706',
    shadeLabel: 'Giallo dorato',
    intervalNote: 'Prima · Giallo dorato (passione)',
    lexiconChips: [
      'Innamorato',
      'Amorevole',
      'Ammirato',
      'Appassionato',
      'Infuocato',
      'Ardente',
      'Impetuoso',
      'Veemente',
      'Deferente',
      'Illuminato',
    ],
  },
  GRIGIO_1_Distaccato_Nichilista: {
    glyph: 'shard',
    accentHex: '#475569',
    shadeLabel: 'Grigio scuro',
    intervalNote: 'Ottava · Grigio scuro (gelo distaccato)',
    lexiconChips: [
      'Anaffettivo',
      'Apatico',
      'Matematico',
      'Lucido',
      'Freddo',
      'Insensibile',
      'Indifferente',
      'Nullista',
      'Impotente',
      'Distaccato',
      'Imperturbabile',
    ],
  },
  GRIGIO_2_Intellettuale_Saggio: {
    glyph: 'rings',
    accentHex: '#94a3b8',
    shadeLabel: 'Grigio chiaro',
    intervalNote: 'Ottava (polo evoluto) · Grigio chiaro',
    lexiconChips: ['Saggio', 'Dedito', 'Devoto', 'Beato', 'Illuminato'],
  },
}

export function getRawDocVisual(rawKey: string): RawDocVisual | null {
  return RAW_DOC_VISUAL[rawKey] ?? null
}

/** Una riga sintetica sul modello identità emotiva / codice musicale (solo testo breve). */
export const GALAXY_MODEL_EPIGRAPH =
  "Musica come linguaggio non verbale: flussi sonori che rivelano temperamenti e stati d'animo (modello CPM / integrazioni)."
