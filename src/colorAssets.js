const VIDEO_BY_COLOR = {
  blu: '/ANIMAZIONE FIORI/FIORE BLU ANIMAZIONE.mp4',
  giallo: '/ANIMAZIONE FIORI/FIORE GIALLO ANIMAZIONE.mp4',
  grigio: '/ANIMAZIONE FIORI/FIORE GRIGIO ANIMAZIONE.mp4',
  rosso: '/ANIMAZIONE FIORI/FIORE ROSSO ANIMAZIONE.mp4',
  verde: '/ANIMAZIONE FIORI/FIORE VERDE ANIMAZIONE.mp4',
}

const STILL_BY_COLOR = {
  blu: '/images/texture_blu.webp',
  giallo: '/images/texture_giallo.webp',
  grigio: '/images/texture_grigio.webp',
  rosso: '/images/texture_rosso.webp',
  verde: '/images/texture_verde.webp',
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

export function getFlowerVideoByColor(colorKey) {
  if (!colorKey) return null
  return resolvePublicAssetPath(VIDEO_BY_COLOR[colorKey]) || null
}

export function getFlowerStillByColor(colorKey) {
  if (!colorKey) return null
  return resolvePublicAssetPath(STILL_BY_COLOR[colorKey]) || null
}

