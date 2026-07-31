import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createServer } from 'vite'

const FAMILY_KEYS = ['verde', 'rosso', 'blu', 'giallo', 'grigio']
const SUBCURRENT_FAMILY_BY_KEY = {
  BLU_1_Depressiva: 'blu',
  BLU_2_Lunare: 'blu',
  BLU_3_Nostalgia: 'blu',
  BLU_4_Solare: 'blu',
  ROSSO_1_Assertivita: 'rosso',
  ROSSO_2_Dubbio_Collera: 'rosso',
  VERDE_1_Calma: 'verde',
  GIALLO_1_Gioia_Entusiasmo: 'giallo',
  GIALLO_2_Volitivo_Passionale: 'giallo',
  GRIGIO_1_Distaccato_Nichilista: 'grigio',
  GRIGIO_2_Intellettuale_Saggio: 'grigio',
}

let vite
let buildReportData
let theoreticalMaxBySubcurrent

before(async () => {
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })
  const reportModule = await vite.ssrLoadModule('/src/utils/buildReportData.js')
  const scoringModule = await vite.ssrLoadModule('/src/testLogic.js')
  buildReportData = reportModule.buildReportData
  theoreticalMaxBySubcurrent = scoringModule.THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY
})

after(async () => {
  await vite?.close()
})

test('mantiene tutte le famiglie e associa punti e presenza alla famiglia corretta', () => {
  const totals = { blu: 5, rosso: 3, verde: 2, giallo: 1, grigio: 0 }
  const report = buildReportData({
    record: { raw: {} },
    totalsByKey: totals,
    dominantColorName: 'Blu',
  })

  assert.deepEqual(report.correnti.map((item) => item.familyKey), FAMILY_KEYS)
  assert.deepEqual(
    Object.fromEntries(report.correnti.map((item) => [item.familyKey, item.peso])),
    { verde: 18, rosso: 27, blu: 46, giallo: 9, grigio: 0 },
  )
  assert.deepEqual(report.colorTotals, totals)
  assert.equal(report.correnti.length, 5)
  assert.equal(report.correnti.find((item) => item.familyKey === 'grigio').peso, 0)
  assert.deepEqual(
    report.sintesi.datiRadar,
    report.correnti.map((item) => ({ corrente: item.nome, valore: item.peso })),
  )
})

test('le presenze percentuali sommano a 100 e le parita mantengono un ordine stabile', () => {
  const report = buildReportData({
    record: { raw: {} },
    totalsByKey: { blu: 1, rosso: 1, verde: 1, giallo: 1, grigio: 1 },
    dominantColorName: 'Verde',
  })

  assert.equal(report.correnti.reduce((sum, item) => sum + item.peso, 0), 100)
  assert.deepEqual(report.correnti.map((item) => item.peso), [20, 20, 20, 20, 20])
  assert.deepEqual(report.correntiByPeso.map((item) => item.familyKey), FAMILY_KEYS)
})

test('l arrotondamento percentuale distribuisce il resto senza produrre 99 o 101', () => {
  const report = buildReportData({
    record: { raw: {} },
    totalsByKey: { blu: 1, rosso: 1, verde: 1, giallo: 0, grigio: 0 },
    dominantColorName: 'Verde',
  })
  const percentages = Object.fromEntries(
    report.correnti.map((item) => [item.familyKey, item.peso]),
  )

  assert.deepEqual(percentages, { verde: 34, rosso: 33, blu: 33, giallo: 0, grigio: 0 })
  assert.equal(Object.values(percentages).reduce((sum, value) => sum + value, 0), 100)
})

test('separa punti ottenuti, quota percentuale e valore normalizzato nei radar', () => {
  const report = buildReportData({
    record: { raw: {} },
    totalsByKey: { blu: 8, rosso: 4, verde: 0, giallo: 4, grigio: 0 },
    dominantColorName: 'Blu',
    rapportiTotals: {
      natura: { blu: 8, rosso: 4, verde: 0, giallo: 4, grigio: 0 },
    },
    rapportiLevels: {
      natura: { blu: 7, rosso: 4, verde: 1, giallo: 4, grigio: 1 },
    },
  })

  const radar = report.rapporti.find((item) => item.id === 'natura').datiRadar
  const blu = radar.find((item) => item.familyKey === 'blu')
  const verde = radar.find((item) => item.familyKey === 'verde')

  assert.equal(radar.length, 5)
  assert.deepEqual(
    {
      rawValue: blu.rawValue,
      totalRawPoints: blu.totalRawPoints,
      distributionPercent: blu.distributionPercent,
      normalizedValue: blu.valore,
    },
    { rawValue: 8, totalRawPoints: 16, distributionPercent: 50, normalizedValue: 7 },
  )
  assert.deepEqual(
    {
      rawValue: verde.rawValue,
      distributionPercent: verde.distributionPercent,
      normalizedValue: verde.valore,
    },
    { rawValue: 0, distributionPercent: 0, normalizedValue: 1 },
  )
})

