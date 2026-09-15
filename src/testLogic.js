// Motore logico statico per il Test Temperamentale (TST).
// Contiene:
// - Dizionario 1 (15 sensazioni)
// - Dizionario 2 (14 aggettivi complessi)
// - Logiche di Affinità (Base, Eccezione, Standard)
// - Helper per pesi speciali e gruppi di domanda per i 72 file

// Blocco C: Portato Esperienziale
export const PORTATO_KEYS = {
  SIMPATIA: 'PE_Simpatia',
  ANTIPATIA: 'PE_Antipatia',
  INDIFFERENZA: 'PE_Indifferenza',
}

// Blocco D: Correnti emotive
export const CORRENTE_KEYS = {
  BLU_1: 'BLU_1_Depressiva',
  BLU_2: 'BLU_2_Lunare',
  BLU_3: 'BLU_3_Nostalgia',
  BLU_4: 'BLU_4_Solare',
  ROSSO_1: 'ROSSO_1_Assertivita',
  ROSSO_2: 'ROSSO_2_Dubbio_Collera',
  VERDE_1: 'VERDE_1_CalmaContemplativa',
  VERDE_2: 'VERDE_2_CalmaFisica',
  GIALLO_1: 'GIALLO_1_Gioia_Entusiasmo',
  GIALLO_2: 'GIALLO_2_Volitivo_Passionale',
  GRIGIO_1: 'GRIGIO_1_Anaffettiva',
}

