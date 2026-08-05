import { FAMILY_THEME } from '../config/reportFamilyTheme.js'

export const NATURA_NARRATIVE_STATUS = Object.freeze({
  EMPTY: 'empty',
  TRUE_TIE: 'true_tie',
  ROUNDED_TIE: 'rounded_tie',
  COMPOSITE: 'composite',
  CLEAR: 'clear',
})

const FAMILY_THEME_BY_KEY = Object.fromEntries(
  Object.values(FAMILY_THEME).map((theme) => [theme.key, theme]),
)

export const NATURA_RELATION_RULES = Object.freeze({
  'blu|verde': {
    kind: 'modulation',
    copy: 'la calma accompagna l\'interiorità senza opporvisi e può moderare un\'introspezione troppo intensa',
  },
  'rosso|verde': {
    kind: 'tension',
    copy: 'mette in tensione la spinta all\'azione con il bisogno di pausa e moderazione',
  },
  'giallo|verde': {
    kind: 'tension',
    copy: 'mette in tensione il movimento e l\'eccitazione con il bisogno di quiete',
  },
  'blu|rosso': {
    kind: 'compensation',
    copy: 'la riflessione e la sensibilità compensano la fermezza orientata all\'azione',
  },
  'giallo|rosso': {
    kind: 'affinity',
    copy: 'slancio e volontà condividono un orientamento dinamico verso il fare',
  },
  'blu|giallo': {
    kind: 'modulation',
    copy: 'l\'apertura verso l\'esterno si alterna alla riflessione interiore',
  },
  'giallo|grigio': {
    kind: 'tension',
    copy: 'mette in tensione lo slancio vitale con il raffreddamento e la distanza osservativa',
  },
  'grigio|rosso': {
    kind: 'tension',
    copy: 'mette in tensione la calda volontà con il distacco razionale',
  },
  'blu|grigio': {
    kind: 'attenuation',
    copy: 'la distanza razionale può attenuare l\'intensità dell\'esperienza interiore',
  },
  'grigio|verde': {
    kind: 'attenuation',
    copy: 'la distanza razionale può attenuare la qualità affettiva della calma',
  },
})

export function resolveInfluenceDescriptor(gapPercent = 0) {
  const gap = Math.max(0, Number(gapPercent) || 0)
  if (gap <= 10) return 'marcata'
  if (gap <= 15) return 'discreta'
  if (gap <= 25) return 'moderata'
  if (gap <= 35) return 'leggera'
  return 'blanda'
}

export function resolveTensionDescriptor(gapPercent = 0) {
  const gap = Math.max(0, Number(gapPercent) || 0)
  if (gap <= 10) return 'intensa'
  if (gap <= 15) return 'significativa'
  if (gap <= 25) return 'moderata'
  if (gap <= 35) return 'leggera'
  return 'blanda'
}

export function resolveHarmonyDescriptor(gapPercent = 0) {
  const gap = Math.max(0, Number(gapPercent) || 0)
  if (gap <= 10) return 'un\'eccellente armonia'
  if (gap <= 15) return 'una buona armonia'
  if (gap <= 25) return 'una discreta armonia'
  if (gap <= 35) return 'una leggera armonia'
  return 'poca armonia'
}

function sentenceCase(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : ''
}

function formatPercent(value) {
  const numeric = Number(value) || 0
  return String(Number(numeric.toFixed(1))).replace('.', ',')
}

function percentGap(first = 0, second = 0) {
  return Number(Math.max(0, (Number(first) || 0) - (Number(second) || 0)).toFixed(1))
}

function formatItalianList(items = []) {
  const values = items.filter(Boolean)
  if (values.length <= 1) return values[0] || ''
  if (values.length === 2) return `${values[0]} e ${values[1]}`
  return `${values.slice(0, -1).join(', ')} e ${values.at(-1)}`
}

function familyCopy(familyKey) {
  const theme = FAMILY_THEME_BY_KEY[familyKey] || {}
  return {
    family: theme.family || 'famiglia non disponibile',
    nature: sentenceCase(theme.characteristic || theme.disposition),
  }
}

function pairKey(firstKey, secondKey) {
  return [firstKey, secondKey].sort().join('|')
}

const RELATION_LABEL_BY_KIND = {
  affinity: 'affinità',
  modulation: 'modulazione',
  compensation: 'compensazione',
  attenuation: 'attenuazione',
  tension: 'tensione',
}

