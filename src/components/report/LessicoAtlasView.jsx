import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { GALAXY_THEORY_BY_DISPOSITION } from '../../config/galaxyTheoryContent.ts'
import { useUiSounds } from '../../UiSoundProvider.jsx'

// ─── Virtual World Dimensions ────────────────────────────────────────────────
const WORLD_WIDTH = 3400
const WORLD_HEIGHT = 2400

const CAMERA_MIN_SCALE = 0.22
const CAMERA_MAX_SCALE = 2.8
const CAMERA_ZOOM_STEP = 1.28
const WHEEL_ZOOM_INTENSITY = 0.024
const PINCH_DAMPING = 0.70
const BASE_PITCH = 0
const FOCUS_PITCH = 0
const LERP_FACTOR = 0.45

// Exact Cubic-Bezier solver for fly-to transitions: cubic-bezier(0.16, 1, 0.3, 1)
function solveCubicBezier(x1, y1, x2, y2) {
  return function (x) {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let s = x
    for (let i = 0; i < 6; i++) {
      const currentX = 3 * (1 - s) * (1 - s) * s * x1 + 3 * (1 - s) * s * s * x2 + s * s * s
      const dx = 3 * (1 - s) * (1 - s) * x1 + 6 * (1 - s) * s * (x2 - x1) + 3 * s * s * (1 - x2)
      if (Math.abs(currentX - x) < 1e-5 || Math.abs(dx) < 1e-6) break
      s -= (currentX - x) / dx
    }
    s = Math.max(0, Math.min(1, s))
    return 3 * (1 - s) * (1 - s) * s * y1 + 3 * (1 - s) * s * s * y2 + s * s * s
  }
}
const flyEasing = solveCubicBezier(0.16, 1, 0.3, 1)

function createCamera(x = 0, y = 0, scale = 0.5, pitch = BASE_PITCH, yaw = 0, roll = 0, z = 0) {
  return { x, y, z, scale, pitch, yaw, roll }
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v))
}

// ─── Family Metadata & Constellation Anchor Positions (Rosa dei Venti) ───────
const FAMILY_CONFIG = {
  entusiasmo: {
    id: 'entusiasmo',
    label: 'Entusiasta',
    colors: ['#fbbf24', '#f59e0b', '#d97706', '#fcd34d', '#f97316', '#fb923c'],
    baseColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.24)',
    x: 1700,
    y: 440,
    radius: 440,
    subSpread: 240,
    compass: 'Nord · Fuoco / Luce',
  },
  flemmatica: {
    id: 'flemmatica',
    label: 'Flemmatica',
    colors: ['#4ade80', '#22c55e', '#16a34a', '#34d399', '#0d9488', '#2dd4bf'],
    baseColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.22)',
    x: 1700,
    y: 1300,
    radius: 420,
    subSpread: 210,
    compass: 'Centro · Acqua / Calma',
  },
  agnostica_anaffettiva: {
    id: 'agnostica_anaffettiva',
    label: 'Razionale',
    colors: ['#94a3b8', '#64748b', '#cbd5e1', '#9ca3af', '#475569', '#e2e8f0'],
    baseColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.22)',
    x: 1700,
    y: 2160,
    radius: 400,
    subSpread: 230,
    compass: 'Sud · Terra / Distacco',
  },
  malinconica_nostalgica: {
    id: 'malinconica_nostalgica',
    label: 'Malinconica',
    colors: ['#818cf8', '#6366f1', '#7c3aed', '#a5b4fc', '#4338ca', '#c084fc'],
    baseColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.24)',
    x: 680,
    y: 1300,
    radius: 660,
    subSpread: 350,
    compass: 'Ovest · Aria / Memoria',
  },
  collerico_volitiva: {
    id: 'collerico_volitiva',
    label: 'Marziale',
    colors: ['#f87171', '#ef4444', '#dc2626', '#fb7185', '#be123c', '#c026d3'],
    baseColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.24)',
    x: 2720,
    y: 1300,
    radius: 540,
    subSpread: 290,
    compass: 'Est · Fuoco / Decisione',
  },
}

const FAMILY_ORDER = [
  'malinconica_nostalgica',
  'collerico_volitiva',
  'flemmatica',
  'entusiasmo',
  'agnostica_anaffettiva',
]

const FAMILY_META = FAMILY_CONFIG

const VIEW_MODEL_FAMILIES = [
  { familyKey: 'blu', familyName: 'Blu', familyId: 'malinconica_nostalgica' },
  { familyKey: 'rosso', familyName: 'Rosso', familyId: 'collerico_volitiva' },
  { familyKey: 'verde', familyName: 'Verde', familyId: 'flemmatica' },
  { familyKey: 'giallo', familyName: 'Giallo', familyId: 'entusiasmo' },
  { familyKey: 'grigio', familyName: 'Grigio', familyId: 'agnostica_anaffettiva' },
]

const ATLAS_FAMILY_ID_BY_KEY = Object.fromEntries(
  VIEW_MODEL_FAMILIES.map(({ familyKey, familyId }) => [familyKey, familyId]),
)

const ATLAS_FAMILY_KEY_BY_ID = Object.fromEntries(
  VIEW_MODEL_FAMILIES.map(({ familyKey, familyId }) => [familyId, familyKey]),
)

const FAMILY_LIST = FAMILY_ORDER.map((id) => ({ id, ...FAMILY_CONFIG[id] }))

// ─── Bézier Curve Calculation for Filament Edges ────────────────────────────
function computeBézierPath(x1, y1, x2, y2, sphereX, sphereY, sagVariation = 0) {
  const mx = (x1 + x2) * 0.5
  const my = (y1 + y2) * 0.5
  const sx = sphereX ?? mx
  const sy = sphereY ?? my

  const lx = x2 - x1
  const ly = y2 - y1
  const lDist = Math.hypot(lx, ly)

  // Natural gravitational sag (15-35px) influenced by chord distance and variation
  const baseSag = lDist > 0 ? Math.min(30, Math.max(18, lDist * 0.16)) : 22
  const sag = Math.max(15, Math.min(35, baseSag + sagVariation * 2.5))

  let cx = mx
  let cy = my

  if (lDist > 0.001) {
    // Normal perpendicular to the chord (x1, y1) -> (x2, y2)
    const px = -ly / lDist
    const py = lx / lDist

    // Vector from celestial sphere center to chord midpoint
    const dx = mx - sx
    const dy = my - sy
    const distFromCenter = Math.hypot(dx, dy)

    if (distFromCenter > 0.001) {
      // Determine orientation so curvature bows naturally with the gravitational field
      const dot = px * dx + py * dy
      const sign = dot >= 0 ? 1 : -1
      cx = mx + px * sign * sag
      cy = my + py * sign * sag
    } else {
      cx = mx + px * sag
      cy = my + py * sag
    }
  } else {
    cx += sag
    cy += sag
  }

  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

// ─── Build Constellation Network (Concentric Elliptical Orbits) ──────────────
function buildConstellationData() {
  const words = []
  const hubs = []
  const edges = []
  const spheres = []

  for (const famId of FAMILY_ORDER) {
    const theory = GALAXY_THEORY_BY_DISPOSITION[famId]
    const cfg = FAMILY_CONFIG[famId]
    if (!theory || !cfg) continue

    spheres.push({
      id: famId,
      name: cfg.label,
      compass: cfg.compass,
      x: cfg.x,
      y: cfg.y,
      radius: cfg.radius,
      color: cfg.baseColor,
      glowColor: cfg.glowColor,
    })

    const currents = theory.currents
    const numCurrents = currents.length

    currents.forEach((c, ci) => {
      let hubX = cfg.x
      let hubY = cfg.y

      if (numCurrents > 1) {
        const hubAngle = (ci / numCurrents) * Math.PI * 2 - Math.PI / 2
        hubX = cfg.x + Math.cos(hubAngle) * cfg.subSpread
        hubY = cfg.y + Math.sin(hubAngle) * cfg.subSpread

        edges.push({
          id: `edge-core-${c.rawKey}`,
          familyId: famId,
          subcurrentId: c.rawKey,
          x1: cfg.x,
          y1: cfg.y,
          x2: hubX,
          y2: hubY,
          type: 'core-hub',
          color: cfg.baseColor,
          targetColor: cfg.baseColor,
          sphereX: cfg.x,
          sphereY: cfg.y,
          sagVariation: 0,
        })
      }

      hubs.push({
        id: c.rawKey,
        familyId: famId,
        title: c.title,
        interval: c.interval,
        x: hubX,
        y: hubY,
        color: cfg.baseColor,
      })

      const states = c.states || []
      const numStates = states.length
      if (numStates === 0) return

      // Partition words across 3 concentric hierarchical rings:
      // Ring 0 (inner ~40% maxR): dominant / high-salience words (font size 17, weight 700)
      // Ring 1 (middle ~70% maxR): intermediate words (font size 14, weight 600)
      // Ring 2 (outer 100% maxR): remaining words (font size 12.5, weight 500)
      let count0 = 2
      let count1 = 4
      if (numStates <= 5) {
        count0 = Math.min(2, numStates)
        count1 = numStates - count0
      } else if (numStates <= 9) {
        count0 = 2
        count1 = 3
      } else if (numStates <= 12) {
        count0 = 3
        count1 = 4
      } else {
        count0 = 3
        count1 = 5
      }

      const ringAssignments = []
      states.forEach((state, si) => {
        let ringIndex = 0
        if (si < count0) {
          ringIndex = 0
        } else if (si < count0 + count1) {
          ringIndex = 1
        } else {
          ringIndex = 2
        }

        const fontSize = ringIndex === 0 ? 17 : ringIndex === 1 ? 14 : 12.5
        const fontWeight = ringIndex === 0 ? 700 : ringIndex === 1 ? 600 : 500
        const estWidth = state.length * fontSize * 0.65 + 32
        const estHeight = fontSize * 1.4 + 14

        ringAssignments.push({
          state,
          si,
          ringIndex,
          fontSize,
          fontWeight,
          estWidth,
          estHeight,
        })
      })

      const baseR = numCurrents === 1 ? cfg.radius * 0.88 : cfg.subSpread * 0.96
      const maxR = Math.max(220, Math.min(420, baseR + (numStates > 8 ? (numStates - 8) * 14 : 0)))

      // Distribute each ring with proportional angular spacing weighted by text length
      for (let rIdx = 0; rIdx <= 2; rIdx++) {
        const ringWords = ringAssignments.filter((item) => item.ringIndex === rIdx)
        if (ringWords.length === 0) continue

        const ringFactor = rIdx === 0 ? 0.46 : rIdx === 1 ? 0.76 : 1.06
        const r = maxR * ringFactor
        const yFlatten = 0.90

        // Words are anchored stably to their celestial positions

        // Weighted angular allocation based on estimated text width
        const totalRingWeight = ringWords.reduce((sum, item) => sum + item.estWidth, 0)
        const ringPhaseOffset =
          rIdx * 0.73 + ci * 1.25 + (famId.charCodeAt(0) % 7) * 0.41

        let currentAngle = ringPhaseOffset
        for (let j = 0; j < ringWords.length; j++) {
          const item = ringWords[j]
          const angularSpan = (item.estWidth / totalRingWeight) * (Math.PI * 2)
          const angle = currentAngle + angularSpan / 2
          currentAngle += angularSpan

          const wx = hubX + Math.cos(angle) * r
          const wy = hubY + Math.sin(angle) * (r * yFlatten)

          const wordId = `${famId}-${c.rawKey}-${item.si}`
          const wordObj = {
            id: wordId,
            index: words.length,
            nome: item.state,
            familyId: famId,
            familyLabel: cfg.label,
            familyColor: cfg.baseColor,
            subcurrentId: c.rawKey,
            subcurrentTitle: c.title,
            subcurrentDescription: c.description,
            subcurrentInterval: c.interval,
            hubId: c.rawKey,
            hubX,
            hubY,
            x: wx,
            y: wy,
            width: item.estWidth,
            height: item.estHeight,
            fontSize: item.fontSize,
            fontWeight: item.fontWeight,
            color: cfg.colors[item.si % cfg.colors.length],
            ringIndex: rIdx,
            orbitRadius: r,
            yFlatten,
            baseAngle: angle,
            driftSpeed: 0,
          }
          words.push(wordObj)

          edges.push({
            id: `edge-word-${wordId}`,
            familyId: famId,
            subcurrentId: c.rawKey,
            wordId,
            wordIndex: words.length - 1,
            x1: hubX,
            y1: hubY,
            x2: wx,
            y2: wy,
            type: 'hub-word',
            color: cfg.baseColor,
            targetColor: cfg.colors[item.si % cfg.colors.length],
            sphereX: cfg.x,
            sphereY: cfg.y,
            sagVariation: ((wordId.charCodeAt(wordId.length - 1)) % 7) - 3,
          })
        }
      }
    })
  }

  // Pre-settle relaxation with guaranteed separation
  const numWords = words.length
  const pX = new Float32Array(numWords)
  const pY = new Float32Array(numWords)
  const vX = new Float32Array(numWords)
  const vY = new Float32Array(numWords)
  for (let i = 0; i < numWords; i++) {
    pX[i] = words[i].x
    pY[i] = words[i].y
  }

  const aspect = 1.8
  const kSpring = 0.04
  const damping = 0.86
  for (let step = 0; step < 60; step++) {
    for (let i = 0; i < numWords; i++) {
      const w = words[i]
      let fx = -kSpring * (pX[i] - w.x)
      let fy = -kSpring * (pY[i] - w.y)

      for (let j = i + 1; j < numWords; j++) {
        if (words[j].familyId !== w.familyId) continue
        const dx = pX[j] - pX[i]
        const dy = pY[j] - pY[i]
        const minDist = (w.width + words[j].width) * 0.5 + 26
        if (Math.abs(dx) > minDist) continue
        const scaledDy = dy * aspect
        if (Math.abs(scaledDy) > minDist) continue

        const d = Math.hypot(dx, scaledDy)
        if (d < minDist && d > 0.001) {
          const rawF = Math.min(12, 2800 / ((d + 1) * (d + 1)))
          const nx = dx / d
          const ny = (scaledDy / d) / aspect
          fx -= nx * rawF
          fy -= ny * rawF
          vX[j] += nx * rawF * damping
          vY[j] += ny * rawF * damping
        }
      }

      vX[i] = (vX[i] + fx) * damping
      vY[i] = (vY[i] + fy) * damping
      pX[i] += vX[i]
      pY[i] += vY[i]
    }
  }

  // Hard anti-overlap separation pass to guarantee zero overlap
  for (let pass = 0; pass < 8; pass++) {
    for (let i = 0; i < numWords; i++) {
      for (let j = i + 1; j < numWords; j++) {
        if (words[j].familyId !== words[i].familyId) continue
        const dx = pX[j] - pX[i]
        const dy = pY[j] - pY[i]
        const reqW = (words[i].width + words[j].width) * 0.5 + 16
        const reqH = (words[i].height + words[j].height) * 0.5 + 12
        if (Math.abs(dx) < reqW && Math.abs(dy) < reqH) {
          const overlapX = reqW - Math.abs(dx)
          const overlapY = reqH - Math.abs(dy)
          const pushX = (overlapX * 0.55) * (dx >= 0 ? 1 : -1)
          const pushY = (overlapY * 0.55) * (dy >= 0 ? 1 : -1)
          pX[i] -= pushX * 0.5
          pY[i] -= pushY * 0.5
          pX[j] += pushX * 0.5
          pY[j] += pushY * 0.5
        }
      }
    }
  }

  for (let i = 0; i < numWords; i++) {
    words[i].x = Math.round(pX[i])
    words[i].y = Math.round(pY[i])
  }

  // Synchronize initial edge endpoints and compute initial Bézier paths
  for (const edge of edges) {
    if (edge.wordIndex !== undefined) {
      const target = words[edge.wordIndex]
      if (target) {
        edge.x2 = target.x
        edge.y2 = target.y
      }
    }
    edge.d = computeBézierPath(
      edge.x1,
      edge.y1,
      edge.x2,
      edge.y2,
      edge.sphereX,
      edge.sphereY,
      edge.sagVariation,
    )
  }

  // Populate nearby words for dictionary panel
  for (const w of words) {
    w.nearbyWords = words
      .filter((v) => v.subcurrentId === w.subcurrentId && v.id !== w.id)
      .slice(0, 6)
      .map((v) => v.nome)
  }

  return {
    spheres,
    hubs,
    edges,
    words,
  }
}

const CONSTELLATION_DATA = buildConstellationData()
const ATLAS_WORDS = CONSTELLATION_DATA.words

// ─── TST Web Audio Harmonic Synthesizer ──────────────────────────────────────
const INTERVAL_SEMITONES = {
  'unisono': 0,
  'seconda minore': 1,
  'seconda maggiore': 2,
  'terza minore': 3,
  'terza maggiore': 4,
  'quarta giusta': 5,
  'tritono': 6,
  'quinta diminuita': 6,
  'quinta giusta': 7,
  'sesta minore': 8,
  'sesta maggiore': 9,
  'settima minore': 10,
  'settima maggiore': 11,
  'ottava': 12,
}

const FAMILY_BASE_FREQS = {
  malinconica_nostalgica: 220,   // La (A3)
  collerico_volitiva: 330,       // Mi (E4)
  flemmatica: 261.63,            // Do (C4)
  entusiasmo: 392,               // Sol (G4)
  agnostica_anaffettiva: 293.66, // Re (D4)
}

let atlasAudioCtx = null
function getAtlasAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!atlasAudioCtx) {
    atlasAudioCtx = new AudioCtx()
  }
  if (atlasAudioCtx.state === 'suspended') {
    atlasAudioCtx.resume().catch(() => {})
  }
  return atlasAudioCtx
}

