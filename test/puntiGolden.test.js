/**
 * Punteggi "golden": profili estremi calcolati A MANO, verificabili con carta e penna.
 * Se uno di questi test diventa rosso, è cambiato il modo in cui si contano i punti.
 *
 * Conteggio dei 72 passi (modello 2026_v4, «TST domanda per domanda» del 23/10/2026):
 *   Sensazioni: passi 5–28 (24), 42–45 (4 × peso 2 = 8), 47–50 (4), 52–57 (6), 59–72 (14) → 56 punti
 *   Aggettivi:  passi 29–40 (12), 41 riconferma (1 + 1) → 14 punti
 *   Affinità:   passi 1–4 (4), 46 (peso 2 → 2), 51 (1), 58 (1) → 8 punti, solo natura (nessun portato)
 *   Totale massimo per una sola natura: 56 + 14 + 8 = 78
 *   Razionale: negli aggettivi «Mi è indifferente» dà solo il portato → massimo 56 + 8 = 64
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { NATURE, PASSI, PORTATI, VERSIONE_MODELLO_LEGACY, getRegolePerPasso } from '../src/config/tstSistema.js'
import { MASSIMI_TEORICI, calcolaCeste } from '../src/utils/cesteTst.js'
import { computeColorTotals } from '../src/utils/reportRecordUtils.js'
import { computeTestResultFields, normalizzaRecordTst } from '../src/utils/testRecordProcessing.js'

/** Costruisce un test completo scegliendo per ogni passo la risposta data da `scegli(passo)`. */
function profilo(scegli) {
  return Object.fromEntries(PASSI.map((p) => [p.campoDb, scegli(p)]))
}

const zeroNature = Object.fromEntries(NATURE.map((n) => [n.campoDb, 0]))

test('profilo tutto Calma Fisica: 78 punti, 70 in simpatia (le affinità non hanno portato)', () => {
  const affinitaCalma = { 1: 'opzione2', 2: 'opzione3', 3: 'opzione3', 4: 'opzione2', 46: 'opzione2', 51: 'opzione3', 58: 'opzione4' }
  const record = profilo((p) =>
    affinitaCalma[p.numero] || (p.tipoDomanda === 'AGGETTIVI' ? 'Calmo - equilibrato - sognante' : 'Mi rilassa'),
  )
  const r = calcolaCeste(record)
  assert.equal(r.risposteValide, 72)
  assert.deepEqual(r.campiNature, { ...zeroNature, VERDE_2_CalmaFisica: 78 })
  assert.deepEqual(r.campiPortato, { PE_Simpatia: 70, PE_Antipatia: 0, PE_Indifferenza: 0 })
  const campi = computeTestResultFields({ ...record, ...r.campiNature, ...r.campiPortato })
  assert.equal(campi.Disposizione_Prevalente, 'Flemmatica')
  assert.equal(campi.Sottodisposizione_Prevalente, 'Calma Fisica')
})

test('profilo tutto indifferente: Distaccata 56, Anaffettiva 8, indifferenza 70', () => {
  const record = profilo((p) =>
    getRegolePerPasso(p.numero).some((r) => r.risposta === 'nessuna') ? 'nessuna' : 'Mi è indifferente',
  )
  const r = calcolaCeste(record)
  assert.equal(r.risposteValide, 72)
  // Sensazioni → Distaccata + indifferenza (56); aggettivi → solo indifferenza (14); «nessuna» → solo Anaffettiva (8).
  assert.deepEqual(r.campiNature, { ...zeroNature, GRIGIO_2_Distaccata: 56, GRIGIO_1_Anaffettiva: 8 })
  assert.equal(r.campiPortato.PE_Indifferenza, 70)
  assert.equal(r.famiglie.grigio, 64)
})

test('nessuna natura supera 78; quattro famiglie arrivano a 78, la Razionale a 64', () => {
  for (const n of NATURE) assert.ok(MASSIMI_TEORICI.naturePerCampo[n.campoDb] <= 78, n.nome)
  const raggiungibile = {}
  for (const sezione of Object.values(MASSIMI_TEORICI.perSezione)) {
    for (const [k, v] of Object.entries(sezione)) raggiungibile[k] = (raggiungibile[k] || 0) + v
  }
  assert.deepEqual(raggiungibile, { blu: 78, rosso: 78, verde: 78, giallo: 78, grigio: 64 })
  assert.deepEqual(MASSIMI_TEORICI.famiglie, raggiungibile)
})

test('500 test casuali: somme coerenti e motore = conteggio indipendente', () => {
  let seme = 42
  const caso = (n) => { seme = (seme * 1103515245 + 12345) % 2 ** 31; return seme % n }
  for (let k = 0; k < 500; k += 1) {
    const record = profilo((p) => { const regole = getRegolePerPasso(p.numero); return regole[caso(regole.length)].risposta })
    const r = calcolaCeste(record)
    const atteso = Object.fromEntries(NATURE.map((n) => [n.campoDb, 0]))
    const attesoPortato = Object.fromEntries(PORTATI.map((x) => [x.campoDb, 0]))
    for (const p of PASSI) {
      const regola = getRegolePerPasso(p.numero).find((x) => x.risposta === record[p.campoDb])
      if (!regola.natura && !regola.portato) continue // dato di conferma: nessun punto
      const molt = ['SENSAZIONI', 'AGGETTIVI'].includes(p.tipoDomanda) ? p.peso : 1
      const punti = regola.punti * molt + (p.riconferma ? 1 : 0)
      if (regola.natura) atteso[NATURE.find((n) => n.id === regola.natura).campoDb] += punti
      if (regola.portato) attesoPortato[PORTATI.find((x) => x.id === regola.portato).campoDb] += punti
    }
    assert.deepEqual(r.campiNature, atteso)
    assert.deepEqual(r.campiPortato, attesoPortato)
    const s = (o) => Object.values(o).reduce((a, b) => a + b, 0)
    // Le ceste con entrambe le coordinate + i punti con una sola coordinata ricompongono i totali.
    const tabella = s(Object.values(r.ceste).map(s))
    assert.equal(tabella + s(r.soloNatura), s(r.campiNature))
    assert.equal(tabella + s(r.soloPortato), s(r.campiPortato))
    assert.equal(s(r.campiNature), s(r.famiglie))
    assert.equal(PORTATI.length, Object.keys(r.campiPortato).length)
  }
})

test('una risposta che il motore non conosce viene contata come non valida', () => {
  const record = profilo((p) => (p.tipoDomanda === 'SENSAZIONI' ? 'Mi rilassa' : getRegolePerPasso(p.numero)[0].risposta))
  record.File_05 = 'Etichetta che non esiste più'
  assert.equal(calcolaCeste(record).risposteValide, 71)
})

test('un test storico mostra nel report gli stessi punti che erano stati consegnati', () => {
  // Record 2025_v1: risposte grezze con etichette del vecchio modello, contatori salvati.
  const storico = {
    ...profilo(() => 'NESSUNA'),
    GRIGIO_1_Anaffettiva: 72,
    PE_Indifferenza: 72,
    Disposizione_Prevalente: 'Anaffettività',
  }
  const letto = normalizzaRecordTst(storico)
  assert.equal(letto.versione_modello, VERSIONE_MODELLO_LEGACY)
  assert.equal(computeColorTotals(letto).grigio, 72)
})
