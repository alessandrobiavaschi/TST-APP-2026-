import assert from 'node:assert/strict'
import test from 'node:test'

import {
  computeRapportiTotalsFromRaw,
  computeSezioniTotalsFromRaw,
  getReportSectionForFile,
} from '../src/utils/reportRecordUtils.js'

export const CLASSIC_FOUR_RELATIONS_FIXTURE = {
  File_05: 'Mi dà gioia',
  File_29: 'Saldo - sicuro - volitivo',
  File_43: 'Mi rilassa',
  File_52: 'Mi fa riflettere / mi porta a ricordare',
  File_59: 'Mi è indifferente',
}

test('mantiene i confini classici delle cinque aree sonore', () => {
  assert.equal(getReportSectionForFile(1), 'A_TIMBRO')
  assert.equal(getReportSectionForFile(28), 'A_TIMBRO')
  assert.equal(getReportSectionForFile(29), 'B_INTERVALLI')
  assert.equal(getReportSectionForFile(41), 'B_INTERVALLI')
  assert.equal(getReportSectionForFile(42), 'C_RITMO')
  assert.equal(getReportSectionForFile(51), 'C_RITMO')
  assert.equal(getReportSectionForFile(52), 'D_MELODIA')
  assert.equal(getReportSectionForFile(58), 'D_MELODIA')
  assert.equal(getReportSectionForFile(59), 'E_ARMONIA')
  assert.equal(getReportSectionForFile(72), 'E_ARMONIA')
})

test('calcola i quattro rapporti con le combinazioni classiche', () => {
  const { sezioniTotals, rapporti } = computeSezioniTotalsFromRaw(
    CLASSIC_FOUR_RELATIONS_FIXTURE,
  )

  assert.deepEqual(sezioniTotals.A_TIMBRO, {
    blu: 0, rosso: 0, verde: 0, giallo: 1, grigio: 0,
  })
  assert.deepEqual(sezioniTotals.B_INTERVALLI, {
    blu: 0, rosso: 1, verde: 0, giallo: 0, grigio: 0,
  })
  assert.deepEqual(sezioniTotals.C_RITMO, {
    blu: 0, rosso: 0, verde: 2, giallo: 0, grigio: 0,
  })
  assert.deepEqual(sezioniTotals.D_MELODIA, {
    blu: 1, rosso: 0, verde: 0, giallo: 0, grigio: 0,
  })
  assert.deepEqual(sezioniTotals.E_ARMONIA, {
    blu: 0, rosso: 0, verde: 0, giallo: 0, grigio: 1,
  })

  assert.deepEqual(rapporti.natura, {
    blu: 0, rosso: 1, verde: 0, giallo: 1, grigio: 1,
  })
  assert.deepEqual(rapporti.se, {
    blu: 1, rosso: 1, verde: 0, giallo: 0, grigio: 0,
  })
  assert.deepEqual(rapporti.altro, {
    blu: 1, rosso: 0, verde: 0, giallo: 1, grigio: 0,
  })
  assert.deepEqual(rapporti.agire, {
    blu: 1, rosso: 0, verde: 2, giallo: 0, grigio: 0,
  })

  assert.deepEqual(
    computeRapportiTotalsFromRaw(CLASSIC_FOUR_RELATIONS_FIXTURE),
    rapporti,
  )
})
