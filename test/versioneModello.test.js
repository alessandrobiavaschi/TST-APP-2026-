import test from 'node:test'
import assert from 'node:assert/strict'

import { VERSIONE_MODELLO, VERSIONE_MODELLO_LEGACY, PASSI } from '../src/config/tstSistema.js'
import { createEmptyTestRecord } from '../src/dbSchema.js'
import { normalizzaRecordTst, versioneModelloDi } from '../src/utils/testRecordProcessing.js'

const CAMPO_PRIMO_PASSO = PASSI[0].campoDb

// Record storico: risposte grezze presenti, prevalenze calcolate col modello a 11 correnti.
const recordStorico = Object.freeze({
  [CAMPO_PRIMO_PASSO]: 'NESSUNA',
  BLU_1_Depressiva: 12,
  ROSSO_1_Assertivita: 3,
  Disposizione_Prevalente: 'Malinconia',
  Sottodisposizione_Prevalente: 'Depressiva',
  Portato_Esperienziale_Prevalente: 'Simpatia',
})

test('un nuovo test nasce con la versione corrente del modello', () => {
  assert.equal(createEmptyTestRecord().versione_modello, VERSIONE_MODELLO)
})

test('un record senza versione è letto come modello storico', () => {
  assert.equal(versioneModelloDi({}), VERSIONE_MODELLO_LEGACY)
  assert.equal(versioneModelloDi({ versione_modello: VERSIONE_MODELLO }), VERSIONE_MODELLO)
})

test('un test storico conserva punteggi e prevalenze salvati', () => {
  const letto = normalizzaRecordTst(recordStorico)
  assert.equal(letto.versione_modello, VERSIONE_MODELLO_LEGACY)
  assert.equal(letto.BLU_1_Depressiva, 12)
  assert.equal(letto.ROSSO_1_Assertivita, 3)
  assert.equal(letto.Disposizione_Prevalente, 'Malinconia')
  assert.equal(letto.Sottodisposizione_Prevalente, 'Depressiva')
  assert.equal(letto._ceste, undefined)
})

test('un test del modello corrente viene ricalcolato dalle risposte grezze', () => {
  const letto = normalizzaRecordTst({ ...recordStorico, versione_modello: VERSIONE_MODELLO })
  assert.equal(letto.versione_modello, VERSIONE_MODELLO)
  assert.ok(letto._ceste, 'le ceste devono essere ricostruite')
})

test('la lettura non modifica il record originale', () => {
  const originale = { ...recordStorico }
  normalizzaRecordTst(originale)
  assert.deepEqual(originale, { ...recordStorico })
})
