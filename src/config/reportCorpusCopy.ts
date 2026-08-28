import { DISPOSITIONS } from './dispositions'

/**
 * Stringhe letterali allineate a `src/content_report.json` (impianto_scientifico / sezioni_test / mapping_correnti).
 * Aggiornare qui se si modificano quei testi nel JSON.
 */
export const CORPUS_SCHEMA_ASSI_ORIENTAMENTO = [
  'Blu (famiglia Malinconica, natura Lunare): riflessività, malinconia descrittiva, nostalgia (orientamento introspettivo).',
  'Rosso (famiglia Marziale, natura Volitiva-Collerica): volontà, decisione, collera descrittiva (orientamento all’azione).',
  'Verde (famiglia flemmatica nel modello): calma, regolazione, contemplazione (orientamento omeostatico).',
  'Giallo (famiglia Entusiasta, natura Gioioso-Sanguinico): curiosità, slancio, partecipazione (orientamento esplorativo).',
  'Grigio (famiglia Razionale, natura Intellettuale-Razionale): distacco osservativo vs saggezza riflessiva (orientamento cognitivo-analitico).',
] as const

export const CORPUS_SCHEMA_INTERPRETATIVO_TITOLO = 'Schema interpretativo (ipotesi del modello)'

export const CORPUS_INTERVALLI_COSA_ATTIVA_MEMORIA =
  'Ipotesi del modello TST: attiva pensiero riflessivo, memoria emotiva e dimensione del sé nelle attese e risoluzioni tra i suoni.'

export const CORPUS_INTERVALLI_COSA_RAPPRESENTA_INTROSPEZIONE_APERTURA =
  'Ipotesi del modello TST: rappresenta il dialogo interno, la capacità di stare nella tensione e nel rilascio, di riflettere e di orientare l’energia emotiva verso introspezione o apertura.'

export const CORPUS_RITMO_RAPPORTO_ANIMA_SLANCIO_REGOLAZIONE =
  'Ipotesi del modello TST: il ritmo è associato allo slancio vitale e alla regolazione nel tempo (soggettività e agire — costrutto ipotetico).'

export const CORPUS_RITMO_COSA_ATTIVA_SLANCIO_CALMA =
  'Ipotesi del modello TST: attiva energia volitiva e corpo nel tempo (slancio, calma, impazienza, pazienza).'

export const CORPUS_MAPPING_BLU_REALE_NOSTALGIA =
  'Blu reale — nostalgia solare e lunare (settime minori/maggiori; armonie collegate nel testo: terza maggiore, quinta, sesta).'

export const CORPUS_MAPPING_CELESTE_SOLARE =
  'Celeste — malinconia solare (terza maggiore).'

export const CORPUS_MAPPING_ROSSO_QUARTA =
  'Associazione ipotizzata — Rosso: volontà decisa nel modello (intervallo di quarta).'

const gialloDisposition = DISPOSITIONS.find((d) => d.dispositionId === 'entusiasmo')

/** Allineato a `DISPOSITIONS` → Entusiasmo → narrativeShort (stesso testo usato altrove nell’app). */
export const CORPUS_GIALLO_NARRATIVE_SLANCIO_VITALE = gialloDisposition?.narrativeShort ?? ''
