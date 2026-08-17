import { FAMILY_THEME } from '../config/reportFamilyTheme.js'
import { NATURA_RELATION_RULES } from './buildNaturaNarrative.js'

const THEME_BY_KEY = Object.fromEntries(
  Object.values(FAMILY_THEME).map((theme) => [theme.key, theme]),
)

const RELATION_LABELS = {
  affinity: 'affinità dinamica',
  attenuation: 'attenuazione',
  awareness: 'consapevolezza',
  modulation: 'modulazione',
  tension: 'tensione',
}

const SELF_PRESENCE_BANDS = [
  [40, 'ottima'],
  [30, 'buona'],
  [20, 'discreta'],
  [10, 'parziale'],
  [0, 'limitata'],
]

function sentenceCase(value) {
  const normalized = String(value || '').trim().toLowerCase()
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : ''
}

function familyCopy(familyKey) {
  const theme = THEME_BY_KEY[familyKey] || {}
  return {
    family: theme.family || 'famiglia non disponibile',
    nature: sentenceCase(theme.characteristic || theme.disposition),
  }
}

function formatPercent(value) {
  const numeric = Number(value) || 0
  return String(Number(numeric.toFixed(1))).replace('.', ',')
}

function pairKey(firstKey, secondKey) {
  return [firstKey, secondKey].sort().join('|')
}

function relationBetween(firstKey, secondKey) {
  if (firstKey === secondKey) {
    return {
      kind: 'coincidence',
      label: 'coincidenza',
      copy: 'la famiglia di base e la componente osservata coincidono',
    }
  }
  const rule = NATURA_RELATION_RULES[pairKey(firstKey, secondKey)]
  return rule
    ? { ...rule, label: RELATION_LABELS[rule.kind] || 'relazione' }
    : {
        kind: 'modulation',
        label: 'modulazione',
        copy: 'le due componenti si alternano senza annullarsi',
      }
}

function rankingItem(ranking, familyKey) {
  return ranking.find((item) => item.familyKey === familyKey) || {
    familyKey,
    distributionPercent: 0,
    rawValue: 0,
    valore: 1,
  }
}

function presenceDescriptor(percent) {
  const value = Number(percent) || 0
  return SELF_PRESENCE_BANDS.find(([threshold]) => value >= threshold)?.[1] || 'limitata'
}

const SELF_AWARENESS_PRACTICAL = {
  ottima: 'ti accorgi quasi subito di quello che provi, anche nei momenti più confusi, e questo ti aiuta a capire perché reagisci in un certo modo.',
  buona: 'nella maggior parte dei casi riesci a riconoscere quello che provi, anche se ogni tanto ci metti un po\' a mettere a fuoco cosa ti sta succedendo dentro.',
  discreta: 'a volte capisci subito cosa provi, altre volte te ne accorgi solo più avanti, quando la situazione si è già raffreddata.',
  parziale: 'spesso ti accorgi di quello che provi solo a distanza di tempo, quando il momento più intenso è già passato.',
  limitata: 'fai fatica a riconoscere sul momento quello che provi: te ne rendi conto quasi sempre dopo, ripensandoci.',
}

const SELF_HARMONY_PRACTICAL = {
  ottima: (nature) => `vivi la tua natura ${nature} quasi senza attriti interni: quello che senti e quello che fai vanno nella stessa direzione`,
  buona: (nature) => `nella maggior parte dei casi riesci a seguire la tua natura ${nature} con naturalezza, anche se qualche piccolo contrasto interno resta`,
  discreta: (nature) => `segui la tua natura ${nature} in modo altalenante: certi giorni con naturalezza, altri frenandola senza nemmeno accorgertene`,
  parziale: (nature) => `non sempre riesci a seguire con naturalezza la tua natura ${nature}: capita spesso di frenarla o di contraddirla`,
  limitata: (nature) => `fai fatica a vivere in linea con la tua natura ${nature}: quello che senti e quello che fai vanno spesso in direzioni diverse`,
}

const OTHER_PRACTICAL_BY_GRADE = {
  1: 'ti risulta difficile aprirti subito con chi non conosci: hai bisogno di tempo prima di fidarti davvero.',
  2: 'riesci ad aprirti alle persone nuove, ma di solito solo dopo un primo momento di cautela.',
  3: 'ti risulta abbastanza facile avvicinarti a persone nuove e concedere fiducia senza troppe remore.',
  4: 'ti apri con facilità a persone ed esperienze nuove, e tendi a fidarti anche prima di conoscerle davvero.',
}

