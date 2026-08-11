/**
 * Adattatore `reportData` per il Report TST.
 *
 * Costruisce un'unica struttura dati `reportData`, consumata da `ReportShell`
 * (root `ReportTST`) e poi distribuita ai componenti di presentazione
 * (HeroScreen, SintesiCorrenti, ProfiloEmotivo, QuattroRapporti,
 * SezionePortatoEsperienziale, ParoleStatiAnimo).
 *
 * REGOLA FONDAMENTALE: non vengono inventati numeri di scoring. Tutti i pesi e i
 * punteggi derivano dai calcoli già effettuati a monte (computeColorTotals /
 * normalizeLevels / Blocco C dei portati) e dai massimi teorici di testLogic.
 * I campi narrativi mancanti usano fallback ragionevoli, marcati in `_fallbacks`.
 *
 * Forma di `reportData`:
 * {
 *   utente: { nome },
 *   profilo: { natura, disposizione, famiglia, correnteDominante, fraseChiave, focus, colore },
 *   correnti: [{                       // 5 famiglie — familyKey sempre esplicito, mai dedurre dal colore
 *     familyKey, familyName, nome, label, colore,
 *     valoreAssoluto,                  // punteggio grezzo della famiglia (raw points)
 *     peso,                            // percentuale share-of-whole: le 5 famiglie sommano a 100 (0 se tutte a zero)
 *     scala1a7,                        // valore normalizzato 1-7 per il radar (stessa formula già in uso)
 *     statiAnimo[], sottoCorrenti[],
 *   }],
 *   correntiByPeso: [...correnti] ordinato per peso decrescente,
 *   sottocorrenti: [{                  // 11 correnti — familyKey sempre esplicito
 *     rawKey, nome, familyName, familyKey, valore, maxTeorico,
 *     misurabile,                      // false se maxTeorico è 0: nessuna risposta del test può valorizzare questa corrente
 *                                       // (oggi solo GRIGIO_2_Intellettuale_Saggio) — non trattare come "0% di presenza reale"
 *     percentuale, intervalNote,
 *   }],
 *   profiloEmotivo: { sezioni: [{ id, label, titolo, testo, correnteColore, correnteSecondaria? }] },
 *   approfondimento: { sezioniData, sezioniTest },
 *   rapporti: [{ id, nome, definizione, composizione, cosaIndica, correntePrincipale{nome,colore,familyKey}, datiRadar[{corrente,familyKey,valore}] }],
 *   punteggi: { simpatia, antipatia, indifferenza },
 *   portato: {
 *     simpatia, antipatia, indifferenza,
 *     prevalente, prevalenteLabel, descrizione, vitalita, sintesiInterpretativa,
 *     quoteNormalizzate: { Simpatia, Antipatia, Indifferenza },
 *     pad: { vertici, punto, quote },
 *     dimensioni: [{ key, label, valore, percentuale, quotaNormalizzata, definizioneBreve }],
 *   },
 *   statiAnimo: [{ parola, corrente, colore, peso }],
 *   sottodisposizionePrevalente,        // fonte unica: usa il valore salvato se coerente con la famiglia
 *                                       // dominante ricalcolata, altrimenti lo deriva — vedi resolveSottodisposizionePrevalente
 *   sintesi: { paragrafi: string[], testo: string, datiRadar: [{ corrente, familyKey, valore }] }, // valore = scala1a7, NON peso
 *   coloriCorrenti: { [nome]: hex },
 *   rawRecord,
 *   _fallbacks: string[],
 * }
 */

import reportContent from '../content_report.json'
import { computeColorTotals, computeSezioniTotalsFromRaw, computeRelativePercentages, normalizeLevels } from './reportRecordUtils.js'
import { THEORETICAL_MAX_COLOR_TOTALS } from '../testLogic.js'
import {
  FAMILY_ORDER,
  FAMILY_THEME,
  FAMILY_NAME_BY_KEY,
  getFamilyTheme,
  getPersonalizedTitles,
} from '../config/reportFamilyTheme'
import { PROFILE_PDF_BLOCKS } from '../reportProfiloPdf.js'
import { getFamigliaApprofondimento } from '../content/famigliaApprofondimento.js'
import { buildIntegrativeParagraphs, buildSintesiLead, buildSintesiKeyFacts, buildSintesiLeadExtended } from '../content/reportRestitution.js'
import {
  FAMIGLIE_LESSICO,
  getFamigliaLessico,
  getFullLessicoForFamily,
} from '../content/statiAnimoLessico.js'
import {
  computeScoreDeltaForAnswer,
  getLogicTypeForFile,
  THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY,
} from '../testLogic.js'
import { RAW_DOC_VISUAL } from '../config/galaxyDocBridge.ts'

const PESO_RANK_LABEL = ['dominante', 'secondaria', 'minore', 'marginale', 'marginale']

const SOTTOCORRENTE_META = [
  { rawKey: 'BLU_1_Depressiva', familyName: 'Blu', familyKey: 'blu' },
  { rawKey: 'BLU_2_Lunare', familyName: 'Blu', familyKey: 'blu' },
  { rawKey: 'BLU_3_Nostalgia', familyName: 'Blu', familyKey: 'blu' },
  { rawKey: 'BLU_4_Solare', familyName: 'Blu', familyKey: 'blu' },
  { rawKey: 'ROSSO_1_Assertivita', familyName: 'Rosso', familyKey: 'rosso' },
  { rawKey: 'ROSSO_2_Dubbio_Collera', familyName: 'Rosso', familyKey: 'rosso' },
  { rawKey: 'VERDE_1_Calma', familyName: 'Verde', familyKey: 'verde' },
  { rawKey: 'GIALLO_1_Gioia_Entusiasmo', familyName: 'Giallo', familyKey: 'giallo' },
  { rawKey: 'GIALLO_2_Volitivo_Passionale', familyName: 'Giallo', familyKey: 'giallo' },
  { rawKey: 'GRIGIO_1_Distaccato_Nichilista', familyName: 'Grigio', familyKey: 'grigio' },
  { rawKey: 'GRIGIO_2_Intellettuale_Saggio', familyName: 'Grigio', familyKey: 'grigio' },
]

const SOTTOCORRENTE_LABEL_BY_RAW_KEY = {
  BLU_1_Depressiva: 'Depressiva',
  BLU_2_Lunare: 'Lunare',
  BLU_3_Nostalgia: 'Nostalgica',
  BLU_4_Solare: 'Solare',
  ROSSO_1_Assertivita: 'Assertività',
  ROSSO_2_Dubbio_Collera: 'Dubbio / Collera',
  VERDE_1_Calma: 'Calma',
  GIALLO_1_Gioia_Entusiasmo: 'Gioia / Entusiasmo',
  GIALLO_2_Volitivo_Passionale: 'Volitivo / Passionale',
  GRIGIO_1_Distaccato_Nichilista: 'Distaccato / Nichilista',
  GRIGIO_2_Intellettuale_Saggio: 'Intellettuale / Saggio',
}

