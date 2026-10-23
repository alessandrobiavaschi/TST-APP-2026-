import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createServer } from 'vite'
import { FAMIGLIE_TST } from '../src/content/paroleTst.js'

const PAROLE_PDF = new Set(
  FAMIGLIE_TST.flatMap((f) =>
    f.nature.flatMap((n) => [
      ...n.aggettivi,
      ...n.sostantivi,
      ...Object.values(n.associazioni || {}).flat(),
    ]),
  ).map((w) => w.toLowerCase()),
)

const EXPECTED_FAMILY_KEYS = ['blu', 'rosso', 'verde', 'giallo', 'grigio']
const EXPECTED_SUBCURRENT_FAMILY = {
  BLU_1_Depressiva: 'blu',
  BLU_2_Lunare: 'blu',
  BLU_3_Nostalgia: 'blu',
  BLU_4_Solare: 'blu',
  ROSSO_1_Assertivita: 'rosso',
  ROSSO_2_Dubbio_Collera: 'rosso',
  VERDE_1_CalmaContemplativa: 'verde',
  VERDE_2_CalmaFisica: 'verde',
  GIALLO_1_Gioia_Entusiasmo: 'giallo',
  GIALLO_2_Volitivo_Passionale: 'giallo',
  GRIGIO_1_Anaffettiva: 'grigio',
  GRIGIO_2_Distaccata: 'grigio',
}

