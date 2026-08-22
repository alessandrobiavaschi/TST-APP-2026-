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
let computeRapportiTotalsFromRaw
let normalizeLevels

before(async () => {
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })
  const reportModule = await vite.ssrLoadModule('/src/utils/buildReportData.js')
  const scoringModule = await vite.ssrLoadModule('/src/testLogic.js')
  const recordUtilsModule = await vite.ssrLoadModule('/src/utils/reportRecordUtils.js')
  buildReportData = reportModule.buildReportData
  theoreticalMaxBySubcurrent = scoringModule.THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY
  computeRapportiTotalsFromRaw = recordUtilsModule.computeRapportiTotalsFromRaw
  normalizeLevels = recordUtilsModule.normalizeLevels
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
    Object.fromEntries(radar.map((item) => [item.familyKey, item.corrente])),
    {
      verde: 'Flemmatica',
      rosso: 'Marziale',
      blu: 'Malinconica',
      giallo: 'Entusiasta',
      grigio: 'Razionale',
    },
  )
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

test('descrive profili composti, graduatorie e pari merito senza perdere le sfumature', () => {
  const report = buildReportData({
    record: { raw: {} },
    dominantColorName: 'Rosso',
    rapportiTotals: {
      natura: { rosso: 14, blu: 12, giallo: 10, verde: 2, grigio: 2 },
      se: { rosso: 9, blu: 9, giallo: 4, verde: 1, grigio: 1 },
    },
    rapportiLevels: {
      natura: { rosso: 7, blu: 6, giallo: 5, verde: 1, grigio: 1 },
      se: { rosso: 7, blu: 7, giallo: 3, verde: 1, grigio: 1 },
    },
  })

  const natura = report.rapporti.find((item) => item.id === 'natura')
  const se = report.rapporti.find((item) => item.id === 'se')

  assert.equal(natura.profiloComposto, true)
  assert.deepEqual(natura.famiglieInEvidenza.map((item) => item.valore), [7, 6, 5])
  assert.match(natura.esitoComposizione, /Marziale 7\/7, Malinconica 6\/7, Entusiasta 5\/7/)
  assert.deepEqual(se.graduatoria.slice(0, 2).map((item) => item.valore), [7, 7])
  assert.match(se.esitoComposizione, /Prevalenza a pari punti/)
})

test('la lettura della Natura usa la prevalente della lente e racconta le secondarie', () => {
  const report = buildReportData({
    record: { raw: {} },
    dominantColorName: 'Rosso',
    rapportiTotals: {
      natura: { verde: 12, rosso: 8, blu: 6, giallo: 3, grigio: 2 },
    },
    rapportiLevels: {
      natura: { verde: 7, rosso: 5, blu: 4, giallo: 2, grigio: 1 },
    },
  })

  const natura = report.rapporti.find((item) => item.id === 'natura')

  assert.equal(natura.correntePrincipale.nome, 'Flemmatica')
  assert.match(natura.definizioneParagrafi[0], /famiglia Flemmatica.*punteggio più alto.*famiglia prevalente/i)
  assert.match(natura.definizioneParagrafi[1], /come Contemplativa.*natura emotiva di base/i)
  assert.match(natura.definizione, /seconda componente.*Marziale.*influenza discreta.*tensione significativa/i)
})

test('il contratto Natura ordina il peso reale prima delle opposizioni teoriche', () => {
  const naturaTotals = { rosso: 19, blu: 15, giallo: 12, verde: 7, grigio: 3 }
  const report = buildReportData({
    record: { raw: {} },
    dominantColorName: 'Rosso',
    rapportiTotals: { natura: naturaTotals },
    rapportiLevels: { natura: normalizeLevels(naturaTotals) },
  })
  const natura = report.rapporti.find((item) => item.id === 'natura')

  assert.equal(natura.correntePrincipale.nome, 'Marziale')
  assert.equal(natura.sintesiBreveParagrafi.length, 3)
  assert.match(natura.sintesiBreveParagrafi[0], /Marziale.*Volitivo-collerica/i)
  assert.match(natura.sintesiBreveParagrafi[1], /Malinconica.*riflessione.*consapevole/i)
  assert.doesNotMatch(natura.sintesiBreveParagrafi.join(' '), /natura Flemmatica/i)
  assert.match(natura.sintesiBreveParagrafi[2], /eccellente armonia/i)
  assert.doesNotMatch(natura.sintesiBreveParagrafi.join(' '), /%|punti percentuali/i)
})

