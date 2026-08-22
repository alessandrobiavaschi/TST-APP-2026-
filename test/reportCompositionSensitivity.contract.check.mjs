/**
 * Controllo deterministico del contratto interpretativo isolato (Fase 2A/2B).
 * Esecuzione manuale: node test/reportCompositionSensitivity.contract.check.mjs
 * Nessun test framework introdotto.
 *
 * IMPORTANTE SUI CASI DI TEST: i valori numerici usati qui sotto (A-F) sono
 * fixture sintetiche di regressione — servono soltanto a verificare il
 * comportamento delle regole generali (distanze, soglie, ruoli, ordinamento).
 * Non rappresentano un profilo speciale, un utente specifico o una regola
 * editoriale. Questi numeri esistono soltanto in questo file: non compaiono
 * nel motore, in buildReportData.js, nei componenti React o nei contenuti.
 */
import assert from 'node:assert/strict'
import {
  classifyFamilyRanking,
  buildRelationLensContract,
  classifyActionPropensityTechnical,
  reconcileContentPlan,
} from '../src/utils/reportCompositionSensitivity.js'
import { NATURA_RELATION_RULES } from '../src/utils/buildNaturaNarrative.js'

function logCase(title, obj) {
  console.log(`\n--- ${title} ---`)
  console.log(JSON.stringify(obj, null, 2))
}

// CASO A — GLOBALE (chiavi canoniche colore, non nomi editoriali)
const globalRanking = [
  { familyKey: 'rosso', percent: 33 },
  { familyKey: 'blu', percent: 32 },
  { familyKey: 'giallo', percent: 21 },
  { familyKey: 'verde', percent: 9 },
  { familyKey: 'grigio', percent: 5 },
]
const globalResult = classifyFamilyRanking(globalRanking, { scope: 'global', source: 'globalProfileRanking' })
logCase('CASO A — GLOBALE', globalResult)

assert.equal(globalResult.status, 'ready')
assert.equal(globalResult.leader.familyKey, 'rosso')
assert.deepEqual(globalResult.leaders, ['rosso'])
assert.equal(globalResult.hasUniqueLeader, true)
assert.equal(globalResult.ranking.find((f) => f.familyKey === 'blu').band, 'near_parity')
assert.equal(globalResult.ranking.find((f) => f.familyKey === 'giallo').band, 'secondary')
assert.equal(globalResult.ranking.find((f) => f.familyKey === 'verde').band, 'marginal')
assert.equal(globalResult.ranking.find((f) => f.familyKey === 'grigio').band, 'marginal')
assert.equal(globalResult.leadMode, 'near_parity')
assert.equal(globalResult.profileShape, 'composite')
assert.equal(globalResult.harmony.gap, 6.5)
assert.equal(globalResult.harmony.band, 'excellent')
assert.deepEqual(globalResult.contentPlan.primaryKeys, ['rosso', 'blu'])
assert.deepEqual(globalResult.contentPlan.companionKeys, ['giallo'])
assert.deepEqual(globalResult.contentPlan.marginalKeys, ['verde', 'grigio'])

// CASO B — AGIRE (referenceFamilyKey non anticipa mai displayPriority)
const actionRanking = [
  { familyKey: 'blu', percent: 43.5 },
  { familyKey: 'giallo', percent: 30.4 },
  { familyKey: 'rosso', percent: 21.7 },
]
const actionResult = buildRelationLensContract({
  scope: 'action',
  source: 'relationLocalRanking',
  ranking: actionRanking,
})
logCase('CASO B — AGIRE', actionResult)

assert.equal(actionResult.status, 'ready')
assert.equal(actionResult.localLeader.familyKey, 'blu')
assert.deepEqual(actionResult.localRanking.map((f) => f.familyKey), ['blu', 'giallo', 'rosso'])
assert.deepEqual(actionResult.displayPriority, ['blu', 'giallo', 'rosso'])
assert.equal(actionResult.referenceFamilyKey, 'rosso')
assert.equal(actionResult.referenceRank, 3)
assert.equal(actionResult.referenceRole, 'secondary')
assert.notEqual(actionResult.localLeader.familyKey, 'rosso')

