/**
 * View model puro per il rendering progressivo delle schede famiglia (Fase 2D).
 * Da { ranking, contentCards } (già prodotti dal motore e dall'adapter
 * buildReportContentSelection) deriva soltanto flag e liste pronte per la UI:
 * nessun calcolo, nessuna selezione di contenuto, nessun testo generato qui.
 */
import { FAMILY_THEME } from '../config/reportFamilyTheme.js'

const COMPOSITE_BANDS = new Set(['exact_tie', 'near_parity'])

export function buildProgressiveContentViewModel({
  ranking = [],
  contentCards = {},
  excludeFamilyKeys = [],
} = {}) {
  const bandByKey = Object.fromEntries(
    (Array.isArray(ranking) ? ranking : []).map((item) => [item.familyKey, item.band]),
  )
  const leaderKey = ranking?.[0]?.familyKey ?? null
  const isExactTie = (ranking || []).some((item) => item.band === 'exact_tie')
  const hasNearParity = (ranking || []).some((item) => item.band === 'near_parity')

  // Una card non disponibile (contenuto mancante) non entra mai nel view model: niente
  // card vuote da nascondere a valle, il chiamante vede soltanto ciò che è mostrabile.
  const exclude = new Set(excludeFamilyKeys)
  const withoutExcluded = (list) => (Array.isArray(list) ? list : []).filter(
    (card) => card?.familyKey && card.available && !exclude.has(card.familyKey),
  )

  // Una scheda primary che non è la leader ma condivide una fascia di parità con essa
  // (exact_tie/near_parity) è "quasi paritaria": pari dignità visiva, non subordinata.
  const annotate = (card) => ({
    ...card,
    colore: FAMILY_THEME[card.familyName]?.dot || null,
    isQuasiParitaria: card.familyKey !== leaderKey && COMPOSITE_BANDS.has(bandByKey[card.familyKey]),
  })

  const primaryFamilies = withoutExcluded(contentCards.primary).map(annotate)
  const companionFamilies = withoutExcluded(contentCards.companion).map(annotate)
  const theoreticalFamilies = withoutExcluded(contentCards.theoretical).map(annotate)
  const marginalFamilies = withoutExcluded(contentCards.marginal).map(annotate)

  return {
    primaryFamilies,
    hasMultiplePrimary: primaryFamilies.length > 1,
    isExactTie,
    isComposite: isExactTie || hasNearParity,
    companionFamilies,
    hasCompanion: companionFamilies.length > 0,
    // Vista compatta (Livello 1): al massimo una companion, mai di più.
    compactCompanion: companionFamilies[0] || null,
    theoreticalFamilies,
    marginalFamilies,
    missingContentKeys: Array.isArray(contentCards.missingContentKeys) ? contentCards.missingContentKeys : [],
    status: contentCards.status || 'ready',
  }
}