function playHarmonicChime(intervalName, familyId, isSoundEnabled) {
  if (!isSoundEnabled) return
  const ctx = getAtlasAudioContext()
  if (!ctx) return

  const f1 = FAMILY_BASE_FREQS[familyId] || 261.63
  const norm = (intervalName || '').toLowerCase().trim()
  let semitones = 7
  for (const [key, val] of Object.entries(INTERVAL_SEMITONES)) {
    if (norm.includes(key)) {
      semitones = val
      break
    }
  }
  const f2 = f1 * Math.pow(2, semitones / 12)

  const now = ctx.currentTime
  const duration = 0.35

  try {
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    const gain2 = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(f1, now)
    gain1.gain.setValueAtTime(0.0001, now)
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.02)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(f2, now + 0.035)
    gain2.gain.setValueAtTime(0.0001, now)
    gain2.gain.setValueAtTime(0.0001, now + 0.035)
    gain2.gain.linearRampToValueAtTime(0.09, now + 0.055)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.035)
    osc1.stop(now + duration + 0.05)
    osc2.stop(now + duration + 0.05)
  } catch {
    // ignore audio context errors
  }
}

// ─── Mini-Oscilloscopio Audio Waveform ───────────────────────────────────────
function OscilloscopeCanvas({ intervalName, familyColor }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const norm = (intervalName || '').toLowerCase().trim()
    let semitones = 7
    for (const [key, val] of Object.entries(INTERVAL_SEMITONES)) {
      if (norm.includes(key)) {
        semitones = val
        break
      }
    }

    let animId = null
    let t = 0
    const color = familyColor || '#38bdf8'

    const render = () => {
      t += 0.04
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Zero-crossing central guide
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, h / 2)
      ctx.lineTo(w, h / 2)
      ctx.stroke()

      // Primary sine wave (fundamental)
      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.beginPath()
      const midY = h / 2
      const amp1 = 12
      const freq1 = 0.038
      for (let x = 0; x < w; x++) {
        const y = midY + Math.sin(x * freq1 + t) * amp1
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      // Secondary harmonic wave (interval ratio)
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)'
      ctx.lineWidth = 1.2
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 4
      ctx.beginPath()
      const amp2 = 7.5
      const freq2 = 0.038 * (1 + semitones / 12)
      for (let x = 0; x < w; x++) {
        const y = midY + Math.sin(x * freq2 - t * 1.25) * amp2
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)
    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [intervalName, familyColor])

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={48}
      className="lessico-holo-slate__oscilloscope"
      aria-hidden="true"
    />
  )
}

