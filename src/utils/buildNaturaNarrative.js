import { FAMILY_THEME } from '../config/reportFamilyTheme.js'
import {
  analyzeFamilyComposition,
  canSupportStrongInterpretation,
  getFamilySalience,
} from './reportCompositionSensitivity.js'

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
    kind: 'awareness',
    copy: 'la riflessione e la sensibilità rendono più consapevole la fermezza orientata all\'azione',
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

const NATURA_PRACTICAL_BASE = {
  rosso: 'tendi a decidere in fretta e a passare all\'azione senza troppi giri di parole: quando qualcosa ti sta a cuore, lo fai valere subito, anche a costo di uno scontro.',
  blu: 'hai bisogno di tempo per digerire quello che vivi prima di parlarne o agire: la riflessione viene quasi sempre prima della reazione.',
  verde: 'preferisci muoverti con calma ed evitare le forzature: aspetti il momento giusto piuttosto che buttarti d\'impulso.',
  giallo: 'ti lasci coinvolgere con facilità da persone e situazioni nuove: l\'entusiasmo ti porta a dire di sì più spesso che di no.',
  grigio: 'osservi prima di esporti: valuti con la testa più che con la pancia, anche quando la situazione scotta.',
}

const NATURA_RELATION_PRACTICAL = {
  'blu|verde': 'la tua calma accompagna i momenti di riflessione più intensa, aiutandoti a non restarci impigliato a lungo',
  'rosso|verde': 'a momenti di impulsività si alternano fasi in cui senti il bisogno di fermarti e non forzare le cose',
  'giallo|verde': 'alla voglia di buttarti in cose nuove si alterna il bisogno, altrettanto reale, di restare fermo e riposare',
  'blu|rosso': 'quando la fretta di agire rischia di portarti fuori strada, la parte più riflessiva ti rende più consapevole di quello che stai per fare, un attimo prima di scattare',
  'giallo|rosso': 'entusiasmo e determinazione remano nella stessa direzione: quando parti, difficilmente ti fermi a metà strada',
  'blu|giallo': 'ai momenti in cui ti apri e cerchi compagnia si alternano fasi in cui hai bisogno di ritirarti e stare con i tuoi pensieri',
  'giallo|grigio': 'alla voglia di lasciarti trasportare si affianca, a tratti, una voce più fredda che ti frena e ti fa calcolare',
  'grigio|rosso': 'quando la voglia di agire si scontra con il bisogno di valutare tutto a mente fredda, puoi restare in sospeso più del previsto',
  'blu|grigio': 'la tendenza a razionalizzare può smorzare l\'intensità di quello che senti, aiutandoti a non restarne travolto',
  'grigio|verde': 'la tendenza a valutare tutto con distacco può raffreddare anche i momenti in cui basterebbe solo restare in pace con te stesso',
}

function resolvePracticalRelation(firstKey, secondKey) {
  return NATURA_RELATION_PRACTICAL[pairKey(firstKey, secondKey)] || ''
}

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
  awareness: 'consapevolezza',
  attenuation: 'attenuazione',
  tension: 'tensione',
}

/**
 * Scomposizione generica influenze/tensioni/armonia rispetto a una famiglia di
 * riferimento (l'ago della bilancia della lente). Usata dal toggle "Vedi calcoli
 * e relazioni tra le famiglie" per tutti e quattro i rapporti: la famiglia di
 * riferimento non è sempre la più alta nella graduatoria della lente (es. Marziale
 * resta l'ago del rapporto con l'Agire anche quando un'altra famiglia ha più punti).
 */
