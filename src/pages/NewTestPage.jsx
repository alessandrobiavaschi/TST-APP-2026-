import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { createEmptyTestRecord } from '../dbSchema.js'
import {
  DIZIONARIO_1,
  DIZIONARIO_2,
  AFFINITA_BASE_OPZIONI,
  AFFINITA_ECCEZIONE_OPZIONI,
  AFFINITA_STANDARD_OPZIONI,
  getQuestionGroupForFile,
  computeScoreDeltaForAnswer,
} from '../testLogic.js'
import { db } from '../firebaseConfig.js'
import { saveTestResultForUser } from '../firestore/testResults.js'
import { useUiSounds } from '../UiSoundProvider.jsx'
import { buildTestAudioUrl, getAudioSourceIssue } from '../audioUrls.js'
import { useAuth } from '../AuthContext.jsx'
import { useAdaptiveFlow } from '../hooks/useAdaptiveFlow.js'

function computeColorTotalsForRecord(record) {
  const blu =
    (record.BLU_1_Depressiva || 0) +
    (record.BLU_2_Lunare || 0) +
    (record.BLU_3_Nostalgia || 0) +
    (record.BLU_4_Solare || 0)
  const rosso =
    (record.ROSSO_1_Assertivita || 0) +
    (record.ROSSO_2_Dubbio_Collera || 0)
  const verde = record.VERDE_1_Calma || 0
  const giallo =
    (record.GIALLO_1_Gioia_Entusiasmo || 0) +
    (record.GIALLO_2_Volitivo_Passionale || 0)
  const grigio =
    (record.GRIGIO_1_Distaccato_Nichilista || 0) +
    (record.GRIGIO_2_Intellettuale_Saggio || 0)

  return { blu, rosso, verde, giallo, grigio }
}

function getDisposizionePrevalente(record) {
  if (!record) return ''
  const totals = computeColorTotalsForRecord(record)
  let bestKey = null
  let bestValue = -Infinity

  Object.entries(totals).forEach(([key, value]) => {
    const numeric = Number(value) || 0
    if (numeric > bestValue) {
      bestValue = numeric
      bestKey = key
    }
  })

  if (!bestKey || bestValue <= 0) return ''

  const labels = {
    blu: 'Malinconia',
    rosso: 'Volitività',
    giallo: 'Entusiasmo',
    verde: 'Calma',
    grigio: 'Anaffettività',
  }

  return labels[bestKey] || ''
}

const SOTTODISPOSIZIONE_LABELS = {
  BLU_1_Depressiva: 'Depressiva',
  BLU_2_Lunare: 'Lunare',
  BLU_3_Nostalgia: 'Nostalgia',
  BLU_4_Solare: 'Solare',
  ROSSO_1_Assertivita: 'Assertività',
  ROSSO_2_Dubbio_Collera: 'Dubbio / Collera',
  VERDE_1_Calma: 'Calma',
  GIALLO_1_Gioia_Entusiasmo: 'Gioia / Entusiasmo',
  GIALLO_2_Volitivo_Passionale: 'Volitivo / Passionale',
  GRIGIO_1_Distaccato_Nichilista: 'Distaccato / Nichilista',
  GRIGIO_2_Intellettuale_Saggio: 'Intellettuale / Saggio',
}

function getSottodisposizionePrevalente(record) {
  if (!record) return ''

  const values = {
    BLU_1_Depressiva: record.BLU_1_Depressiva || 0,
    BLU_2_Lunare: record.BLU_2_Lunare || 0,
    BLU_3_Nostalgia: record.BLU_3_Nostalgia || 0,
    BLU_4_Solare: record.BLU_4_Solare || 0,
    ROSSO_1_Assertivita: record.ROSSO_1_Assertivita || 0,
    ROSSO_2_Dubbio_Collera: record.ROSSO_2_Dubbio_Collera || 0,
    VERDE_1_Calma: record.VERDE_1_Calma || 0,
    GIALLO_1_Gioia_Entusiasmo: record.GIALLO_1_Gioia_Entusiasmo || 0,
    GIALLO_2_Volitivo_Passionale: record.GIALLO_2_Volitivo_Passionale || 0,
    GRIGIO_1_Distaccato_Nichilista: record.GRIGIO_1_Distaccato_Nichilista || 0,
    GRIGIO_2_Intellettuale_Saggio: record.GRIGIO_2_Intellettuale_Saggio || 0,
  }

  let bestKey = null
  let bestValue = -Infinity

  Object.entries(values).forEach(([key, value]) => {
    const numeric = Number(value) || 0
    if (numeric > bestValue) {
      bestValue = numeric
      bestKey = key
    }
  })

  if (!bestKey || bestValue <= 0) return ''
  return SOTTODISPOSIZIONE_LABELS[bestKey] || bestKey
}

function getPortatoEsperienzialePrevalente(record) {
  if (!record) return ''
  const simpatia = Number(record.PE_Simpatia) || 0
  const antipatia = Number(record.PE_Antipatia) || 0
  const indifferenza = Number(record.PE_Indifferenza) || 0
  const max = Math.max(simpatia, antipatia, indifferenza)
  if (max <= 0) return ''
  if (simpatia === max) return 'Simpatia'
  if (antipatia === max) return 'Antipatia'
  if (indifferenza === max) return 'Indifferenza'
  return ''
}

function computeAutoFields(record) {
  const disposizione = getDisposizionePrevalente(record)
  const sottodisposizione = getSottodisposizionePrevalente(record)
  const portato = getPortatoEsperienzialePrevalente(record)

  const result = {}
  if (disposizione) result.Disposizione_Prevalente = disposizione
  if (sottodisposizione) result.Sottodisposizione_Prevalente = sottodisposizione
  if (portato) result.Portato_Esperienziale_Prevalente = portato
  return result
}

const STATO_ANIMO_OPTIONS = [
  { value: 'SA_SERENO', label: 'Sereno/a' },
  { value: 'SA_CURIOSO', label: 'Curioso/a' },
  { value: 'SA_SOLLEVATO', label: 'Sollevato/a' },
  { value: 'SA_COINVOLTO', label: 'Coinvolto/a' },
  { value: 'SA_RIFLESSIVO', label: 'Riflessivo/a' },
  { value: 'SA_STANCO', label: 'Stanco/a' },
  { value: 'SA_TESO', label: 'Teso/a' },
  { value: 'SA_CONFUSO', label: 'Confuso/a' },
]

const DIFFICOLTA_TEST_OPTIONS = [
  { value: 'DT_NO', label: 'No' },
  { value: 'DT_SI', label: 'Sì' },
]

const DIFFICOLTA_DETTAGLIO_OPTIONS = [
  { value: 'DD_CONCENTRAZIONE', label: 'Concentrazione / attenzione' },
  { value: 'DD_COMPRENSIONE', label: 'Comprensione delle sensazioni richieste' },
  { value: 'DD_VOLUMI', label: 'Volume / timbro dei suoni' },
  { value: 'DD_DURATA', label: 'Durata complessiva del test' },
  { value: 'DD_CONTESTO', label: 'Ambiente esterno (rumori/interruzioni)' },
  { value: 'DD_TECNICA', label: 'Aspetti tecnici (audio, cuffie, device)' },
]

const AREA_TEST_OPTIONS = [
  { value: 'A', label: 'A - Timbro (file 1-28)' },
  { value: 'B', label: 'B - Intervalli (file 29-41)' },
  { value: 'C', label: 'C - Ritmo (file 42-51)' },
  { value: 'D', label: 'D - Melodia (file 52-58)' },
  { value: 'E', label: 'E - Armonia (file 59-72)' },
]

