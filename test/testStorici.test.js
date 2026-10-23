/**
 * Test salvati prima del modello attuale: si leggono con le regole della loro
 * epoca, solo se il ricalcolo coincide con i punti salvati. Dati inventati.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { PASSI, VERSIONE_MODELLO, VERSIONE_MODELLO_LEGACY } from '../src/config/tstSistema.js'
import { calcolaCeste } from '../src/utils/cesteTst.js'
import { computeColorTotals, computeSezioniTotalsFromRaw } from '../src/utils/reportRecordUtils.js'
import { percorsoRisposte } from '../src/utils/percorsoRisposte.js'
import { normalizzaRecordTst } from '../src/utils/testRecordProcessing.js'
import { REGOLE_STORICHE } from '../src/utils/testStorici.js'

/** Risposte di prova: ad ogni passo una risposta diversa, ciclando sulle regole dell'epoca. */
function risposte(epoca) {
  return Object.fromEntries(
    PASSI.map((p, i) => {
      const regole = REGOLE_STORICHE[epoca](p.numero)
      return [p.campoDb, regole[(i * 7) % regole.length].risposta]
    }),
  )
}

/** Test come era salvato fino al 15/09/2026: verde e grigio sotto i nomi di campo di allora. */
function salvatoV1() {
  const record = risposte('2025_v1')
  const c = calcolaCeste(record, { regolePerPasso: REGOLE_STORICHE['2025_v1'] })
  const n = c.campiNature
  return {
    ...record,
    ...c.campiPortato,
    BLU_1_Depressiva: n.BLU_1_Depressiva, BLU_2_Lunare: n.BLU_2_Lunare, BLU_3_Nostalgia: n.BLU_3_Nostalgia,
    BLU_4_Solare: n.BLU_4_Solare, ROSSO_1_Assertivita: n.ROSSO_1_Assertivita,
    ROSSO_2_Dubbio_Collera: n.ROSSO_2_Dubbio_Collera, GIALLO_1_Gioia_Entusiasmo: n.GIALLO_1_Gioia_Entusiasmo,
    GIALLO_2_Volitivo_Passionale: n.GIALLO_2_Volitivo_Passionale,
    VERDE_1_Calma: c.famiglie.verde,
    GRIGIO_1_Distaccato_Nichilista: c.famiglie.grigio,
    GRIGIO_2_Intellettuale_Saggio: 0,
  }
}

test('test di prima del 15/09: verde e grigio tornano visibili, con i totali consegnati', () => {
  const salvato = salvatoV1()
  assert.ok(salvato.VERDE_1_Calma > 0 && salvato.GRIGIO_1_Distaccato_Nichilista > 0, 'il profilo di prova deve avere verde e grigio')
  const letto = normalizzaRecordTst(salvato)
  assert.equal(letto.versione_modello, VERSIONE_MODELLO_LEGACY)
  assert.deepEqual(letto._letturaStorica, { epoca: '2025_v1', verificato: true })
  assert.equal(letto.VERDE_1_CalmaContemplativa + letto.VERDE_2_CalmaFisica, salvato.VERDE_1_Calma)
  assert.equal(letto.GRIGIO_1_Anaffettiva + letto.GRIGIO_2_Distaccata, salvato.GRIGIO_1_Distaccato_Nichilista)
  const famiglie = computeColorTotals(letto)
  assert.equal(famiglie.verde, salvato.VERDE_1_Calma)
  assert.equal(famiglie.grigio, salvato.GRIGIO_1_Distaccato_Nichilista)
  assert.equal(famiglie.blu, salvato.BLU_1_Depressiva + salvato.BLU_2_Lunare + salvato.BLU_3_Nostalgia + salvato.BLU_4_Solare)
})

