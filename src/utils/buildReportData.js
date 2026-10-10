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
 *   profilo: { natura, disposizione, famiglia, correnteDominante, fraseChiave, focus, colore,
 *     heroResult: {                     // apertura report: famiglia principale + eventuale secondaria
 *       band,                           // 'leader' | 'near_parity' | 'exact_tie' — da globalProfileContract, nessuna nuova soglia
 *       leader: { familyKey, famiglia, colore },
 *       secondary: null | { familyKey, famiglia, colore }, // valorizzato solo se band !== 'leader'
 *     },
 *     globalProfileContract,             // stessa fonte di heroResult: bande per famiglia (leader/exact_tie/
 *                                         // near_parity/secondary/marginal), usata anche da reportFeatureFlags
 *                                         // e EmotionalIntegrations per restare coerenti con l'Hero.
 *   },
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
 *                                       // (oggi tutte le 11 correnti sono misurabili) — non trattare come "0% di presenza reale"
 *     percentuale, intervalNote,
 *   }],
 *   profiloEmotivo: { sezioni: [{ id, label, titolo, testo, correnteColore, correnteSecondaria? }] },
 *   approfondimento: { sezioniData, sezioniTest },
 *   rapporti: [{ id, nome, definizione, composizione, cosaIndica, correntePrincipale{nome,colore,familyKey}, datiRadar[{corrente,familyKey,valore}] }],
 *   punteggi: { simpatia, antipatia, indifferenza },
 *   portato: {
 *     simpatia, antipatia, indifferenza,
 *     prevalente, prevalenteLabel, descrizione, vitalita,
 *     dimensioni: [{ key, label, valore, percentuale, definizioneBreve }],
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
import {
  allocateRoundedPercentages,
  computeColorTotals,
  computeSezioniTotalsFromRaw,
  computeRelativePercentages,
  normalizeLevels,
} from './reportRecordUtils.js'
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
import { MALINCONICA_NOSTALGICA_LABEL, formatSubcategoryLabel } from './reportTaxonomy.js'
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
import { FAMIGLIA_BY_COLOR, NATURE } from '../config/tstSistema.js'
import { normalizzaSuMassimo, percentualeNatura } from './cesteTst.js'
import {
  buildNaturaNarrative,
  buildRelationBreakdown,
  NATURA_NARRATIVE_STATUS,
  NATURA_RELATION_RULES,
} from './buildNaturaNarrative.js'
import {
  buildActionNarrative,
  buildOtherNarrative,
  buildSelfNarrative,
} from './buildFourRelationsNarrative.js'
import {
  analyzeFamilyComposition,
  classifyFamilyRanking,
  buildRelationLensContract,
} from './reportCompositionSensitivity.js'
import { buildReportContentSelection } from './buildReportContentSelection.js'

const PESO_RANK_LABEL = ['dominante', 'secondaria', 'minore', 'marginale', 'marginale']

/** Nature dal sistema unico (src/config/tstSistema.js): campo Firestore, famiglia, nome PDF. */
const SOTTOCORRENTE_META = NATURE.map((n) => ({
  rawKey: n.campoDb,
  familyName: FAMIGLIA_BY_COLOR[n.colorKey].colore,
  familyKey: n.colorKey,
}))

const SOTTOCORRENTE_LABEL_BY_RAW_KEY = Object.fromEntries(
  NATURE.map((n) => [n.campoDb, n.campoDb === 'BLU_3_Nostalgia' ? MALINCONICA_NOSTALGICA_LABEL : n.nome]),
)

// Nessun fallback verso una famiglia diversa (es. Verde): una scheda mancante resta
// mancante (null) e viene segnalata a chi chiama, mai sostituita con una scheda simile.
function buildProfilo23Text(familyName, panelId) {
  const approfondimento = getFamigliaApprofondimento(familyName)
  if (!approfondimento) return null

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
  DT_NO: 'Nessuna difficoltà segnalata',
  DT_SI: 'Sì',
}

/** Sentinel scritto da NewTestPage quando l'utente non segnala difficoltà: non è un codice reale da mostrare. */
const DIFFICOLTA_DETTAGLIO_NONE_CODE = 'DD_NESSUNA'

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
      ...(key === 'BLU_3_Nostalgia' ? ['Nostalgia', 'Nostalgica'] : []),
    ]
    return aliases.some((alias) => normalizeSottocorrenteLabel(alias) === savedNormalized)
  })
  if (savedKeyInFamily) {
    return formatSubcategoryLabel(
      SOTTOCORRENTE_LABEL_BY_RAW_KEY[savedKeyInFamily] || rawKeyToLabel(savedKeyInFamily),
    )
  }

  let bestKey = ''
  let bestValue = -Infinity
  candidateKeys.forEach((key) => {
    const value = percentualeNatura(key, rawRecord[key])
    if (value > bestValue) {
      bestValue = value
      bestKey = key
    }
  })

  if (!bestKey || bestValue <= 0) return ''
  return formatSubcategoryLabel(SOTTOCORRENTE_LABEL_BY_RAW_KEY[bestKey] || rawKeyToLabel(bestKey))
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
    // questa corrente), la percentuale resta 0
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
    difficoltaDettaglio: resolveCodeList(rawRecord.Difficolta_Dettaglio, DIFFICOLTA_DETTAGLIO_LABELS)
      .filter((item) => item.code !== DIFFICOLTA_DETTAGLIO_NONE_CODE),
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
  Indifferenza: 'Indifferenza',
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
    return 'In questa esperienza d\'ascolto sintonia, distonia e distanza sono emerse con quote molto vicine: il contenuto musicale ha generato una compresenza delle tre modalità, senza una nettamente prevalente.'
  }

  if (first.quota - second.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearShare) {
    const thirdClause = third.quota <= PORTATO_PRESENTATION_THRESHOLDS.nearlyAbsent
      ? `la ${third.label} è rimasta quasi assente`
      : third.quota <= PORTATO_PRESENTATION_THRESHOLDS.contained
        ? `la ${third.label} è emersa in misura contenuta`
        : `la ${third.label} ha avuto una presenza più contenuta`
    return `In questa esperienza d'ascolto ${first.label} e ${second.label} sono emerse con intensità simile; ${thirdClause}. Il contenuto musicale ha quindi generato un orientamento misto, senza una sola modalità nettamente prevalente.`
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

  return `In questa esperienza d'ascolto hai mostrato soprattutto ${first.label} nella relazione con il contenuto musicale; ${secondaryClause}, mentre ${thirdClause}.`
}