export function buildRelationBreakdown({ agoFamilyKey = '', ranking = [] } = {}) {
  const measurable = ranking.filter((item) => (Number(item?.rawValue) || 0) > 0)
  const agoItem = measurable.find((item) => item.familyKey === agoFamilyKey) || null
  if (!agoItem) return { agoItem: null, others: [], tensions: [], harmony: null }
  const composition = analyzeFamilyComposition(measurable)
  const referenceSalience = getFamilySalience(composition, agoFamilyKey)
  const supportsStrongReference = canSupportStrongInterpretation(referenceSalience)

  const others = measurable
    .filter((item) => item.familyKey !== agoFamilyKey)
    .sort((a, b) => (Number(b.rawValue) || 0) - (Number(a.rawValue) || 0))
    .map((item) => {
      const gap = Number(Math.abs(
        (Number(agoItem.distributionPercent) || 0) - (Number(item.distributionPercent) || 0),
      ).toFixed(1))
      const rule = NATURA_RELATION_RULES[pairKey(agoFamilyKey, item.familyKey)] || null
      return {
        ...item,
        gap,
        influenceDescriptor: resolveInfluenceDescriptor(gap),
        relation: rule
          ? { kind: rule.kind, label: RELATION_LABEL_BY_KIND[rule.kind] || 'integrazione', copy: rule.copy }
          : null,
      }
    })

  const tensions = others
    .filter((item) => (
      supportsStrongReference &&
      canSupportStrongInterpretation(getFamilySalience(composition, item.familyKey)) &&
      item.relation?.kind === 'tension'
    ))
    .map((item) => ({ ...item, tensionDescriptor: resolveTensionDescriptor(item.gap) }))

  const harmony = supportsStrongReference && others.length >= 2
    ? (() => {
        const gap = Number(((others[0].gap + others[1].gap) / 2).toFixed(1))
        return {
          gap,
          descriptor: resolveHarmonyDescriptor(gap),
          familyKeys: [others[0].familyKey, others[1].familyKey],
        }
      })()
    : null

  return {
    agoItem,
    others,
    tensions,
    harmony,
    referenceSalience: referenceSalience?.salience || 'marginal',
    supportsStrongReference,
    compositionStatus: composition.status,
  }
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

  return `La ${ordinal} componente è la famiglia ${copy.family}, con il ${formatPercent(item.distributionPercent)}% dei punti del rapporto: la distanza di ${formatPercent(gap)} punti percentuali dalla famiglia ${leaderCopy.family} indica un'influenza ${influence} sul risultato. Il rapporto con la natura di base è di ${relationLabel}${tensionDetail}: ${relationCopy}.`
}

