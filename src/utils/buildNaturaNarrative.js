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

const FAMILY_CONTRIBUTION_BY_KEY = {
  blu: 'introduce riflessione e profondità, richiamando l\'attenzione sull\'esperienza interiore',
  rosso: 'introduce fermezza e capacità di realizzazione, sostenendo il passaggio dall\'intenzione all\'azione',
  verde: 'introduce calma e moderazione, regolando l\'impulso e dando spazio alla pausa',
  giallo: 'introduce slancio, curiosità e apertura, rendendo il profilo più mobile e proiettivo',
  grigio: 'introduce distanza osservativa e controllo, attenuando la reattività emotiva',
}

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

export function resolvePrevalenceDescriptor(gapPercent = 0) {
  const gap = Math.max(0, Number(gapPercent) || 0)
  if (gap <= 10) return 'certa'
  if (gap <= 20) return 'discreta'
  if (gap <= 30) return 'chiara'
  if (gap <= 40) return 'marcata'
  return 'netta'
}

export function resolveTensionDescriptor(oppositePercent = 0) {
  const percent = Math.max(0, Number(oppositePercent) || 0)
  if (percent <= 10) return 'leggera'
  if (percent <= 20) return 'moderata'
  if (percent <= 30) return 'significativa'
  if (percent <= 40) return 'marcata'
  return 'molto intensa'
}

export function resolveHarmonyDescriptor(gapPercent = 0) {
  const gap = Math.max(0, Number(gapPercent) || 0)
  if (gap < 10) return 'un\'eccellente armonia'
  if (gap <= 20) return 'una buona armonia'
  if (gap <= 30) return 'un\'armonia fragile'
  if (gap <= 40) return 'una scarsa armonia'
  return 'un\'armonia molto scarsa'
}

function sentenceCase(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : ''
}

function formatPercent(value) {
  const numeric = Number(value) || 0
  return String(numeric).replace('.', ',')
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
  dominantFamilyKey = '',
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
      highlightedFamilies: [],
      relations: [],
    }
  }

  const leader = ranked[0]
  const profileFamily = ranked.find((item) => item.familyKey === dominantFamilyKey) || leader
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
    ? `Il test rileva un'appartenenza condivisa alle famiglie ${formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))}.`
    : `Il test conferma la tua appartenenza alla famiglia ${profileCopy.family}.`
  const natureParagraph = status === NATURA_NARRATIVE_STATUS.TRUE_TIE
    ? `La lettura delle diverse aree del test converge nel riconoscere una natura emotiva di base composta, in cui coesistono le nature ${formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).nature))}.`
    : `La lettura delle diverse aree del test converge nel riconoscere come ${profileCopy.nature} la tua natura emotiva di base.`

  let resultParagraph
  if (status === NATURA_NARRATIVE_STATUS.TRUE_TIE) {
    const tied = formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))
    resultParagraph = `La lente rileva una prevalenza condivisa tra ${tied}, con ${leader.rawValue} punti ciascuna: non attribuisce quindi il primato a una sola famiglia.`
  } else {
    const runnerUp = ranked[1]
    const gap = Math.max(
      0,
      (Number(leader.distributionPercent) || 0) - (Number(runnerUp?.distributionPercent) || 0),
    )
    const descriptor = resolvePrevalenceDescriptor(gap)
    const roundedTieCopy = status === NATURA_NARRATIVE_STATUS.ROUNDED_TIE
      ? ` Pur raggiungendo lo stesso livello grafico di ${leader.valore}/7 per effetto dell'arrotondamento, i punti grezzi mantengono al primo posto la famiglia ${leaderCopy.family}.`
      : ''
    resultParagraph = `La lente rivela una ${descriptor} prevalenza rispetto alle altre disposizioni temperamentali: la distanza tra la famiglia ${leaderCopy.family} e la seconda famiglia è di ${formatPercent(gap)} punti percentuali.${roundedTieCopy}`
  }

  const secondaryFamilies = highlightedFamilies.filter(
    (item) => item.familyKey !== leader.familyKey,
  )
  const runnerUp = ranked[1]
  const harmonyGap = runnerUp
    ? Math.abs((Number(leader.distributionPercent) || 0) - (Number(runnerUp.distributionPercent) || 0))
    : 100
  const harmonyParagraph = runnerUp
    ? `La distanza di ${formatPercent(harmonyGap)} punti percentuali tra le due componenti principali indica ${resolveHarmonyDescriptor(harmonyGap)} nella composizione del profilo.`
    : ''
  const relatedFamilies = ranked
    .filter((item) => item.familyKey !== leader.familyKey)
    .map((item) => ({
      ...item,
      rule: NATURA_RELATION_RULES[pairKey(leader.familyKey, item.familyKey)] || null,
    }))
  const tensionFamilies = relatedFamilies.filter(({ rule }) => rule?.kind === 'tension')
  const strongestTension = tensionFamilies.sort(
    (a, b) => (Number(b.distributionPercent) || 0) - (Number(a.distributionPercent) || 0),
  )[0]
  const relations = relatedFamilies
    .filter(({ rule }) => rule)
    .map((item) => ({ from: leader.familyKey, to: item.familyKey, kind: item.rule.kind }))

  const relationParagraph = strongestTension
    ? (() => {
        const copy = familyCopy(strongestTension.familyKey)
        const intensity = resolveTensionDescriptor(strongestTension.distributionPercent)
        return `Il profilo presenta anche una tensione ${intensity} con la natura di base, legata alla presenza della componente ${copy.family} al ${formatPercent(strongestTension.distributionPercent)}%.`
      })()
    : 'Le componenti secondarie si affiancano alla natura di base e ne ampliano le sfumature senza configurare una relazione di opposizione.'

  const contributionSentences = secondaryFamilies.map((item) => {
    const copy = familyCopy(item.familyKey)
    const relation = NATURA_RELATION_RULES[pairKey(leader.familyKey, item.familyKey)]
    const contribution = FAMILY_CONTRIBUTION_BY_KEY[item.familyKey] || 'aggiunge una diversa modulazione emotiva al profilo'
    const relationText = relation
      ? ` Nel dialogo con la componente ${leaderCopy.family}, ${relation.copy}.`
      : ` Si affianca alla componente ${leaderCopy.family} senza annullarne la prevalenza.`
    return `La componente ${copy.family}, associata alla natura ${copy.nature}, rappresenta il ${formatPercent(item.distributionPercent)}% dei punti della lente e ${contribution}.${relationText}`
  })

  const compositionParagraph = contributionSentences.length
    ? contributionSentences.join(' ')
    : 'Le altre famiglie restano presenti con valori più distanti e non modificano la prevalenza rilevata in questa lente.'
  const closingParagraph = contributionSentences.length
    ? 'La compresenza non indica una contraddizione: descrive orientamenti che possono alternarsi o combinarsi in modo diverso a seconda delle situazioni.'
    : `Il profilo di questa lente resta concentrato intorno alla famiglia ${leaderCopy.family}, pur senza escludere le altre componenti.`
  const shadesParagraph = buildShadesParagraph(shades, profileFamily.familyKey)

  return {
    status,
    paragraphs: [
      familyParagraph,
      natureParagraph,
      resultParagraph,
      relationParagraph,
      harmonyParagraph,
      compositionParagraph,
      closingParagraph,
      shadesParagraph,
    ].filter(Boolean),
    highlightedFamilies: highlightedFamilies.map((item) => item.familyKey),
    relations,
  }
}