// ─── Floating Holographic Slate (Cyber-Astronomy & GTA VI Style) ────────────
function FloatingHolographicSlate({ word, onClose, onSelectWord, viewModel }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [word?.id])

  if (!word) return null
  const meta = FAMILY_CONFIG[word.familyId]

  const dynamicWordInfo = viewModel?.lessicoSituazionale?.find(
    (p) =>
      p.parola.toLowerCase() === word.nome.toLowerCase() &&
      ATLAS_FAMILY_ID_BY_KEY[p.familyKey] === word.familyId &&
      p.correnteKey === word.subcurrentId,
  )

  const isSituational = Boolean(dynamicWordInfo)
  const hasApprofondimento = Boolean(word.subcurrentInterval || dynamicWordInfo)

  return (
    <aside
      id="lessico-dictionary-popover"
      className="lessico-holo-slate"
      style={{ '--slate-color': word.color || meta?.baseColor }}
      aria-label="Tavoletta olografica lessicale"
    >
      <div className="lessico-holo-slate__bezel">
        <header className="lessico-holo-slate__head">
          <div className="lessico-holo-slate__head-tag">
            <span className="lessico-holo-slate__status-dot" />
            <span className="lessico-holo-slate__kicker">HOLO-SLATE // TST DICTIONARY</span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="lessico-holo-slate__close"
            onClick={onClose}
            aria-label="Chiudi scheda olografica"
          >
            ✕
          </button>
        </header>

        <div className="lessico-holo-slate__body">
          {/* Word Title & Pulsing Badge */}
          <div className="lessico-holo-slate__hero">
            <h2 className="lessico-holo-slate__word">{word.nome}</h2>
            <div className="lessico-holo-slate__badge-wrap">
              <span
                className={`lessico-holo-slate__badge${
                  isSituational ? ' is-situational' : ' is-stable'
                }`}
              >
                {isSituational ? 'SITUAZIONALE (EMERSA DAL TEST)' : 'STABILE (TEORIA TST)'}
              </span>
              {dynamicWordInfo?.conteggio && (
                <span className="lessico-holo-slate__count-pill">
                  {dynamicWordInfo.conteggio} {dynamicWordInfo.conteggio === 1 ? 'risposta' : 'risposte'}
                </span>
              )}
            </div>
          </div>

          {/* Mini-Oscilloscope Audio */}
          <div className="lessico-holo-slate__scope-wrap">
            <div className="lessico-holo-slate__scope-header">
              <span className="lessico-holo-slate__scope-title">
                SPETTRO FORMA D'ONDA // {word.subcurrentInterval ? word.subcurrentInterval.toUpperCase() : 'QUINTA GIUSTA'}
              </span>
              <span className="lessico-holo-slate__scope-freq">
                HARMONIC RES.
              </span>
            </div>
            <OscilloscopeCanvas
              intervalName={word.subcurrentInterval}
              familyColor={word.color || meta?.baseColor}
            />
          </div>

          {/* Meta specs */}
          <dl className="lessico-holo-slate__specs">
            <div className="lessico-holo-slate__spec-row">
              <dt>FAMIGLIA</dt>
              <dd>
                <span
                  className="lessico-holo-slate__dot"
                  style={{ backgroundColor: meta?.baseColor }}
                  aria-hidden="true"
                />
                {word.familyLabel}
              </dd>
            </div>
            <div className="lessico-holo-slate__spec-row">
              <dt>SOTTOCORRENTE</dt>
              <dd>{word.subcurrentTitle}</dd>
            </div>
            {dynamicWordInfo?.fileKeys && dynamicWordInfo.fileKeys.length > 0 && (
              <div className="lessico-holo-slate__spec-row">
                <dt>TRACCE TEST</dt>
                <dd className="lessico-holo-slate__tracks">
                  {dynamicWordInfo.fileKeys.map((f) => (
                    <span key={f} className="lessico-holo-slate__track-badge">
                      {f.replace('File_', 'Traccia ')}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>

          {word.subcurrentDescription && (
            <div className="lessico-holo-slate__desc">
              <h3>Risonanza Emotiva</h3>
              <p>{word.subcurrentDescription}</p>
            </div>
          )}

          {/* Satelliti & Costellazioni Vicine */}
          {word.nearbyWords.length > 0 && (
            <div className="lessico-holo-slate__constellation">
              <h3>Nodi Satellite in Costellazione</h3>
              <div className="lessico-holo-slate__satellites">
                {word.nearbyWords.map((nome) => {
                  const w = ATLAS_WORDS.find(
                    (v) =>
                      v.nome === nome &&
                      v.familyId === word.familyId &&
                      v.subcurrentId === word.subcurrentId,
                  )
                  return (
                    <button
                      key={nome}
                      type="button"
                      className="lessico-holo-slate__satellite-node"
                      style={{ '--sat-color': w?.color || meta?.baseColor }}
                      onClick={() => w && onSelectWord(w)}
                    >
                      <span className="lessico-holo-slate__satellite-dot" />
                      <span>{nome}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {hasApprofondimento && (
            <details className="lessico-dashboard__details lessico-holo-slate__details">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Specifiche Tecniche TST
              </summary>
              <dl className="lessico-holo-slate__specs mt-2">
                {word.subcurrentInterval && (
                  <div className="lessico-holo-slate__spec-row">
                    <dt>INTERVALLO</dt>
                    <dd>{word.subcurrentInterval}</dd>
                  </div>
                )}
                {dynamicWordInfo && (
                  <>
                    <div className="lessico-holo-slate__spec-row">
                      <dt>CORRENTE</dt>
                      <dd style={{ fontSize: '0.85rem' }}>{dynamicWordInfo.correnteKey}</dd>
                    </div>
                    <div className="lessico-holo-slate__spec-row">
                      <dt>FAMIGLIA KEY</dt>
                      <dd>{dynamicWordInfo.familyKey}</dd>
                    </div>
                  </>
                )}
              </dl>
            </details>
          )}
        </div>
      </div>
    </aside>
  )
}

// ─── Tactical HUD Frequency Spectrum Filters ────────────────────────────────
function AtlasLegend({ filterFamily, onFilterChange, viewModel }) {
  const totalWords = ATLAS_WORDS.length

  const userPercentages = useMemo(() => {
    if (!viewModel?.datiDisponibili || !viewModel?.campoDiForze?.perFamiglia) {
      return null
    }
    const map = {}
    for (const item of viewModel.campoDiForze.perFamiglia) {
      if (item.familyKey && typeof item.peso === 'number') {
        map[item.familyKey] = Math.round(item.peso)
      }
    }
    return map
  }, [viewModel])

  return (
    <nav className="lessico-legend lessico-legend--tactical" aria-label="Filtra per frequenza e famiglia">
      <button
        type="button"
        className={`lessico-legend__item lessico-legend__item--tactical${!filterFamily ? ' is-active' : ''}`}
        onClick={() => onFilterChange(null)}
      >
        <span className="lessico-legend__spectrum-bars" aria-hidden="true">
          <span className="bar bar-1" />
          <span className="bar bar-2" />
          <span className="bar bar-3" />
        </span>
        <span className="lessico-legend__label">ALL</span>
        <span className="lessico-legend__val">{totalWords}W</span>
      </button>
      {FAMILY_LIST.map((fam) => {
        const famWords = ATLAS_WORDS.filter((w) => w.familyId === fam.id).length
        const key = ATLAS_FAMILY_KEY_BY_ID[fam.id]
        const userPct = userPercentages && key ? userPercentages[key] : null
        const pct = userPct !== null && userPct !== undefined ? userPct : Math.round((famWords / totalWords) * 100)
        const isActive = filterFamily === fam.id

        return (
          <button
            key={fam.id}
            type="button"
            className={`lessico-legend__item lessico-legend__item--tactical${isActive ? ' is-active' : ''}`}
            style={{ '--legend-color': fam.baseColor }}
            onClick={() => onFilterChange(isActive ? null : fam.id)}
          >
            <span className="lessico-legend__spectrum-bars" aria-hidden="true">
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </span>
            <span className="lessico-legend__label">{fam.label.toUpperCase()}</span>
            <span className="lessico-legend__val">{pct}%</span>
          </button>
        )
      })}
    </nav>
  )
}

// ─── Mobile Accordion Card ──────────────────────────────────────────────────
function MobileAtlasCard({ fam, isExpanded, onToggle, onSelectWord, searchQuery }) {
  const meta = FAMILY_CONFIG[fam.id]
  const words = ATLAS_WORDS.filter((w) => w.familyId === fam.id)
  const norm = searchQuery.trim().toLowerCase()

  const subcurrents = []
  const seenSub = new Set()
  for (const w of words) {
    if (!seenSub.has(w.subcurrentId)) {
      seenSub.add(w.subcurrentId)
      subcurrents.push({
        id: w.subcurrentId,
        title: w.subcurrentTitle,
        words: words.filter((v) => v.subcurrentId === w.subcurrentId),
      })
    }
  }

  return (
    <div
      className={`lessico-mobile-card${isExpanded ? ' is-expanded' : ''}`}
      style={{ '--card-color': meta.baseColor }}
    >
      <button
        type="button"
        className="lessico-mobile-card__header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span
          className="lessico-mobile-card__dot"
          style={{ backgroundColor: meta.baseColor }}
          aria-hidden
        />
        <strong className="lessico-mobile-card__title">{meta.label}</strong>
        <span className="lessico-mobile-card__count">{words.length} parole</span>
        <span className="lessico-mobile-card__chevron" aria-hidden>
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>
      {isExpanded && (
        <div className="lessico-mobile-card__body">
          {subcurrents.map((sub) => {
            const visible = sub.words.filter(
              (w) => !norm || w.nome.toLowerCase().includes(norm),
            )
            if (visible.length === 0) return null
            return (
              <div key={sub.id} className="lessico-mobile-sub">
                <h4 className="lessico-mobile-sub__title" style={{ color: meta.baseColor }}>
                  {sub.title}
                </h4>
                <div className="lessico-mobile-sub__words">
                  {visible.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className="lessico-mobile-word"
                      style={{ '--word-color': w.color, fontSize: w.fontSize }}
                      onClick={() => onSelectWord(w)}
                    >
                      {w.nome}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Analisi Dashboard ───────────────────────────────────────────────────────
function AnalisiDashboard({ viewModel, onSelectWord }) {
  if (!viewModel) return null

  const {
    datiDisponibili,
    lessicoStabile = {},
    lessicoSituazionale = [],
    campoDiForze = {},
    contrastiLessicali = [],
    firmaPersonale = {},
    costellazioniSemantiche = [],
    _gap = [],
  } = viewModel
  const costellazioniAttive = costellazioniSemantiche.filter(
    (costellazione) => costellazione.correntiUtenteCollegate?.length > 0,
  )

  return (
    <div className="lessico-dashboard">
      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">1. Firma Personale</h3>
        {!datiDisponibili ? (
          <p className="lessico-dashboard__empty">Firma non disponibile (test non completato).</p>
        ) : (
          <div className="lessico-dashboard__firma">
            <div className="lessico-dashboard__code-wrap">
              <code className="lessico-dashboard__code">{firmaPersonale.codice}</code>
            </div>
            <ul className="lessico-dashboard__list text-xs opacity-90 mt-2 space-y-1">
              <li>
                • Natura Prevalente: <strong>{firmaPersonale.componenti.dominante}</strong>
              </li>
              {firmaPersonale.componenti.sottodisposizione && (
                <li>
                  • Sotto-disposizione: <strong>{firmaPersonale.componenti.sottodisposizione}</strong>
                </li>
              )}
              <li>
                • Top 3 Famiglie:{' '}
                <strong>{firmaPersonale.componenti.rankingFamiglie.slice(0, 3).join(' · ')}</strong>
              </li>
            </ul>
          </div>
        )}
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">2. Campo di Forze</h3>
        {!datiDisponibili ? (
          <p className="lessico-dashboard__empty">Campo di forze non disponibile.</p>
        ) : (
          <div className="lessico-dashboard__forze">
            <div className="lessico-dashboard__vettore-risultante">
              <span className="text-xs uppercase tracking-wider opacity-60">Vettore risultante</span>
              <div className="flex space-x-3 font-mono text-sm mt-1">
                <span>
                  X: <strong>{campoDiForze.risultante.x.toFixed(2)}</strong>
                </span>
                <span>
                  Y: <strong>{campoDiForze.risultante.y.toFixed(2)}</strong>
                </span>
                <span>
                  Z: <strong>{campoDiForze.risultante.z.toFixed(2)}</strong>
                </span>
              </div>
              <p className="text-xs opacity-75 mt-1">
                Magnitudine: <strong>{campoDiForze.magnitudineRisultante.toFixed(2)}</strong>
              </p>
            </div>
            {campoDiForze.polaritaDominante && (
              <p className="text-xs mt-2">
                Polarità Dominante:{' '}
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  {campoDiForze.polaritaDominante}
                </span>
              </p>
            )}
            <details className="lessico-dashboard__details mt-2">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Mostra vettori per famiglia
              </summary>
              <div className="space-y-1 mt-1 text-[11px] font-mono opacity-80 pl-2 border-l border-slate-700">
                {campoDiForze.perFamiglia.map((fam) => {
                  const m = FAMILY_CONFIG[ATLAS_FAMILY_ID_BY_KEY[fam.familyKey]]
                  return (
                    <div key={fam.familyKey} className="flex justify-between">
                      <span style={{ color: m?.baseColor }}>{fam.familyName}</span>
                      <span>
                        [{fam.vettore.x.toFixed(2)}, {fam.vettore.y.toFixed(2)},{' '}
                        {fam.vettore.z.toFixed(2)}]
                      </span>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        )}
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">3. Costellazioni Semantiche</h3>
        {costellazioniAttive.length === 0 ? (
          <p className="lessico-dashboard__empty">Nessuna costellazione semantica attiva.</p>
        ) : (
          <div className="space-y-3">
            {costellazioniAttive.map((c) => {
              const activeCount = c.correntiUtenteCollegate.length
              return (
                <div
                  key={c.conceptId}
                  className="p-2 rounded bg-slate-950/40 border border-slate-800/60"
                >
                  <div className="flex justify-between items-center">
                    <strong className="text-xs text-blue-300">{c.label}</strong>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {activeCount} {activeCount === 1 ? 'connessione' : 'connessioni'}
                    </span>
                  </div>
                  {c.correntiUtenteCollegate.length > 0 ? (
                    <div className="mt-1.5 space-y-1">
                      {c.correntiUtenteCollegate.map((s) => (
                        <div
                          key={s.rawKey}
                          className="flex justify-between items-center text-[10px] opacity-80"
                        >
                          <span>{s.nome}</span>
                          <span className="font-mono text-blue-400">{s.percentuale}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] opacity-50 mt-1 italic">
                      Nessuna corrente collegata attiva
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">4. Lessico Stabile e Situazionale</h3>
        <div className="space-y-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider opacity-60 block mb-1">
              Situazionale (dal test)
            </span>
            {!datiDisponibili || lessicoSituazionale.length === 0 ? (
              <p className="lessico-dashboard__empty">Nessuna parola emersa dal test.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {lessicoSituazionale.map((p) => {
                  const familyId = ATLAS_FAMILY_ID_BY_KEY[p.familyKey]
                  const match = ATLAS_WORDS.find(
                    (w) =>
                      w.nome.toLowerCase() === p.parola.toLowerCase() &&
                      w.familyId === familyId &&
                      w.subcurrentId === p.correnteKey,
                  )
                  const fColor = FAMILY_CONFIG[familyId]?.baseColor || '#fff'
                  return (
                    <button
                      key={`${p.parola}-${p.correnteKey}`}
                      type="button"
                      className="lessico-dashboard__pill lessico-dashboard__pill--situational"
                      style={{
                        borderColor: `${fColor}33`,
                        '--hover-border': fColor,
                      }}
                      onClick={() => match && onSelectWord(match)}
                      title={`Parola: ${p.parola}. Clicca per selezionare. (${p.count} risposte, file: ${p.fileKeys.join(', ')})`}
                    >
                      <span>{p.parola}</span>
                      <small className="ml-1 opacity-60 font-mono text-[9px]">{p.count}</small>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider opacity-60 block mb-1">
              Stabile (teorico di riferimento)
            </span>
            <details className="lessico-dashboard__details">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Mostra dizionario teorico
              </summary>
              <div className="space-y-2 mt-1.5">
                {VIEW_MODEL_FAMILIES.map(({ familyId, familyName }) => {
                  const stabile = lessicoStabile[familyName]
                  const meta = FAMILY_CONFIG[familyId]
                  const forms = stabile?.vocabolarioAggettivi || []
                  return (
                    <div key={familyId} className="text-[11px]">
                      <strong style={{ color: meta?.baseColor }}>{familyName}</strong>
                      <p className="opacity-80 mt-0.5 leading-relaxed">
                        {forms.slice(0, 10).join(', ')}...
                      </p>
                    </div>
                  )
                })}
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="lessico-dashboard__section">
        <h3 className="lessico-dashboard__title">5. Contrasti Lessicali</h3>
        {!datiDisponibili || contrastiLessicali.length === 0 ? (
          <p className="lessico-dashboard__empty">Contrasti lessicali non disponibili.</p>
        ) : (
          <div className="space-y-2">
            {contrastiLessicali.map((c, idx) => (
              <div
                key={idx}
                className={`p-2 rounded bg-slate-950/30 border ${
                  c.isContrastante
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-slate-800/40 opacity-80'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">
                    {c.coppia[0]} <span className="opacity-40">vs</span> {c.coppia[1]}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      c.isContrastante
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-slate-900 text-slate-500'
                    }`}
                  >
                    {c.isContrastante ? 'Attivo' : 'Silente'}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="opacity-60 block font-semibold">{c.coppia[0]}</span>
                    <span className="block italic opacity-95">
                      {c.paroleA.slice(0, 3).join(', ') || 'Nessuna'}
                    </span>
                    <span className="text-[9px] opacity-40 font-mono">
                      fonte: {c.fonteParoleA}
                    </span>
                  </div>
                  <div>
                    <span className="opacity-60 block font-semibold">{c.coppia[1]}</span>
                    <span className="block italic opacity-95">
                      {c.paroleB.slice(0, 3).join(', ') || 'Nessuna'}
                    </span>
                    <span className="text-[9px] opacity-40 font-mono">
                      fonte: {c.fonteParoleB}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {_gap && _gap.length > 0 && (
        <div className="lessico-dashboard__section lessico-dashboard__section--gap">
          <h3 className="lessico-dashboard__title opacity-50">Limiti dei dati & Gap</h3>
          <ul className="space-y-1 pl-3 list-disc text-[10px] opacity-60 leading-normal">
            {_gap.map((g, idx) => (
              <li key={idx}>{g}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Component: LessicoAtlasView ────────────────────────────────────────
export default function LessicoAtlasView({
  paroleEmerse = [],
  isMobile = false,
  viewModel = null,
}) {
  const uiSounds = useUiSounds()
  const [selectedWord, setSelectedWord] = useState(null)
  const [hoveredWordId, setHoveredWordId] = useState(null)
  const [hoveredWord, setHoveredWord] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [shockwave, setShockwave] = useState(null)
  const [shockwaveActiveIds, setShockwaveActiveIds] = useState(() => new Set())
  const [filterFamily, setFilterFamily] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [showSearch, setShowSearch] = useState(false)
  const [expandedMobileFamily, setExpandedMobileFamily] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const canvasRef = useRef(null)
  const layerRef = useRef(null)
  const starfieldRef = useRef(null)
  const nebulaeRef = useRef(null)
  const constellationLayerRef = useRef(null)
  const wordsLayerRef = useRef(null)
  const cameraRef = useRef(createCamera(0, 0, 0.5, 0, 0, 0, 0))
  const targetCameraRef = useRef(createCamera(0, 0, 0.5, 0, 0, 0, 0))
  const initialCameraRef = useRef(createCamera(0, 0, 0.5, 0, 0, 0, 0))
  const velocityRef = useRef({ vx: 0, vy: 0 })
  const flightRef = useRef(null)
  const viewportSizeRef = useRef({ w: 0, h: 0, left: 0, top: 0 })
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const mouseDragRef = useRef(null)
  const webkitGestureRef = useRef(null)
  const searchInputRef = useRef(null)
  const hoveredWordIdRef = useRef(null)
  const telemetryMagRef = useRef(null)
  const helmMagRef = useRef(null)
  const radarViewfinderRef = useRef(null)
  const radarCoordRef = useRef(null)
  const hoverTimerRef = useRef(null)
  const atlasRootRef = useRef(null)

  const currentLodTierRef = useRef('macro')
  const telemetryLodRef = useRef(null)

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    }
  }, [])

  const activeFamilyId = filterFamily || 'malinconica_nostalgica'

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const userPercentages = useMemo(() => {
    if (!viewModel?.datiDisponibili || !viewModel?.campoDiForze?.perFamiglia) {
      return null
    }
    const map = {}
    for (const item of viewModel.campoDiForze.perFamiglia) {
      if (item.familyKey && typeof item.peso === 'number') {
        map[item.familyKey] = Math.round(item.peso)
      }
    }
    return map
  }, [viewModel])

  const emergedWords = useMemo(() => {
    const precise = new Set()
    const fallback = new Set()
    for (const p of paroleEmerse || []) {
      const nome = typeof p === 'string' ? p : p?.parola || p?.nome || ''
      if (!nome) continue
      const normalizedName = nome.toLowerCase()
      const familyId = typeof p === 'string' ? '' : ATLAS_FAMILY_ID_BY_KEY[p?.familyKey]
      const correnteKey = typeof p === 'string' ? '' : p?.correnteKey
      if (familyId && correnteKey) {
        precise.add(`${familyId}|${correnteKey}|${normalizedName}`)
      } else {
        fallback.add(normalizedName)
      }
    }
    return { precise, fallback }
  }, [paroleEmerse])

  const emergedWordIds = useMemo(() => {
    const ids = new Set()
    for (const w of CONSTELLATION_DATA.words) {
      const normalizedName = w.nome.toLowerCase()
      if (
        emergedWords.precise.has(`${w.familyId}|${w.subcurrentId}|${normalizedName}`) ||
        emergedWords.fallback.has(normalizedName)
      ) {
        ids.add(w.id)
      }
    }
    return ids
  }, [emergedWords])

  const activeCoreHubIds = useMemo(() => {
    const hubs = new Set()
    for (const w of CONSTELLATION_DATA.words) {
      if (emergedWordIds.has(w.id)) {
        hubs.add(w.subcurrentId)
      }
    }
    return hubs
  }, [emergedWordIds])

  const searchSuggestions = useMemo(() => {
    if (!normalizedSearch) return []
    const q = normalizedSearch
    const matches = CONSTELLATION_DATA.words.filter((w) =>
      w.nome.toLowerCase().includes(q),
    )
    return matches.sort((a, b) => {
      const aExact = a.nome.toLowerCase() === q
      const bExact = b.nome.toLowerCase() === q
      if (aExact && !bExact) return -1
      if (!aExact && bExact) return 1
      const aStarts = a.nome.toLowerCase().startsWith(q)
      const bStarts = b.nome.toLowerCase().startsWith(q)
      if (aStarts && !bStarts) return -1
      if (!aStarts && bStarts) return 1
      const aEmerged = emergedWordIds.has(a.id)
      const bEmerged = emergedWordIds.has(b.id)
      if (aEmerged && !bEmerged) return -1
      if (!aEmerged && bEmerged) return 1
      return a.nome.localeCompare(b.nome)
    }).slice(0, 8)
  }, [normalizedSearch, emergedWordIds])

  const resetCamera = useCallback(() => {
    const initial = initialCameraRef.current
    velocityRef.current = { vx: 0, vy: 0 }
    flightRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 600,
      startCamera: { ...cameraRef.current },
      endCamera: {
        ...initial,
        pitch: 0,
        yaw: 0,
        roll: 0,
        z: 0,
      },
    }
  }, [])

  // Smoothly center on word target with automatic magnification to 1.27x
  const focusWord = useCallback((word) => {
    if (!word) return
    const vp = layerRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    const targetScale = clamp(rect.width < 900 ? 1.22 : 1.27, 1.2, 1.45)

    const targetX = rect.width / 2 - WORLD_WIDTH / 2 - (word.x - WORLD_WIDTH / 2) * targetScale
    const targetY = rect.height / 2 - WORLD_HEIGHT / 2 - (word.y - WORLD_HEIGHT / 2) * targetScale

    velocityRef.current = { vx: 0, vy: 0 }
    flightRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 650,
      startCamera: { ...cameraRef.current },
      endCamera: {
        x: targetX,
        y: targetY,
        z: 0,
        scale: targetScale,
        pitch: 0,
        yaw: 0,
        roll: 0,
      },
    }
  }, [])

  // Smoothly fly camera to world coordinates (e.g. from Radar click)
  const flyToWorldCoord = useCallback((worldX, worldY) => {
    const vp = layerRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    const targetScale = clamp(cameraRef.current.scale, 0.5, 1.4)
    const targetX = rect.width / 2 - WORLD_WIDTH / 2 - (worldX - WORLD_WIDTH / 2) * targetScale
    const targetY = rect.height / 2 - WORLD_HEIGHT / 2 - (worldY - WORLD_HEIGHT / 2) * targetScale

    velocityRef.current = { vx: 0, vy: 0 }
    flightRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 650,
      startCamera: { ...cameraRef.current },
      endCamera: {
        x: targetX,
        y: targetY,
        z: 0,
        scale: targetScale,
        pitch: 0,
        yaw: 0,
        roll: 0,
      },
    }
  }, [])

  const handleSelectWord = useCallback(
    (word) => {
      if (!word) return
      setSelectedWord(word)
      focusWord(word)

      // 1. Shockwave ring centered on word
      setShockwave({
        id: Date.now(),
        x: word.x,
        y: word.y,
        color: word.color,
      })

      // 2. Temporarily illuminate nearby words within 220px
      const nearbyIds = new Set()
      const shockwaveRadius = 220
      for (let i = 0; i < CONSTELLATION_DATA.words.length; i++) {
        const w = CONSTELLATION_DATA.words[i]
        const dx = w.x - word.x
        const dy = w.y - word.y
        if (Math.hypot(dx, dy) <= shockwaveRadius) {
          nearbyIds.add(w.id)
        }
      }
      setShockwaveActiveIds(nearbyIds)

      setTimeout(() => {
        setShockwave(null)
        setShockwaveActiveIds(new Set())
      }, 450)

      // 3. Audio harmonic chime
      playHarmonicChime(word.subcurrentInterval, word.familyId, uiSounds.enabled)
    },
    [focusWord, uiSounds.enabled],
  )

  // Intelligent search: auto fly-to matching word
  useEffect(() => {
    if (!normalizedSearch || normalizedSearch.length < 2) return
    const timer = setTimeout(() => {
      const matched = CONSTELLATION_DATA.words.find((w) =>
        w.nome.toLowerCase().includes(normalizedSearch),
      )
      if (matched) {
        setSelectedWord(matched)
        focusWord(matched)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [normalizedSearch, focusWord])

  // Smoothly glide camera to frame a specific family sphere without 3D wobble
  const focusFamily = useCallback(
    (familyId) => {
      const vp = layerRef.current
      if (!vp) return
      const rect = vp.getBoundingClientRect()
      const fam = FAMILY_CONFIG[familyId]
      if (!fam) {
        resetCamera()
        return
      }

      const padding = 1.35
      const targetScale = clamp(
        Math.min(rect.width / (fam.radius * 2 * padding), rect.height / (fam.radius * 2 * padding)),
        1.1,
        1.55,
      )

      const targetX = rect.width / 2 - WORLD_WIDTH / 2 - (fam.x - WORLD_WIDTH / 2) * targetScale
      const targetY = rect.height / 2 - WORLD_HEIGHT / 2 - (fam.y - WORLD_HEIGHT / 2) * targetScale

      velocityRef.current = { vx: 0, vy: 0 }
      flightRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 600,
        startCamera: { ...cameraRef.current },
        endCamera: {
          x: targetX,
          y: targetY,
          z: 0,
          scale: targetScale,
          pitch: 0,
          yaw: 0,
          roll: 0,
        },
      }
    },
    [resetCamera],
  )

  const zoomStep = useCallback(
    (direction) => {
      const vp = layerRef.current
      if (!vp) return
      const rect = vp.getBoundingClientRect()
      const origin = { x: rect.width / 2, y: rect.height / 2 }
      const factor = direction > 0 ? CAMERA_ZOOM_STEP : 1 / CAMERA_ZOOM_STEP

      const current = targetCameraRef.current
      const clampedScale = clamp(current.scale * factor, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
      const ratio = clampedScale / current.scale
      const newX = origin.x - WORLD_WIDTH / 2 - (origin.x - WORLD_WIDTH / 2 - current.x) * ratio
      const newY = origin.y - WORLD_HEIGHT / 2 - (origin.y - WORLD_HEIGHT / 2 - current.y) * ratio

      flightRef.current = null
      targetCameraRef.current = {
        ...current,
        x: newX,
        y: newY,
        scale: clampedScale,
      }
    },
    [],
  )

  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = useCallback(() => {
    const el =
      atlasRootRef.current ||
      layerRef.current?.closest('.lessico-atlas') ||
      document.documentElement
    const fsDoc = document
    const fsEl =
      fsDoc.fullscreenElement ||
      fsDoc.webkitFullscreenElement ||
      fsDoc.mozFullScreenElement ||
      fsDoc.msFullscreenElement

    if (!fsEl && !isFullscreen) {
      const req =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen ||
        fsDoc.documentElement.requestFullscreen ||
        fsDoc.documentElement.webkitRequestFullscreen
      if (req) {
        try {
          const res = req.call(el)
          if (res && res.catch) {
            res.catch(() => {
              setIsFullscreen(true)
            })
          }
        } catch {
          setIsFullscreen(true)
        }
      } else {
        setIsFullscreen(true)
      }
    } else {
      const exit =
        fsDoc.exitFullscreen ||
        fsDoc.webkitExitFullscreen ||
        fsDoc.mozCancelFullScreen ||
        fsDoc.msExitFullscreen
      if (exit) {
        try {
          const res = exit.call(fsDoc)
          if (res && res.catch) {
            res.catch(() => {})
          }
        } catch {
          /* ignore exit error */
        }
      }
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      setIsFullscreen(Boolean(fsEl))
    }
    document.addEventListener('fullscreenchange', onFsChange)
    document.addEventListener('webkitfullscreenchange', onFsChange)
    document.addEventListener('mozfullscreenchange', onFsChange)
    document.addEventListener('MSFullscreenChange', onFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange)
      document.removeEventListener('webkitfullscreenchange', onFsChange)
      document.removeEventListener('mozfullscreenchange', onFsChange)
      document.removeEventListener('MSFullscreenChange', onFsChange)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        const fsDoc = document
        const fsEl =
          fsDoc.fullscreenElement ||
          fsDoc.webkitFullscreenElement ||
          fsDoc.mozFullScreenElement ||
          fsDoc.msFullscreenElement
        if (fsEl) {
          const exit =
            fsDoc.exitFullscreen ||
            fsDoc.webkitExitFullscreen ||
            fsDoc.mozCancelFullScreen ||
            fsDoc.msExitFullscreen
          try {
            exit?.call(fsDoc)
          } catch {
            /* ignore exit error */
          }
        }
        setIsFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  const panBy = useCallback((dx, dy) => {
    flightRef.current = null
    velocityRef.current = { vx: 0, vy: 0 }
    mouseDragRef.current = null
    const cur = targetCameraRef.current
    targetCameraRef.current = {
      ...cur,
      x: cur.x + dx,
      y: cur.y + dy,
    }
  }, [])

  const handleFilterChange = useCallback(
    (famId) => {
      setFilterFamily(famId)
      if (famId) {
        focusFamily(famId)
      } else {
        resetCamera()
      }
    },
    [focusFamily, resetCamera],
  )

  // Initial viewport fit & camera initialization
  useLayoutEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const updateFit = () => {
      const rect = layer.getBoundingClientRect()
      viewportSizeRef.current = {
        w: rect.width || 1,
        h: rect.height || 1,
        left: rect.left,
        top: rect.top,
      }

      if (rect.width > 0 && rect.height > 0) {
        const fitScale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT) * 0.94
        const initX = rect.width / 2 - WORLD_WIDTH / 2
        const initY = rect.height / 2 - WORLD_HEIGHT / 2
        const initial = createCamera(initX, initY, fitScale, 0, 0, 0, 0)
        initialCameraRef.current = initial
        targetCameraRef.current = initial
        const initialTier =
          fitScale < 0.48 ? 'macro' : fitScale < 0.85 ? 'meso-wide' : fitScale < 1.40 ? 'meso' : 'micro'
        currentLodTierRef.current = initialTier

        if (canvasRef.current) {
          canvasRef.current.style.transform = `translate3d(${initX.toFixed(2)}px, ${initY.toFixed(2)}px, 0px) scale(${fitScale.toFixed(4)})`
        }
      }
    }

    updateFit()
    const observer = new ResizeObserver(updateFit)
    observer.observe(layer)
    return () => observer.disconnect()
  }, [isMobile])

  // Wheel zoom and pan
  const handleWheel = useCallback(
    (event) => {
      const target = event.target instanceof Element ? event.target : null
      if (target?.closest('.lessico-dict, .lessico-holo-slate')) return

      event.preventDefault()
      const vp = layerRef.current
      if (!vp) return

      const { left, top } = viewportSizeRef.current
      const origin = { x: event.clientX - left, y: event.clientY - top }
      const isPinch = event.ctrlKey || event.metaKey

      flightRef.current = null

      if (isPinch) {
        // Trackpad pinch zoom (fast, responsive 0.024 intensity)
        const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_INTENSITY)
        const current = targetCameraRef.current
        const clampedScale = clamp(current.scale * factor, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
        const ratio = clampedScale / current.scale
        const newX = origin.x - WORLD_WIDTH / 2 - (origin.x - WORLD_WIDTH / 2 - current.x) * ratio
        const newY = origin.y - WORLD_HEIGHT / 2 - (origin.y - WORLD_HEIGHT / 2 - current.y) * ratio

        targetCameraRef.current = {
          ...current,
          x: newX,
          y: newY,
          scale: clampedScale,
        }
        cameraRef.current.x = newX
        cameraRef.current.y = newY
        cameraRef.current.scale = clampedScale
      } else {
        // If deltaX is 0 and deltaY has large discrete steps, user is using a traditional mouse scroll wheel to zoom
        const isMouseWheel = Math.abs(event.deltaY) >= 40 && event.deltaX === 0
        if (isMouseWheel) {
          const factor = event.deltaY < 0 ? 1.28 : 0.78
          const current = targetCameraRef.current
          const clampedScale = clamp(current.scale * factor, CAMERA_MIN_SCALE, CAMERA_MAX_SCALE)
          const ratio = clampedScale / current.scale
          const newX = origin.x - WORLD_WIDTH / 2 - (origin.x - WORLD_WIDTH / 2 - current.x) * ratio
          const newY = origin.y - WORLD_HEIGHT / 2 - (origin.y - WORLD_HEIGHT / 2 - current.y) * ratio

          targetCameraRef.current = {
            ...current,
            x: newX,
            y: newY,
            scale: clampedScale,
          }
        } else {
          // Trackpad 2-finger pan - responsive 1.35x speed
          event.stopPropagation()
          const current = targetCameraRef.current
          const nextX = current.x - event.deltaX * 1.35
          const nextY = current.y - event.deltaY * 1.35
          targetCameraRef.current = {
            ...current,
            x: nextX,
            y: nextY,
          }
          cameraRef.current.x = nextX
          cameraRef.current.y = nextY
        }
      }
    },
    [],
  )

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined
    layer.addEventListener('wheel', handleWheel, { passive: false })
    return () => layer.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // WebKit Safari Gesture
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return undefined

    const onGestureStart = (e) => {
      e.preventDefault()
      flightRef.current = null
      const rect = layer.getBoundingClientRect()
      webkitGestureRef.current = {
        camera: { ...targetCameraRef.current },
        origin: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      }
    }
    const onGestureChange = (e) => {
      e.preventDefault()
      const gesture = webkitGestureRef.current
      if (!gesture) return
      const nextScale = clamp(
        gesture.camera.scale * Math.pow(Number(e.scale) || 1, PINCH_DAMPING),
        CAMERA_MIN_SCALE,
        CAMERA_MAX_SCALE,
      )
      const ratio = nextScale / gesture.camera.scale
      const origin = gesture.origin
      const newX = origin.x - WORLD_WIDTH / 2 - (origin.x - WORLD_WIDTH / 2 - gesture.camera.x) * ratio
      const newY = origin.y - WORLD_HEIGHT / 2 - (origin.y - WORLD_HEIGHT / 2 - gesture.camera.y) * ratio
      targetCameraRef.current = {
        ...targetCameraRef.current,
        x: newX,
        y: newY,
        scale: nextScale,
      }
      cameraRef.current.x = newX
      cameraRef.current.y = newY
      cameraRef.current.scale = nextScale
    }
    const onGestureEnd = () => {
      webkitGestureRef.current = null
    }

    layer.addEventListener('gesturestart', onGestureStart, { passive: false })
    layer.addEventListener('gesturechange', onGestureChange, { passive: false })
    layer.addEventListener('gestureend', onGestureEnd)
    return () => {
      layer.removeEventListener('gesturestart', onGestureStart)
      layer.removeEventListener('gesturechange', onGestureChange)
      layer.removeEventListener('gestureend', onGestureEnd)
    }
  }, [])

  // Mouse / Pointer drag pan
  const handlePointerDown = useCallback((e) => {
    const target = e.target instanceof Element ? e.target : null
    if (
      target?.closest(
        '.lessico-tactical-helm, .lessico-radar, .lessico-dict, .lessico-holo-slate, .lessico-atlas__controls',
      )
    ) {
      return
    }

    pointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointersRef.current.size >= 2) {
      flightRef.current = null
      velocityRef.current = { vx: 0, vy: 0 }
      const pts = Array.from(pointersRef.current.values())
      const [a, b] = pts
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const mx = (a.clientX + b.clientX) / 2
      const my = (a.clientY + b.clientY) / 2
      const vp = layerRef.current
      const rect = vp?.getBoundingClientRect() || { left: 0, top: 0 }
      pinchRef.current = {
        camera: { ...targetCameraRef.current },
        distance: dist,
        midpoint: { x: mx - rect.left, y: my - rect.top },
      }
      mouseDragRef.current = null
      return
    }

    const isInteractive = Boolean(target?.closest('.lessico-atlas__word, .lessico-atlas__family-badge'))
    if (!isInteractive) {
      flightRef.current = null
      velocityRef.current = { vx: 0, vy: 0 }
      mouseDragRef.current = {
        startX: targetCameraRef.current.x,
        startY: targetCameraRef.current.y,
        clientX: e.clientX,
        clientY: e.clientY,
        lastClientX: e.clientX,
        lastClientY: e.clientY,
        lastTime: performance.now(),
      }
      if (e.currentTarget.setPointerCapture) {
        e.currentTarget.setPointerCapture(e.pointerId)
      }
    }
  }, [])

  const handlePointerMove = useCallback((e) => {
    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      e.preventDefault()
      const pts = Array.from(pointersRef.current.values())
      const [a, b] = pts
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const gesture = pinchRef.current
      const nextScale = clamp(
        gesture.camera.scale * Math.pow(dist / Math.max(1, gesture.distance), PINCH_DAMPING),
        CAMERA_MIN_SCALE,
        CAMERA_MAX_SCALE,
      )
      const ratio = nextScale / gesture.camera.scale
      const origin = gesture.midpoint
      const newX = origin.x - WORLD_WIDTH / 2 - (origin.x - WORLD_WIDTH / 2 - gesture.camera.x) * ratio
      const newY = origin.y - WORLD_HEIGHT / 2 - (origin.y - WORLD_HEIGHT / 2 - gesture.camera.y) * ratio

      targetCameraRef.current = {
        ...targetCameraRef.current,
        x: newX,
        y: newY,
        scale: nextScale,
      }
      return
    }

    if (pointersRef.current.size === 1 && mouseDragRef.current) {
      e.preventDefault()
      const drag = mouseDragRef.current
      const now = performance.now()
      const dt = Math.max(1, now - drag.lastTime)

      const instVx = (e.clientX - drag.lastClientX) / (dt / 16.67)
      const instVy = (e.clientY - drag.lastClientY) / (dt / 16.67)
      velocityRef.current.vx = velocityRef.current.vx * 0.4 + instVx * 0.6
      velocityRef.current.vy = velocityRef.current.vy * 0.4 + instVy * 0.6

      drag.lastClientX = e.clientX
      drag.lastClientY = e.clientY
      drag.lastTime = now

      targetCameraRef.current = {
        ...targetCameraRef.current,
        x: drag.startX + (e.clientX - drag.clientX),
        y: drag.startY + (e.clientY - drag.clientY),
      }
      cameraRef.current.x = targetCameraRef.current.x
      cameraRef.current.y = targetCameraRef.current.y
    }
  }, [])

  const endPointer = useCallback((e) => {
    pointersRef.current.delete(e.pointerId)
    pinchRef.current = null
    if (mouseDragRef.current) {
      velocityRef.current.vx = clamp(velocityRef.current.vx, -45, 45)
      velocityRef.current.vy = clamp(velocityRef.current.vy, -45, 45)
      mouseDragRef.current = null
    }
    if (e.currentTarget.releasePointerCapture && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    // Clean exit
  }, [])

  const closeDictionary = useCallback(() => {
    setSelectedWord(null)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Escape') {
        if (selectedWord) {
          closeDictionary()
          return
        }
        if (showSearch) {
          setShowSearch(false)
          setSearchQuery('')
          return
        }
        resetCamera()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomStep(1)
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomStep(-1)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        panBy(0, 260)
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        panBy(0, -260)
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        panBy(260, 0)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        panBy(-260, 0)
        return
      }
      if (e.key === '0') {
        e.preventDefault()
        resetCamera()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedWord, showSearch, resetCamera, zoomStep, closeDictionary, panBy])

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus()
  }, [showSearch])


  const handleSearchToggle = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) setSearchQuery('')
      return !prev
    })
  }, [])

  // ─── Butter-Smooth 60/120 FPS Camera & LOD Interpolation Loop ─────────────
  useEffect(() => {
    if (isMobile) return undefined

    let rafId = null

    const tick = () => {
      // 1. Flight Dynamics (Smooth glide to target word or family)
      if (flightRef.current?.active) {
        const flight = flightRef.current
        const elapsed = performance.now() - flight.startTime
        const rawT = Math.min(1, elapsed / flight.duration)
        const easedT = flyEasing(rawT)

        targetCameraRef.current.x =
          flight.startCamera.x + (flight.endCamera.x - flight.startCamera.x) * easedT
        targetCameraRef.current.y =
          flight.startCamera.y + (flight.endCamera.y - flight.startCamera.y) * easedT
        targetCameraRef.current.scale =
          flight.startCamera.scale +
          (flight.endCamera.scale - flight.startCamera.scale) * easedT

        if (rawT >= 1) {
          flight.active = false
        }
      } else if (!mouseDragRef.current) {
        // Friction momentum decay on drag release
        const vel = velocityRef.current
        if (Math.hypot(vel.vx, vel.vy) > 0.05) {
          targetCameraRef.current.x += vel.vx
          targetCameraRef.current.y += vel.vy
          vel.vx *= 0.90
          vel.vy *= 0.90
        } else {
          vel.vx = 0
          vel.vy = 0
        }
      }

      // 2. Camera Lerp Damping
      const cur = cameraRef.current
      const tgt = targetCameraRef.current
      if (mouseDragRef.current) {
        cur.x = tgt.x
        cur.y = tgt.y
      } else {
        if (Math.abs(tgt.x - cur.x) < 0.05) cur.x = tgt.x
        else cur.x += (tgt.x - cur.x) * LERP_FACTOR
        if (Math.abs(tgt.y - cur.y) < 0.05) cur.y = tgt.y
        else cur.y += (tgt.y - cur.y) * LERP_FACTOR
      }
      if (Math.abs(tgt.scale - cur.scale) < 0.0005) cur.scale = tgt.scale
      else cur.scale += (tgt.scale - cur.scale) * LERP_FACTOR

      // 3. Transform Canvas
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0px) scale(${cur.scale.toFixed(4)})`
      }

      // 4. Parallax Layers (deep starfield and nebulae)
      if (starfieldRef.current) {
        const sX = -cur.x * 0.06
        const sY = -cur.y * 0.06
        starfieldRef.current.style.transform = `translate3d(${sX.toFixed(2)}px, ${sY.toFixed(2)}px, 0px) scale(1.2)`
      }
      if (nebulaeRef.current) {
        const nX = -cur.x * 0.14
        const nY = -cur.y * 0.14
        nebulaeRef.current.style.transform = `translate3d(${nX.toFixed(2)}px, ${nY.toFixed(2)}px, 0px) scale(1.12)`
      }

      // 5. Semantic LOD Tier Update (instant DOM class swap - zero React re-render overhead)
      const newTier =
        cur.scale < 0.48 ? 'macro' : cur.scale < 0.85 ? 'meso-wide' : cur.scale < 1.40 ? 'meso' : 'micro'
      if (newTier !== currentLodTierRef.current) {
        currentLodTierRef.current = newTier
        if (atlasRootRef.current) {
          atlasRootRef.current.dataset.lodTier = newTier
          atlasRootRef.current.classList.remove(
            'lessico-atlas--lod-macro',
            'lessico-atlas--lod-meso-wide',
            'lessico-atlas--lod-meso',
            'lessico-atlas--lod-micro',
          )
          atlasRootRef.current.classList.add(`lessico-atlas--lod-${newTier}`)
        }
        if (telemetryLodRef.current) {
          telemetryLodRef.current.textContent = newTier.toUpperCase()
        }
      }

      // 6. Direct DOM update for Optics Telemetry (zero React re-render overhead)
      if (telemetryMagRef.current) {
        telemetryMagRef.current.textContent = cur.scale.toFixed(2)
      }
      if (helmMagRef.current) {
        helmMagRef.current.textContent = cur.scale.toFixed(2)
      }

      // 7. Tactical Radar Viewfinder Update (Zero React re-render overhead)
      if (radarViewfinderRef.current && viewportSizeRef.current.w > 0) {
        const vpW = viewportSizeRef.current.w
        const vpH = viewportSizeRef.current.h
        const scale = cur.scale
        const wx1 = 1700 - (1700 + cur.x) / scale
        const wy1 = 1200 - (1200 + cur.y) / scale
        const worldW = vpW / scale
        const worldH = vpH / scale

        const rx = clamp(wx1 * (160 / WORLD_WIDTH), 0, 160)
        const ry = clamp(wy1 * (113 / WORLD_HEIGHT), 0, 113)
        const rw = clamp(worldW * (160 / WORLD_WIDTH), 12, 160 - rx)
        const rh = clamp(worldH * (113 / WORLD_HEIGHT), 10, 113 - ry)

        radarViewfinderRef.current.style.left = `${rx.toFixed(1)}px`
        radarViewfinderRef.current.style.top = `${ry.toFixed(1)}px`
        radarViewfinderRef.current.style.width = `${rw.toFixed(1)}px`
        radarViewfinderRef.current.style.height = `${rh.toFixed(1)}px`
      }
      if (radarCoordRef.current) {
        const centerWx = Math.round(1700 - cur.x / cur.scale)
        const centerWy = Math.round(1200 - cur.y / cur.scale)
        radarCoordRef.current.textContent = `${centerWx},${centerWy}`
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  const handleRadarClick = useCallback(
    (e) => {
      e.stopPropagation()
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = clamp(e.clientX - rect.left, 0, 160)
      const clickY = clamp(e.clientY - rect.top, 0, 113)
      const targetWorldX = (clickX / 160) * WORLD_WIDTH
      const targetWorldY = (clickY / 113) * WORLD_HEIGHT
      flyToWorldCoord(targetWorldX, targetWorldY)
    },
    [flyToWorldCoord],
  )

  const activeFamConfig = FAMILY_CONFIG[activeFamilyId] || FAMILY_CONFIG.malinconica_nostalgica
  const telemetrySectorName = activeFamConfig.label.toUpperCase()
  const telemetrySectorCompass = (activeFamConfig.compass || '').split('·')[0].trim().toUpperCase()
  const telemetryFreq =
    activeFamilyId === 'entusiasmo' || activeFamilyId === 'collerico_volitiva' ? 528 : 432

  return (
    <div
      ref={atlasRootRef}
      className={`lessico-atlas${isMobile ? ' lessico-atlas--mobile' : ''} lessico-atlas--lod-macro${isFullscreen ? ' is-fullscreen' : ''}`}
      data-lod-tier="macro"
    >
      {/* ── Top Bar Controls: Tactical HUD Glassmorphism ─────────────────── */}
      <div className="lessico-atlas__controls lessico-atlas__controls--tactical">
        <AtlasLegend
          filterFamily={filterFamily}
          onFilterChange={handleFilterChange}
          viewModel={viewModel}
        />

        {/* Search & Dashboard toggle */}
        <div
          className="lessico-atlas__search-wrap"
          style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {viewModel && !isMobile && (
            <button
              type="button"
              className="lessico-atlas__search-btn"
              style={{
                width: 'auto',
                padding: '0 12px',
                fontSize: '0.75rem',
                borderRadius: '9999px',
                whiteSpace: 'nowrap',
                height: '32px',
                backgroundColor: showDashboard ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                borderColor: showDashboard ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                color: showDashboard ? '#60a5fa' : '#cbd5e1',
                borderWidth: '1px',
              }}
              onClick={() => setShowDashboard((prev) => !prev)}
              aria-label={showDashboard ? 'Nascondi analisi avanzata' : 'Mostra analisi avanzata'}
              aria-pressed={showDashboard ? 'true' : 'false'}
            >
              {showDashboard ? 'Nascondi analisi avanzata' : 'Analisi avanzata'}
            </button>
          )}
          {showSearch && (
            <>
              <input
                ref={searchInputRef}
                type="search"
                className="lessico-atlas__search-input"
                placeholder="Cerca una parola…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setActiveSuggestionIndex(-1)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActiveSuggestionIndex((prev) =>
                      Math.min(prev + 1, searchSuggestions.length - 1),
                    )
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActiveSuggestionIndex((prev) => Math.max(prev - 1, -1))
                  } else if (e.key === 'Enter') {
                    e.preventDefault()
                    const targetWord =
                      activeSuggestionIndex >= 0 && searchSuggestions[activeSuggestionIndex]
                        ? searchSuggestions[activeSuggestionIndex]
                        : searchSuggestions.length > 0
                        ? searchSuggestions[0]
                        : CONSTELLATION_DATA.words.find((w) =>
                            w.nome.toLowerCase().includes(normalizedSearch),
                          )
                    if (targetWord) {
                      setSearchQuery('')
                      setShowSearch(false)
                      handleSelectWord(targetWord)
                    }
                  } else if (e.key === 'Escape') {
                    setShowSearch(false)
                    setSearchQuery('')
                  }
                }}
                aria-label="Cerca nel lessico emotivo"
                aria-autocomplete="list"
                aria-controls="lessico-autocomplete-list"
              />
              {searchSuggestions.length > 0 && (
                <ul
                  id="lessico-autocomplete-list"
                  className="lessico-atlas__autocomplete"
                  role="listbox"
                >
                  {searchSuggestions.map((sug, idx) => {
                    const isSugSelected = idx === activeSuggestionIndex
                    const isSugEmerged = emergedWordIds.has(sug.id)
                    return (
                      <li key={sug.id} role="option" aria-selected={isSugSelected}>
                        <button
                          type="button"
                          className={`lessico-atlas__autocomplete-item${isSugSelected ? ' is-selected' : ''}`}
                          style={{ '--item-color': sug.color || sug.familyColor }}
                          onClick={() => {
                            setSearchQuery('')
                            setShowSearch(false)
                            handleSelectWord(sug)
                          }}
                          onMouseEnter={() => setActiveSuggestionIndex(idx)}
                        >
                          <span className="lessico-atlas__autocomplete-item-left">
                            <span
                              className="lessico-atlas__autocomplete-dot"
                              style={{ backgroundColor: sug.color || sug.familyColor }}
                            />
                            <span className="lessico-atlas__autocomplete-name">{sug.nome}</span>
                            <span className="lessico-atlas__autocomplete-family">{sug.familyLabel}</span>
                          </span>
                          {isSugEmerged && (
                            <span className="lessico-atlas__autocomplete-tag">Emersa</span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </>
          )}
          <button
            type="button"
            className={`lessico-atlas__search-btn${showSearch ? ' is-active' : ''}`}
            onClick={handleSearchToggle}
            aria-label={showSearch ? 'Chiudi ricerca' : 'Cerca una parola'}
          >
            {showSearch ? '✕' : '⌕'}
          </button>
        </div>
      </div>

      {!isMobile ? (
        /* ── Desktop: 120 FPS GPU Accelerated Constellation Network ──────── */
        <div
          ref={layerRef}
          className="lessico-atlas__layer"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onLostPointerCapture={endPointer}
          onPointerLeave={handlePointerLeave}
          aria-label="Galassia degli stati d'animo"
        >
          {/* ── Floating Tactical Flight Helm (GTA VI / Cyber-Astronomy) ──── */}
          <div
            className={`lessico-tactical-helm${selectedWord ? ' is-shifted' : ''}`}
            role="toolbar"
            aria-label="Tactical Navigation Helm"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="lessico-tactical-helm__head">
              <span className="lessico-tactical-helm__tag">
                <span className="lessico-tactical-helm__status-dot" aria-hidden="true" />
                NAV // ORBIT
              </span>
              <span className="lessico-tactical-helm__mag">
                MAG: <span ref={helmMagRef}>0.50</span>x
              </span>
            </div>

            {/* Compass Flight Disc */}
            <div className="lessico-tactical-helm__compass" role="group" aria-label="Orbital Compass">
              <button
                type="button"
                className="lessico-tactical-helm__btn lessico-tactical-helm__btn--n"
                title="Pan Nord (▲)"
                aria-label="Pan Nord"
                onClick={(e) => {
                  e.stopPropagation()
                  panBy(0, 260)
                }}
              >
                ▲
              </button>
              <button
                type="button"
                className="lessico-tactical-helm__btn lessico-tactical-helm__btn--w"
                title="Pan Ovest (◄)"
                aria-label="Pan Ovest"
                onClick={(e) => {
                  e.stopPropagation()
                  panBy(260, 0)
                }}
              >
                ◄
              </button>
              <button
                type="button"
                className="lessico-tactical-helm__btn lessico-tactical-helm__btn--center"
                title="Target Lock / Centra Galassia"
                aria-label="Centra visuale"
                onClick={(e) => {
                  e.stopPropagation()
                  resetCamera()
                }}
              >
                ⊕
              </button>
              <button
                type="button"
                className="lessico-tactical-helm__btn lessico-tactical-helm__btn--e"
                title="Pan Est (►)"
                aria-label="Pan Est"
                onClick={(e) => {
                  e.stopPropagation()
                  panBy(-260, 0)
                }}
              >
                ►
              </button>
              <button
                type="button"
                className="lessico-tactical-helm__btn lessico-tactical-helm__btn--s"
                title="Pan Sud (▼)"
                aria-label="Pan Sud"
                onClick={(e) => {
                  e.stopPropagation()
                  panBy(0, -260)
                }}
              >
                ▼
              </button>
            </div>

            {/* Zoom Deck */}
            <div className="lessico-tactical-helm__zoom-deck">
              <button
                type="button"
                className="lessico-tactical-helm__zoom-btn"
                title="Zoom indietro (−)"
                aria-label="Zoom indietro"
                onClick={(e) => {
                  e.stopPropagation()
                  zoomStep(-1)
                }}
              >
                −
              </button>
              <span className="lessico-tactical-helm__zoom-label">ZOOM</span>
              <button
                type="button"
                className="lessico-tactical-helm__zoom-btn"
                title="Zoom avanti (+)"
                aria-label="Zoom avanti"
                onClick={(e) => {
                  e.stopPropagation()
                  zoomStep(1)
                }}
              >
                +
              </button>
            </div>

            {/* Actions Row */}
            <div className="lessico-tactical-helm__actions">
              <button
                type="button"
                className="lessico-tactical-helm__action-btn"
                title="Centra la visuale"
                aria-label="Centra galassia"
                onClick={(e) => {
                  e.stopPropagation()
                  resetCamera()
                }}
              >
                ⌖ Centra
              </button>
              <button
                type="button"
                className={`lessico-tactical-helm__action-btn${isFullscreen ? ' is-active' : ''}`}
                title={isFullscreen ? 'Esci da schermo intero (Esc)' : 'Schermo intero (⛶)'}
                aria-label={isFullscreen ? 'Esci da schermo intero' : 'Schermo intero'}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
              >
                {isFullscreen ? '✕ Esci' : '⛶ Full'}
              </button>
            </div>
          </div>

          {/* ── 4-Corner Holographic Telemetry Overlay ─────────────────────── */}
          <div className="lessico-hud-telemetry" aria-hidden="true">
            <div className="lessico-telemetry lessico-telemetry--tl">
              <span className="lessico-telemetry__tag">SYS // COORD</span>
              <span className="lessico-telemetry__val">RA 18h 42m | DEC +26° 14' | EPOCH 2026.4</span>
            </div>
            <div className="lessico-telemetry lessico-telemetry--tr">
              <span className="lessico-telemetry__tag">SECTOR // ROUTE</span>
              <span className="lessico-telemetry__val">
                <span className="lessico-telemetry__breadcrumb">
                  <span>ROTTA: [{telemetrySectorName} · {telemetrySectorCompass}]</span>
                  {(selectedWord || hoveredWord) && (
                    <span className="lessico-telemetry__breadcrumb-node">
                      {' '}&gt; NODO: {(selectedWord || hoveredWord).nome}
                    </span>
                  )}
                </span>
                {' '}// FREQ: {telemetryFreq}Hz
              </span>
            </div>
            <div className="lessico-telemetry lessico-telemetry--bl">
              <span className="lessico-telemetry__tag">OPTICS</span>
              <span className="lessico-telemetry__val">
                MAG: <span ref={telemetryMagRef}>0.50</span>x | FOV: 68° | LOD: <span ref={telemetryLodRef}>MACRO</span>
              </span>
            </div>
            <div className="lessico-telemetry lessico-telemetry--br">
              <span className="lessico-telemetry__tag">TEST TELEMETRY</span>
              <span className="lessico-telemetry__val">
                {emergedWordIds.size} PAROLE EMERSE RILEVATE // TRACCE SINCRONIZZATE
              </span>
            </div>
          </div>

          <div
            ref={canvasRef}
            className="lessico-atlas__canvas"
          >
            {/* Layer 0: Deep Starfield (Z-Depth -400px, 0.12x Parallax) */}
            <div ref={starfieldRef} className="lessico-atlas__layer-stars" aria-hidden>
              <div className="lessico-atlas__deep-stars" />
              <div className="lessico-atlas__cosmic-dust" />
            </div>

            {/* Layer 1: Volumetric Gas Nebulae (Z-Depth -200px, 0.35x Parallax) */}
            <div ref={nebulaeRef} className="lessico-atlas__layer-nebulae" aria-hidden>
              {CONSTELLATION_DATA.spheres.map((sphere) => {
                const isDimmed = filterFamily && filterFamily !== sphere.id
                const isFocused = activeFamilyId === sphere.id
                return (
                  <div
                    key={`nebula-${sphere.id}`}
                    className={`lessico-atlas__nebula${isDimmed ? ' is-dimmed' : ''}${
                      isFocused ? ' is-focused-family' : ''
                    }`}
                    style={{
                      left: `${sphere.x}px`,
                      top: `${sphere.y}px`,
                      '--nebula-color': sphere.color,
                    }}
                  />
                )
              })}
            </div>

            {/* Layer 2: Constellation Network, Holographic Astrolabes & Hubs (Z-Depth 0px) */}
            <div ref={constellationLayerRef} className="lessico-atlas__layer-constellation">
              {/* 1. Constellation Network SVG Lines Layer */}
              <svg
                className="lessico-atlas__network-svg"
                width={WORLD_WIDTH}
                height={WORLD_HEIGHT}
                viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
              >
                <defs>
                  {FAMILY_LIST.map((fam) => (
                    <radialGradient
                      key={`grad-${fam.id}`}
                      id={`grad-${fam.id}`}
                      cx="50%"
                      cy="50%"
                      r="50%"
                    >
                      <stop offset="0%" stopColor={fam.baseColor} stopOpacity="0.32" />
                      <stop offset="60%" stopColor={fam.baseColor} stopOpacity="0.08" />
                      <stop offset="100%" stopColor={fam.baseColor} stopOpacity="0" />
                    </radialGradient>
                  ))}
                </defs>

                {CONSTELLATION_DATA.edges.map((edge) => {
                  const isFamilyFiltered = filterFamily && filterFamily !== edge.familyId
                  const isFamilyActive = filterFamily && filterFamily === edge.familyId
                  const isHovered = hoveredWordId && edge.wordId === hoveredWordId
                  const isSelected = selectedWord && edge.wordId === selectedWord.id
                  const isShockwaveActive = edge.wordId && shockwaveActiveIds.has(edge.wordId)
                  const isEmerged = edge.wordId
                    ? emergedWordIds.has(edge.wordId)
                    : edge.type === 'core-hub' && activeCoreHubIds.has(edge.subcurrentId)

                  return (
                    <g
                      key={edge.id}
                      className={`lessico-atlas__edge-group${isHovered || isSelected ? ' is-highlighted' : ''}${
                        isEmerged ? ' is-emerged' : ''
                      }${isShockwaveActive ? ' is-shockwave-active' : ''}${
                        isFamilyFiltered ? ' is-dimmed' : ''
                      }${isFamilyActive ? ' is-family-active' : ''}`}
                      style={{ '--edge-color': edge.color, '--target-color': edge.targetColor || edge.color }}
                    >
                      {/* 1. Strato Base (Filamento Guida) */}
                      <path
                        d={edge.d}
                        className={`lessico-atlas__edge lessico-atlas__edge--${edge.type}${
                          isHovered || isSelected ? ' is-highlighted' : ''
                        }${isEmerged ? ' is-emerged' : ''}${
                          isShockwaveActive ? ' is-shockwave-active' : ''
                        }${isFamilyFiltered ? ' is-dimmed' : ''}${isFamilyActive ? ' is-family-active' : ''}`}
                        stroke={edge.color}
                        fill="none"
                      />

                      {/* 2. Strato Energetico Superiore (Photon Pulse Stream) */}
                      <path
                        d={edge.d}
                        className={`lessico-atlas__edge-pulse lessico-atlas__edge-pulse--${edge.type}${
                          isHovered || isSelected ? ' is-highlighted' : ''
                        }${isEmerged ? ' is-emerged' : ''}${
                          isShockwaveActive ? ' is-shockwave-active' : ''
                        }${isFamilyFiltered ? ' is-dimmed' : ''}${isFamilyActive ? ' is-family-active' : ''}`}
                        stroke={edge.targetColor || edge.color}
                        fill="none"
                      />
                    </g>
                  )
                })}
              </svg>

              {/* 2. 5 Celestial Star Cores (Clean Harmonic Planetary Nuclei) */}
              {CONSTELLATION_DATA.spheres.map((sphere) => {
                const isDimmed = filterFamily && filterFamily !== sphere.id
                const isFocused = filterFamily === sphere.id
                const diam = sphere.radius * 2

                return (
                  <div
                    key={sphere.id}
                    className={`lessico-atlas__sphere${isDimmed ? ' is-dimmed' : ''}${
                      isFocused ? ' is-focused-family' : ''
                    }`}
                    style={{
                      left: `${sphere.x}px`,
                      top: `${sphere.y}px`,
                      width: `${diam}px`,
                      height: `${diam}px`,
                      '--sphere-color': sphere.color,
                    }}
                    aria-hidden
                  >
                    {/* Atmospheric Stellar Halo */}
                    <div className="lessico-nucleus__halo" />
                    {/* Orbital Boundary Ring */}
                    <div className="lessico-nucleus__ring" />
                    {/* Radiant Core Star */}
                    <div className="lessico-nucleus__core" />
                  </div>
                )
              })}

              {/* 3. Family Title Badges */}
              {CONSTELLATION_DATA.spheres.map((sphere) => {
                const isDimmed = filterFamily && filterFamily !== sphere.id
                const count = ATLAS_WORDS.filter((w) => w.familyId === sphere.id).length

                return (
                  <button
                    key={`badge-${sphere.id}`}
                    type="button"
                    className={`lessico-atlas__family-badge${isDimmed ? ' is-dimmed' : ''}`}
                    style={{
                      left: `${sphere.x}px`,
                      top: `${sphere.y - sphere.radius - 20}px`,
                      '--badge-color': sphere.color,
                    }}
                    onClick={() => handleFilterChange(sphere.id)}
                    title={`Esplora la costellazione ${sphere.name}`}
                  >
                    <span
                      className="lessico-atlas__family-badge-dot"
                      style={{ backgroundColor: sphere.color }}
                    />
                    <span>{sphere.name}</span>
                    <span className="lessico-atlas__family-badge-count">{count} parole</span>
                  </button>
                )
              })}

              {/* 4. Subcurrent Constellation Hubs */}
              {CONSTELLATION_DATA.hubs.map((hub) => {
                const isDimmed = filterFamily && filterFamily !== hub.familyId

                return (
                  <div
                    key={hub.id}
                    className={`lessico-atlas__hub${isDimmed ? ' is-dimmed' : ''}`}
                    style={{
                      left: `${hub.x}px`,
                      top: `${hub.y}px`,
                      '--hub-color': hub.color,
                    }}
                    aria-hidden
                  >
                    <div className="lessico-atlas__hub-dot" />
                    <div className="lessico-atlas__hub-label">
                      <span className="lessico-atlas__hub-title">{hub.title}</span>
                      {hub.interval && (
                        <span className="lessico-atlas__hub-interval">{hub.interval}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Layer 3: Interactive Word Nodes & Shockwaves (Z-Depth 25px) */}
            <div ref={wordsLayerRef} className="lessico-atlas__layer-words">
              {/* Shockwave Ring on Selection */}
              {shockwave && (
                <div
                  key={shockwave.id}
                  className="lessico-shockwave"
                  style={{
                    left: `${shockwave.x}px`,
                    top: `${shockwave.y}px`,
                    '--shockwave-color': shockwave.color,
                  }}
                  aria-hidden="true"
                />
              )}

              {CONSTELLATION_DATA.words.map((word) => {
                const isSelected = selectedWord?.id === word.id
                const isHovered = hoveredWordId === word.id
                const isShockwaveActive = shockwaveActiveIds.has(word.id)
                const isFamilyFiltered = filterFamily && filterFamily !== word.familyId
                const isFamilyActive = filterFamily && filterFamily === word.familyId
                const matchesSearch =
                  Boolean(normalizedSearch) && word.nome.toLowerCase().includes(normalizedSearch)
                const isSearchFiltered = normalizedSearch && !matchesSearch
                const isDimmed = isFamilyFiltered || isSearchFiltered

                const normalizedName = word.nome.toLowerCase()
                const isEmerged =
                  emergedWords.precise.has(`${word.familyId}|${word.subcurrentId}|${normalizedName}`) ||
                  emergedWords.fallback.has(normalizedName)

                return (
                  <button
                    key={word.id}
                    type="button"
                    data-ring={word.ringIndex}
                    className={`lessico-atlas__word${isSelected ? ' is-selected' : ''}${
                      isEmerged ? ' is-emerged' : ''
                    }${isHovered ? ' is-hovered' : ''}${
                      isShockwaveActive ? ' is-shockwave-active' : ''
                    }${isDimmed ? ' is-dimmed' : ''}${isFamilyActive ? ' is-family-active' : ''}${
                      matchesSearch ? ' is-search-matched' : ''
                    }`}
                    style={{
                      left: `${word.x}px`,
                      top: `${word.y}px`,
                      fontSize: `${word.fontSize}px`,
                      fontWeight: word.fontWeight,
                      '--word-color': word.color,
                    }}
                    onMouseEnter={(e) => {
                      hoveredWordIdRef.current = word.id
                      const clientX = e.clientX
                      const clientY = e.clientY
                      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
                      hoverTimerRef.current = setTimeout(() => {
                        setHoveredWordId(word.id)
                        setHoveredWord(word)
                        const layer = layerRef.current
                        if (layer) {
                          const rect = layer.getBoundingClientRect()
                          const x = clamp(clientX - rect.left, 130, rect.width - 130)
                          const y = Math.max(70, clientY - rect.top)
                          setTooltipPos({ x, y })
                        }
                      }, 35)
                    }}
                    onMouseLeave={() => {
                      hoveredWordIdRef.current = null
                      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
                      hoverTimerRef.current = setTimeout(() => {
                        setHoveredWordId(null)
                        setHoveredWord(null)
                      }, 35)
                    }}
                    onClick={() => {
                      handleSelectWord(word)
                    }}
                    aria-expanded={isSelected || undefined}
                    aria-controls={isSelected ? 'lessico-dictionary-popover' : undefined}
                    tabIndex={isDimmed ? -1 : 0}
                  >
                    <span
                      className="lessico-atlas__word-dot"
                      style={{ backgroundColor: word.color }}
                    />
                    <span className="lessico-atlas__word-label">{word.nome}</span>
                    {(isEmerged || word.ringIndex === 0) && (
                      <span
                        className={`lessico-atlas__word-tag${isEmerged ? ' is-emerged' : ''}`}
                      >
                        {isEmerged ? 'Emersa' : 'Cardine'}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Contextual Glassmorphic Hover Tooltip ─────────────────────── */}
          {hoveredWord && !selectedWord && (
            <div
              className="lessico-atlas__tooltip"
              style={{
                left: `${tooltipPos.x}px`,
                top: `${tooltipPos.y}px`,
                '--tooltip-color': hoveredWord.color || hoveredWord.familyColor,
              }}
              aria-hidden="true"
            >
              <div className="lessico-atlas__tooltip-header">
                <span
                  className="lessico-atlas__tooltip-dot"
                  style={{ backgroundColor: hoveredWord.color || hoveredWord.familyColor }}
                />
                <strong className="lessico-atlas__tooltip-title">{hoveredWord.nome}</strong>
                {emergedWordIds.has(hoveredWord.id) ? (
                  <span className="lessico-atlas__tooltip-tag is-emerged">Emersa</span>
                ) : hoveredWord.ringIndex === 0 ? (
                  <span className="lessico-atlas__tooltip-tag">Cardine</span>
                ) : null}
              </div>
              <div className="lessico-atlas__tooltip-meta">
                <span className="lessico-atlas__tooltip-family">
                  {hoveredWord.familyLabel.toUpperCase()}
                  {userPercentages &&
                  ATLAS_FAMILY_KEY_BY_ID[hoveredWord.familyId] &&
                  userPercentages[ATLAS_FAMILY_KEY_BY_ID[hoveredWord.familyId]] !== undefined
                    ? ` · ${userPercentages[ATLAS_FAMILY_KEY_BY_ID[hoveredWord.familyId]]}%`
                    : ''}
                </span>
                {hoveredWord.subcurrentInterval && (
                  <span className="lessico-atlas__tooltip-interval">
                    {hoveredWord.subcurrentInterval}
                  </span>
                )}
              </div>
              {hoveredWord.subcurrentDescription && (
                <p className="lessico-atlas__tooltip-desc">
                  {hoveredWord.subcurrentDescription}
                </p>
              )}
            </div>
          )}

          {/* ── Tactical Radar Mini-Map (Space Navigation Console) ─────────── */}
          <div
            className="lessico-radar"
            role="region"
            aria-label="Radar Galattico e Mini-mappa"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="lessico-radar__head">
              <span className="lessico-radar__tag">
                <span className="lessico-radar__status-dot" aria-hidden="true" />
                RADAR // MAP
              </span>
              <span className="lessico-radar__coord">
                <span ref={radarCoordRef}>1700,1200</span>
              </span>
            </div>

            <div
              className="lessico-radar__screen"
              onClick={handleRadarClick}
              title="Clicca per spostare la telecamera nella galassia"
            >
              {/* Animated sweeping line */}
              <div className="lessico-radar__sweep" />

              {/* Miniature Galaxy SVG */}
              <svg className="lessico-radar__svg" viewBox="0 0 160 113">
                {CONSTELLATION_DATA.spheres.map((s) => {
                  const sx = s.x * (160 / WORLD_WIDTH)
                  const sy = s.y * (113 / WORLD_HEIGHT)
                  const isDimmed = filterFamily && filterFamily !== s.id
                  return (
                    <g key={`radar-sphere-${s.id}`} opacity={isDimmed ? 0.25 : 0.9}>
                      <circle
                        cx={sx}
                        cy={sy}
                        r={s.id === filterFamily ? 6.5 : 4.5}
                        fill={s.color}
                        stroke="rgba(255,255,255,0.4)"
                        strokeWidth="0.8"
                      />
                      {s.id === filterFamily && (
                        <circle
                          cx={sx}
                          cy={sy}
                          r={10}
                          fill="none"
                          stroke={s.color}
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          opacity="0.8"
                        />
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Viewfinder rectangle indicating currently framed area */}
              <div ref={radarViewfinderRef} className="lessico-radar__viewfinder" />
            </div>
          </div>
        </div>
      ) : (
        /* ── Mobile: Vertical Card Stack ────────────────────────────────── */
        <div className="lessico-atlas__mobile-stack">
          {viewModel && (
            <div
              className={`lessico-mobile-card${expandedMobileFamily === 'dashboard' ? ' is-expanded' : ''}`}
              style={{ '--card-color': '#3b82f6' }}
            >
              <button
                type="button"
                className="lessico-mobile-card__header"
                onClick={() =>
                  setExpandedMobileFamily((prev) => (prev === 'dashboard' ? null : 'dashboard'))
                }
                aria-expanded={expandedMobileFamily === 'dashboard'}
              >
                <span
                  className="lessico-mobile-card__dot"
                  style={{ backgroundColor: '#3b82f6' }}
                  aria-hidden
                />
                <strong className="lessico-mobile-card__title">Analisi avanzata</strong>
                <span className="lessico-mobile-card__count">
                  {viewModel.datiDisponibili ? 'Firma & Forze' : 'Vuoto'}
                </span>
                <span className="lessico-mobile-card__chevron" aria-hidden>
                  {expandedMobileFamily === 'dashboard' ? '▲' : '▼'}
                </span>
              </button>
              {expandedMobileFamily === 'dashboard' && (
                <div className="lessico-mobile-card__body" style={{ padding: '1rem' }}>
                  <AnalisiDashboard
                    viewModel={viewModel}
                    onSelectWord={(w) => {
                      handleSelectWord(w)
                      setExpandedMobileFamily(null)
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {FAMILY_LIST.map((fam) => (
            <MobileAtlasCard
              key={fam.id}
              fam={fam}
              isExpanded={expandedMobileFamily === fam.id}
              onToggle={() =>
                setExpandedMobileFamily((prev) => (prev === fam.id ? null : fam.id))
              }
              onSelectWord={(w) => {
                handleSelectWord(w)
                setExpandedMobileFamily(null)
              }}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* ── Floating Holographic Slate or Advanced Dashboard ────────────── */}
      {selectedWord ? (
        <FloatingHolographicSlate
          word={selectedWord}
          onClose={closeDictionary}
          onSelectWord={handleSelectWord}
          viewModel={viewModel}
        />
      ) : !isMobile && showDashboard && viewModel ? (
        <aside className="lessico-holo-slate lessico-holo-slate--dashboard" aria-label="Analisi lessicale avanzata">
          <div className="lessico-holo-slate__bezel" style={{ '--slate-color': '#3b82f6' }}>
            <header
              className="lessico-holo-slate__head"
              style={{ borderBottomColor: 'rgba(59, 130, 246, 0.2)' }}
            >
              <div className="lessico-holo-slate__head-tag">
                <span className="lessico-holo-slate__status-dot" style={{ backgroundColor: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }} />
                <span className="lessico-holo-slate__kicker" style={{ color: '#60a5fa' }}>
                  HOLO-SLATE // ADVANCED TELEMETRY
                </span>
              </div>
              <button
                type="button"
                className="lessico-holo-slate__close"
                onClick={() => setShowDashboard(false)}
                aria-label="Nascondi analisi avanzata"
              >
                ✕
              </button>
            </header>
            <div className="lessico-holo-slate__body" style={{ padding: '1rem', overflowY: 'auto' }}>
              <AnalisiDashboard
                viewModel={viewModel}
                onSelectWord={handleSelectWord}
              />
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