const AREA_HELP_ITEMS = [
  {
    value: 'A',
    title: 'A · Timbro',
    range: 'File 1-28',
    description: 'Ascolti il colore del suono: brillante, caldo, secco, pieno.',
    simpleCue: 'Sceglila se ti orienti bene quando cambia il carattere del suono.',
  },
  {
    value: 'B',
    title: 'B · Intervalli',
    range: 'File 29-41',
    description: 'Ascolti il rapporto tra due note: più vicino, più distante, più teso o rilassato.',
    simpleCue: 'Sceglila se riconosci con facilità il “salto” tra due suoni.',
  },
  {
    value: 'C',
    title: 'C · Ritmo',
    range: 'File 42-51',
    description: 'Ascolti il movimento del tempo: groove, incastro, spinta del battito.',
    simpleCue: 'Sceglila se ti viene naturale seguire pulsazione e andamento.',
  },
  {
    value: 'D',
    title: 'D · Melodia',
    range: 'File 52-58',
    description: 'Ascolti la direzione delle note: salita, discesa, curve melodiche.',
    simpleCue: 'Sceglila se senti chiaramente “dove va” la linea musicale.',
  },
  {
    value: 'E',
    title: 'E · Armonia',
    range: 'File 59-72',
    description: 'Ascolti come i suoni stanno insieme: equilibrio, tensione, densità.',
    simpleCue: 'Sceglila se percepisci subito quando l’insieme suona stabile o instabile.',
  },
]

const QUALITA_SUONI_OPTIONS = [
  { value: 'QS_OTTIMI', label: 'Ottimi' },
  { value: 'QS_BUONI', label: 'Buoni' },
  { value: 'QS_SUFFICIENTI', label: 'Sufficienti' },
  { value: 'QS_PESSIMI', label: 'Pessimi' },
]

