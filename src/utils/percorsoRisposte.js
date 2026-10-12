/**
 * Percorso delle risposte: i 72 passi in ordine, ciascuno con la famiglia e il
 * portato della cesta che la risposta ha riempito.
 *
 * Legge solo le risposte grezze (File_01 … File_72) e le regole di tstSistema.js
 * tramite cestaPerRisposta: nessuna assegnazione scritta a mano qui.
 * Un passo senza risposta, o con una risposta che il modello corrente non
 * riconosce (es. test 2025_v1), vale null.
 */
import { FAMIGLIA_BY_COLOR, PASSI, SEZIONI } from '../config/tstSistema.js'
import { cestaPerRisposta } from './cesteTst.js'

const SEZIONE_BY_ID = Object.fromEntries(SEZIONI.map((s) => [s.id, s]))

/**
 * @param {Record<string, unknown>} record - documento di test_results
 * @returns {Array<null | {
 *   numero: number, sezione: string, famiglia: string, nomeFamiglia: string,
 *   natura: string, portato: string, nomePortato: string, punti: number
 * }>} sempre 72 voci
 */
export function percorsoRisposte(record = {}) {
  return PASSI.map((passo) => {
    const risposta = String(record?.[passo.campoDb] || '').trim()
    if (!risposta) return null
    const cesta = cestaPerRisposta({ fileNumber: passo.numero, risposta, isConfirmation: passo.riconferma })
    if (!cesta) return null
    return {
      numero: passo.numero,
      sezione: SEZIONE_BY_ID[passo.sezione]?.nome || '',
      famiglia: cesta.natura.colorKey,
      nomeFamiglia: FAMIGLIA_BY_COLOR[cesta.natura.colorKey]?.nome || '',
      natura: cesta.natura.nome,
      portato: cesta.portato.id,
      nomePortato: cesta.portato.nome,
      punti: cesta.punti,
    }
  })
}

/** Quanti passi del percorso hanno una risposta leggibile. */
export function passiLeggibili(percorso = []) {
  return percorso.reduce((n, p) => n + (p ? 1 : 0), 0)
}
