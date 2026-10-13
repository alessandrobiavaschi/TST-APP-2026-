/**
 * Motore a ceste del TST.
 *
 * Ogni risposta mette dei punti in UNA cesta = natura × portato.
 * Le regole vengono tutte da src/config/tstSistema.js: questo file non contiene
 * nomi, chiavi o assegnazioni scritte a mano.
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
export function trovaRegola(numeroPasso, rispostaGrezza, regolePerPasso = getRegolePerPasso) {
  const passo = getPasso(numeroPasso)
  if (!passo || !rispostaGrezza) return null
  const regole = regolePerPasso(numeroPasso)
  return regole.find((regola) => regola.risposta === rispostaGrezza) || null
}

/**
 * Cesta riempita da una risposta.
 * @returns {{ natura: object, portato: object, punti: number, passo: object } | null}
 */
export function cestaPerRisposta({ fileNumber, risposta, isConfirmation = false, regolePerPasso }) {
  const passo = getPasso(fileNumber)
  const regola = trovaRegola(fileNumber, risposta, regolePerPasso)
  if (!passo || !regola) return null
  const natura = NATURA_BY_ID[regola.natura]
  const portato = PORTATO_BY_ID[regola.portato]
  if (!natura || !portato) return null
  const moltiplicatore = TIPI_A_DIZIONARIO.includes(passo.tipoDomanda) ? passo.peso : 1
  let punti = regola.punti * moltiplicatore
  if (passo.riconferma && isConfirmation) punti += BONUS_RICONFERMA
  return { natura, portato, punti, passo }
}

/**
 * Ricalcola un test dalle sue risposte grezze (File_01 … File_72).
 * Restituisce la tabella delle ceste e tutti i totali che ne derivano.
 * `regolePerPasso` serve solo a rileggere i test delle versioni precedenti
 * con le regole della loro epoca (vedi testStorici.js); di default le attuali.
 */
export function calcolaCeste(record = {}, { regolePerPasso } = {}) {
  const ceste = Object.fromEntries(NATURE.map((n) => [n.id, cestaVuota()]))
  const perSezione = Object.fromEntries(SEZIONI.map((s) => [s.id, coloriVuoti()]))
  let risposteValide = 0

  for (const passo of PASSI) {
    const risposta = String(record?.[passo.campoDb] || '').trim()
    if (!risposta) continue
    const cesta = cestaPerRisposta({ fileNumber: passo.numero, risposta, isConfirmation: passo.riconferma, regolePerPasso })
    if (!cesta) continue
    risposteValide += 1
    ceste[cesta.natura.id][cesta.portato.id] += cesta.punti
    perSezione[passo.sezione][cesta.natura.colorKey] += cesta.punti
  }

  const campiNature = {}
  for (const n of NATURE) {
    campiNature[n.campoDb] = PORTATI.reduce((sum, p) => sum + ceste[n.id][p.id], 0)
  }
  const campiPortato = {}
  for (const p of PORTATI) {
    campiPortato[p.campoDb] = NATURE.reduce((sum, n) => sum + ceste[n.id][p.id], 0)
  }
  const famiglie = coloriVuoti()
  for (const n of NATURE) famiglie[n.colorKey] += campiNature[n.campoDb]

  const rapporti = Object.fromEntries(
    Object.entries(RAPPORTI).map(([id, sezioni]) => {
      const tot = coloriVuoti()
      sezioni.forEach((s) => Object.keys(tot).forEach((k) => { tot[k] += perSezione[s][k] }))
      return [id, tot]
    }),
  )

  return { risposteValide, ceste, campiNature, campiPortato, famiglie, perSezione, rapporti }
}

/* ── Massimi teorici ───────────────────────────────────────────────────── */
/*
 * Per ogni passo si prende il massimo che quella cesta (o natura, o famiglia)
 * può ricevere scegliendo la risposta più favorevole, poi si somma sui passi.
 */

function massimiPerPasso(passo) {
  const regole = getRegolePerPasso(passo.numero)
  const perCesta = {}
  const perNatura = {}
  const perColore = {}
  for (const regola of regole) {
    const c = cestaPerRisposta({ fileNumber: passo.numero, risposta: regola.risposta, isConfirmation: passo.riconferma })
    if (!c) continue
    const kCesta = `${c.natura.id}|${c.portato.id}`
    perCesta[kCesta] = Math.max(perCesta[kCesta] || 0, c.punti)
    perNatura[c.natura.id] = Math.max(perNatura[c.natura.id] || 0, c.punti)
    perColore[c.natura.colorKey] = Math.max(perColore[c.natura.colorKey] || 0, c.punti)
  }
  return { perCesta, perNatura, perColore }
}

export const MASSIMI_TEORICI = (() => {
  const ceste = Object.fromEntries(NATURE.map((n) => [n.id, cestaVuota()]))
  const nature = Object.fromEntries(NATURE.map((n) => [n.id, 0]))
  const perSezione = Object.fromEntries(SEZIONI.map((s) => [s.id, coloriVuoti()]))
  for (const passo of PASSI) {
    const m = massimiPerPasso(passo)
    for (const [k, v] of Object.entries(m.perCesta)) {
      const [nId, pId] = k.split('|')
      ceste[nId][pId] += v
    }
    for (const [nId, v] of Object.entries(m.perNatura)) nature[nId] += v
    for (const [ck, v] of Object.entries(m.perColore)) perSezione[passo.sezione][ck] += v
  }
  const famiglie = coloriVuoti()
  for (const n of NATURE) famiglie[n.colorKey] += nature[n.id]
  const rapporti = Object.fromEntries(
    Object.entries(RAPPORTI).map(([id, sezioni]) => {
      const tot = coloriVuoti()
      sezioni.forEach((s) => Object.keys(tot).forEach((k) => { tot[k] += perSezione[s][k] }))
      return [id, tot]
    }),
  )
  const naturePerCampo = Object.fromEntries(NATURE.map((n) => [n.campoDb, nature[n.id]]))
  return { ceste, nature, naturePerCampo, famiglie, perSezione, rapporti }
})()

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
export function percentualeNatura(campoDb, valore) {
  const m = Number(MASSIMI_TEORICI.naturePerCampo[campoDb]) || 0
  if (m <= 0) return 0
  return Math.round(Math.min(1, Math.max(0, (Number(valore) || 0) / m)) * 1000) / 10
}
