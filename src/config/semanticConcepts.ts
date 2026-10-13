import {
  CORPUS_GIALLO_NARRATIVE_SLANCIO_VITALE,
  CORPUS_INTERVALLI_COSA_ATTIVA_MEMORIA,
  CORPUS_RITMO_COSA_ATTIVA_SLANCIO_CALMA,
  CORPUS_RITMO_RAPPORTO_ANIMA_SLANCIO_REGOLAZIONE,
  CORPUS_SCHEMA_ASSI_ORIENTAMENTO,
} from './reportCorpusCopy'

export const SEMANTIC_CONCEPT_EVENT = 'tst:semantic-concept-select'

export type SemanticConcept = {
  id: string
  label: string
  shortMeaning: string
  meaning: string
  reflectionQuestion: string
  relatedDispositions: string[]
  relatedRawKeys: string[]
  relatedPortato: string[]
  relatedConcepts: string[]
  evidenceLabel: string
  sourceLines: string[]
  calculationLabel: string
  moduleLinks: Array<{ module: string; label: string; anchor: string }>
}

export const SEMANTIC_CONCEPTS: Record<string, SemanticConcept> = {
  'memoria-emotiva': {
    id: 'memoria-emotiva',
    label: 'memoria emotiva',
    shortMeaning: CORPUS_INTERVALLI_COSA_ATTIVA_MEMORIA,
    meaning: `${CORPUS_INTERVALLI_COSA_ATTIVA_MEMORIA}\n\n${CORPUS_SCHEMA_ASSI_ORIENTAMENTO[0]}`,
    reflectionQuestion: 'Questa parola ti porta a capire o a trattenere?',
    relatedDispositions: ['malinconica_nostalgica'],
    relatedRawKeys: ['BLU_2_Lunare', 'BLU_3_Nostalgia'],
    relatedPortato: ['Simpatia', 'Indifferenza'],
    relatedConcepts: [],
    evidenceLabel: 'Cerca la presenza delle nature Lunare Introspettiva e Nostalgica, rappresentate in blu, e delle sue caratteristiche.',
    sourceLines: [CORPUS_INTERVALLI_COSA_ATTIVA_MEMORIA, CORPUS_SCHEMA_ASSI_ORIENTAMENTO[0]],
    calculationLabel: 'Somma dei valori delle correnti collegate alle nature Lunare Introspettiva e Nostalgica indicate nella matrice.',
    moduleLinks: [
      { module: 'Profilo', label: 'Capitolo Natura', anchor: 'report-chapter-natura' },
      { module: 'Galassia', label: 'Corrente malinconica', anchor: 'report-galassia' },
    ],
  },
  'regolazione-interna': {
    id: 'regolazione-interna',
    label: 'regolazione interna',
    shortMeaning: CORPUS_SCHEMA_ASSI_ORIENTAMENTO[2],
    meaning: `${CORPUS_SCHEMA_ASSI_ORIENTAMENTO[2]}\n\n${CORPUS_RITMO_RAPPORTO_ANIMA_SLANCIO_REGOLAZIONE}`,
    reflectionQuestion: 'Questa calma apre spazio o evita il movimento?',
    relatedDispositions: ['flemmatica', 'agnostica_anaffettiva'],
    relatedRawKeys: ['VERDE_1_CalmaContemplativa', 'VERDE_2_CalmaFisica', 'GRIGIO_1_Anaffettiva'],
    relatedPortato: ['Indifferenza'],
    relatedConcepts: [],
    evidenceLabel: 'Cerca la presenza verde/grigia e il peso del portato di indifferenza come modalita di regolazione.',
    sourceLines: [CORPUS_SCHEMA_ASSI_ORIENTAMENTO[2], CORPUS_RITMO_RAPPORTO_ANIMA_SLANCIO_REGOLAZIONE],
    calculationLabel: 'Somma dei valori delle correnti collegate a calma, regolazione e contemplazione.',
    moduleLinks: [
      { module: 'Rapporti', label: 'Come hai vissuto il test', anchor: 'report-rapporti' },
      { module: 'Galassia', label: 'Calma e distacco', anchor: 'report-galassia' },
    ],
  },
  'slancio-vitale': {
    id: 'slancio-vitale',
    label: 'slancio vitale',
    shortMeaning: CORPUS_SCHEMA_ASSI_ORIENTAMENTO[3],
    meaning: `${CORPUS_RITMO_RAPPORTO_ANIMA_SLANCIO_REGOLAZIONE}\n\n${CORPUS_GIALLO_NARRATIVE_SLANCIO_VITALE}\n\n${CORPUS_RITMO_COSA_ATTIVA_SLANCIO_CALMA}`,
    reflectionQuestion: 'Questo movimento sta aprendo esperienza o disperdendo attenzione?',
    relatedDispositions: ['entusiasmo', 'collerico_volitiva'],
    relatedRawKeys: ['GIALLO_1_Gioia_Entusiasmo', 'GIALLO_2_Volitivo_Passionale', 'ROSSO_1_Assertivita'],
    relatedPortato: ['Simpatia'],
    relatedConcepts: [],
    evidenceLabel: 'Cerca famiglia gialla, partecipazione simpatetica e relazioni con la corrente rossa.',
    sourceLines: [
      CORPUS_RITMO_RAPPORTO_ANIMA_SLANCIO_REGOLAZIONE,
      CORPUS_GIALLO_NARRATIVE_SLANCIO_VITALE,
      CORPUS_RITMO_COSA_ATTIVA_SLANCIO_CALMA,
    ],
    calculationLabel: 'Somma dei valori delle correnti collegate a curiosità, movimento, slancio e azione.',
    moduleLinks: [
      { module: 'Profilo', label: 'Capitolo Memoria, Esperienza, Essere Musica', anchor: 'report-chapter-racconto' },
      { module: 'Galassia', label: 'Entusiasmo', anchor: 'report-galassia' },
    ],
  },
}

export const PRIMARY_SEMANTIC_CONCEPT_BY_COLOR: Record<string, string | null> = {
  Blu: 'memoria-emotiva',
  Rosso: null,
  Verde: 'regolazione-interna',
  Giallo: 'slancio-vitale',
  Grigio: null,
}

export function getSemanticConcept(id: string | null | undefined): SemanticConcept | null {
  if (!id) return null
  return SEMANTIC_CONCEPTS[id] ?? null
}

export function getPrimarySemanticConceptIdForColor(colorName: string | null | undefined): string | null {
  if (!colorName) return null
  return PRIMARY_SEMANTIC_CONCEPT_BY_COLOR[colorName] ?? PRIMARY_SEMANTIC_CONCEPT_BY_COLOR[String(colorName).trim()] ?? null
}
