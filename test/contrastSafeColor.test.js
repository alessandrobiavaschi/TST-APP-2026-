import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureContrast, getContrastRatio } from '../src/utils/contrastSafeColor.js'

test('i 5 colori scuri escono con rapporto di contrasto >= 3:1 su #08090d', () => {
  const darkColors = ['#172554', '#1e40af', '#1d4ed8', '#9f2b68', '#475569']
  for (const hex of darkColors) {
    const safe = ensureContrast(hex, '#08090d', 3)
    const ratio = getContrastRatio(safe, '#08090d')
    assert.ok(
      ratio >= 3,
      `Colore ${hex} schiarito a ${safe} ha contrasto ${ratio.toFixed(2)}:1 (atteso >= 3:1)`,
    )
  }
})

test('#4ade80 e #eab308 escono invariati perche hanno gia contrasto sufficiente', () => {
  assert.equal(ensureContrast('#4ade80', '#08090d', 3), '#4ade80')
  assert.equal(ensureContrast('#eab308', '#08090d', 3), '#eab308')
})