function buildProfilo23Text(familyName, panelId) {
  const approfondimento =
    getFamigliaApprofondimento(familyName) || getFamigliaApprofondimento('Verde')

  if (panelId === 'natura') {
    return (approfondimento.natura || []).join('\n\n')
  }

  if (panelId === 'racconto') {
    return (approfondimento.racconto || []).join('\n\n')
  }

  if (panelId === 'risorse') {
    return (approfondimento.qualita || []).join('\n\n')
  }

  if (panelId === 'ombre') {
    return (approfondimento.ombre || []).join('\n\n')
  }

  return ''
}

const FINAL_STATE_LABELS = {
  SA_SERENO: 'Sereno/a',
  SA_CURIOSO: 'Curioso/a',
  SA_SOLLEVATO: 'Sollevato/a',
  SA_COINVOLTO: 'Coinvolto/a',
  SA_RIFLESSIVO: 'Riflessivo/a',
  SA_STANCO: 'Stanco/a',
  SA_TESO: 'Teso/a',
  SA_CONFUSO: 'Confuso/a',
}

const DIFFICOLTA_LABELS = {
  DT_NO: 'No',
  DT_SI: 'Sì',
}

const DIFFICOLTA_DETTAGLIO_LABELS = {
  DD_CONCENTRAZIONE: 'Concentrazione / attenzione',
  DD_COMPRENSIONE: 'Comprensione delle sensazioni richieste',
  DD_VOLUMI: 'Volume / timbro dei suoni',
  DD_DURATA: 'Durata complessiva del test',
  DD_CONTESTO: 'Ambiente esterno (rumori/interruzioni)',
  DD_TECNICA: 'Aspetti tecnici (audio, cuffie, device)',
}

const AREA_TEST_META = {
  A: { code: 'A', nome: 'Timbro', range: 'File 1-28' },
  B: { code: 'B', nome: 'Intervalli', range: 'File 29-41' },
  C: { code: 'C', nome: 'Ritmo', range: 'File 42-51' },
  D: { code: 'D', nome: 'Melodia', range: 'File 52-58' },
  E: { code: 'E', nome: 'Armonia', range: 'File 59-72' },
}

const QUALITA_SUONI_LABELS = {
  QS_OTTIMI: 'Ottimi',
  QS_BUONI: 'Buoni',
  QS_SUFFICIENTI: 'Sufficienti',
  QS_PESSIMI: 'Pessimi',
}

