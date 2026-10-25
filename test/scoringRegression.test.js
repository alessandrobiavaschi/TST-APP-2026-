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
    // 2026_v4: il passo 42 (Groove 57 bpm) usa le 15 sensazioni come 43–45.
    [29, 41, 'DIZIONARIO_2'],
    [42, 45, 'DIZIONARIO_1'],
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
      isConfirmation: fileNumber === 41,
    }
    if (logicType === 'DIZIONARIO_1') params.answerLabel = Object.keys(DIZIONARIO_1)[0]
    else if (logicType === 'DIZIONARIO_2') params.answerLabel = Object.keys(DIZIONARIO_2)[0]
    else params.affinitaOptionId = 'opzione1'

    const delta = computeScoreDeltaForAnswer(params)
    for (const [key, value] of Object.entries(delta)) {
      totals[key] = (totals[key] || 0) + value
    }
  }

  // 2026_v4 (conto a mano):
  // «Mi dà gioia» ai 56 punti di sensazioni → Gioiosa Solare, simpatia.
  // «Saldo - sicuro - volitivo» ai passi 29–40 (12) + 41 riconferma (2) → Volitiva 14, simpatia.
  // Suono 1 delle affinità, solo natura: passi 1–4 e 58 → Gioiosa Solare (+5); 46 (×2) e 51 → Nostalgica 3.
  assert.deepEqual(totals, {
    GIALLO_1_Gioia_Entusiasmo: 61,
    PE_Simpatia: 70,
    ROSSO_1_Assertivita: 14,
    BLU_3_Nostalgia: 3,
  })
})
