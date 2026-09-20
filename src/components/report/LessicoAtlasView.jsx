import React, { useState, useCallback, useRef, useEffect, useLayoutEffect, useMemo } from 'react'
import { GALAXY_THEORY_BY_DISPOSITION } from '../../config/galaxyTheoryContent.ts'

// ─── Virtual World Dimensions ────────────────────────────────────────────────
const WORLD_WIDTH = 3400
const WORLD_HEIGHT = 2400

const CAMERA_MIN_SCALE = 0.22
const CAMERA_MAX_SCALE = 2.8
const CAMERA_ZOOM_STEP = 1.25
const WHEEL_ZOOM_INTENSITY = 0.002
const PINCH_DAMPING = 0.55
const BASE_PITCH = 22
const FOCUS_PITCH = 13
const LERP_FACTOR = 0.10

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
    y: 480,
    radius: 390,
    subSpread: 210,
    compass: 'Nord · Fuoco / Luce',
  },
  flemmatica: {
    id: 'flemmatica',
    label: 'Flemmatica',
    colors: ['#4ade80', '#22c55e', '#16a34a', '#34d399', '#0d9488', '#2dd4bf'],
    baseColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.22)',
    x: 1700,
    y: 1250,
    radius: 380,
    subSpread: 175,
    compass: 'Centro · Acqua / Calma',
  },
  agnostica_anaffettiva: {
    id: 'agnostica_anaffettiva',
    label: 'Razionale',
    colors: ['#94a3b8', '#64748b', '#cbd5e1', '#9ca3af', '#475569', '#e2e8f0'],
    baseColor: '#94a3b8',
    glowColor: 'rgba(148, 163, 184, 0.22)',
    x: 1700,
    y: 2020,
    radius: 340,
    subSpread: 180,
    compass: 'Sud · Terra / Distacco',
  },
  malinconica_nostalgica: {
    id: 'malinconica_nostalgica',
    label: 'Malinconica',
    colors: ['#818cf8', '#6366f1', '#7c3aed', '#a5b4fc', '#4338ca', '#c084fc'],
    baseColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.24)',
    x: 740,
    y: 1250,
    radius: 620,
    subSpread: 320,
    compass: 'Ovest · Aria / Memoria',
  },
  collerico_volitiva: {
    id: 'collerico_volitiva',
    label: 'Marziale',
    colors: ['#f87171', '#ef4444', '#dc2626', '#fb7185', '#be123c', '#c026d3'],
    baseColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.24)',
    x: 2660,
    y: 1250,
    radius: 510,
    subSpread: 260,
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

      const maxR =
        numCurrents === 1
          ? cfg.radius * 0.74
          : Math.min(230, Math.max(160, cfg.subSpread * 0.74))

      // Distribute each ring with proportional angular spacing weighted by text length
      for (let rIdx = 0; rIdx <= 2; rIdx++) {
        const ringWords = ringAssignments.filter((item) => item.ringIndex === rIdx)
        if (ringWords.length === 0) continue

        const ringFactor = rIdx === 0 ? 0.4 : rIdx === 1 ? 0.7 : 1.0
        const r = maxR * ringFactor
        const yFlatten = 0.85

        // Alternating imperceptible cosmic drift speed (rad/frame)
        const driftDirection = rIdx % 2 === 0 ? 1 : -1
        const driftSpeed = driftDirection * (0.00022 - rIdx * 0.00004)

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
            driftSpeed,
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

  // Quick 16-step pre-settle of Euler/Verlet spring & anti-overlap to ensure clean initial layout
  const numWords = words.length
  const pX = new Float32Array(numWords)
  const pY = new Float32Array(numWords)
  const vX = new Float32Array(numWords)
  const vY = new Float32Array(numWords)
  for (let i = 0; i < numWords; i++) {
    pX[i] = words[i].x
    pY[i] = words[i].y
  }

  const aspect = 2.2
  const kSpring = 0.05
  const damping = 0.88
  for (let step = 0; step < 16; step++) {
    for (let i = 0; i < numWords; i++) {
      const w = words[i]
      let fx = -kSpring * (pX[i] - w.x)
      let fy = -kSpring * (pY[i] - w.y)

      for (let j = i + 1; j < numWords; j++) {
        if (words[j].familyId !== w.familyId) continue
        const dx = pX[j] - pX[i]
        const dy = pY[j] - pY[i]
        const minDist = (w.width + words[j].width) * 0.5 + 12
        if (Math.abs(dx) > minDist) continue
        const scaledDy = dy * aspect
        if (Math.abs(scaledDy) > minDist) continue

        const d = Math.hypot(dx, scaledDy)
        if (d < minDist && d > 0.001) {
          const rawF = Math.min(8, 1800 / ((d + 1) * (d + 1)))
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

  for (let i = 0; i < numWords; i++) {
    words[i].x = pX[i]
    words[i].y = pY[i]
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

// ─── Dictionary Panel ────────────────────────────────────────────────────────
function DictionaryPanel({ word, onClose, onSelectWord, viewModel }) {
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

  const hasApprofondimento = Boolean(word.subcurrentInterval || dynamicWordInfo)

  return (
    <aside
      id="lessico-dictionary-popover"
      className="lessico-dict"
      aria-label="Dizionario emotivo"
    >
      <div className="lessico-dict__bezel" style={{ '--dict-color': word.familyColor }}>
        <header className="lessico-dict__head">
          <p className="lessico-dict__kicker">Dizionario emotivo</p>
          <button
            ref={closeButtonRef}
            type="button"
            className="lessico-dict__close"
            onClick={onClose}
            aria-label="Chiudi dizionario"
          >
            ✕
          </button>
        </header>
        <div className="lessico-dict__body">
          <h2 className="lessico-dict__word" style={{ color: word.color }}>
            {word.nome}
          </h2>
          <dl className="lessico-dict__meta">
            <div>
              <dt>Famiglia</dt>
              <dd>
                <span
                  className="lessico-dict__dot"
                  style={{ backgroundColor: meta?.baseColor }}
                  aria-hidden
                />
                {word.familyLabel}
              </dd>
            </div>
            <div>
              <dt>Sottocorrente</dt>
              <dd>{word.subcurrentTitle}</dd>
            </div>
            <div>
              <dt>Fonte Lessico</dt>
              <dd style={{ color: dynamicWordInfo ? '#22c55e' : '#cbd5e1', fontWeight: 600 }}>
                {dynamicWordInfo ? 'Situazionale (dal test)' : 'Stabile (teoria)'}
              </dd>
            </div>
          </dl>
          {word.subcurrentDescription && (
            <div className="lessico-dict__def">
              <h3>Descrizione</h3>
              <p>{word.subcurrentDescription}</p>
            </div>
          )}
          {word.nearbyWords.length > 0 && (
            <div className="lessico-dict__nearby">
              <h3>Parole vicine</h3>
              <div className="lessico-dict__nearby-list">
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
                      className="lessico-dict__nearby-word"
                      style={{ '--nearby-color': w?.color || meta?.baseColor }}
                      onClick={() => w && onSelectWord(w)}
                    >
                      {nome}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {hasApprofondimento && (
            <details className="lessico-dashboard__details lessico-dict__approfondisci">
              <summary className="text-xs cursor-pointer select-none text-slate-400 hover:text-slate-200">
                Approfondisci
              </summary>
              <dl className="lessico-dict__meta mt-2">
                {word.subcurrentInterval && (
                  <div>
                    <dt>Intervallo musicale</dt>
                    <dd>{word.subcurrentInterval}</dd>
                  </div>
                )}
                {dynamicWordInfo?.fileKeys && dynamicWordInfo.fileKeys.length > 0 && (
                  <div>
                    <dt>Tracce collegate</dt>
                    <dd style={{ color: '#60a5fa' }}>
                      {dynamicWordInfo.fileKeys
                        .map((f) => `Traccia ${f.replace('File_', '')}`)
                        .join(', ')}
                    </dd>
                  </div>
                )}
                {dynamicWordInfo && (
                  <>
                    <div>
                      <dt>Corrente TST</dt>
                      <dd style={{ fontSize: '0.85rem' }}>{dynamicWordInfo.correnteKey}</dd>
                    </div>
                    <div>
                      <dt>Famiglia Key</dt>
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

// ─── Family Filter Legend ───────────────────────────────────────────────────
function AtlasLegend({ filterFamily, onFilterChange }) {
  return (
    <nav className="lessico-legend" aria-label="Filtra per famiglia emotiva">
      <button
        type="button"
        className={`lessico-legend__item${!filterFamily ? ' is-active' : ''}`}
        onClick={() => onFilterChange(null)}
      >
        Tutte
      </button>
      {FAMILY_LIST.map((fam) => (
        <button
          key={fam.id}
          type="button"
          className={`lessico-legend__item${filterFamily === fam.id ? ' is-active' : ''}`}
          style={{ '--legend-color': fam.baseColor }}
          onClick={() => onFilterChange(filterFamily === fam.id ? null : fam.id)}
        >
          <span
            className="lessico-legend__dot"
            style={{ backgroundColor: fam.baseColor }}
            aria-hidden
          />
          {fam.label}
        </button>
      ))}
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
  const [selectedWord, setSelectedWord] = useState(null)
  const [hoveredWordId, setHoveredWordId] = useState(null)
  const [filterFamily, setFilterFamily] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [expandedMobileFamily, setExpandedMobileFamily] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)

  const canvasRef = useRef(null)
  const layerRef = useRef(null)
  const bgRef = useRef(null)
  const cameraRef = useRef(createCamera(0, 0, 0.5, BASE_PITCH, 0, 0, 0))
  const targetCameraRef = useRef(createCamera(0, 0, 0.5, BASE_PITCH, 0, 0, 0))
  const initialCameraRef = useRef(createCamera(0, 0, 0.5, BASE_PITCH, 0, 0, 0))
  const velocityRef = useRef({ vx: 0, vy: 0 })
  const pointerTiltRef = useRef({ pitch: 0, yaw: 0, roll: 0, bgX: 0, bgY: 0 })
  const currentTiltRef = useRef({ pitch: 0, yaw: 0, roll: 0, bgX: 0, bgY: 0 })
  const flightRef = useRef(null)
  const viewportSizeRef = useRef({ w: 0, h: 0, left: 0, top: 0 })
  const pointersRef = useRef(new Map())
  const pinchRef = useRef(null)
  const mouseDragRef = useRef(null)
  const webkitGestureRef = useRef(null)
  const searchInputRef = useRef(null)
  const wordRefs = useRef([])
  const edgeRefs = useRef([])
  const mouseWorldRef = useRef({ x: -9999, y: -9999, active: false })
  const hoveredWordIdRef = useRef(null)

  const [camera, setCamera] = useState(() => ({ scale: 0.5 }))
  const [activeClosestFamily, setActiveClosestFamily] = useState('BLU')
  const currentLodTierRef = useRef('macro')
  const lastReportedScaleRef = useRef(0.5)
  const closestFamilyRef = useRef('BLU')

  const lodTier = useMemo(() => {
    if (camera.scale < 0.72) return 'macro'
    if (camera.scale < 1.35) return 'meso'
    return 'micro'
  }, [camera.scale])

  const activeFamilyId = filterFamily || activeClosestFamily

  const normalizedSearch = searchQuery.trim().toLowerCase()

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

  const resetCamera = useCallback(() => {
    const initial = initialCameraRef.current
    velocityRef.current = { vx: 0, vy: 0 }
    flightRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 850,
      startCamera: { ...cameraRef.current },
      endCamera: {
        ...initial,
        pitch: BASE_PITCH,
        yaw: 0,
        roll: 0,
        z: 0,
      },
      swoopRoll: -3.0,
    }
  }, [])

  // Orbital Fly-to word target (Section 3.E)
  const focusWord = useCallback((word) => {
    if (!word) return
    const vp = layerRef.current
    if (!vp) return
    const rect = vp.getBoundingClientRect()
    const targetScale = clamp(rect.width < 900 ? 1.25 : 1.5, 1.2, 1.6)

    const targetX = rect.width / 2 - WORLD_WIDTH / 2 - (word.x - WORLD_WIDTH / 2) * targetScale
    const targetY = rect.height / 2 - WORLD_HEIGHT / 2 - (word.y - WORLD_HEIGHT / 2) * targetScale

    const currentX = cameraRef.current.x
    const swoopRoll = targetX < currentX ? -3.8 : 3.8

    velocityRef.current = { vx: 0, vy: 0 }
    flightRef.current = {
      active: true,
      startTime: performance.now(),
      duration: 800,
      startCamera: { ...cameraRef.current },
      endCamera: {
        x: targetX,
        y: targetY,
        z: 0,
        scale: targetScale,
        pitch: FOCUS_PITCH,
        yaw: 0,
        roll: 0,
      },
      swoopRoll,
    }
  }, [])

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

  // Smoothly glide camera to frame a specific family sphere with orbital swoop (Section 3.E)
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

      const currentX = cameraRef.current.x
      const swoopRoll = targetX < currentX ? -4.0 : 4.0

      velocityRef.current = { vx: 0, vy: 0 }
      flightRef.current = {
        active: true,
        startTime: performance.now(),
        duration: 850,
        startCamera: { ...cameraRef.current },
        endCamera: {
          x: targetX,
          y: targetY,
          z: 0,
          scale: targetScale,
          pitch: FOCUS_PITCH,
          yaw: 0,
          roll: 0,
        },
        swoopRoll,
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
        const initial = createCamera(initX, initY, fitScale, BASE_PITCH, 0, 0, 0)
        initialCameraRef.current = initial
        targetCameraRef.current = initial
        cameraRef.current = { ...initial }
        lastReportedScaleRef.current = fitScale
        currentLodTierRef.current =
          fitScale < 0.72 ? 'macro' : fitScale < 1.35 ? 'meso' : 'micro'
        setCamera({ scale: fitScale })

        if (canvasRef.current) {
          canvasRef.current.style.transform = `translate3d(${initX.toFixed(2)}px, ${initY.toFixed(2)}px, 0px) rotateX(${BASE_PITCH}deg) rotateY(0deg) rotateZ(0deg) scale(${fitScale.toFixed(4)})`
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
      if (target?.closest('.lessico-dict')) return

      event.preventDefault()
      const vp = layerRef.current
      if (!vp) return

      const { left, top } = viewportSizeRef.current
      const origin = { x: event.clientX - left, y: event.clientY - top }
      const isPinch = event.ctrlKey || event.metaKey

      flightRef.current = null

      if (isPinch) {
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
      } else {
        event.stopPropagation()
        targetCameraRef.current = {
          ...targetCameraRef.current,
          x: targetCameraRef.current.x - event.deltaX,
          y: targetCameraRef.current.y - event.deltaY,
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

  // Mouse / Pointer drag pan & world coordinate tracking for physics interaction
  const handlePointerDown = useCallback((e) => {
    const target = e.target instanceof Element ? e.target : null
    if (target?.closest('.lessico-dict, .lessico-atlas__controls')) return

    pointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointersRef.current.size >= 2) {
      mouseWorldRef.current.active = false
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
      mouseWorldRef.current.active = false
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
    const vp = layerRef.current
    if (vp && !mouseDragRef.current && pointersRef.current.size <= 1) {
      const rect = vp.getBoundingClientRect()
      const cam = cameraRef.current
      mouseWorldRef.current.x =
        WORLD_WIDTH / 2 + (e.clientX - rect.left - WORLD_WIDTH / 2 - cam.x) / cam.scale
      mouseWorldRef.current.y =
        WORLD_HEIGHT / 2 + (e.clientY - rect.top - WORLD_HEIGHT / 2 - cam.y) / cam.scale
      mouseWorldRef.current.active = true

      // Section 3.C: Micro-tilt calculation
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const nx = clamp((e.clientX - cx) / (rect.width / 2), -1, 1)
      const ny = clamp((e.clientY - cy) / (rect.height / 2), -1, 1)

      pointerTiltRef.current.pitch = ny * -2.5
      pointerTiltRef.current.yaw = nx * 3.0
      pointerTiltRef.current.roll = nx * -1.2
      pointerTiltRef.current.bgX = -nx * 18
      pointerTiltRef.current.bgY = -ny * 12
    }

    if (!pointersRef.current.has(e.pointerId)) return
    pointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY })

    if (pointersRef.current.size >= 2 && pinchRef.current) {
      mouseWorldRef.current.active = false
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
      mouseWorldRef.current.active = false
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
    mouseWorldRef.current.active = false
    if (e.currentTarget.releasePointerCapture && e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const handlePointerLeave = useCallback(() => {
    mouseWorldRef.current.active = false
    pointerTiltRef.current = { pitch: 0, yaw: 0, roll: 0, bgX: 0, bgY: 0 }
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
      if (e.key === '0') {
        e.preventDefault()
        resetCamera()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedWord, showSearch, resetCamera, zoomStep, closeDictionary])

  useEffect(() => {
    if (showSearch && searchInputRef.current) searchInputRef.current.focus()
  }, [showSearch])


  const handleSearchToggle = useCallback(() => {
    setShowSearch((prev) => {
      if (prev) setSearchQuery('')
      return !prev
    })
  }, [])

  // ─── 60/120 FPS Spring-Dampened Physics Simulation Loop ───────────────────
  useEffect(() => {
    if (isMobile) return undefined

    const words = CONSTELLATION_DATA.words
    const edges = CONSTELLATION_DATA.edges
    const numWords = words.length
    const numEdges = edges.length

    // Zero-GC typed arrays
    const posX = new Float32Array(numWords)
    const posY = new Float32Array(numWords)
    const velX = new Float32Array(numWords)
    const velY = new Float32Array(numWords)
    const forceX = new Float32Array(numWords)
    const forceY = new Float32Array(numWords)

    const baseAngles = new Float32Array(numWords)
    const radii = new Float32Array(numWords)
    const driftSpeeds = new Float32Array(numWords)
    const hubXs = new Float32Array(numWords)
    const hubYs = new Float32Array(numWords)
    const yFlattens = new Float32Array(numWords)
    const widths = new Float32Array(numWords)

    // Pre-group words by family to optimize collision checks
    const familyIndicesMap = new Map()
    for (let f = 0; f < FAMILY_ORDER.length; f++) {
      familyIndicesMap.set(FAMILY_ORDER[f], [])
    }

    for (let i = 0; i < numWords; i++) {
      const w = words[i]
      posX[i] = w.x
      posY[i] = w.y
      baseAngles[i] = w.baseAngle
      radii[i] = w.orbitRadius
      driftSpeeds[i] = w.driftSpeed
      hubXs[i] = w.hubX
      hubYs[i] = w.hubY
      yFlattens[i] = w.yFlatten
      widths[i] = w.width
      const famArr = familyIndicesMap.get(w.familyId)
      if (famArr) famArr.push(i)
    }

    const familyWordGroups = Array.from(familyIndicesMap.values())

    let rafId = null
    let frameCount = 0
    const kSpring = 0.05
    const damping = 0.90
    const repulsionStrength = 1800
    const aspect = 2.2

    const tick = () => {
      frameCount++

      // 0. Smooth Camera 3D Interpolation & Flight Dynamics (Sections 3.D & 3.E)
      if (flightRef.current?.active) {
        const flight = flightRef.current
        const elapsed = performance.now() - flight.startTime
        const rawT = Math.min(1, elapsed / flight.duration)
        const easedT = flyEasing(rawT)

        targetCameraRef.current.x =
          flight.startCamera.x + (flight.endCamera.x - flight.startCamera.x) * easedT
        targetCameraRef.current.y =
          flight.startCamera.y + (flight.endCamera.y - flight.startCamera.y) * easedT
        targetCameraRef.current.z =
          (flight.startCamera.z || 0) +
          ((flight.endCamera.z || 0) - (flight.startCamera.z || 0)) * easedT
        targetCameraRef.current.scale =
          flight.startCamera.scale +
          (flight.endCamera.scale - flight.startCamera.scale) * easedT
        targetCameraRef.current.pitch =
          flight.startCamera.pitch +
          (flight.endCamera.pitch - flight.startCamera.pitch) * easedT
        targetCameraRef.current.yaw =
          flight.startCamera.yaw +
          (flight.endCamera.yaw - flight.startCamera.yaw) * easedT

        // Orbital swoop: sinusoidal roll peaking in mid-flight and returning to 0
        const swoop = Math.sin(rawT * Math.PI) * flight.swoopRoll
        targetCameraRef.current.roll =
          flight.startCamera.roll +
          (flight.endCamera.roll - flight.startCamera.roll) * easedT +
          swoop

        if (rawT >= 1) {
          flight.active = false
          targetCameraRef.current.roll = flight.endCamera.roll
        }
      } else if (!mouseDragRef.current) {
        // Friction momentum decay on release
        const vel = velocityRef.current
        if (Math.hypot(vel.vx, vel.vy) > 0.05) {
          targetCameraRef.current.x += vel.vx
          targetCameraRef.current.y += vel.vy
          vel.vx *= 0.92
          vel.vy *= 0.92
        } else {
          vel.vx = 0
          vel.vy = 0
        }
      }

      // Continuous 60/120 FPS Lerp Damping (Section 3.D)
      const cur = cameraRef.current
      const tgt = targetCameraRef.current
      cur.x += (tgt.x - cur.x) * LERP_FACTOR
      cur.y += (tgt.y - cur.y) * LERP_FACTOR
      cur.z = (cur.z || 0) + ((tgt.z || 0) - (cur.z || 0)) * LERP_FACTOR
      cur.scale += (tgt.scale - cur.scale) * LERP_FACTOR
      cur.pitch += (tgt.pitch - cur.pitch) * LERP_FACTOR
      cur.yaw += (tgt.yaw - cur.yaw) * LERP_FACTOR
      cur.roll += (tgt.roll - cur.roll) * LERP_FACTOR

      // Semantic LOD & Closest Family synchronization
      const newTier = cur.scale < 0.72 ? 'macro' : cur.scale < 1.35 ? 'meso' : 'micro'
      if (
        newTier !== currentLodTierRef.current ||
        Math.abs(cur.scale - lastReportedScaleRef.current) > 0.08 ||
        (Math.abs(tgt.scale - cur.scale) < 0.001 && Math.abs(cur.scale - lastReportedScaleRef.current) > 0.005)
      ) {
        currentLodTierRef.current = newTier
        lastReportedScaleRef.current = cur.scale
        setCamera((prev) => (Math.abs(prev.scale - cur.scale) < 0.001 ? prev : { ...prev, scale: cur.scale }))
      }

      if (frameCount % 6 === 0) {
        const vp = viewportSizeRef.current
        const screenCenterX = vp.w ? vp.w / 2 : 0
        const screenCenterY = vp.h ? vp.h / 2 : 0
        const currentScale = cur.scale || 1
        const worldCenterX = WORLD_WIDTH / 2 + (screenCenterX - WORLD_WIDTH / 2 - cur.x) / currentScale
        const worldCenterY = WORLD_HEIGHT / 2 + (screenCenterY - WORLD_HEIGHT / 2 - cur.y) / currentScale

        let closestId = 'BLU'
        let minDistSq = Infinity
        for (let sIdx = 0; sIdx < CONSTELLATION_DATA.spheres.length; sIdx++) {
          const sphere = CONSTELLATION_DATA.spheres[sIdx]
          const dx = sphere.x - worldCenterX
          const dy = sphere.y - worldCenterY
          const distSq = dx * dx + dy * dy
          if (distSq < minDistSq) {
            minDistSq = distSq
            closestId = sphere.id
          }
        }
        if (closestId !== closestFamilyRef.current) {
          closestFamilyRef.current = closestId
          setActiveClosestFamily(closestId)
        }
      }

      // Reactive Micro-Tilt & Background Parallax Lerp (Section 3.C)
      const pTilt = pointerTiltRef.current
      const cTilt = currentTiltRef.current
      cTilt.pitch += (pTilt.pitch - cTilt.pitch) * 0.08
      cTilt.yaw += (pTilt.yaw - cTilt.yaw) * 0.08
      cTilt.roll += (pTilt.roll - cTilt.roll) * 0.08
      cTilt.bgX += (pTilt.bgX - cTilt.bgX) * 0.08
      cTilt.bgY += (pTilt.bgY - cTilt.bgY) * 0.08

      const totalPitch = cur.pitch + cTilt.pitch
      const totalYaw = cur.yaw + cTilt.yaw
      const totalRoll = cur.roll + cTilt.roll

      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, ${(cur.z || 0).toFixed(2)}px) rotateX(${totalPitch.toFixed(2)}deg) rotateY(${totalYaw.toFixed(2)}deg) rotateZ(${totalRoll.toFixed(2)}deg) scale(${cur.scale.toFixed(4)})`
      }

      if (bgRef.current) {
        bgRef.current.style.transform = `translate3d(${cTilt.bgX.toFixed(2)}px, ${cTilt.bgY.toFixed(2)}px, 0)`
      }

      // 1. Reset forces
      forceX.fill(0)
      forceY.fill(0)

      // 2. Spring Force towards drifting orbit
      for (let i = 0; i < numWords; i++) {
        const theta = baseAngles[i] + driftSpeeds[i] * frameCount
        const targetX = hubXs[i] + Math.cos(theta) * radii[i]
        const targetY = hubYs[i] + Math.sin(theta) * (radii[i] * yFlattens[i])

        forceX[i] += -kSpring * (posX[i] - targetX)
        forceY[i] += -kSpring * (posY[i] - targetY)
      }

      // 3. Proximity Repulsion (Soft Coulomb Anti-Overlap) within each family
      const currentScale = cameraRef.current.scale
      const pad = 12

      for (let g = 0; g < familyWordGroups.length; g++) {
        const group = familyWordGroups[g]
        const count = group.length
        for (let aIdx = 0; aIdx < count; aIdx++) {
          const i = group[aIdx]
          const wi = widths[i]
          const xi = posX[i]
          const yi = posY[i]

          for (let bIdx = aIdx + 1; bIdx < count; bIdx++) {
            const j = group[bIdx]
            const dx = posX[j] - xi
            const dy = posY[j] - yi

            const minDistance = (wi + widths[j]) * 0.5 + pad
            if (Math.abs(dx) > minDistance) continue
            const scaledDy = dy * aspect
            if (Math.abs(scaledDy) > minDistance) continue

            const dScaled = Math.hypot(dx, scaledDy)
            if (dScaled < minDistance && dScaled > 0.001) {
              const rawForce = Math.min(10, repulsionStrength / ((dScaled + 1) * (dScaled + 1)))
              const nx = dx / dScaled
              const ny = (scaledDy / dScaled) / aspect

              const fx = nx * rawForce
              const fy = ny * rawForce

              forceX[i] -= fx
              forceY[i] -= fy
              forceX[j] += fx
              forceY[j] += fy
            }
          }
        }
      }

      // 4. Mouse / Cursor Interaction: scosta delicatamente le parole attorno al cursore
      if (mouseWorldRef.current.active) {
        const mx = mouseWorldRef.current.x
        const my = mouseWorldRef.current.y
        const worldInfluence = 50 / currentScale
        const worldInfluenceSq = worldInfluence * worldInfluence
        const hoveredId = hoveredWordIdRef.current

        for (let i = 0; i < numWords; i++) {
          // Do not push the hovered word itself so it remains steady under the cursor
          if (hoveredId && words[i].id === hoveredId) continue

          const dx = posX[i] - mx
          const dy = posY[i] - my
          const distSq = dx * dx + dy * dy
          if (distSq < worldInfluenceSq && distSq > 0.001) {
            const dist = Math.sqrt(distSq)
            const factor = (1 - dist / worldInfluence) * (6.0 / currentScale)
            forceX[i] += (dx / dist) * factor
            forceY[i] += (dy / dist) * factor
          }
        }
      }

      // 5. Velocity and Position Integration with Damping
      for (let i = 0; i < numWords; i++) {
        velX[i] = (velX[i] + forceX[i]) * damping
        velY[i] = (velY[i] + forceY[i]) * damping

        posX[i] += velX[i]
        posY[i] += velY[i]

        words[i].x = posX[i]
        words[i].y = posY[i]
        words[i].vx = velX[i]
        words[i].vy = velY[i]

        const wordEl = wordRefs.current[i]
        if (wordEl) {
          wordEl.style.left = `${posX[i]}px`
          wordEl.style.top = `${posY[i]}px`
        }
      }

      // 6. Synchronize SVG edges (both base filament and pulse stream)
      for (let e = 0; e < numEdges; e++) {
        const edge = edges[e]
        if (edge.wordIndex !== undefined) {
          const wIdx = edge.wordIndex
          const wx = posX[wIdx]
          const wy = posY[wIdx]
          edge.x2 = wx
          edge.y2 = wy

          const d = computeBézierPath(
            edge.x1,
            edge.y1,
            wx,
            wy,
            edge.sphereX,
            edge.sphereY,
            edge.sagVariation,
          )
          edge.d = d

          const edgeEl = edgeRefs.current[e]
          if (edgeEl) {
            if (edgeEl.base) edgeEl.base.setAttribute('d', d)
            if (edgeEl.pulse) edgeEl.pulse.setAttribute('d', d)
          }
        }
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  return (
    <div
      className={`lessico-atlas${isMobile ? ' lessico-atlas--mobile' : ''} lessico-atlas--lod-${lodTier}`}
      data-lod-tier={lodTier}
    >
      {/* ── Top Bar Controls ─────────────────────────────────────────────── */}
      <div className="lessico-atlas__controls">
        <AtlasLegend filterFamily={filterFamily} onFilterChange={handleFilterChange} />

        {!isMobile && (
          <div
            className="galassia-view__map-controls lessico-atlas__zoom-controls"
            role="toolbar"
            aria-label="Zoom e navigazione atlante"
          >
            <button
              type="button"
              className="galassia-view__map-control"
              aria-label="Zoom avanti"
              onClick={(e) => {
                e.stopPropagation()
                zoomStep(1)
              }}
            >
              +
            </button>
            <button
              type="button"
              className="galassia-view__map-control"
              aria-label="Zoom indietro"
              onClick={(e) => {
                e.stopPropagation()
                zoomStep(-1)
              }}
            >
              −
            </button>
            <button
              type="button"
              className="galassia-view__map-control galassia-view__map-control--ghost"
              aria-label="Centra la vista"
              onClick={(e) => {
                e.stopPropagation()
                resetCamera()
              }}
            >
              Centra
            </button>
          </div>
        )}

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
            <input
              ref={searchInputRef}
              type="search"
              className="lessico-atlas__search-input"
              placeholder="Cerca una parola…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && normalizedSearch) {
                  const matched = CONSTELLATION_DATA.words.find((w) =>
                    w.nome.toLowerCase().includes(normalizedSearch),
                  )
                  if (matched) {
                    setSelectedWord(matched)
                    focusWord(matched)
                  }
                }
              }}
              aria-label="Cerca nel lessico emotivo"
            />
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
          <div
            ref={canvasRef}
            className="lessico-atlas__canvas"
          >
            {/* 0. Background Layer (Cosmic Nebulae & Star Dust with 3D Depth) */}
            <div ref={bgRef} className="lessico-atlas__bg" aria-hidden>
              <div className="lessico-atlas__stars" />
              {CONSTELLATION_DATA.spheres.map((sphere) => {
                const isDimmed = filterFamily && filterFamily !== sphere.id
                const isBackgroundBlurred =
                  lodTier === 'micro' && activeFamilyId && sphere.id !== activeFamilyId
                return (
                  <div
                    key={`nebula-${sphere.id}`}
                    className={`lessico-atlas__nebula${isDimmed ? ' is-dimmed' : ''}${
                      isBackgroundBlurred ? ' is-background-blurred' : ''
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

                {CONSTELLATION_DATA.edges.map((edge) => (
                  <React.Fragment key={`edge-defs-${edge.id}`}>
                    <linearGradient
                      id={`edge-grad-${edge.id}`}
                      gradientUnits="userSpaceOnUse"
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                    >
                      <stop offset="0%" stopColor={edge.color} stopOpacity="0.9" />
                      <stop offset="70%" stopColor={edge.targetColor || edge.color} stopOpacity="0.7" />
                      <stop offset="100%" stopColor={edge.targetColor || edge.color} stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient
                      id={`edge-pulse-grad-${edge.id}`}
                      gradientUnits="userSpaceOnUse"
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                    >
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                      <stop offset="60%" stopColor={edge.targetColor || edge.color} stopOpacity="0.95" />
                      <stop offset="100%" stopColor={edge.targetColor || edge.color} stopOpacity="0.25" />
                    </linearGradient>
                  </React.Fragment>
                ))}
              </defs>

              {CONSTELLATION_DATA.edges.map((edge, edgeIdx) => {
                const isFamilyFiltered = filterFamily && filterFamily !== edge.familyId
                const isHovered = hoveredWordId && edge.wordId === hoveredWordId
                const isSelected = selectedWord && edge.wordId === selectedWord.id
                const isEmerged = edge.wordId
                  ? emergedWordIds.has(edge.wordId)
                  : edge.type === 'core-hub' && activeCoreHubIds.has(edge.subcurrentId)
                const isBackgroundBlurred =
                  lodTier === 'micro' && activeFamilyId && edge.familyId !== activeFamilyId

                return (
                  <g
                    key={edge.id}
                    className={`lessico-atlas__edge-group${isHovered || isSelected ? ' is-highlighted' : ''}${
                      isEmerged ? ' is-emerged' : ''
                    }${isFamilyFiltered ? ' is-dimmed' : ''}${
                      isBackgroundBlurred ? ' is-background-blurred' : ''
                    }`}
                    style={{ '--edge-color': edge.color, '--target-color': edge.targetColor || edge.color }}
                  >
                    {/* 1. Strato Base (Filamento Guida) */}
                    <path
                      ref={(el) => {
                        if (!edgeRefs.current[edgeIdx]) edgeRefs.current[edgeIdx] = {}
                        edgeRefs.current[edgeIdx].base = el
                      }}
                      d={edge.d}
                      className={`lessico-atlas__edge lessico-atlas__edge--${edge.type}${
                        isHovered || isSelected ? ' is-highlighted' : ''
                      }${isEmerged ? ' is-emerged' : ''}${isFamilyFiltered ? ' is-dimmed' : ''}`}
                      stroke={`url(#edge-grad-${edge.id})`}
                      fill="none"
                    />

                    {/* 2. Strato Energetico Superiore (Photon Pulse Stream) */}
                    <path
                      ref={(el) => {
                        if (!edgeRefs.current[edgeIdx]) edgeRefs.current[edgeIdx] = {}
                        edgeRefs.current[edgeIdx].pulse = el
                      }}
                      d={edge.d}
                      className={`lessico-atlas__edge-pulse lessico-atlas__edge-pulse--${edge.type}${
                        isHovered || isSelected ? ' is-highlighted' : ''
                      }${isEmerged ? ' is-emerged' : ''}${isFamilyFiltered ? ' is-dimmed' : ''}`}
                      stroke={`url(#edge-pulse-grad-${edge.id})`}
                      fill="none"
                    />
                  </g>
                )
              })}
            </svg>

            {/* 2. 5 Planetary Celestial Spheres */}
            {CONSTELLATION_DATA.spheres.map((sphere) => {
              const isDimmed = filterFamily && filterFamily !== sphere.id
              const isBackgroundBlurred =
                lodTier === 'micro' && activeFamilyId && sphere.id !== activeFamilyId
              const diam = sphere.radius * 2

              return (
                <div
                  key={sphere.id}
                  className={`lessico-atlas__sphere${isDimmed ? ' is-dimmed' : ''}${
                    isBackgroundBlurred ? ' is-background-blurred' : ''
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
                  <div className="lessico-atlas__sphere-ring" />
                  <div className="lessico-atlas__sphere-glow" />
                </div>
              )
            })}

            {/* 3. Family Title Badges */}
            {CONSTELLATION_DATA.spheres.map((sphere) => {
              const isDimmed = filterFamily && filterFamily !== sphere.id
              const isBackgroundBlurred =
                lodTier === 'micro' && activeFamilyId && sphere.id !== activeFamilyId
              const count = ATLAS_WORDS.filter((w) => w.familyId === sphere.id).length

              return (
                <button
                  key={`badge-${sphere.id}`}
                  type="button"
                  className={`lessico-atlas__family-badge${isDimmed ? ' is-dimmed' : ''}${
                    isBackgroundBlurred ? ' is-background-blurred' : ''
                  }`}
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
              const isBackgroundBlurred =
                lodTier === 'micro' && activeFamilyId && hub.familyId !== activeFamilyId

              return (
                <div
                  key={hub.id}
                  className={`lessico-atlas__hub${isDimmed ? ' is-dimmed' : ''}${
                    isBackgroundBlurred ? ' is-background-blurred' : ''
                  }`}
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

            {/* 5. Constellation Word Nodes */}
            {CONSTELLATION_DATA.words.map((word, wordIdx) => {
              const isSelected = selectedWord?.id === word.id
              const isHovered = hoveredWordId === word.id
              const isFamilyFiltered = filterFamily && filterFamily !== word.familyId
              const matchesSearch =
                Boolean(normalizedSearch) && word.nome.toLowerCase().includes(normalizedSearch)
              const isSearchFiltered = normalizedSearch && !matchesSearch
              const isDimmed = isFamilyFiltered || isSearchFiltered

              const normalizedName = word.nome.toLowerCase()
              const isEmerged =
                emergedWords.precise.has(`${word.familyId}|${word.subcurrentId}|${normalizedName}`) ||
                emergedWords.fallback.has(normalizedName)

              const isBackgroundBlurred =
                lodTier === 'micro' && activeFamilyId && word.familyId !== activeFamilyId

              return (
                <button
                  key={word.id}
                  ref={(el) => {
                    wordRefs.current[wordIdx] = el
                  }}
                  type="button"
                  className={`lessico-atlas__word${isSelected ? ' is-selected' : ''}${
                    isEmerged ? ' is-emerged' : ''
                  }${isHovered ? ' is-hovered' : ''}${isDimmed ? ' is-dimmed' : ''}${
                    isBackgroundBlurred ? ' is-background-blurred' : ''
                  }${matchesSearch ? ' is-search-matched' : ''}`}
                  style={{
                    left: `${word.x}px`,
                    top: `${word.y}px`,
                    fontSize: `${word.fontSize}px`,
                    fontWeight: word.fontWeight,
                    '--word-color': word.color,
                  }}
                  onMouseEnter={() => {
                    setHoveredWordId(word.id)
                    hoveredWordIdRef.current = word.id
                  }}
                  onMouseLeave={() => {
                    setHoveredWordId(null)
                    hoveredWordIdRef.current = null
                  }}
                  onClick={() => {
                    setSelectedWord(word)
                    focusWord(word)
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
                  {lodTier === 'micro' && (
                    <span
                      className={`lessico-atlas__word-tag${isEmerged ? ' is-emerged' : ''}`}
                    >
                      {isEmerged ? 'Emersa' : word.ringIndex === 0 ? 'Cardine' : null}
                    </span>
                  )}
                </button>
              )
            })}
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
                      setSelectedWord(w)
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
                setSelectedWord(w)
                setExpandedMobileFamily(null)
              }}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* ── Dictionary Panel or Advanced Dashboard ───────────────────────── */}
      {selectedWord ? (
        <DictionaryPanel
          word={selectedWord}
          onClose={closeDictionary}
          onSelectWord={(w) => {
            setSelectedWord(w)
            focusWord(w)
          }}
          viewModel={viewModel}
        />
      ) : !isMobile && showDashboard && viewModel ? (
        <aside className="lessico-dict" aria-label="Analisi lessicale avanzata">
          <div className="lessico-dict__bezel" style={{ '--dict-color': '#3b82f6' }}>
            <header
              className="lessico-dict__head"
              style={{ borderBottomColor: 'rgba(59, 130, 246, 0.2)' }}
            >
              <p className="lessico-dict__kicker" style={{ color: '#60a5fa' }}>
                Analisi avanzata
              </p>
              <button
                type="button"
                className="lessico-dict__close"
                onClick={() => setShowDashboard(false)}
                aria-label="Nascondi analisi avanzata"
              >
                ✕
              </button>
            </header>
            <div className="lessico-dict__body" style={{ padding: '1rem', overflowY: 'auto' }}>
              <AnalisiDashboard
                viewModel={viewModel}
                onSelectWord={(w) => {
                  setSelectedWord(w)
                  focusWord(w)
                }}
              />
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  )
}
