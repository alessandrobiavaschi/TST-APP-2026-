import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createServer } from 'vite'

let vite
let buildLessicoAnaliticoViewModel

before(async () => {
  vite = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  })
  const mod = await vite.ssrLoadModule('/src/utils/galassiaLessicoViewModel.js')
  buildLessicoAnaliticoViewModel = mod.buildLessicoAnaliticoViewModel
})

after(async () => {
  await vite?.close()
})

const FAMILY_KEYS = ['verde', 'rosso', 'blu', 'giallo', 'grigio']
const FAMILY_NAMES = ['Verde', 'Rosso', 'Blu', 'Giallo', 'Grigio']

function makeCorrenti(pesoByKey = {}) {
  return FAMILY_KEYS.map((familyKey, idx) => ({
    familyKey,
    familyName: FAMILY_NAMES[idx],
    peso: pesoByKey[familyKey] ?? 0,
    scala1a7: pesoByKey.scala1a7ByKey?.[familyKey] ?? 1,
  }))
}

test('lessicoStabile copre tutte e 5 le famiglie con fonte teoria', () => {
  const vm = buildLessicoAnaliticoViewModel({ correnti: makeCorrenti() })
  assert.deepEqual(Object.keys(vm.lessicoStabile).sort(), [...FAMILY_NAMES].sort())
  FAMILY_NAMES.forEach((name) => {
    assert.equal(vm.lessicoStabile[name].fonte, 'teoria')
    assert.ok(Array.isArray(vm.lessicoStabile[name].vocabolarioForme))
    assert.ok(Array.isArray(vm.lessicoStabile[name].vocabolarioAggettivi))
  })
})

test('lessicoSituazionale conserva conteggio, tracciabilita file e fonte test', () => {
  const rawRecord = {
    File_29: 'Saldo - sicuro - volitivo', // ROSSO_1_Assertivita
    File_30: 'Saldo - sicuro - volitivo', // stessa risposta, file diverso
    File_31: 'Sereno - fiducioso - aperto', // BLU_4_Solare
  }
  const vm = buildLessicoAnaliticoViewModel({ rawRecord, correnti: makeCorrenti() })

  const saldo = vm.lessicoSituazionale.find((p) => p.parola === 'Saldo')
  assert.ok(saldo, 'la parola "Saldo" deve emergere')
  assert.equal(saldo.count, 2)
  assert.deepEqual(saldo.fileKeys, ['File_29', 'File_30'])
  assert.equal(saldo.fonte, 'test')
  assert.equal(saldo.familyKey, 'rosso')

  // ordinamento per count decrescente: "Saldo" (count 2) prima di "Sereno" (count 1)
  const idxSaldo = vm.lessicoSituazionale.findIndex((p) => p.parola === 'Saldo')
  const idxSereno = vm.lessicoSituazionale.findIndex((p) => p.parola === 'Sereno')
  assert.ok(idxSaldo < idxSereno)
})

test('lessicoSituazionale vuoto segnala il gap corrispondente', () => {
  const vm = buildLessicoAnaliticoViewModel({ rawRecord: {}, correnti: makeCorrenti() })
  assert.deepEqual(vm.lessicoSituazionale, [])
  assert.ok(vm._gap.some((g) => g.startsWith('lessicoSituazionale:')))
})

test('campoDiForze: una sola famiglia al 100% produce una risultante uguale alla sua direzione statica', () => {
  const correnti = makeCorrenti({ blu: 100 })
  const vm = buildLessicoAnaliticoViewModel({ correnti })
  const bluForza = vm.campoDiForze.perFamiglia.find((f) => f.familyKey === 'blu')
  assert.ok(bluForza)
  assert.equal(vm.campoDiForze.risultante.x, bluForza.direzione.x)
  assert.equal(vm.campoDiForze.risultante.y, bluForza.direzione.y)
  assert.equal(vm.campoDiForze.risultante.z, bluForza.direzione.z)
  assert.ok(vm.campoDiForze.magnitudineRisultante > 0)
  assert.equal(vm.campoDiForze.polaritaDominante, bluForza.polarita)
})