test('le sezioni e il percorso di un test storico sommano gli stessi punti delle famiglie', () => {
  const letto = normalizzaRecordTst(salvatoV1())
  const famiglie = computeColorTotals(letto)
  const { sezioniTotals } = computeSezioniTotalsFromRaw(letto)
  for (const colore of Object.keys(famiglie)) {
    const somma = Object.values(sezioniTotals).reduce((s, sez) => s + sez[colore], 0)
    assert.equal(somma, famiglie[colore], colore)
  }
  const percorso = percorsoRisposte(letto)
  assert.equal(percorso.filter(Boolean).length, 72)
  assert.equal(percorso.reduce((s, p) => s + p.punti, 0), Object.values(famiglie).reduce((a, b) => a + b, 0))
})

test('test dal 15/09 al 10/10: si legge con le regole di allora', () => {
  const record = risposte('2025_v2')
  const c = calcolaCeste(record, { regolePerPasso: REGOLE_STORICHE['2025_v2'] })
  const letto = normalizzaRecordTst({ ...record, ...c.campiNature, ...c.campiPortato })
  assert.deepEqual(letto._letturaStorica, { epoca: '2025_v2', verificato: true })
  assert.deepEqual(computeColorTotals(letto), c.famiglie)
})

test('se il ricalcolo non coincide con i punti salvati, si mostrano i totali salvati', () => {
  const salvato = { ...salvatoV1(), VERDE_1_Calma: 999 }
  const letto = normalizzaRecordTst(salvato)
  assert.equal(letto._letturaStorica.verificato, false)
  assert.equal(computeColorTotals(letto).verde, 999)
  assert.equal(letto.VERDE_1_CalmaContemplativa, undefined, 'nessuna natura viene inventata')
})

test('i test del modello attuale non passano dalla lettura storica', () => {
  const letto = normalizzaRecordTst({ ...risposte('2025_v2'), versione_modello: VERSIONE_MODELLO })
  assert.equal(letto._letturaStorica, undefined)
})

test('rileggere un test già letto non cambia niente (archivio → report)', () => {
  const salvato = salvatoV1()
  delete salvato.VERDE_1_Calma
  delete salvato.GRIGIO_1_Distaccato_Nichilista
  delete salvato.GRIGIO_2_Intellettuale_Saggio
  const unaVolta = normalizzaRecordTst(salvato)
  assert.equal(unaVolta._letturaStorica.verificato, true)
  assert.deepEqual(normalizzaRecordTst(unaVolta), unaVolta)
})

test('test 2026_v3: dopo il cambio di modello si legge ancora con le sue regole', async () => {
  const { REGOLE_STORICHE_2026 } = await import('../src/utils/testStorici.js')
  const regole = REGOLE_STORICHE_2026['2026_v3']
  const record = Object.fromEntries(regole.passi.map((p, i) => [p.campoDb, regole(p.numero)[(i * 5) % regole(p.numero).length].risposta]))
  const c = calcolaCeste(record, { regolePerPasso: regole })
  const letto = normalizzaRecordTst({ ...record, ...c.campiNature, ...c.campiPortato, versione_modello: '2026_v3' })
  assert.deepEqual(letto._letturaStorica, { epoca: '2026_v3', verificato: true })
  assert.deepEqual(computeColorTotals(letto), c.famiglie)
})

test('test 2026_v2: si mostrano i punti consegnati, non un ricalcolo con regole più recenti', async () => {
  const { REGOLE_STORICHE_2026 } = await import('../src/utils/testStorici.js')
  const regole = REGOLE_STORICHE_2026['2026_v2']
  const record = Object.fromEntries(regole.passi.map((p, i) => [p.campoDb, regole(p.numero)[(i * 3) % regole(p.numero).length].risposta]))
  const c = calcolaCeste(record, { regolePerPasso: regole })
  const letto = normalizzaRecordTst({ ...record, ...c.campiNature, ...c.campiPortato, versione_modello: '2026_v2' })
  assert.equal(letto._letturaStorica.verificato, true)
  assert.deepEqual(computeColorTotals(letto), c.famiglie)
})
