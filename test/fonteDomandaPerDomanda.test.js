/**
 * Controllo indipendente: il motore a ceste contro il documento «TST domanda per
 * domanda» (23/10/2026) con le correzioni della colonna «Se no, cosa cambiare».
 * La tabella qui sotto è ricopiata dal documento (nomi visibili, non id del codice):
 * se il motore e il documento divergono, questo test lo dice.
 */
import test from 'node:test'
import assert from 'node:assert/strict'

import { NATURE, PASSI, PORTATI, VERSIONE_MODELLO, getRegolePerPasso } from '../src/config/tstSistema.js'
import { calcolaCeste } from '../src/utils/cesteTst.js'

const SENSAZIONI = [
  ['Mi dà gioia', 'Gioiosa Solare', 'Simpatia'], ['Mi inquieta', 'Sanguigna Operosa', 'Antipatia'],
  ['Mi spegne', 'Anaffettiva', 'Indifferenza'], ['Mi stupisce', 'Gioiosa Solare', 'Simpatia'],
  ['Mi rilassa', 'Calma Fisica', 'Simpatia'], ['Mi disturba / mi repelle', 'Calma Fisica', 'Antipatia'],
  ['Mi è indifferente', 'Distaccata', 'Indifferenza'], ['Mi calma / mi fa sognare', 'Calma Contemplativa', 'Simpatia'],
  ['Mi accende / mi motiva', 'Volitiva', 'Simpatia'], ['Mi irrita / mi infastidisce', 'Collerica', 'Antipatia'],
  ['Mi annoia / mi stufa', 'Distaccata', 'Indifferenza'], ['Mi completa / mi incoraggia', 'Volitiva', 'Simpatia'],
  ['Mi fa riflettere / mi porta a ricordare', 'Nostalgica', 'Simpatia'],
  ['Mi arrovella / mi rattrista', 'Lunare Introspettiva', 'Antipatia'], ['Mi accompagna / mi consola', 'Solare', 'Simpatia'],
]
// Passo 29 con le correzioni («COME 29» per i passi 30–41).
const AGGETTIVI = [
  ['Saldo - sicuro - volitivo', 'Volitiva', 'Simpatia'],
  ['Inquieto - chiuso - pauroso', 'Calma Fisica', 'Antipatia'],
  ['Angosciato - ansioso - indifferente', 'Lunare Depressiva', 'Indifferenza'],
  ['Sereno - fiducioso - aperto', 'Gioiosa Solare', 'Simpatia'],
  ['Malinconico - triste - riflessivo', 'Lunare Introspettiva', 'Simpatia'],
  ['Arrabbiato - distaccato - dubbioso', 'Collerica', 'Antipatia'],
  ['Ambiguo - incerto - equivoco', 'Collerica', 'Indifferenza'],
  ['Calmo - equilibrato - sognante', 'Calma Fisica', 'Simpatia'],
  ['Gioioso - caloroso - entusiasta', 'Gioiosa Solare', 'Simpatia'],
  ['Dinamico - curioso - fluido', 'Calma Fisica', 'Antipatia'],
  ['Nostalgico - consolato - afflitto', 'Nostalgica', 'Simpatia'],
  ['Desolato - rimpiangente - abbandonato', 'Nostalgica', 'Antipatia'],
  ['Illuminato - amorevole - passionale', null, null], // dato di conferma: nessun temperamento, nessun portato
  ['Mi è indifferente', null, 'Indifferenza'], // nessun temperamento, solo portato
]
// Preferenze: «Solo TEMPERAMENTO, no PORTATO». Ordine dei suoni come nel documento.
const PREFERENZE = {
  1: ['Gioiosa Solare', 'Calma Fisica', 'Volitiva', 'Solare'],
  2: ['Gioiosa Solare', 'Volitiva', 'Calma Fisica', 'Solare'],
  3: ['Gioiosa Solare', 'Volitiva', 'Calma Fisica', 'Solare'],
  4: ['Gioiosa Solare', 'Calma Fisica', 'Volitiva', 'Solare'],
  46: ['Nostalgica', 'Calma Fisica', 'Volitiva', 'Gioiosa Solare'],
  51: ['Nostalgica', 'Volitiva', 'Calma Fisica', 'Gioiosa Solare'],
  58: ['Gioiosa Solare', 'Nostalgica', 'Volitiva', 'Calma Fisica'],
}
// Punti per risposta: 2 ai passi 41 (riascolto + conferma), 42–46 («vale doppio»); 1 altrove.
const puntiPasso = (n) => (n === 41 || (n >= 42 && n <= 46) ? 2 : 1)

/** Righe del documento per un passo: [risposta nel record, natura, portato]. */
function righeDocumento(n) {
  if (PREFERENZE[n]) return [...PREFERENZE[n].map((nat, i) => [`opzione${i + 1}`, nat, null]), ['nessuna', 'Anaffettiva', null]]
  if (n >= 29 && n <= 41) return AGGETTIVI
  return SENSAZIONI
}

const campoNatura = (nome) => NATURE.find((x) => x.nome === nome).campoDb
const campoPortato = (nome) => PORTATI.find((x) => x.nome === nome).campoDb

test('il modello corrente è quello del documento del 23/10/2026', () => {
  assert.equal(VERSIONE_MODELLO, '2026_v4')
})

test('ogni passo offre esattamente le risposte del documento', () => {
  for (const p of PASSI) {
    const attese = righeDocumento(p.numero).map(([r]) => r).sort()
    const motore = getRegolePerPasso(p.numero).map((r) => r.risposta).sort()
    assert.deepEqual(motore, attese, `passo ${p.numero}`)
  }
})

test('1000 test casuali: il motore assegna i punti come il documento', () => {
  let seme = 2026
  const caso = (n) => { seme = (seme * 1103515245 + 12345) % 2 ** 31; return seme % n }
  for (let k = 0; k < 1000; k += 1) {
    const record = {}
    const nature = Object.fromEntries(NATURE.map((n) => [n.campoDb, 0]))
    const portati = Object.fromEntries(PORTATI.map((p) => [p.campoDb, 0]))
    for (const p of PASSI) {
      if (caso(12) === 0) continue // risposta mancante
      const righe = righeDocumento(p.numero)
      const [risposta, natura, portato] = righe[caso(righe.length)]
      record[p.campoDb] = risposta
      const punti = risposta.startsWith('Illuminato') ? 0 : puntiPasso(p.numero)
      if (natura) nature[campoNatura(natura)] += punti
      if (portato) portati[campoPortato(portato)] += punti
    }
    const r = calcolaCeste(record)
    assert.deepEqual(r.campiNature, nature)
    assert.deepEqual(r.campiPortato, portati)
  }
})
