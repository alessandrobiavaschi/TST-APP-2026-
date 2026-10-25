import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { createEmptyTestRecord } from '../dbSchema.js'
import { VERSIONE_MODELLO } from '../config/tstSistema.js'
import {
  DIZIONARIO_1,
  DIZIONARIO_2,
  AFFINITA_BASE_OPZIONI,
  AFFINITA_ECCEZIONE_OPZIONI,
  AFFINITA_STANDARD_OPZIONI,
  getQuestionGroupForFile,
  getAudioFileForStep,
  computeScoreDeltaForAnswer,
} from '../testLogic.js'
import { db } from '../firebaseConfig.js'
import { saveTestResultForUser } from '../firestore/testResults.js'
import { useUiSounds } from '../UiSoundProvider.jsx'
import { buildTestAudioUrl, getAudioSourceIssue } from '../audioUrls.js'
import { useAuth } from '../AuthContext.jsx'
import { useAdaptiveFlow } from '../hooks/useAdaptiveFlow.js'
import { useDocumentTitle } from '../hooks/useDocumentTitle.js'
import { useDialogFocus } from '../hooks/useDialogFocus.js'
import TstLoader from '../components/primitives/TstLoader.jsx'
import { reloadPage } from '../utils/loaderTiming.js'
import {
  AREE_TEST,
  DIFFICOLTA_DETTAGLIO_NESSUNA,
  MAX_SCELTE_DOMANDE_FINALI,
} from '../config/domandeFinali.js'
import FinalFeedbackStep from '../components/test/FinalFeedbackStep.jsx'
import { compactTestRecord, computeTestResultFields } from '../utils/testRecordProcessing.js'
import { getNextFileAfterAnswer } from '../utils/testAnswerNavigation.js'
import '../styles/nuovo-test-flow.css'
import { DateField } from '../components/primitives/Calendar.jsx'

const rangeArea = (code) => {
  const area = AREE_TEST.find((item) => item.value === code)
  return area ? `Passi ${area.from}–${area.to}` : ''
}

const AREA_HELP_ITEMS = [
  {
    value: 'A',
    title: 'A · Timbro',
    range: rangeArea('A'),
    description: 'Ascolti il colore del suono: brillante, caldo, secco, pieno.',
    simpleCue: 'Sceglila se ti orienti bene quando cambia il carattere del suono.',
  },
  {
    value: 'B',
    title: 'B · Intervalli',
    range: rangeArea('B'),
    description: 'Ascolti il rapporto tra due note: più vicino, più distante, più teso o rilassato.',
    simpleCue: 'Sceglila se riconosci con facilità il “salto” tra due suoni.',
  },
  {
    value: 'C',
    title: 'C · Ritmo',
    range: rangeArea('C'),
    description: 'Ascolti il movimento del tempo: groove, incastro, spinta del battito.',
    simpleCue: 'Sceglila se ti viene naturale seguire pulsazione e andamento.',
  },
  {
    value: 'D',
    title: 'D · Melodia',
    range: rangeArea('D'),
    description: 'Ascolti la direzione delle note: salita, discesa, curve melodiche.',
    simpleCue: 'Sceglila se senti chiaramente “dove va” la linea musicale.',
  },
  {
    value: 'E',
    title: 'E · Armonia',
    range: rangeArea('E'),
    description: 'Ascolti come i suoni stanno insieme: equilibrio, tensione, densità.',
    simpleCue: 'Sceglila se percepisci subito quando l’insieme suona stabile o instabile.',
  },
]

const parseCodes = (value) =>
  String(value || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)
const MAX_MULTI_SELECTION = MAX_SCELTE_DOMANDE_FINALI

const TOTAL_STEPS = 72

const STORAGE_KEY_TEST_STARTED = 'tst_test_started_v1'
const STORAGE_KEY_TEST_DRAFT = 'tst_test_draft_v1'

