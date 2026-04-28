import { useMemo, useRef, useState } from 'react'

const REACTION_WINDOW = 3
const FAST_THRESHOLD_MS = 1500
const SLOW_THRESHOLD_MS = 6000
const FATIGUE_STEP_INCREASE_MS = 180
const MAX_FATIGUE_LEVEL = 4
const BASE_TRANSITION_DELAY_MS = 180
const BASE_FADE_DURATION_MS = 250
const BASE_CHOICE_RESET_MS = 400
const BASE_CHOICE_RECALL_MS = 250

const FLOW_SETTINGS_BY_PACE = {
  fast: { delay: 0.7, duration: 0.8, processing: 100 },
  normal: { delay: 1, duration: 1, processing: 180 },
  slow: { delay: 1.3, duration: 1.2, processing: 300 },
}

const getPhase = (stepIndex, totalSteps = 72) => {
  const safeStep = Math.max(1, Number(stepIndex) || 1)
  const safeTotal = Math.max(1, Number(totalSteps) || 72)
  const rushStart = Math.max(1, safeTotal - 9)
  if (safeStep <= 10) return 'onboarding'
  if (safeStep >= rushStart) return 'rush'
  return 'flow'
}

const roundMs = (value) => Math.max(1, Math.round(value))

export function useAdaptiveFlow({ stepIndex = 1, totalSteps = 72 } = {}) {
  const stepStartRef = useRef(0)
  const [reactionTimesMs, setReactionTimesMs] = useState([])
  const [fatigueLevel, setFatigueLevel] = useState(0)

  const markAudioEnd = () => {
    stepStartRef.current = performance.now()
  }

  const registerSelection = () => {
    if (!stepStartRef.current) return
    const elapsedMs = Math.max(0, performance.now() - stepStartRef.current)
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) return
    setReactionTimesMs((prev) => {
      const next = [...prev.slice(-(REACTION_WINDOW - 1)), elapsedMs]
      if (next.length === REACTION_WINDOW) {
        const [first, second, third] = next
        const isFatigueTrend =
          second > first + FATIGUE_STEP_INCREASE_MS &&
          third > second + FATIGUE_STEP_INCREASE_MS
        setFatigueLevel((prevLevel) =>
          isFatigueTrend
            ? Math.min(MAX_FATIGUE_LEVEL, prevLevel + 1)
            : Math.max(0, prevLevel - 1),
        )
      } else {
        setFatigueLevel((prevLevel) => Math.max(0, prevLevel - 1))
      }
      return next
    })
  }

  const pace = useMemo(() => {
    const windowMs = reactionTimesMs.slice(-REACTION_WINDOW)
    if (!windowMs.length) return 'normal'
    const avg = windowMs.reduce((sum, value) => sum + value, 0) / windowMs.length
    if (avg < FAST_THRESHOLD_MS) return 'fast'
    if (avg > SLOW_THRESHOLD_MS) return 'slow'
    return 'normal'
  }, [reactionTimesMs])

  const phase = useMemo(() => getPhase(stepIndex, totalSteps), [stepIndex, totalSteps])
  const rhythm = pace
  const flowSettings = FLOW_SETTINGS_BY_PACE[pace] || FLOW_SETTINGS_BY_PACE.normal
  const attentionRefresh = {
    shouldScalePlayer: (Number(stepIndex) || 1) % 10 === 0,
    shouldBoostEase: (Number(stepIndex) || 1) % 8 === 0,
  }

  const timings = useMemo(
    () => ({
      transitionDelayMs: roundMs(BASE_TRANSITION_DELAY_MS * flowSettings.delay),
      processingStateMs: flowSettings.processing,
      fadeInDurationMs: roundMs(BASE_FADE_DURATION_MS * flowSettings.duration),
      choiceResetMs: roundMs(BASE_CHOICE_RESET_MS * flowSettings.delay),
      choiceRecallMs: roundMs(BASE_CHOICE_RECALL_MS * flowSettings.delay),
      neuroFlowMultiplier: flowSettings.delay,
      spacingMultiplier: flowSettings.duration + fatigueLevel * 0.07,
    }),
    [flowSettings.delay, flowSettings.duration, flowSettings.processing, fatigueLevel],
  )

  const uiVars = useMemo(
    () => ({
      '--adaptive-padding-multiplier': String(timings.spacingMultiplier),
      '--nf-duration-micro': `${Math.max(80, roundMs(timings.fadeInDurationMs * 0.5))}ms`,
      '--nf-duration-state': `${timings.fadeInDurationMs}ms`,
      '--nf-duration-progress': `${Math.max(120, roundMs(BASE_TRANSITION_DELAY_MS * flowSettings.delay))}ms`,
    }),
    [flowSettings.delay, timings.fadeInDurationMs, timings.spacingMultiplier],
  )

  return {
    phase,
    pace,
    rhythm,
    flowSettings,
    timings,
    uiVars,
    attentionRefresh,
    markAudioEnd,
    registerSelection,
  }
}
