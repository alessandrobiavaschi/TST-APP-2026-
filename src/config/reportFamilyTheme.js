/**
 * Tema per famiglia colore del report TST.
 *
 * Mappa data-driven famiglia → identità visiva e narrativa, usata dalla nuova
 * esperienza report (hero full-bleed, sezione sintesi, fiore SVG, navbar).
 *
 * Le 5 famiglie colore corrispondono alle disposizioni:
 *   BLU → Malinconia · ROSSO → Volitività · VERDE → Calma
 *   GIALLO → Entusiasmo · GRIGIO → Anaffettività
 *
 * Per i nomi natura/disposizione si riusano, dove disponibili, le diciture
 * ufficiali già presenti nel repository (content_report.json / HeroSummary).
 */

export const FAMILY_THEME = {
  Verde: {
    key: 'verde',
    label: 'Verde',
    nature: 'CARATTERISTICA FLEMMATICA',
    corrente: 'Flemmatica',
    disposition: 'CONTEMPLATIVA',
    macro: 'Calma',
    tagline: 'Caratteri emotivi che prediligono calma, riposo e contemplazione',
    gradient: { from: '#166534', to: '#14532d' },
    dot: '#22c55e',
    personalizedTitles: {
      natura: 'La Natura del Flemmatico',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse del Flemmatico',
      ombre: 'Ombre del flemmatico',
    },
  },
  Rosso: {
    key: 'rosso',
    label: 'Rosso',
    nature: 'CARATTERISTICA MARZIALE',
    corrente: 'Marziale',
    disposition: 'VOLITIVO COLLERICA',
    macro: 'Volitività',
    tagline: 'Caratteri emotivi in cui prevalgono assertività e spinta all’azione',
    gradient: { from: '#991b1b', to: '#7f1d1d' },
    dot: '#ef4444',
    personalizedTitles: {
      natura: 'La Natura del Volitivo',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse del Volitivo',
      ombre: 'Ombre del volitivo',
    },
  },
  Blu: {
    key: 'blu',
    label: 'Blu',
    nature: 'CARATTERISTICA LUNARE',
    corrente: 'Lunare',
    disposition: 'MALINCONICO NOSTALGICA',
    macro: 'Malinconia',
    tagline: 'Caratteri emotivi che prediligono riflessività, dialogo intimo e percezione interiore',
    gradient: { from: '#1e3a8a', to: '#172554' },
    dot: '#3b82f6',
    personalizedTitles: {
      natura: 'La Natura del Malinconico - nostalgico',
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: 'Risorse del Malinconico - nostalgico',
      ombre: 'Ombre del malinconico - nostalgico',
    },
  },
  Giallo: {
    key: 'giallo',
    label: 'Giallo',
    nature: 'CARATTERISTICA EMOTIVA SOLARE',
    corrente: 'Solare',
    disposition: 'SANGUINICO ENTUSIASTA',
    macro: 'Entusiasmo',
    tagline: 'Caratteri emotivi orientati al movimento, alla scoperta e all’entusiasmo',
    gradient: { from: '#a16207', to: '#854d0e' },
    dot: '#eab308',
    personalizedTitles: {
      natura: "La Natura dell'Entusiasta",
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: "Risorse dell'Entusiasta",
      ombre: "Ombre dell'entusiasta",
    },
  },
  Grigio: {
    key: 'grigio',
    label: 'Grigio',
    nature: 'CARATTERISTICA ANAFFETTIVA',
    corrente: 'Anaffettiva',
    disposition: 'AGNOSTICO ANAFFETTIVA',
    macro: 'Anaffettività',
    tagline: 'Corrente agnostico-anaffettiva orientata al distacco intellettuale',
    gradient: { from: '#374151', to: '#1f2937' },
    dot: '#6b7280',
    personalizedTitles: {
      natura: "La Natura dell'Anaffettivo",
      racconto: 'Memoria, Esperienza ed essere Musica',
      risorse: "Risorse dell'Anaffettivo",
      ombre: "Ombre dell'anaffettivo",
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
