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
  grigio: 'introduce lucidità e distanza osservativa, moderando la reattività e sostenendo il discernimento',
}

const TENSION_RELATION_BY_PAIR = {
  'blu|rosso': 'mette in dialogo riflessione interiore e azione',
  'giallo|grigio': 'mette in dialogo slancio e distanza osservativa',
  'rosso|verde': 'mette in dialogo iniziativa e pausa',
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

  const sourceLabel = formatItalianList(sourceAreas)
  const profileCopy = familyCopy(profileFamily.familyKey)
  const leaderCopy = familyCopy(leader.familyKey)
  const firstParagraph = profileFamily.familyKey === leader.familyKey
    ? `Le risposte nelle aree ${sourceLabel} convergono nel rilevare una prevalenza della famiglia ${profileCopy.family}, associata alla natura ${profileCopy.nature}.`
    : `Nel profilo complessivo prevale la famiglia ${profileCopy.family}, associata alla natura ${profileCopy.nature}; nella lente composta da ${sourceLabel}, tuttavia, il valore più alto appartiene alla famiglia ${leaderCopy.family}.`

  let resultParagraph
  if (status === NATURA_NARRATIVE_STATUS.TRUE_TIE) {
    const tied = formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))
    resultParagraph = `${tied} condividono la prevalenza con ${leader.rawValue} punti ciascuna. Il risultato descrive una prevalenza congiunta, non una sola famiglia dominante.`
  } else if (status === NATURA_NARRATIVE_STATUS.ROUNDED_TIE) {
    const sameLevel = formatItalianList(topLevelFamilies.map((item) => familyCopy(item.familyKey).family))
    resultParagraph = `${sameLevel} raggiungono lo stesso livello grafico di ${leader.valore}/7 per effetto dell'arrotondamento. I punti grezzi mantengono al primo posto la famiglia ${leaderCopy.family}, con ${leader.rawValue} punti e il ${formatPercent(leader.distributionPercent)}% dei punti della lente.`
  } else {
    resultParagraph = `La famiglia ${leaderCopy.family} raccoglie ${leader.rawValue} punti, pari al ${formatPercent(leader.distributionPercent)}% dei punti della lente, e occupa il primo posto nel confronto interno con un livello relativo di ${leader.valore}/7.`
  }

  const secondaryFamilies = highlightedFamilies.filter(
    (item) => item.familyKey !== leader.familyKey,
  )
  const relations = []
  const contributionSentences = secondaryFamilies.map((item) => {
    const copy = familyCopy(item.familyKey)
    const relation = TENSION_RELATION_BY_PAIR[pairKey(leader.familyKey, item.familyKey)]
    if (relation) relations.push({ from: leader.familyKey, to: item.familyKey, kind: 'tension' })
    const contribution = FAMILY_CONTRIBUTION_BY_KEY[item.familyKey] || 'aggiunge una diversa modulazione emotiva al profilo'
    const relationText = relation
      ? ` Nel dialogo con la componente ${leaderCopy.family}, ${relation}.`
      : ` Si affianca alla componente ${leaderCopy.family} senza annullarne la prevalenza.`
    return `La componente ${copy.family} rappresenta il ${formatPercent(item.distributionPercent)}% dei punti della lente e ${contribution}.${relationText}`
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
      firstParagraph,
      resultParagraph,
      compositionParagraph,
      closingParagraph,
      shadesParagraph,
    ].filter(Boolean),
    highlightedFamilies: highlightedFamilies.map((item) => item.familyKey),
    relations,
  }
}
