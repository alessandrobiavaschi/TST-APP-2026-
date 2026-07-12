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
import { getFlowerStillByColor } from '../colorAssets.js'
import '../styles/nuovo-test-flow.css'

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

const DISPOSIZIONE_LABELS_BY_COLOR = {
  blu: 'Malinconia',
  rosso: 'Volitività',
  giallo: 'Entusiasmo',
  verde: 'Calma',
  grigio: 'Anaffettività',
}

const SOTTOCORRENTE_KEYS_BY_COLOR = {
  blu: ['BLU_1_Depressiva', 'BLU_2_Lunare', 'BLU_3_Nostalgia', 'BLU_4_Solare'],
  rosso: ['ROSSO_1_Assertivita', 'ROSSO_2_Dubbio_Collera'],
  verde: ['VERDE_1_Calma'],
  giallo: ['GIALLO_1_Gioia_Entusiasmo', 'GIALLO_2_Volitivo_Passionale'],
  grigio: ['GRIGIO_1_Distaccato_Nichilista', 'GRIGIO_2_Intellettuale_Saggio'],
}

function getDisposizionePrevalenteKey(record) {
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
  return bestKey
}

function getDisposizionePrevalente(record) {
  const bestKey = getDisposizionePrevalenteKey(record)
  return DISPOSIZIONE_LABELS_BY_COLOR[bestKey] || ''
}

