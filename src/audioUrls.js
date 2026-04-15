/**
 * URL dei sample del test (1.mp3 … 72.mp3).
 * Con VITE_AUDIO_BASE_URL gli MP3 restano fuori dal repo (CDN / Storage / altro sito).
 */
export function buildTestAudioUrl(fileIndex) {
  const base = String(import.meta.env.VITE_AUDIO_BASE_URL || '').trim().replace(/\/+$/, '')
  const file = `${fileIndex}.mp3`
  if (!base) return `/audio/${file}`
  return `${base}/${file}`
}

export function getAudioSourceIssue(audioUrl) {
  if (typeof window === 'undefined') return ''
  try {
    const resolvedUrl = new URL(String(audioUrl || ''), window.location.href)
    if (window.location.protocol === 'https:' && resolvedUrl.protocol === 'http:') {
      return 'Audio bloccato: URL HTTP non sicuro in pagina HTTPS. Usa HTTPS per VITE_AUDIO_BASE_URL.'
    }
  } catch {
    return 'URL audio non valido. Verifica VITE_AUDIO_BASE_URL o i file locali in /public/audio.'
  }
  return ''
}
