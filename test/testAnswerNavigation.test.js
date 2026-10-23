import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  AFFINITA_BASE_OPZIONI,
  computeScoreDeltaForAnswer,
} from '../src/testLogic.js'
import { getNextFileAfterAnswer } from '../src/utils/testAnswerNavigation.js'

test('Nessuna registra un delta e avanza in tutti i quattro ascolti iniziali', () => {
  assert.ok(AFFINITA_BASE_OPZIONI.some((option) => option.id === 'nessuna'))

  for (let fileNumber = 1; fileNumber <= 4; fileNumber += 1) {
    const delta = computeScoreDeltaForAnswer({
      fileNumber,
      affinitaOptionId: 'nessuna',
    })

    // 2026_v4: le affinità danno punti solo alla natura («Solo TEMPERAMENTO, no PORTATO»).
    assert.deepEqual(delta, {
      GRIGIO_1_Anaffettiva: 1,
    })
    assert.equal(getNextFileAfterAnswer(fileNumber, 72), fileNumber + 1)
  }
})

test('L avanzamento non supera l ultimo ascolto', () => {
  assert.equal(getNextFileAfterAnswer(72, 72), 72)
  assert.equal(getNextFileAfterAnswer(0, 72), 0)
})

test('Il bottone Nessuna usa lo stesso flusso atomico delle altre risposte', async () => {
  const pageSource = await readFile(
    new URL('../src/pages/NewTestPage.jsx', import.meta.url),
    'utf8',
  )

  assert.match(
    pageSource,
    /onClick=\{\(\) => handleAnswer\(\{ affinitaOptionId: opt\.id \}\)\}/,
  )
  assert.match(pageSource, /proceedToNextStep\(fileNumber\)/)
  assert.match(
    pageSource,
    /setCurrentFile\(\(activeFile\) => \(activeFile === expectedFile \? nextFile : activeFile\)\)/,
  )
})