test('campoDiForze: tutte le famiglie a zero producono una risultante nulla e deterministica', () => {
  const vm = buildLessicoAnaliticoViewModel({ correnti: makeCorrenti() })
  assert.deepEqual(vm.campoDiForze.risultante, { x: 0, y: 0, z: 0 })
  assert.equal(vm.campoDiForze.magnitudineRisultante, 0)
})

test('contrastiLessicali rileva un contrasto quando la policy dei Quattro Rapporti lo prevede', () => {
  const correnti = makeCorrenti({
    scala1a7ByKey: { blu: 6, rosso: 6, verde: 1, giallo: 1, grigio: 1 },
  })
  const vm = buildLessicoAnaliticoViewModel({ correnti })
  const bluRosso = vm.contrastiLessicali.find(
    (c) => c.coppia.includes('Blu') && c.coppia.includes('Rosso'),
  )
  assert.ok(bluRosso)
  assert.equal(bluRosso.isContrastante, true)
  assert.equal(bluRosso.gap, 0)
  // nessuna parola situazionale fornita: fallback esplicito al lessico stabile
  assert.equal(bluRosso.fonteParoleA, 'teoria')
  assert.equal(bluRosso.fonteParoleB, 'teoria')
})

test('contrastiLessicali preferisce le parole situazionali quando disponibili', () => {
  const rawRecord = { File_29: 'Saldo - sicuro - volitivo' } // ROSSO_1_Assertivita
  const correnti = makeCorrenti({
    scala1a7ByKey: { blu: 6, rosso: 6, verde: 1, giallo: 1, grigio: 1 },
  })
  const vm = buildLessicoAnaliticoViewModel({ rawRecord, correnti })
  const bluRosso = vm.contrastiLessicali.find(
    (c) => c.coppia.includes('Blu') && c.coppia.includes('Rosso'),
  )
  const rossoIsA = bluRosso.coppia[0] === 'Rosso'
  const fonteRosso = rossoIsA ? bluRosso.fonteParoleA : bluRosso.fonteParoleB
  const paroleRosso = rossoIsA ? bluRosso.paroleA : bluRosso.paroleB
  assert.equal(fonteRosso, 'test')
  assert.ok(paroleRosso.includes('Saldo'))
})

test('firmaPersonale e deterministica a parita di input', () => {
  const input = {
    correnti: makeCorrenti({ blu: 40, rosso: 30, verde: 15, giallo: 10, grigio: 5 }),
    dominantColorName: 'Blu',
    sottodisposizionePrevalente: 'Lunare',
    correntiByPeso: [
      { familyKey: 'blu' },
      { familyKey: 'rosso' },
      { familyKey: 'verde' },
      { familyKey: 'giallo' },
      { familyKey: 'grigio' },
    ],
  }
  const vm1 = buildLessicoAnaliticoViewModel(input)
  const vm2 = buildLessicoAnaliticoViewModel(input)
  assert.equal(vm1.firmaPersonale.codice, vm2.firmaPersonale.codice)
  assert.equal(vm1.firmaPersonale.codice, 'blu_lunare_blu-rosso-verde')
})

test('costellazioniSemantiche esclude Rosso e Grigio e segnala il grafo concetti assente', () => {
  const vm = buildLessicoAnaliticoViewModel({ correnti: makeCorrenti(), sottocorrenti: [] })
  const famiglieConCostellazione = vm.costellazioniSemantiche.map((c) => c.famiglieCollegate[0])
  assert.ok(!famiglieConCostellazione.includes('Rosso'))
  assert.ok(!famiglieConCostellazione.includes('Grigio'))
  vm.costellazioniSemantiche.forEach((c) => {
    assert.equal(c.relatedConceptsDisponibili, false)
  })
  assert.ok(vm._gap.some((g) => g.includes('relatedConcepts')))
  assert.ok(vm._gap.some((g) => g.includes('Rosso e Grigio')))
})
