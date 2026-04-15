import React, { useEffect, useRef, useState } from 'react'
import { getFlowerVideoByColor, getFlowerStillByColor } from '../../colorAssets'

const MAX_WAIT_BEFORE_EXIT_MS = 1200
const MORPH_DURATION_MS = 260
const LEAVE_AFTER_MORPH_MS = 220
const MESSAGE_ROTATE_MS = 380

const REPORT_LOADING_MESSAGES = [
  'Stiamo preparando il tuo report, in base alle tue risposte.',
  'Un istante: stiamo mettendo insieme i punti chiave.',
  'Quasi fatto: il tuo profilo sta prendendo forma.',
  'Promesso, manca pochissimo.',
]

export default function FinalFlowerTransition({ colorKey, onEnded, onSkipped }) {
  const videoRef = useRef(null)
  const [isVisible, setIsVisible] = useState(true)
  const [showLoadingText, setShowLoadingText] = useState(true)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)
  const [phase, setPhase] = useState('video') // 'video' | 'toStill' | 'leaving'
  const hasStartedRef = useRef(false)
  const messageIntervalRef = useRef(null)
  const autoExitTimeoutRef = useRef(null)
  const leaveTimeoutRef = useRef(null)
  const finishTimeoutRef = useRef(null)

  const videoSrc = getFlowerVideoByColor(colorKey)
  const stillSrc = getFlowerStillByColor(colorKey)

  useEffect(() => {
    if (!videoSrc) {
      if (onEnded) onEnded()
    }
  }, [videoSrc, onEnded])

  useEffect(() => {
    return () => {
      if (messageIntervalRef.current) window.clearInterval(messageIntervalRef.current)
      if (autoExitTimeoutRef.current) window.clearTimeout(autoExitTimeoutRef.current)
      if (leaveTimeoutRef.current) window.clearTimeout(leaveTimeoutRef.current)
      if (finishTimeoutRef.current) window.clearTimeout(finishTimeoutRef.current)
    }
  }, [])

  const startMorphThenLeave = (callback) => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true

    if (messageIntervalRef.current) {
      window.clearInterval(messageIntervalRef.current)
      messageIntervalRef.current = null
    }
    if (autoExitTimeoutRef.current) {
      window.clearTimeout(autoExitTimeoutRef.current)
      autoExitTimeoutRef.current = null
    }
    if (leaveTimeoutRef.current) {
      window.clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    if (finishTimeoutRef.current) {
      window.clearTimeout(finishTimeoutRef.current)
      finishTimeoutRef.current = null
    }

    const el = videoRef.current
    try {
      if (el) el.pause()
    } catch {
      // ignore
    }
    setShowLoadingText(false)
    setPhase('toStill')
    leaveTimeoutRef.current = window.setTimeout(() => {
      leaveTimeoutRef.current = null
      setPhase('leaving')
      finishTimeoutRef.current = window.setTimeout(() => {
        finishTimeoutRef.current = null
        setIsVisible(false)
        if (callback) callback()
      }, LEAVE_AFTER_MORPH_MS)
    }, MORPH_DURATION_MS)
  }

  useEffect(() => {
    if (!videoSrc) return

    messageIntervalRef.current = window.setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % REPORT_LOADING_MESSAGES.length)
    }, MESSAGE_ROTATE_MS)

    autoExitTimeoutRef.current = window.setTimeout(() => {
      autoExitTimeoutRef.current = null
      startMorphThenLeave(onEnded)
    }, MAX_WAIT_BEFORE_EXIT_MS)

    return () => {
      if (messageIntervalRef.current) {
        window.clearInterval(messageIntervalRef.current)
        messageIntervalRef.current = null
      }
      if (autoExitTimeoutRef.current) {
        window.clearTimeout(autoExitTimeoutRef.current)
        autoExitTimeoutRef.current = null
      }
    }
  }, [videoSrc, onEnded])

  const handleVideoEnded = () => {
    startMorphThenLeave(onEnded)
  }

  const handleSkipClick = () => {
    startMorphThenLeave(onSkipped)
  }

  if (!videoSrc || !isVisible) {
    return null
  }

  const isLeaving = phase === 'leaving'
  const isToStill = phase === 'toStill'

  return (
    <div
      className={`final-flower-overlay ${isLeaving ? 'final-flower-overlay--leaving' : 'final-flower-overlay--enter'} ${isToStill ? 'final-flower-overlay--to-still' : ''}`}
      aria-modal="true"
      role="dialog"
      aria-label="Animazione di chiusura del test"
    >
      <div className="final-flower-overlay__inner">
        <video
          ref={videoRef}
          className="final-flower-overlay__video"
          src={videoSrc}
          autoPlay
          playsInline
          muted
          controls={false}
          onEnded={handleVideoEnded}
        />
        {stillSrc && (
          <img
            src={stillSrc}
            alt=""
            className="final-flower-overlay__still"
            aria-hidden="true"
          />
        )}
        <div className="final-flower-overlay__chrome">
          <p
            className={`final-flower-overlay__loading-text ${showLoadingText ? '' : 'final-flower-overlay__loading-text--hidden'}`}
          >
            <span className="final-flower-overlay__loading-title">Stiamo preparando il tuo report</span>
            <span className="final-flower-overlay__loading-subtitle">
              {REPORT_LOADING_MESSAGES[loadingMessageIndex]}
            </span>
          </p>
          <button
            type="button"
            className="final-flower-overlay__skip-button"
            onClick={handleSkipClick}
          >
            SKIP
          </button>
        </div>
      </div>
    </div>
  )
}

