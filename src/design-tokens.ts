export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '40px',
  xl: '64px',
  section: '120px',
} as const

export const typography = {
  h1: {
    fontSize: '48px',
    lineHeight: 1.7,
    maxWidth: '720px',
  },
  h2: {
    fontSize: '32px',
    lineHeight: 1.7,
    maxWidth: '720px',
  },
  h3: {
    fontSize: '24px',
    lineHeight: 1.7,
    maxWidth: '720px',
  },
  body: {
    fontSize: '18px',
    lineHeight: 1.7,
    maxWidth: '720px',
  },
  caption: {
    fontSize: '14px',
    lineHeight: 1.7,
    maxWidth: '720px',
  },
} as const

export const radius = {
  base: '16px',
} as const

export const shadows = {
  base: '0 16px 40px rgba(18, 24, 40, 0.12)',
} as const

export const colors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#D0D8E4',
  text: '#111827',
  textStrong: '#0B1220',
  primary: '#2B4C8C',
  primarySoft: '#E7EEFC',
  highlight: '#FFD166',
} as const
