const VIDEO_BY_COLOR = {
  blu: '/ANIMAZIONE FIORI/FIORE BLU ANIMAZIONE.mp4',
  giallo: '/ANIMAZIONE FIORI/FIORE GIALLO ANIMAZIONE.mp4',
  grigio: '/ANIMAZIONE FIORI/FIORE GRIGIO ANIMAZIONE.mp4',
  rosso: '/ANIMAZIONE FIORI/FIORE ROSSO ANIMAZIONE.mp4',
  verde: '/ANIMAZIONE FIORI/FIORE VERDE ANIMAZIONE.mp4',
}

const STILL_BY_COLOR = {
  blu: '/ANIMAZIONE FIORI/FERMO IMMAGINE/FERMO IMMAIGNE BLU.png',
  giallo: '/ANIMAZIONE FIORI/FERMO IMMAGINE/FERMO IMMAIGNE GIALLO..png',
  grigio: '/ANIMAZIONE FIORI/FERMO IMMAGINE/FERMO IMMAIGNE GRIGIO.png',
  rosso: '/ANIMAZIONE FIORI/FERMO IMMAGINE/FERMO IMMAIGNE ROSSO..png',
  verde: '/ANIMAZIONE FIORI/FERMO IMMAGINE/FERMO IMMAIGNE VERDE..png',
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

