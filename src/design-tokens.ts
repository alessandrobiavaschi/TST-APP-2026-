/**
 * DESIGN TOKENS (TypeScript / JavaScript source)
 * ==============================================
 * Allineati con DESIGN.md e src/styles/design-tokens.css.
 * Da usare in componenti React / grafici SVG / canvas che necessitano di valori JS.
 */

export const colors = {
  // Fondali e Superfici (Dark / Default)
  bgCanvas: '#06080e',
  bgSurfaceSubtle: 'rgba(13, 17, 26, 0.55)',
  bgSurface: 'rgba(16, 22, 34, 0.78)',
  bgSurfaceElevated: 'rgba(22, 30, 48, 0.90)',
  bgHover: 'rgba(255, 255, 255, 0.07)',
  bgActive: 'rgba(255, 255, 255, 0.12)',

  // Bordi
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderDefault: 'rgba(255, 255, 255, 0.15)',
  borderStrong: 'rgba(255, 255, 255, 0.28)',
  borderFocus: '#38bdf8',

  // Testi
  textPrimary: '#f8fafc',
  textSecondary: 'rgba(248, 250, 252, 0.82)',
  textMuted: 'rgba(248, 250, 252, 0.60)',
  textGhost: 'rgba(248, 250, 252, 0.35)',

  // Accento di Sistema (Neutro)
  accentSystem: '#38bdf8',
  accentSystemSoft: 'rgba(56, 189, 248, 0.16)',
  accentSystemHover: '#7dd3fc',

  // Le 5 Famiglie Emotive (Mussida)
  famiglie: {
    blu: {
      key: 'blu',
      nome: 'Malinconica',
      hex: '#60a5fa',
      soft: 'rgba(96, 165, 250, 0.16)',
      glow: 'rgba(96, 165, 250, 0.35)',
    },
    rosso: {
      key: 'rosso',
      nome: 'Marziale',
      hex: '#f87171',
      soft: 'rgba(248, 113, 113, 0.16)',
      glow: 'rgba(248, 113, 113, 0.35)',
    },
    verde: {
      key: 'verde',
      nome: 'Flemmatica',
      hex: '#4ade80',
      soft: 'rgba(74, 222, 128, 0.16)',
      glow: 'rgba(74, 222, 128, 0.35)',
    },
    giallo: {
      key: 'giallo',
      nome: 'Entusiasta',
      hex: '#fde047',
      soft: 'rgba(253, 224, 71, 0.16)',
      glow: 'rgba(253, 224, 71, 0.35)',
    },
    grigio: {
      key: 'grigio',
      nome: 'Razionale',
      hex: '#94a3b8',
      soft: 'rgba(148, 163, 184, 0.16)',
      glow: 'rgba(148, 163, 184, 0.35)',
    },
  },

  // Feedback
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  info: '#38bdf8',

  // Compatibilità legacy per primitive preesistenti
  surface: 'rgba(16, 22, 34, 0.78)',
  border: 'rgba(255, 255, 255, 0.15)',
  text: '#f8fafc',
  primary: '#38bdf8',
  primarySoft: 'rgba(56, 189, 248, 0.16)',
} as const

/** Array canonico delle 5 famiglie per grafici radar e leggende */
export const radarFamiglie = [
  { subject: 'Malinconica', key: 'blu', color: colors.famiglie.blu.hex },
  { subject: 'Marziale', key: 'rosso', color: colors.famiglie.rosso.hex },
  { subject: 'Entusiasta', key: 'giallo', color: colors.famiglie.giallo.hex },
  { subject: 'Flemmatica', key: 'verde', color: colors.famiglie.verde.hex },
  { subject: 'Razionale', key: 'grigio', color: colors.famiglie.grigio.hex },
] as const

export const typography = {
  fonts: {
    display: "'Newsreader', Georgia, 'Times New Roman', serif",
    body: "'Manrope', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  },
  sizes: {
    hero: 'clamp(2.25rem, 5vw, 3.25rem)',
    h1: 'clamp(1.75rem, 3.5vw, 2.25rem)',
    h2: 'clamp(1.25rem, 2.5vw, 1.5rem)',
    h3: '1.125rem',
    bodyLg: '1.125rem',
    body: '1rem',
    bodySm: '0.875rem',
    caption: '0.75rem',
    mono: '0.8125rem',
  },
} as const

export const spacing = {
  '3xs': '0.125rem', // 2px
  '2xs': '0.25rem',  // 4px
  xs: '0.5rem',      // 8px
  sm: '0.75rem',     // 12px
  md: '1rem',        // 16px
  lg: '1.5rem',      // 24px
  xl: '2rem',        // 32px
  '2xl': '3rem',     // 48px
  '3xl': '4.5rem',   // 72px
} as const

export const radius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '28px',
  pill: '999px',
  // Compatibilità legacy
  base: '20px',
} as const

export const shadows = {
  sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
  md: '0 4px 20px rgba(0, 0, 0, 0.28)',
  lg: '0 12px 36px rgba(0, 0, 0, 0.38)',
  xl: '0 24px 64px rgba(0, 0, 0, 0.55)',
  // Compatibilità legacy
  base: '0 4px 20px rgba(0, 0, 0, 0.28)',
} as const

export const blurs = {
  sm: 'blur(8px)',
  md: 'blur(16px)',
  lg: 'blur(24px)',
} as const