function assertJsonSafe(value, path = 'root') {
  assert.notEqual(typeof value, 'undefined', `${path} non deve essere undefined`)
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} deve essere finito`)
    return
  }
  if (value === null || typeof value !== 'object') return
  Object.entries(value).forEach(([key, nested]) => assertJsonSafe(nested, `${path}.${key}`))
}

let vite
let buildCorrentDataFromRecord
let buildDispositionNodes
let buildDispositionRelations
let computeGlobalBalance
let getDominantAndSecondary
let getDominantCorrente
let buildMinimalIdlePanel
let buildPlanetPanelContent
let buildSubPanelContent
let resolveGalassiaPanelContent
let theoreticalMaxBySubcurrent
let dizionario2
let extractParoleDalTest

before(async () => {
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })

  const dataModule = await vite.ssrLoadModule('/src/utils/galassiaData.js')
  const panelModule = await vite.ssrLoadModule('/src/utils/galassiaPanelContent.js')
  const mappingModule = await vite.ssrLoadModule('/src/config/galaxyMapping.ts')
  const scoringModule = await vite.ssrLoadModule('/src/testLogic.js')
  const reportModule = await vite.ssrLoadModule('/src/utils/buildReportData.js')

  buildCorrentDataFromRecord = dataModule.buildCorrentDataFromRecord
  buildDispositionNodes = mappingModule.buildDispositionNodes
  buildDispositionRelations = mappingModule.buildDispositionRelations
  computeGlobalBalance = mappingModule.computeGlobalBalance
  getDominantAndSecondary = mappingModule.getDominantAndSecondary
  getDominantCorrente = panelModule.getDominantCorrente
  buildMinimalIdlePanel = panelModule.buildMinimalIdlePanel
  buildPlanetPanelContent = panelModule.buildPlanetPanelContent
  buildSubPanelContent = panelModule.buildSubPanelContent
  resolveGalassiaPanelContent = panelModule.resolveGalassiaPanelContent
  theoreticalMaxBySubcurrent = scoringModule.THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY
  dizionario2 = scoringModule.DIZIONARIO_2
  extractParoleDalTest = reportModule.extractParoleDalTest
})

after(async () => {
  await vite?.close()
})

test('la Galassia vuota conserva cinque famiglie e undici sottocorrenti univoche', () => {
  const data = buildCorrentDataFromRecord()
  const subcurrents = data.flatMap((family) =>
    family.sottoCorrenti.map((sub) => ({ ...sub, familyKey: family.familyKey })),
  )

  assert.deepEqual(data.map((family) => family.familyKey), EXPECTED_FAMILY_KEYS)
  assert.equal(data.length, 5)
  assert.equal(subcurrents.length, 12)
  assert.equal(new Set(subcurrents.map((sub) => sub.id)).size, 12)
  assert.ok(data.every((family) => family.peso === 0))
  assert.ok(subcurrents.every((sub) => sub.peso === 0 && Number.isFinite(sub.peso)))

  subcurrents.forEach((sub) => {
    assert.equal(sub.familyKey, EXPECTED_SUBCURRENT_FAMILY[sub.id], sub.id)
  })
  assert.equal(
    subcurrents.find((sub) => sub.id === 'BLU_3_Nostalgia')?.nome,
    'Natura Nostalgica',
  )
})

test('record storici numerici o serializzati producono la stessa Galassia', () => {
  const numericRecord = {
    BLU_1_Depressiva: 5,
    BLU_2_Lunare: 2,
    ROSSO_1_Assertivita: 5,
  }
  const stringRecord = Object.fromEntries(
    Object.entries(numericRecord).map(([key, value]) => [key, String(value)]),
  )

  const numeric = buildCorrentDataFromRecord(numericRecord)
  const serialized = buildCorrentDataFromRecord(stringRecord)

  assert.deepEqual(serialized, numeric)
  assert.deepEqual(
    Object.fromEntries(numeric.map((family) => [family.familyKey, family.peso])),
    { blu: 58, rosso: 42, verde: 0, giallo: 0, grigio: 0 },
  )
})

test('ogni sottocorrente usa il proprio massimo teorico e resta tra zero e cento', () => {
  const recordAtMax = {
    versione_modello: '2026_v4',
    ...Object.fromEntries(
      Object.keys(EXPECTED_SUBCURRENT_FAMILY).map((rawKey) => [
        rawKey,
        theoreticalMaxBySubcurrent[rawKey],
      ]),
    ),
  }
  const data = buildCorrentDataFromRecord(recordAtMax)
  const subcurrents = data.flatMap((family) => family.sottoCorrenti)

  subcurrents.forEach((sub) => {
    const theoreticalMax = theoreticalMaxBySubcurrent[sub.id]
    assert.equal(sub.peso, theoreticalMax > 0 ? 100 : 0, sub.id)
    assert.ok(sub.peso >= 0 && sub.peso <= 100, sub.id)
  })

  data.forEach((family) => {
    assert.ok(family.statiDanimo.length <= 8, family.id)
    assert.equal(new Set(family.statiDanimo).size, family.statiDanimo.length, family.id)
  })
})

test('pannelli e selezione rispettano priorita, fallback e pareggi stabili', () => {
  const data = buildCorrentDataFromRecord({
    BLU_1_Depressiva: 4,
    ROSSO_1_Assertivita: 4,
  })
  const dominant = getDominantCorrente(data)
  const idle = buildMinimalIdlePanel(data)
  const selected = data.find((family) => family.familyKey === 'blu')
  const activeSub = selected.sottoCorrenti[0]

  assert.equal(dominant.familyKey, 'blu')
  assert.equal(idle.dominantChip.id, dominant.id)
  assert.equal(buildMinimalIdlePanel([]).dominantChip, null)
  assert.equal(buildPlanetPanelContent(null), null)
  assert.equal(buildSubPanelContent(null, selected), null)
  assert.equal(buildSubPanelContent(activeSub, null), null)

  assert.equal(
    resolveGalassiaPanelContent({
      correntData: data,
      selected,
      activeSub,
      hoveredPlanetId: data[1].id,
      hoveredSubId: '',
    }).id,
    activeSub.id,
  )
  assert.equal(
    resolveGalassiaPanelContent({
      correntData: data,
      selected: null,
      activeSub: null,
      hoveredPlanetId: data[1].id,
      hoveredSubId: '',
    }).id,
    data[1].id,
  )
})

test('mapping e relazioni restano deterministici, finiti e privi di duplicati', () => {
  const rawRecord = {
    BLU_1_Depressiva: 5,
    ROSSO_1_Assertivita: 3,
    VERDE_1_CalmaContemplativa: 2,
  }
  const totalsByKey = { blu: 5, rosso: 3, verde: 2, giallo: 0, grigio: 0 }
  const nodes = buildDispositionNodes({ rawRecord, totalsByKey })
  const relations = buildDispositionRelations(nodes)
  const pairIds = relations.map((relation) =>
    [relation.fromDispositionId, relation.toDispositionId].sort().join('::'),
  )

  assert.equal(nodes.length, 5)
  assert.equal(relations.length, 10)
  assert.equal(new Set(pairIds).size, 10)
  assert.ok(nodes.every((node) =>
    Number.isFinite(node.score) &&
    Number.isFinite(node.depthScore) &&
    Number.isFinite(node.sphereRadius) &&
    Object.values(node.position3d).every(Number.isFinite),
  ))
  assert.ok(relations.every((relation) =>
    relation.relationScore >= 0 &&
    relation.relationScore <= 100 &&
    relation.fromDispositionId !== relation.toDispositionId,
  ))

  const repeatedNodes = buildDispositionNodes({ rawRecord, totalsByKey })
  assert.deepEqual(repeatedNodes, nodes)
  assert.deepEqual(buildDispositionRelations(repeatedNodes), relations)
})

test('dominante, secondaria ed equilibrio globale gestiscono vuoti e casi estremi', () => {
  assert.deepEqual(getDominantAndSecondary([]), {
    dominant: null,
    secondary: null,
    contrastPercent: 0,
  })
  assert.equal(computeGlobalBalance([]), 0)
  assert.equal(computeGlobalBalance(Array.from({ length: 5 }, () => ({ score: 50 }))), 100)
  assert.equal(
    computeGlobalBalance([
      { score: 100 },
      { score: 0 },
      { score: 0 },
      { score: 0 },
      { score: 0 },
    ]),
    0,
  )

  const tie = getDominantAndSecondary([
    { dispositionId: 'prima', score: 70 },
    { dispositionId: 'seconda', score: 70 },
    { dispositionId: 'terza', score: 20 },
  ])
  assert.equal(tie.dominant.dispositionId, 'prima')
  assert.equal(tie.secondary.dispositionId, 'seconda')
  assert.equal(tie.contrastPercent, 0)
})

// Le parole emerse si mostrano sotto la natura in cui le mette il PDF: tre parole
// dei bottoni del test appartengono nel PDF a una natura diversa da quella che
// riceve il punto (il punteggio non cambia).
// Parole che il PDF «Parole per TST» colloca in una natura diversa da quella che
// riceve i punti della risposta (modello 2026_v4). Il lessico le mostra nella natura del PDF.
const NATURA_PDF_DIVERSA = {
  Inquieto: 'ROSSO_2_Dubbio_Collera',
  Chiuso: 'BLU_1_Depressiva',
  Pauroso: 'BLU_1_Depressiva',
  Ansioso: 'BLU_2_Lunare',
  Indifferente: 'GRIGIO_1_Anaffettiva',
  Sereno: 'BLU_4_Solare',
  Fiducioso: 'BLU_4_Solare',
  Aperto: 'BLU_4_Solare',
  Riflessivo: 'BLU_4_Solare',
  Distaccato: 'GRIGIO_1_Anaffettiva',
  Sognante: 'VERDE_1_CalmaContemplativa',
  Entusiasta: 'GIALLO_2_Volitivo_Passionale',
  Dinamico: 'GIALLO_1_Gioia_Entusiasmo',
  Curioso: 'GIALLO_2_Volitivo_Passionale',
  Fluido: 'GIALLO_2_Volitivo_Passionale',
  Consolato: 'BLU_4_Solare',
  // «Illuminato - amorevole - passionale» non dà punti: le parole vanno solo nella natura del PDF.
  Amorevole: 'BLU_4_Solare',
  Passionale: 'ROSSO_1_Assertivita',
}

test('ogni risposta lessicale mostra la parola nella natura del PDF', () => {
  Object.entries(dizionario2).forEach(([answerLabel, dictionaryEntry]) => {
    const words = extractParoleDalTest({ File_29: answerLabel })
    const expectedWords = answerLabel
      .split(' - ')
      .map((part) => part.trim())
      .filter((part) => part && part.toLowerCase() !== 'mi è indifferente')
      // Si mostrano solo le parole presenti nel PDF «Parole per TST» (es. "Illuminato" non c'è).
      .filter((part) => PAROLE_PDF.has(part.toLowerCase()))
    assert.equal(words.length, expectedWords.length, answerLabel)
    words.forEach((word) => {
      const expectedKey = NATURA_PDF_DIVERSA[word.parola] || dictionaryEntry.correnteKey
      assert.equal(word.familyKey, expectedKey.split('_')[0].toLowerCase(), `${answerLabel}: ${word.parola}`)
      assert.equal(word.correnteKey, expectedKey, `${answerLabel}: ${word.parola}`)
      assert.equal(word.count, 1, `${answerLabel}: ${word.parola}`)
      assert.equal(word.peso, 'emersa', `${answerLabel}: ${word.parola}`)
    })
  })
})

test('lessico situazionale aggrega ripetizioni e non inventa parole per label sconosciute', () => {
  const repeated = extractParoleDalTest({
    File_29: 'Saldo - sicuro - volitivo',
    File_30: 'Saldo - sicuro - volitivo',
    File_31: 'etichetta legacy non riconosciuta',
    File_32: '',
    File_42: 'Mi è indifferente',
  })

  assert.deepEqual(repeated.map((word) => word.parola), ['Saldo', 'Sicuro', 'Volitivo'])
  assert.ok(repeated.every((word) => word.count === 2))
  assert.ok(repeated.every((word) => word.familyKey === 'rosso'))
  assert.ok(repeated.every((word) => word.correnteKey === 'ROSSO_1_Assertivita'))
  assert.deepEqual(extractParoleDalTest({ File_29: 'etichetta legacy non riconosciuta' }), [])
})

test('output della Galassia e del lessico resta serializzabile e privo di valori non finiti', () => {
  const galaxy = buildCorrentDataFromRecord({
    BLU_1_Depressiva: '5',
    ROSSO_1_Assertivita: -10,
    GIALLO_1_Gioia_Entusiasmo: 999,
    VERDE_1_CalmaContemplativa: undefined,
    CORRENTE_LEGACY_SCONOSCIUTA: 20,
  })
  const lexical = extractParoleDalTest({ File_29: 'Sereno - fiducioso - aperto' })
  const output = { galaxy, lexical }

  assertJsonSafe(output)
  const serialized = JSON.stringify(output)
  assert.deepEqual(JSON.parse(serialized), output)
  assert.equal(galaxy.find((family) => family.familyKey === 'rosso').sottoCorrenti[0].peso, 0)
  assert.equal(galaxy.find((family) => family.familyKey === 'giallo').sottoCorrenti[0].peso, 100)
})
