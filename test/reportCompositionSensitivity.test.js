import assert from 'node:assert/strict'
import test from 'node:test'

import {
  analyzeFamilyComposition,
  canSupportStrongInterpretation,
} from '../src/utils/reportCompositionSensitivity.js'

const family = (familyKey, distributionPercent, rawValue = distributionPercent) => ({
  familyKey,
  distributionPercent,
  rawValue,
})

test('riconosce le famiglie ravvicinate senza appiattirle sulla prima', () => {
  const result = analyzeFamilyComposition([
    family('rosso', 31),
    family('blu', 23),
    family('giallo', 23),
    family('verde', 13),
    family('grigio', 10),
  ])

  assert.equal(result.status, 'balanced')
  assert.deepEqual(result.foreground.map((item) => item.familyKey), ['rosso', 'blu', 'giallo'])
})

test('tiene una famiglia marginale dopo le componenti realmente salienti', () => {
  const result = analyzeFamilyComposition([
    family('rosso', 40),
    family('blu', 32),
    family('giallo', 19),
    family('verde', 5),
    family('grigio', 4),
  ])
  const verde = result.families.find((item) => item.familyKey === 'verde')

  assert.equal(verde.salience, 'marginal')
  assert.equal(canSupportStrongInterpretation(verde), false)
})