function titleCaseStato(word) {
  const t = String(word || '').trim()
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
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
 * Restituisce il levelLabel da mostrare nel tag visivo della Prospettiva 1.
 */
function resolveNaturaLevelLabel(status, harmonyDescriptor) {
  if (status === NATURA_NARRATIVE_STATUS.EMPTY) return 'Dati insufficienti'
  if (status === NATURA_NARRATIVE_STATUS.TRUE_TIE) return 'Prevalenza condivisa — profilo composito'
  if (status === NATURA_NARRATIVE_STATUS.ROUNDED_TIE) return 'Valori ravvicinati — profilo composito'
  if (status === NATURA_NARRATIVE_STATUS.COMPOSITE) {
    const harmonyLabel = harmonyDescriptor
      ? harmonyDescriptor.replace(/^(un'|una\s+)/, '')
      : 'compresenza emotiva'
    return `Profilo composito — ${harmonyLabel}`
  }
  return 'Prevalenza riconoscibile'
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
  const scala1a7ByKey = normalizeLevels(normalizzaSuMassimo(totals))
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

  /* ── Contratto interpretativo isolato: graduatoria globale del profilo (Fase 2B) ──
   * Chiavi canoniche colore, scala presence_percent_0_100. Non sostituisce
   * familyComposition/correnti sotto: è dato aggiuntivo, non ancora renderizzato. ── */
  const globalProfileContract = classifyFamilyRanking(
    correnti.map((item) => ({ familyKey: item.familyKey, percent: item.peso })),
    { scope: 'global', source: 'correnti.peso (globalProfileRanking)' },
  )

  const correntiByPeso = [...correnti].sort((a, b) => b.peso - a.peso)
  const familyComposition = analyzeFamilyComposition(
    correntiByPeso.map((item) => ({
      ...item,
      rawValue: item.valoreAssoluto,
      distributionPercent: item.peso,
    })),
  )
  const sottocorrenti = buildSottocorrenti(rawRecord)
  const sottodisposizionePrevalente = resolveSottodisposizionePrevalente(
    rawRecord,
    dominantColorName,
  )
  const coloriCorrenti = Object.fromEntries(correnti.map((c) => [c.nome, c.colore]))

  /* ── Hero: famiglia principale + eventuale famiglia secondaria (Fase report semplice/sotto
   * complesso). Riusa solo le bande già calcolate da classifyFamilyRanking sopra
   * (globalProfileContract): nessuna nuova soglia di "quasi pareggio" introdotta qui.
   * band 'near_parity' | 'exact_tie' → la seconda famiglia in graduatoria è entro la
   * distanza già codificata (<=10 punti percentuali, o 0 per il pareggio esatto). ── */
  const familyByKey = Object.fromEntries(correnti.map((item) => [item.familyKey, item]))
  const heroSecondEntry = globalProfileContract.status === 'ready' ? globalProfileContract.ranking?.[1] : null
  const heroBand = heroSecondEntry?.band === 'exact_tie'
    ? 'exact_tie'
    : heroSecondEntry?.band === 'near_parity'
      ? 'near_parity'
      : 'leader'
  const heroLeaderFamily = familyByKey[globalProfileContract.leader?.familyKey] || familyByKey[domTheme.key]
  const heroSecondaryFamily = heroBand !== 'leader' ? familyByKey[heroSecondEntry.familyKey] : null
  const heroResult = {
    band: heroBand,
    leader: heroLeaderFamily
      ? { familyKey: heroLeaderFamily.familyKey, famiglia: heroLeaderFamily.nome, colore: heroLeaderFamily.colore }
      : null,
    secondary: heroSecondaryFamily
      ? { familyKey: heroSecondaryFamily.familyKey, famiglia: heroSecondaryFamily.nome, colore: heroSecondaryFamily.colore }
      : null,
  }

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
    composizioneFamiglie: familyComposition,
    heroResult,
    // Stessa fonte già usata per heroResult e per i badge/schede di SintesiCorrenti
    // (contentCards/compositionViewModel): esposta anche qui perché reportFeatureFlags.js
    // e EmotionalIntegrations.jsx ricevono solo `profilo`, non l'intero reportData — così
    // "quale famiglia secondaria è significativa" resta la stessa risposta ovunque nel report.
    globalProfileContract,
    composizioneSintesi: familyComposition.status === 'balanced'
      ? `La famiglia prevalente guida di poco: ${familyComposition.foreground.map((item) => `${item.nome} ${item.distributionPercent}%`).join(', ')} formano un profilo ravvicinato e vanno lette quasi sullo stesso piano.`
      : familyComposition.status === 'mixed'
        ? `La prevalenza non è esclusiva: ${familyComposition.foreground.map((item) => `${item.nome} ${item.distributionPercent}%`).join(', ')} contribuiscono in modo significativo al profilo.`
        : `La restituzione è orientata soprattutto dalla famiglia ${familyComposition.leader?.nome || domTheme.family}; le componenti più basse restano sullo sfondo.`,
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
    // Famiglia già raccontata per intero nei 4 capitoli sotto (sezioni): il rendering
    // delle contentCards.primary la esclude per non duplicare la stessa scheda.
    dominantFamilyKey: domTheme.key,
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
    // Campo additivo (Fase 2C): schede famiglia (natura/racconto/risorse/ombre) per
    // TUTTE le primaryKeys/companionKeys del profilo globale, non solo la dominante —
    // pronto per una UX a "pari dignità" tra famiglie quasi-paritarie. Non sostituisce
    // `sezioni` sopra (dominante singola), che resta invariato per compatibilità UI.
    contentCards: globalProfileContract.status === 'ready'
      ? buildReportContentSelection(globalProfileContract.contentPlan, { contentType: 'famiglia' })
      : { primary: [], companion: [], theoretical: [], marginal: [], missingContentKeys: [], status: globalProfileContract.status },
  }
  if (profiloEmotivo.contentCards.missingContentKeys.length) {
    fallbacks.push(`profiloEmotivo.contentCards: schede mancanti per ${profiloEmotivo.contentCards.missingContentKeys.join(', ')}.`)
  }

  /* ── I quattro rapporti (radar data-driven dai livelli reali) ─────── */
  const RAPPORTI_META = [
    {
      id: 'natura',
      nome: 'La tua Natura di Base',
      composizione: 'Suono + Distanze tra le note + Accordi',
      composizioneSemplice:
        'Questa parte somma i punti ottenuti nelle risposte su Suono, Distanze tra le note e Accordi, separatamente per ciascuna famiglia emotiva.',
      definizione:
        'Il suolo emotivo di fondo: Terra sonora (Suono), Luce sonora (Distanze tra le note) e Calore sonoro (Accordi). Mostra l’impronta che tendi ad abitare al di là delle situazioni.',
      cosaIndica:
        'Mostra come risuoni nel profondo e quale equilibrio tende a guidare il tuo modo spontaneo di sentire.',
    },
    {
      id: 'se',
      nome: 'Rapporto con te stesso',
      composizione: 'Distanze tra le note + Melodia',
      composizioneSemplice:
        'Questa parte guarda come ascolti quello che succede dentro di te e quanto riesci a dare forma chiara a ciò che senti.',
      definizione:
        'Il dialogo con l’interiorità: Luce sonora (Distanze tra le note) e Aria sonora (Melodia). Indica riflessione, qualità del sentire e racconto personale.',
      cosaIndica:
        'Quanto spazio dai all’interiorità e a nominare ciò che vivi dentro di te.',
    },
    {
      id: 'altro',
      nome: 'Rapporto con l’Altro',
      composizione: 'Suono + Melodia',
      composizioneSemplice:
        'Questa parte guarda come ti avvicini agli altri: se il contatto nasce più facilmente come apertura, fiducia e ascolto.',
      definizione:
        'La disponibilità relazionale: Terra sonora (Suono) e Aria sonora (Melodia). Mostra come ti apri verso persone e ambiente.',
      cosaIndica:
        'Il modo in cui entri in contatto, ti lasci toccare e rispondi al mondo relazionale.',
    },
    {
      id: 'agire',
      nome: 'Rapporto con l’Agire',
      composizione: 'Tempo + Melodia',
      composizioneSemplice:
        'Questa parte guarda quanto il tuo sentire diventa movimento concreto: iniziativa, decisione e capacità di agire.',
      definizione:
        'L’energia del fare: la spinta che trasforma il sentire in azione. Mostra come trasformi emozioni in movimento, iniziativa o sosta.',
      cosaIndica:
        'La spinta volitiva: quanto sei portato ad agire, muoverti o lasciare scorrere.',
    },
  ]

  const radarFamilies = FAMILY_ORDER.map((familyName) => {
    const theme = FAMILY_THEME[familyName]
    return { familyName, key: theme.key, nome: theme.family, colore: theme.dot }
  })
  const naturaRawTotals = rapportiTotals?.natura || {}
  const naturaRawMax = Math.max(
    ...radarFamilies.map((family) => Number(naturaRawTotals[family.key]) || 0),
    0,
  )
  const naturaBaseFamilyKey = naturaRawMax > 0
    ? radarFamilies.find(
        (family) => (Number(naturaRawTotals[family.key]) || 0) === naturaRawMax,
      )?.key || domTheme.key
    : domTheme.key

  /* ── Contratto interpretativo isolato: graduatoria dello scope Natura (Fase 2B) ──
   * Ambito distinto dal profilo globale: sole sezioni Timbro+Intervalli+Armonia.
   * globalProfileLeader e natureScopeLeader possono divergere legittimamente:
   * non vengono mai unificati né usati per correggersi a vicenda. ── */
  const natureScopeRawSum = radarFamilies.reduce(
    (sum, family) => sum + (Number(naturaRawTotals[family.key]) || 0),
    0,
  )
  const natureScopeContract = classifyFamilyRanking(
    radarFamilies.map((family) => {
      const rawValue = Number(naturaRawTotals[family.key]) || 0
      const percent = natureScopeRawSum > 0
        ? Number(((rawValue / natureScopeRawSum) * 100).toFixed(1))
        : 0
      return { familyKey: family.key, percent }
    }),
    { scope: 'nature', source: 'rapportiTotals.natura (natureScopeRanking)' },
  )

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
        colore: f.colore,
        valore: Number(levels?.[f.key]) || 0,
        rawValue,
        totalRawPoints: rawSum,
        maxRawPoints: rawMax,
        distributionPercent: rawSum > 0 ? Number(((rawValue / rawSum) * 100).toFixed(1)) : 0,
      }
    })
    const graduatoria = [...datiRadar].sort((a, b) => {
      if (b.valore !== a.valore) return b.valore - a.valore
      if (b.rawValue !== a.rawValue) return b.rawValue - a.rawValue
      return radarFamilies.findIndex((family) => family.key === a.familyKey) -
        radarFamilies.findIndex((family) => family.key === b.familyKey)
    })
    const topLevel = graduatoria[0]?.valore || 0
    const topLevelFamilies = graduatoria.filter(
      (item) => item.rawValue > 0 && item.valore === topLevel,
    )
    const topRawPoints = graduatoria[0]?.rawValue || 0
    const topRawFamilies = graduatoria.filter(
      (item) => item.rawValue > 0 && item.rawValue === topRawPoints,
    )
    const famiglieInEvidenza = graduatoria.filter(
      (item) => item.rawValue > 0 && item.valore >= 5 && topLevel - item.valore <= 2,
    )
    const profiloComposto = topLevelFamilies.length > 1 || famiglieInEvidenza.length > 1
    const formatFamilyLevels = (items) =>
      items.map((item) => `${item.corrente} ${item.valore}/7`).join(', ')
    const esitoComposizione = rawSum <= 0
      ? 'Dati insufficienti per descrivere la composizione di questo rapporto.'
      : topRawFamilies.length > 1
        ? `Prevalenza a pari punti: ${formatFamilyLevels(topRawFamilies)}.`
        : topLevelFamilies.length > 1
          ? `Più famiglie raggiungono 7/7 dopo la normalizzazione: ${formatFamilyLevels(topLevelFamilies)}.`
          : profiloComposto
            ? `Profilo composto: ${formatFamilyLevels(famiglieInEvidenza)}.`
            : `Famiglia prevalente: ${formatFamilyLevels(graduatoria.slice(0, 1))}.`
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
    const melancholicTheme = FAMILY_THEME.Blu
    const melancholicFamily = {
      familyName: 'Blu',
      key: melancholicTheme.key,
      nome: melancholicTheme.corrente,
      colore: melancholicTheme.dot,
      valore: Number(levels?.[melancholicTheme.key]) || 0,
    }
    const isNatura = meta.id === 'natura'
    const isSe = meta.id === 'se'
    const isAltro = meta.id === 'altro'
    const isAgire = meta.id === 'agire'
    // correntePrincipale deriva sempre dalla graduatoria locale reale (localLeaderItem),
    // mai dalla famiglia teorica di riferimento della lente (Malinconica/Entusiasta/Marziale
    // restano referenceFamilyKey in relationContract sotto, senza sostituire il leader locale).
    const localLeaderItem = graduatoria[0]
    const localLeaderFamily = (localLeaderItem?.rawValue || 0) > 0
      ? {
          ...localLeaderItem,
          key: localLeaderItem.familyKey,
          nome: localLeaderItem.corrente,
        }
      : dominantFamily
    const principale = localLeaderFamily
    // [legacy] Campo storico mantenuto solo per compatibilità con QuattroRapporti.jsx;
    // non è più usato per ordinamento, leader o selezione contenuti. Il dato corretto è
    // relationContract (referenceFamilyKey/referenceRank/referenceRole) costruito sotto.
    const agoDellaBilancia = isAltro
      ? enthusiasmFamily
      : isAgire
        ? volitiveFamily
        : isSe
          ? melancholicFamily
          : localLeaderFamily
    const relationshipNarrative = isNatura
      ? buildNaturaNarrative({
          ranking: graduatoria,
          shades: sottocorrenti,
        })
      : isSe
        ? buildSelfNarrative({ dominantFamilyKey: naturaBaseFamilyKey, ranking: graduatoria })
        : isAltro
          ? buildOtherNarrative({ dominantFamilyKey: naturaBaseFamilyKey, ranking: graduatoria })
          : isAgire
            ? buildActionNarrative({ dominantFamilyKey: naturaBaseFamilyKey, ranking: graduatoria })
            : null

    // Contratto interpretativo isolato per questo rapporto (Fase 2B): graduatoria locale
    // classificata + famiglia di riferimento della lente, con la matrice NATURA_RELATION_RULES
    // già esportata da buildNaturaNarrative.js (unica fonte, nessuna matrice duplicata).
    // Non collegato al rendering delle schede: solo dato, per la Fase 2C.
    const relationScope = isNatura ? 'nature' : isSe ? 'self' : isAltro ? 'other' : isAgire ? 'action' : meta.id
    const relationContract = buildRelationLensContract({
      scope: relationScope,
      source: `rapporti.${meta.id}.graduatoria (relationLocalRanking)`,
      ranking: graduatoria.map((item) => ({ familyKey: item.familyKey, percent: item.distributionPercent })),
      referenceFamilyKey: isNatura ? (localLeaderItem?.familyKey || null) : undefined,
      relationMatrix: NATURA_RELATION_RULES,
    })
    // Campo additivo (Fase 2C): schede famiglia per le primaryKeys/companionKeys reali di
    // QUESTO rapporto (relationContract.localContentPlan, mai la referenceFamily teorica).
    // Puro dato, non ancora renderizzato: pronto per il livello 2 progressivo di QuattroRapporti.
    const contentCards = relationContract.status === 'ready'
      ? buildReportContentSelection(relationContract.localContentPlan, { contentType: 'famiglia' })
      : { primary: [], companion: [], theoretical: [], marginal: [], missingContentKeys: [], status: relationContract.status }
    const definizioneParagrafi = relationshipNarrative?.paragraphs || [meta.definizione]
    const sintesiBreveParagrafi = relationshipNarrative?.frontParagraphs?.length
      ? relationshipNarrative.frontParagraphs
      : definizioneParagrafi.slice(0, 2)
    const definizione = definizioneParagrafi.join(' ')
    const levelLabel = isNatura
      ? resolveNaturaLevelLabel(relationshipNarrative.status, relationshipNarrative.harmonyDescriptor)
      : relationshipNarrative?.levelLabel || ''

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
      definizioneParagrafi,
      sintesiBreveParagrafi,
      narrativaNatura: isNatura ? relationshipNarrative : null,
      narrativaRapporto: relationshipNarrative,
      composizione: meta.composizione,
      composizioneSemplice: meta.composizioneSemplice,
      cosaIndica: meta.cosaIndica,
      correntePrincipale: { nome: principale.nome, colore: principale.colore, familyKey: principale.key },
      agoDellaBilancia: (() => {
        const agoItem = graduatoria.find((item) => item.familyKey === agoDellaBilancia.key)
        return {
          nome: agoDellaBilancia.nome,
          colore: agoDellaBilancia.colore,
          familyKey: agoDellaBilancia.key,
          valore: agoItem?.valore ?? agoDellaBilancia.valore,
          rawValue: agoItem?.rawValue ?? 0,
          distributionPercent: agoItem?.distributionPercent ?? 0,
          coincideConFamigliaPrevalente: graduatoria[0]?.familyKey === agoDellaBilancia.key,
        }
      })(),
      relationBreakdown: buildRelationBreakdown({ agoFamilyKey: agoDellaBilancia.key, ranking: graduatoria }),
      relationContract,
      contentCards,
      datiRadar,
      graduatoria,
      topLevelFamilies,
      topRawFamilies,
      famiglieInEvidenza,
      profiloComposto,
      esitoComposizione,
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
    const rankedValues = PORTATO_ORDER
      .map((key, index) => ({ key, index, value: punteggi[key.toLowerCase()] ?? 0 }))
      .sort((a, b) => b.value - a.value || a.index - b.index)
    const leadShare = (rankedValues[0].value - rankedValues[1].value) / portatoSum
    prevalente = leadShare > PORTATO_PRESENTATION_THRESHOLDS.nearShare
      ? rankedValues[0].key
      : ''
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
    Antipatia: 'Distonia, attrito o rifiuto verso parte del materiale ascoltato.',
    Indifferenza: 'Distanza, neutralità o scarso coinvolgimento verso gli stimoli.',
  }
  const quoteNormalizzate = Object.fromEntries(PORTATO_ORDER.map((key) => {
    const valore = punteggi[key.toLowerCase()] ?? 0
    return [key, portatoSum > 0 ? valore / portatoSum : 0]
  }))
  const percentualiPortato = allocateRoundedPercentages(
    PORTATO_ORDER.map((key) => punteggi[key.toLowerCase()] ?? 0),
  )
  const dimensioni = PORTATO_ORDER.map((key, index) => {
    const valore = punteggi[key.toLowerCase()] ?? 0
    const quotaNormalizzata = quoteNormalizzate[key]
    return {
      key,
      label: PORTATO_PRESENTATION_LABELS[key],
      valore,
      percentuale: percentualiPortato[index],
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
    criterioPrevalente: 'prevalenza_univoca',
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

  /* ── Piano di selezione contenuti (Fase 2B) ────────────────────────────
   * Solo chiavi/ruoli/segnalazioni, nessun testo caricato: la riconciliazione con le
   * chiavi editoriali realmente disponibili resta per la Fase 2C. Uno scope per
   * globalProfileContract, uno per natureScopeContract, uno per ciascun rapporto
   * (chiave = rapporti[].id), senza mai unificare i quattro scope tra loro. ── */
  const relationContentPlans = Object.fromEntries(
    rapporti.map((rapporto) => [
      rapporto.id,
      {
        status: rapporto.relationContract?.status || 'invalid_input',
        referenceFamilyKey: rapporto.relationContract?.referenceFamilyKey ?? null,
        primaryKeys: rapporto.relationContract?.localContentPlan?.primaryKeys || [],
        companionKeys: rapporto.relationContract?.localContentPlan?.companionKeys || [],
        marginalKeys: rapporto.relationContract?.localContentPlan?.marginalKeys || [],
        tensionKeys: rapporto.relationContract?.tensionKeys || [],
        theoreticalRelationKeys: rapporto.relationContract?.theoreticalRelationKeys || [],
        missingContentKeys: [],
      },
    ]),
  )
  const contentSelectionPlan = {
    status: [globalProfileContract, natureScopeContract, ...rapporti.map((r) => r.relationContract)]
      .every((contract) => contract?.status === 'ready')
      ? 'ready'
      : 'incomplete_content',
    scopes: {
      global: globalProfileContract.contentPlan || null,
      nature: natureScopeContract.contentPlan || null,
      ...relationContentPlans,
    },
  }

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
    globalProfileContract,
    natureScopeContract,
    contentSelectionPlan,
    _fallbacks: fallbacks,
  }
}

export default buildReportData