const ACTION_PRACTICAL_BY_ADJECTIVE = {
  'molto bassa': 'prima di muoverti hai bisogno di pensarci a lungo: agisci solo quando sei sicuro, e a volte questo ti fa perdere il momento buono.',
  parziale: 'tendi a rimandare l\'azione finché non ti senti abbastanza sicuro: quando decidi, spesso è già passato un po\' di tempo.',
  discreta: 'riesci a passare all\'azione, ma preferisci prenderti il tempo di valutare prima di muoverti.',
  buona: 'quando decidi qualcosa, di solito ti metti in moto senza tirarla troppo per le lunghe.',
  spiccata: 'appena decidi qualcosa ti metti subito in moto: l\'esitazione non è il tuo problema principale.',
  'eccezionalmente alta': 'agisci quasi immediatamente su quello che decidi: la parte difficile, per te, è più fermarti che partire.',
}

function feminineIndefinite(adjective) {
  return /^[aeiouàèéìòóù]/i.test(adjective) ? `un'${adjective}` : `una ${adjective}`
}

function emptyNarrative(copy) {
  return {
    status: 'empty',
    levelLabel: 'Dati insufficienti',
    paragraphs: [copy],
    frontParagraphs: [copy],
    metrics: {},
  }
}

export function resolveRelationalOpenness({ dominantPercent = 0, enthusiasmPercent = 0 } = {}) {
  const enthusiasm = Math.max(0, Number(enthusiasmPercent) || 0)
  const deficit = Math.max(0, (Number(dominantPercent) || 0) - enthusiasm)
  const presenceCap = enthusiasm < 10 ? 1 : enthusiasm < 20 ? 3 : 4
  const distanceGrade = deficit < 10 ? 4 : deficit <= 20 ? 3 : deficit <= 30 ? 2 : 1
  const grade = Math.min(presenceCap, distanceGrade)
  const labels = {
    1: { adjective: 'parziale', badge: 'Propensione parziale all\'apertura e alla fiducia' },
    2: { adjective: 'discreta', badge: 'Discreta propensione all\'apertura e alla fiducia' },
    3: { adjective: 'buona', badge: 'Buona propensione all\'apertura e alla fiducia' },
    4: { adjective: 'ottima', badge: 'Ottima propensione all\'apertura e alla fiducia' },
  }
  return { ...labels[grade], grade, deficit }
}

export function resolveActionPropensity(martialPercent = 0) {
  const percent = Math.max(0, Number(martialPercent) || 0)
  if (percent >= 50) return { adjective: 'eccezionalmente alta', badge: 'Propensione all\'azione eccezionalmente alta' }
  if (percent >= 40) return { adjective: 'spiccata', badge: 'Spiccata propensione all\'azione' }
  if (percent >= 30) return { adjective: 'buona', badge: 'Buona propensione all\'azione' }
  if (percent >= 20) return { adjective: 'discreta', badge: 'Discreta propensione all\'azione' }
  if (percent >= 10) return { adjective: 'parziale', badge: 'Propensione parziale all\'azione' }
  return { adjective: 'molto bassa', badge: 'Propensione all\'azione molto bassa' }
}