const actionPropensity = classifyActionPropensityTechnical(actionResult.referencePercent)
assert.equal(actionPropensity, 'discrete')

// CASO C — PAREGGIO ESATTO
const tieRanking = [
  { familyKey: 'rosso', percent: 40 },
  { familyKey: 'blu', percent: 40 },
  { familyKey: 'giallo', percent: 10 },
  { familyKey: 'verde', percent: 5 },
  { familyKey: 'grigio', percent: 5 },
]
const tieResult = classifyFamilyRanking(tieRanking, { scope: 'global', source: 'tieFixture' })
logCase('CASO C — PAREGGIO ESATTO', tieResult)

assert.equal(tieResult.leadMode, 'exact_tie')
assert.equal(tieResult.hasUniqueLeader, false)
assert.deepEqual(tieResult.leaders.sort(), ['blu', 'rosso'])
assert.deepEqual(tieResult.contentPlan.primaryKeys.sort(), ['blu', 'rosso'])

// CASO D — INPUT INVALIDI
const negativePercent = classifyFamilyRanking([{ familyKey: 'rosso', percent: -5 }], { scope: 'global' })
const overHundred = classifyFamilyRanking([{ familyKey: 'rosso', percent: 150 }], { scope: 'global' })
const nanPercent = classifyFamilyRanking([{ familyKey: 'rosso', percent: NaN }], { scope: 'global' })
const wrongScale = classifyFamilyRanking(
  [{ familyKey: 'rosso', percent: 50 }, { familyKey: 'blu', percent: 50 }],
  { scope: 'global', scale: 'raw_points' },
)
logCase('CASO D — INPUT INVALIDI', { negativePercent, overHundred, nanPercent, wrongScale })

assert.equal(negativePercent.status, 'invalid_input')
assert.equal(overHundred.status, 'invalid_input')
assert.equal(nanPercent.status, 'invalid_input')
assert.equal(wrongScale.status, 'scale_mismatch')

// CASO E — CONTENUTO MANCANTE (le chiavi richieste non spariscono mai dal piano)
const planForCaseE = {
  primaryKeys: ['rosso', 'blu'],
  companionKeys: [],
  theoreticalRelationKeys: [],
  marginalKeys: [],
  missingContentKeys: [],
  status: 'ready',
}
const reconciled = reconcileContentPlan(planForCaseE, ['rosso'])
logCase('CASO E — CONTENUTO MANCANTE', reconciled)

assert.deepEqual(reconciled.primaryKeys, ['rosso', 'blu'])
assert.deepEqual(reconciled.availablePrimaryKeys, ['rosso'])
assert.deepEqual(reconciled.missingContentKeys, ['blu'])
assert.equal(reconciled.status, 'incomplete_content')

// CASO F — TENSIONE (solo kind === 'tension' entra in tensionKeys)
const tensionRanking = [
  { familyKey: 'rosso', percent: 40 },
  { familyKey: 'verde', percent: 25 },
  { familyKey: 'giallo', percent: 20 },
  { familyKey: 'blu', percent: 15 },
]
const tensionResult = buildRelationLensContract({
  scope: 'action',
  source: 'tensionFixture',
  ranking: tensionRanking,
  relationMatrix: NATURA_RELATION_RULES,
})
logCase('CASO F — TENSIONE', tensionResult)

assert.equal(NATURA_RELATION_RULES['rosso|verde'].kind, 'tension')
assert.equal(NATURA_RELATION_RULES['giallo|rosso'].kind, 'affinity')
assert.equal(NATURA_RELATION_RULES['blu|rosso'].kind, 'awareness')
assert.deepEqual(tensionResult.tensionKeys, ['verde'])
assert.deepEqual(tensionResult.theoreticalRelationKeys.sort(), ['blu', 'giallo'])
assert.equal(tensionResult.tensionKeys.includes('giallo'), false)
assert.equal(tensionResult.tensionKeys.includes('blu'), false)

console.log('\nOK — tutti i casi di accettazione (A-F) superati.')
