/**
 * Parole del lessico TST: da dove viene una parola e dove leggerne la definizione.
 *
 * Le definizioni non sono copiate nell'app (il vocabolario Treccani è protetto da
 * diritto d'autore): si apre la ricerca Treccani della parola, che porta alla voce.
 */
import { FAMIGLIE_TST } from '../../../content/paroleTst.js'

export function linkDefinizione(parola) {
  return `https://www.treccani.it/vocabolario/ricerca/${encodeURIComponent(String(parola).toLowerCase())}/`
}

export const nomeNatura = (natura) => String(natura?.nome || '').replace(/^Natura\s+/i, '')

/** Tutte le famiglie e nature in cui compare una parola (aggettivi, sostantivi, parole chiave). */
export function doveCompare(parola) {
  const p = String(parola || '').trim().toLowerCase()
  const risultati = []
  for (const famiglia of FAMIGLIE_TST) {
    for (const natura of famiglia.nature) {
      const chiavi = (natura.paroleChiave || []).map((k) => (typeof k === 'string' ? k : k.parola))
      const tutte = [...(natura.aggettivi || []), ...(natura.sostantivi || []), ...chiavi]
      if (tutte.some((w) => String(w).toLowerCase() === p)) {
        risultati.push({ famiglia: famiglia.nome, colorKey: famiglia.colorKey, natura: nomeNatura(natura) })
      }
    }
  }
  return risultati
}
