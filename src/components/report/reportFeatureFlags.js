/**
 * Feature flags temporanei per sezioni placeholder del report.
 */
export const SHOW_TRACCE_SECTION = false

/**
 * Relazioni tra famiglie: visibile solo quando esiste, oltre alla famiglia leader, almeno
 * una famiglia realmente significativa nel profilo (banda 'exact_tie', 'near_parity' o
 * 'secondary' da globalProfileContract — stessa fonte già usata per l'Hero e per i badge/
 * schede di SintesiCorrenti, nessuna nuova soglia introdotta qui, così la risposta a "c'è
 * una famiglia secondaria significativa?" resta identica in tutto il report).
 * Se il contratto non è disponibile o il profilo è a famiglia unica, la stanza resta
 * nascosta: niente relazione narrativa solo perché una famiglia secondaria ha un valore > 0.
 */
export function shouldShowEmotionalIntegrations(profilo) {
  const ranking = profilo?.globalProfileContract?.ranking
  if (!Array.isArray(ranking)) return false
  const NARRATABLE_BANDS = new Set(['exact_tie', 'near_parity', 'secondary'])
  return ranking.some((item) => item.rank > 1 && NARRATABLE_BANDS.has(item.band))
}

/** Sezione musica: visibile solo se l'utente ha dichiarato di suonare uno strumento. */
export function shouldShowMusicaSection(musicista = {}) {
  return Boolean(musicista?.active)
}
