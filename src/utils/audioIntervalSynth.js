/**
 * Web Audio Synthesizer per l'ascolto delle 13 distanze musicali.
 *
 * Riproduce la nota fondamentale (Do4 = 261.63 Hz) e la nota corrispondente
 * all'intervallo (semitoni da 0 a 12), con inviluppo dolce e armonici morbidi.
 */

let globalAudioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!globalAudioCtx) {
    globalAudioCtx = new AudioCtx()
  }
  if (globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume().catch(() => {})
  }
  return globalAudioCtx
}

export function playIntervalAudio(semitones, options = {}) {
  const ctx = getAudioContext()
  if (!ctx) return () => {}

  const baseFreq = options.baseFreq || 261.63 // Do4
  const duration = options.duration || 1.6
  const intervalFreq = baseFreq * Math.pow(2, Number(semitones || 0) / 12)

  const now = ctx.currentTime
  const attack = 0.03

  try {
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.0001, now)
    masterGain.gain.linearRampToValueAtTime(0.18, now + attack)
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    masterGain.connect(ctx.destination)

    // Oscillatore 1: Fondamentale
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(baseFreq, now)
    gain1.gain.setValueAtTime(0.7, now)
    osc1.connect(gain1)
    gain1.connect(masterGain)

    // Oscillatore 2: Intervallo
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(intervalFreq, now + 0.03)
    gain2.gain.setValueAtTime(0.65, now + 0.03)
    osc2.connect(gain2)
    gain2.connect(masterGain)

    // Se l'intervallo non è unisono, aggiunge una lieve sfumatura di armonica superiore
    let oscHarmonic = null
    if (semitones > 0) {
      oscHarmonic = ctx.createOscillator()
      const gainHarmonic = ctx.createGain()
      oscHarmonic.type = 'sine'
      oscHarmonic.frequency.setValueAtTime(intervalFreq * 2, now + 0.05)
      gainHarmonic.gain.setValueAtTime(0.12, now + 0.05)
      oscHarmonic.connect(gainHarmonic)
      gainHarmonic.connect(masterGain)
      oscHarmonic.start(now + 0.05)
      oscHarmonic.stop(now + duration)
    }

    osc1.start(now)
    osc2.start(now + 0.03)
    osc1.stop(now + duration + 0.05)
    osc2.stop(now + duration + 0.05)

    return () => {
      try {
        masterGain.gain.cancelScheduledValues(ctx.currentTime)
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime)
        masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      } catch {
        // audio already ended
      }
    }
  } catch {
    return () => {}
  }
}