export function buildSelfNarrative({ dominantFamilyKey = '', ranking = [] } = {}) {
  const measurable = ranking.filter((item) => (Number(item.rawValue) || 0) > 0)
  if (!measurable.length) {
    return emptyNarrative('Le risposte in Distanze tra le note e Melodia non sono sufficienti per descrivere il rapporto con te stesso.')
  }

  const melancholic = rankingItem(ranking, 'blu')
  const dominant = rankingItem(ranking, dominantFamilyKey)
  const dominantCopy = familyCopy(dominantFamilyKey)
  const awareness = presenceDescriptor(melancholic.distributionPercent)
  const harmony = presenceDescriptor(dominant.distributionPercent)
  const relation = relationBetween('blu', dominantFamilyKey)
  const sameFamily = dominantFamilyKey === 'blu'

  const relationParagraph = sameFamily
    ? `La tua famiglia di base è Malinconica.`
    : `La relazione tra Malinconica e ${dominantCopy.family} è di ${relation.label}: ${relation.copy}.`

  const awarenessPractical = SELF_AWARENESS_PRACTICAL[awareness] || ''
  const harmonyPractical = SELF_HARMONY_PRACTICAL[harmony]?.(dominantCopy.nature) || ''
  const practicalParagraph = awarenessPractical && harmonyPractical
    ? `In pratica ${awarenessPractical} Sul piano dei comportamenti, ${harmonyPractical}.`
    : ''

  return {
    status: 'ready',
    levelLabel: `Consapevolezza ${awareness} · armonia ${harmony}`,
    frontParagraphs: [
      'La Malinconica fa da ago della bilancia in questo rapporto: misura la tua consapevolezza, cioè quanto riesci a riconoscere e abitare ciò che senti.',
      [
        `Nel tuo profilo emerge ${feminineIndefinite(awareness)} capacità di ascolto di sé e ${feminineIndefinite(harmony)} propensione a vivere in armonia con la tua natura ${dominantCopy.nature}.`,
        practicalParagraph,
      ].filter(Boolean).join(' '),
    ],
    paragraphs: [
      `La Malinconica fa da ago della bilancia in questo rapporto: misura la tua consapevolezza, cioè quanto riconosci ciò che vivi interiormente. Nel tuo profilo raggiunge il ${formatPercent(melancholic.distributionPercent)}%, ${feminineIndefinite(awareness)} capacità di osservarti dentro.`,
      `${dominantCopy.family} — la tua natura di base (${dominantCopy.nature}) — mostra ${feminineIndefinite(harmony)} propensione a viverla in armonia. ${relationParagraph}`,
    ],
    metrics: {
      awarenessPercent: melancholic.distributionPercent,
      harmonyPercent: dominant.distributionPercent,
      dominantFamilyKey,
      relationKind: relation.kind,
      sameFamily,
    },
  }
}

export function buildOtherNarrative({ dominantFamilyKey = '', ranking = [] } = {}) {
  const measurable = ranking.filter((item) => (Number(item.rawValue) || 0) > 0)
  if (!measurable.length) {
    return emptyNarrative("Le risposte in Suono e Melodia non sono sufficienti per descrivere il rapporto con l'Altro.")
  }

  const enthusiasm = rankingItem(ranking, 'giallo')
  const dominant = rankingItem(ranking, dominantFamilyKey)
  const dominantCopy = familyCopy(dominantFamilyKey)
  const result = resolveRelationalOpenness({
    dominantPercent: dominant.distributionPercent,
    enthusiasmPercent: enthusiasm.distributionPercent,
  })
  const relation = relationBetween('giallo', dominantFamilyKey)
  const sameFamily = dominantFamilyKey === 'giallo'
  const signedDifference = Number((
    (Number(dominant.distributionPercent) || 0) -
    (Number(enthusiasm.distributionPercent) || 0)
  ).toFixed(1))
  const comparisonCopy = signedDifference > 0
    ? `La componente ${dominantCopy.family} resta in vantaggio sull'Entusiasmo.`
    : signedDifference < 0
      ? `L'Entusiasmo supera la componente ${dominantCopy.family}.`
      : `Le due componenti hanno un peso equivalente nel profilo.`

  const intros = {
    rosso: 'La tua famiglia emotiva presenta come elemento caratteristico una certa competitività nel rapporto con gli altri.',
    blu: 'La tua famiglia emotiva orienta una parte importante dell’esperienza verso l’interiorità e la riflessione.',
    verde: 'La tua famiglia emotiva tende alla calma, alla prudenza e all’attesa nel rapporto con gli altri.',
    giallo: 'La tua famiglia emotiva è naturalmente orientata al movimento, alla scoperta e all’apertura verso gli altri.',
    grigio: 'La tua famiglia emotiva tende a osservare il rapporto con gli altri con distanza e controllo.',
  }

  const otherPractical = OTHER_PRACTICAL_BY_GRADE[result.grade] || ''

  return {
    status: 'ready',
    levelLabel: result.badge,
    frontParagraphs: [
      `L'Entusiasmo fa da ago della bilancia in questo rapporto: misura la tua apertura verso l'altro, il coraggio di incontrare persone ed esperienze nuove.`,
      [
        `Nel tuo profilo, la relazione con la componente ${dominantCopy.family} è di ${relation.label}: il test rivela una ${result.adjective} propensione all'ascolto e alla fiducia.`,
        otherPractical ? `In pratica ${otherPractical}` : '',
      ].filter(Boolean).join(' '),
    ],
    paragraphs: sameFamily
      ? [
          `L'Entusiasmo fa da ago della bilancia in questo rapporto ed è anche la tua natura di base. Nel tuo profilo raggiunge il ${formatPercent(enthusiasm.distributionPercent)}%: il risultato rivela ${feminineIndefinite(result.adjective)} propensione all'ascolto del prossimo e alla fiducia.`,
        ]
      : [
          `L'Entusiasmo fa da ago della bilancia in questo rapporto: misura la tua apertura verso l'altro, il coraggio di incontrare persone ed esperienze nuove. Nel tuo profilo raggiunge il ${formatPercent(enthusiasm.distributionPercent)}%.`,
          `${intros[dominantFamilyKey] || `La tua natura ${dominantCopy.nature} definisce il modo spontaneo in cui incontri gli altri.`} ${comparisonCopy}`,
          `La relazione tra ${dominantCopy.family} ed Entusiasta è di ${relation.label}: ${relation.copy}. Il risultato rivela ${feminineIndefinite(result.adjective)} propensione all'ascolto del prossimo e alla fiducia.`,
        ],
    metrics: {
      enthusiasmPercent: enthusiasm.distributionPercent,
      dominantPercent: dominant.distributionPercent,
      deficit: result.deficit,
      signedDifference,
      dominantFamilyKey,
      relationKind: relation.kind,
      grade: result.grade,
      sameFamily,
    },
  }
}

