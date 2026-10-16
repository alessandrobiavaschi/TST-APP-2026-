import test from 'node:test'
import assert from 'node:assert/strict'
import { LOADER_TIMING, remainingVisibleMs, resolveLoaderTiming } from '../src/utils/loaderTiming.js'

test('la soglia di comparsa evita il lampeggio ma resta sotto mezzo secondo', () => {
  assert.ok(LOADER_TIMING.showDelayMs > 0)
  assert.ok(LOADER_TIMING.showDelayMs < 500)
  assert.ok(LOADER_TIMING.minVisibleMs > 0)
  assert.ok(LOADER_TIMING.slowAfterMs > LOADER_TIMING.showDelayMs + LOADER_TIMING.minVisibleMs)
})

test('resolveLoaderTiming accetta solo durate valide e ricade sui valori comuni', () => {
  assert.deepEqual(resolveLoaderTiming(), { ...LOADER_TIMING })
  assert.deepEqual(resolveLoaderTiming(null), { ...LOADER_TIMING })
  const custom = resolveLoaderTiming({ showDelayMs: 0, minVisibleMs: -5, slowAfterMs: Number.NaN })
  assert.equal(custom.showDelayMs, 0)
  assert.equal(custom.minVisibleMs, LOADER_TIMING.minVisibleMs)
  assert.equal(custom.slowAfterMs, LOADER_TIMING.slowAfterMs)
})

test('remainingVisibleMs completa solo il tempo minimo mancante', () => {
  assert.equal(remainingVisibleMs(1000, 1100, 400), 300)
  assert.equal(remainingVisibleMs(1000, 1400, 400), 0)
  assert.equal(remainingVisibleMs(1000, 5000, 400), 0)
})

test('remainingVisibleMs non introduce attese se il loader non è mai comparso', () => {
  assert.equal(remainingVisibleMs(null, 1000, 400), 0)
  assert.equal(remainingVisibleMs(undefined, 1000, 400), 0)
  // orologio che torna indietro: nessuna attesa superiore al minimo
  assert.equal(remainingVisibleMs(2000, 1000, 400), 400)
})
