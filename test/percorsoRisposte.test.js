import assert from 'node:assert/strict'
import { test } from 'node:test'

import { REGOLE_RISPOSTE } from '../src/config/tstSistema.js'
import { passiLeggibili, percorsoRisposte } from '../src/utils/percorsoRisposte.js'

test('restituisce sempre 72 passi, null dove manca la risposta', () => {
  const percorso = percorsoRisposte({})
  assert.equal(percorso.length, 72)
  assert.equal(passiLeggibili(percorso), 0)
})

test('ogni passo porta famiglia e portato della regola scelta', () => {
  const sensazione = REGOLE_RISPOSTE.SENSAZIONI[1] // Mi inquieta → giallo, antipatia
  const aggettivo = REGOLE_RISPOSTE.AGGETTIVI[0]
  const percorso = percorsoRisposte({
    File_01: 'opzione1',
    File_05: sensazione.risposta,
    File_29: aggettivo.risposta,
    File_10: 'risposta non prevista',
  })
  assert.equal(passiLeggibili(percorso), 3)
  assert.equal(percorso[0].portato, 'simpatia')
  assert.equal(percorso[4].famiglia, 'giallo')
  assert.equal(percorso[4].portato, 'antipatia')
  assert.equal(percorso[4].sezione, 'Timbro')
  assert.equal(percorso[28].sezione, 'Intervalli')
  assert.equal(percorso[9], null)
})
