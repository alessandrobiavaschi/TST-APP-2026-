/**
 * Controllo deterministico dell'adapter buildReportContentSelection (Fase 2C).
 * Esecuzione manuale: node test/buildReportContentSelection.check.mjs
 * Nessun test framework introdotto.
 *
 * Le chiavi usate qui (rosso/blu/giallo/...) sono fixture di regressione: servono
 * solo a verificare ordine, dedup, provenienza e smart-exit dell'adapter — non
 * compaiono nel codice applicativo.
 */
import assert from 'node:assert/strict'
import { buildReportContentSelection } from '../src/utils/buildReportContentSelection.js'
import { getFamigliaApprofondimento } from '../src/content/famigliaApprofondimento.js'

function logCase(title, obj) {
  console.log(`\n--- ${title} ---`)
  console.log(JSON.stringify(obj, null, 2))
}

// CASO A — QUASI-PARITÀ: due primaryKeys, pari dignità, ordine e provenienza corretti
const planA = {
  primaryKeys: ['rosso', 'blu'],
  companionKeys: ['giallo'],
  theoreticalRelationKeys: [],
  marginalKeys: ['verde', 'grigio'],
}
const selectionA = buildReportContentSelection(planA, { contentType: 'famiglia' })
logCase('CASO A — quasi-parità', {
  primary: selectionA.primary.map((c) => c.familyKey),
  companion: selectionA.companion.map((c) => c.familyKey),
  marginal: selectionA.marginal.map((c) => c.familyKey),
  status: selectionA.status,
})

assert.equal(selectionA.status, 'ready')
assert.deepEqual(selectionA.primary.map((c) => c.familyKey), ['rosso', 'blu'])
assert.deepEqual(selectionA.primary.map((c) => c.role), ['primary', 'primary'])
assert.deepEqual(selectionA.companion.map((c) => c.familyKey), ['giallo'])
assert.deepEqual(selectionA.marginal.map((c) => c.familyKey), ['verde', 'grigio'])
// Contenuto restituito integralmente, stesso riferimento del selettore protetto: mai riscritto.
assert.equal(selectionA.primary[0].content, getFamigliaApprofondimento('Rosso'))
assert.equal(selectionA.primary[1].content, getFamigliaApprofondimento('Blu'))

// CASO B — DOMINANTE FORTE: una sola primaryKey
const planB = {
  primaryKeys: ['rosso'],
  companionKeys: ['blu'],
  theoreticalRelationKeys: [],
  marginalKeys: ['giallo', 'verde', 'grigio'],
}
const selectionB = buildReportContentSelection(planB, { contentType: 'famiglia' })
assert.deepEqual(selectionB.primary.map((c) => c.familyKey), ['rosso'])
assert.equal(selectionB.companion.length, 1)

// CASO C — DEDUP TRA RUOLI: una chiave ripetuta in più liste resta solo nel ruolo più alto
const planC = {
  primaryKeys: ['rosso', 'blu'],
  companionKeys: ['blu', 'giallo'], // 'blu' e' gia' primary: non deve ricomparire
  theoreticalRelationKeys: ['giallo'], // 'giallo' e' gia' companion: non deve ricomparire
  marginalKeys: ['rosso', 'verde'], // 'rosso' e' gia' primary: non deve ricomparire
}
const selectionC = buildReportContentSelection(planC, { contentType: 'famiglia' })
logCase('CASO C — dedup tra ruoli', {
  primary: selectionC.primary.map((c) => c.familyKey),
  companion: selectionC.companion.map((c) => c.familyKey),
  theoretical: selectionC.theoretical.map((c) => c.familyKey),
  marginal: selectionC.marginal.map((c) => c.familyKey),
})
assert.deepEqual(selectionC.primary.map((c) => c.familyKey), ['rosso', 'blu'])
assert.deepEqual(selectionC.companion.map((c) => c.familyKey), ['giallo'])
assert.deepEqual(selectionC.theoretical.map((c) => c.familyKey), [])
assert.deepEqual(selectionC.marginal.map((c) => c.familyKey), ['verde'])

// CASO E — CONTENUTO MANCANTE: nessun fallback verso una famiglia diversa
const planE = {
  primaryKeys: ['rosso', 'non_una_famiglia'],
  companionKeys: [],
  theoreticalRelationKeys: [],
  marginalKeys: [],
}
const selectionE = buildReportContentSelection(planE, { contentType: 'famiglia' })
logCase('CASO E — contenuto mancante', selectionE.missingContentKeys.length ? {
  primary: selectionE.primary.map((c) => c.familyKey),
  missingContentKeys: selectionE.missingContentKeys,
  status: selectionE.status,
} : selectionE)

assert.deepEqual(selectionE.primary.map((c) => c.familyKey), ['rosso'])
assert.deepEqual(selectionE.missingContentKeys, ['non_una_famiglia'])
assert.equal(selectionE.status, 'incomplete_content')
// Nessuna sostituzione verso Verde o altra famiglia: 'verde' non compare mai nel risultato.
assert.equal(selectionE.primary.some((c) => c.familyKey === 'verde'), false)
assert.equal(selectionE.companion.some((c) => c.familyKey === 'verde'), false)

console.log('\nOK — tutti i casi dell\'adapter (A, B, C, E) superati.')