function buildNaturaStoryParagraphs({ status, leader, leaderCopy, influenceFamilies, harmonyGap, topRawFamilies }) {
  if (status === NATURA_NARRATIVE_STATUS.TRUE_TIE) {
    const tiedFamilies = formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))
    const tiedNatures = formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).nature))
    const opening = `Il test rivela quindi un profilo condiviso tra le famiglie ${tiedFamilies}, che ottengono lo stesso punteggio più alto. La lettura delle diverse aree del test converge nel riconoscere una natura emotiva di base composta, in cui coesistono le nature ${tiedNatures}.`
    const tiedPracticalSentences = topRawFamilies
      .map((item) => NATURA_PRACTICAL_BASE[item.familyKey])
      .filter(Boolean)
      .map((sentence) => sentence.replace(/\.\s*$/, ''))
    const tiedPracticalParagraph = tiedPracticalSentences.length >= 2
      ? `In pratica ti riconoscerai in più tendenze a seconda del momento: a volte ${tiedPracticalSentences[0]}; altre volte ${formatItalianList(tiedPracticalSentences.slice(1))}.`
      : tiedPracticalSentences.length === 1
        ? `In pratica ${tiedPracticalSentences[0]}.`
        : ''
    if (!influenceFamilies.length) {
      return [
        opening,
        [
          'La natura di base è quindi composita e conserva il pari peso delle famiglie al vertice, senza altre componenti misurabili.',
          tiedPracticalParagraph,
        ].filter(Boolean).join(' '),
      ]
    }
    const tiedHarmonyClause = harmonyGap !== null
      ? `, rivelando ${resolveHarmonyDescriptor(harmonyGap)} tra le diverse componenti`
      : ''
    return [
      opening,
      [
        `La presenza di più componenti con percentuali apprezzabili conferisce al tuo profilo temperamentale una complessità che unisce profondità con leggerezza${tiedHarmonyClause}.`,
        tiedPracticalParagraph,
      ].filter(Boolean).join(' '),
    ]
  }

  const opening = `Il test conferma la tua appartenenza alla famiglia ${leaderCopy.family}. La lettura delle diverse aree del test converge nel riconoscere come ${leaderCopy.nature} la tua natura emotiva di base. Il rapporto rivela una certa prevalenza rispetto ad altre disposizioni temperamentali.`

  if (!influenceFamilies.length) {
    const soloBase = NATURA_PRACTICAL_BASE[leader.familyKey]
    return [
      opening,
      [
        `Il risultato di questo rapporto è interamente concentrato sulla famiglia ${leaderCopy.family}, senza altre componenti misurabili in questa fase.`,
        soloBase ? `In pratica ${soloBase}` : '',
      ].filter(Boolean).join(' '),
    ]
  }

  const composition = analyzeFamilyComposition([leader, ...influenceFamilies])
  const foregroundKeys = new Set(composition.foreground.map((item) => item.familyKey))
  const narrativeFamilies = influenceFamilies.filter((item) => foregroundKeys.has(item.familyKey))
  const withRules = narrativeFamilies.map((item) => ({
    item,
    rule: NATURA_RELATION_RULES[pairKey(leader.familyKey, item.familyKey)],
  }))
  const tensionMatch = withRules.find(({ rule }) => rule?.kind === 'tension')
  const chosen = tensionMatch || withRules[0]
  if (!chosen) {
    const baseSentence = NATURA_PRACTICAL_BASE[leader.familyKey]
    return [
      opening,
      [
        `Le altre famiglie restano sullo sfondo e non sono abbastanza vicine alla componente prevalente da orientare il racconto principale.`,
        baseSentence ? `In pratica, questa lente suggerisce soprattutto che ${baseSentence}` : '',
      ].filter(Boolean).join(' '),
    ]
  }
  const secondaryCopy = familyCopy(chosen.item.familyKey)
  const gap = percentGap(leader.distributionPercent, chosen.item.distributionPercent)

  const compresenzaSentence = tensionMatch
    ? `Nel tuo profilo compaiono componenti sia in accordo che in tensione ${resolveTensionDescriptor(gap)}: emerge infatti anche la natura ${secondaryCopy.family}, che ${chosen.rule.copy}.`
    : `Il tuo profilo rivela anche la presenza della natura ${secondaryCopy.family}: ${chosen.rule.copy}.`

  const harmonyClause = harmonyGap !== null
    ? `, rivelando ${resolveHarmonyDescriptor(harmonyGap)} tra le diverse componenti`
    : ''
  const harmonySentence = `La presenza di più componenti con percentuali apprezzabili conferisce al tuo profilo temperamentale una complessità che unisce profondità con leggerezza${harmonyClause}.`

  const baseSentence = NATURA_PRACTICAL_BASE[leader.familyKey]
  const relationPractical = resolvePracticalRelation(leader.familyKey, chosen.item.familyKey)
  const practicalSentence = baseSentence
    ? `In pratica ${baseSentence}${relationPractical ? ` Inoltre, ${relationPractical}.` : ''}`
    : ''

  return [
    opening,
    compresenzaSentence,
    [harmonySentence, practicalSentence].filter(Boolean).join(' '),
  ]
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
 * Costruisce il racconto data-driven del rapporto Natura senza ricalcolare lo scoring.
 * La graduatoria deve contenere i campi già esposti dal report:
 * familyKey, rawValue, distributionPercent e valore (scala relativa 1-7).
 */
