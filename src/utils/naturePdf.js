/**
 * Nomi delle nature SOLO dal PDF «Parole per TST» (via config/tstSistema.js).
 *
 * Nel PDF ogni famiglia ha più nature: non esiste una «natura» unica di famiglia
 * (niente «Lunare», «Volitivo-collerica», «Gioioso-sanguinico», «Contemplativa»,
 * «Intellettuale-razionale»). Quando un testo parla della natura di una persona
 * si usa la sua natura prevalente dentro quella famiglia; se il dato manca si
 * elencano le nature della famiglia.
 */
import { NATURE } from '../config/tstSistema.js'

/** Ordine delle nature come nel PDF. */
const ORDINE_PDF = [
  'BLU_2_Lunare', 'BLU_1_Depressiva', 'BLU_4_Solare', 'BLU_3_Nostalgia',
  'ROSSO_1_Assertivita', 'ROSSO_2_Dubbio_Collera',
  'VERDE_1_CalmaContemplativa', 'VERDE_2_CalmaFisica',
  'GIALLO_1_Gioia_Entusiasmo', 'GIALLO_2_Volitivo_Passionale',
  'GRIGIO_1_Anaffettiva', 'GRIGIO_2_Distaccata',
]

const NATURA_BY_CAMPO = Object.fromEntries(NATURE.map((n) => [n.campoDb, n]))

/** Nomi PDF delle nature di una famiglia (colorKey: 'blu' | 'rosso' | …), in ordine PDF. */
export function naturePdfDiFamiglia(colorKey) {
  return ORDINE_PDF.map((campo) => NATURA_BY_CAMPO[campo]).filter((n) => n && n.colorKey === colorKey).map((n) => n.nome)
}

function elenco(items = [], congiunzione = 'o') {
  if (items.length <= 1) return items[0] || ''
  return `${items.slice(0, -1).join(', ')} ${congiunzione} ${items.at(-1)}`
}

/** Elenco leggibile delle nature PDF di una famiglia (es. «Volitiva o Collerica»). */
export function elencoNaturePdf(colorKey, congiunzione = 'o') {
  return elenco(naturePdfDiFamiglia(colorKey), congiunzione)
}

/** Nome PDF di una natura dal campo Firestore (es. 'BLU_2_Lunare' → 'Lunare Introspettiva'). */
export function nomeNaturaPdf(campoDb) {
  return NATURA_BY_CAMPO[campoDb]?.nome || ''
}

/**
 * Natura prevalente di ogni famiglia per un test (colorKey → campo della natura
 * con la percentuale più alta sul suo massimo teorico). `percentuale(campo, valore)`
 * è la stessa funzione usata dal report.
 */
export function naturePrevalentiDaRecord(rawRecord = {}, percentuale) {
  const out = {}
  for (const n of NATURE) {
    const valore = percentuale ? percentuale(n.campoDb, rawRecord[n.campoDb]) : Number(rawRecord[n.campoDb]) || 0
    if (!(valore > 0)) continue
    const best = out[n.colorKey]
    if (!best || valore > best.valore) out[n.colorKey] = { campo: n.campoDb, valore }
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, NATURA_BY_CAMPO[v.campo].nome]))
}

let attive = null

/** Esegue `fn` usando, per ogni famiglia, il nome della natura prevalente della persona. */
export function conNaturePrevalenti(mappa, fn) {
  const prima = attive
  attive = mappa || null
  try {
    return fn()
  } finally {
    attive = prima
  }
}

/** Nome della natura da usare nei testi per una famiglia. */
export function nomeNaturaPerFamiglia(colorKey) {
  return attive?.[colorKey] || elencoNaturePdf(colorKey)
}
