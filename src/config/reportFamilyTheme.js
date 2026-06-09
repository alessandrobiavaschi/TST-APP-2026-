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
    nature: 'NATURA FLEMMATICA',
    corrente: 'Flemmatica',
    disposition: 'CONTEMPLATIVA',
    macro: 'Calma',
    tagline: 'Caratteri emotivi che prediligono calma, riposo e contemplazione',
    gradient: { from: '#166534', to: '#14532d' },
    dot: '#22c55e',
  },
  Rosso: {
    key: 'rosso',
    label: 'Rosso',
    nature: 'NATURA MARZIALE',
    corrente: 'Marziale',
    disposition: 'VOLITIVO COLLERICA',
    macro: 'Volitività',
    tagline: 'Caratteri emotivi in cui prevalgono assertività e spinta all’azione',
    gradient: { from: '#991b1b', to: '#7f1d1d' },
    dot: '#ef4444',
  },
  Blu: {
    key: 'blu',
    label: 'Blu',
    nature: 'NATURA LUNARE',
    corrente: 'Lunare',
    disposition: 'MALINCONICO NOSTALGICA',
    macro: 'Malinconia',
    tagline: 'Caratteri emotivi che prediligono riflessività, dialogo intimo e percezione interiore',
    gradient: { from: '#1e3a8a', to: '#172554' },
    dot: '#3b82f6',
  },
  Giallo: {
    key: 'giallo',
    label: 'Giallo',
    nature: 'NATURA SOLARE',
    corrente: 'Solare',
    disposition: 'SANGUINICO ENTUSIASTA',
    macro: 'Entusiasmo',
    tagline: 'Caratteri emotivi orientati al movimento, alla scoperta e all’entusiasmo',
    gradient: { from: '#a16207', to: '#854d0e' },
    dot: '#eab308',
  },
  Grigio: {
    key: 'grigio',
    label: 'Grigio',
    nature: 'NATURA ANAFFETTIVA',
    corrente: 'Anaffettiva',
    disposition: 'AGNOSTICO ANAFFETTIVA',
    macro: 'Anaffettività',
    tagline: 'Corrente agnostico-anaffettiva orientata al distacco intellettuale',
    gradient: { from: '#374151', to: '#1f2937' },
    dot: '#6b7280',
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
