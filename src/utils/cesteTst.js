/**
 * Motore a ceste del TST.
 *
 * Ogni risposta mette dei punti in UNA cesta = natura × portato.
 * Alcune risposte hanno solo una delle due coordinate (vedi tstSistema.js):
 * - solo natura (affinità, «no portato»): i punti contano per la natura e la
 *   famiglia, non per il portato;
 * - solo portato («Mi è indifferente» negli intervalli): i punti contano per il
 *   portato, non per nature e famiglie.
 * La tabella `ceste` resta 12 nature × 3 portati e contiene solo i punti con
 * entrambe le coordinate; `soloNatura` e `soloPortato` contengono il resto.
 * I totali (campiNature, campiPortato, famiglie, sezioni) sommano tutto.
 *
 * Le regole vengono tutte da src/config/tstSistema.js (o, per i test di versioni
 * precedenti, da src/utils/testStorici.js tramite l'opzione `regolePerPasso`, che
 * porta con sé la disposizione dei passi della sua epoca in `regolePerPasso.passi`): questo file non contiene nomi, chiavi o assegnazioni scritte a mano.
 */
import {
  FAMIGLIE,
  NATURE,
  NATURA_BY_ID,
  PASSI,
  PORTATI,
  PORTATO_BY_ID,
  RAPPORTI,
  SEZIONI,
  TIPI_A_DIZIONARIO,
  getPasso,
  getRegolePerPasso,
} from '../config/tstSistema.js'

/** Bonus della riconferma: +1 alla stessa cesta. */
export const BONUS_RICONFERMA = 1

function cestaVuota() {
  return Object.fromEntries(PORTATI.map((p) => [p.id, 0]))
}

function coloriVuoti() {
  return Object.fromEntries(FAMIGLIE.map((f) => [f.colorKey, 0]))
}

/** Trova la regola che corrisponde alla risposta grezza salvata per un passo. */
export function trovaRegola(numeroPasso, rispostaGrezza, regolePerPasso = getRegolePerPasso, passi = regolePerPasso?.passi || PASSI) {
  const passo = getPasso(numeroPasso, passi)
  if (!passo || !rispostaGrezza) return null
  const regole = regolePerPasso(numeroPasso)
  return regole.find((regola) => regola.risposta === rispostaGrezza) || null
}

/**
 * Cesta riempita da una risposta.
 * `natura` o `portato` possono essere null (vedi intestazione); se lo sono
 * entrambi la risposta è valida ma non porta punti da nessuna parte.
 * @returns {{ natura: object|null, portato: object|null, punti: number, passo: object } | null}
 */
export function cestaPerRisposta({ fileNumber, risposta, isConfirmation = false, regolePerPasso, passi = regolePerPasso?.passi || PASSI }) {
  const passo = getPasso(fileNumber, passi)
  const regola = trovaRegola(fileNumber, risposta, regolePerPasso || getRegolePerPasso, passi)
  if (!passo || !regola) return null
  const natura = regola.natura ? NATURA_BY_ID[regola.natura] : null
  const portato = regola.portato ? PORTATO_BY_ID[regola.portato] : null
  if ((regola.natura && !natura) || (regola.portato && !portato)) return null
  const moltiplicatore = TIPI_A_DIZIONARIO.includes(passo.tipoDomanda) ? passo.peso : 1
  let punti = regola.punti * moltiplicatore
  if (passo.riconferma && isConfirmation) punti += BONUS_RICONFERMA
  return { natura, portato, punti: natura || portato ? punti : 0, passo }
}

function sommaPerColore(perSezione, sezioni) {
  const tot = coloriVuoti()
  sezioni.forEach((s) => Object.keys(tot).forEach((k) => { tot[k] += perSezione[s][k] }))
  return tot
}

/**
 * Ricalcola un test dalle sue risposte grezze (File_01 … File_72).
 * Restituisce la tabella delle ceste e tutti i totali che ne derivano.
 * `regolePerPasso` e `passi` servono solo a rileggere i test delle versioni
 * precedenti con le regole della loro epoca (vedi testStorici.js); di default le attuali.
 */
export function calcolaCeste(record = {}, { regolePerPasso, passi = regolePerPasso?.passi || PASSI } = {}) {
  const ceste = Object.fromEntries(NATURE.map((n) => [n.id, cestaVuota()]))
  const soloNatura = Object.fromEntries(NATURE.map((n) => [n.id, 0]))
  const soloPortato = cestaVuota()
  const perSezione = Object.fromEntries(SEZIONI.map((s) => [s.id, coloriVuoti()]))
  let risposteValide = 0

  for (const passo of passi) {
    const risposta = String(record?.[passo.campoDb] || '').trim()
    if (!risposta) continue
    const cesta = cestaPerRisposta({ fileNumber: passo.numero, risposta, isConfirmation: passo.riconferma, regolePerPasso, passi })
    if (!cesta) continue
    risposteValide += 1
    if (cesta.natura && cesta.portato) ceste[cesta.natura.id][cesta.portato.id] += cesta.punti
    else if (cesta.natura) soloNatura[cesta.natura.id] += cesta.punti
    else if (cesta.portato) soloPortato[cesta.portato.id] += cesta.punti
    if (cesta.natura) perSezione[passo.sezione][cesta.natura.colorKey] += cesta.punti
  }

  const campiNature = {}
  for (const n of NATURE) {
    campiNature[n.campoDb] = PORTATI.reduce((sum, p) => sum + ceste[n.id][p.id], 0) + soloNatura[n.id]
  }
  const campiPortato = {}
  for (const p of PORTATI) {
    campiPortato[p.campoDb] = NATURE.reduce((sum, n) => sum + ceste[n.id][p.id], 0) + soloPortato[p.id]
  }
  const famiglie = coloriVuoti()
  for (const n of NATURE) famiglie[n.colorKey] += campiNature[n.campoDb]

  const rapporti = Object.fromEntries(Object.entries(RAPPORTI).map(([id, sezioni]) => [id, sommaPerColore(perSezione, sezioni)]))

  return { risposteValide, ceste, soloNatura, soloPortato, campiNature, campiPortato, famiglie, perSezione, rapporti }
}