// DIZIONARIO 1 (Le 15 Sensazioni). Valore base: +1 punto.
// Chiave: etichetta mostrata in UI (Gruppo B).
export const DIZIONARIO_1 = {
  'Mi dà gioia': {
    correnteKey: CORRENTE_KEYS.GIALLO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi inquieta': {
    correnteKey: CORRENTE_KEYS.ROSSO_2,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Mi spegne': {
    correnteKey: CORRENTE_KEYS.BLU_1,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Mi stupisce': {
    correnteKey: CORRENTE_KEYS.GIALLO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi rilassa': {
    correnteKey: CORRENTE_KEYS.VERDE_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi disturba / mi repelle': {
    correnteKey: CORRENTE_KEYS.ROSSO_2,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Mi è indifferente': {
    correnteKey: CORRENTE_KEYS.GRIGIO_1,
    portatoKey: PORTATO_KEYS.INDIFFERENZA,
    baseValue: 1,
  },
  'Mi calma / mi fa sognare': {
    correnteKey: CORRENTE_KEYS.VERDE_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi accende / mi motiva': {
    correnteKey: CORRENTE_KEYS.ROSSO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi irrita / mi infastidisce': {
    correnteKey: CORRENTE_KEYS.ROSSO_2,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Mi annoia / mi stufa': {
    correnteKey: CORRENTE_KEYS.GRIGIO_1,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Mi completa / mi incoraggia': {
    correnteKey: CORRENTE_KEYS.ROSSO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi fa riflettere / mi porta a ricordare': {
    correnteKey: CORRENTE_KEYS.BLU_3,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi arrovella / mi rattrista': {
    correnteKey: CORRENTE_KEYS.BLU_2,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Mi accompagna / mi consola': {
    correnteKey: CORRENTE_KEYS.BLU_4,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
}

// DIZIONARIO 2 (I 14 Aggettivi Complessi). Valore base: +1 punto.
// Chiave: etichetta mostrata in UI (Gruppo C).
// Ogni triade usa solo aggettivi canonici della Natura corrispondente, tracciati a
// src/content/paroleTst.js (fonte: PAROLE PER TST — Franco Mussida, 29/08/2026).
export const DIZIONARIO_2 = {
  'Saldo - sicuro - volitivo': {
    correnteKey: CORRENTE_KEYS.ROSSO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Sognante - meditativo - ascetico': {
    correnteKey: CORRENTE_KEYS.VERDE_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Angosciato - avvilito - sofferente': {
    correnteKey: CORRENTE_KEYS.BLU_1,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Sereno - fiducioso - aperto': {
    correnteKey: CORRENTE_KEYS.BLU_4,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Malinconico - triste - pensieroso': {
    correnteKey: CORRENTE_KEYS.BLU_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Rabbioso - diffidente - dubbioso': {
    correnteKey: CORRENTE_KEYS.ROSSO_2,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Ambiguo - incerto - equivoco': {
    correnteKey: CORRENTE_KEYS.ROSSO_2,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Calmo - prudente - lento': {
    correnteKey: CORRENTE_KEYS.VERDE_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Gioioso - caloroso - festoso': {
    correnteKey: CORRENTE_KEYS.GIALLO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Dinamico - curioso - fluido': {
    correnteKey: CORRENTE_KEYS.GIALLO_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Nostalgico - rimembrante - afflitto': {
    correnteKey: CORRENTE_KEYS.BLU_3,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Desolato - rimpiangente - abbandonato': {
    correnteKey: CORRENTE_KEYS.BLU_3,
    portatoKey: PORTATO_KEYS.ANTIPATIA,
    baseValue: 1,
  },
  'Illuminato - amorevole - passionale': {
    correnteKey: CORRENTE_KEYS.GIALLO_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  'Mi è indifferente': {
    correnteKey: CORRENTE_KEYS.GRIGIO_1,
    portatoKey: PORTATO_KEYS.INDIFFERENZA,
    baseValue: 1,
  },
}

// Logiche di Affinità (valori base, non ancora applicati a file specifici)
export const AFFINITA_BASE_OPZIONI = [
  {
    id: 'opzione1',
    correnteKey: CORRENTE_KEYS.GIALLO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'opzione2',
    correnteKey: CORRENTE_KEYS.VERDE_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'opzione3',
    correnteKey: CORRENTE_KEYS.ROSSO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'opzione4',
    correnteKey: CORRENTE_KEYS.BLU_4,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'nessuna',
    correnteKey: CORRENTE_KEYS.GRIGIO_1,
    portatoKey: PORTATO_KEYS.INDIFFERENZA,
    baseValue: 1,
  },
]

export const AFFINITA_ECCEZIONE_OPZIONI = [
  {
    id: 'opzione1',
    correnteKey: CORRENTE_KEYS.BLU_3,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 2, // +2 punti
  },
  {
    id: 'opzione2',
    correnteKey: CORRENTE_KEYS.ROSSO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 2,
  },
  {
    id: 'opzione3',
    correnteKey: CORRENTE_KEYS.VERDE_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 2,
  },
  {
    id: 'opzione4',
    correnteKey: CORRENTE_KEYS.GIALLO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 2,
  },
  {
    id: 'nessuna',
    correnteKey: CORRENTE_KEYS.GRIGIO_1,
    portatoKey: PORTATO_KEYS.INDIFFERENZA,
    baseValue: 2,
  },
]

export const AFFINITA_STANDARD_OPZIONI = [
  {
    id: 'opzione1',
    correnteKey: CORRENTE_KEYS.BLU_3,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'opzione2',
    correnteKey: CORRENTE_KEYS.ROSSO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'opzione3',
    correnteKey: CORRENTE_KEYS.VERDE_2,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'opzione4',
    correnteKey: CORRENTE_KEYS.GIALLO_1,
    portatoKey: PORTATO_KEYS.SIMPATIA,
    baseValue: 1,
  },
  {
    id: 'nessuna',
    correnteKey: CORRENTE_KEYS.GRIGIO_1,
    portatoKey: PORTATO_KEYS.INDIFFERENZA,
    baseValue: 1,
  },
]

// Pesi speciali per i file: +2 per 42, 43, 44, 45, 46. Tutti gli altri +1.
export function getScoreWeightForFile(fileNumber) {
  if ([42, 43, 44, 45, 46].includes(fileNumber)) {
    return 2
  }
  return 1
}

// Mappatura Gruppi di Domande per i 72 file (A, B, C, C_BIS, D, E, F).
export function getQuestionGroupForFile(fileNumber) {
  if (fileNumber >= 1 && fileNumber <= 4) return 'A' // Affinità Base
  if (fileNumber >= 5 && fileNumber <= 28) return 'B' // 15 sensazioni
  if (fileNumber === 41 || fileNumber === 42) return 'C_BIS' // Doppia riconferma ravvicinata
  if (fileNumber >= 29 && fileNumber <= 40) return 'C' // 14 aggettivi complessi (senza interrompere presto)
  if (fileNumber === 46) return 'D' // Eccezione velocità
  if (fileNumber === 51) return 'E' // Eccezione andamento ritmico
  if (fileNumber === 58) return 'F' // Eccezione andamento note
  // Tutti i restanti secondo il Master usano ancora le 15 sensazioni (Gruppo B)
  return 'B'
}

// Quale logica di calcolo usare per ogni file (Dizionario 1, Dizionario 2, Affinità...).
export function getLogicTypeForFile(fileNumber) {
  if (fileNumber >= 1 && fileNumber <= 4) return 'AFFINITA_BASE'
  if (fileNumber >= 5 && fileNumber <= 28) return 'DIZIONARIO_1'
  if (fileNumber >= 29 && fileNumber <= 42) return 'DIZIONARIO_2'
  if (fileNumber >= 43 && fileNumber <= 45) return 'DIZIONARIO_1'
  if (fileNumber === 46) return 'AFFINITA_ECCEZIONE'
  if (fileNumber >= 47 && fileNumber <= 50) return 'DIZIONARIO_1'
  if (fileNumber === 51) return 'AFFINITA_STANDARD'
  if (fileNumber >= 52 && fileNumber <= 57) return 'DIZIONARIO_1'
  if (fileNumber === 58) return 'AFFINITA_STANDARD'
  if (fileNumber >= 59 && fileNumber <= 72) return 'DIZIONARIO_1'
  return null
}

// Calcola il delta di punteggio per una risposta, senza toccare direttamente lo stato Firestore.
export function computeScoreDeltaForAnswer({
  fileNumber,
  answerLabel,
  affinitaOptionId,
  isConfirmation = false,
}) {
  const group = getQuestionGroupForFile(fileNumber)
  const logicType = getLogicTypeForFile(fileNumber)

  let correnteKey = null
  let portatoKey = null
  let value = 0

  if (logicType === 'DIZIONARIO_1') {
    const entry = DIZIONARIO_1[answerLabel]
    if (!entry) return {}
    correnteKey = entry.correnteKey
    portatoKey = entry.portatoKey
    value = entry.baseValue * getScoreWeightForFile(fileNumber)
  } else if (logicType === 'DIZIONARIO_2') {
    const entry = DIZIONARIO_2[answerLabel]
    if (!entry) return {}
    correnteKey = entry.correnteKey
    portatoKey = entry.portatoKey
    value = entry.baseValue * getScoreWeightForFile(fileNumber)
  } else if (logicType === 'AFFINITA_BASE') {
    const entry = AFFINITA_BASE_OPZIONI.find((o) => o.id === affinitaOptionId)
    if (!entry) return {}
    correnteKey = entry.correnteKey
    portatoKey = entry.portatoKey
    value = entry.baseValue
  } else if (logicType === 'AFFINITA_ECCEZIONE') {
    const entry = AFFINITA_ECCEZIONE_OPZIONI.find((o) => o.id === affinitaOptionId)
    if (!entry) return {}
    correnteKey = entry.correnteKey
    portatoKey = entry.portatoKey
    value = entry.baseValue
  } else if (logicType === 'AFFINITA_STANDARD') {
    const entry = AFFINITA_STANDARD_OPZIONI.find((o) => o.id === affinitaOptionId)
    if (!entry) return {}
    correnteKey = entry.correnteKey
    portatoKey = entry.portatoKey
    value = entry.baseValue
  }

  const delta = {}
  if (correnteKey) delta[correnteKey] = value
  if (portatoKey) delta[portatoKey] = value

  // Riconferma in-step: aggiunge +1 a disposizione (corrente) e sottodisposizione (portato).
  if (group === 'C_BIS' && isConfirmation && correnteKey && portatoKey) {
    delta[correnteKey] = (delta[correnteKey] || 0) + 1
    delta[portatoKey] = (delta[portatoKey] || 0) + 1
  }

  return delta
}

/** Varianti di risposta considerate per il massimo teorico file-per-file (solo chiavi corrente). */
function getPossibleAnswerParamsForFile(fileNumber) {
  const logicType = getLogicTypeForFile(fileNumber)
  const group = getQuestionGroupForFile(fileNumber)

  const wrapConfirmation = (paramsList) => {
    if (group !== 'C_BIS') return paramsList
    const extended = []
    for (const p of paramsList) {
      extended.push({ ...p, isConfirmation: false })
      extended.push({ ...p, isConfirmation: true })
    }
    return extended
  }

  const baseVariants = []
  if (logicType === 'DIZIONARIO_1') {
    for (const answerLabel of Object.keys(DIZIONARIO_1)) baseVariants.push({ answerLabel })
    return wrapConfirmation(baseVariants)
  }
  if (logicType === 'DIZIONARIO_2') {
    for (const answerLabel of Object.keys(DIZIONARIO_2)) baseVariants.push({ answerLabel })
    return wrapConfirmation(baseVariants)
  }
  if (logicType === 'AFFINITA_BASE') {
    for (const o of AFFINITA_BASE_OPZIONI) baseVariants.push({ affinitaOptionId: o.id })
    return wrapConfirmation(baseVariants)
  }
  if (logicType === 'AFFINITA_ECCEZIONE') {
    for (const o of AFFINITA_ECCEZIONE_OPZIONI) baseVariants.push({ affinitaOptionId: o.id })
    return wrapConfirmation(baseVariants)
  }
  if (logicType === 'AFFINITA_STANDARD') {
    for (const o of AFFINITA_STANDARD_OPZIONI) baseVariants.push({ affinitaOptionId: o.id })
    return wrapConfirmation(baseVariants)
  }
  return []
}

/** Massimo sommabile per ogni corrente se ogni file contribuisse nel modo migliore possibile a quella corrente. */
export const THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY = (() => {
  const sums = {}
  const allCorrenteVals = Object.values(CORRENTE_KEYS)
  for (let fileNumber = 1; fileNumber <= 72; fileNumber += 1) {
    const paramsList = getPossibleAnswerParamsForFile(fileNumber)
    const maxForFile = Object.fromEntries(allCorrenteVals.map((ck) => [ck, 0]))
    for (const params of paramsList) {
      const delta = computeScoreDeltaForAnswer({ fileNumber, ...params })
      for (const ck of allCorrenteVals) {
        maxForFile[ck] = Math.max(maxForFile[ck], delta[ck] || 0)
      }
    }
    for (const ck of allCorrenteVals) {
      sums[ck] = (sums[ck] || 0) + maxForFile[ck]
    }
  }
  return sums
})()

const CK = CORRENTE_KEYS

/** Totali teorici per famiglia colore (somma delle correnti della famiglia). */
export const THEORETICAL_MAX_COLOR_TOTALS = {
  blu:
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.BLU_1] || 0) +
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.BLU_2] || 0) +
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.BLU_3] || 0) +
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.BLU_4] || 0),
  rosso:
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.ROSSO_1] || 0) +
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.ROSSO_2] || 0),
  verde:
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.VERDE_1] || 0) +
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.VERDE_2] || 0),
  giallo:
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.GIALLO_1] || 0) +
    (THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.GIALLO_2] || 0),
  grigio: THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[CK.GRIGIO_1] || 0,
}

