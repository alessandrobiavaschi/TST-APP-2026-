/**
 * Feature flags temporanei per sezioni placeholder del report.
 */
export const SHOW_TRACCE_SECTION = false

/** Relazioni tra temperamenti: sempre visibile per ogni profilo. */
export function shouldShowEmotionalIntegrations() {
  return true
}

/** Sezione musica: visibile solo se l'utente ha dichiarato di suonare uno strumento. */
export function shouldShowMusicaSection(musicista = {}) {
  return Boolean(musicista?.active)
}