test('le sottocategorie restano nella famiglia corretta e usano i massimi teorici', () => {
  const raw = Object.fromEntries(
    Object.keys(SUBCURRENT_FAMILY_BY_KEY).map((key) => [
      key,
      theoreticalMaxBySubcurrent[key],
    ]),
  )

  const report = buildReportData({
    record: { raw },
    dominantColorName: 'Blu',
  })
  const byKey = Object.fromEntries(report.sottocorrenti.map((item) => [item.rawKey, item]))

  assert.equal(report.sottocorrenti.length, 11)
  Object.entries(SUBCURRENT_FAMILY_BY_KEY).forEach(([rawKey, familyKey]) => {
    assert.equal(byKey[rawKey].familyKey, familyKey, rawKey)
  })
  Object.keys(SUBCURRENT_FAMILY_BY_KEY).forEach((rawKey) => {
    const theoreticalMax = theoreticalMaxBySubcurrent[rawKey]
    assert.equal(byKey[rawKey].valore, theoreticalMax, rawKey)
    assert.equal(byKey[rawKey].percentuale, theoreticalMax > 0 ? 100 : 0, rawKey)
  })
})

test('record mancanti o incompleti producono uno stato vuoto completo e sicuro', () => {
  const report = buildReportData()

  assert.deepEqual(report.colorTotals, {
    blu: 0,
    rosso: 0,
    verde: 0,
    giallo: 0,
    grigio: 0,
  })
  assert.equal(report.correnti.length, 5)
  assert.ok(report.correnti.every((item) => item.peso === 0))
  assert.equal(report.sottocorrenti.length, 11)
  assert.ok(report.sottocorrenti.every((item) => item.valore === 0 && item.percentuale === 0))
  assert.equal(report.portato.hasData, false)
  assert.ok(report._fallbacks.length > 0)
})

test('un record parziale conserva le famiglie assenti a zero senza produrre NaN', () => {
  const report = buildReportData({
    record: {
      raw: {
        BLU_1_Depressiva: 3,
        ROSSO_2_Dubbio_Collera: 1,
        VERDE_1_Calma: null,
      },
    },
    dominantColorName: 'Blu',
  })
  const percentages = Object.fromEntries(
    report.correnti.map((item) => [item.familyKey, item.peso]),
  )

  assert.deepEqual(report.colorTotals, {
    blu: 3,
    rosso: 1,
    verde: 0,
    giallo: 0,
    grigio: 0,
  })
  assert.deepEqual(percentages, { verde: 0, rosso: 25, blu: 75, giallo: 0, grigio: 0 })
  assert.ok(report.correnti.every((item) => Number.isFinite(item.peso)))
})

test('i risultati storici derivano i totali dal record e rispettano la sottodisposizione salvata', () => {
  const raw = {
    BLU_1_Depressiva: 8,
    BLU_2_Lunare: 2,
    BLU_3_Nostalgia: 1,
    BLU_4_Solare: 1,
    ROSSO_1_Assertivita: 3,
    VERDE_1_Calma: 2,
    GIALLO_1_Gioia_Entusiasmo: 1,
    GRIGIO_1_Distaccato_Nichilista: 0,
    Sottodisposizione_Prevalente: 'Solare',
  }
  const report = buildReportData({
    record: { id: 'storico-2025', raw },
    dominantColorName: 'Blu',
  })

  assert.deepEqual(report.colorTotals, {
    blu: 12,
    rosso: 3,
    verde: 2,
    giallo: 1,
    grigio: 0,
  })
  assert.equal(report.sottodisposizionePrevalente, 'Solare')
  assert.equal(report.correnti.length, 5)
  assert.equal(report.correnti.reduce((sum, item) => sum + item.peso, 0), 100)
})
