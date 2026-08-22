const DEFAULT_POLICY = Object.freeze({
  nearGap: 8,
  significantGap: 15,
  significantRatio: 0.55,
  minimumSignificantPercent: 12,
  minimumSecondaryPercent: 7,
})

function numeric(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * Gerarchia editoriale deterministica per non confondere "prima" con "unica".
 * Usa soltanto la quota di punti gia' calcolata nella lente; non modifica lo scoring.
 */
export function analyzeFamilyComposition(ranking = [], policy = DEFAULT_POLICY) {
  const sorted = [...ranking]
    .filter((item) => numeric(item?.rawValue) > 0)
    .sort((a, b) => numeric(b.rawValue) - numeric(a.rawValue))

  const leaderPercent = numeric(sorted[0]?.distributionPercent)
  const leaderRaw = numeric(sorted[0]?.rawValue)

  const families = sorted.map((item, index) => {
    const percent = numeric(item.distributionPercent)
    const gap = Math.max(0, Number((leaderPercent - percent).toFixed(1)))
    const ratio = leaderPercent > 0 ? Number((percent / leaderPercent).toFixed(3)) : 0
    let salience = 'marginal'

    if (index === 0) salience = 'leader'
    else if (item.rawValue === leaderRaw || gap <= policy.nearGap) salience = 'near'
    else if (
      percent >= policy.minimumSignificantPercent &&
      (gap <= policy.significantGap || ratio >= policy.significantRatio)
    ) salience = 'significant'
    else if (percent >= policy.minimumSecondaryPercent) salience = 'secondary'

    return { ...item, rank: index + 1, gapFromLeader: gap, ratioToLeader: ratio, salience }
  })

  return {
    status: families.length === 0
      ? 'empty'
      : families.some((item) => item.salience === 'near')
        ? 'balanced'
        : families.some((item) => item.salience === 'significant')
          ? 'mixed'
          : 'focused',
    leader: families[0] || null,
    families,
    foreground: families.filter((item) => ['leader', 'near', 'significant'].includes(item.salience)),
    background: families.filter((item) => ['secondary', 'marginal'].includes(item.salience)),
    policy,
  }
}

export function getFamilySalience(composition, familyKey) {
  return composition?.families?.find((item) => item.familyKey === familyKey) || null
}

export function canSupportStrongInterpretation(item) {
  return ['leader', 'near', 'significant'].includes(item?.salience)
}

/* =========================================================================
 * Contratto interpretativo isolato (Fase 2A / corretto in Fase 2B)
 *
 * Motore puro e deterministico: da graduatorie in presence_percent_0_100
 * produce un contratto strutturato (chiavi, ruoli, priorità, segnalazioni).
 * Non carica, non seleziona e non modifica testi. Chiavi interne canoniche:
 * rosso, blu, giallo, verde, grigio — la traduzione verso nomi editoriali
 * o etichette utente avviene in un adapter separato, non qui.
 * ========================================================================= */

export const SCALE_PRESENCE_PERCENT = 'presence_percent_0_100'

const FAMILY_BAND = Object.freeze({
  LEADER: 'leader',
  EXACT_TIE: 'exact_tie',
  NEAR_PARITY: 'near_parity',
  SECONDARY: 'secondary',
  MARGINAL: 'marginal',
})

/** Fasce condivise per i descrittori influence/tension/harmony (sempre su Math.abs). */
const DESCRIPTOR_BANDS = [
  { max: 10, influence: 'marked', tension: 'intense', harmony: 'excellent' },
  { max: 15, influence: 'discrete', tension: 'significant', harmony: 'good' },
  { max: 25, influence: 'moderate', tension: 'moderate', harmony: 'discrete' },
  { max: 35, influence: 'light', tension: 'light', harmony: 'light' },
  { max: Infinity, influence: 'bland', tension: 'bland', harmony: 'low' },
]

function gapAbs(a, b) {
  return Number(Math.abs(a - b).toFixed(4))
}

/** Un percent invalido (NaN, fuori 0-100, non numero) non diventa mai silenziosamente 0. */
function isValidPercentEntry(entry) {
  if (!entry || typeof entry.familyKey !== 'string' || entry.familyKey.length === 0) return false
  const { percent } = entry
  return typeof percent === 'number' && Number.isFinite(percent) && percent >= 0 && percent <= 100
}

export function resolveDescriptorBand(gap, kind) {
  const value = Number(gap)
  if (!Number.isFinite(value)) return null
  const safe = Math.max(0, value)
  const row = DESCRIPTOR_BANDS.find((entry) => safe <= entry.max) || DESCRIPTOR_BANDS.at(-1)
  return row[kind] || null
}

/**
 * Classifica una graduatoria già espressa in presence_percent_0_100 rispetto al proprio
 * leader. scope/source sono etichette dichiarative (es. 'global' | 'nature' | 'relation:self'),
 * non influenzano il calcolo: servono a non confondere ambiti diversi (vedi globalProfileLeader
 * / natureScopeLeader / relationLocalLeader).
 */
export function classifyFamilyRanking(entries = [], { scope = 'unknown', source = 'unknown', scale = SCALE_PRESENCE_PERCENT } = {}) {
  if (!Array.isArray(entries) || entries.length === 0 || entries.some((entry) => !isValidPercentEntry(entry))) {
    return { status: 'invalid_input', scope, source, scale }
  }
  if (scale !== SCALE_PRESENCE_PERCENT) {
    return { status: 'scale_mismatch', scope, source, scale }
  }

  const sorted = [...entries].sort((a, b) => b.percent - a.percent)
  const leader = sorted[0]
  // Pari merito esatto: nessuna scelta arbitraria del vincitore, tutte le famiglie
  // al valore massimo restano "leaders" e finiscono in primaryKeys.
  const leaders = sorted.filter((entry) => entry.percent === leader.percent)
  const hasUniqueLeader = leaders.length === 1

  const ranking = sorted.map((entry, index) => {
    const distanceFromLeader = gapAbs(leader.percent, entry.percent)
    let band
    if (index === 0) band = FAMILY_BAND.LEADER
    else if (distanceFromLeader === 0) band = FAMILY_BAND.EXACT_TIE
    else if (distanceFromLeader <= 10) band = FAMILY_BAND.NEAR_PARITY
    else if (entry.percent >= 10 && distanceFromLeader <= 35) band = FAMILY_BAND.SECONDARY
    else band = FAMILY_BAND.MARGINAL
    return { ...entry, rank: index + 1, distanceFromLeader, band }
  })

  const hasExactTie = ranking.some((item) => item.band === FAMILY_BAND.EXACT_TIE)
  const hasNearParity = ranking.some((item) => item.band === FAMILY_BAND.NEAR_PARITY)
  const leadMode = hasExactTie ? FAMILY_BAND.EXACT_TIE : hasNearParity ? FAMILY_BAND.NEAR_PARITY : 'clear'

  const thirdPercent = sorted[2]?.percent ?? 0
  const profileShape = (hasExactTie || hasNearParity || thirdPercent >= 15) ? 'composite' : 'single'

  // Uno zero validato è un valore misurato, non un'assenza: non va escluso dall'armonia.
  // Servono almeno tre entry validate; si usano sempre le prime tre della graduatoria.
  const harmony = sorted.length < 3
    ? { status: 'not_calculable', gap: null, band: null }
    : (() => {
        const [first, second, third] = sorted
        const gapSecond = gapAbs(first.percent, second.percent)
        const gapThird = gapAbs(first.percent, third.percent)
        const gap = Number(((gapSecond + gapThird) / 2).toFixed(4))
        return {
          status: 'ready',
          gap,
          band: resolveDescriptorBand(gap, 'harmony'),
          gapSecond,
          gapThird,
          basis: 'mean_gap_from_leader_to_second_and_third',
        }
      })()

  const primaryKeys = ranking
    .filter((item) => item.band === FAMILY_BAND.LEADER || item.band === FAMILY_BAND.EXACT_TIE || item.band === FAMILY_BAND.NEAR_PARITY)
    .map((item) => item.familyKey)
  const companionKeys = ranking.filter((item) => item.band === FAMILY_BAND.SECONDARY).map((item) => item.familyKey)
  const marginalKeys = ranking.filter((item) => item.band === FAMILY_BAND.MARGINAL).map((item) => item.familyKey)

  return {
    status: 'ready',
    scope,
    source,
    scale,
    ranking,
    leader: ranking[0],
    leaders: leaders.map((entry) => entry.familyKey),
    hasUniqueLeader,
    leadMode,
    profileShape,
    harmony,
    contentPlan: {
      primaryKeys,
      companionKeys,
      theoreticalRelationKeys: [],
      marginalKeys,
      missingContentKeys: [],
      status: 'ready',
    },
  }
}

/** Riferimento tecnico fisso della lente per i tre rapporti a referenceFamilyKey costante. */
export const RELATION_REFERENCE_BY_SCOPE = Object.freeze({
  self: 'blu',
  other: 'giallo',
  action: 'rosso',
})

/**
 * Contratto per un singolo rapporto (self/other/action/nature). referenceFamilyKey è la
 * famiglia misurata dalla lente: non modifica la graduatoria locale, non diventa
 * automaticamente leader, non stabilisce da sola la scheda personale. displayPriority
 * conserva sempre l'ordine reale della graduatoria locale classificata: la famiglia di
 * riferimento teorico non viene mai anticipata rispetto a quell'ordine.
 */
export function buildRelationLensContract({
  scope,
  source = 'unknown',
  ranking = [],
  referenceFamilyKey = null,
  relationMatrix = null,
  scale = SCALE_PRESENCE_PERCENT,
} = {}) {
  const resolvedReference = referenceFamilyKey || RELATION_REFERENCE_BY_SCOPE[scope] || null
  if (!resolvedReference) {
    return { status: 'needs_rule', scope, source, scale }
  }

  const classified = classifyFamilyRanking(ranking, { scope, source, scale })
  if (classified.status !== 'ready') {
    return { ...classified, referenceFamilyKey: resolvedReference }
  }

  const localRanking = classified.ranking
  const localLeader = classified.leader
  const referenceItem = localRanking.find((entry) => entry.familyKey === resolvedReference) || null

  const referenceRank = referenceItem?.rank ?? null
  const referencePercent = referenceItem ? referenceItem.percent : null
  const distanceFromLocalLeader = referenceItem ? referenceItem.distanceFromLeader : null
  // Ruolo reale della famiglia di riferimento nella graduatoria locale (non solo
  // "è/non è il leader"): leader | exact_tie | near_parity | secondary | marginal | missing.
  const referenceRole = referenceItem ? referenceItem.band : 'missing'

  const comparisonKeys = localRanking
    .filter((entry) => entry.familyKey !== resolvedReference)
    .map((entry) => entry.familyKey)

  const relationDetails = []
  const tensionKeys = []
  const theoreticalRelationKeys = []
  comparisonKeys.forEach((key) => {
    if (!relationMatrix) {
      relationDetails.push({ familyKey: key, kind: null, relationStatus: 'unknown' })
      return
    }
    const pairKey = [resolvedReference, key].sort().join('|')
    const rule = relationMatrix[pairKey]
    if (!rule) {
      relationDetails.push({ familyKey: key, kind: null, relationStatus: 'unknown' })
      return
    }
    relationDetails.push({ familyKey: key, kind: rule.kind, relationStatus: 'known' })
    if (rule.kind === 'tension') tensionKeys.push(key)
    else theoreticalRelationKeys.push(key)
  })

  const displayPriority = localRanking.map((entry) => entry.familyKey)

  return {
    status: 'ready',
    scope,
    source,
    scale,
    localRanking,
    localLeader,
    localLeaders: classified.leaders,
    localHasUniqueLeader: classified.hasUniqueLeader,
    localContentPlan: classified.contentPlan,
    referenceFamilyKey: resolvedReference,
    referenceRank,
    referencePercent,
    referenceRole,
    distanceFromLocalLeader,
    comparisonKeys,
    relationDetails,
    tensionKeys,
    theoreticalRelationKeys,
    displayPriority,
  }
}

/**
 * Livello tecnico di propensione all'azione. Usa sempre e soltanto la percentuale
 * Marziale: non promuove la Marziale a leader della graduatoria locale.
 */
export function classifyActionPropensityTechnical(percent) {
  const value = Number(percent) || 0
  if (value >= 50) return 'exceptionally_high'
  if (value >= 40) return 'marked'
  if (value >= 30) return 'good'
  if (value >= 20) return 'discrete'
  if (value >= 10) return 'partial'
  return 'very_low'
}

/**
 * Riconcilia un piano di contenuti con le chiavi realmente disponibili, senza mai
 * sostituire una chiave mancante con una simile e senza generare testo. Le chiavi
 * richieste dal piano semantico (primaryKeys/companionKeys/theoreticalRelationKeys/
 * marginalKeys) restano intatte: le versioni "disponibili" vengono aggiunte a parte.
 */
export function reconcileContentPlan(plan, availableContentKeys = null) {
  if (!plan || plan.status === 'invalid_input' || plan.status === 'scale_mismatch') return plan
  if (!Array.isArray(availableContentKeys)) return plan
  const available = new Set(availableContentKeys)
  const missing = new Set()
  const keepAvailable = (keys = []) => keys.filter((key) => {
    if (available.has(key)) return true
    missing.add(key)
    return false
  })

  const availablePrimaryKeys = keepAvailable(plan.primaryKeys)
  const availableCompanionKeys = keepAvailable(plan.companionKeys)
  const availableTheoreticalRelationKeys = keepAvailable(plan.theoreticalRelationKeys)
  const missingContentKeys = Array.from(missing)

  return {
    ...plan,
    availablePrimaryKeys,
    availableCompanionKeys,
    availableTheoreticalRelationKeys,
    missingContentKeys,
    status: missingContentKeys.length ? 'incomplete_content' : 'ready',
  }
}
