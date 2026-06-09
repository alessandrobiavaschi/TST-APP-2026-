/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const UiSoundContext = createContext({
  enabled: true,
  playSoftTap: () => {},
  playPrimaryTap: () => {},
  playSecondaryTap: () => {},
  playGhostTap: () => {},
  playSwipe: () => {},
  playTransition: () => {},
  playTestTap: () => {},
  playTestPrimaryTap: () => {},
  playTestGhostTap: () => {},
  playTestSwipe: () => {},
  playTestTransition: () => {},
  playLightSwitchTap: () => {},
  toggleEnabled: () => {},
  resumeAudioContext: () => {},
})

let audioContext = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!audioContext) {
    audioContext = new AudioCtx()
  }
  return audioContext
}

function playSoftEnvelope({
  frequency = 420,
  duration = 0.13,
  volume = 0.06,
  attack = 0.015,
  filterCutoff = 1600,
  filterQ = 0.7,
} = {}) {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(frequency, now)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filterCutoff, now)
  filter.Q.setValueAtTime(filterQ, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(volume, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration + 0.05)
}

function playDualSoftEnvelope({
  baseFrequency = 420,
  detune = 28,
  duration = 0.14,
  volume = 0.055,
  attack = 0.02,
  filterCutoff = 1500,
  filterQ = 0.9,
} = {}) {
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const oscA = ctx.createOscillator()
  const oscB = ctx.createOscillator()
  const gain = ctx.createGain()
  const filter = ctx.createBiquadFilter()

  oscA.type = 'sine'
  oscB.type = 'sine'
  oscA.frequency.setValueAtTime(baseFrequency, now)
  oscB.frequency.setValueAtTime(baseFrequency + detune, now)

  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(filterCutoff, now)
  filter.Q.setValueAtTime(filterQ, now)

  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.linearRampToValueAtTime(volume, now + attack)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  oscA.connect(filter)
  oscB.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)

  oscA.start(now)
  oscB.start(now)
  oscA.stop(now + duration + 0.05)
  oscB.stop(now + duration + 0.05)
}

async function withAudioContext(enabled, callback) {
  if (!enabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume()
    } catch {
      return
    }
  }
  callback()
}

export function UiSoundProvider({ children }) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem('tst_ui_sounds_enabled')
      if (stored === '0') {
        queueMicrotask(() => setEnabled(false))
      } else if (stored === '1') {
        queueMicrotask(() => setEnabled(true))
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem('tst_ui_sounds_enabled', enabled ? '1' : '0')
    } catch {
      // ignore
    }
  }, [enabled])

  const value = useMemo(
    () => ({
      enabled,
      toggleEnabled: () => setEnabled((prev) => !prev),
      resumeAudioContext: async () => {
        await withAudioContext(enabled, () => {})
      },
      playSoftTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({ frequency: 520, duration: 0.11, volume: 0.05 })
        })
      },
      playPrimaryTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({ frequency: 580, duration: 0.16, volume: 0.07 })
        })
      },
      playSecondaryTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({ frequency: 500, duration: 0.1, volume: 0.045 })
        })
      },
      playGhostTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({ frequency: 440, duration: 0.09, volume: 0.038 })
        })
      },
      playTestTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({
            frequency: 295,
            duration: 0.17,
            volume: 0.009,
            attack: 0.07,
            filterCutoff: 620,
            filterQ: 0.32,
          })
        })
      },
      playTestPrimaryTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({
            frequency: 315,
            duration: 0.24,
            volume: 0.012,
            attack: 0.075,
            filterCutoff: 660,
            filterQ: 0.32,
          })
        })
      },
      playTestGhostTap: async () => {
        await withAudioContext(enabled, () => {
          playSoftEnvelope({
            frequency: 275,
            duration: 0.16,
            volume: 0.006,
            attack: 0.08,
            filterCutoff: 580,
            filterQ: 0.3,
          })
        })
      },
      playTestSwipe: async () => {
        await withAudioContext(enabled, () => {
          playDualSoftEnvelope({
            baseFrequency: 305,
            detune: -10,
            duration: 0.28,
            volume: 0.01,
            attack: 0.075,
            filterCutoff: 640,
            filterQ: 0.35,
          })
        })
      },
      playTestTransition: async () => {
        await withAudioContext(enabled, () => {
          playDualSoftEnvelope({
            baseFrequency: 330,
            detune: 8,
            duration: 0.34,
            volume: 0.011,
            attack: 0.08,
            filterCutoff: 660,
            filterQ: 0.35,
          })
        })
      },
      playLightSwitchTap: async () => {
        await withAudioContext(enabled, () => {
          playDualSoftEnvelope({ baseFrequency: 620, detune: 42, duration: 0.09, volume: 0.065 })
        })
      },
      playSwipe: async () => {
        await withAudioContext(enabled, () => {
          playDualSoftEnvelope({ baseFrequency: 480, detune: -36, duration: 0.18, volume: 0.05 })
        })
      },
      playTransition: async () => {
        await withAudioContext(enabled, () => {
          playDualSoftEnvelope({ baseFrequency: 560, detune: 22, duration: 0.22, volume: 0.06 })
        })
      },
    }),
    [enabled],
  )

  return <UiSoundContext.Provider value={value}>{children}</UiSoundContext.Provider>
}

