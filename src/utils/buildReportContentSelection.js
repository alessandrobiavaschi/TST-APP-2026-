/**
 * Adapter esterno tra il piano di selezione contenuti (chiavi canoniche colore,
 * prodotto dal motore in reportCompositionSensitivity.js/buildReportData.js) e i
 * selettori editoriali protetti (getFamigliaApprofondimento, getRelationalCorpusForDominant).
 *
 * Non modifica getFamigliaApprofondimento/getRelationalCorpusForDominant né i file in
 * src/content/**: li chiama soltanto e restituisce i contenuti così come sono, ordinati
 * per ruolo (primary/companion/theoretical/marginal) e senza duplicati. Una chiave senza
 * scheda disponibile finisce in missingContentKeys — non viene mai sostituita con una
 * famiglia simile (niente fallback verso Verde o altre famiglie).
 */
import { getFamigliaApprofondimento } from '../content/famigliaApprofondimento.js'
import { getRelationalCorpusForDominant } from '../content/relational/index.js'

const COLOR_KEY_TO_FAMILY_NAME = {
  blu: 'Blu',
  rosso: 'Rosso',
  verde: 'Verde',
  giallo: 'Giallo',
  grigio: 'Grigio',
}

function familyNameForKey(familyKey) {
  return COLOR_KEY_TO_FAMILY_NAME[String(familyKey || '').toLowerCase()] || null
}

function resolveFamigliaCard(familyKey) {
  const familyName = familyNameForKey(familyKey)
  const content = familyName ? getFamigliaApprofondimento(familyName) : null
  if (!content) return { familyKey, familyName, available: false }
  return { familyKey, familyName, available: true, content }
}

function resolveRelazionaleCard(familyKey) {
  const familyName = familyNameForKey(familyKey)
  const corpus = getRelationalCorpusForDominant(familyKey, familyName || '')
  if (!corpus?.available) return { familyKey, familyName, available: false }
  return { familyKey, familyName, available: true, content: corpus }
}

const RESOLVERS = {
  famiglia: resolveFamigliaCard,
  relazionale: resolveRelazionaleCard,
}

/**
 * @param {object} plan - forma di contentPlan/localContentPlan: { primaryKeys, companionKeys,
 *   theoreticalRelationKeys, marginalKeys } con chiavi canoniche colore (rosso/blu/giallo/verde/grigio).
 * @param {{contentType?: 'famiglia'|'relazionale'}} options
 * @returns {{primary, companion, theoretical, marginal, missingContentKeys, status}}
 */
export function buildReportContentSelection(plan = {}, { contentType = 'famiglia' } = {}) {
  const resolve = RESOLVERS[contentType] || RESOLVERS.famiglia
  const primaryKeys = Array.isArray(plan.primaryKeys) ? plan.primaryKeys : []
  const companionKeys = Array.isArray(plan.companionKeys) ? plan.companionKeys : []
  const theoreticalRelationKeys = Array.isArray(plan.theoreticalRelationKeys) ? plan.theoreticalRelationKeys : []
  const marginalKeys = Array.isArray(plan.marginalKeys) ? plan.marginalKeys : []

  const seen = new Set()
  const missing = new Set()

  // Dedup per ruolo con priorità primary > companion > theoretical > marginal: una
  // chiave già assegnata a un ruolo più alto non ricompare in un ruolo più basso.
  const buildList = (keys, role) =>
    keys
      .filter((key) => {
        if (!key || seen.has(key)) return false
        seen.add(key)
        return true
      })
      .map((key) => {
        const card = resolve(key)
        if (!card.available) {
          missing.add(key)
          return null
        }
        return { ...card, role }
      })
      .filter(Boolean)

  const primary = buildList(primaryKeys, 'primary')
  const companion = buildList(companionKeys, 'companion')
  const theoretical = buildList(theoreticalRelationKeys, 'theoretical')
  const marginal = buildList(marginalKeys, 'marginal')

  return {
    primary,
    companion,
    theoretical,
    marginal,
    missingContentKeys: Array.from(missing),
    status: missing.size ? 'incomplete_content' : 'ready',
  }
}
