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
    report.correnti.map((item) => ({
      corrente: item.nome,
      familyKey: item.familyKey,
      valore: item.scala1a7,
    })),
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

test('il portato 61 17 1 espone quote esatte, coordinate e una sintesi semplice', () => {
  const report = buildReportData({
    record: {
      raw: {
        PE_Simpatia: 61,
        PE_Antipatia: 17,
        PE_Indifferenza: 1,
      },
    },
  })

  assert.deepEqual(
    report.portato.dimensioni.map(({ key, label, valore, percentuale }) => ({
      key,
      label,
      valore,
      percentuale,
    })),
    [
      { key: 'Simpatia', label: 'Sintonia', valore: 61, percentuale: 77 },
      { key: 'Antipatia', label: 'Distonia', valore: 17, percentuale: 22 },
      { key: 'Indifferenza', label: 'Distanza', valore: 1, percentuale: 1 },
    ],
  )
  assert.equal(report.portato.prevalente, 'Simpatia')
  assert.equal(report.portato.prevalenteLabel, 'Sintonia')
  assert.equal(report.portato.quoteNormalizzate.Simpatia, 61 / 79)
  assert.equal(report.portato.quoteNormalizzate.Antipatia, 17 / 79)
  assert.equal(report.portato.quoteNormalizzate.Indifferenza, 1 / 79)
  assert.equal(report.portato.pad.punto.x, 17 / 79 + 0.5 / 79)
  assert.equal(report.portato.pad.punto.y, 1 / 79)
  assert.match(report.portato.sintesiInterpretativa, /soprattutto sintonia/)
  assert.match(report.portato.sintesiInterpretativa, /componente di distonia/)
  assert.match(report.portato.sintesiInterpretativa, /distanza è rimasta quasi assente/)
  assert.match(report.portato.sintesiInterpretativa, /In questo ascolto/)
})

test('parità e quasi equilibrio non forzano una prevalenza nella sintesi', () => {
  const quasiBilanciato = buildReportData({
    record: {
      raw: {
        PE_Simpatia: 34,
        PE_Antipatia: 33,
        PE_Indifferenza: 33,
      },
    },
  })
  const paritaInTesta = buildReportData({
    record: {
      raw: {
        PE_Simpatia: 45,
        PE_Antipatia: 45,
        PE_Indifferenza: 10,
      },
    },
  })

  assert.match(quasiBilanciato.portato.sintesiInterpretativa, /emerse con quote molto vicine/)
  assert.match(quasiBilanciato.portato.sintesiInterpretativa, /compresenza delle tre modalità/)
  assert.match(quasiBilanciato.portato.sintesiInterpretativa, /senza una nettamente prevalente/)
  assert.ok(quasiBilanciato.portato.sintesiInterpretativa.includes('sintonia'))
  assert.ok(quasiBilanciato.portato.sintesiInterpretativa.includes('distonia'))
  assert.ok(quasiBilanciato.portato.sintesiInterpretativa.includes('distanza'))
  assert.match(paritaInTesta.portato.sintesiInterpretativa, /sintonia e distonia/)
  assert.match(paritaInTesta.portato.sintesiInterpretativa, /intensità simile/)
  assert.match(paritaInTesta.portato.sintesiInterpretativa, /distanza è emersa in misura contenuta/)
})

test('il portato tutto a zero resta uno stato vuoto senza un falso punto nel pad', () => {
  const report = buildReportData({
    record: {
      raw: {
        PE_Simpatia: 0,
        PE_Antipatia: 0,
        PE_Indifferenza: 0,
      },
    },
    portatoEsperienziale: {
      dominantKey: 'Simpatia',
      description: 'Descrizione che non deve apparire senza punteggi.',
      vitalityInterpretation: 'Interpretazione che non deve apparire senza punteggi.',
      totals: { simpatia: 0, antipatia: 0, indifferenza: 0 },
    },
  })

  assert.equal(report.portato.hasData, false)
  assert.equal(report.portato.prevalente, '')
  assert.equal(report.portato.prevalenteLabel, '')
  assert.equal(report.portato.descrizione, '')
  assert.equal(report.portato.vitalita, '')
  assert.deepEqual(report.portato.quoteNormalizzate, {
    Simpatia: 0,
    Antipatia: 0,
    Indifferenza: 0,
  })
  assert.equal(report.portato.pad.punto, null)
  assert.match(report.portato.sintesiInterpretativa, /non ci sono dati sufficienti/)
  assert.match(report.portato.sintesiInterpretativa, /Per questo ascolto/)
})

test('la prevalenza del portato viene riconciliata con i punteggi correnti', () => {
  const report = buildReportData({
    record: {
      raw: {
        PE_Simpatia: 1,
        PE_Antipatia: 9,
        PE_Indifferenza: 0,
        Portato_Esperienziale_Prevalente: 'Simpatia',
      },
    },
    portatoEsperienziale: {
      dominantKey: 'Simpatia',
      description: 'Descrizione obsoleta della sintonia.',
      totals: { simpatia: 1, antipatia: 9, indifferenza: 0 },
    },
  })

  assert.equal(report.portato.prevalente, 'Antipatia')
  assert.equal(report.portato.prevalenteLabel, 'Distonia')
  assert.doesNotMatch(report.portato.descrizione, /Descrizione obsoleta/)
  assert.match(report.portato.sintesiInterpretativa, /soprattutto distonia/)
  assert.deepEqual(report.portato.pad.punto, { x: 0.9, y: 0 })
})

test('le coordinate del pad sono la combinazione delle quote non arrotondate', () => {
  const report = buildReportData({
    record: {
      raw: {
        PE_Simpatia: 2,
        PE_Antipatia: 3,
        PE_Indifferenza: 5,
      },
    },
  })
  const { quoteNormalizzate, pad, dimensioni } = report.portato

  assert.equal(Object.values(quoteNormalizzate).reduce((sum, quota) => sum + quota, 0), 1)
  assert.deepEqual(pad.vertici, {
    Simpatia: { x: 0, y: 0 },
    Antipatia: { x: 1, y: 0 },
    Indifferenza: { x: 0.5, y: 1 },
  })
  assert.deepEqual(pad.punto, { x: 0.55, y: 0.5 })
  assert.deepEqual(
    dimensioni.map(({ key, quotaNormalizzata }) => [key, quotaNormalizzata]),
    [
      ['Simpatia', 0.2],
      ['Antipatia', 0.3],
      ['Indifferenza', 0.5],
    ],
  )
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