/* ── Massimi teorici ───────────────────────────────────────────────────── */
/*
 * Per ogni passo si prende il massimo che quella cesta (o natura, o famiglia)
 * può ricevere scegliendo la risposta più favorevole, poi si somma sui passi.
 */

function massimiPerPasso(passo, opzioni) {
  const regole = (opzioni.regolePerPasso || getRegolePerPasso)(passo.numero)
  const perCesta = {}
  const perNatura = {}
  const perColore = {}
  const perPortato = {}
  for (const regola of regole) {
    const c = cestaPerRisposta({ fileNumber: passo.numero, risposta: regola.risposta, isConfirmation: passo.riconferma, ...opzioni })
    if (!c) continue
    if (c.natura && c.portato) {
      const kCesta = `${c.natura.id}|${c.portato.id}`
      perCesta[kCesta] = Math.max(perCesta[kCesta] || 0, c.punti)
    }
    if (c.natura) {
      perNatura[c.natura.id] = Math.max(perNatura[c.natura.id] || 0, c.punti)
      perColore[c.natura.colorKey] = Math.max(perColore[c.natura.colorKey] || 0, c.punti)
    }
    if (c.portato) perPortato[c.portato.id] = Math.max(perPortato[c.portato.id] || 0, c.punti)
  }
  return { perCesta, perNatura, perColore, perPortato }
}

/**
 * Massimi teorici di un modello: per ogni passo il massimo che una cesta (o
 * natura, famiglia, portato) può ricevere con la risposta più favorevole,
 * sommato sui passi. Senza opzioni: modello corrente.
 */
export function calcolaMassimiTeorici({ regolePerPasso, passi = regolePerPasso?.passi || PASSI } = {}) {
  const opzioni = { regolePerPasso, passi }
  const ceste = Object.fromEntries(NATURE.map((n) => [n.id, cestaVuota()]))
  const nature = Object.fromEntries(NATURE.map((n) => [n.id, 0]))
  const portati = cestaVuota()
  const perSezione = Object.fromEntries(SEZIONI.map((s) => [s.id, coloriVuoti()]))
  for (const passo of passi) {
    const m = massimiPerPasso(passo, opzioni)
    for (const [k, v] of Object.entries(m.perCesta)) {
      const [nId, pId] = k.split('|')
      ceste[nId][pId] += v
    }
    for (const [nId, v] of Object.entries(m.perNatura)) nature[nId] += v
    for (const [pId, v] of Object.entries(m.perPortato)) portati[pId] += v
    for (const [ck, v] of Object.entries(m.perColore)) perSezione[passo.sezione][ck] += v
  }
  // Massimo di una famiglia = punti che la famiglia può davvero ricevere in un
  // test (a ogni passo la risposta migliore per quella famiglia).
  const famiglie = sommaPerColore(perSezione, SEZIONI.map((s) => s.id))
  // Definizione usata fino al modello 2026_v3: somma dei massimi delle nature
  // (irraggiungibile: le nature di una famiglia competono negli stessi passi).
  // Serve solo a mostrare i test storici esattamente come erano mostrati.
  const famiglieSommaNature = coloriVuoti()
  for (const n of NATURE) famiglieSommaNature[n.colorKey] += nature[n.id]
  const rapporti = Object.fromEntries(Object.entries(RAPPORTI).map(([id, sezioni]) => [id, sommaPerColore(perSezione, sezioni)]))
  const naturePerCampo = Object.fromEntries(NATURE.map((n) => [n.campoDb, nature[n.id]]))
  return { ceste, nature, naturePerCampo, portati, famiglie, famiglieSommaNature, perSezione, rapporti }
}

export const MASSIMI_TEORICI = calcolaMassimiTeorici()

/**
 * Porta dei totali per colore sulla scala 0–100 del loro massimo teorico.
 * @param {Record<string, number>} totali - es. { blu, rosso, verde, giallo, grigio }
 * @param {Record<string, number>} [massimi] - default: massimi per famiglia
 */
export function normalizzaSuMassimo(totali = {}, massimi = MASSIMI_TEORICI.famiglie) {
  const out = {}
  for (const f of FAMIGLIE) {
    const v = Number(totali?.[f.colorKey]) || 0
    const m = Number(massimi?.[f.colorKey]) || 0
    out[f.colorKey] = m > 0 ? Math.round(Math.min(1, Math.max(0, v / m)) * 1000) / 10 : 0
  }
  return out
}

/** Percentuale 0–100 di una natura sul suo massimo teorico. */
export function percentualeNatura(campoDb, valore, massimi = MASSIMI_TEORICI) {
  const m = Number(massimi.naturePerCampo[campoDb]) || 0
  if (m <= 0) return 0
  return Math.round(Math.min(1, Math.max(0, (Number(valore) || 0) / m)) * 1000) / 10
}
