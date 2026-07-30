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
  const fields = computeTestResultFields({
    BLU_1_Depressiva: 5,
    ROSSO_1_Assertivita: 5,
    PE_Simpatia: 3,
    PE_Antipatia: 3,
  })
  assert.equal(fields.Disposizione_Prevalente, 'Malinconia')
  assert.equal(fields.Sottodisposizione_Prevalente, 'Depressiva')
  assert.equal(fields.Portato_Esperienziale_Prevalente, 'Simpatia')
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
