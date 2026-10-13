/**
 * Matrice delle relazioni interne al profilo TST.
 * Fonte: PDF «Parole per TST» (Franco Mussida), sezioni «Parole collegate alle
 * altre famiglie». Sostituisce il vecchio documento del comitato scientifico.
 *
 * DIALOGO_MATRIX[base][partner] = keyword[] che descrivono come la dimensione `base`
 * si qualifica quando incontra la dimensione `partner` all'interno dello stesso profilo.
 *
 * Queste relazioni descrivono la coesistenza di correnti nella stessa persona —
 * NON compatibilità interpersonale, NON dinamiche tra persone diverse.
 */

import { FAMILY_THEME, FAMILY_NAME_BY_KEY } from '../config/reportFamilyTheme.js'
import { FAMIGLIE_TST } from './paroleTst.js'

// Parole SOLO dal PDF «Parole per TST»: per ogni famiglia di base, le «parole
// collegate alle altre famiglie» di tutte le sue nature (senza ripetizioni).
// Quando il PDF non ha parole per una coppia, la lista resta vuota.
const ASSOCIAZIONE_PER_FAMIGLIA = {
  blu: 'malinconica',
  verde: 'flemmatica',
  giallo: 'entusiasta',
  grigio: 'razionale',
  rosso: 'marziale',
}

const DIALOGO_MATRIX = Object.fromEntries(
  FAMIGLIE_TST.map((famiglia) => [
    famiglia.colorKey,
    Object.fromEntries(
      Object.entries(ASSOCIAZIONE_PER_FAMIGLIA)
        .filter(([partner]) => partner !== famiglia.colorKey)
        .map(([partner, chiave]) => [
          partner,
          [...new Set(famiglia.nature.flatMap((n) => n.associazioni?.[chiave] || []))],
        ]),
    ),
  ]),
)

const SECONDARY_THRESHOLD = 10
const MAX_COPPIE = 3

/**
 * Restituisce le coppie di correnti attive nel profilo, ordinate per rilevanza.
 * @param {object} totals - { blu, rosso, verde, giallo, grigio } (valori grezzi)
 * @returns {Array}
 */
export function getDialogoCoppie(totals = {}) {
  const total = Object.values(totals).reduce((s, v) => s + (Number(v) || 0), 0)
  if (total <= 0) return []

  const pcts = {}
  for (const [key, val] of Object.entries(totals)) {
    pcts[key] = ((Number(val) || 0) / total) * 100
  }

  const sorted = Object.entries(pcts).sort((a, b) => b[1] - a[1])
  if (sorted.length === 0) return []

  const dominantKey = sorted[0][0]
  const dominantPct = sorted[0][1]

  const active = sorted
    .slice(1)
    .filter(([, pct]) => pct >= SECONDARY_THRESHOLD)
    .slice(0, MAX_COPPIE)

  return active.map(([partnerKey, partnerPct]) => ({
    baseFamiglia: dominantKey,
    partnerFamiglia: partnerKey,
    baseWeight: Math.round(dominantPct),
    partnerWeight: Math.round(partnerPct),
    keywords_base_su_partner: DIALOGO_MATRIX[dominantKey]?.[partnerKey] || [],
    keywords_partner_su_base: DIALOGO_MATRIX[partnerKey]?.[dominantKey] || [],
  }))
}

export function getFamigliaLabel(familyKey) {
  const name = FAMILY_NAME_BY_KEY[String(familyKey).toLowerCase()] || ''
  return FAMILY_THEME[name]?.macro || name
}

export function getFamigliaDot(familyKey) {
  const name = FAMILY_NAME_BY_KEY[String(familyKey).toLowerCase()] || ''
  return FAMILY_THEME[name]?.dot || '#9ca3af'
}

export function getDialogoKeywords(baseFamilyKey, partnerFamilyKey) {
  const base = String(baseFamilyKey || '').toLowerCase()
  const partner = String(partnerFamilyKey || '').toLowerCase()
  return DIALOGO_MATRIX[base]?.[partner] || []
}
