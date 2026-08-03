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
import {
  buildNaturaNarrative,
  NATURA_NARRATIVE_STATUS,
} from './buildNaturaNarrative.js'
import {
  buildActionNarrative,
  buildOtherNarrative,
  buildSelfNarrative,
} from './buildFourRelationsNarrative.js'

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
  BLU_3_Nostalgia: MALINCONICA_NOSTALGICA_LABEL,
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
    const value = Number(rawRecord[key]) || 0
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
function resolveNaturaLevelLabel(status) {
  if (status === NATURA_NARRATIVE_STATUS.EMPTY) return 'Dati insufficienti'
  if (status === NATURA_NARRATIVE_STATUS.TRUE_TIE) return 'Prevalenza condivisa — profilo composito'
  if (status === NATURA_NARRATIVE_STATUS.ROUNDED_TIE) return 'Valori ravvicinati — profilo composito'
  if (status === NATURA_NARRATIVE_STATUS.COMPOSITE) return 'Profilo composito — compresenza emotiva'
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
      composizione: 'Timbro + Intervalli + Armonia',
      composizioneSemplice:
        'Questa parte somma i punti ottenuti nelle risposte su Timbro, Intervalli e Armonia, separatamente per ciascuna famiglia emotiva.',
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
      ? 'Dati insufficienti per descrivere la composizione di questa lente.'
      : topRawFamilies.length > 1
        ? `Prevalenza a pari punti: ${formatFamilyLevels(topRawFamilies)}.`
        : topLevelFamilies.length > 1
          ? `Più famiglie raggiungono 7/7 dopo la normalizzazione: ${formatFamilyLevels(topLevelFamilies)}.`
          : profiloComposto
            ? `Profilo composto: ${formatFamilyLevels(famiglieInEvidenza)}.`
            : `Famiglia prevalente: ${formatFamilyLevels(graduatoria.slice(0, 1))}.`
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
    const naturaBaseTheme = radarFamilies.find(
      (family) => family.key === naturaBaseFamilyKey,
    ) || radarFamilies[0]
    const naturaBaseFamily = {
      ...naturaBaseTheme,
      valore: Number(levels?.[naturaBaseFamilyKey]) || 0,
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
    const naturaLeader = graduatoria[0]
    const naturaFamily = (naturaLeader?.rawValue || 0) > 0
      ? {
          ...naturaLeader,
          key: naturaLeader.familyKey,
          nome: naturaLeader.corrente,
        }
      : dominantFamily
    const usesNaturaBaseFamily = isSe
    const principale = isAltro
      ? enthusiasmFamily
      : isAgire
        ? volitiveFamily
        : isNatura
          ? naturaFamily
        : usesNaturaBaseFamily
          ? naturaBaseFamily
          : localPrincipale
    const relationshipNarrative = isNatura
      ? buildNaturaNarrative({
          dominantFamilyKey: naturaFamily.key,
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
    const definizioneParagrafi = relationshipNarrative?.paragraphs || [meta.definizione]
    const sintesiBreveParagrafi = relationshipNarrative?.frontParagraphs?.length
      ? relationshipNarrative.frontParagraphs
      : definizioneParagrafi.slice(0, 2)
    const definizione = definizioneParagrafi.join(' ')
    const levelLabel = isNatura
      ? resolveNaturaLevelLabel(relationshipNarrative.status)
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
    simpatia: Number(portTotals.simpatia ?? rawRecord.PE_Simpatia) || 0,
    antipatia: Number(portTotals.antipatia ?? rawRecord.PE_Antipatia) || 0,
    indifferenza: Number(portTotals.indifferenza ?? rawRecord.PE_Indifferenza) || 0,
  }

  const PORTATO_ORDER = ['Simpatia', 'Antipatia', 'Indifferenza']
  const portatoSum = punteggi.simpatia + punteggi.antipatia + punteggi.indifferenza
  const prevalenteFromRecord = (rawRecord.Portato_Esperienziale_Prevalente || '').trim()
  let prevalente =
    portatoEsperienziale?.dominantKey ||
    (PORTATO_ORDER.includes(prevalenteFromRecord) ? prevalenteFromRecord : '')
  if (!prevalente && portatoSum > 0) {
    const best = PORTATO_ORDER.reduce((acc, key) => {
      const v = punteggi[key.toLowerCase()] ?? 0
      if (!acc || v > acc.valore) return { key, valore: v }
      return acc
    }, null)
    prevalente = best?.key || ''
  }
  const portatoContent = reportContent?.portato_esperienziale || {}
  const prevalenteLabel = prevalente
    ? portatoContent[prevalente]?.label || prevalente
    : ''
  const descrizione =
    portatoEsperienziale?.description ||
    (prevalente ? portatoContent[prevalente]?.descrizione_breve : '') ||
    ''
  const vitalita = portatoEsperienziale?.vitalityInterpretation || ''
  const definizioneBreveByKey = {
    Simpatia: 'Attrazione, piacere e coinvolgimento verso gli stimoli ascoltati.',
    Antipatia: 'Rifiuto, distanza o fastidio verso parte del materiale ascoltato.',
    Indifferenza: 'Distacco, neutralità o scarso coinvolgimento verso gli stimoli.',
  }
  const dimensioni = PORTATO_ORDER.map((key) => {
    const valore = punteggi[key.toLowerCase()] ?? 0
    const percentuale =
      portatoSum > 0 ? Math.round((valore / portatoSum) * 100) : 0
    return {
      key,
      label: portatoContent[key]?.label || key,
      valore,
      percentuale,
      criterioValore: 'prevalenza',
      criterioPercentuale: 'quota',
      definizioneBreve: definizioneBreveByKey[key] || '',
    }
  })
  const portato = {
    simpatia: punteggi.simpatia,
    antipatia: punteggi.antipatia,
    indifferenza: punteggi.indifferenza,
    prevalente,
    prevalenteLabel,
    descrizione,
    vitalita,
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
