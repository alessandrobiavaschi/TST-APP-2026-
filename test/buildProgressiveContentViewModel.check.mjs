/**
 * Controllo deterministico del view model di rendering progressivo (Fase 2D).
 * Esecuzione manuale: node test/buildProgressiveContentViewModel.check.mjs
 * Nessun test framework introdotto.
 *
 * Le percentuali/chiavi qui sotto sono fixture di regressione: verificano ordine,
 * dedup, quasi-parità e smart-exit del view model — non compaiono nel codice
 * applicativo.
 */
import assert from 'node:assert/strict'
import { buildProgressiveContentViewModel } from '../src/utils/buildProgressiveContentViewModel.js'
import { classifyFamilyRanking } from '../src/utils/reportCompositionSensitivity.js'
import { buildReportContentSelection } from '../src/utils/buildReportContentSelection.js'

function logCase(title, obj) {
  console.log(`\n--- ${title} ---`)
  console.log(JSON.stringify(obj, null, 2))
}

function viewModelFor(entries) {
  const classified = classifyFamilyRanking(entries, { scope: 'global', source: 'fixture' })
  const contentCards = buildReportContentSelection(classified.contentPlan, { contentType: 'famiglia' })
  return buildProgressiveContentViewModel({ ranking: classified.ranking, contentCards })
}

// CASO A — QUASI-PARITÀ
const vmA = viewModelFor([
  { familyKey: 'rosso', percent: 33 },
  { familyKey: 'blu', percent: 32 },
  { familyKey: 'giallo', percent: 21 },
  { familyKey: 'verde', percent: 9 },
  { familyKey: 'grigio', percent: 5 },
])
logCase('CASO A — quasi-parità', {
  primary: vmA.primaryFamilies.map((c) => [c.familyKey, c.isQuasiParitaria]),
  compactCompanion: vmA.compactCompanion?.familyKey,
  marginal: vmA.marginalFamilies.map((c) => c.familyKey),
})
assert.equal(vmA.hasMultiplePrimary, true)
assert.equal(vmA.isExactTie, false)
assert.equal(vmA.isComposite, true)
assert.deepEqual(vmA.primaryFamilies.map((c) => c.familyKey), ['rosso', 'blu'])
assert.equal(vmA.primaryFamilies[0].isQuasiParitaria, false) // leader: mai "quasi paritaria"
assert.equal(vmA.primaryFamilies[1].isQuasiParitaria, true)
assert.equal(vmA.compactCompanion.familyKey, 'giallo')
assert.deepEqual(vmA.marginalFamilies.map((c) => c.familyKey), ['verde', 'grigio'])

// CASO B — DOMINANTE FORTE (una sola primary, una companion in fascia "secondary")
const vmB = viewModelFor([
  { familyKey: 'rosso', percent: 55 },
  { familyKey: 'blu', percent: 25 },
  { familyKey: 'giallo', percent: 10 },
  { familyKey: 'verde', percent: 6 },
  { familyKey: 'grigio', percent: 4 },
])
assert.equal(vmB.hasMultiplePrimary, false)
assert.equal(vmB.isComposite, false)
assert.deepEqual(vmB.primaryFamilies.map((c) => c.familyKey), ['rosso'])
assert.equal(vmB.compactCompanion.familyKey, 'blu')

// CASO C — EXACT TIE
const vmC = viewModelFor([
  { familyKey: 'rosso', percent: 40 },
  { familyKey: 'blu', percent: 40 },
  { familyKey: 'giallo', percent: 10 },
  { familyKey: 'verde', percent: 5 },
  { familyKey: 'grigio', percent: 5 },
])
logCase('CASO C — exact tie', { primary: vmC.primaryFamilies.map((c) => [c.familyKey, c.isQuasiParitaria]) })
assert.equal(vmC.isExactTie, true)
assert.deepEqual(vmC.primaryFamilies.map((c) => c.familyKey).sort(), ['blu', 'rosso'])
// Nessuna vincitrice unica: la seconda leader in pareggio è comunque "quasi paritaria" (pari dignità), non subordinata.
assert.equal(vmC.primaryFamilies.find((c) => c.familyKey === 'blu').isQuasiParitaria, true)

// CASO E — CONTENUTO MANCANTE (nessun fallback, nessuna card vuota)
const vmE = buildProgressiveContentViewModel({
  ranking: [{ familyKey: 'rosso', rank: 1, band: 'leader' }],
  contentCards: {
    primary: [{ familyKey: 'rosso', familyName: 'Rosso', available: true, content: { nome: 'Marziale' }, role: 'primary' }],
    companion: [{ familyKey: 'sconosciuta', familyName: null, available: false, role: 'companion' }],
    theoretical: [],
    marginal: [],
    missingContentKeys: ['sconosciuta'],
    status: 'incomplete_content',
  },
})
assert.equal(vmE.hasCompanion, false) // la card non disponibile non viene mai renderizzata
assert.deepEqual(vmE.missingContentKeys, ['sconosciuta'])
assert.equal(vmE.status, 'incomplete_content')
assert.equal(vmE.primaryFamilies.length, 1) // il resto del report resta leggibile

// CASO F — NESSUNA COMPANION
const vmF = buildProgressiveContentViewModel({
  ranking: [{ familyKey: 'rosso', rank: 1, band: 'leader' }],
  contentCards: {
    primary: [{ familyKey: 'rosso', familyName: 'Rosso', available: true, content: { nome: 'Marziale' }, role: 'primary' }],
    companion: [],
    theoretical: [],
    marginal: [],
    missingContentKeys: [],
    status: 'ready',
  },
})
assert.equal(vmF.hasCompanion, false)
assert.equal(vmF.compactCompanion, null)

// ESCLUSIONE FAMIGLIA GIÀ MOSTRATA ALTROVE (ProfiloEmotivo esclude la dominante già nei capitoli)
const vmExclude = buildProgressiveContentViewModel({
  ranking: [
    { familyKey: 'rosso', band: 'leader' },
    { familyKey: 'blu', band: 'near_parity' },
  ],
  contentCards: {
    primary: [
      { familyKey: 'rosso', familyName: 'Rosso', available: true, content: { nome: 'Marziale' }, role: 'primary' },
      { familyKey: 'blu', familyName: 'Blu', available: true, content: { nome: 'Malinconica' }, role: 'primary' },
    ],
    companion: [],
    theoretical: [],
    marginal: [],
    missingContentKeys: [],
    status: 'ready',
  },
  excludeFamilyKeys: ['rosso'],
})
assert.deepEqual(vmExclude.primaryFamilies.map((c) => c.familyKey), ['blu'])

console.log('\nOK — tutti i casi del view model (A, B, C, E, F, esclusione) superati.')