export function buildNaturaNarrative({
  ranking = [],
  shades = [],
  sourceAreas = ['Suono', 'Distanze tra le note', 'Accordi'],
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
    resultParagraph = `Il rapporto rileva una prevalenza condivisa tra ${tied}, con ${leader.rawValue} punti ciascuna: non attribuisce quindi il primato a una sola famiglia.`
  } else {
    const roundedTieCopy = status === NATURA_NARRATIVE_STATUS.ROUNDED_TIE
      ? ` Pur raggiungendo lo stesso livello grafico di ${leader.valore}/7 per effetto dell'arrotondamento, i punti grezzi mantengono al primo posto la famiglia ${leaderCopy.family}.`
      : ''
    resultParagraph = `La famiglia ${leaderCopy.family} guida questo rapporto con il ${formatPercent(leader.distributionPercent)}% dei punti: la tua natura emotiva di base risulta ${leaderCopy.nature}, la componente prevalente su cui si innestano le altre.${roundedTieCopy}`
  }

  const influenceFamilies = ranked.filter(
    (item) =>
      item.familyKey !== leader.familyKey &&
      !(status === NATURA_NARRATIVE_STATUS.TRUE_TIE && item.rawValue === leader.rawValue),
  )
  const influenceParagraphs = influenceFamilies.map((item) =>
    buildInfluenceParagraph(item, leader, ranked.findIndex((candidate) => candidate.familyKey === item.familyKey) + 1),
  )
  const harmonyCandidates = status === NATURA_NARRATIVE_STATUS.TRUE_TIE
    ? ranked.filter((item) => item.rawValue !== leader.rawValue).slice(0, 2)
    : ranked.slice(1, 3)
  const harmonyGap = harmonyCandidates.length
    ? Number((
        harmonyCandidates.reduce(
          (sum, item) => sum + percentGap(leader.distributionPercent, item.distributionPercent),
          0,
        ) / harmonyCandidates.length
      ).toFixed(1))
    : null
  const harmonyDescriptor = harmonyGap !== null ? resolveHarmonyDescriptor(harmonyGap) : null
  const harmonyParagraph = harmonyGap !== null
    ? `La distanza media di ${formatPercent(harmonyGap)} punti percentuali tra la famiglia ${leaderCopy.family} e le prime due componenti successive indica ${harmonyDescriptor} nella composizione del profilo.`
    : influenceFamilies.length
      ? 'Non ci sono abbastanza famiglie misurabili per calcolare l\'armonia complessiva del profilo: servono almeno tre famiglie con punti.'
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
      ? 'In questo rapporto non emergono altre componenti misurate accanto alla natura di base.'
      : ''
  const compositionParagraph = influenceFamilies.length
    ? ''
    : status === NATURA_NARRATIVE_STATUS.TRUE_TIE
      ? `Il risultato resta condiviso tra le famiglie ${formatItalianList(topRawFamilies.map((item) => familyCopy(item.familyKey).family))}; nessuna delle due viene trattata come influenza secondaria.`
      : 'Il risultato del rapporto è concentrato interamente sulla famiglia prevalente; nessun’altra famiglia ha ottenuto punti in questa misurazione.'
  const closingParagraph = influenceFamilies.length
    ? 'Questa combinazione non indica una contraddizione: descrive orientamenti che possono alternarsi o combinarsi in modo diverso a seconda delle situazioni.'
    : status === NATURA_NARRATIVE_STATUS.TRUE_TIE
      ? 'La natura di base è quindi composita e conserva il pari peso delle famiglie al vertice.'
    : ranked.length === 1
      ? `Il profilo di questo rapporto resta quindi concentrato sulla famiglia ${leaderCopy.family}.`
      : `Il profilo di questo rapporto resta concentrato intorno alla famiglia ${leaderCopy.family}, pur senza escludere le altre componenti.`
  const shadeFamilyKeys = status === NATURA_NARRATIVE_STATUS.TRUE_TIE
    ? topRawFamilies.map((item) => item.familyKey)
    : [profileFamily.familyKey]
  const shadesParagraph = shadeFamilyKeys
    .map((familyKey) => buildShadesParagraph(shades, familyKey))
    .filter(Boolean)
    .join(' ')
  const storyParagraphs = buildNaturaStoryParagraphs({
    status,
    leader,
    leaderCopy,
    influenceFamilies,
    harmonyGap,
    topRawFamilies,
  })

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
    frontParagraphs: storyParagraphs,
    highlightedFamilies: highlightedFamilies.map((item) => item.familyKey),
    relations,
    harmonyGap,
    harmonyDescriptor,
  }
}