const parseCodes = (value) =>
  String(value || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
const MAX_MULTI_SELECTION = 3

const TOTAL_STEPS = 72
const RESULT_ANALYSIS_DURATION_MS = 5600
const RESULT_ANALYSIS_MESSAGES = [
  'Sigillatura del protocollo percettivo...',
  'Stabilizzazione dei tracciati emotivi...',
  'Integrazione della matrice di ascolto personale...',
  'Validazione della coerenza neuro-affettiva...',
  'Trasferimento controllato al report finale...',
]

const STORAGE_KEY_TEST_STARTED = 'tst_test_started_v1'
const DEBUG_SESSION_RUN_ID = 'run-cbis-30'

function sendDebugLog({ hypothesisId, location, message, data = {}, runId = DEBUG_SESSION_RUN_ID }) {
  // #region agent log
  fetch('http://127.0.0.1:7527/ingest/9a8c1779-de14-406d-8ed0-f0cfc6d332d5',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'9ce234'},body:JSON.stringify({sessionId:'9ce234',runId,hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{})
  // #endregion
}

function getMacroSectionLabel(fileNumber) {
  if (fileNumber >= 1 && fileNumber <= 28) return 'Timbro'
  if (fileNumber >= 29 && fileNumber <= 42) return 'Intervalli'
  if (fileNumber >= 43 && fileNumber <= 51) return 'Ritmo'
  if (fileNumber >= 52 && fileNumber <= 58) return 'Melodia'
  if (fileNumber >= 59 && fileNumber <= 72) return 'Armonia'
  return ''
}

function getQuestionTitleForFile(fileNumber) {
  if (fileNumber >= 1 && fileNumber <= 4) {
    return 'A1) Senti questi quattro suoni e scegli quello più affine alla tua sensibilità musicale.'
  }
  if (fileNumber >= 5 && fileNumber <= 28) {
    return 'A2) Ascolta i seguenti suoni e scegli la sensazione che meglio descrive la tua percezione sonora.'
  }
  if (fileNumber >= 29 && fileNumber <= 40) {
    return 'B) Ascolta le combinazioni di due suoni e scegli un solo aggettivo tra quelli proposti.'
  }
  if (fileNumber === 41) {
    return 'B-bis) Prima riconferma: riascolta e conferma in modo istintivo.'
  }
  if (fileNumber === 42) {
    return 'B-ter) Seconda riconferma: riascolta e conferma in modo istintivo.'
  }
  if (fileNumber === 43 || fileNumber === 44 || fileNumber === 45) {
    return 'C1a) Ascolta i groove e scegli la sensazione che meglio descrive la tua percezione musicale.'
  }
  if (fileNumber === 46) {
    return 'C1b) Quale tra le velocità ascoltate hai sentito più affine alla tua sensibilità musicale?'
  }
  if (fileNumber === 47 || fileNumber === 48 || fileNumber === 49 || fileNumber === 50) {
    return 'C2a) Ascolta gli andamenti ritmici e scegli la sensazione che meglio descrive la tua percezione musicale.'
  }
  if (fileNumber === 51) {
    return 'C2b) Quale tra gli andamenti ritmici ascoltati hai sentito più affine alla tua sensibilità musicale?'
  }
  if (fileNumber >= 52 && fileNumber <= 57) {
    return 'D1) Ascolta l’andamento delle note in successione e scegli la sensazione che meglio descrive la tua percezione musicale.'
  }
  if (fileNumber === 58) {
    return 'D2) Quale tra gli andamenti delle note in successione ascoltate hai sentito più affine alla tua sensibilità musicale?'
  }
  if (fileNumber >= 59 && fileNumber <= 72) {
    return 'E) Ascolta i movimenti dei flussi musicali e scegli la sensazione che meglio descrive la tua percezione musicale.'
  }
  return ''
}

function formatAudioTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
  const mins = Math.floor(safeSeconds / 60)
  const secs = safeSeconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function NewTestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, authReady } = useAuth()
  const uiSounds = useUiSounds()
  const [testRecord, setTestRecord] = useState(() => ({
    ...createEmptyTestRecord(),
    Data_Test: new Date().toISOString().slice(0, 10),
  }))
  const [currentFile, setCurrentFile] = useState(1)
  const {
    rhythm,
    timings,
    uiVars,
    registerSelection: recordInteraction,
    markAudioEnd: trackAudioEnd,
  } =
    useAdaptiveFlow({ stepIndex: currentFile, totalSteps: TOTAL_STEPS })
  const [answersByFile, setAnswersByFile] = useState({})
  const [, setHasSeenIntro] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem('tst_seen_test_intro_v1') === '1'
    } catch {
      return false
    }
  })
  const [showIntro, setShowIntro] = useState(true)
  const [profilingDone, setProfilingDone] = useState(false)
  const [audioError, setAudioError] = useState(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showTutorialCard, setShowTutorialCard] = useState(false)
  const [showAreasHelp, setShowAreasHelp] = useState(false)
  const [isThresholdFocusActive, setIsThresholdFocusActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAudioBusy, setIsAudioBusy] = useState(false)
  const [isChoicesVisible, setIsChoicesVisible] = useState(false)
  const [isProcessingNext, setIsProcessingNext] = useState(false)
  const [isAnalyzingResult, setIsAnalyzingResult] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [, setNeuroChoiceStage] = useState('reset')
  const [neuroStepTransition, setNeuroStepTransition] = useState('enter')
  const [navigationHint, setNavigationHint] = useState('')
  const audioRef = useRef(null)
  const preloadRef = useRef(null)
  const previewAudioRef = useRef(null)
  const analysisRafRef = useRef(null)
  const nextStepTimerRef = useRef(null)
  const resetTimerRef = useRef(null)
  const recallTimerRef = useRef(null)
  const stepEnterTimerRef = useRef(null)

  // Sample da /audio in locale, oppure da VITE_AUDIO_BASE_URL (streaming, senza MP3 nel deploy).
  const audioSrc = buildTestAudioUrl(currentFile)
  const audioSourceIssue = getAudioSourceIssue(audioSrc)
  const currentFileKey = `File_${String(currentFile).padStart(2, '0')}`
  const isCurrentStepAnswered = Boolean((testRecord[currentFileKey] || '').trim())
  const canGoNext = currentFile < TOTAL_STEPS
  const adaptiveUiVars =
    profilingDone && !showIntro
      ? {
          ...uiVars,
          '--adaptive-extra-bottom': rhythm === 'slow' ? '10px' : '0px',
        }
      : undefined
  const selectedAnswerValue = (testRecord[currentFileKey] || '').trim()

  const isGuestMode = location.state && location.state.mode === 'guest'
  const tutorialHighlights = [
    {
      title: 'Ambiente pulito',
      text: 'Scegli un luogo senza rumori o distrazioni esterne: il suono deve essere il protagonista.',
    },
    {
      title: 'Cuffie + volume personale',
      text: 'Indossa le cuffie e regola il volume che senti più adeguato a te. Puoi svolgere il test ad occhi aperti o chiusi.',
    },
    {
      title: 'Zero giudizio (nessun giudizio)',
      text: 'Non esistono risposte giuste o sbagliate: la tua sensibilità musicale e il tuo gusto personale non alterano la validità del test.',
    },
    {
      title: 'Sequenza completa',
      text: 'Segui i 72 step in ordine. Se hai dubbi, riascolta il file e scegli una sola risposta tra quelle proposte.',
    },
    {
      title: 'Fidati del tuo sentire',
      text: 'Rispondi in modo istintivo: il test osserva come reagisci emotivamente agli stimoli e flussi sonori.',
    },
    {
      title: 'Prima di iniziare',
      text: 'Concediti un momento di raccoglimento e silenzio, riduci i pensieri e concentrati sul tuo mondo emotivo interiore.',
    },
  ]

  useEffect(() => {
    if (!authReady) return
    if (!user && !isGuestMode) {
      navigate('/', { replace: true, state: { fromTest: true } })
    }
  }, [authReady, user, isGuestMode, navigate])

  useEffect(() => {
    if (!showTutorialCard) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowTutorialCard(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showTutorialCard])

  useEffect(() => {
    if (!showAreasHelp) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowAreasHelp(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showAreasHelp])

  useEffect(() => {
    if (!showAreasHelp) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showAreasHelp])

  useEffect(() => {
    if (!showTutorialCard) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [showTutorialCard])

  useEffect(() => {
    if (!showIntro) setShowTutorialCard(false)
  }, [showIntro])

  const stopAudio = () => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setAudioCurrentTime(0)
    setAudioProgress(0)
    setIsAudioBusy(false)
  }

  const stopPreviewAudio = () => {
    const preview = previewAudioRef.current
    if (!preview) return
    preview.pause()
    preview.currentTime = 0
    previewAudioRef.current = null
  }

  const explainPlayError = (error) => {
    const issue = getAudioSourceIssue(audioSrc)
    const normalized = String(error?.name || '').toLowerCase()
    if (issue) return issue
    if (normalized.includes('notallowed')) {
      return 'Riproduzione bloccata dal browser mobile. Tocca Play dopo aver interagito con la pagina e verifica il volume.'
    }
    if (normalized.includes('notsupported')) {
      return 'Formato o risposta server non supportati. Verifica che i file siano MP3 validi con Content-Type audio/mpeg.'
    }
    return 'Impossibile riprodurre l’audio. Verifica URL, HTTPS e disponibilita del file.'
  }

  const playCurrentAudio = async ({ restart = false } = {}) => {
    const audio = audioRef.current
    if (!audio || isAudioBusy) return
    setAudioError(null)
    setIsAudioBusy(true)
    try {
      if (restart) {
        audio.playbackRate = 1
        audio.currentTime = 0
      }
      const playPromise = audio.play()
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise
      }
    } catch (error) {
      setAudioError(explainPlayError(error))
    } finally {
      setIsAudioBusy(false)
    }
  }

  const playReferenceAudio = async (fileNumber) => {
    if (!fileNumber) return
    stopAudio()
    stopPreviewAudio()
    setAudioError(null)
    try {
      const preview = new Audio(buildTestAudioUrl(fileNumber))
      preview.preload = 'auto'
      previewAudioRef.current = preview
      const playPromise = preview.play()
      if (playPromise && typeof playPromise.then === 'function') {
        await playPromise
      }
    } catch (error) {
      setAudioError(explainPlayError(error))
    }
  }

  const seekAudioFromEvent = (event) => {
    const audio = audioRef.current
    if (!audio || !audioDuration) return
    const rect = event.currentTarget.getBoundingClientRect()
    const pointerX = typeof event.clientX === 'number' ? event.clientX : 0
    const ratio = (pointerX - rect.left) / rect.width
    const newTime = Math.max(0, Math.min(1, ratio)) * audioDuration
    audio.currentTime = newTime
    setAudioCurrentTime(newTime)
    setAudioProgress((newTime / audioDuration) * 100)
  }

  useEffect(() => {
    setAudioError(null)
    setIsChoicesVisible(false)
    setNavigationHint('')
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
    if (recallTimerRef.current) {
      window.clearTimeout(recallTimerRef.current)
      recallTimerRef.current = null
    }
    if (stepEnterTimerRef.current) {
      window.clearTimeout(stepEnterTimerRef.current)
      stepEnterTimerRef.current = null
    }
    setNeuroChoiceStage('reset')
    setNeuroStepTransition('enter')
    stepEnterTimerRef.current = window.setTimeout(() => {
      setNeuroStepTransition('idle')
      stepEnterTimerRef.current = null
    }, timings.transitionDelayMs)
    resetTimerRef.current = window.setTimeout(() => {
      setNeuroChoiceStage('passive')
      resetTimerRef.current = null
    }, timings.choiceResetMs)
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      // Il nuovo file viene caricato ma non riprodotto automaticamente
      audio.load()
      audio.playbackRate = 1
      audio.preload = 'metadata'
    }
    setAudioProgress(0)
    setAudioDuration(0)
    setAudioCurrentTime(0)

    const nextIndex = currentFile + 1
    if (nextIndex <= 72 && preloadRef.current) {
      const nextSrc = buildTestAudioUrl(nextIndex)
      const resolved = new URL(nextSrc, window.location.href).href
      if (preloadRef.current.src !== resolved) {
        preloadRef.current.src = nextSrc
        preloadRef.current.load()
      }
    }

    if (currentFile >= 29 && currentFile <= 31) {
      sendDebugLog({
        hypothesisId: 'N4',
        location: 'src/pages/NewTestPage.jsx:useEffect[currentFile/audio]',
        message: 'Step media/context snapshot around sezione B',
        data: {
          currentFile,
          audioSrc,
          audioSourceIssue: getAudioSourceIssue(audioSrc) || null,
          currentFileKey,
        },
      })
    }
  }, [
    audioSrc,
    currentFile,
    currentFileKey,
    timings.choiceResetMs,
    timings.fadeInDurationMs,
    timings.transitionDelayMs,
  ])

  useEffect(() => {
    return () => {
      stopPreviewAudio()
      if (nextStepTimerRef.current) {
        window.clearTimeout(nextStepTimerRef.current)
      }
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current)
      }
      if (recallTimerRef.current) {
        window.clearTimeout(recallTimerRef.current)
      }
      if (stepEnterTimerRef.current) {
        window.clearTimeout(stepEnterTimerRef.current)
      }
      if (analysisRafRef.current) {
        window.cancelAnimationFrame(analysisRafRef.current)
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tst:ritual-focus', { detail: { active: false } }))
      }
    }
  }, [])

  const runResultAnalysisTransition = () =>
    new Promise((resolve) => {
      if (analysisRafRef.current) {
        window.cancelAnimationFrame(analysisRafRef.current)
        analysisRafRef.current = null
      }

      setIsAnalyzingResult(true)
      setIsThresholdFocusActive(true)
      setAnalysisProgress(0)
      setAnalysisMessageIndex(0)

      const easeOutCubic = (value) => 1 - (1 - value) ** 3
      const startedAt = performance.now()
      const tick = (now) => {
        const elapsed = now - startedAt
        const linear = Math.min(1, elapsed / RESULT_ANALYSIS_DURATION_MS)
        const eased = easeOutCubic(linear)
        const progressPct = Math.min(100, Math.max(0, eased * 100))
        const nextMessageIndex = Math.min(
          RESULT_ANALYSIS_MESSAGES.length - 1,
          Math.floor(linear * RESULT_ANALYSIS_MESSAGES.length),
        )

        setAnalysisProgress(progressPct)
        setAnalysisMessageIndex(nextMessageIndex)

        if (linear >= 1) {
          analysisRafRef.current = null
          resolve()
          return
        }
        analysisRafRef.current = window.requestAnimationFrame(tick)
      }

      analysisRafRef.current = window.requestAnimationFrame(tick)
    })

  useEffect(() => {
    if (!isThresholdFocusActive || typeof window === 'undefined') return undefined
    window.dispatchEvent(new CustomEvent('tst:ritual-focus', { detail: { active: true } }))
    return () => {
      window.dispatchEvent(new CustomEvent('tst:ritual-focus', { detail: { active: false } }))
    }
  }, [isThresholdFocusActive])

  useEffect(() => {
    if (currentFile < 29 || currentFile > 31) return
    sendDebugLog({
      hypothesisId: 'N5',
      location: 'src/pages/NewTestPage.jsx:useEffect[navigation-state]',
      message: 'Navigation state around C_BIS',
      data: {
        currentFile,
        currentFileKey,
        isCurrentStepAnswered,
        canGoNext,
        storedAnswerForCurrent: (testRecord[currentFileKey] || '').slice(0, 120),
        questionTitle: getQuestionTitleForFile(currentFile),
      },
    })
  }, [currentFile, currentFileKey, isCurrentStepAnswered, canGoNext, testRecord])

  const handleProfilazioneChange = (field) => (event) => {
    const value = event.target.value
    setTestRecord((prev) => {
      if (field === 'Pratica_Musicale' && value === 'NO') {
        return {
          ...prev,
          Pratica_Musicale: value,
          Strumento_Suonato: '',
        }
      }
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  const isProfilingValid = () =>
    Boolean(
      (testRecord.Data_Test || '').trim() &&
        (testRecord.Nome || '').trim() &&
        (testRecord.Cognome || '').trim() &&
        testRecord.Data_Nascita &&
        (testRecord.Titolo_Studio || '').trim() &&
        (testRecord.Pratica_Musicale || '').trim() &&
        (testRecord.Pratica_Musicale !== 'SI' || (testRecord.Strumento_Suonato || '').trim()),
    )

  const handleStartTest = (event) => {
    event.preventDefault()
    const valid = isProfilingValid()
    if (!valid) return
    try {
      window.sessionStorage.setItem(STORAGE_KEY_TEST_STARTED, '1')
    } catch {
      // ignore
    }
    setShowIntro(false)
    setProfilingDone(true)
    try {
      window.localStorage.setItem('tst_seen_test_intro_v1', '1')
      setHasSeenIntro(true)
    } catch {
      // ignore
    }
  }

  const handleAnswer = ({ answerLabel, affinitaOptionId, isConfirmation = false }) => {
    uiSounds?.playSecondaryTap?.()
    setNavigationHint('')
    recordInteraction()
    stopAudio()
    stopPreviewAudio()
    const fileNumber = currentFile
    const previousAnswerForFile = answersByFile[fileNumber]
    if (fileNumber >= 29 && fileNumber <= 31) {
      sendDebugLog({
        hypothesisId: 'N2',
        location: 'src/pages/NewTestPage.jsx:handleAnswer:start',
        message: 'Answer click captured',
        data: {
          fileNumber,
          answerLabel: answerLabel || null,
          affinitaOptionId: affinitaOptionId || null,
          isConfirmation,
          previousDeltaKeys: Object.keys(previousAnswerForFile?.delta || {}),
        },
      })
    }

    const delta = computeScoreDeltaForAnswer({
      fileNumber,
      answerLabel,
      affinitaOptionId,
      isConfirmation,
    })
    const hasDelta = Boolean(delta && Object.keys(delta).length > 0)
    if (fileNumber >= 29 && fileNumber <= 31) {
      sendDebugLog({
        hypothesisId: 'N3',
        location: 'src/pages/NewTestPage.jsx:handleAnswer:delta',
        message: 'Delta computation result',
        data: {
          fileNumber,
          hasDelta,
          deltaKeys: Object.keys(delta || {}),
          deltaValues: delta || {},
        },
      })
    }
    if (!hasDelta) {
      console.warn('Nessun delta calcolato per la risposta (fallback: avanzamento senza punteggio).', {
        fileNumber,
        answerLabel,
        affinitaOptionId,
      })
    }

    setTestRecord((prev) => {
      const next = { ...prev }

      // Se la risposta per questo file esiste già, rimuovi prima il vecchio delta:
      // in questo modo cambiare scelta non accumula punteggio in modo errato.
      Object.entries(previousAnswerForFile?.delta || {}).forEach(([key, value]) => {
        next[key] = (next[key] || 0) - value
      })

      // aggiorna contatori C e D
      if (hasDelta) {
        Object.entries(delta).forEach(([key, value]) => {
          next[key] = (next[key] || 0) + value
        })
      }

      // salva la risposta grezza nel Blocco B
      const fileKey = `File_${String(fileNumber).padStart(2, '0')}`
      next[fileKey] = answerLabel || affinitaOptionId || ''

      console.log('Risposta registrata', {
        fileNumber,
        fileKey,
        answerLabel,
        affinitaOptionId,
        delta,
        contatori: {
          PE_Simpatia: next.PE_Simpatia,
          PE_Antipatia: next.PE_Antipatia,
          PE_Indifferenza: next.PE_Indifferenza,
          BLU_1_Depressiva: next.BLU_1_Depressiva,
          BLU_2_Lunare: next.BLU_2_Lunare,
          BLU_3_Nostalgia: next.BLU_3_Nostalgia,
          BLU_4_Solare: next.BLU_4_Solare,
          ROSSO_1_Assertivita: next.ROSSO_1_Assertivita,
          ROSSO_2_Dubbio_Collera: next.ROSSO_2_Dubbio_Collera,
          VERDE_1_Calma: next.VERDE_1_Calma,
          GIALLO_1_Gioia_Entusiasmo: next.GIALLO_1_Gioia_Entusiasmo,
          GIALLO_2_Volitivo_Passionale: next.GIALLO_2_Volitivo_Passionale,
          GRIGIO_1_Distaccato_Nichilista: next.GRIGIO_1_Distaccato_Nichilista,
          GRIGIO_2_Intellettuale_Saggio: next.GRIGIO_2_Intellettuale_Saggio,
        },
      })

      return next
    })

    setAnswersByFile((prev) => ({
      ...prev,
      [fileNumber]: {
        fileNumber,
        answerLabel,
        affinitaOptionId,
        isConfirmation,
        delta: hasDelta ? delta : {},
      },
    }))

    if (fileNumber >= 29 && fileNumber <= 31) {
      sendDebugLog({
        hypothesisId: 'N3',
        location: 'src/pages/NewTestPage.jsx:handleAnswer:ready',
        message: 'Answer stored, waiting for Next trigger',
        data: {
          fileNumber,
          canGoNextAfterAnswer: true,
        },
      })
    }
    if (fileNumber < TOTAL_STEPS) {
      proceedToNextStep()
    }
  }

  const handleBack = () => {
    uiSounds?.playSwipe?.()
    if (currentFile <= 1) return
    stopAudio()
    stopPreviewAudio()
    setCurrentFile((prev) => prev - 1)
  }

  const proceedToNextStep = () => {
    if (isProcessingNext) return
    if (currentFile >= 29 && currentFile <= 31) {
      sendDebugLog({
        hypothesisId: 'N3',
        location: 'src/pages/NewTestPage.jsx:handleNextStep:allowed',
        message: 'Next allowed',
        data: {
          currentFile,
          currentFileKey,
          currentValue: (testRecord[currentFileKey] || '').slice(0, 120),
          canGoNext,
        },
      })
    }
    if (currentFile >= 72) return
    stopAudio()
    stopPreviewAudio()
    setIsProcessingNext(true)
    setNeuroStepTransition('exit')
    window.requestAnimationFrame(() => {
      uiSounds?.playTransition?.()
    })
    if (nextStepTimerRef.current) {
      window.clearTimeout(nextStepTimerRef.current)
      nextStepTimerRef.current = null
    }
    nextStepTimerRef.current = window.setTimeout(() => {
      setCurrentFile((prev) => prev + 1)
      setIsProcessingNext(false)
      nextStepTimerRef.current = null
    }, timings.processingStateMs)
  }

  const handleNextStep = () => {
    if (!isCurrentStepAnswered) {
      setNavigationHint('Seleziona una risposta per continuare.')
      return
    }
    proceedToNextStep()
  }

  const handleRequestExit = () => {
    uiSounds?.playGhostTap?.()
    stopAudio()
    stopPreviewAudio()
    setShowExitConfirm(true)
  }

  const handleCloseExitConfirm = () => {
    uiSounds?.playGhostTap?.()
    setShowExitConfirm(false)
  }

  const handleConfirmExit = () => {
    uiSounds?.playTransition?.()
    try {
      window.sessionStorage.removeItem(STORAGE_KEY_TEST_STARTED)
    } catch {
      // ignore
    }
    setShowExitConfirm(false)
    if (isGuestMode) {
      navigate('/', { replace: true })
      return
    }
    navigate('/home', { replace: true })
  }

  const isTestComplete = () => {
    for (let n = 1; n <= 72; n += 1) {
      const key = `File_${String(n).padStart(2, '0')}`
      if (!testRecord[key]) return false
    }
    return true
  }

  const isFeedbackComplete = () => {
    const statoAnimoCount = parseCodes(testRecord.Stato_Animo_Finale || '').length
    const areaMaggiorCount = parseCodes(testRecord.Area_Maggior_Agio || '').length
    const areaMinorCount = parseCodes(testRecord.Area_Minor_Agio || '').length
    const isBaseComplete = Boolean(
      (testRecord.Stato_Animo_Finale || '').trim() &&
        (testRecord.Difficolta_Test || '').trim() &&
        (testRecord.Area_Maggior_Agio || '').trim() &&
        (testRecord.Area_Minor_Agio || '').trim() &&
        (testRecord.Qualita_Suoni || '').trim(),
    )
    if (!isBaseComplete) return false
    if (
      statoAnimoCount > MAX_MULTI_SELECTION ||
      areaMaggiorCount > MAX_MULTI_SELECTION ||
      areaMinorCount > MAX_MULTI_SELECTION
    ) {
      return false
    }
    if ((testRecord.Difficolta_Test || '').trim() === 'DT_SI') {
      return Boolean((testRecord.Difficolta_Dettaglio || '').trim())
    }
    return true
  }

  const sanitizePayload = (record) => {
    const out = {}
    Object.entries(record).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        out[key] = value
      }
    })
    return out
  }

  const toggleDifficoltaDettaglio = (code) => {
    setTestRecord((prev) => {
      const current = parseCodes(prev.Difficolta_Dettaglio || '')
      const has = current.includes(code)
      const nextCodes = has ? current.filter((c) => c !== code) : [...current, code]
      return {
        ...prev,
        Difficolta_Dettaglio: nextCodes.join(','),
      }
    })
  }

  const toggleStatoAnimo = (code) => {
    toggleCsvMultiField('Stato_Animo_Finale', code)
  }

  const toggleCsvMultiField = (field, code, maxSelection = MAX_MULTI_SELECTION) => {
    setTestRecord((prev) => {
      const current = parseCodes(prev[field] || '')
      const has = current.includes(code)
      if (has) {
        return {
          ...prev,
          [field]: current.filter((c) => c !== code).join(','),
        }
      }
      if (current.length >= maxSelection) return prev
      return {
        ...prev,
        [field]: [...current, code].join(','),
      }
    })
  }

  const toggleAreaMaggiorAgio = (code) => {
    toggleCsvMultiField('Area_Maggior_Agio', code)
  }

  const toggleAreaMinorAgio = (code) => {
    toggleCsvMultiField('Area_Minor_Agio', code)
  }

  const handleDifficoltaTestChange = (event) => {
    const value = event.target.value
    setTestRecord((prev) => ({
      ...prev,
      Difficolta_Test: value,
      Difficolta_Dettaglio:
        value === 'DT_NO'
          ? 'DD_NESSUNA'
          : prev.Difficolta_Dettaglio === 'DD_NESSUNA'
            ? ''
            : prev.Difficolta_Dettaglio,
    }))
  }

  const handleSubmitTest = async () => {
    if (isSubmitting) return
    const activeUser = user
    const isComplete = isTestComplete()
    const autoFields = computeAutoFields(testRecord)
    const payload = sanitizePayload({
      ...testRecord,
      ...autoFields,
      Stato_Consegna: isComplete ? 'CONSEGNATO' : 'BOZZA',
      Bozza_Test: !isComplete,
    })

    setIsSubmitting(true)
    try {
      if (isGuestMode || !activeUser) {
        const wrapper = {
          id: 'guest',
          raw: {
            ...payload,
            Data_Ora_Fine_Test: new Date(),
          },
        }
        try {
          window.sessionStorage.removeItem(STORAGE_KEY_TEST_STARTED)
        } catch {
          // ignore
        }
        await runResultAnalysisTransition()
        navigate('/risultati/report', { state: { record: wrapper, fromSubmit: true } })
        return
      }

      if (!db) {
        alert('Firebase non configurato. Impossibile salvare. Aggiungi un file .env con le credenziali.')
        return
      }

      const docRef = await saveTestResultForUser({ db, user: activeUser, payload })
      try {
        window.sessionStorage.removeItem(STORAGE_KEY_TEST_STARTED)
      } catch {
        // ignore
      }

      if (!isComplete) {
        alert('Bozza salvata in archivio.')
        navigate('/risultati')
        return
      }

      const wrapper = {
        id: docRef.id,
        raw: payload,
      }
      await runResultAnalysisTransition()
      navigate('/risultati/report', { state: { record: wrapper, fromSubmit: true } })
    } catch (error) {
      console.error('Errore durante il salvataggio del test:', error)
      alert(`Errore durante il salvataggio: ${error?.message || 'Controlla la console e le regole Firestore.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAnswerButtons = () => {
    const group = getQuestionGroupForFile(currentFile)
    if (currentFile >= 29 && currentFile <= 31) {
      sendDebugLog({
        hypothesisId: 'N1',
        location: 'src/pages/NewTestPage.jsx:renderAnswerButtons',
        message: 'Rendering answer block',
        data: {
          currentFile,
          group,
          dizionario1Count: Object.keys(DIZIONARIO_1).length,
          dizionario2Count: Object.keys(DIZIONARIO_2).length,
        },
      })
    }

    if (group === 'B') {
      return (
        <div className="answers-grid answers-grid--dense">
          {Object.keys(DIZIONARIO_1).map((label) => (
            <button
              key={label}
              type="button"
              className={`answer-button ${selectedAnswerValue === label ? 'answer-button-selected' : ''}`}
              onClick={() => handleAnswer({ answerLabel: label })}
            >
              {label}
            </button>
          ))}
        </div>
      )
    }

    if (group === 'C') {
      return (
        <div className="answers-grid answers-grid--dense">
          {Object.keys(DIZIONARIO_2).map((label) => (
            <button
              key={label}
              type="button"
              className={`answer-button ${selectedAnswerValue === label ? 'answer-button-selected' : ''}`}
              onClick={() => handleAnswer({ answerLabel: label })}
            >
              {label}
            </button>
          ))}
        </div>
      )
    }

    if (group === 'C_BIS') {
      const referenceFile = currentFile === 41 ? 29 : 40

      return (
        <div className="answers-c-bis">
          <p className="answers-c-bis-hint">
            Riascolta con calma e scegli l’aggettivo che senti piu coerente per il file {referenceFile}.
            Se vuoi, puoi riascoltare il file di riferimento prima di confermare.
          </p>
          <button
            type="button"
            className="nav-button secondary"
            onClick={() => playReferenceAudio(referenceFile)}
          >
            Riascolta file {referenceFile}
          </button>
          <p className="answers-c-bis-note">
            Questa riconferma rafforza il peso della scelta nel profilo finale.
          </p>
          <div className="answers-grid answers-grid--dense">
            {Object.keys(DIZIONARIO_2).map((label) => (
              <button
                key={label}
                type="button"
                className={`answer-button ${selectedAnswerValue === label ? 'answer-button-selected' : ''}`}
                onClick={() =>
                  handleAnswer({
                    answerLabel: label,
                    isConfirmation: true,
                  })
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )
    }

    let options = []
    if (currentFile >= 1 && currentFile <= 4) {
      options = AFFINITA_BASE_OPZIONI
    } else if (currentFile === 46) {
      options = AFFINITA_ECCEZIONE_OPZIONI
    } else if (currentFile === 51 || currentFile === 58) {
      options = AFFINITA_STANDARD_OPZIONI
    }

    if (options.length > 0) {
      return (
        <div className="answers-grid">
          {options.map((opt, index) => (
            <button
              key={opt.id}
              type="button"
              className={`answer-button ${selectedAnswerValue === opt.id ? 'answer-button-selected' : ''}`}
              onClick={() => handleAnswer({ affinitaOptionId: opt.id })}
            >
              {opt.id === 'nessuna'
                ? 'Nessuna delle 4'
                : `Suono ${index + 1}`}
            </button>
          ))}
        </div>
      )
    }

    return null
  }

  const testCompleted = isTestComplete()
  const isFinalSubmitDisabled = isSubmitting
  const transitionTransform =
    neuroStepTransition === 'exit'
      ? 'translateY(-12px)'
      : neuroStepTransition === 'enter'
        ? 'translateY(12px)'
        : 'translateY(0)'
  const transitionOpacity = neuroStepTransition === 'idle' ? 1 : 0
  const adaptiveTransitionStyle = {
    opacity: transitionOpacity,
    transform: transitionTransform,
    transition: `opacity ${timings.processingStateMs}ms var(--ui-ease), transform ${timings.processingStateMs}ms var(--ui-ease)`,
  }

  useEffect(() => {
    const isSessionActive = profilingDone && !testCompleted
    window.dispatchEvent(
      new CustomEvent('tst:test-session-active', {
        detail: { active: isSessionActive },
      }),
    )
    return () => {
      window.dispatchEvent(
        new CustomEvent('tst:test-session-active', {
          detail: { active: false },
        }),
      )
    }
  }, [profilingDone, testCompleted])

  if (!isGuestMode && !authReady) {
    return (
      <div className="page">
        <section className="page-card">
          <p>Verifica sessione in corso…</p>
        </section>
      </div>
    )
  }

  return (
    <div
      className={`page nuovo-test-page ${
        profilingDone && !testCompleted ? 'nuovo-test-page--session-active' : ''
      }`}
    >
      {showIntro && (
        <div className="serenis-layout">
        <section className="nuovo-test-intro">
          <header className="nuovo-test-hero">
            <div className="nuovo-test-hero-content">
              <div className="nuovo-test-hero-text">
                <p className="nuovo-test-hero-kicker">Test Temperamentale · 72 step guidati</p>
                <h1 className="nuovo-test-hero-title">La tua musica interiore, messa a fuoco</h1>
                <p className="nuovo-test-hero-subtitle">
                  Relazioni, lavoro, scelte quotidiane: molto di quello che vivi dipende da come senti le cose,
                  prima ancora che da quello che pensi.
                </p>
                <div className="nuovo-test-hero-bullets">
                  <div className="nuovo-test-hero-chip">72 step di ascolto mirato</div>
                  <div className="nuovo-test-hero-chip">Profilazione visiva della struttura emotiva</div>
                  <div className="nuovo-test-hero-chip">Nessuna risposta giusta o sbagliata</div>
                </div>
                <div className="nuovo-test-hero-ctas">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      uiSounds?.resumeAudioContext?.()
                      setShowIntro(false)
                      if (isGuestMode) {
                        setProfilingDone(true)
                      } else {
                        setProfilingDone(false)
                      }
                      try {
                        window.localStorage.setItem('tst_seen_test_intro_v1', '1')
                        setHasSeenIntro(true)
                      } catch {
                        // ignore
                      }
                      const targetId = isGuestMode ? 'nuovo-test-player' : 'profilazione-utente'
                      window.requestAnimationFrame(() => {
                        const element = document.getElementById(targetId)
                        if (element && typeof element.scrollIntoView === 'function') {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                      })
                    }}
                  >
                    Avvia il test
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary nuovo-test-tutorial-trigger"
                    onClick={() => {
                      uiSounds?.playSecondaryTap?.()
                      setShowTutorialCard(true)
                    }}
                  >
                    Tutorial
                  </button>
                </div>
              </div>
              <div className="nuovo-test-hero-visual" aria-hidden="true">
                <div className="nuovo-test-hero-orbit nuovo-test-hero-orbit-outer" />
                <div className="nuovo-test-hero-orbit nuovo-test-hero-orbit-middle" />
                <div className="nuovo-test-hero-orbit nuovo-test-hero-orbit-inner" />
                <div className="nuovo-test-hero-pulse" />
                <div className="nuovo-test-hero-spark nuovo-test-hero-spark-1" />
                <div className="nuovo-test-hero-spark nuovo-test-hero-spark-2" />
                <div className="nuovo-test-hero-spark nuovo-test-hero-spark-3" />
              </div>
            </div>
          </header>

        </section>
        </div>
      )}
      {!showIntro && !profilingDone && !isGuestMode && (
        <section className="page-card" id="profilazione-utente">
          <form className="profilazione-form" onSubmit={handleStartTest}>
            <h2 className="profilazione-title">Profilazione utente</h2>
            <div className="profilazione-grid">
              <label className="profilazione-field">
                <span>Data</span>
                <input
                  type="date"
                  value={testRecord.Data_Test || ''}
                  onChange={handleProfilazioneChange('Data_Test')}
                />
              </label>
              <label className="profilazione-field">
                <span>Nome</span>
                <input
                  type="text"
                  value={testRecord.Nome}
                  onChange={handleProfilazioneChange('Nome')}
                  placeholder="Nome"
                />
              </label>
              <label className="profilazione-field">
                <span>Cognome</span>
                <input
                  type="text"
                  value={testRecord.Cognome}
                  onChange={handleProfilazioneChange('Cognome')}
                  placeholder="Cognome"
                />
              </label>
              <label className="profilazione-field">
                <span>Data di nascita</span>
                <input
                  type="date"
                  value={testRecord.Data_Nascita || ''}
                  onChange={handleProfilazioneChange('Data_Nascita')}
                />
              </label>
              <label className="profilazione-field">
                <span>Titolo di studio</span>
                <input
                  type="text"
                  value={testRecord.Titolo_Studio}
                  onChange={handleProfilazioneChange('Titolo_Studio')}
                  placeholder="Es. Laurea triennale"
                />
              </label>
              <fieldset className="profilazione-field profilazione-field-full">
                <legend>Suoni o canti per hobby o professione?</legend>
                <div className="profilazione-options-inline">
                  <label className="profilazione-option">
                    <input
                      type="radio"
                      name="pratica-musicale"
                      value="SI"
                      checked={testRecord.Pratica_Musicale === 'SI'}
                      onChange={handleProfilazioneChange('Pratica_Musicale')}
                    />
                    <span>Sì</span>
                  </label>
                  <label className="profilazione-option">
                    <input
                      type="radio"
                      name="pratica-musicale"
                      value="NO"
                      checked={testRecord.Pratica_Musicale === 'NO'}
                      onChange={handleProfilazioneChange('Pratica_Musicale')}
                    />
                    <span>No</span>
                  </label>
                </div>
              </fieldset>
              <label className="profilazione-field">
                <span>Se sì, che strumento?</span>
                <input
                  type="text"
                  value={testRecord.Strumento_Suonato}
                  onChange={handleProfilazioneChange('Strumento_Suonato')}
                  placeholder="Es. Pianoforte, Chitarra..."
                  disabled={testRecord.Pratica_Musicale !== 'SI'}
                />
              </label>
            </div>
            <div className="profilazione-actions">
              <button
                type="submit"
                className="nav-button primary"
                disabled={!isProfilingValid()}
                onClick={() => {
                  if (isProfilingValid()) {
                    uiSounds?.playPrimaryTap?.()
                  }
                }}
              >
                Inizia test
              </button>
            </div>
          </form>
        </section>
      )}

      {profilingDone && (
        <section
          className="page-card page-card--test-session test-session-shell test-stage"
          id="nuovo-test-player"
          style={adaptiveUiVars}
          data-adaptive-rhythm={rhythm}
        >
          {!testCompleted && (
            <div
              key={`step-${currentFile}`}
              className={`test-stage-live test-step-transition ${isProcessingNext ? 'is-processing' : ''}`}
              style={adaptiveTransitionStyle}
              data-adaptive-rhythm={rhythm}
            >
              <div className="test-stage-main-card">
                <section className="test-stage-question-zone" role="status" aria-live="polite">
                  <h2 className="test-threshold-question-title">{getQuestionTitleForFile(currentFile)}</h2>
                </section>
                <section
                  className="test-stage-audio-zone player-card player-card--bottom-dock"
                  aria-label="Controlli audio del test"
                >
                  <div className="test-stage-audio-head">
                    <button
                      type="button"
                      className="nav-button secondary stepper-exit-button"
                      onClick={handleRequestExit}
                    >
                      Esci
                    </button>
                  </div>
                  <audio
                    ref={audioRef}
                    preload="metadata"
                    playsInline
                    onPlay={() => {
                      setNeuroChoiceStage('passive')
                      setIsChoicesVisible(false)
                    }}
                    onError={() => {
                      const issue = getAudioSourceIssue(audioSrc)
                      setAudioError(issue || 'File audio non disponibile o danneggiato.')
                    }}
                    onCanPlay={() => {
                      setAudioError(null)
                    }}
                    onLoadedMetadata={() => {
                      const audio = audioRef.current
                      if (audio && audio.duration) {
                        setAudioCurrentTime(audio.currentTime || 0)
                        setAudioDuration(audio.duration)
                      }
                    }}
                    onTimeUpdate={() => {
                      const audio = audioRef.current
                      if (audio && audio.duration) {
                        setAudioCurrentTime(audio.currentTime || 0)
                        setAudioProgress((audio.currentTime / audio.duration) * 100)
                      }
                    }}
                    onEnded={() => {
                      trackAudioEnd()
                      const audio = audioRef.current
                      setAudioCurrentTime(audio?.duration || 0)
                      setAudioProgress(100)
                      setNeuroChoiceStage('recall')
                      setIsChoicesVisible(true)
                      if (recallTimerRef.current) {
                        window.clearTimeout(recallTimerRef.current)
                        recallTimerRef.current = null
                      }
                      recallTimerRef.current = window.setTimeout(() => {
                        setNeuroChoiceStage('action')
                        recallTimerRef.current = null
                      }, timings.choiceRecallMs)
                    }}
                  >
                    <source src={audioSrc} type="audio/mpeg" />
                  </audio>
                  <div
                    className="player-progress"
                    role="slider"
                    aria-label="Posizione audio"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(audioDuration || 0)}
                    aria-valuenow={Math.round(audioCurrentTime || 0)}
                    onClick={seekAudioFromEvent}
                    onPointerDown={seekAudioFromEvent}
                  >
                    <div
                      className="player-progress-bar"
                      style={{ width: `${audioProgress || 0}%` }}
                    />
                  </div>
                  <div className="player-progress-times" aria-hidden="true">
                    <span>{formatAudioTime(audioCurrentTime)}</span>
                    <span>{formatAudioTime(audioDuration)}</span>
                  </div>
                  <div className="player-controls">
                    <button
                      type="button"
                      className="player-button secondary player-button-icon"
                      title="Play"
                      aria-label="Riproduci dall'inizio"
                      onClick={() => {
                        uiSounds?.playSecondaryTap?.()
                        playCurrentAudio({ restart: true })
                      }}
                      disabled={isAudioBusy}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="player-button secondary player-button-icon"
                      title="Stop"
                      aria-label="Ferma audio"
                      onClick={() => {
                        uiSounds?.playSecondaryTap?.()
                        stopAudio()
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M6 6h12v12H6z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="player-button ghost player-button-icon"
                      title="Rewind (inizio)"
                      aria-label="Riporta audio all'inizio"
                      onClick={() => {
                        uiSounds?.playGhostTap?.()
                        const audio = audioRef.current
                        if (audio) {
                          audio.currentTime = 0
                        }
                        setAudioCurrentTime(0)
                        setAudioProgress(0)
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                      </svg>
                    </button>
                  </div>
                  <div className="player-status-region" aria-live="polite">
                    {(audioError || audioSourceIssue) && (
                      <p className="audio-error">
                        {audioError || audioSourceIssue}
                      </p>
                    )}
                    {!audioError && !audioSourceIssue && navigationHint && (
                      <p className="player-hint">
                        {navigationHint}
                      </p>
                    )}
                  </div>
                  <audio ref={preloadRef} style={{ display: 'none' }} preload="auto" />
                </section>
                <section className="test-stage-answers-shell" aria-live="polite">
                  <div className={`test-stage-answers-zone ${isChoicesVisible ? 'is-revealed' : 'is-hidden'}`}>
                    {renderAnswerButtons()}
                  </div>
                </section>
                <footer className="test-stage-footer" aria-label="Avanzamento e navigazione test">
                  <div className="test-stage-footer-row">
                    <button
                      type="button"
                      className="nav-button secondary"
                      onClick={handleBack}
                      disabled={currentFile === 1 || isProcessingNext}
                    >
                      Indietro
                    </button>
                    <p className="answers-step-number" aria-live="polite">
                      Passo {currentFile}/72 · {getMacroSectionLabel(currentFile) || 'Panoramica sonora'}
                    </p>
                    <button
                      type="button"
                      className="nav-button primary"
                      onClick={handleNextStep}
                      disabled={!canGoNext || isProcessingNext || !isCurrentStepAnswered}
                    >
                      {isProcessingNext ? 'Preparazione...' : 'Avanti'}
                    </button>
                  </div>
                  <div className="stepper-progress" aria-hidden="true">
                    <div
                      className={`stepper-progress-bar ${
                        isProcessingNext && timings.breathingPulse ? 'is-processing-breathing' : ''
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, (currentFile / TOTAL_STEPS) * 100)).toFixed(3)}%`,
                      }}
                    />
                  </div>
                </footer>
              </div>
            </div>
          )}
          <div className={`answers-card ${testCompleted ? 'answers-card--completed' : ''}`}>
            {testCompleted && !isAnalyzingResult && (
              <section className="feedback-section">
                <h3 className="feedback-title">Domande finali (dopo lo svolgimento del test)</h3>
                <p className="feedback-subtitle">
                  Le risposte aiutano a completare il quadro qualitativo del protocollo TST 2025.
                </p>
                <div className="feedback-grid">
                  <fieldset className="feedback-field feedback-field-full">
                    <legend>Come ti senti ora dopo il test? (massimo 3 aggettivi)</legend>
                    <p className="feedback-inline-helper">Seleziona fino a 3 opzioni.</p>
                    <div className="feedback-options-vertical">
                      {STATO_ANIMO_OPTIONS.map((opt) => {
                        const selectedCodes = parseCodes(testRecord.Stato_Animo_Finale || '')
                        const checked = selectedCodes.includes(opt.value)
                        const disabled = !checked && selectedCodes.length >= 3
                        return (
                          <label key={opt.value} className="feedback-option">
                            <input
                              type="checkbox"
                              value={opt.value}
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleStatoAnimo(opt.value)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="feedback-field">
                    <legend>Hai trovato difficoltà?</legend>
                    <div className="feedback-options-vertical">
                      {DIFFICOLTA_TEST_OPTIONS.map((opt) => (
                        <label key={opt.value} className="feedback-option">
                          <input
                            type="radio"
                            name="difficolta-test"
                            value={opt.value}
                            checked={testRecord.Difficolta_Test === opt.value}
                            onChange={handleDifficoltaTestChange}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="feedback-field">
                    <legend>Se hai avuto difficoltà, di che tipo?</legend>
                    <div className="feedback-options-vertical" aria-disabled={testRecord.Difficolta_Test !== 'DT_SI'}>
                      {DIFFICOLTA_DETTAGLIO_OPTIONS.map((opt) => {
                        const selectedCodes = parseCodes(testRecord.Difficolta_Dettaglio || '')
                        const checked = selectedCodes.includes(opt.value)
                        return (
                          <label key={opt.value} className="feedback-option">
                            <input
                              type="checkbox"
                              value={opt.value}
                              checked={checked}
                              disabled={testRecord.Difficolta_Test !== 'DT_SI'}
                              onChange={() => toggleDifficoltaDettaglio(opt.value)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <div className="feedback-field feedback-field-full feedback-areas-guide">
                    <p className="feedback-help-title">Non ricordi le aree A-E?</p>
                    <button
                      type="button"
                      className="feedback-areas-help-button"
                      onClick={() => {
                        uiSounds?.playSecondaryTap?.()
                        setShowAreasHelp(true)
                      }}
                    >
                      Apri guida aree A-E
                    </button>
                    <p className="feedback-help-text">
                      Clicca e trovi una spiegazione semplice area per area, con esempi pratici.
                    </p>
                  </div>

                  <fieldset className="feedback-field">
                    <legend>In quali aree del test ti sei sentito più a tuo agio?</legend>
                    <p className="feedback-inline-helper">Seleziona fino a 3 opzioni.</p>
                    <div className="feedback-options-vertical">
                      {AREA_TEST_OPTIONS.map((opt) => {
                        const selectedCodes = parseCodes(testRecord.Area_Maggior_Agio || '')
                        const checked = selectedCodes.includes(opt.value)
                        const disabled = !checked && selectedCodes.length >= MAX_MULTI_SELECTION
                        return (
                          <label key={`maggior-${opt.value}`} className="feedback-option">
                            <input
                              type="checkbox"
                              value={opt.value}
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleAreaMaggiorAgio(opt.value)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="feedback-field">
                    <legend>In quali aree del test ti sei sentito meno a tuo agio?</legend>
                    <p className="feedback-inline-helper">Seleziona fino a 3 opzioni.</p>
                    <div className="feedback-options-vertical">
                      {AREA_TEST_OPTIONS.map((opt) => {
                        const selectedCodes = parseCodes(testRecord.Area_Minor_Agio || '')
                        const checked = selectedCodes.includes(opt.value)
                        const disabled = !checked && selectedCodes.length >= MAX_MULTI_SELECTION
                        return (
                          <label key={`minor-${opt.value}`} className="feedback-option">
                            <input
                              type="checkbox"
                              value={opt.value}
                              checked={checked}
                              disabled={disabled}
                              onChange={() => toggleAreaMinorAgio(opt.value)}
                            />
                            <span>{opt.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>

                  <fieldset className="feedback-field">
                    <legend>Come hai trovato la qualità dei suoni ascoltati?</legend>
                    <div className="feedback-options-vertical">
                      {QUALITA_SUONI_OPTIONS.map((opt) => (
                        <label key={opt.value} className="feedback-option">
                          <input
                            type="radio"
                            name="qualita-suoni"
                            value={opt.value}
                            checked={testRecord.Qualita_Suoni === opt.value}
                            onChange={handleProfilazioneChange('Qualita_Suoni')}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="test-navigation-submit">
                  {!isFeedbackComplete() && !isGuestMode && (
                    <p className="test-submit-hint">
                      Puoi consegnare anche adesso: se incompleto verrà salvato come bozza in archivio.
                    </p>
                  )}
                  <button
                    type="button"
                    className="nav-button submit-test"
                    onClick={handleSubmitTest}
                    disabled={isFinalSubmitDisabled}
                  >
                    {isSubmitting ? 'Consegna in corso...' : 'Consegna'}
                  </button>
                </div>
              </section>
            )}
            {testCompleted && isAnalyzingResult && (
              <section className="result-analysis-transition" aria-live="polite">
                <p className="result-analysis-kicker">Chiusura Rituale · Laboratorio TST</p>
                <h3 className="result-analysis-title">Uscita guidata dal protocollo in corso</h3>
                <p className="result-analysis-message">{RESULT_ANALYSIS_MESSAGES[analysisMessageIndex]}</p>
                <div className="result-analysis-progress" aria-hidden="true">
                  <div
                    className="result-analysis-progress-bar"
                    style={{ width: `${analysisProgress.toFixed(2)}%` }}
                  />
                </div>
                <p className="result-analysis-percent">{Math.round(analysisProgress)}%</p>
              </section>
            )}
          </div>
          {!testCompleted && isProcessingNext && (
            <p className="processing-state-note" aria-live="polite">
              {rhythm === 'slow'
                ? 'Il sistema sta preparando con cura lo step successivo...'
                : rhythm === 'fast'
                  ? 'Preparazione rapida dello step successivo...'
                  : 'Preparazione dello step successivo...'}
            </p>
          )}
          {showExitConfirm && (
            <div
              className="test-exit-modal-backdrop"
              role="presentation"
              onClick={handleCloseExitConfirm}
            >
              <div
                className="test-exit-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="test-exit-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 id="test-exit-modal-title" className="test-exit-modal-title">
                  Uscire dal test?
                </h3>
                <p className="test-exit-modal-text">
                  I risultati non sono stati consegnati e andranno persi.
                </p>
                <div className="test-exit-modal-actions">
                  <button
                    type="button"
                    className="nav-button exit-confirm-continue"
                    onClick={handleCloseExitConfirm}
                  >
                    Continua il test
                  </button>
                  <button
                    type="button"
                    className="nav-button secondary"
                    onClick={handleConfirmExit}
                  >
                    Esci
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      {showTutorialCard &&
        createPortal(
          <div
            className="nuovo-test-tutorial-layer"
            role="presentation"
            onClick={() => setShowTutorialCard(false)}
          >
            <div
              className="nuovo-test-tutorial-vignetta"
              role="dialog"
              aria-modal="true"
              aria-labelledby="nuovo-test-tutorial-heading"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="nuovo-test-tutorial-close"
                aria-label="Chiudi il tutorial"
                onClick={() => {
                  uiSounds?.playSecondaryTap?.()
                  setShowTutorialCard(false)
                }}
              >
                <span aria-hidden="true">×</span>
              </button>
              <div className="nuovo-test-tutorial-vignetta-frame">
                <div className="nuovo-test-tutorial-vignetta-header">
                  <p className="nuovo-test-tutorial-eyebrow">Tutorial</p>
                  <h2 id="nuovo-test-tutorial-heading" className="nuovo-test-tutorial-heading">
                    Modalità ascolto
                  </h2>
                  <p className="nuovo-test-tutorial-lead">
                    Sei passaggi, nessun giudizio, avvia il test e segui l&apos;audio.
                  </p>
                </div>
                <div className="nuovo-test-tutorial-steps">
                  {tutorialHighlights.map((item, index) => (
                    <div key={item.title} className="nuovo-test-tutorial-step">
                      <span className="nuovo-test-tutorial-step-num" aria-hidden="true">
                        {index + 1}
                      </span>
                      <div className="nuovo-test-tutorial-step-body">
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="nuovo-test-tutorial-actions">
                  <button
                    type="button"
                    className="btn btn-primary nuovo-test-tutorial-cta"
                    onClick={() => {
                      uiSounds?.playTransition?.()
                      setShowTutorialCard(false)
                    }}
                  >
                    Ho capito, iniziamo
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
      {showAreasHelp &&
        createPortal(
          <div
            className="feedback-help-layer"
            role="presentation"
            onClick={() => setShowAreasHelp(false)}
          >
            <div
              className="feedback-help-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-areas-help-title"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="feedback-help-close"
                aria-label="Chiudi guida aree"
                onClick={() => setShowAreasHelp(false)}
              >
                <span aria-hidden="true">×</span>
              </button>
              <p className="feedback-help-kicker">Aiuto rapido</p>
              <h4 id="feedback-areas-help-title" className="feedback-help-heading">
                Come leggere le aree del test (A-E)
              </h4>
              <p className="feedback-help-lead">
                Seleziona come area di maggior agio quella in cui ti sentivi più naturale. Seleziona come
                area di minor agio quella in cui eri più incerto o in difficoltà.
              </p>
              <div className="feedback-help-grid">
                {AREA_HELP_ITEMS.map((area) => (
                  <article key={area.value} className="feedback-help-item">
                    <h5>
                      {area.title} <span>{area.range}</span>
                    </h5>
                    <p>{area.description}</p>
                    <p className="feedback-help-item-cue">{area.simpleCue}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

export default NewTestPage

