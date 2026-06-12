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
 *   correnti: [{ nome, colore, peso, label, familyKey, statiAnimo[], sottoCorrenti[] }],  // 5 famiglie
 *   sottocorrenti: [{ rawKey, nome, familyName, valore, percentuale, intervalNote }],
 *   profiloEmotivo: { sezioni: [{ id, label, titolo, testo, correnteColore, correnteSecondaria? }] },
 *   approfondimento: { sezioniData, sezioniTest },
 *   rapporti: [{ id, nome, definizione, composizione, cosaIndica, correntePrincipale{nome,colore}, datiRadar[{corrente,valore}] }],
 *   punteggi: { simpatia, antipatia, indifferenza },
 *   portato: {
 *     simpatia, antipatia, indifferenza,
 *     prevalente, prevalenteLabel, descrizione, vitalita,
 *     dimensioni: [{ key, label, valore, percentuale, definizioneBreve }],
 *   },
 *   statiAnimo: [{ parola, corrente, colore, peso }],
 *   sintesi: { paragrafi: string[], testo: string, datiRadar: [{ corrente, valore }] },
 *   coloriCorrenti: { [nome]: hex },
 *   rawRecord,
 *   _fallbacks: string[],
 * }
 */

import reportContent from '../content_report.json'
import { computeColorTotals, computeSezioniTotalsFromRaw } from './reportRecordUtils.js'
import { THEORETICAL_MAX_COLOR_TOTALS } from '../testLogic.js'
import {
  FAMILY_ORDER,
  FAMILY_THEME,
  FAMILY_NAME_BY_KEY,
  getFamilyTheme,
} from '../config/reportFamilyTheme'
import { PROFILE_PDF_BLOCKS } from '../reportProfiloPdf.js'
import { buildIntegrativeParagraphs, buildSintesiLead, buildSintesiKeyFacts, buildSintesiLeadExtended } from '../content/reportRestitution.js'
import {
  FAMIGLIE_LESSICO,
  getFamigliaLessico,
  getFullLessicoForFamily,
} from '../content/statiAnimoLessico.js'
import { trimProfiloChapterText } from './profiloDisplayCopy.js'
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
    const percentuale = max > 0 ? Math.round(Math.min(100, Math.max(0, (valore / max) * 100))) : 0

    return {
      rawKey: meta.rawKey,
      nome: rawKeyToLabel(meta.rawKey),
      familyName: meta.familyName,
      familyKey: meta.familyKey,
      corrente: theme?.corrente || meta.familyName,
      macroLabel: theme?.macro || meta.familyName,
      colore: doc.accentHex || theme?.dot || '#94a3b8',
      shadeLabel: doc.shadeLabel || '',
      intervalNote: doc.intervalNote || '',
      valore,
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

/** Percentuale del valore famiglia rispetto al massimo teorico (0-100). */
function familyPercent(value, max) {
  const v = Number(value) || 0
  const m = Number(max) || 0
  if (m <= 0) return 0
  return Math.round(Math.min(100, Math.max(0, (v / m) * 100)))
}

function titleCaseStato(word) {
  const t = String(word || '').trim()
  if (!t) return ''
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
}

/**
 * Parole nominali emerse dalle risposte DIZIONARIO_2 (file 29–42).
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
        const id = `${parola}|${theme.corrente}`
        const prev = byKey.get(id)
        byKey.set(id, {
          parola,
          corrente: theme.corrente,
          colore: theme.dot,
          familyKey,
          familyName,
          correnteKey,
          count: (prev?.count || 0) + 1,
          peso: 'emersa',
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
  portatoEsperienziale,
  focus,
  nomeCompleto,
} = {}) {
  const fallbacks = []
  const rawRecord = record?.raw || {}
  const totals = totalsByKey || computeColorTotals(rawRecord)
  const domTheme = getFamilyTheme(dominantColorName)

  /* ── Le 5 correnti (famiglie) con peso percentuale reale ──────────── */
  const correnti = FAMILY_ORDER.map((familyName) => {
    const theme = FAMILY_THEME[familyName]
    const key = theme.key
    const peso = familyPercent(totals?.[key], THEORETICAL_MAX_COLOR_TOTALS?.[key])
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
      peso,
      criterioPeso: 'attivazione',
      descrizioneBreve,
      lessico,
      statiAnimo: lessico,
      sottoCorrenti: famigliaLessico?.sottoCorrenti || [],
    }
  })

  const correntiByPeso = [...correnti].sort((a, b) => b.peso - a.peso)
  const sottocorrenti = buildSottocorrenti(rawRecord)
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
    focus: focus || textBlock?.restituzione_dimensione || '',
    colore: domTheme.dot,
    coloreChiara: undefined,
    coloreMedia: undefined,
    criterioNatura: 'prevalenza',
    criterioFamiglia: 'prevalenza',
    criterioTemperamento: 'prevalenza',
  }

  /* ── Profilo emotivo: 4 pannelli (natura/racconto/risorse/ombre) ──── */
  const pdf = pdfEarly
  const secondColor = correntiByPeso[1]?.colore || domTheme.dot

  const naturaTesto = trimProfiloChapterText(
    'natura',
    pdf?.natura_paragrafi || textBlock?.descrizione_estesa || '',
  )
  const raccontoTesto = trimProfiloChapterText(
    'racconto',
    pdf?.descrizione_estesa || textBlock?.descrizione_estesa || '',
  )
  const risorseTesto = trimProfiloChapterText('risorse', pdf?.risorse || textBlock?.risorse || '')
  const ombreTesto = trimProfiloChapterText('ombre', pdf?.ombre || textBlock?.ombre || '')

  if (!pdf) fallbacks.push('profiloEmotivo: testi estesi PDF assenti, uso descrizione/risorse/ombre da content_report.')
  if (!naturaTesto) fallbacks.push('profiloEmotivo.natura: testo mancante.')
  if (!raccontoTesto) fallbacks.push('profiloEmotivo.racconto: testo mancante.')
  if (!risorseTesto) fallbacks.push('profiloEmotivo.risorse: testo mancante.')
  if (!ombreTesto) fallbacks.push('profiloEmotivo.ombre: testo mancante.')

  const labelBase = `${profilo.natura} · ${profilo.disposizione}`.trim()
  const famigliaLabel = dominantColorName || domTheme.label
  const profiloEmotivo = {
    sezioni: [
      {
        id: 'natura',
        label: labelBase,
        capitolo: 'Capitolo 1',
        titolo: 'La tua Natura',
        sottotitolo: 'Il nucleo emotivo da cui muovono desideri, attese e ritiri',
        testo: naturaTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
      },
      {
        id: 'racconto',
        label: 'Il tuo racconto',
        capitolo: 'Capitolo 2',
        titolo: 'Il tuo Racconto',
        sottotitolo: 'Memoria, ascolto e modo in cui questa natura attraversa la tua storia',
        testo: raccontoTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
      },
      {
        id: 'risorse',
        label: 'Le tue risorse',
        capitolo: 'Capitolo 3',
        titolo: 'Le tue Risorse',
        sottotitolo: `Cosa la famiglia ${famigliaLabel} ti offre quando sei in ascolto di te stesso`,
        testo: risorseTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
        correnteSecondaria: secondColor,
      },
      {
        id: 'ombre',
        label: 'Le tue ombre',
        capitolo: 'Capitolo 4',
        titolo: 'Le tue Ombre',
        sottotitolo: `Dove la stessa qualità, se irrigidita, può richiedere più equilibrio (${famigliaLabel})`,
        testo: ombreTesto || 'Sezione narrativa non disponibile per questo profilo.',
        correnteColore: domTheme.dot,
      },
    ],
  }

  /* ── I quattro rapporti (radar data-driven dai livelli reali) ─────── */
  const RAPPORTI_META = [
    {
      id: 'natura',
      nome: 'Natura di base',
      composizione: 'Timbro + Intervalli + Armonia',
      definizione:
        'Il suolo emotivo di fondo: Terra sonora (Timbro), Luce sonora (Intervalli) e Calore sonoro (Armonia). Mostra l’impronta che tendi ad abitare al di là delle situazioni.',
      cosaIndica:
        'Sintesi strutturale della disposizione prevalente: come risuoni nel profondo, prima della pressione delle circostanze.',
    },
    {
      id: 'se',
      nome: 'Rapporto con te stesso',
      composizione: 'Intervalli + Melodia',
      definizione:
        'Il dialogo con l’interiorità: Luce sonora (Intervalli) e Aria sonora (Melodia). Indica riflessione, qualità del sentire e racconto personale.',
      cosaIndica:
        'Quanto spazio dai all’interiorità e a nominare ciò che vivi dentro di te.',
    },
    {
      id: 'altro',
      nome: 'Rapporto con l’Altro',
      composizione: 'Timbro + Melodia',
      definizione:
        'La disponibilità relazionale: Terra sonora (Timbro) e Aria sonora (Melodia). Mostra come ti apri verso persone e ambiente.',
      cosaIndica:
        'Il modo in cui entri in contatto, ti lasci toccare e rispondi al mondo relazionale.',
    },
    {
      id: 'agire',
      nome: 'Rapporto con l’Agire',
      composizione: 'Ritmo + Melodia',
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
    const datiRadar = radarFamilies.map((f) => ({
      corrente: f.nome,
      valore: Number(levels?.[f.key]) || 0,
    }))
    const principale = radarFamilies.reduce(
      (best, f) => {
        const v = Number(levels?.[f.key]) || 0
        return v > best.valore ? { ...f, valore: v } : best
      },
      { ...radarFamilies[0], valore: -Infinity },
    )
    return {
      id: meta.id,
      nome: meta.nome,
      definizione: meta.definizione,
      composizione: meta.composizione,
      cosaIndica: meta.cosaIndica,
      correntePrincipale: { nome: principale.nome, colore: principale.colore },
      datiRadar,
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

  /* ── Sintesi (narrativa + radar percentuali famiglie) ───────────────── */
  const sintesiParagrafi = buildSintesiNarrative({
    profilo,
    correntiByPeso,
    domTheme: domTheme,
    textBlock,
    portato,
    sottodisposizione: rawRecord.Sottodisposizione_Prevalente || '',
  })
  const datiRadar = correnti.map((c) => ({
    corrente: c.nome,
    valore: Number(c.peso) || 0,
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
    sottodisposizione: rawRecord.Sottodisposizione_Prevalente || '',
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
    profiloEmotivo,
    approfondimento: { sezioniData, sezioniTest },
    rapporti,
    punteggi,
    portato,
    statiAnimo,
    paroleEmerse,
    famiglieLessico,
    filtroMusicale,
    sintesi,
    coloriCorrenti,
    colorTotals: totals,
    rawRecord,
    _fallbacks: fallbacks,
  }
}

export default buildReportData
