const VIDEO_BY_COLOR = {
  blu: '/ANIMAZIONE FIORI/FIORE BLU ANIMAZIONE.mp4',
  giallo: '/ANIMAZIONE FIORI/FIORE GIALLO ANIMAZIONE.mp4',
  grigio: '/ANIMAZIONE FIORI/FIORE GRIGIO ANIMAZIONE.mp4',
  rosso: '/ANIMAZIONE FIORI/FIORE ROSSO ANIMAZIONE.mp4',
  verde: '/ANIMAZIONE FIORI/FIORE VERDE ANIMAZIONE.mp4',
}

const STILL_BY_COLOR = {
  blu: '/images/bg_banana_blu.webp',
  giallo: '/images/bg_banana_giallo.webp',
  grigio: '/images/bg_banana_grigio.webp',
  rosso: '/images/bg_banana_rosso.webp',
  verde: '/images/bg_banana_verde.webp',
}

function resolvePublicAssetPath(path) {
  if (!path) return null
  // Vite può essere servito anche sotto un sottopercorso (es. deployment/preview).
  // Normalizziamo base+path e codifichiamo spazi/caratteri speciali.
  const baseUrl = import.meta.env?.BASE_URL || '/'
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  return encodeURI(`${normalizedBase}${normalizedPath}`)
}

const COLOR_ALIAS = {
  marziale: 'rosso',
  malinconica: 'blu',
  flemmatica: 'verde',
  entusiasta: 'giallo',
  razionale: 'grigio',
  blue: 'blu',
  red: 'rosso',
  green: 'verde',
  yellow: 'giallo',
  gray: 'grigio',
  grey: 'grigio',
}

function normalizeColorKey(colorKey) {
  if (!colorKey) return null
  const raw = String(colorKey).toLowerCase().trim()
  return COLOR_ALIAS[raw] || raw
}

export function getFlowerVideoByColor(colorKey) {
  const key = normalizeColorKey(colorKey)
  if (!key) return null
  return resolvePublicAssetPath(VIDEO_BY_COLOR[key]) || null
}

export function getFlowerStillByColor(colorKey) {
  const key = normalizeColorKey(colorKey)
  if (!key) return null
  return resolvePublicAssetPath(STILL_BY_COLOR[key]) || null
}