function getMacroSectionLabel(fileNumber) {
  if (fileNumber >= 1 && fileNumber <= 28) return 'Timbro'
  if (fileNumber >= 29 && fileNumber <= 41) return 'Intervalli'
  if (fileNumber >= 42 && fileNumber <= 51) return 'Ritmo'
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
    return 'B) Riconferma: riascolta e conferma in modo istintivo.'
  }
  if (fileNumber >= 42 && fileNumber <= 45) {
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

// Opzioni di affinità per i passi a scelta tra suoni (unica definizione,
// usata sia per disegnare i bottoni sia per riconoscere passi con le stesse risposte).
const getAffinitaOptionsForFile = (file) => {
  if (file >= 1 && file <= 4) return { key: 'affinita-base', options: AFFINITA_BASE_OPZIONI }
  if (file === 46) return { key: 'affinita-eccezione', options: AFFINITA_ECCEZIONE_OPZIONI }
  if (file === 51 || file === 58) return { key: 'affinita-standard', options: AFFINITA_STANDARD_OPZIONI }
  return { key: null, options: [] }
}

// Identifica l'insieme di bottoni di un passo: se due passi consecutivi
// hanno lo stesso insieme, i bottoni restano fermi invece di riapparire.
const getAnswerSetKey = (file) => {
  const group = getQuestionGroupForFile(file)
  if (group === 'B') return 'dizionario-1'
  if (group === 'C' || group === 'C_BIS') return 'dizionario-2'
  return getAffinitaOptionsForFile(file).key || `passo-${file}`
}

function NewTestPage() {
  useDocumentTitle('Test in corso')
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
  const [showIntro, setShowIntro] = useState(() => !location.state?.startAtProfile)
  const [profilingDone, setProfilingDone] = useState(false)
  const [audioError, setAudioError] = useState(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showDraftSubmitConfirm, setShowDraftSubmitConfirm] = useState(false)
  const [showAreasHelp, setShowAreasHelp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAudioBusy, setIsAudioBusy] = useState(false)
  const [isChoicesVisible, setIsChoicesVisible] = useState(true)
  const [isProcessingNext] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [, setNeuroChoiceStage] = useState('reset')
  const [, setNeuroStepTransition] = useState('enter')
  const [navigationHint, setNavigationHint] = useState('')
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false)
  const [showRecoverDraftPrompt, setShowRecoverDraftPrompt] = useState(false)
  const [isReviewingTestSteps, setIsReviewingTestSteps] = useState(false)
  const audioRef = useRef(null)
  const answersZoneRef = useRef(null)
  const previousAnswerSetRef = useRef(null)
  const preloadRef = useRef(null)
  const previewAudioRef = useRef(null)
  const nextStepTimerRef = useRef(null)
  const resetTimerRef = useRef(null)
  const recallTimerRef = useRef(null)
  const stepEnterTimerRef = useRef(null)

  // Sample da /audio in locale, oppure da VITE_AUDIO_BASE_URL (streaming, senza MP3 nel deploy).
  const audioSrc = buildTestAudioUrl(currentFile)
  // Ai passi di riconferma si riascolta il file di riferimento (vedi PASSI in config/tstSistema.js).
  const stepAudioFile = getAudioFileForStep(currentFile)
  const reconfirmReferenceFile = stepAudioFile !== currentFile ? stepAudioFile : null
  const playerAudioSrc = reconfirmReferenceFile ? buildTestAudioUrl(reconfirmReferenceFile) : audioSrc
  const audioSourceIssue = getAudioSourceIssue(playerAudioSrc)
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

  useEffect(() => {
    if (!authReady) return
    if (!user && !isGuestMode) {
      navigate('/', { replace: true, state: { fromTest: true } })
    }
  }, [authReady, user, isGuestMode, navigate])

  const exitModalRef = useRef(null)
  const exitContinueBtnRef = useRef(null)
  const recoverModalRef = useRef(null)
  const recoverDraftBtnRef = useRef(null)
  const draftSubmitModalRef = useRef(null)
  const draftSubmitContinueBtnRef = useRef(null)
  const areasHelpModalRef = useRef(null)

  useDialogFocus(exitModalRef, {
    open: showExitConfirm,
    onClose: () => handleCloseExitConfirm(),
    initialFocusRef: exitContinueBtnRef,
  })

  useDialogFocus(recoverModalRef, {
    open: showRecoverDraftPrompt,
    onClose: () => setShowRecoverDraftPrompt(false),
    initialFocusRef: recoverDraftBtnRef,
  })

  useDialogFocus(draftSubmitModalRef, {
    open: showDraftSubmitConfirm,
    onClose: () => handleCloseDraftSubmitConfirm(),
    initialFocusRef: draftSubmitContinueBtnRef,
  })

  useDialogFocus(areasHelpModalRef, {
    open: showAreasHelp,
    onClose: () => {
      uiSounds?.playTestGhostTap?.()
      setShowAreasHelp(false)
    },
  })


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
    const issue = getAudioSourceIssue(playerAudioSrc)
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
    const answerSetKey = getAnswerSetKey(currentFile)
    const sameAnswerSet = previousAnswerSetRef.current === answerSetKey
    previousAnswerSetRef.current = answerSetKey
    if (!sameAnswerSet) setIsChoicesVisible(false)
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
        // Il cleanup deve cancellare il timer più recente al momento dell'unmount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tst:ritual-focus', { detail: { active: false } }))
      }
    }
  }, [])

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
          VERDE_1_CalmaContemplativa: next.VERDE_1_CalmaContemplativa,
          VERDE_2_CalmaFisica: next.VERDE_2_CalmaFisica,
          GIALLO_1_Gioia_Entusiasmo: next.GIALLO_1_Gioia_Entusiasmo,
          GIALLO_2_Volitivo_Passionale: next.GIALLO_2_Volitivo_Passionale,
          GRIGIO_1_Anaffettiva: next.GRIGIO_1_Anaffettiva,
          GRIGIO_2_Distaccata: next.GRIGIO_2_Distaccata,
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

    proceedToNextStep(fileNumber)
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

  const proceedToNextStep = (expectedFile = currentFile) => {
    if (isProcessingNext) return
    const nextFile = getNextFileAfterAnswer(expectedFile, TOTAL_STEPS)
    if (nextFile === expectedFile) return
    stopAudio()
    stopPreviewAudio()
    uiSounds?.playTestTransition?.()
    setCurrentFile((activeFile) => (activeFile === expectedFile ? nextFile : activeFile))
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
          ? DIFFICOLTA_DETTAGLIO_NESSUNA
          : prev.Difficolta_Dettaglio === DIFFICOLTA_DETTAGLIO_NESSUNA
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
    const autoFields = computeTestResultFields(testRecord)
    const payload = compactTestRecord({
      ...testRecord,
      ...autoFields,
      Stato_Consegna: shouldSaveAsDraft ? 'BOZZA' : 'CONSEGNATO',
      Bozza_Test: shouldSaveAsDraft,
      versione_modello: VERSIONE_MODELLO,
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
        navigate('/risultati/report', {
          state: { record: wrapper, fromSubmit: true, skipReportTransition: true },
        })
        return
      }

      // Senza connessione Firestore accoderebbe la scrittura senza conferma:
      // non avviamo il salvataggio e lasciamo le risposte intatte nella pagina.
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        alert(
          'Connessione assente. Le tue risposte restano in questa pagina: ricollegati a internet e premi di nuovo il pulsante di consegna.',
        )
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
      return (
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
      )
    }

    const { options } = getAffinitaOptionsForFile(currentFile)

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

  // Permette di rispondere da tastiera (tasti 1-9): seleziona la risposta
  // corrispondente e fa avanzare il test, senza passare dal focus/click del
  // bottone (che altrimenti può far scrollare o "saltare" la vista).
  useEffect(() => {
    if (!profilingDone || testCompleted || showAreasHelp || showExitConfirm) return undefined
    if (!isChoicesVisible) return undefined
    const onKeyDown = (event) => {
      if (event.repeat) return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return
      const digit = Number(event.key)
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) return
      const buttons = answersZoneRef.current?.querySelectorAll('.answer-button')
      const button = buttons?.[digit - 1]
      if (!button || button.disabled) return
      event.preventDefault()
      button.click()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [profilingDone, testCompleted, showAreasHelp, showExitConfirm, isChoicesVisible, currentFile])

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
  // Le funzioni leggono intenzionalmente lo snapshot della render corrente.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // Il listener viene riallineato sui dati; le funzioni leggono lo snapshot corrente.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    return <TstLoader label="Verifica sessione in corso" onRetry={reloadPage} />
  }

  return (
    <div
      className={`page nuovo-test-page nuovo-test-flow ${
        profilingDone && !testCompleted ? 'nuovo-test-page--session-active' : ''
      } ${profilingDone && testCompleted && !isReviewingTestSteps ? 'nuovo-test-page--finale' : ''}`}
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
            <h1 className="profilazione-title">Profilazione utente</h1>
            <div className="profilazione-grid">
              <div className="profilazione-field">
                <span>Data</span>
                <DateField
                  value={testRecord.Data_Test || ''}
                  onChange={handleProfilazioneChange('Data_Test')}
                  placeholder="Data del test"
                />
              </div>
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
              <div className="profilazione-field">
                <span>Data di nascita</span>
                <DateField
                  value={testRecord.Data_Nascita || ''}
                  onChange={handleProfilazioneChange('Data_Nascita')}
                  placeholder="Data di nascita"
                  max="today"
                  defaultMonth="1990-01-01"
                />
              </div>
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
          <div className={`test-stage-rhythm-aura ${isPlaying ? 'is-playing' : ''}`} />
          {(!testCompleted || isReviewingTestSteps) && (
            <div
              className={`test-stage-live test-step-transition ${isProcessingNext ? 'is-processing' : ''}`}
              style={adaptiveTransitionStyle}
              data-adaptive-rhythm={rhythm}
            >
              <div className="test-stage-main-card">
                <header className="test-stage-progress-block" aria-label="Avanzamento test">
                  <h1 className="sr-only">Test Temperamentale TST in corso</h1>
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
                    >
                      <span className="stepper-progress-laser" />
                    </div>
                  </div>
                </header>
                {!testCompleted && reconfirmReferenceFile && (
                  <div className="answers-c-bis">
                    <p className="answers-c-bis-title">Riascolto di conferma</p>
                    <p className="answers-c-bis-hint">
                      Stai risentendo il file {reconfirmReferenceFile}, già presentato durante il test. Il player qui sotto riproduce solo questo suono di riferimento: ascolta con calma e scegli l’aggettivo che senti più coerente.
                    </p>
                  </div>
                )}
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
                        setIsPlaying(true)
                      }}
                      onPause={() => {
                        setIsPlaying(false)
                      }}
                      onError={() => {
                        const issue = getAudioSourceIssue(playerAudioSrc)
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
                        setIsPlaying(false)
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
                      <source src={playerAudioSrc} type="audio/mpeg" />
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
                    {/* Visualizzatore Onda Audio Fluida (Wow Effect 1) */}
                    <div className={`player-wave-visualizer ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true">
                      <span className="wave-bar wave-bar--1" />
                      <span className="wave-bar wave-bar--2" />
                      <span className="wave-bar wave-bar--3" />
                      <span className="wave-bar wave-bar--4" />
                      <span className="wave-bar wave-bar--5" />
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
                <div className="test-stage-step-content">
                  <section className="test-stage-question-zone" key={`domanda-${currentFile}`}>
                    <h2 className="test-threshold-question-title test-threshold-question-title--compact">
                      {getQuestionTitleForFile(currentFile)}
                    </h2>
                  </section>
                  <section className="test-stage-answers-shell" key={`risposte-${getAnswerSetKey(currentFile)}`}>
                    <div
                      ref={answersZoneRef}
                      className={`test-stage-answers-zone ${isChoicesVisible ? 'is-revealed' : 'is-hidden'}`}
                    >
                      {renderAnswerButtons()}
                    </div>
                  </section>
                </div>
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
          {testCompleted && !isReviewingTestSteps && (
            <FinalFeedbackStep
              record={testRecord}
              toggles={{
                statoAnimo: toggleStatoAnimo,
                difficoltaDettaglio: toggleDifficoltaDettaglio,
                areaMaggiorAgio: toggleAreaMaggiorAgio,
                areaMinorAgio: toggleAreaMinorAgio,
              }}
              onQualitaChange={handleProfilazioneChange('Qualita_Suoni')}
              onDifficoltaChange={handleDifficoltaTestChange}
              onOpenAreasHelp={() => {
                uiSounds?.playTestTap?.()
                setShowAreasHelp(true)
              }}
              onBack={handleReviewLastQuestion}
              onSubmit={() => handleSubmitTest()}
              isSubmitting={isSubmitting}
              lastStep={TOTAL_STEPS}
            />
          )}
          <TstLoader
            active={isSubmitting}
            label="Salvataggio del test in corso"
            slowMessage="Il salvataggio sta impiegando più del previsto. Non chiudere la pagina."
          />
          {showExitConfirm && (
            <div
              className="test-exit-modal-backdrop"
              role="presentation"
              onClick={handleCloseExitConfirm}
            >
              <div
                ref={exitModalRef}
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
                    ref={exitContinueBtnRef}
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
                ref={recoverModalRef}
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
                    ref={recoverDraftBtnRef}
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
                ref={draftSubmitModalRef}
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
                    ref={draftSubmitContinueBtnRef}
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
              ref={areasHelpModalRef}
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
