import { FAMILY_THEME } from '../config/reportFamilyTheme.js'
import { NATURA_RELATION_RULES } from './buildNaturaNarrative.js'

const THEME_BY_KEY = Object.fromEntries(
  Object.values(FAMILY_THEME).map((theme) => [theme.key, theme]),
)

const RELATION_LABELS = {
  affinity: 'affinità dinamica',
  attenuation: 'attenuazione',
  compensation: 'compensazione',
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

function feminineIndefinite(adjective) {
  return /^[aeiouàèéìòóù]/i.test(adjective) ? `un'${adjective}` : `una ${adjective}`
}

function emptyNarrative(copy) {
  return {
    status: 'empty',
    levelLabel: 'Dati insufficienti',
    paragraphs: [copy],
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
    return emptyNarrative('Le risposte in Intervalli e Melodia non sono sufficienti per descrivere il rapporto con te stesso.')
  }

  const melancholic = rankingItem(ranking, 'blu')
  const dominant = rankingItem(ranking, dominantFamilyKey)
  const dominantCopy = familyCopy(dominantFamilyKey)
  const awareness = presenceDescriptor(melancholic.distributionPercent)
  const harmony = presenceDescriptor(dominant.distributionPercent)
  const relation = relationBetween('blu', dominantFamilyKey)
  const sameFamily = dominantFamilyKey === 'blu'

  const relationParagraph = sameFamily
    ? `Poiché la tua famiglia di base è Malinconica, osservazione interiore e natura prevalente convergono nello stesso valore: non sono due misure indipendenti.`
    : `La relazione tra Malinconica e ${dominantCopy.family} è di ${relation.label}: ${relation.copy}.`

  return {
    status: 'ready',
    levelLabel: `Consapevolezza ${awareness} · armonia ${harmony}`,
    paragraphs: [
      'Questa lente osserva la consapevolezza della tua natura di base. Nel definire il rapporto con te stesso svolge un ruolo determinante la corrente Malinconica, ovvero la capacità di sentire viva e operante la forza prevalente nella propria interiorità.',
      `Nel tuo profilo la componente Malinconica raggiunge il ${formatPercent(melancholic.distributionPercent)}%: il risultato indica ${feminineIndefinite(awareness)} propensione a osservare e riconoscere ciò che vivi interiormente.`,
      `La componente ${dominantCopy.family}, associata alla natura ${dominantCopy.nature}, raggiunge il ${formatPercent(dominant.distributionPercent)}% e rivela ${feminineIndefinite(harmony)} propensione a vivere in armonia con la tua natura di base.`,
      relationParagraph,
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
    return emptyNarrative("Le risposte in Timbro e Melodia non sono sufficienti per descrivere il rapporto con l'Altro.")
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
    ? `La distanza a sfavore dell'Entusiasmo è di ${formatPercent(signedDifference)} punti percentuali.`
    : signedDifference < 0
      ? `L'Entusiasmo supera la componente ${dominantCopy.family} di ${formatPercent(Math.abs(signedDifference))} punti percentuali.`
      : `Le due componenti hanno la stessa presenza percentuale.`

  const intros = {
    rosso: 'La tua famiglia emotiva presenta come elemento caratteristico una certa competitività nel rapporto con gli altri.',
    blu: 'La tua famiglia emotiva orienta una parte importante dell’esperienza verso l’interiorità e la riflessione.',
    verde: 'La tua famiglia emotiva tende alla calma, alla prudenza e all’attesa nel rapporto con gli altri.',
    giallo: 'La tua famiglia emotiva è naturalmente orientata al movimento, alla scoperta e all’apertura verso gli altri.',
    grigio: 'La tua famiglia emotiva tende a osservare il rapporto con gli altri con distanza e controllo.',
  }

  return {
    status: 'ready',
    levelLabel: result.badge,
    paragraphs: [
      `${intros[dominantFamilyKey] || `La tua natura ${dominantCopy.nature} definisce il modo spontaneo in cui incontri gli altri.`} Questa lente osserva però quanto la corrente dell'Entusiasmo sia presente nel tuo profilo.`,
      `L'Entusiasmo è un fattore determinante: sostiene il coraggio di incontrare persone ed esperienze nuove e favorisce atteggiamenti di apertura, ascolto e comprensione delle diversità altrui.`,
      sameFamily
        ? `Nel tuo profilo la famiglia di base e il fattore relazionale coincidono: la componente Entusiasta raggiunge il ${formatPercent(enthusiasm.distributionPercent)}%.`
        : `Nel tuo profilo l'Entusiasmo raggiunge il ${formatPercent(enthusiasm.distributionPercent)}%, mentre la componente ${dominantCopy.family} raggiunge il ${formatPercent(dominant.distributionPercent)}%. ${comparisonCopy}`,
      sameFamily
        ? `Questa coincidenza rafforza la continuità tra natura di base e apertura relazionale. Il risultato del test rivela una ${result.adjective} propensione all'ascolto del prossimo e a instaurare rapporti fondati sulla fiducia.`
        : `La relazione tra ${dominantCopy.family} ed Entusiasta è di ${relation.label}: ${relation.copy}. Il risultato del test rivela una ${result.adjective} propensione all'ascolto del prossimo e a instaurare rapporti fondati sulla fiducia.`,
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
    relation: 'compensazione',
    copy: 'La natura Lunare tende a elaborare interiormente ciò che vive prima di trasformarlo in azione. La componente Marziale introduce volontà, decisione e capacità di realizzazione, compensando la naturale propensione alla riflessione.',
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
    return emptyNarrative("Le risposte in Ritmo e Melodia non sono sufficienti per descrivere il rapporto con l'Agire.")
  }

  const martial = rankingItem(ranking, 'rosso')
  const result = resolveActionPropensity(martial.distributionPercent)
  const context = ACTION_CONTEXT_BY_FAMILY[dominantFamilyKey] || ACTION_CONTEXT_BY_FAMILY.rosso

  return {
    status: 'ready',
    levelLabel: result.badge,
    paragraphs: [
      `Questa lente osserva il rapporto con l'Agire. ${context.copy}`,
      `La componente Marziale raggiunge il ${formatPercent(martial.distributionPercent)}%. Quanto più è alta la Volitività, tanto più forti e incisive tendono a essere le azioni che si compiono nella vita.`,
      `Il test rivela una ${result.adjective} propensione all'azione.`,
    ],
    metrics: {
      martialPercent: martial.distributionPercent,
      dominantFamilyKey,
      relationLabel: context.relation,
    },
  }
}