function rawKeyToLabel(rawKey) {
  return String(rawKey || '')
    .split('_')
    .slice(2)
    .join(' ')
    .replaceAll('_', ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function normalizeSottocorrenteLabel(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function resolveSottodisposizionePrevalente(rawRecord = {}, dominantColorName) {
  const familyKey = getFamilyTheme(dominantColorName)?.key
  const candidateKeys = SOTTOCORRENTE_META
    .filter((meta) => meta.familyKey === familyKey)
    .map((meta) => meta.rawKey)
  if (candidateKeys.length === 0) return ''

  const saved = rawRecord.Sottodisposizione_Prevalente || ''
  const savedNormalized = normalizeSottocorrenteLabel(saved)
  const savedKeyInFamily = candidateKeys.find((key) => {
    const aliases = [
      key,
      SOTTOCORRENTE_LABEL_BY_RAW_KEY[key],
      rawKeyToLabel(key),
    ]
    return aliases.some((alias) => normalizeSottocorrenteLabel(alias) === savedNormalized)
  })
  if (savedKeyInFamily) {
    return SOTTOCORRENTE_LABEL_BY_RAW_KEY[savedKeyInFamily] || rawKeyToLabel(savedKeyInFamily)
  }

  let bestKey = ''
  let bestValue = -Infinity
  candidateKeys.forEach((key) => {
    const value = Number(rawRecord[key]) || 0
    if (value > bestValue) {
      bestValue = value
      bestKey = key
    }
  })

  if (!bestKey || bestValue <= 0) return ''
  return SOTTOCORRENTE_LABEL_BY_RAW_KEY[bestKey] || rawKeyToLabel(bestKey)
}

function parseCsvCodes(value) {
  return String(value || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean)
}

function resolveCodeList(value, labels) {
  return parseCsvCodes(value).map((code) => ({
    code,
    label: labels[code] || code,
  }))
}

function resolveSingleCode(value, labels) {
  const code = String(value || '').trim()
  if (!code) return null
  return { code, label: labels[code] || code }
}

function resolveAreaList(value) {
  return parseCsvCodes(value).map((code) => AREA_TEST_META[code] || { code, nome: code, range: '' })
}

function buildSottocorrenti(rawRecord = {}) {
  return SOTTOCORRENTE_META.map((meta) => {
    const doc = RAW_DOC_VISUAL[meta.rawKey] || {}
    const theme = FAMILY_THEME[meta.familyName]
    const valore = Number(rawRecord?.[meta.rawKey]) || 0
    const max = Number(THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY?.[meta.rawKey]) || 0
    // Se il massimo teorico è 0 (nessuna risposta del test può mai valorizzare
    // questa corrente — es. GRIGIO_2_Intellettuale_Saggio), la percentuale resta 0
    // ma `misurabile: false` distingue esplicitamente "non misurato dal test" da
    // "misurato, punteggio pari a zero": la UI non deve trattarli come equivalenti.
    const misurabile = max > 0
    const percentuale = misurabile ? Math.round(Math.min(100, Math.max(0, (valore / max) * 100))) : 0

    return {
      rawKey: meta.rawKey,
      nome: SOTTOCORRENTE_LABEL_BY_RAW_KEY[meta.rawKey] || rawKeyToLabel(meta.rawKey),
      familyName: meta.familyName,
      familyKey: meta.familyKey,
      corrente: theme?.corrente || meta.familyName,
      macroLabel: theme?.macro || meta.familyName,
      colore: doc.accentHex || theme?.dot || '#94a3b8',
      shadeLabel: doc.shadeLabel || '',
      intervalNote: doc.intervalNote || '',
      valore,
      maxTeorico: max,
      misurabile,
      percentuale,
      criterioPercentuale: 'attivazione',
    }
  }).sort((a, b) => {
    if (b.percentuale !== a.percentuale) return b.percentuale - a.percentuale
    return b.valore - a.valore
  })
}

function buildFiltroMusicale(rawRecord = {}) {
  const filtro = {
    statoAnimoFinale: resolveCodeList(rawRecord.Stato_Animo_Finale, FINAL_STATE_LABELS),
    difficolta: resolveSingleCode(rawRecord.Difficolta_Test, DIFFICOLTA_LABELS),
    difficoltaDettaglio: resolveCodeList(rawRecord.Difficolta_Dettaglio, DIFFICOLTA_DETTAGLIO_LABELS),
    areeMaggiorAgio: resolveAreaList(rawRecord.Area_Maggior_Agio),
    areeMinorAgio: resolveAreaList(rawRecord.Area_Minor_Agio),
    qualitaSuoni: resolveSingleCode(rawRecord.Qualita_Suoni, QUALITA_SUONI_LABELS),
  }

  filtro.hasData = Boolean(
    filtro.statoAnimoFinale.length ||
      filtro.difficolta ||
      filtro.difficoltaDettaglio.length ||
      filtro.areeMaggiorAgio.length ||
      filtro.areeMinorAgio.length ||
      filtro.qualitaSuoni,
  )

  return filtro
}

function buildSintesiNarrative(args) {
  return buildIntegrativeParagraphs(args)
}

const PORTATO_ORDER = ['Simpatia', 'Antipatia', 'Indifferenza']

const PORTATO_PRESENTATION_LABELS = {
  Simpatia: 'Sintonia',
  Antipatia: 'Distonia',
  Indifferenza: 'Distanza',
}

const PORTATO_PAD_VERTICES = {
  Simpatia: { x: 0, y: 0 },
  Antipatia: { x: 1, y: 0 },
  Indifferenza: { x: 0.5, y: 1 },
}

// Soglie editoriali per il solo linguaggio di restituzione; non modificano lo scoring.
const PORTATO_PRESENTATION_THRESHOLDS = {
  nearShare: 0.08,
  nearlyAbsent: 0.05,
  contained: 0.15,
}

function normalizePortatoValue(value) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0
}

function buildPortatoSynthesis(quoteNormalizzate, hasData) {
  if (!hasData) {
    return 'Per questo ascolto non ci sono dati sufficienti per descrivere sintonia, distonia e distanza.'
  }

  const ranked = PORTATO_ORDER
    .map((key, index) => ({
      key,
      index,
      label: PORTATO_PRESENTATION_LABELS[key].toLowerCase(),
      quota: quoteNormalizzate[key],
    }))
    .sort((a, b) => b.quota - a.quota || a.index - b.index)
  const [first, second, third] = ranked

  if (first.quota - third.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearShare) {
    return 'In questo ascolto sintonia, distonia e distanza sono emerse con quote molto vicine: il contenuto musicale ha generato una compresenza delle tre modalità, senza una nettamente prevalente.'
  }

  if (first.quota - second.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearShare) {
    const thirdClause = third.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearlyAbsent
      ? `la ${third.label} è rimasta quasi assente`
      : third.quota <= PORTATO_PRESENTATION_THRESHOLDS.contained
        ? `la ${third.label} è emersa in misura contenuta`
        : `la ${third.label} ha avuto una presenza più contenuta`
    return `In questo ascolto ${first.label} e ${second.label} sono emerse con intensità simile; ${thirdClause}. Il contenuto musicale ha quindi generato un orientamento misto, senza una sola modalità nettamente prevalente.`
  }

  const secondaryClause = second.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearlyAbsent
    ? `la ${second.label} è rimasta quasi assente`
    : second.quota <= PORTATO_PRESENTATION_THRESHOLDS.contained
      ? `la ${second.label} è emersa in misura contenuta`
      : `è presente anche una componente di ${second.label}`
  const thirdClause = third.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearlyAbsent
    ? `la ${third.label} è rimasta quasi assente`
    : third.quota <= PORTATO_PRESENTATION_THRESHOLDS.contained
      ? `la ${third.label} è emersa in misura contenuta`
      : `è presente anche una componente di ${third.label}`

  return `In questo ascolto hai mostrato soprattutto ${first.label} nella relazione con il contenuto musicale; ${secondaryClause}, mentre ${thirdClause}.`
}


function titleCaseStato(word) {
  const t = String(word || '').trim()
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

function lowerInitial(value) {
  const t = String(value || '').trim()
  if (!t) return ''
  return t.charAt(0).toLowerCase() + t.slice(1).toLowerCase()
}

/**
 * Coppie emotivamente contrastanti (secondo il modello TST).
 * Se entrambe le famiglie di una coppia sono alte e il gap è piccolo,
 * il profilo va descritto come "compresenza" non come "equilibrio".
 */
export const CONTRASTING_PAIRS = [
  ['blu', 'rosso'],   // Malinconia vs Volitiva
  ['giallo', 'grigio'], // Entusiasmo vs Anaffettiva
  ['verde', 'rosso'], // Flemma vs Volitiva
]

/**
 * Controlla se due famiglie contrastanti sono quasi pari (gap ≤ 1 su scala 1-7)
 * e la minore è comunque significativa (>= 4).
 * @param {object} levels — es. { blu: 7, rosso: 6, verde: 2, giallo: 3, grigio: 2 }
 * @returns {{ isContrasting: boolean, pairKeys: string[] }|null}
 */
export function detectContrastingPresence(levels = {}) {
  for (const [keyA, keyB] of CONTRASTING_PAIRS) {
    const a = Number(levels[keyA]) || 0
    const b = Number(levels[keyB]) || 0
    const higher = Math.max(a, b)
    const lower = Math.min(a, b)
    if (lower >= 4 && (higher - lower) <= 1) {
      return { isContrasting: true, pairKeys: [keyA, keyB] }
    }
  }
  return null
}

/**
 * Calcola il gap tra il valore dominante e il secondo valore più alto.
 * @param {object} levels
 * @param {string} dominantKey — chiave famiglia dominante (es. 'blu')
 */
function resolveNaturaBelongingLabel(value) {
  const v = Number(value) || 0
  if (v >= 6) return 'profonda appartenenza'
  if (v >= 5) return 'empatica appartenenza'
  if (v >= 4) return 'simpatia'
  return 'tendenza'
}

/**
 * Restituisce il levelLabel da mostrare nel tag visivo della Prospettiva 1.
 */
function resolveNaturaLevelLabel(levels = {}) {
  const contrasting = detectContrastingPresence(levels)
  if (contrasting) return 'Profilo composito — compresenza emotiva'

  const values = Object.values(levels).map((v) => Number(v) || 0).filter((v) => v > 0)
  if (!values.length) return 'Equilibrio discreto'

  const spread = Math.max(...values) - Math.min(...values)
  if (spread <= 1) return 'Eccellente equilibrio emotivo'
  if (spread <= 2) return 'Buon equilibrio emotivo'
  if (spread <= 3) return 'Discreto equilibrio emotivo'
  return 'Aderenza alla tua famiglia emotiva: alta'
}

function resolveNaturaBalanceLabel(levels = {}) {
  const contrasting = detectContrastingPresence(levels)
  if (contrasting) {
    return 'una compresenza di componenti in tensione, che conferisce profondità ma anche complessità al profilo emotivo'
  }

  const values = Object.values(levels)
    .map((value) => Number(value) || 0)
    .filter((value) => value > 0)

  if (!values.length) {
    return 'un discreto equilibrio emotivo'
  }

  const spread = Math.max(...values) - Math.min(...values)
  if (spread <= 1) return 'un eccellente equilibrio emotivo'
  if (spread <= 2) return 'un buon equilibrio emotivo'
  if (spread <= 3) return 'un discreto equilibrio emotivo'
  return 'una tendenza ad avere uno sguardo poco lucido sullo stato emotivo'
}

function buildNaturaBaseText({ dispositionLabel, dominantLevel, levels }) {
  const famiglia = lowerInitial(dispositionLabel)
  const appartenenza = resolveNaturaBelongingLabel(dominantLevel)
  const equilibrio = resolveNaturaBalanceLabel(levels)
  const contrasting = detectContrastingPresence(levels)

  const terzoperiodo = contrasting
    ? `Il test rivela anche la presenza delle altre disposizioni e, in questo profilo, indica ${equilibrio}.`
    : `Il test rivela anche la presenza delle altre disposizioni e, nonostante una tendenza temperamentale ${famiglia}, indica ${equilibrio}.`

  return [
    `Il test conferma la tua appartenenza alla famiglia ${famiglia}: timbro, melodia e armonia convergono nel riconoscere questa natura emotiva di base.`,
    `Questa parte rivela quanta sintonia hai con la famiglia ${famiglia}: nel tuo caso emerge una ${appartenenza}.`,
    terzoperiodo,
  ].join(' ')
}

/**
 * Restituisce il levelLabel da mostrare nel tag visivo della Prospettiva 2.
 */
function resolveSelfLevelLabel(dominantLevel, levels = {}) {
  const contrasting = detectContrastingPresence(levels)
  const v = Number(dominantLevel) || 0

  if (contrasting) return 'Profilo complesso — consapevolezza articolata'
  if (v >= 6) return 'Eccellente capacità di vivere in armonia con la natura'
  if (v >= 5) return 'Buona capacità di vivere in armonia con la natura'
  if (v >= 4) return 'Discreta capacità di vivere in armonia con la natura'
  return 'Tendenza parziale a vivere in armonia con la natura'
}

function resolveSelfHarmonyLabel(value) {
  const v = Number(value) || 0
  if (v >= 6) return 'una eccellente capacità di vivere in armonia con la tua natura'
  if (v >= 5) return 'una buona capacità di vivere in armonia con la tua natura'
  if (v >= 4) return 'una discreta capacità di vivere in armonia con la tua natura'
  return 'una tendenza parziale a vivere in armonia con la tua natura'
}

function buildSelfRelationshipText({ dispositionLabel, dominantLevel, levels }) {
  const famiglia = lowerInitial(dispositionLabel)
  const armonia = resolveSelfHarmonyLabel(dominantLevel)
  const contrasting = detectContrastingPresence(levels)

  const chiusura = contrasting
    ? `Il test rivela ${armonia}. La presenza di componenti in tensione tra loro suggerisce un profilo ricco e articolato: la comprensione di sé richiede di riconoscere questa complessità come risorsa, non come contraddizione.`
    : `Il test rivela ${armonia}.`

  return [
    `Questa lente osserva la consapevolezza della tua natura di base: più è alto il rapporto con la tua natura emotiva, più cresce la possibilità di guardarla con lucidità.`,
    `Se la tua appartenenza è ${famiglia}, il test indica quanto puoi osservare questa qualità mentre la vivi, riconoscendone movimenti, bisogni e sfumature.`,
    chiusura,
  ].join(' ')
}

/**
 * Restituisce il levelLabel da mostrare nel tag visivo della Prospettiva 3.
 */
function resolveOtherLevelLabel(enthusiasmLevel, levels = {}) {
  const v = Number(enthusiasmLevel) || 0
  const volitiveLevel = Number(levels['rosso']) || 0
  const melancoliaLevel = Number(levels['blu']) || 0
  const flemmaLevel = Number(levels['verde']) || 0

  if (v >= 6) return `Eccellente propensione all'ascolto del prossimo`
  if (v >= 5) return `Buona propensione all'ascolto del prossimo`
  if (v >= 4) return `Discreta propensione all'ascolto del prossimo`
  // Entusiasmo basso: distingui
  if (volitiveLevel >= 5) return `Tendenza alla competitività nel rapporto con l'altro`
  if (melancoliaLevel >= 5 || flemmaLevel >= 5) return `Tendenza alla prudenza e alla riservatezza nel rapporto con l'altro`
  return `Tendenza alla prudenza nel rapporto con l'altro`
}

function resolveOtherRelationshipLabel(enthusiasmLevel, levels = {}) {
  const v = Number(enthusiasmLevel) || 0
  const volitiveLevel = Number(levels['rosso']) || 0
  const melancoliaLevel = Number(levels['blu']) || 0
  const flemmaLevel = Number(levels['verde']) || 0

  if (v >= 6) {
    return `una eccellente propensione all'ascolto del prossimo e a relazionarsi con esso con fiducia`
  }
  if (v >= 5) {
    return `una buona propensione all'ascolto del prossimo e a relazionarsi con esso con fiducia`
  }
  if (v >= 4) {
    return `una discreta propensione all'ascolto del prossimo e a relazionarsi con esso con fiducia`
  }
  // Entusiasmo basso — distingui in base al contesto
  if (volitiveLevel >= 5) return 'una tendenza a entrare in conflitto con gli altri'
  if (melancoliaLevel >= 5) return `una tendenza alla riservatezza e all'introspezione nel rapporto con l'altro, più che al conflitto`
  if (flemmaLevel >= 5) return `una tendenza alla prudenza e all'attesa nel rapporto con l'altro`
  return `una tendenza alla prudenza nel rapporto con l'altro`
}

function buildOtherRelationshipIntro(dominantColorName, dispositionLabel) {
  const famiglia = lowerInitial(dispositionLabel)

  if (dominantColorName === 'Blu') {
    return `Nonostante la tendenza della natura malinconico - nostalgica a trovare un intimo piacere nello stare in sé stessi, questa lente osserva quanto l'entusiasmo apra il rapporto con l'altro.`
  }
  if (dominantColorName === 'Giallo') {
    return `La tendenza della tua natura entusiasta prevede una naturale apertura al rapporto con gli altri: questa lente osserva quanto questa disponibilità sia fiduciosa e disponibile all'ascolto.`
  }
  if (dominantColorName === 'Rosso') {
    return `La tua famiglia emotiva ha come elemento caratteristico una certa competitività nel rapporto con gli altri: questa lente osserva quanto l'entusiasmo ammorbidisca il contatto e lo renda più fiducioso.`
  }
  if (dominantColorName === 'Verde') {
    return `La tua natura flemmatica tende a osservare, attendere e mantenere una posizione prudente nel rapporto con l'altro: questa lente osserva quanto l'entusiasmo attivi apertura e partecipazione.`
  }
  if (dominantColorName === 'Grigio') {
    return `La tua natura anaffettiva tende a osservare l'esperienza emotiva con maggiore distanza e controllo: questa lente osserva quanto l'entusiasmo apra comunque un canale di contatto con gli altri.`
  }
  return `A partire dalla tua natura ${famiglia}, questa lente osserva quanto l'entusiasmo sostenga il rapporto con gli altri e favorisca ascolto, apertura e fiducia.`
}

function buildOtherRelationshipText({ dominantColorName, dispositionLabel, enthusiasmLevel, levels }) {
  const esito = resolveOtherRelationshipLabel(enthusiasmLevel, levels)
  return [
    buildOtherRelationshipIntro(dominantColorName, dispositionLabel),
    `In questo caso è l'entusiasmo a contare di più: più è alto questo valore, maggiore è la possibilità di un rapporto aperto, fiducioso e disponibile verso gli altri.`,
    `Il risultato del test rivela ${esito}.`,
  ].join(' ')
}

/**
 * Restituisce il levelLabel da mostrare nel tag visivo della Prospettiva 4.
 */
function resolveActionLevelLabel(volitiveLevel, levels = {}) {
  const v = Number(volitiveLevel) || 0
  const flemmaLevel = Number(levels['verde']) || 0
  const melancoliaLevel = Number(levels['blu']) || 0

  if (v >= 6) return `Eccellente propensione all'azione`
  if (v >= 5) return `Buona propensione all'azione`
  if (v >= 4) return `Discreta propensione all'azione`
  if (flemmaLevel >= 5) return `Propensione all'azione orientata alla prudenza e all'attesa`
  if (melancoliaLevel >= 5) return `Propensione all'azione frenata dalla riflessione interiore`
  return 'Tendenza a non agire in modo immediato'
}

function resolveActionRelationshipLabel(volitiveLevel, levels = {}) {
  const v = Number(volitiveLevel) || 0
  const flemmaLevel = Number(levels['verde']) || 0
  const melancoliaLevel = Number(levels['blu']) || 0

  if (v >= 6) return `una eccellente propensione all'azione`
  if (v >= 5) return `una buona propensione all'azione`
  if (v >= 4) return `una discreta propensione all'azione`
  // Volitività bassa — distingui in base al contesto
  if (flemmaLevel >= 5) return `una propensione all'azione orientata alla prudenza e all'attesa: l'energia si manifesta con calma e senza urgenza`
  if (melancoliaLevel >= 5) return `una propensione all'azione meno immediata, frenata da una tendenza all'introversione e alla riflessione interiore`
  return 'una tendenza a non agire in modo immediato'
}

function buildActionRelationshipText({ volitiveLevel, levels }) {
  const esito = resolveActionRelationshipLabel(volitiveLevel, levels)
  const flemmaLevel = Number(levels?.['verde']) || 0
  const melancoliaLevel = Number(levels?.['blu']) || 0
  const v = Number(volitiveLevel) || 0

  let contestoExtra = ''
  if (v < 4 && flemmaLevel >= 5) {
    contestoExtra = ` La componente flemmatica suggerisce che l'energia è presente ma si esprime con calma, senza necessità di urgenza o pressione.`
  } else if (v < 4 && melancoliaLevel >= 5) {
    contestoExtra = ` La componente malinconico - nostalgica suggerisce che l'azione tende a passare attraverso la riflessione e l'elaborazione interiore prima di manifestarsi.`
  }

  return [
    `Questa lente osserva il rapporto con l'agire: quanto più è alta la volitività, tanto più forte e incisiva tende a essere l'azione che si compie nella vita.`,
    `Il test rivela ${esito}.${contestoExtra}`,
  ].join(' ')
}

/**
 * Parole nominali emerse dalle risposte DIZIONARIO_2 (file 29–42) — lessico
 * "situazionale": a differenza del lessico teorico/stabile (FAMIGLIE_LESSICO),
 * queste parole dipendono dalle risposte reali di questo utente.
 *
 * Ordinamento: `count` decrescente. A parità di `count`, l'ordine risultante
 * (stable sort su Map in ordine di inserimento) segue l'ordine di prima
 * comparsa nel test, cioè il file con numero più basso tra 29 e 42.
 *
 * `fileKeys` conserva la tracciabilità verifica bile parola → file audio
 * (es. `['File_31']`), inclusa quando la stessa parola emerge da più file.
 *
 * Identità/deduplica: ogni parola è identificata da `parola + correnteKey`
 * specifico (es. `BLU_4_Solare`), non dal nome corrente di famiglia — che può
 * essere omonimo di una sotto-corrente di un'altra famiglia (es. il nome
 * corrente della famiglia Giallo è "Solare", che collide per assonanza con
 * la sotto-corrente `BLU_4_Solare`). Cosi' non esiste ambiguità di
 * attribuzione anche se due sotto-correnti diverse producessero la stessa
 * parola.
 *
 * @param {object} rawRecord
 */
export function extractParoleDalTest(rawRecord = {}) {
  const byKey = new Map()

  for (let fileNumber = 29; fileNumber <= 42; fileNumber += 1) {
    const fileKey = `File_${String(fileNumber).padStart(2, '0')}`
    const answer = rawRecord[fileKey]
    if (!answer || getLogicTypeForFile(fileNumber) !== 'DIZIONARIO_2') continue

    const delta = computeScoreDeltaForAnswer({ fileNumber, answerLabel: answer })
    const correnteKey = Object.keys(delta).find(
      (k) =>
        k.startsWith('BLU_') ||
        k.startsWith('ROSSO_') ||
        k.startsWith('VERDE_') ||
        k.startsWith('GIALLO_') ||
        k.startsWith('GRIGIO_'),
    )
    if (!correnteKey) continue

    const familyKey = correnteKey.split('_')[0].toLowerCase()
    const familyName = FAMILY_NAME_BY_KEY[familyKey]
    const theme = FAMILY_THEME[familyName]
    if (!theme) continue

    String(answer)
      .split(' - ')
      .forEach((part) => {
        const raw = part.trim()
        if (!raw || raw.toLowerCase() === 'mi è indifferente') return
        const parola = titleCaseStato(raw)
        // Identità univoca: parola + correnteKey specifico (es. BLU_4_Solare),
        // non il nome corrente di famiglia (es. "Lunare" per Blu, "Solare" per
        // Giallo — nomi che collidono per assonanza con le sotto-correnti
        // BLU_2_Lunare/BLU_4_Solare). Cosi' due sotto-correnti diverse che
        // producessero per caso la stessa parola non vengono mai fuse sotto
        // un'unica provenienza ambigua.
        const id = `${parola}|${correnteKey}`
        const prev = byKey.get(id)
        const fileKeys = prev?.fileKeys ? [...prev.fileKeys] : []
        if (!fileKeys.includes(fileKey)) fileKeys.push(fileKey)
        byKey.set(id, {
          parola,
          corrente: theme.corrente,
          colore: theme.dot,
          familyKey,
          familyName,
          correnteKey,
          count: (prev?.count || 0) + 1,
          fileKeys,
          peso: 'emersa',
          fonte: 'test',
        })
      })
  }

  return [...byKey.values()].sort((a, b) => b.count - a.count)
}

/**
 * Costruisce `reportData` dai dati già calcolati a monte (no nuovo scoring).
 *
 * @param {object} params
 * @param {object} params.record            record completo ({ raw }).
 * @param {object} params.totalsByKey        { blu, rosso, verde, giallo, grigio } già calcolati.
 * @param {string} params.dominantColorName  es. 'Blu'.
 * @param {object} params.textBlock          blocco testuale famiglia dominante (content/merged).
 * @param {object} params.rapportiLevels     { natura, se, altro, agire } → livelli 1-7 per colore.
 * @param {object} params.portatoEsperienziale { totals: {simpatia, antipatia, indifferenza} }.
 * @param {string} params.focus              dimensione/focus (es. 'passato').
 * @param {string} params.nomeCompleto       nome utente (può essere vuoto).
 */
export function buildReportData({
  record,
  totalsByKey,
  dominantColorName,
  textBlock,
  rapportiLevels,
  rapportiTotals,
  portatoEsperienziale,
  focus,
  nomeCompleto,
} = {}) {
  const fallbacks = []
  const rawRecord = record?.raw || {}
  const totals = totalsByKey || computeColorTotals(rawRecord)
  const relativePcts = computeRelativePercentages(totals)
  // Scala 1-7 (radar): stessa identica formula usata oggi per disegnare il radar
  // "Grafici dei risultati" (floor a 1 quando il punteggio o il massimo del profilo
  // sono 0). Esposta qui per avere un'unica fonte di verità invece di ricalcolarla
  // nel componente di presentazione.
  const scala1a7ByKey = normalizeLevels(totals)
  const domTheme = getFamilyTheme(dominantColorName)

  /* ── Le 5 correnti (famiglie): valore assoluto, percentuale (presence) e
   *    scala 1-7 (valore grafico normalizzato) sempre distinti e con familyKey
   *    esplicito — non dedurre mai la famiglia dal colore. ──────────────── */
  const correnti = FAMILY_ORDER.map((familyName) => {
    const theme = FAMILY_THEME[familyName]
    const key = theme.key
    const peso = relativePcts[key] ?? 0
    const reportLessico = Array.isArray(reportContent?.[familyName]?.lessico)
      ? reportContent[familyName].lessico
      : []
    const lessico = getFullLessicoForFamily(familyName, reportLessico)
    const famigliaLessico = getFamigliaLessico(familyName)
    const familyContent = reportContent?.[familyName] || {}
    const descrizioneBreve =
      (famigliaLessico?.lettura ||
        familyContent.restituzione_caratteri_estesi ||
        theme.tagline ||
        '').trim()
    return {
      familyKey: key,
      familyName,
      nome: theme.corrente,
      label: theme.macro,
      colore: theme.dot,
      valoreAssoluto: Number(totals[key]) || 0,
      peso,
      criterioPeso: 'attivazione',
      scala1a7: scala1a7ByKey[key] ?? 1,
      descrizioneBreve,
      lessico,
      statiAnimo: lessico,
      sottoCorrenti: famigliaLessico?.sottoCorrenti || [],
    }
  })

  const correntiByPeso = [...correnti].sort((a, b) => b.peso - a.peso)
  const sottocorrenti = buildSottocorrenti(rawRecord)
  const sottodisposizionePrevalente = resolveSottodisposizionePrevalente(
    rawRecord,
    dominantColorName,
  )
  const coloriCorrenti = Object.fromEntries(correnti.map((c) => [c.nome, c.colore]))

  /* ── Profilo (hero + sintesi) ─────────────────────────────────────── */
  const pdfEarly = PROFILE_PDF_BLOCKS[dominantColorName] || null
  const fraseChiave =
    (textBlock?.restituzione_caratteri_estesi || pdfEarly?.restituzione_caratteri_estesi || '').trim() ||
    domTheme.tagline ||
    ''
  const profilo = {
    natura: textBlock?.restituzione_natura || domTheme.nature,
    disposizione: textBlock?.restituzione_caratteri || domTheme.disposition,
    famiglia: dominantColorName || domTheme.label,
    correnteDominante: domTheme.corrente,
    fraseChiave,
    descrizioneEstesa: (textBlock?.descrizione_estesa || pdfEarly?.descrizione_estesa || '').trim(),
    focus: focus || textBlock?.restituzione_dimensione || '',
    colore: domTheme.dot,
    coloreChiara: undefined,
    coloreMedia: undefined,
    criterioNatura: 'prevalenza',
    criterioFamiglia: 'prevalenza',
    criterioTemperamento: 'prevalenza',
  }

  /* ── Profilo emotivo: 4 pannelli (natura/racconto/risorse/ombre) ──── */
  const secondColor = correntiByPeso[1]?.colore || domTheme.dot

  const naturaTesto = buildProfilo23Text(dominantColorName, 'natura')
  const raccontoTesto = buildProfilo23Text(dominantColorName, 'racconto')
  const risorseTesto = buildProfilo23Text(dominantColorName, 'risorse')
  const ombreTesto = buildProfilo23Text(dominantColorName, 'ombre')

  if (!naturaTesto) fallbacks.push('profiloEmotivo.natura: testo mancante.')
  if (!raccontoTesto) fallbacks.push('profiloEmotivo.racconto: testo mancante.')
  if (!risorseTesto) fallbacks.push('profiloEmotivo.risorse: testo mancante.')
  if (!ombreTesto) fallbacks.push('profiloEmotivo.ombre: testo mancante.')

  const labelBase = `${profilo.natura} · ${profilo.disposizione}`.trim()
  const personalizedTitles = getPersonalizedTitles(dominantColorName)

  const profiloEmotivo = {
    sezioni: [
      {
        id: 'natura',
        label: labelBase,
        capitolo: 'Aspetto 1',
        titolo: personalizedTitles.natura,
        sottotitolo: '',
        testo: naturaTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
      },
      {
        id: 'racconto',
        label: personalizedTitles.racconto,
        capitolo: 'Aspetto 2',
        titolo: personalizedTitles.racconto,
        sottotitolo: '',
        testo: raccontoTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
      },
      {
        id: 'risorse',
        label: personalizedTitles.risorse,
        capitolo: 'Aspetto 3',
        titolo: personalizedTitles.risorse,
        sottotitolo: '',
        testo: risorseTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
        correnteSecondaria: secondColor,
      },
      {
        id: 'ombre',
        label: personalizedTitles.ombre,
        capitolo: 'Aspetto 4',
        titolo: personalizedTitles.ombre,
        sottotitolo: '',
        testo: ombreTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
      },
    ],
  }

  /* ── I quattro rapporti (radar data-driven dai livelli reali) ─────── */
  const RAPPORTI_META = [
    {
      id: 'natura',
      nome: 'La tua Natura di Base',
      composizione: 'Timbro + Melodia + conferma Armonia',
      composizioneSemplice:
        'Questa parte mette insieme il tuo modo spontaneo di sentire, il modo in cui ti orienti nelle relazioni e una conferma del tuo equilibrio emotivo.',
      definizione:
        'Il suolo emotivo di fondo: Terra sonora (Timbro), Luce sonora (Intervalli) e Calore sonoro (Armonia). Mostra l’impronta che tendi ad abitare al di là delle situazioni.',
      cosaIndica:
        'Mostra come risuoni nel profondo e quale equilibrio tende a guidare il tuo modo spontaneo di sentire.',
    },
    {
      id: 'se',
      nome: 'Rapporto con te stesso',
      composizione: 'Intervalli + Melodia',
      composizioneSemplice:
        'Questa parte guarda come ascolti quello che succede dentro di te e quanto riesci a dare forma chiara a ciò che senti.',
      definizione:
        'Il dialogo con l’interiorità: Luce sonora (Intervalli) e Aria sonora (Melodia). Indica riflessione, qualità del sentire e racconto personale.',
      cosaIndica:
        'Quanto spazio dai all’interiorità e a nominare ciò che vivi dentro di te.',
    },
    {
      id: 'altro',
      nome: 'Rapporto con l’Altro',
      composizione: 'Timbro + Melodia',
      composizioneSemplice:
        'Questa parte guarda come ti avvicini agli altri: se il contatto nasce più facilmente come apertura, fiducia e ascolto.',
      definizione:
        'La disponibilità relazionale: Terra sonora (Timbro) e Aria sonora (Melodia). Mostra come ti apri verso persone e ambiente.',
      cosaIndica:
        'Il modo in cui entri in contatto, ti lasci toccare e rispondi al mondo relazionale.',
    },
    {
      id: 'agire',
      nome: 'Rapporto con l’Agire',
      composizione: 'Ritmo + Melodia',
      composizioneSemplice:
        'Questa parte guarda quanto il tuo sentire diventa movimento concreto: iniziativa, decisione e capacità di agire.',
      definizione:
        'L’energia del fare: Acqua sonora (Ritmo) e Aria sonora (Melodia). Mostra come trasformi emozioni in movimento, iniziativa o sosta.',
      cosaIndica:
        'La spinta volitiva: quanto sei portato ad agire, muoverti o lasciare scorrere.',
    },
  ]

  const radarFamilies = FAMILY_ORDER.map((familyName) => {
    const theme = FAMILY_THEME[familyName]
    return { familyName, key: theme.key, nome: theme.corrente, colore: theme.dot }
  })

  const rapporti = RAPPORTI_META.map((meta) => {
    const levels = rapportiLevels?.[meta.id] || {}
    const rawTotals = rapportiTotals?.[meta.id] || {}
    const rawSum = Object.values(rawTotals).reduce((sum, value) => sum + (Number(value) || 0), 0)
    const rawMax = Math.max(...Object.values(rawTotals).map((value) => Number(value) || 0), 0)
    const datiRadar = radarFamilies.map((f) => {
      const rawValue = Number(rawTotals?.[f.key]) || 0
      return {
        corrente: f.nome,
        familyKey: f.key,
        familyLabel: f.familyName,
        valore: Number(levels?.[f.key]) || 0,
        rawValue,
        totalRawPoints: rawSum,
        maxRawPoints: rawMax,
        distributionPercent: rawSum > 0 ? Number(((rawValue / rawSum) * 100).toFixed(1)) : 0,
      }
    })
    const localPrincipale = radarFamilies.reduce(
      (best, f) => {
        const v = Number(levels?.[f.key]) || 0
        return v > best.valore ? { ...f, valore: v } : best
      },
      { ...radarFamilies[0], valore: -Infinity },
    )
    const dominantFamily = {
      familyName: dominantColorName || domTheme.label,
      key: domTheme.key,
      nome: domTheme.corrente,
      colore: domTheme.dot,
      valore: Number(levels?.[domTheme.key]) || 0,
    }
    const enthusiasmTheme = FAMILY_THEME.Giallo
    const enthusiasmFamily = {
      familyName: 'Giallo',
      key: enthusiasmTheme.key,
      nome: enthusiasmTheme.corrente,
      colore: enthusiasmTheme.dot,
      valore: Number(levels?.[enthusiasmTheme.key]) || 0,
    }
    const volitiveTheme = FAMILY_THEME.Rosso
    const volitiveFamily = {
      familyName: 'Rosso',
      key: volitiveTheme.key,
      nome: volitiveTheme.corrente,
      colore: volitiveTheme.dot,
      valore: Number(levels?.[volitiveTheme.key]) || 0,
    }
    const isNatura = meta.id === 'natura'
    const isSe = meta.id === 'se'
    const isAltro = meta.id === 'altro'
    const isAgire = meta.id === 'agire'
    const usesDominantFamily = isNatura || isSe
    const principale = isAltro
      ? enthusiasmFamily
      : isAgire
        ? volitiveFamily
        : usesDominantFamily
          ? dominantFamily
          : localPrincipale
    const dominantColorKey = (domTheme.key || '').toLowerCase()
    const definizione = isNatura
      ? buildNaturaBaseText({
          dispositionLabel: profilo.disposizione || domTheme.disposition,
          dominantLevel: dominantFamily.valore,
          levels,
          dominantColorKey,
        })
      : isSe
        ? buildSelfRelationshipText({
            dispositionLabel: profilo.disposizione || domTheme.disposition,
            dominantLevel: dominantFamily.valore,
            levels,
            dominantColorKey,
          })
        : isAltro
          ? buildOtherRelationshipText({
              dominantColorName,
              dispositionLabel: profilo.disposizione || domTheme.disposition,
              enthusiasmLevel: enthusiasmFamily.valore,
              levels,
            })
          : isAgire
            ? buildActionRelationshipText({
                volitiveLevel: volitiveFamily.valore,
                levels,
              })
      : meta.definizione

    const levelLabel = isNatura
      ? resolveNaturaLevelLabel(levels, dominantColorKey)
      : isSe
        ? resolveSelfLevelLabel(dominantFamily.valore, levels, dominantColorKey)
        : isAltro
          ? resolveOtherLevelLabel(enthusiasmFamily.valore, levels)
          : isAgire
            ? resolveActionLevelLabel(volitiveFamily.valore, levels)
          : ''

    return {
      id: meta.id,
      nome: meta.nome,
      sottotitolo: isNatura
        ? 'La tua Natura Emotiva di base (equilibrio emotivo)'
        : isSe
          ? 'Rapporto con te stesso (consapevolezza della natura di base)'
          : isAltro
            ? "Rapporto con l'Altro (ascolto e fiducia)"
            : isAgire
              ? "Rapporto con l'Agire (volitività e azione)"
          : '',
      levelLabel,
      definizione,
      composizione: meta.composizione,
      composizioneSemplice: meta.composizioneSemplice,
      cosaIndica: meta.cosaIndica,
      correntePrincipale: { nome: principale.nome, colore: principale.colore, familyKey: principale.key },
      datiRadar,
      criterioRadar: 'livello_relativo',
    }
  })

  if (!rapportiLevels) fallbacks.push('rapporti: livelli assenti, radar a 0.')

  /* ── Punteggi (Blocco C / portato esperienziale) ──────────────────── */
  const portTotals = portatoEsperienziale?.totals || {}
  const punteggi = {
    simpatia: normalizePortatoValue(portTotals.simpatia ?? rawRecord.PE_Simpatia),
    antipatia: normalizePortatoValue(portTotals.antipatia ?? rawRecord.PE_Antipatia),
    indifferenza: normalizePortatoValue(portTotals.indifferenza ?? rawRecord.PE_Indifferenza),
  }

  const portatoSum = punteggi.simpatia + punteggi.antipatia + punteggi.indifferenza
  let prevalente = ''
  if (portatoSum > 0) {
    const best = PORTATO_ORDER.reduce((acc, key) => {
      const v = punteggi[key.toLowerCase()] ?? 0
      if (!acc || v > acc.valore) return { key, valore: v }
      return acc
    }, null)
    prevalente = best?.key || ''
  }
  const portatoContent = reportContent?.portato_esperienziale || {}
  const prevalenteLabel = prevalente ? PORTATO_PRESENTATION_LABELS[prevalente] || prevalente : ''
  const upstreamMatchesScores = portatoEsperienziale?.dominantKey === prevalente
  const descrizione = prevalente
    ? (upstreamMatchesScores ? portatoEsperienziale?.description : '') ||
      portatoContent[prevalente]?.descrizione_breve ||
      ''
    : ''
  const vitalita = prevalente && upstreamMatchesScores
    ? portatoEsperienziale?.vitalityInterpretation || ''
    : ''
  const definizioneBreveByKey = {
    Simpatia: 'Sintonia e coinvolgimento verso gli stimoli ascoltati.',
    Antipatia: 'Distonia, rifiuto o fastidio verso parte del materiale ascoltato.',
    Indifferenza: 'Distanza, neutralità o scarso coinvolgimento verso gli stimoli.',
  }
  const quoteNormalizzate = Object.fromEntries(PORTATO_ORDER.map((key) => {
    const valore = punteggi[key.toLowerCase()] ?? 0
    return [key, portatoSum > 0 ? valore / portatoSum : 0]
  }))
  const dimensioni = PORTATO_ORDER.map((key) => {
    const valore = punteggi[key.toLowerCase()] ?? 0
    const quotaNormalizzata = quoteNormalizzate[key]
    const percentuale = Math.round(quotaNormalizzata * 100)
    return {
      key,
      label: PORTATO_PRESENTATION_LABELS[key],
      valore,
      percentuale,
      quotaNormalizzata,
      criterioValore: 'prevalenza',
      criterioPercentuale: 'quota',
      definizioneBreve: definizioneBreveByKey[key] || '',
    }
  })
  const puntoPad = PORTATO_ORDER.reduce((point, key) => ({
    x: point.x + PORTATO_PAD_VERTICES[key].x * quoteNormalizzate[key],
    y: point.y + PORTATO_PAD_VERTICES[key].y * quoteNormalizzate[key],
  }), { x: 0, y: 0 })
  const portato = {
    simpatia: punteggi.simpatia,
    antipatia: punteggi.antipatia,
    indifferenza: punteggi.indifferenza,
    prevalente,
    prevalenteLabel,
    descrizione,
    vitalita,
    sintesiInterpretativa: buildPortatoSynthesis(quoteNormalizzate, portatoSum > 0),
    quoteNormalizzate,
    pad: {
      vertici: PORTATO_PAD_VERTICES,
      punto: portatoSum > 0 ? puntoPad : null,
      quote: quoteNormalizzate,
    },
    dimensioni,
    hasData: portatoSum > 0,
    criterioPrevalente: 'prevalenza',
  }
  if (!portato.hasData) fallbacks.push('portato: punteggi PE assenti o tutti a zero.')

  /* ── Stati d'animo: parole emerse dal test + lessico completo su richiesta ─ */
  const paroleEmerse = extractParoleDalTest(rawRecord)
  const statiAnimo = []
  correntiByPeso.forEach((c, rank) => {
    const peso = PESO_RANK_LABEL[Math.min(rank, PESO_RANK_LABEL.length - 1)]
    c.lessico.forEach((parola) => {
      statiAnimo.push({ parola, corrente: c.nome, colore: c.colore, peso })
    })
  })
  if (paroleEmerse.length === 0) fallbacks.push('paroleEmerse: nessuna parola da DIZIONARIO_2.')
  if (statiAnimo.length === 0) fallbacks.push('statiAnimo: lessico assente.')

  const famiglieLessico = FAMIGLIE_LESSICO
  const filtroMusicale = buildFiltroMusicale(rawRecord)
  const musicista = {
    active: (rawRecord.Pratica_Musicale || '').trim().toUpperCase() === 'SI',
    strumento: (rawRecord.Strumento_Suonato || '').trim(),
  }

  /* ── Sintesi (narrativa + radar percentuali famiglie) ───────────────── */
  const sintesiParagrafi = buildSintesiNarrative({
    profilo,
    correntiByPeso,
    domTheme: domTheme,
    textBlock,
    portato,
    sottodisposizione: sottodisposizionePrevalente,
  })
  // Scala 1-7 (stessa formula del radar realmente disegnato in "Grafici dei
  // risultati", non la percentuale 0-100 di `peso`): vedi nota su scala1a7ByKey sopra.
  const datiRadar = correnti.map((c) => ({
    corrente: c.nome,
    familyKey: c.familyKey,
    valore: c.scala1a7,
  }))
  const sintesiLead = buildSintesiLead({
    profilo,
    correntiByPeso,
    domTheme,
    textBlock,
  })
  const sintesiKeyFacts = buildSintesiKeyFacts({
    profilo,
    domTheme,
    textBlock,
    sottodisposizione: sottodisposizionePrevalente,
    portato,
  })
  const sintesiLeadExtended = buildSintesiLeadExtended({
    profilo,
    domTheme,
    textBlock,
  })
  const sintesi = {
    lead: sintesiLead,
    keyFacts: sintesiKeyFacts,
    leadExtended: sintesiLeadExtended,
    paragrafi: sintesiParagrafi,
    testo: sintesiParagrafi.join('\n\n'),
    datiRadar,
  }
  if (!sintesiLead) fallbacks.push('sintesi: lead vuoto.')
  if (!sintesiParagrafi.length) fallbacks.push('sintesi: testo narrativo vuoto.')

  /* ── Approfondimento: totali per sezione (replay scoring, no nuove regole) ─ */
  let sezioniData = []
  try {
    sezioniData = computeSezioniTotalsFromRaw(rawRecord).sezioniData
  } catch (err) {
    console.warn('computeSezioniTotalsFromRaw failed', err)
    fallbacks.push('approfondimento: calcolo sezioni non disponibile.')
  }
  const sezioniTest = reportContent.sezioni_test || null
  if (!sezioniData.length) fallbacks.push('approfondimento: sezioniData vuoto.')
  if (!sezioniTest) fallbacks.push('approfondimento: testi sezioni_test assenti.')

  return {
    utente: { nome: nomeCompleto || '' },
    profilo,
    correnti,
    correntiByPeso,
    sottocorrenti,
    sottodisposizionePrevalente,
    profiloEmotivo,
    approfondimento: { sezioniData, sezioniTest },
    rapporti,
    punteggi,
    portato,
    statiAnimo,
    paroleEmerse,
    famiglieLessico,
    filtroMusicale,
    musicista,
    sintesi,
    coloriCorrenti,
    colorTotals: totals,
    rawRecord,
    _fallbacks: fallbacks,
  }
}

export default buildReportData
