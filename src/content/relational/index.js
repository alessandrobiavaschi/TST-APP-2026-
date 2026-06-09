import * as flemmatico from './flemmatico.js'
import * as malinconico from './malinconico.js'
import * as assertivo from './assertivo.js'
import * as entusiasta from './entusiasta.js'
import * as anaffettivo from './anaffettivo.js'

export const CORPUS_BY_KEY = {
  flemmatico,
  malinconico,
  assertivo,
  entusiasta,
  anaffettivo,
}

/** Temperamento / famiglia dominante → chiave corpus relazioni. */
export const DOMINANT_TO_RELATIONS_KEY = {
  Flemmatica: 'flemmatico',
  flemmatica: 'flemmatico',
  flemmatico: 'flemmatico',
  Verde: 'flemmatico',
  verde: 'flemmatico',
  Calma: 'flemmatico',
  calma: 'flemmatico',
  Contemplativa: 'flemmatico',
  contemplativa: 'flemmatico',
  Lunare: 'malinconico',
  lunare: 'malinconico',
  Malinconico: 'malinconico',
  malinconico: 'malinconico',
  Malinconia: 'malinconico',
  malinconia: 'malinconico',
  Blu: 'malinconico',
  blu: 'malinconico',
  Marziale: 'assertivo',
  marziale: 'assertivo',
  Assertivo: 'assertivo',
  assertivo: 'assertivo',
  Volitività: 'assertivo',
  volitività: 'assertivo',
  volitivita: 'assertivo',
  Volitivo: 'assertivo',
  volitivo: 'assertivo',
  Rosso: 'assertivo',
  rosso: 'assertivo',
  Solare: 'entusiasta',
  solare: 'entusiasta',
  Entusiasta: 'entusiasta',
  entusiasta: 'entusiasta',
  Entusiasmo: 'entusiasta',
  entusiasmo: 'entusiasta',
  Giallo: 'entusiasta',
  giallo: 'entusiasta',
  Anaffettivo: 'anaffettivo',
  anaffettivo: 'anaffettivo',
  Anaffettività: 'anaffettivo',
  anaffettività: 'anaffettivo',
  anaffettivita: 'anaffettivo',
  Grigio: 'anaffettivo',
  grigio: 'anaffettivo',
}

export function getRelationalCorpusForDominant(correnteDominante, famiglia = '') {
  const fromCorrente = DOMINANT_TO_RELATIONS_KEY[String(correnteDominante || '').trim()]
  const fromFamiglia = DOMINANT_TO_RELATIONS_KEY[String(famiglia || '').trim()]
  const key = fromCorrente || fromFamiglia
  const corpus = CORPUS_BY_KEY[key]
  if (!corpus) {
    return {
      available: false,
      pendingMessage:
        'Le letture relazionali per questo profilo non sono ancora disponibili. Contatta l\'operatore per approfondimenti.',
    }
  }
  return {
    available: true,
    corpusKey: key,
    ...corpus.UI,
    relations: corpus.RELATIONS,
    source: corpus.SOURCE,
  }
}

// Retrocompatibilità
export const FLEMMATICO_RELATIONS_SOURCE = flemmatico.SOURCE
export const FLEMMATICO_RELATIONS_UI = flemmatico.UI
export const FLEMMATICO_RELATIONS = flemmatico.RELATIONS
