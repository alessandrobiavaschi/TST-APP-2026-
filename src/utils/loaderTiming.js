/**
 * Regola unica dei tempi del loader TST.
 * - showDelayMs: il loader compare solo se l'attesa supera questa soglia
 *   (nei caricamenti immediati non lampeggia).
 * - minVisibleMs: una volta comparso resta almeno questo tempo, per evitare
 *   lo sfarfallio di un'animazione interrotta a metà ciclo.
 * - slowAfterMs: oltre questa durata il loader avvisa che l'attesa è insolita
 *   (e, dove ha senso, offre "Riprova"), così non resta muto all'infinito.
 */
export const LOADER_TIMING = Object.freeze({
  showDelayMs: 200,
  minVisibleMs: 400,
  slowAfterMs: 15000,
})

const isValidMs = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0

export function resolveLoaderTiming(overrides = {}) {
  const source = overrides && typeof overrides === 'object' ? overrides : {}
  return {
    showDelayMs: isValidMs(source.showDelayMs) ? source.showDelayMs : LOADER_TIMING.showDelayMs,
    minVisibleMs: isValidMs(source.minVisibleMs) ? source.minVisibleMs : LOADER_TIMING.minVisibleMs,
    slowAfterMs: isValidMs(source.slowAfterMs) ? source.slowAfterMs : LOADER_TIMING.slowAfterMs,
  }
}

/** Millisecondi per cui il loader deve ancora restare visibile prima di sparire. */
export function remainingVisibleMs(shownAt, now, minVisibleMs) {
  if (!isValidMs(shownAt) || !isValidMs(now)) return 0
  const elapsed = Math.max(0, now - shownAt)
  return Math.max(0, minVisibleMs - elapsed)
}

/** Azione "Riprova" standard: ricarica la pagina. Da usare solo dove non si perdono dati. */
export function reloadPage() {
  if (typeof window !== 'undefined') window.location.reload()
}
