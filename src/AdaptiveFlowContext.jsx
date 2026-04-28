/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ADAPTIVE_FLOW_CONFIG } from './config/adaptiveFlowConfig.js'

const AdaptiveFlowContext = createContext(null)

const RHYTHM = {
  BALANCED: 'balanced',
  FAST: 'fast',
  SLOW: 'slow',
}

const STORAGE_KEY = 'tst_adaptive_flow_v1'
const RESPONSE_WEIGHTS = [0.1, 0.2, 0.3, 0.4]

function clampMs(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function computeWeightedAverageMs(samples, fallback) {
  if (!samples.length) return fallback
  const lastSamples = samples.slice(-RESPONSE_WEIGHTS.length)
  const scopedWeights = RESPONSE_WEIGHTS.slice(-lastSamples.length)
  const totalWeight = scopedWeights.reduce((acc, weight) => acc + weight, 0) || 1
  const weightedTotal = lastSamples.reduce((acc, value, index) => acc + value * scopedWeights[index], 0)
  return weightedTotal / totalWeight
}

function resolveRhythmFromSamples(samples) {
  if (samples.length < ADAPTIVE_FLOW_CONFIG.minSamplesForClassification) return RHYTHM.BALANCED
  const allFast = samples.every((value) => value < ADAPTIVE_FLOW_CONFIG.fastThresholdMs)
  const allSlow = samples.every((value) => value > ADAPTIVE_FLOW_CONFIG.slowThresholdMs)
  if (allFast) return RHYTHM.FAST
  if (allSlow) return RHYTHM.SLOW
  return RHYTHM.BALANCED
}

function buildTimings(samples, rhythm) {
  const base = ADAPTIVE_FLOW_CONFIG.baseTimings
  const multipliers = ADAPTIVE_FLOW_CONFIG.multipliers[rhythm] || ADAPTIVE_FLOW_CONFIG.multipliers.balanced
  const weightedResponseMs = computeWeightedAverageMs(samples, base.transitionDelayMs * 18)
  const weightedTransitionMs = clampMs(weightedResponseMs / 18, 140, 460)

  return {
    transitionDelayMs: clampMs(weightedTransitionMs * multipliers.transitionDelay, 120, 520),
    fadeInDurationMs: clampMs(base.fadeInDurationMs * multipliers.fadeIn, 180, 620),
    processingStateMs: clampMs(base.processingStateMs * multipliers.processing, 110, 500),
    choiceResetMs: clampMs(base.choiceResetMs * multipliers.choiceReset, 120, 380),
    choiceRecallMs: clampMs(base.choiceRecallMs * multipliers.choiceRecall, 150, 420),
    neuroFlowMultiplier: Number(multipliers.neuroFlow.toFixed(3)),
    spacingMultiplier: Number(multipliers.spacing.toFixed(3)),
  }
}

export function AdaptiveFlowProvider({ children }) {
  const [persistedState] = useState(() => {
    if (typeof window === 'undefined') {
      return { rhythm: RHYTHM.BALANCED, lastResponseTimeMs: null, recentResponseTimesMs: [] }
    }
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (!raw) {
        return { rhythm: RHYTHM.BALANCED, lastResponseTimeMs: null, recentResponseTimesMs: [] }
      }
      const parsed = JSON.parse(raw)
      const restoredRhythm = Object.values(RHYTHM).includes(parsed?.rhythm) ? parsed.rhythm : RHYTHM.BALANCED
      const restoredRecent = Array.isArray(parsed?.recentResponseTimesMs)
        ? parsed.recentResponseTimesMs
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value >= 0)
            .slice(-ADAPTIVE_FLOW_CONFIG.responseWindowSize)
        : []
      const restoredLast = Number.isFinite(parsed?.lastResponseTimeMs) ? parsed.lastResponseTimeMs : null
      return { rhythm: restoredRhythm, lastResponseTimeMs: restoredLast, recentResponseTimesMs: restoredRecent }
    } catch {
      return { rhythm: RHYTHM.BALANCED, lastResponseTimeMs: null, recentResponseTimesMs: [] }
    }
  })
  const [rhythm, setRhythm] = useState(persistedState.rhythm)
  const [lastResponseTimeMs, setLastResponseTimeMs] = useState(persistedState.lastResponseTimeMs)
  const [recentResponseTimesMs, setRecentResponseTimesMs] = useState(persistedState.recentResponseTimesMs)
  const lastAudioEndAtRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          rhythm,
          lastResponseTimeMs,
          recentResponseTimesMs,
        }),
      )
    } catch {
      // ignore storage failures
    }
  }, [rhythm, lastResponseTimeMs, recentResponseTimesMs])

  const markAudioEnd = useCallback((endedAt = Date.now()) => {
    lastAudioEndAtRef.current = endedAt
  }, [])

  const registerSelection = useCallback((selectedAt = Date.now()) => {
    const endedAt = lastAudioEndAtRef.current
    if (!endedAt) return null

    const responseTimeMs = Math.max(0, selectedAt - endedAt)
    lastAudioEndAtRef.current = null
    setLastResponseTimeMs(responseTimeMs)
    setRecentResponseTimesMs((prev) => {
      const next = [...prev, responseTimeMs].slice(-ADAPTIVE_FLOW_CONFIG.responseWindowSize)
      setRhythm(resolveRhythmFromSamples(next))
      return next
    })
    return responseTimeMs
  }, [])

  const value = useMemo(() => {
    const timings = buildTimings(recentResponseTimesMs, rhythm)
    return {
      rhythm,
      pace: rhythm,
      timings,
      flowSettings: {
        fastThresholdMs: ADAPTIVE_FLOW_CONFIG.fastThresholdMs,
        slowThresholdMs: ADAPTIVE_FLOW_CONFIG.slowThresholdMs,
        processing: timings.processingStateMs,
        delay: timings.neuroFlowMultiplier,
      },
      lastResponseTimeMs,
      recentResponseTimesMs,
      markAudioEnd,
      registerSelection,
    }
  }, [rhythm, recentResponseTimesMs, lastResponseTimeMs, markAudioEnd, registerSelection])

  return <AdaptiveFlowContext.Provider value={value}>{children}</AdaptiveFlowContext.Provider>
}

export function useAdaptiveFlowContext() {
  const context = useContext(AdaptiveFlowContext)
  if (!context) {
    throw new Error('useAdaptiveFlow must be used within AdaptiveFlowProvider')
  }
  return context
}

