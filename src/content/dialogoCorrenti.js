/**
 * Matrice delle relazioni interne al profilo TST.
 * Fonte: documento comitato scientifico TST
 * "Come si Relazionano le dimensioni temperamentali tra di loro all'interno della persona"
 *
 * DIALOGO_MATRIX[base][partner] = keyword[] che descrivono come la dimensione `base`
 * si qualifica quando incontra la dimensione `partner` all'interno dello stesso profilo.
 *
 * Queste relazioni descrivono la coesistenza di correnti nella stessa persona —
 * NON compatibilità interpersonale, NON dinamiche tra persone diverse.
 */

import { FAMILY_THEME, FAMILY_NAME_BY_KEY } from '../config/reportFamilyTheme.js'

const DIALOGO_MATRIX = {
  grigio: {
    verde: ['calma', 'pazienza', 'stabilità', 'remissività'],
    giallo: ['energia', 'creatività', 'impulsività', 'efficienza'],
    rosso: ['decisa', 'diretta', 'pratica', 'indirizzata'],
    blu: ['profonda', 'sensibile', 'ideale', 'astratta'],
  },
  verde: {
    giallo: ['energia', 'creatività', 'impulsività', 'inventiva'],
    rosso: ['decisa', 'diretta', 'pratica', 'definita'],
    blu: ['profonda', 'sensibile', 'riflessiva', 'meditativa'],
    grigio: ['distante', 'razionale', 'chiusa', 'separata'],
  },
  blu: {
    verde: ['calma', 'pazienza', 'stabilità', 'fermezza'],
    giallo: ['energia', 'creativa', 'impulsività', 'dinamismo'],
    rosso: ['decisa', 'diretta', 'pratica', 'direzionata'],
    grigio: ['distante', 'razionale', 'chiusa', 'separata'],
  },
  giallo: {
    verde: ['calma', 'pazienza', 'stabilità', 'riflessività'],
    rosso: ['decisa', 'diretta', 'pratica', 'direzionata'],
    blu: ['profonda', 'sensibile', 'ideale'],
    grigio: ['distante', 'razionale', 'chiusa', 'separata'],
  },
  rosso: {
    verde: ['pazienza', 'stabilità', 'adattabilità', 'definita'],
    giallo: ['energia', 'creativa', 'impulsività'],
    blu: ['profonda', 'sensibile', 'riflessiva'],
    grigio: ['distante', 'razionale', 'chiusa', 'separata'],
  },
}

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