function buildInfluenceParagraph(item, leader, position) {
  const copy = familyCopy(item.familyKey)
  const leaderCopy = familyCopy(leader.familyKey)
  const gap = percentGap(leader.distributionPercent, item.distributionPercent)
  const influence = resolveInfluenceDescriptor(gap)
  const rule = NATURA_RELATION_RULES[pairKey(leader.familyKey, item.familyKey)]
  const relationLabel = RELATION_LABEL_BY_KIND[rule?.kind] || 'integrazione'
  const tensionDetail = rule?.kind === 'tension'
    ? ` ${resolveTensionDescriptor(gap)} in base alla distanza dalla componente principale`
    : ''
  const ordinal = ['prima', 'seconda', 'terza', 'quarta', 'quinta'][position - 1] || `${position}ª`
  const relationCopy = rule?.copy || 'aggiunge una diversa modulazione emotiva al profilo'

  return `La ${ordinal} componente è la famiglia ${copy.family}, con il ${formatPercent(item.distributionPercent)}% dei punti della lente: la distanza di ${formatPercent(gap)} punti percentuali dalla famiglia ${leaderCopy.family} indica un'influenza ${influence} sul risultato. Il rapporto con la natura di base è di ${relationLabel}${tensionDetail}: ${relationCopy}.`
}

function buildShadesParagraph(shades = [], familyKey) {
  const measurable = shades
    .filter(
      (shade) =>
        shade.familyKey === familyKey &&
        shade.misurabile !== false &&
        (Number(shade.percentuale) || 0) > 0,
    )
    .sort((a, b) => (Number(b.percentuale) || 0) - (Number(a.percentuale) || 0))

  if (!measurable.length) return ''

  const copy = familyCopy(familyKey)
  const values = measurable.map(
    (shade) => `${shade.nome} raggiunge il ${formatPercent(shade.percentuale)}% del proprio massimo teorico`,
  )
  return `Nel profilo complessivo, all'interno della famiglia ${copy.family}, ${formatItalianList(values)}. Queste percentuali descrivono attivazioni indipendenti: non appartengono alla singola lente e non devono sommare a 100%.`
}

/**
 * Costruisce il racconto data-driven della lente Natura senza ricalcolare lo scoring.
 * La graduatoria deve contenere i campi già esposti dal report:
 * familyKey, rawValue, distributionPercent e valore (scala relativa 1-7).
 */