function getButtonClassName(target) {
  if (!target) return ''
  if (typeof target.className === 'string') return target.className
  if (typeof target.getAttribute === 'function') {
    return target.getAttribute('class') || ''
  }
  return ''
}

export function useUiSounds() {
  return useContext(UiSoundContext)
}

export function UiSoundGlobalListener() {
  const value = useContext(UiSoundContext)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleClick = (event) => {
      if (!value?.enabled) return

      const control = event.target && event.target.closest
        ? event.target.closest('button, a')
        : null
      if (!control) return

      const tagName = typeof control.tagName === 'string' ? control.tagName.toLowerCase() : ''

      // Escludi il bottone della mini-preview che riproduce gli audio reali del test
      const className = getButtonClassName(control)
      if (tagName === 'a' && !className.includes('app-header-link')) {
        return
      }
      if (className.includes('nuovo-test-mini-preview-audio')) {
        return
      }

      // Accordion Info TST: suono gestito in TstPage (playTransition/playGhostTap) per open/close
      if (className.includes('nuovo-test-accordion-header')) {
        return
      }

      // Nel flusso test i suoni sono gestiti esplicitamente in NewTestPage (varianti più morbide)
      if (
        control.closest('.nuovo-test-page') ||
        control.closest('.nuovo-test-tutorial-layer') ||
        control.closest('.feedback-help-layer')
      ) {
        return
      }

      // Mappatura semplice per famiglie di bottoni
      if (
        className.includes('btn-primary') ||
        className.includes('submit-test') ||
        className.includes('header-register-button') ||
        className.includes('gdpr-banner-button--primary')
      ) {
        value.playPrimaryTap()
        return
      }

      if (
        className.includes('app-header-logo') ||
        className.includes('app-header-link') ||
        className.includes('nav-button') ||
        className.includes('player-button') ||
        className.includes('answer-button') ||
        className.includes('nuovo-test-mini-card') ||
        className.includes('nuovo-test-assaggio-preview-trigger') ||
        className.includes('gdpr-banner-button--secondary')
      ) {
        value.playSecondaryTap()
        return
      }

      if (
        className.includes('btn-ghost') ||
        className.includes('header-login-button') ||
        className.includes('test-story-dot') ||
        className.includes('test-story-arrow') ||
        className.includes('nuovo-test-faq-trigger') ||
        className.includes('nuovo-test-start-link')
      ) {
        value.playGhostTap()
        return
      }

      // Fallback morbido per qualsiasi altro bottone
      value.playSoftTap()
    }

    window.addEventListener('click', handleClick, true)
    return () => {
      window.removeEventListener('click', handleClick, true)
    }
  }, [value])

  return null
}