const SOTTODISPOSIZIONE_LABELS = {
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

function getSottodisposizionePrevalente(record) {
  if (!record) return ''
  const disposizioneKey = getDisposizionePrevalenteKey(record)
  const candidateKeys = SOTTOCORRENTE_KEYS_BY_COLOR[disposizioneKey] || []
  if (candidateKeys.length === 0) return ''

  let bestKey = null
  let bestValue = -Infinity

  candidateKeys.forEach((key) => {
    const numeric = Number(record[key]) || 0
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
  'Ci vuole solo un secondo: stiamo elaborando le tue risposte.',
  'Analisi in corso: stiamo calcolando gli indicatori principali.',
  'Stiamo organizzando il tuo profilo per una lettura chiara.',
  'Privacy attiva: i dati vengono trattati in forma riservata e protetta.',
  'Quasi pronto: passaggio al report finale.',
]

const STORAGE_KEY_TEST_STARTED = 'tst_test_started_v1'
const STORAGE_KEY_TEST_DRAFT = 'tst_test_draft_v1'

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
  const [showDraftSubmitConfirm, setShowDraftSubmitConfirm] = useState(false)
  const [showAreasHelp, setShowAreasHelp] = useState(false)
  const [isThresholdFocusActive, setIsThresholdFocusActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAudioBusy, setIsAudioBusy] = useState(false)
  const [isChoicesVisible, setIsChoicesVisible] = useState(true)
  const [isProcessingNext] = useState(false)
  const [isAnalyzingResult, setIsAnalyzingResult] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisMessageIndex, setAnalysisMessageIndex] = useState(0)
  const [loadingFlowerTick, setLoadingFlowerTick] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [, setNeuroChoiceStage] = useState('reset')
  const [, setNeuroStepTransition] = useState('enter')
  const [navigationHint, setNavigationHint] = useState('')
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false)
  const [showRecoverDraftPrompt, setShowRecoverDraftPrompt] = useState(false)
  const [isReviewingTestSteps, setIsReviewingTestSteps] = useState(false)
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
  const FLOWER_SEQUENCE = ['blu', 'rosso', 'verde', 'giallo', 'grigio']
  const loadingFlowerImages = FLOWER_SEQUENCE.map((key) => ({
    key,
    src: getFlowerStillByColor(key),
  })).filter((item) => Boolean(item.src))
  const activeFlowerIndex =
    loadingFlowerImages.length > 0
      ? Math.min(
          loadingFlowerImages.length - 1,
          Math.floor((analysisProgress / 100) * loadingFlowerImages.length),
        )
      : 0
  const animatedFlowerIndex =
    loadingFlowerImages.length > 0
      ? (activeFlowerIndex + loadingFlowerTick) % loadingFlowerImages.length
      : 0

  const isGuestMode = location.state && location.state.mode === 'guest'

  useEffect(() => {
    if (!authReady) return
    if (!user && !isGuestMode) {
      navigate('/', { replace: true, state: { fromTest: true } })
    }
  }, [authReady, user, isGuestMode, navigate])

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
      setIsChoicesVisible(true)
      setNavigationHint(
        'Puoi comunque scegliere una risposta. Per l’ascolto: verifica VITE_AUDIO_BASE_URL o i file in public/audio/.',
      )
    } finally {
      setIsAudioBusy(false)
    }
  }

  const playReferenceAudio = async (fileNumber) => {
    if (!fileNumber) return
    uiSounds?.playTestTap?.()
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
      setIsChoicesVisible(true)
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
          setIsAnalyzingResult(false)
          setIsThresholdFocusActive(false)
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
    if (!isAnalyzingResult || loadingFlowerImages.length <= 1) return undefined
    const timer = window.setInterval(() => {
      setLoadingFlowerTick((prev) => prev + 1)
    }, 860)
    return () => window.clearInterval(timer)
  }, [isAnalyzingResult, loadingFlowerImages.length])

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
    uiSounds?.playTestTap?.()
    setNavigationHint('')
    recordInteraction()
    stopAudio()
    stopPreviewAudio()
    const fileNumber = currentFile
    const previousAnswerForFile = answersByFile[fileNumber]

    const delta = computeScoreDeltaForAnswer({
      fileNumber,
      answerLabel,
      affinitaOptionId,
      isConfirmation,
    })
    const hasDelta = Boolean(delta && Object.keys(delta).length > 0)
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

    if (fileNumber < TOTAL_STEPS) {
      proceedToNextStep()
    }
  }

  const handleBack = () => {
    uiSounds?.playTestSwipe?.()
    if (currentFile <= 1) return
    stopAudio()
    stopPreviewAudio()
    setCurrentFile((prev) => prev - 1)
  }

  const handleReviewLastQuestion = () => {
    uiSounds?.playTestTap?.()
    setIsReviewingTestSteps(true)
    setCurrentFile(TOTAL_STEPS)
  }

  const handleReturnToFinalQuestions = () => {
    uiSounds?.playTestTransition?.()
    stopAudio()
    stopPreviewAudio()
    setIsReviewingTestSteps(false)
  }

  const proceedToNextStep = () => {
    if (isProcessingNext) return
    if (currentFile >= 72) return
    stopAudio()
    stopPreviewAudio()
    uiSounds?.playTestTransition?.()
    setCurrentFile((prev) => prev + 1)
  }

  const handleNextStep = () => {
    if (!isCurrentStepAnswered) {
      setNavigationHint('Seleziona una risposta per continuare.')
      return
    }
    proceedToNextStep()
  }

  const handleRequestExit = () => {
    uiSounds?.playTestGhostTap?.()
    stopAudio()
    stopPreviewAudio()
    setShowExitConfirm(true)
  }

  const handleCloseExitConfirm = () => {
    uiSounds?.playTestGhostTap?.()
    setShowExitConfirm(false)
  }

  const handleRequestDraftSubmit = () => {
    uiSounds?.playTestGhostTap?.()
    stopAudio()
    stopPreviewAudio()
    setShowDraftSubmitConfirm(true)
  }

  const handleCloseDraftSubmitConfirm = () => {
    uiSounds?.playTestGhostTap?.()
    setShowDraftSubmitConfirm(false)
  }

  const handleConfirmDraftSubmit = async () => {
    uiSounds?.playTestTransition?.()
    setShowDraftSubmitConfirm(false)
    await handleSubmitTest()
  }

  const handleConfirmExit = () => {
    uiSounds?.playTestTransition?.()
    try {
      window.sessionStorage.removeItem(STORAGE_KEY_TEST_STARTED)
    } catch {
      // ignore
    }
    clearLocalDraftSnapshot()
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

  const handleSaveDraftAndExit = async () => {
    uiSounds?.playTestTransition?.()
    setShowExitConfirm(false)
    await handleSubmitTest({
      forceDraft: true,
      shouldNavigateAfterDraft: true,
      skipSound: true,
    })
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

  const buildLocalDraftSnapshot = () => ({
    version: 1,
    savedAt: Date.now(),
    currentFile,
    testRecord,
    answersByFile,
    profilingDone,
    showIntro,
  })

  const saveLocalDraftSnapshot = () => {
    if (typeof window === 'undefined') return
    try {
      const snapshot = buildLocalDraftSnapshot()
      window.localStorage.setItem(STORAGE_KEY_TEST_DRAFT, JSON.stringify(snapshot))
    } catch {
      // ignore
    }
  }

  const clearLocalDraftSnapshot = () => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.removeItem(STORAGE_KEY_TEST_DRAFT)
    } catch {
      // ignore
    }
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

  const handleSubmitTest = async ({
    forceDraft = false,
    shouldNavigateAfterDraft = false,
    skipSound = false,
  } = {}) => {
    if (isSubmitting) return
    if (!skipSound) {
      uiSounds?.playTestPrimaryTap?.()
    }
    const activeUser = user
    const isComplete = isTestComplete()
    const shouldSaveAsDraft = forceDraft || !isComplete
    const autoFields = computeAutoFields(testRecord)
    const payload = sanitizePayload({
      ...testRecord,
      ...autoFields,
      Stato_Consegna: shouldSaveAsDraft ? 'BOZZA' : 'CONSEGNATO',
      Bozza_Test: shouldSaveAsDraft,
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
        clearLocalDraftSnapshot()
        await runResultAnalysisTransition()
        navigate('/risultati/report', {
          state: { record: wrapper, fromSubmit: true, skipReportTransition: true },
        })
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
      clearLocalDraftSnapshot()

      if (shouldSaveAsDraft) {
        alert('Bozza salvata in archivio.')
        if (shouldNavigateAfterDraft) {
          navigate(isGuestMode ? '/' : '/home', { replace: true })
        } else {
          navigate('/risultati')
        }
        return
      }

      const wrapper = {
        id: docRef.id,
        raw: payload,
      }
      await runResultAnalysisTransition()
      navigate('/risultati/report', {
        state: { record: wrapper, fromSubmit: true, skipReportTransition: true },
      })
    } catch (error) {
      console.error('Errore durante il salvataggio del test:', error)
      alert(`Errore durante il salvataggio: ${error?.message || 'Controlla la console e le regole Firestore.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAnswerButtons = () => {
    const group = getQuestionGroupForFile(currentFile)

    if (group === 'B') {
      return (
        <div className="answers-grid answers-grid--dense">
          {Object.keys(DIZIONARIO_1).map((label) => (
            <button
              key={label}
              type="button"
              className={`answer-button ${selectedAnswerValue === label ? 'answer-button-selected' : ''}`}
              aria-pressed={selectedAnswerValue === label}
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
              aria-pressed={selectedAnswerValue === label}
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
                aria-pressed={selectedAnswerValue === label}
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
              aria-pressed={selectedAnswerValue === opt.id}
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
  const adaptiveTransitionStyle = {
    opacity: 1,
    transform: 'none',
    transition: 'none',
  }

  useEffect(() => {
    if (hasRecoveredDraft || typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_TEST_DRAFT)
      if (!raw) {
        setHasRecoveredDraft(true)
        return
      }
      const snapshot = JSON.parse(raw)
      const hasRecord = snapshot && typeof snapshot === 'object' && snapshot.testRecord
      if (!hasRecord) {
        clearLocalDraftSnapshot()
        setHasRecoveredDraft(true)
        return
      }
      const savedCurrentFile = Number(snapshot.currentFile) || 1
      setTestRecord(snapshot.testRecord)
      setAnswersByFile(snapshot.answersByFile || {})
      setCurrentFile(Math.min(TOTAL_STEPS, Math.max(1, savedCurrentFile)))
      setProfilingDone(Boolean(snapshot.profilingDone))
      setShowIntro(Boolean(snapshot.showIntro))
      setShowRecoverDraftPrompt(true)
    } catch {
      clearLocalDraftSnapshot()
    } finally {
      setHasRecoveredDraft(true)
    }
  }, [hasRecoveredDraft])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const shouldPersistDraft = profilingDone && !isTestComplete() && !isSubmitting
    if (!shouldPersistDraft) {
      return undefined
    }
    saveLocalDraftSnapshot()
    return undefined
  }, [profilingDone, currentFile, testRecord, answersByFile, isSubmitting, showIntro])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handleBeforeUnload = (event) => {
      const shouldPersistDraft = profilingDone && !isTestComplete()
      if (!shouldPersistDraft) return
      saveLocalDraftSnapshot()
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [profilingDone, currentFile, testRecord, answersByFile])

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
      className={`page nuovo-test-page nuovo-test-flow ${
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
                    className="nav-button primary"
                    onClick={() => {
                      uiSounds?.resumeAudioContext?.()
                      uiSounds?.playTestPrimaryTap?.()
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
                    className="nav-button secondary nuovo-test-tutorial-trigger"
                    onClick={() => {
                      uiSounds?.playTestTap?.()
                      navigate('/tutorial', { state: { fromPath: '/nuovo-test' } })
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
                    uiSounds?.playTestPrimaryTap?.()
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
          {(!testCompleted || isReviewingTestSteps) && (
            <div
              className={`test-stage-live test-step-transition ${isProcessingNext ? 'is-processing' : ''}`}
              style={adaptiveTransitionStyle}
              data-adaptive-rhythm={rhythm}
            >
              <div className="test-stage-main-card">
                <header className="test-stage-progress-block" aria-label="Avanzamento test">
                  <div className="test-stage-topbar">
                    <p className="test-stage-step-label" aria-live="polite">
                      Passo {currentFile} di {TOTAL_STEPS} · Sezione: {getMacroSectionLabel(currentFile) || 'Panoramica sonora'}
                    </p>
                    <button
                      type="button"
                      className="nav-button secondary stepper-exit-button stepper-exit-button--side"
                      onClick={handleRequestExit}
                    >
                      Esci
                    </button>
                  </div>
                  <div
                    className="stepper-progress"
                    role="progressbar"
                    aria-label="Avanzamento del test"
                    aria-valuemin={1}
                    aria-valuemax={TOTAL_STEPS}
                    aria-valuenow={currentFile}
                  >
                    <div
                      className={`stepper-progress-bar ${
                        isProcessingNext && timings.breathingPulse ? 'is-processing-breathing' : ''
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, (currentFile / TOTAL_STEPS) * 100)).toFixed(3)}%`,
                      }}
                    />
                  </div>
                </header>
                {!testCompleted && (
                  <section
                    className="test-stage-audio-zone test-stage-audio-zone--menu-tab player-card player-card--bottom-dock"
                    aria-label="Controlli audio del test"
                  >
                    <audio
                      ref={audioRef}
                      preload="metadata"
                      playsInline
                      onPlay={() => {
                        setNeuroChoiceStage('passive')
                      }}
                      onError={() => {
                        const issue = getAudioSourceIssue(audioSrc)
                        setAudioError(
                          issue ||
                            'File audio non disponibile. In dev: imposta VITE_AUDIO_BASE_URL nel .env oppure copia 1.mp3…72.mp3 in public/audio/, poi riavvia npm run dev.',
                        )
                        setIsChoicesVisible(true)
                        setNavigationHint(
                          'Puoi comunque scegliere una risposta. Per l’ascolto: verifica VITE_AUDIO_BASE_URL o i file in public/audio/.',
                        )
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
                          uiSounds?.playTestTap?.()
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
                          uiSounds?.playTestTap?.()
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
                          uiSounds?.playTestGhostTap?.()
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
                )}
                <section className="test-stage-question-zone" role="status" aria-live="polite">
                  <h2 className="test-threshold-question-title test-threshold-question-title--compact">
                    {getQuestionTitleForFile(currentFile)}
                  </h2>
                </section>
                <section className="test-stage-answers-shell" aria-live="polite">
                  <div className={`test-stage-answers-zone ${isChoicesVisible ? 'is-revealed' : 'is-hidden'}`}>
                    {renderAnswerButtons()}
                  </div>
                </section>
                <footer className="test-stage-footer" aria-label="Navigazione test">
                  <div className="test-stage-footer-row">
                    <button
                      type="button"
                      className="nav-button secondary"
                      onClick={handleBack}
                      disabled={currentFile === 1 || isProcessingNext}
                    >
                      Indietro
                    </button>
                    {currentFile < TOTAL_STEPS ? (
                      <button
                        type="button"
                        className="nav-button ghost test-stage-draft-action"
                        onClick={handleRequestDraftSubmit}
                        disabled={isSubmitting}
                      >
                        Consegna bozza
                      </button>
                    ) : (
                      <span className="test-stage-footer-spacer" aria-hidden="true" />
                    )}
                    {currentFile >= TOTAL_STEPS && isReviewingTestSteps ? (
                      <button
                        type="button"
                        className="nav-button primary"
                        onClick={handleReturnToFinalQuestions}
                        disabled={isProcessingNext || !isCurrentStepAnswered}
                      >
                        Torna alle domande finali
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="nav-button primary"
                        onClick={handleNextStep}
                        disabled={!canGoNext || isProcessingNext || !isCurrentStepAnswered}
                      >
                        Avanti
                      </button>
                    )}
                  </div>
                </footer>
              </div>
            </div>
          )}
          {testCompleted && !isAnalyzingResult && !isReviewingTestSteps && (
            <div className={`answers-card ${testCompleted ? 'answers-card--completed' : ''}`}>
              <section className="feedback-section">
                <h3 className="feedback-title">Domande finali (dopo lo svolgimento del test)</h3>
                <div className="test-navigation-submit">
                  <button
                    type="button"
                    className="nav-button secondary"
                    onClick={handleReviewLastQuestion}
                    disabled={isSubmitting}
                  >
                    Torna all'ultima domanda del test
                  </button>
                </div>
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

                  <div className="feedback-difficulty-row">
                    <fieldset className="feedback-field feedback-field--compact">
                      <legend>Hai trovato difficoltà?</legend>
                      <div className="feedback-options-vertical feedback-options-vertical--stack">
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

                    <fieldset className="feedback-field feedback-field--detail">
                      <legend>Se hai avuto difficoltà, di che tipo?</legend>
                      <div
                        className="feedback-options-vertical feedback-options-vertical--stack"
                        aria-disabled={testRecord.Difficolta_Test !== 'DT_SI'}
                      >
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
                  </div>

                  <div className="feedback-field feedback-field-full feedback-areas-guide">
                    <p className="feedback-help-title">Non ricordi le aree A-E?</p>
                    <button
                      type="button"
                      className="feedback-areas-help-button"
                      onClick={() => {
                        uiSounds?.playTestTap?.()
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
            </div>
          )}
          {testCompleted &&
              isAnalyzingResult &&
              createPortal(
                <section
                  className="nuovo-test-page result-analysis-transition"
                  aria-live="polite"
                  aria-label="Elaborazione risultati"
                >
                  <div className="result-analysis-card">
                    <p className="result-analysis-kicker">Elaborazione risultati</p>
                    <h3 className="result-analysis-title">Stiamo calcolando il tuo report</h3>

                    {loadingFlowerImages.length > 0 && (
                      <div className="result-analysis-flower-shell result-analysis-flower-carousel" aria-hidden="true">
                        <div
                          className="result-analysis-flower-shimmer"
                          style={{ transform: `translateX(${((loadingFlowerTick % 6) - 1) * 120}%)` }}
                        />
                        <div
                          className="result-analysis-flower-track"
                          style={{
                            width: `${loadingFlowerImages.length * 100}%`,
                            transform: `translateX(-${animatedFlowerIndex * (100 / loadingFlowerImages.length)}%)`,
                          }}
                        >
                          {loadingFlowerImages.map((item, index) => {
                            const isActive = index === animatedFlowerIndex
                            return (
                              <div
                                key={item.key}
                                className="result-analysis-flower-slide"
                                style={{ width: `${100 / loadingFlowerImages.length}%` }}
                              >
                                <img
                                  src={item.src}
                                  alt=""
                                  className={`result-analysis-flower-image${isActive ? ' is-active' : ''}`}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <p className="result-analysis-message">
                      {RESULT_ANALYSIS_MESSAGES[analysisMessageIndex]}
                    </p>

                    <div className="result-analysis-progress" aria-hidden="true">
                      <div
                        className="result-analysis-progress-bar"
                        style={{ width: `${analysisProgress.toFixed(2)}%` }}
                      />
                    </div>

                    <p className="result-analysis-note">
                      Privacy attiva: i dati vengono trattati in forma riservata e protetta.
                    </p>
                    <p className="result-analysis-percent">{Math.round(analysisProgress)}%</p>
                  </div>
                </section>,
                document.body,
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
                  Puoi uscire subito, salvare una bozza o continuare il test.
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
                    onClick={handleSaveDraftAndExit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvataggio...' : 'Salva bozza ed esci'}
                  </button>
                  <button
                    type="button"
                    className="nav-button secondary"
                    onClick={handleConfirmExit}
                  >
                    Esci senza salvare
                  </button>
                </div>
              </div>
            </div>
          )}
          {showRecoverDraftPrompt && (
            <div
              className="test-exit-modal-backdrop"
              role="presentation"
            >
              <div
                className="test-exit-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="test-recover-draft-title"
              >
                <h3 id="test-recover-draft-title" className="test-exit-modal-title">
                  Bozza trovata
                </h3>
                <p className="test-exit-modal-text">
                  Abbiamo recuperato una sessione incompleta. Vuoi riprendere da dove eri rimasto?
                </p>
                <div className="test-exit-modal-actions">
                  <button
                    type="button"
                    className="nav-button exit-confirm-continue"
                    onClick={() => {
                      uiSounds?.playTestTransition?.()
                      setShowRecoverDraftPrompt(false)
                    }}
                  >
                    Riprendi bozza
                  </button>
                  <button
                    type="button"
                    className="nav-button secondary"
                    onClick={() => {
                      uiSounds?.playTestGhostTap?.()
                      clearLocalDraftSnapshot()
                      setShowRecoverDraftPrompt(false)
                      setTestRecord({
                        ...createEmptyTestRecord(),
                        Data_Test: new Date().toISOString().slice(0, 10),
                      })
                      setAnswersByFile({})
                      setCurrentFile(1)
                      setProfilingDone(false)
                      setShowIntro(true)
                    }}
                  >
                    Non salvare bozza
                  </button>
                </div>
              </div>
            </div>
          )}
          {showDraftSubmitConfirm && (
            <div
              className="test-exit-modal-backdrop"
              role="presentation"
              onClick={handleCloseDraftSubmitConfirm}
            >
              <div
                className="test-exit-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="test-draft-modal-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h3 id="test-draft-modal-title" className="test-exit-modal-title">
                  Consegnare ora come bozza?
                </h3>
                <p className="test-exit-modal-text">
                  Il test verrà salvato incompleto in archivio e potrai riprenderlo in seguito.
                </p>
                <div className="test-exit-modal-actions">
                  <button
                    type="button"
                    className="nav-button exit-confirm-continue"
                    onClick={handleCloseDraftSubmitConfirm}
                  >
                    Continua il test
                  </button>
                  <button
                    type="button"
                    className="nav-button secondary"
                    onClick={handleConfirmDraftSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvataggio...' : 'Consegna bozza'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}
      {showAreasHelp &&
        createPortal(
          <div
            className="feedback-help-layer"
            role="presentation"
            onClick={() => {
              uiSounds?.playTestGhostTap?.()
              setShowAreasHelp(false)
            }}
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
                onClick={() => {
                  uiSounds?.playTestGhostTap?.()
                  setShowAreasHelp(false)
                }}
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