test('correntePrincipale segue sempre la graduatoria locale del rapporto, non la Natura classica', () => {
  const naturaTotals = { verde: 12, rosso: 8, blu: 6, giallo: 3, grigio: 2 }
  const lensTotals = { rosso: 9, blu: 7, giallo: 5, verde: 3, grigio: 1 }
  const report = buildReportData({
    record: { raw: {} },
    totalsByKey: { rosso: 40, verde: 20, blu: 15, giallo: 15, grigio: 10 },
    dominantColorName: 'Rosso',
    rapportiTotals: {
      natura: naturaTotals,
      se: lensTotals,
      altro: lensTotals,
      agire: lensTotals,
    },
    rapportiLevels: {
      natura: normalizeLevels(naturaTotals),
      se: normalizeLevels(lensTotals),
      altro: normalizeLevels(lensTotals),
      agire: normalizeLevels(lensTotals),
    },
  })

  const natura = report.rapporti.find((item) => item.id === 'natura')
  const se = report.rapporti.find((item) => item.id === 'se')
  const altro = report.rapporti.find((item) => item.id === 'altro')
  const agire = report.rapporti.find((item) => item.id === 'agire')

  // correntePrincipale deriva sempre dalla graduatoria locale reale (localLeaderItem):
  // natura ha la propria graduatoria (leader verde), se/altro/agire condividono lensTotals
  // (leader rosso) — la famiglia "Natura classica" (verde) resta il dominantFamilyKey usato
  // dal motore narrativo come confronto teorico, ma non sostituisce mai il leader locale.
  assert.equal(natura.correntePrincipale.familyKey, 'verde')
  assert.equal(se.correntePrincipale.familyKey, 'rosso')
  assert.equal(altro.correntePrincipale.familyKey, 'rosso')
  assert.equal(agire.correntePrincipale.familyKey, 'rosso')
  assert.equal(se.narrativaRapporto.metrics.dominantFamilyKey, 'verde')
  assert.equal(altro.narrativaRapporto.metrics.dominantFamilyKey, 'verde')
  assert.equal(agire.narrativaRapporto.metrics.dominantFamilyKey, 'verde')
  assert.match(se.definizione, /Malinconica e Flemmatica.*modulazione/i)
  assert.match(altro.definizione, /Flemmatica ed Entusiasta.*tensione/i)
  assert.match(agire.definizione, /natura Contemplativa.*tensione/i)
})

test('un pari livello grafico mantiene la famiglia con più punti grezzi', () => {
  const report = buildReportData({
    record: { raw: {} },
    dominantColorName: 'Verde',
    rapportiTotals: {
      natura: { rosso: 14, verde: 13, blu: 0, giallo: 0, grigio: 0 },
    },
    rapportiLevels: {
      natura: { rosso: 7, verde: 7, blu: 1, giallo: 1, grigio: 1 },
    },
  })
  const natura = report.rapporti.find((item) => item.id === 'natura')

  assert.equal(natura.correntePrincipale.nome, 'Marziale')
  assert.match(natura.definizioneParagrafi[0], /famiglia Marziale/i)
  assert.match(natura.definizioneParagrafi[1], /Volitivo-collerica/i)
  assert.match(natura.definizione, /punti grezzi mantengono al primo posto la famiglia Marziale/i)
})