export function buildNaturaNarrative({
  ranking = [],
  shades = [],
  sourceAreas = ['Timbro', 'Intervalli', 'Armonia'],
} = {}) {
  const ranked = [...ranking]
    .filter((item) => (Number(item?.rawValue) || 0) > 0)
    .sort((a, b) => (Number(b.rawValue) || 0) - (Number(a.rawValue) || 0))
  const rawSum = ranked.reduce((sum, item) => sum + (Number(item.rawValue) || 0), 0)

  if (!ranked.length || rawSum <= 0) {
    return {
      status: NATURA_NARRATIVE_STATUS.EMPTY,
      paragraphs: [
        `Le risposte nelle aree ${formatItalianList(sourceAreas)} non sono sufficienti per descrivere la natura emotiva di base.`,
      ],
      frontParagraphs: [
        `Le risposte nelle aree ${formatItalianList(sourceAreas)} non sono sufficienti per descrivere la natura emotiva di base.`,
      ],
      highlightedFamilies: [],
      relations: [],
    }
  }

  const leader = ranked[0]
  const profileFamily = leader
  const topRawFamilies = ranked.filter((item) => item.rawValue === leader.rawValue)
  const topLevelFamilies = ranked.filter((item) => item.valore === leader.valore)
  const highlightedFamilies = ranked.filter(
    (item) => item.valore >= 5 && leader.valore - item.valore <= 2,
  )

  let status = NATURA_NARRATIVE_STATUS.CLEAR
  if (topRawFamilies.length > 1) status = NATURA_NARRATIVE_STATUS.TRUE_TIE
  else if (topLevelFamilies.length > 1) status = NATURA_NARRATIVE_STATUS.ROUNDED_TIE
  else if (highlightedFamilies.length > 1) status = NATURA_NARRATIVE_STATUS.COMPOSITE

  const profileCopy = familyCopy(profileFamily.familyKey)
  const leaderCopy = familyCopy(leader.familyKey)
  const familyParagraph = status === NATURA_NARRATIVE_STATUS.TRUE_TIE
    ? `Nel tuo risultato, le famiglie ${formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))} ottengono lo stesso punteggio più alto.`
    : `Nel tuo risultato, la famiglia ${profileCopy.family} ottiene il punteggio più alto ed è quindi la famiglia prevalente.`
  const natureParagraph = status === NATURA_NARRATIVE_STATUS.TRUE_TIE
    ? `La lettura delle diverse aree del test converge nel riconoscere una natura emotiva di base composta, in cui coesistono le nature ${formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).nature))}.`
    : `La lettura delle diverse aree del test converge nel riconoscere come ${profileCopy.nature} la tua natura emotiva di base.`

  let resultParagraph
  if (status === NATURA_NARRATIVE_STATUS.TRUE_TIE) {
    const tied = formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))
    resultParagraph = `La lente rileva una prevalenza condivisa tra ${tied}, con ${leader.rawValue} punti ciascuna: non attribuisce quindi il primato a una sola famiglia.`
  } else {
    const roundedTieCopy = status === NATURA_NARRATIVE_STATUS.ROUNDED_TIE
      ? ` Pur raggiungendo lo stesso livello grafico di ${leader.valore}/7 per effetto dell'arrotondamento, i punti grezzi mantengono al primo posto la famiglia ${leaderCopy.family}.`
      : ''
    resultParagraph = `La famiglia ${leaderCopy.family} guida questa lente con ${leader.rawValue} punti, pari al ${formatPercent(leader.distributionPercent)}%. Le altre famiglie non prevalgono: influenzano il modo in cui questa natura si esprime.${roundedTieCopy}`
  }

  const influenceFamilies = ranked.filter(
    (item) =>
      item.familyKey !== leader.familyKey &&
      !(status === NATURA_NARRATIVE_STATUS.TRUE_TIE && item.rawValue === leader.rawValue),
  )
  const influenceParagraphs = influenceFamilies.map((item) =>
    buildInfluenceParagraph(item, leader, ranked.findIndex((candidate) => candidate.familyKey === item.familyKey) + 1),
  )
  const harmonyGap = influenceFamilies.length
    ? Number(
        (
          influenceFamilies.reduce(
            (sum, item) => sum + percentGap(leader.distributionPercent, item.distributionPercent),
            0,
          ) / influenceFamilies.length
        ).toFixed(1),
      )
    : null
  const harmonyParagraph = harmonyGap !== null
    ? `La distanza media di ${formatPercent(harmonyGap)} punti percentuali tra la famiglia ${leaderCopy.family} e le altre componenti misurate indica ${resolveHarmonyDescriptor(harmonyGap)} nella composizione del profilo.`
    : ''
  const relatedFamilies = ranked
    .filter((item) => item.familyKey !== leader.familyKey)
    .map((item) => ({
      ...item,
      rule: NATURA_RELATION_RULES[pairKey(leader.familyKey, item.familyKey)] || null,
    }))
  const relations = relatedFamilies
    .filter(({ rule }) => rule)
    .map((item) => ({ from: leader.familyKey, to: item.familyKey, kind: item.rule.kind }))

  const relationParagraph = ranked.length === 1
      ? 'In questa lente non emergono altre componenti misurate accanto alla natura di base.'
      : ''
  const compositionParagraph = influenceFamilies.length
    ? ''
    : status === NATURA_NARRATIVE_STATUS.TRUE_TIE
      ? `Il risultato resta condiviso tra le famiglie ${formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))}; nessuna delle due viene trattata come influenza secondaria.`
      : 'Il risultato della lente è concentrato interamente sulla famiglia prevalente; nessun’altra famiglia ha ottenuto punti in questa misurazione.'
  const closingParagraph = influenceFamilies.length
    ? 'La compresenza non indica una contraddizione: descrive orientamenti che possono alternarsi o combinarsi in modo diverso a seconda delle situazioni.'
    : status === NATURA_NARRATIVE_STATUS.TRUE_TIE
      ? 'La natura di base è quindi composita e conserva il pari peso delle famiglie al vertice.'
    : ranked.length === 1
      ? `Il profilo di questa lente resta quindi concentrato sulla famiglia ${leaderCopy.family}.`
      : `Il profilo di questa lente resta concentrato intorno alla famiglia ${leaderCopy.family}, pur senza escludere le altre componenti.`
  const shadeFamilyKeys = status === NATURA_NARRATIVE_STATUS.TRUE_TIE
    ? topRawFamilies.map((item) => item.familyKey)
    : [profileFamily.familyKey]
  const shadesParagraph = shadeFamilyKeys
    .map((familyKey) => buildShadesParagraph(shades, familyKey))
    .filter(Boolean)
    .join(' ')
  const frontInfluenceParagraphs = influenceParagraphs.slice(0, 2)
  const frontRelationParagraphs = frontInfluenceParagraphs.length
    ? frontInfluenceParagraphs
    : status === NATURA_NARRATIVE_STATUS.TRUE_TIE
      ? []
    : [`In questa lente emerge con chiarezza la famiglia ${profileCopy.family}, senza altre componenti misurate.`]

  return {
    status,
    paragraphs: [
      familyParagraph,
      natureParagraph,
      resultParagraph,
      relationParagraph,
      harmonyParagraph,
      ...influenceParagraphs,
      compositionParagraph,
      closingParagraph,
      shadesParagraph,
    ].filter(Boolean),
    frontParagraphs: [
      `${familyParagraph} ${natureParagraph}`,
      ...frontRelationParagraphs,
    ],
    highlightedFamilies: highlightedFamilies.map((item) => item.familyKey),
    relations,
  }
}
