import test from 'node:test'
import assert from 'node:assert/strict'

import {
  TIE_BREAK_POLICY,
  compactTestRecord,
  computeTestResultFields,
  findPositiveMaximum,
} from '../src/utils/testRecordProcessing.js'

test('la parità usa stabilmente il primo candidato dichiarato', () => {
  assert.equal(TIE_BREAK_POLICY, 'stable-declared-order')
  assert.equal(findPositiveMaximum([['prima', 4], ['seconda', 4]]), 'prima')
})

test('i campi prevalenti rispettano la politica di parità documentata', () => {
  // Parità sul massimo teorico: Blu 146/292 = Rosso 75/150 = 50%.
  const fields = computeTestResultFields({
    BLU_1_Depressiva: 146,
    ROSSO_1_Assertivita: 75,
    PE_Simpatia: 3,
    PE_Antipatia: 3,
  })
  assert.equal(fields.Disposizione_Prevalente, 'Malinconica')
  assert.equal(fields.Sottodisposizione_Prevalente, 'Lunare Depressiva')
  assert.equal(fields.Portato_Esperienziale_Prevalente, 'Simpatia')
})

test('la prevalenza usa il massimo teorico, non i punti grezzi', () => {
  // Stessi punti grezzi, ma la famiglia Blu ha 4 nature (max 292) e la Rossa 2 (max 150).
  const fields = computeTestResultFields({ BLU_1_Depressiva: 5, ROSSO_1_Assertivita: 5 })
  assert.equal(fields.Disposizione_Prevalente, 'Marziale')
  assert.equal(fields.Sottodisposizione_Prevalente, 'Volitiva')
})

test('un record vuoto non produce prevalenze', () => {
  assert.deepEqual(computeTestResultFields({}), {})
})

test('la compattazione conserva valori falsy persistibili', () => {
  assert.deepEqual(compactTestRecord({ zero: 0, no: false, vuota: '', nil: null }), {
    zero: 0,
    no: false,
    vuota: '',
  })
})