const ACTION_CONTEXT_BY_FAMILY = {
  rosso: {
    relation: 'rapporto simbiotico',
    copy: 'La natura Volitivo-collerica ha un rapporto simbiotico con la volontà. È l’elemento che la caratterizza, in quanto coinvolge direttamente l’azione dell’Io, la forza che opera per realizzare i propri obiettivi.',
  },
  blu: {
    relation: 'consapevolezza',
    copy: 'La natura Lunare tende a elaborare interiormente ciò che vive prima di trasformarlo in azione. La componente Marziale introduce volontà, decisione e capacità di realizzazione, che la propensione alla riflessione rende più consapevoli.',
  },
  verde: {
    relation: 'tensione',
    copy: 'La natura Contemplativa ricerca calma, moderazione e continuità, mentre la componente Marziale spinge verso decisione, iniziativa e realizzazione. Tra le due forze esiste una tensione tra il bisogno di pausa e la volontà di agire.',
  },
  giallo: {
    relation: 'affinità dinamica',
    copy: 'La natura di tipo Gioioso-sanguinico condivide con la componente Marziale il piacere del movimento, dello slancio e dell’iniziativa. L’Entusiasmo apre nuove possibilità, mentre la Volitività sostiene la decisione e la capacità di portarle a compimento.',
  },
  grigio: {
    relation: 'tensione',
    copy: 'La natura Intellettuale-razionale tende a valutare l’esperienza attraverso osservazione, calcolo e controllo. La componente Marziale introduce invece decisione, volontà e capacità di intervenire concretamente.',
  },
}

export function buildActionNarrative({ dominantFamilyKey = '', ranking = [] } = {}) {
  const measurable = ranking.filter((item) => (Number(item.rawValue) || 0) > 0)
  if (!measurable.length) {
    return emptyNarrative("Le risposte in Tempo e Melodia non sono sufficienti per descrivere il rapporto con l'Agire.")
  }

  const martial = rankingItem(ranking, 'rosso')
  const result = resolveActionPropensity(martial.distributionPercent)
  const context = ACTION_CONTEXT_BY_FAMILY[dominantFamilyKey] || ACTION_CONTEXT_BY_FAMILY.rosso
  const actionPractical = ACTION_PRACTICAL_BY_ADJECTIVE[result.adjective] || ''

  return {
    status: 'ready',
    levelLabel: result.badge,
    frontParagraphs: [
      `Il Marziale fa da ago della bilancia in questo rapporto: misura la tua propensione a trasformare il sentire in azione, decisione e iniziativa.`,
      [
        context.copy,
        `Nel tuo profilo raggiunge il ${formatPercent(martial.distributionPercent)}%: il test rivela una ${result.adjective} propensione all'azione.`,
        actionPractical ? `In pratica ${actionPractical}` : '',
      ].filter(Boolean).join(' '),
    ],
    paragraphs: [
      context.copy,
      `Nel tuo profilo raggiunge il ${formatPercent(martial.distributionPercent)}%: il test rivela ${feminineIndefinite(result.adjective)} propensione all'azione.`,
    ],
    metrics: {
      martialPercent: martial.distributionPercent,
      dominantFamilyKey,
      relationLabel: context.relation,
    },
  }
}
