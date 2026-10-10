import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  computeScoreDeltaForAnswer,
  DIZIONARIO_1,
  DIZIONARIO_2,
  getLogicTypeForFile,
  getScoreWeightForFile,
} from '../src/testLogic.js'

test('mantiene la mappa delle 72 domande e i cinque pesi speciali', () => {
  const expectedRanges = [
    [1, 4, 'AFFINITA_BASE'],
    [5, 28, 'DIZIONARIO_1'],
    [29, 42, 'DIZIONARIO_2'],
    [43, 45, 'DIZIONARIO_1'],
    [46, 46, 'AFFINITA_ECCEZIONE'],
    [47, 50, 'DIZIONARIO_1'],
    [51, 51, 'AFFINITA_STANDARD'],
    [52, 57, 'DIZIONARIO_1'],
    [58, 58, 'AFFINITA_STANDARD'],
    [59, 72, 'DIZIONARIO_1'],
  ]
  for (const [start, end, type] of expectedRanges) {
    for (let fileNumber = start; fileNumber <= end; fileNumber += 1) {
      assert.equal(getLogicTypeForFile(fileNumber), type, `file ${fileNumber}`)
    }
  }
  assert.deepEqual(
    Array.from({ length: 72 }, (_, index) => index + 1).filter(
      (fileNumber) => getScoreWeightForFile(fileNumber) === 2,
    ),
    [42, 43, 44, 45, 46],
  )
})

test('una fixture completa conserva esattamente i punteggi golden', () => {
  const totals = {}
  for (let fileNumber = 1; fileNumber <= 72; fileNumber += 1) {
    const logicType = getLogicTypeForFile(fileNumber)
    const params = {
      fileNumber,
      isConfirmation: fileNumber === 41 || fileNumber === 42,
    }
    if (logicType === 'DIZIONARIO_1') params.answerLabel = Object.keys(DIZIONARIO_1)[0]
    else if (logicType === 'DIZIONARIO_2') params.answerLabel = Object.keys(DIZIONARIO_2)[0]
    else params.affinitaOptionId = 'opzione1'

    const delta = computeScoreDeltaForAnswer(params)
    for (const [key, value] of Object.entries(delta)) {
      totals[key] = (totals[key] || 0) + value
    }
  }

  assert.deepEqual(totals, {
    // 2026_v3: al passo 58 il Suono 1 (arpa ascendente maggiore) va alla Gioiosa Solare, non più alla Nostalgica.
    GIALLO_1_Gioia_Entusiasmo: 59,
    PE_Simpatia: 79,
    ROSSO_1_Assertivita: 17,
    BLU_3_Nostalgia: 3,
  })
})