test('tutti i quattro rapporti espongono una lettura strutturata coerente con i propri dati', () => {
  const totals = {
    rosso: 31,
    blu: 23,
    giallo: 23,
    verde: 13,
    grigio: 10,
  }
  const levels = { rosso: 7, blu: 5, giallo: 5, verde: 3, grigio: 2 }
  const report = buildReportData({
    record: { raw: {} },
    dominantColorName: 'Rosso',
    rapportiTotals: {
      natura: totals,
      se: totals,
      altro: totals,
      agire: totals,
    },
    rapportiLevels: {
      natura: levels,
      se: levels,
      altro: levels,
      agire: levels,
    },
  })

  assert.deepEqual(report.rapporti.map((item) => item.id), ['natura', 'se', 'altro', 'agire'])
  report.rapporti.forEach((item) => {
    assert.ok(Array.isArray(item.definizioneParagrafi))
    assert.ok(item.definizioneParagrafi.length >= 3)
    assert.ok(Array.isArray(item.sintesiBreveParagrafi))
    assert.ok(item.sintesiBreveParagrafi.length >= 1)
    assert.ok(item.sintesiBreveParagrafi.length < item.definizioneParagrafi.length)
    assert.equal(item.definizione, item.definizioneParagrafi.join(' '))
    assert.notEqual(item.narrativaRapporto.status, 'empty')
  })

  const se = report.rapporti.find((item) => item.id === 'se')
  const altro = report.rapporti.find((item) => item.id === 'altro')
  const agire = report.rapporti.find((item) => item.id === 'agire')
  assert.match(se.definizione, /Malinconica raggiunge il 23%.*Marziale.*31%/i)
  assert.match(altro.definizione, /Entusiasmo.*23%.*Marziale.*31%.*8 punti percentuali/i)
  assert.match(agire.definizione, /Marziale raggiunge il 31%.*buona propensione all'azione/i)
})

test('le narrative consumano le quote delle combinazioni classiche ricostruite dal raw', () => {
  const raw = {
    File_05: 'Mi dà gioia',
    File_29: 'Saldo - sicuro - volitivo',
    File_43: 'Mi rilassa',
    File_52: 'Mi fa riflettere / mi porta a ricordare',
    File_59: 'Mi è indifferente',
  }
  const rapportiTotals = computeRapportiTotalsFromRaw(raw)
  const rapportiLevels = Object.fromEntries(
    Object.entries(rapportiTotals).map(([key, totals]) => [key, normalizeLevels(totals)]),
  )
  const report = buildReportData({
    record: { raw },
    totalsByKey: { blu: 1, rosso: 3, verde: 2, giallo: 1, grigio: 1 },
    dominantColorName: 'Rosso',
    rapportiTotals,
    rapportiLevels,
  })

  const natura = report.rapporti.find((item) => item.id === 'natura')
  const se = report.rapporti.find((item) => item.id === 'se')
  const altro = report.rapporti.find((item) => item.id === 'altro')
  const agire = report.rapporti.find((item) => item.id === 'agire')

  assert.deepEqual(
    Object.fromEntries(natura.datiRadar.map((item) => [item.familyKey, item.rawValue])),
    rapportiTotals.natura,
  )
  assert.equal(se.narrativaRapporto.metrics.awarenessPercent, 50)
  assert.equal(se.narrativaRapporto.metrics.harmonyPercent, 50)
  assert.equal(altro.narrativaRapporto.metrics.enthusiasmPercent, 50)
  assert.equal(altro.narrativaRapporto.metrics.dominantPercent, 0)
  assert.equal(agire.narrativaRapporto.metrics.martialPercent, 0)
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
  assert.equal(quasiBilanciato.portato.prevalente, '')
  assert.equal(quasiBilanciato.portato.prevalenteLabel, '')
  assert.ok(quasiBilanciato.portato.sintesiInterpretativa.includes('sintonia'))
  assert.ok(quasiBilanciato.portato.sintesiInterpretativa.includes('distonia'))
  assert.ok(quasiBilanciato.portato.sintesiInterpretativa.includes('distanza'))
  assert.match(paritaInTesta.portato.sintesiInterpretativa, /sintonia e distonia/)
  assert.match(paritaInTesta.portato.sintesiInterpretativa, /intensità simile/)
  assert.match(paritaInTesta.portato.sintesiInterpretativa, /distanza è emersa in misura contenuta/)
  assert.equal(paritaInTesta.portato.prevalente, '')
  assert.equal(paritaInTesta.portato.prevalenteLabel, '')
  assert.equal(paritaInTesta.portato.descrizione, '')
})

test('le percentuali del portato distribuiscono il resto e sommano sempre a cento', () => {
  const terzi = buildReportData({
    record: { raw: { PE_Simpatia: 1, PE_Antipatia: 1, PE_Indifferenza: 1 } },
  })
  const arrotondamentoAlto = buildReportData({
    record: { raw: { PE_Simpatia: 1, PE_Antipatia: 1, PE_Indifferenza: 4 } },
  })

  assert.deepEqual(terzi.portato.dimensioni.map((item) => item.percentuale), [34, 33, 33])
  assert.deepEqual(
    arrotondamentoAlto.portato.dimensioni.map((item) => item.percentuale),
    [17, 17, 66],
  )
  assert.equal(
    arrotondamentoAlto.portato.dimensioni.reduce((sum, item) => sum + item.percentuale, 0),
    100,
  )
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
