import test from 'node:test'
import assert from 'node:assert/strict'
import { computeRelativePercentages } from '../src/utils/reportRecordUtils.js'

// Calcolatrice di controllo: la percentuale di una famiglia è punti ÷ totale × 100.
function quotaTorta(totals) {
  const sum = Object.values(totals).reduce((a, b) => a + b, 0)
  return Object.fromEntries(Object.entries(totals).map(([k, v]) => [k, (v / sum) * 100]))
}

test('le percentuali famiglia sono una torta semplice: punti ÷ totale', () => {
  // Test di Franco: 74 punti totali.
  const totals = { blu: 13, rosso: 24, verde: 12, giallo: 19, grigio: 6 }
  assert.deepEqual(computeRelativePercentages(totals), {
    rosso: 32, giallo: 26, blu: 18, verde: 16, grigio: 8,
  })
})

test('ogni percentuale dista meno di 1 punto dalla quota esatta e il totale è 100', () => {
  const casi = [
    { blu: 13, rosso: 24, verde: 12, giallo: 19, grigio: 6 },
    { blu: 40, rosso: 3, verde: 0, giallo: 7, grigio: 22 },
    { blu: 1, rosso: 1, verde: 1, giallo: 0, grigio: 0 },
    { blu: 18, rosso: 25, verde: 14, giallo: 18, grigio: 4 },
  ]
  for (const totals of casi) {
    const pct = computeRelativePercentages(totals)
    const esatte = quotaTorta(totals)
    assert.equal(Object.values(pct).reduce((a, b) => a + b, 0), 100)
    for (const k of Object.keys(totals)) {
      assert.ok(Math.abs(pct[k] - esatte[k]) < 1, `${k}: ${pct[k]} vs ${esatte[k].toFixed(2)}`)
    }
  }
})

test('tutte a zero restano a zero', () => {
  assert.deepEqual(computeRelativePercentages({ blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 0 }),
    { verde: 0, blu: 0, rosso: 0, giallo: 0, grigio: 0 })
})
