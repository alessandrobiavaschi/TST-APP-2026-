/**
 * Tema per famiglia colore del report TST.
 *
 * Mappa data-driven famiglia → identità visiva e narrativa, usata dalla nuova
 * esperienza report (hero full-bleed, sezione sintesi, fiore SVG, navbar).
 *
 * I colori sono soltanto una convenzione visiva per le 5 famiglie emotive.
 * `family` è il nome della famiglia; `characteristic`/`nature` descrivono
 * la natura (caratteristica emotiva). Non invertire questi due livelli.
 *
 * Nomi delle nature SOLO dal PDF «Parole per TST»: una famiglia ha più nature,
 * quindi `characteristic`/`nature`/`disposition` elencano le nature della famiglia
 * (fallback). La natura della persona è calcolata nel report (natura prevalente).
 */

import { elencoNaturePdf } from '../utils/naturePdf.js'

export const FAMILY_THEME = {
  Verde: {
    key: 'verde',
    label: 'Verde',
    family: 'Flemmatica',
    characteristic: elencoNaturePdf('verde').toUpperCase(),
    nature: `NATURA ${elencoNaturePdf('verde').toUpperCase()}`,
    corrente: 'Flemmatica',
    disposition: elencoNaturePdf('verde').toUpperCase(),
    macro: 'Calma',
    tagline: 'Caratteri emotivi che prediligono calma, riposo e contemplazione',
    gradient: { from: '#166534', to: '#14532d' },
    dot: '#4ade80',
    personalizedTitles: {
      natura: 'La famiglia Flemmatica',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse della famiglia Flemmatica',
      ombre: 'Ombre della famiglia Flemmatica',
    },
  },
  Rosso: {
    key: 'rosso',
    label: 'Rosso',
    family: 'Marziale',
    characteristic: elencoNaturePdf('rosso').toUpperCase(),
    nature: `NATURA ${elencoNaturePdf('rosso').toUpperCase()}`,
    corrente: 'Marziale',
    disposition: elencoNaturePdf('rosso').toUpperCase(),
    macro: 'Volitività',
    tagline: 'Caratteri emotivi in cui prevalgono volontà e spinta all’azione',
    gradient: { from: '#991b1b', to: '#7f1d1d' },
    dot: '#f87171',
    personalizedTitles: {
      natura: 'La famiglia Marziale',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse della famiglia Marziale',
      ombre: 'Ombre della famiglia Marziale',
    },
  },
  Blu: {
    key: 'blu',
    label: 'Blu',
    family: 'Malinconica',
    characteristic: elencoNaturePdf('blu').toUpperCase(),
    nature: `NATURA ${elencoNaturePdf('blu').toUpperCase()}`,
    corrente: 'Malinconica',
    disposition: elencoNaturePdf('blu').toUpperCase(),
    macro: 'Malinconia',
    tagline: 'Caratteri emotivi che prediligono riflessività, dialogo intimo e percezione interiore',
    gradient: { from: '#1e3a8a', to: '#172554' },
    dot: '#60a5fa',
    personalizedTitles: {
      natura: 'La famiglia Malinconica',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse della famiglia Malinconica',
      ombre: 'Ombre della famiglia Malinconica',
    },
  },
  Giallo: {
    key: 'giallo',
    label: 'Giallo',
    family: 'Entusiasta',
    characteristic: elencoNaturePdf('giallo').toUpperCase(),
    nature: `NATURA ${elencoNaturePdf('giallo').toUpperCase()}`,
    corrente: 'Entusiasta',
    disposition: elencoNaturePdf('giallo').toUpperCase(),
    macro: 'Entusiasmo',
    tagline: 'Caratteri emotivi orientati al movimento, alla scoperta e all’entusiasmo',
    gradient: { from: '#a16207', to: '#854d0e' },
    dot: '#fde047',
    personalizedTitles: {
      natura: 'La famiglia Entusiasta',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse della famiglia Entusiasta',
      ombre: 'Ombre della famiglia Entusiasta',
    },
  },
  Grigio: {
    key: 'grigio',
    label: 'Grigio',
    family: 'Razionale',
    characteristic: elencoNaturePdf('grigio').toUpperCase(),
    nature: `NATURA ${elencoNaturePdf('grigio').toUpperCase()}`,
    corrente: 'Razionale',
    disposition: elencoNaturePdf('grigio').toUpperCase(),
    macro: 'Anaffettività',
    tagline: 'Famiglia Razionale orientata al distacco intellettuale',
    gradient: { from: '#374151', to: '#1f2937' },
    dot: '#9ca3af',
    personalizedTitles: {
      natura: 'La famiglia Razionale',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse della famiglia Razionale',
      ombre: 'Ombre della famiglia Razionale',
    },
  },
}

const DEFAULT_FAMILY = FAMILY_THEME.Verde

/** Ordine canonico delle 5 famiglie (per liste e fiore SVG). */
export const FAMILY_ORDER = ['Verde', 'Rosso', 'Blu', 'Giallo', 'Grigio']

/** Chiave minuscola (blu/rosso/...) → nome famiglia con iniziale maiuscola. */
export const FAMILY_NAME_BY_KEY = {
  blu: 'Blu',
  rosso: 'Rosso',
  verde: 'Verde',
  giallo: 'Giallo',
  grigio: 'Grigio',
}

/** Etichette canoniche mostrate all'utente, distinte dalle chiavi colore interne. */
export const FAMILY_LABEL_BY_KEY = Object.fromEntries(
  Object.values(FAMILY_THEME).map((theme) => [theme.key, theme.family]),
)

export const FAMILY_CHARACTERISTIC_BY_KEY = Object.fromEntries(
  Object.values(FAMILY_THEME).map((theme) => [theme.key, theme.characteristic]),
)

/** Ritorna il tema della famiglia dominante (fallback: Verde). */
export function getFamilyTheme(dominantColorName) {
  if (!dominantColorName) return DEFAULT_FAMILY
  return FAMILY_THEME[dominantColorName] || DEFAULT_FAMILY
}

/** Stringa CSS `linear-gradient(...)` per lo sfondo full-bleed della hero. */
export function getFamilyGradientCss(dominantColorName) {
  const { gradient } = getFamilyTheme(dominantColorName)
  return `linear-gradient(160deg, ${gradient.from} 0%, ${gradient.to} 100%)`
}

/** Ritorna i titoli personalizzati per la famiglia (fallback: default). */
export function getPersonalizedTitles(dominantColorName) {
  const key = String(dominantColorName || '').toLowerCase().trim()
  const normalizedName = FAMILY_NAME_BY_KEY[key] || dominantColorName
  const theme = FAMILY_THEME[normalizedName] || getFamilyTheme(dominantColorName)
  if (theme && theme.personalizedTitles) {
    return theme.personalizedTitles
  }
  return {
    natura: 'La tua Natura',
    racconto: 'Memoria, Esperienza, Essere Musica',
    risorse: 'Le tue Risorse',
    ombre: 'Le tue Ombre',
  }
}
