import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  buildDispositionNodes,
  buildDispositionRelations,
  computeGlobalBalance,
  getDominantAndSecondary,
} from '../../config/galaxyMapping'
import { DISPOSITION_WIND, getRawDocVisual } from '../../config/galaxyDocBridge'
import {
  SOTTOCORRENTE_META,
  getSottocorrenteMeta,
} from '../../config/galaxyContent'
import {
  getGalaxyTheoryForRawKey,
} from '../../config/galaxyTheoryContent'
import {
  CORPUS_SCHEMA_ASSI_ORIENTAMENTO,
  CORPUS_SCHEMA_INTERPRETATIVO_TITOLO,
} from '../../config/reportCorpusCopy'
import { DISPOSITIONS } from '../../config/dispositions'
import { getSemanticConcept, SEMANTIC_CONCEPT_EVENT } from '../../config/semanticConcepts'
import { THEORETICAL_MAX_COLOR_TOTALS, THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY } from '../../testLogic.js'
import { applyGalaxyPeTint } from '../../utils/galaxyColor'
import { drawGalaxyGlyph, drawWindRoseBackdrop } from '../../utils/galaxyGlyphs'

/** Fasi a passo fisso (~72°) così le cinque correnti non convergono nello stesso arco dell’orbita.
 * Ordine: blu, rosso, verde, giallo, grigio (DISPOSITIONS) partendo dall’apice alto (-π/2). */
const PENTAGON_BASE = -Math.PI / 2

const ORBIT_PARAMS = {
  blu: { rx: 208, ry: 124, tilt: 0.1, phase: PENTAGON_BASE + (0 / 5) * Math.PI * 2 },
  rosso: { rx: 200, ry: 118, tilt: -0.12, phase: PENTAGON_BASE + (1 / 5) * Math.PI * 2 },
  verde: { rx: 196, ry: 116, tilt: 0.07, phase: PENTAGON_BASE + (2 / 5) * Math.PI * 2 },
  giallo: { rx: 220, ry: 128, tilt: 0.12, phase: PENTAGON_BASE + (3 / 5) * Math.PI * 2 },
  grigio: { rx: 202, ry: 118, tilt: -0.08, phase: PENTAGON_BASE + (4 / 5) * Math.PI * 2 },
}

const ZOOM_MS = 600
const ZOOM_SCALE_MAX = 2.5
const OTHER_PLANETS_MIN_SCALE = 0.58
const OTHER_PLANETS_MIN_ALPHA = 0.24
const OTHER_PLANETS_DARKEN_ALPHA = 0.22
const NODE_ORBIT_SPEED = 0.000038
const RELATION_FLOW_SPEED = 0.0015
const RELATION_PULSE_SPEED = 0.0012
const SATELLITE_ORBIT_SPEED = 0.000065
const SATELLITE_MIN_RADIUS = 16
const SATELLITE_RADIUS_GAIN = 32
const SATELLITE_HIT_PADDING = 18
const SATELLITE_ORBIT_BASE = 86
const SATELLITE_ORBIT_STEP = 9
const SATELLITE_EDGE_SAFE_PAD = 14
const SUB_ZOOM_EXTRA_SCALE = 1.28
const SELECTED_SATELLITE_SCALE_BOOST = 1.2
/** Margine extra tra i “mondi” (stessa unità di wx/wy, scala con layoutS). */
const NODE_COLLISION_PADDING = 8
const NODE_SEPARATION_ITERATIONS = 16

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return reduced
}

function easeOutCubic(u) {
  return 1 - (1 - u) ** 3
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Stelle: diametri 1 / 1.5 / 2 px → raggi 0.5 / 0.75 / 1, opacità 0.3–0.9. */
function fillStarfield(ctx, w, h, seed) {
  const rnd = mulberry32(seed)
  const count = 220
  for (let i = 0; i < count; i += 1) {
    const x = rnd() * w
    const y = rnd() * h
    const tier = rnd()
    const radius = tier < 0.34 ? 0.5 : tier < 0.67 ? 0.75 : 1
    const op = 0.3 + rnd() * 0.6
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255,255,255,${op})`
    ctx.fill()
  }
}

function rawKeyToLabel(key) {
  const base = key.split('_').slice(2).join(' ').replaceAll('_', ' ').trim() || key
  return base.replace(/\b\w/g, (c) => c.toUpperCase())
}

function dispositionForRawKey(rawKey) {
  return DISPOSITIONS.find((d) => d.rawKeys.includes(rawKey)) || null
}

function relationCurveVisual(type, relationScore, ms, selected) {
  const strength = Math.max(0.25, Math.min(1, relationScore / 100))
  const pulse = 0.85 + Math.sin(ms * RELATION_FLOW_SPEED) * 0.15
  const base = selected ? 1.45 : 1
  const width = (0.6 + strength * 1.1) * pulse * base
  if (type === 'synergy') {
    return { width, dash: [], curve: 16, flow: true }
  }
  if (type === 'tension') {
    return { width, dash: [6, 4], curve: -12, flow: false }
  }
  if (type === 'compensation') {
    return { width, dash: [2, 5], curve: 26, flow: true }
  }
  return { width, dash: [10, 6], curve: 8 + Math.sin(ms * RELATION_PULSE_SPEED) * 8, flow: false }
}

function intensityLabel(pct) {
  if (pct >= 70) return 'Alta'
  if (pct >= 40) return 'Media'
  return 'Bassa'
}

function relativeIntensityLabel(pct, maxPct) {
  return intensityLabel(maxPct > 0 ? (pct / maxPct) * 100 : 0)
}

function relativeShareLabel(sharePct, rank) {
  if (rank === 1 && sharePct >= 28) return 'Prevalente'
  if (sharePct >= 26) return 'Molto presente'
  if (sharePct >= 16) return 'Presente'
  if (sharePct >= 8) return 'Secondaria'
  return 'Marginale'
}

function relativeShareSentence({ label, sharePct, rank, totalItems, scopeLabel }) {
  if (!label) return ''
  const pos = rank && totalItems ? `${rank} su ${totalItems}` : 'nel gruppo'
  return `${label} pesa circa il ${sharePct}% ${scopeLabel}: è ${pos} per presenza relativa nelle risposte.`
}

function clampSatelliteScreenPoint(point, radius, cw, ch) {
  const safe = Math.max(18, radius + SATELLITE_EDGE_SAFE_PAD)
  return {
    sx: Math.min(cw - safe, Math.max(safe, point.sx)),
    sy: Math.min(ch - safe, Math.max(safe, point.sy)),
  }
}

function relationTypeLabel(type) {
  if (type === 'synergy') return 'linea continua'
  if (type === 'tension') return 'tratteggio breve'
  if (type === 'compensation') return 'tratteggio puntinato'
  return 'tratteggio lungo'
}

function relationMeaningSentence(relation, fromLabel, toLabel) {
  if (!relation) return ''
  const strength = intensityLabel(relation.relationScore).toLowerCase()
  const stroke = relationTypeLabel(relation.relationType)
  return `Confronto grafico tra «${fromLabel}» e «${toLabel}»: vicinanza relativa ${relation.relationScore}%, tratto ${stroke}, intensita ${strength}.`
}

const PDF_FAMILY_PLAIN = {
  malinconica_nostalgica: 'Blu: riflessione su cio che si e vissuto e memoria dei legami.',
  collerico_volitiva: 'Rosso: forza dell Io che vuole realizzare nel presente.',
  flemmatica: 'Verde: calma, non-movimento e contemplazione.',
  entusiasmo: 'Giallo: curiosita, solarita e movimento verso l esperienza.',
  agnostica_anaffettiva: 'Grigio: distacco, calcolo e distanza dalla passione.',
}

function relationPdfTooltipSentence(fromNode, toNode) {
  const fromText = PDF_FAMILY_PLAIN[fromNode?.dispositionId] || fromNode?.label || 'questa corrente'
  const toText = PDF_FAMILY_PLAIN[toNode?.dispositionId] || toNode?.label || 'questa corrente'
  return `Dal PDF: ${fromText} ${toText} La linea mostra quanto queste due aree entrano in rapporto nel risultato.`
}

function dominantMeaningSentence(dominant, contrastPercent, globalBalance) {
  if (!dominant) {
    return 'La mappa sta aspettando un primo focus: scegli una linea per il confronto grafico tra due famiglie di correnti, oppure una corrente per i dettagli dai punteggi.'
  }
  if (contrastPercent >= 24) {
    return `${dominant.label} risulta prevalente nei punteggi di questo report. Puoi usarla come ingresso verso il confronto grafico sulle linee o verso il dettaglio delle sotto-correnti nel protocollo.`
  }
  if (globalBalance >= 72) {
    return `${dominant.label} emerge in un campo distribuito nei numeri di questa somministrazione. La vista d’insieme mette in evidenza il peso relativo delle cinque famiglie.`
  }
  return `${dominant.label} è il primo riferimento nella vista d’insieme. Da qui passa al confronto grafico tra famiglie su una linea, oppure alla composizione locale della corrente.`
}

function focusMeaningSentence({ panelFocus, panelTitle, panelParentDisposition, panelRelativeIntensityLabel }) {
  if (!panelFocus || !panelTitle) return ''
  const level = String(panelRelativeIntensityLabel || '').toLowerCase()
  if (panelFocus.type === 'sottocorrente') {
    return `${panelTitle} è un dettaglio locale della corrente ${panelParentDisposition?.label || ''}. Peso relativo ${level}: indica quanto incide rispetto alle altre sfumature della stessa corrente.`
  }
  return `${panelTitle} è ora il centro della lettura. Peso relativo ${level}: indica quanto questa famiglia incide rispetto alle altre famiglie emerse nelle risposte.`
}


/** Spezza una parola lunga in più righe misurate (nessun testo omesso sul canvas). */
function splitWordToFitLines(ctx, word, maxWidth, font) {
  ctx.font = font
  const w = String(word)
  if (!w) return []
  if (ctx.measureText(w).width <= maxWidth) return [w]
  const lines = []
  let remaining = w
  while (remaining.length > 0) {
    let lo = 1
    let hi = remaining.length
    let fit = 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      const seg = remaining.slice(0, mid)
      if (ctx.measureText(seg).width <= maxWidth) {
        fit = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    if (fit < 1) fit = 1
    lines.push(remaining.slice(0, fit))
    remaining = remaining.slice(fit)
  }
  return lines
}

function wrapCanvasTextToLines(ctx, text, maxWidth, font) {
  if (!text) return []
  const trimmed = String(text).trim()
  if (!trimmed) return []
  ctx.font = font
  if (ctx.measureText(trimmed).width <= maxWidth) return [trimmed]
  const words = trimmed.split(/\s+/)
  const lines = []
  let cur = ''
  const pushLongWord = (w) => {
    lines.push(...splitWordToFitLines(ctx, w, maxWidth, font))
  }
  for (const w of words) {
    const trial = cur ? `${cur} ${w}` : w
    ctx.font = font
    if (ctx.measureText(trial).width <= maxWidth) {
      cur = trial
      continue
    }
    if (cur) {
      lines.push(cur)
      cur = w
      ctx.font = font
      if (ctx.measureText(cur).width > maxWidth) {
        pushLongWord(cur)
        cur = ''
      }
    } else {
      pushLongWord(w)
    }
  }
  if (cur) lines.push(cur)
  return lines
}

/** Evidenza la prima frase del suggerimento HUD (stesso testo, lettura immediata). */
function galaxyHudLeadBody(full) {
  const s = String(full)
  const colon = s.indexOf(': ')
  if (colon !== -1) {
    return { lead: s.slice(0, colon + 1), body: s.slice(colon + 2) }
  }
  const comma = s.indexOf(', ')
  if (comma !== -1) {
    return { lead: s.slice(0, comma + 1), body: s.slice(comma + 2) }
  }
  return { lead: s, body: '' }
}

/** Tooltip canvas: contenuto leggibile, testo mai tagliato dal bordo mappa (clamp + wrap). */
function drawHoverBubbleCanvas(ctx, bubble, cw, ch) {
  const { sx, sy, r, label, detail1, detail2, detail3 } = bubble
  const inset = 8
  const padX = 10
  const padY = 7
  const titleFont = 'bold 13px system-ui, -apple-system, sans-serif'
  const bodyFont = '12px system-ui, -apple-system, sans-serif'
  const maxTextW = Math.max(96, cw - inset * 2 - padX * 2)

  const titleLines = wrapCanvasTextToLines(ctx, label, maxTextW, titleFont)
  const rawBody = [detail1, detail2, detail3].filter(Boolean)
  const bodyLines = rawBody.flatMap((b) => wrapCanvasTextToLines(ctx, b, maxTextW, bodyFont))

  let maxLinePx = 0
  titleLines.forEach((line) => {
    ctx.font = titleFont
    maxLinePx = Math.max(maxLinePx, ctx.measureText(line).width)
  })
  bodyLines.forEach((line) => {
    ctx.font = bodyFont
    maxLinePx = Math.max(maxLinePx, ctx.measureText(line).width)
  })

  const titleLH = 17
  const bodyLH = 15
  const bw = Math.ceil(maxLinePx + padX * 2)
  const bh = padY * 2 + titleLines.length * titleLH + bodyLines.length * bodyLH

  let bx = sx - bw / 2
  let by = sy - r - bh - 12
  bx = Math.max(inset, Math.min(cw - bw - inset, bx))
  by = Math.max(inset, Math.min(ch - bh - inset, by))

  ctx.save()
  ctx.fillStyle = 'rgba(2, 6, 23, 0.88)'
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 6)
    ctx.fill()
  } else {
    ctx.fillRect(bx, by, bw, bh)
  }
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)'
  ctx.lineWidth = 1
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(bx, by, bw, bh, 6)
    ctx.stroke()
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  let y = by + padY
  ctx.fillStyle = '#f8fafc'
  titleLines.forEach((line) => {
    ctx.font = titleFont
    ctx.fillText(line, bx + padX, y)
    y += titleLH
  })
  ctx.fillStyle = 'rgba(226, 232, 240, 0.95)'
  bodyLines.forEach((line) => {
    ctx.font = bodyFont
    ctx.fillText(line, bx + padX, y)
    y += bodyLH
  })
  ctx.restore()
}

function GalaxyInterpreterPanel({ state }) {
  if (!state) return null
  return (
    <section className="report-galaxy-interpreter" aria-label="Computerino interprete">
      <p className="report-galaxy-interpreter-kicker">{state.stageLabel}</p>
      <h3 className="report-galaxy-interpreter-title">{state.title}</h3>
      {state.question ? <p className="report-galaxy-interpreter-question">{state.question}</p> : null}
      <p className="report-galaxy-interpreter-meaning">{state.meaning}</p>
      {state.nextAction ? <p className="report-galaxy-interpreter-action">{state.nextAction}</p> : null}
    </section>
  )
}

function distPointSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy || 1
  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  const qx = x1 + t * dx
  const qy = y1 + t * dy
  return Math.hypot(px - qx, py - qy)
}

function getNodeWorld(node, ms, layoutS) {
  const orb = ORBIT_PARAMS[node.colorKey]
  const angle = (orb?.phase || 0) + ms * (NODE_ORBIT_SPEED * (0.5 + node.score / 100))
  const wx = (orb?.rx || 0) * layoutS * Math.cos(angle)
  const wy =
    (orb?.ry || 0) * layoutS * Math.sin(angle) + (orb?.tilt || 0) * (orb?.rx || 0) * layoutS * Math.cos(angle) * 0.4
  return { wx, wy }
}

/** Raggio di collisione allineato al disegno (sfera + alone + padding). */
function dispositionCollisionRadius(node, layoutS, radiusMul) {
  const rm = Math.max(0, radiusMul)
  const baseR = Math.max(6, node.sphereRadius * layoutS * rm * 0.78)
  const glowPx = Math.max(8, node.glowRadius * layoutS * rm)
  return baseR + glowPx + NODE_COLLISION_PADDING
}

function dispositionRadiusMul(node, zoomedNodeId, camT) {
  if (!zoomedNodeId || camT <= 0) return 1
  if (node.dispositionId === zoomedNodeId) return 1
  return Math.max(0.08, 1 - camT)
}

/**
 * Spinge i centri lontano finché i cerchi non si intersecano; ricentra sul baricentro
 * delle posizioni orbitali così l’animazione non deriva nel tempo.
 */
function resolveDispositionCollisions(worldById, nodes, layoutS, zoomedNodeId, camT) {
  const ids = nodes.map((n) => n.dispositionId)
  if (ids.length < 2) return

  let ox = 0
  let oy = 0
  for (const id of ids) {
    ox += worldById[id].wx
    oy += worldById[id].wy
  }
  ox /= ids.length
  oy /= ids.length

  for (let iter = 0; iter < NODE_SEPARATION_ITERATIONS; iter += 1) {
    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const ida = ids[i]
        const idb = ids[j]
        const na = nodes.find((n) => n.dispositionId === ida)
        const nb = nodes.find((n) => n.dispositionId === idb)
        if (!na || !nb) continue

        const ra = dispositionCollisionRadius(na, layoutS, dispositionRadiusMul(na, zoomedNodeId, camT))
        const rb = dispositionCollisionRadius(nb, layoutS, dispositionRadiusMul(nb, zoomedNodeId, camT))

        let dx = worldById[idb].wx - worldById[ida].wx
        let dy = worldById[idb].wy - worldById[ida].wy
        let dist = Math.hypot(dx, dy)
        const minD = ra + rb

        if (dist >= minD) continue

        if (dist < 1e-5) {
          const angle = ((i + j * 2.17 + iter * 0.31) % 1) * Math.PI * 2
          dx = Math.cos(angle)
          dy = Math.sin(angle)
          dist = 1
        } else {
          dx /= dist
          dy /= dist
        }

        const push = (minD - dist) * 0.52
        worldById[ida].wx -= dx * push
        worldById[ida].wy -= dy * push
        worldById[idb].wx += dx * push
        worldById[idb].wy += dy * push
      }
    }
  }

  let cx = 0
  let cy = 0
  for (const id of ids) {
    cx += worldById[id].wx
    cy += worldById[id].wy
  }
  cx /= ids.length
  cy /= ids.length
  const rdx = ox - cx
  const rdy = oy - cy
  for (const id of ids) {
    worldById[id].wx += rdx
    worldById[id].wy += rdy
  }
}

function buildResolvedWorldById(nodes, ms, layoutS, zoomedNodeId, camT) {
  const worldById = {}
  nodes.forEach((node) => {
    worldById[node.dispositionId] = getNodeWorld(node, ms, layoutS)
  })
  resolveDispositionCollisions(worldById, nodes, layoutS, zoomedNodeId, camT)
  return worldById
}

export default function Galaxy3DExplorer({ rawRecord, totalsByKey }) {
  const reducedMotion = useReducedMotion()
  const [zoomedNodeId, setZoomedNodeId] = useState(null)
  const [panelFocus, setPanelFocus] = useState(null)
  const [selectedRelationId, setSelectedRelationId] = useState(null)
  const [hudTipVisible, setHudTipVisible] = useState(true)

  const canvasRef = useRef(null)
  const mapWrapRef = useRef(null)
  const sectionRef = useRef(null)
  const animFrameRef = useRef(0)
  const startTimeRef = useRef(0)
  const zoomAnimRef = useRef({ t: 0, startMs: 0, fromT: 0, toT: 0 })
  const subZoomAnimRef = useRef({ t: 0, startMs: 0, fromT: 0, toT: 0 })
  const cameraStateRef = useRef({ focusWx: 0, focusWy: 0, extraScale: 1 })
  const cameraSmoothRef = useRef({ initialized: false, focusWx: 0, focusWy: 0, extraScale: 1 })
  const hoverRef = useRef(null)
  const lastSatRef = useRef([])
  const lastFrameMsRef = useRef(0)
  const panelFocusRef = useRef(null)
  const viewportRef = useRef({ w: 480, h: 380 })
  const dprRef = useRef(1)

  useEffect(() => {
    panelFocusRef.current = panelFocus
  }, [panelFocus])

  const nodes = useMemo(() => buildDispositionNodes({ rawRecord, totalsByKey }), [rawRecord, totalsByKey])
  const relations = useMemo(() => buildDispositionRelations(nodes), [nodes])
  const { dominant, contrastPercent } = useMemo(() => getDominantAndSecondary(nodes), [nodes])
  const globalBalance = useMemo(() => computeGlobalBalance(nodes), [nodes])
  const familyRelativeRows = useMemo(() => {
    const rows = nodes.map((node) => ({
      dispositionId: node.dispositionId,
      colorKey: node.colorKey,
      label: node.label,
      value: Number(totalsByKey?.[node.colorKey]) || 0,
    }))
    const total = rows.reduce((sum, row) => sum + row.value, 0)
    const sorted = [...rows].sort((a, b) => b.value - a.value)
    return rows.map((row) => ({
      ...row,
      sharePct: total > 0 ? Math.round((row.value / total) * 100) : 0,
      rank: sorted.findIndex((item) => item.dispositionId === row.dispositionId) + 1,
      totalItems: rows.length,
    }))
  }, [nodes, totalsByKey])

  const portatoRatios = useMemo(() => {
    const s = Number(rawRecord?.PE_Simpatia) || 0
    const a = Number(rawRecord?.PE_Antipatia) || 0
    const i = Number(rawRecord?.PE_Indifferenza) || 0
    const t = s + a + i
    if (t <= 0) {
      return { simpatia: 0, antipatia: 0, indifferenza: 0, indifferenzaDominante: false }
    }
    const indifferenzaDominante = i >= s && i >= a
    return { simpatia: s / t, antipatia: a / t, indifferenza: i / t, indifferenzaDominante }
  }, [rawRecord])

  const nodeById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.dispositionId, n])), [nodes])
  const relationById = useMemo(() => {
    const out = {}
    for (const relation of relations) {
      out[`${relation.fromDispositionId}_${relation.toDispositionId}`] = relation
    }
    return out
  }, [relations])

  const zoomedNode = nodes.find((node) => node.dispositionId === zoomedNodeId) || null
  const visibleRelations = useMemo(() => (zoomedNodeId ? [] : relations), [relations, zoomedNodeId])
  const selectedRelation = selectedRelationId ? relationById[selectedRelationId] || null : null
  const selectedRelationLabels = useMemo(() => {
    if (!selectedRelation) return null
    const fromLabel = nodeById[selectedRelation.fromDispositionId]?.label || 'n/d'
    const toLabel = nodeById[selectedRelation.toDispositionId]?.label || 'n/d'
    return `${fromLabel} - ${toLabel}`
  }, [selectedRelation, nodeById])
  const strongestRelation = useMemo(
    () =>
      [...relations].sort((a, b) => {
        const typeWeight = (relation) => (relation.relationType === 'tension' ? 10 : 0)
        return b.relationScore + typeWeight(b) - (a.relationScore + typeWeight(a))
      })[0] || null,
    [relations],
  )
  const strongestRelationLabels = useMemo(() => {
    if (!strongestRelation) return null
    const fromLabel = nodeById[strongestRelation.fromDispositionId]?.label || 'n/d'
    const toLabel = nodeById[strongestRelation.toDispositionId]?.label || 'n/d'
    return `${fromLabel} - ${toLabel}`
  }, [strongestRelation, nodeById])

  const windDots = useMemo(
    () =>
      nodes.map((node) => {
        const w = DISPOSITION_WIND[node.dispositionId]
        if (w && 'atCenter' in w && w.atCenter) {
          return { colorHex: node.colorHex, atCenter: true }
        }
        if (w && 'angleRad' in w) {
          return { colorHex: node.colorHex, angleRad: w.angleRad }
        }
        return { colorHex: node.colorHex, angleRad: 0 }
      }),
    [nodes],
  )

  const dominantRawKeyByDispositionId = useMemo(() => {
    const out = {}
    for (const node of nodes) {
      let bestKey = node.rawKeys[0]
      let bestValue = -1
      for (const key of node.rawKeys) {
        const v = Number(rawRecord?.[key]) || 0
        if (v > bestValue) {
          bestValue = v
          bestKey = key
        }
      }
      out[node.dispositionId] = bestKey
    }
    return out
  }, [nodes, rawRecord])

  /** Ordine stabile rawKeys (Blu=4, Rosso=2, …), non ordinato per valore. */
  const subDispositionStable = useMemo(() => {
    if (!zoomedNode) return []
    return zoomedNode.rawKeys.map((key) => {
      const value = Number(rawRecord?.[key]) || 0
      const theoreticalMax = THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[key] ?? 1
      const pct = theoreticalMax > 0 ? Math.min(1, value / theoreticalMax) : 0
      return {
        key,
        value,
        label: rawKeyToLabel(key),
        theoreticalMax,
        pctVsTheoretical: Math.min(100, Math.round(pct * 100)),
        meta: getSottocorrenteMeta(key),
      }
    })
  }, [zoomedNode, rawRecord])

  const maxSubValue = useMemo(
    () => Math.max(...subDispositionStable.map((sub) => Number(sub.value) || 0), 1),
    [subDispositionStable],
  )

  useLayoutEffect(() => {
    const now = performance.now()
    const target = zoomedNodeId ? 1 : 0
    zoomAnimRef.current = {
      t: zoomAnimRef.current.t,
      startMs: now,
      fromT: zoomAnimRef.current.t,
      toT: target,
    }
  }, [zoomedNodeId])

  useLayoutEffect(() => {
    const now = performance.now()
    const target = zoomedNodeId && panelFocus?.type === 'sottocorrente' ? 1 : 0
    subZoomAnimRef.current = {
      t: subZoomAnimRef.current.t,
      startMs: now,
      fromT: subZoomAnimRef.current.t,
      toT: target,
    }
  }, [zoomedNodeId, panelFocus])

  const enterCorrente = useCallback((nodeId) => {
    setZoomedNodeId(nodeId)
    setPanelFocus({ type: 'corrente', dispositionId: nodeId })
    setSelectedRelationId(null)
    setHudTipVisible(false)
  }, [])

  const backToGalaxy = useCallback(() => {
    setZoomedNodeId(null)
    setPanelFocus(null)
    setSelectedRelationId(null)
  }, [])

  const dismissFloatingUi = useCallback(() => {
    setSelectedRelationId(null)
    setHudTipVisible(false)
  }, [])

  useEffect(() => {
    const handler = (event) => {
      const detail = event.detail || {}
      const concept = getSemanticConcept(detail.id)
      if (!concept?.relatedRawKeys?.length) return

      let bestNodeId = null
      let bestScore = -1
      for (const node of nodes) {
        for (const rk of concept.relatedRawKeys) {
          if (!node.rawKeys?.includes(rk)) continue
          const sc = Number(rawRecord?.[rk]) || 0
          if (sc > bestScore) {
            bestScore = sc
            bestNodeId = node.dispositionId
          }
        }
      }

      let fallbackNodeId = null
      outer:
      for (const rk of concept.relatedRawKeys) {
        for (const node of nodes) {
          if (node.rawKeys?.includes(rk)) {
            fallbackNodeId = node.dispositionId
            break outer
          }
        }
      }

      const targetNodeId = bestNodeId || fallbackNodeId
      if (detail.scrollToGalaxy !== false) {
        document.getElementById('report-galassia')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      if (targetNodeId) {
        window.requestAnimationFrame(() => {
          enterCorrente(targetNodeId)
        })
      }
    }

    window.addEventListener(SEMANTIC_CONCEPT_EVENT, handler)
    return () => window.removeEventListener(SEMANTIC_CONCEPT_EVENT, handler)
  }, [nodes, rawRecord, enterCorrente])

  useEffect(() => {
    const interactiveSelector = [
      'button',
      'a',
      'label',
      'input',
      'textarea',
      'select',
      '[role="button"]',
      '[role="slider"]',
      '.report-galaxy-hud',
      '.report-galaxy-ui',
      '.report-galaxy-card--legend',
      '.report-galaxy-legend-toggle',
      '.report-galaxy-compact-bar',
      '.report-galaxy-mini-legend',
      '.report-galaxy-map',
      '.report-galaxy-canvas',
    ].join(',')

    const onDocPointerDownCapture = (event) => {
      const t = event.target
      if (!(t instanceof Element)) return
      if (t.closest(interactiveSelector)) return
      dismissFloatingUi()
    }

    document.addEventListener('pointerdown', onDocPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDownCapture, true)
  }, [dismissFloatingUi])

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key !== 'Escape') return
      if (!zoomedNodeId) return
      backToGalaxy()
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [zoomedNodeId, backToGalaxy])

  const panelParentDisposition = useMemo(() => {
    if (!panelFocus) return null
    if (panelFocus.type === 'corrente') {
      return nodes.find((n) => n.dispositionId === panelFocus.dispositionId) || null
    }
    return dispositionForRawKey(panelFocus.rawKey)
  }, [panelFocus, nodes])

  const panelTitle = useMemo(() => {
    if (!panelFocus) return ''
    if (panelFocus.type === 'corrente') {
      return nodes.find((n) => n.dispositionId === panelFocus.dispositionId)?.label || ''
    }
    return rawKeyToLabel(panelFocus.rawKey)
  }, [panelFocus, nodes])

  const panelScoreLine = useMemo(() => {
    if (!panelFocus || !panelParentDisposition) return { a: 0, b: 1, pct: 0 }
    if (panelFocus.type === 'corrente') {
      const tot = Number(totalsByKey?.[panelParentDisposition.colorKey]) || 0
      const max = THEORETICAL_MAX_COLOR_TOTALS[panelParentDisposition.colorKey] || 1
      const pct = max > 0 ? Math.min(100, Math.round((tot / max) * 100)) : 0
      return { a: tot, b: max, pct }
    }
    const v = Number(rawRecord?.[panelFocus.rawKey]) || 0
    const max = THEORETICAL_MAX_SCORE_BY_CORRENTE_KEY[panelFocus.rawKey] ?? 1
    const pct = max > 0 ? Math.min(100, Math.round((v / max) * 100)) : 0
    return { a: v, b: max, pct }
  }, [panelFocus, panelParentDisposition, totalsByKey, rawRecord])

  const subDispositionMatrix = useMemo(() => {
    const groupTotal = subDispositionStable.reduce((sum, sub) => sum + (Number(sub.value) || 0), 0)
    const selectedRawKey = panelFocus?.type === 'sottocorrente' ? panelFocus.rawKey : null
    return subDispositionStable.map((sub) => {
      const pct01 = Math.min(1, (Number(sub.value) || 0) / Math.max(1, Number(sub.theoreticalMax) || 1))
      const radiusPx = sub.value <= 0 ? 4 : 5 + pct01 * 16
      const opacity = sub.value <= 0 ? 0.2 : 0.3 + pct01 * 0.7
      const contributionPct = groupTotal > 0 ? Math.round((sub.value / groupTotal) * 100) : 0
      return {
        ...sub,
        contributionPct,
        radiusPx: Math.round(radiusPx * 10) / 10,
        opacityPct: Math.round(opacity * 100),
        isSelected: selectedRawKey === sub.key,
      }
    })
  }, [subDispositionStable, panelFocus])

  const panelRelativeShare = useMemo(() => {
    if (!panelFocus || !panelParentDisposition) {
      return { sharePct: 0, rank: 0, totalItems: 0, label: 'Marginale', sentence: '' }
    }
    if (panelFocus.type === 'corrente') {
      const row = familyRelativeRows.find((item) => item.dispositionId === panelParentDisposition.dispositionId)
      const sharePct = row?.sharePct || 0
      const rank = row?.rank || 0
      const totalItems = row?.totalItems || familyRelativeRows.length
      const label = relativeShareLabel(sharePct, rank)
      return {
        sharePct,
        rank,
        totalItems,
        label,
        sentence: relativeShareSentence({
          label: panelTitle,
          sharePct,
          rank,
          totalItems,
          scopeLabel: 'tra le cinque famiglie',
        }),
      }
    }
    const row = subDispositionMatrix.find((item) => item.key === panelFocus.rawKey)
    const sorted = [...subDispositionMatrix].sort((a, b) => b.value - a.value)
    const rank = sorted.findIndex((item) => item.key === panelFocus.rawKey) + 1
    const sharePct = row?.contributionPct || 0
    const totalItems = subDispositionMatrix.length
    const label = relativeShareLabel(sharePct, rank)
    return {
      sharePct,
      rank,
      totalItems,
      label,
      sentence: relativeShareSentence({
        label: panelTitle,
        sharePct,
        rank,
        totalItems,
        scopeLabel: `dentro ${panelParentDisposition.label}`,
      }),
    }
  }, [panelFocus, panelParentDisposition, familyRelativeRows, panelTitle, subDispositionMatrix])

  const panelTheorySub = useMemo(
    () => (panelFocus?.type === 'sottocorrente' ? getGalaxyTheoryForRawKey(panelFocus.rawKey) : null),
    [panelFocus],
  )
  const interpreterState = useMemo(() => {
    if (selectedRelation) {
      const fromNode = nodeById[selectedRelation.fromDispositionId]
      const toNode = nodeById[selectedRelation.toDispositionId]
      const fromLabel = fromNode?.label || 'questa corrente'
      const toLabel = toNode?.label || 'l altra corrente'
      return {
        stageLabel: 'Relazione attiva',
        title: selectedRelationLabels || 'Relazione selezionata',
        question: 'Che confronto grafico mostra questo legame?',
        meaning: relationMeaningSentence(selectedRelation, fromLabel, toLabel),
        nextAction:
          'Ora scegli uno dei due nodi collegati: passi dai dati grafici delle coppie al dettaglio delle correnti come nel protocollo.',
        evidenceItems: [
          { label: 'Stile di linea (interfaccia)', value: relationTypeLabel(selectedRelation.relationType) },
          { label: 'Vicinanza grafica', value: `${selectedRelation.relationScore}%` },
          { label: 'Messaggio grafico', value: selectedRelation.relationNarrative },
        ],
      }
    }

    if (panelFocus && panelParentDisposition) {
      return {
        stageLabel: panelFocus.type === 'sottocorrente' ? 'Focus locale' : 'Corrente in focus',
        title: panelTitle || panelParentDisposition.label,
        question:
          panelFocus.type === 'sottocorrente'
            ? 'Quale sfumatura sta dando forma alla corrente?'
            : 'Come si compone questa corrente?',
        meaning: focusMeaningSentence({
          panelFocus,
          panelTitle,
          panelParentDisposition,
          panelRelativeIntensityLabel: panelRelativeShare.label,
        }),
        nextAction:
          panelFocus.type === 'sottocorrente'
            ? 'Torna alla corrente o cambia satellite per confrontare una sfumatura vicina.'
            : 'Scendi nelle sotto-correnti: la forma complessiva diventa leggibile attraverso i suoi dettagli.',
        evidenceItems: [
          { label: 'Famiglia', value: panelParentDisposition.label },
          { label: 'Peso relativo', value: `${panelRelativeShare.label} (${panelRelativeShare.sharePct}%)` },
          { label: 'Posizione nel gruppo', value: `${panelRelativeShare.rank}/${panelRelativeShare.totalItems}` },
          { label: 'Valore risposte', value: `${panelScoreLine.a}` },
        ],
      }
    }

    return {
      stageLabel: 'Profilo',
      title: dominant?.label ? `Parti da ${dominant.label}` : 'Osserva il campo',
      question: 'Quale pattern merita il primo sguardo?',
      meaning: dominantMeaningSentence(dominant, contrastPercent, globalBalance),
      corpusCaption: CORPUS_SCHEMA_INTERPRETATIVO_TITOLO,
      corpusBullets: [...CORPUS_SCHEMA_ASSI_ORIENTAMENTO],
      nextAction: strongestRelation
        ? `Clicca la linea ${strongestRelationLabels}: è una relazione utile per iniziare.`
        : 'Clicca una corrente per entrare nella sua composizione.',
      evidenceItems: [
        { label: 'Dominante', value: dominant?.label || 'n/d' },
        { label: 'Equilibrio globale', value: `${globalBalance}%` },
        { label: 'Contrasto dominante/secondaria', value: `${contrastPercent}%` },
        strongestRelation
          ? {
              label: 'Relazione suggerita',
              value: `${strongestRelationLabels} · ${relationTypeLabel(strongestRelation.relationType)} (${strongestRelation.relationScore}%)`,
            }
          : null,
      ],
    }
  }, [
    selectedRelation,
    selectedRelationLabels,
    nodeById,
    panelFocus,
    panelParentDisposition,
    panelTitle,
    panelRelativeShare,
    panelScoreLine,
    dominant,
    contrastPercent,
    globalBalance,
    strongestRelation,
    strongestRelationLabels,
  ])

  const showZoomPanel = Boolean(zoomedNode && panelFocus && panelParentDisposition)

  const renderEvidenceDisclosure = (items = []) => {
    const rows = items.filter(Boolean)
    if (!rows.length) return null
    return (
      <details className="cgd-evidence">
        <summary>Mostra evidenza</summary>
        <div className="cgd-evidence-body">
          <dl className="report-galaxy-evidence-list">
            {rows.map((row, index) => (
              <div key={`${row.label}-${index}`} className="report-galaxy-evidence-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>
    )
  }

  const renderSourceDisclosure = () => {
    const corpusRows = interpreterState.corpusBullets?.filter(Boolean) || []
    const theoryDescription = panelFocus?.type === 'sottocorrente' ? panelTheorySub?.description : ''
    if (!corpusRows.length && !theoryDescription) return null
    return (
      <details className="cgd-evidence">
        <summary>Mostra fonte</summary>
        <div className="cgd-source">
          {corpusRows.length ? (
            <div>
              <p className="report-galaxy-interpreter-corpus-title">{interpreterState.corpusCaption}</p>
              <ul className="report-galaxy-interpreter-corpus-list">
                {corpusRows.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {theoryDescription ? <p>{theoryDescription}</p> : null}
        </div>
      </details>
    )
  }

  const renderComputerinoPanel = ({ zoom = false } = {}) => {
    const isSub = panelFocus?.type === 'sottocorrente'
    return (
      <div className={`report-galaxy-card report-galaxy-card--node cgd-focus-panel ${zoom ? '' : 'cgd-focus-panel--standalone'}`}>
        {zoom && isSub ? (
          <button
            type="button"
            className="cgd-back"
            onClick={() => setPanelFocus({ type: 'corrente', dispositionId: zoomedNodeId })}
          >
            ← {panelParentDisposition?.label}
          </button>
        ) : null}
        <GalaxyInterpreterPanel state={interpreterState} />
        {renderEvidenceDisclosure(interpreterState.evidenceItems)}
        {renderSourceDisclosure()}
      </div>
    )
  }

  const renderStandaloneComputerinoPanel = () => renderComputerinoPanel()

  const renderZoomPanel = () => renderComputerinoPanel({ zoom: true })

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = mapWrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const starsC = document.createElement('canvas')

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      const cssW = rect && rect.width > 20 ? Math.round(rect.width) : 480
      const cssH = rect && rect.height > 20 ? Math.round(rect.height) : 380
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
      viewportRef.current = { w: cssW, h: cssH }
      dprRef.current = dpr
      canvas.style.width = `${cssW}px`
      canvas.style.height = `${cssH}px`
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
      starsC.width = canvas.width
      starsC.height = canvas.height
      const sc = starsC.getContext('2d')
      if (!sc) return
      sc.clearRect(0, 0, starsC.width, starsC.height)
      const starSeed = (starsC.width * 10007) ^ (starsC.height * 311)
      fillStarfield(sc, starsC.width, starsC.height, starSeed)
    }

    const updateCamT = (now) => {
      const { startMs, fromT, toT } = zoomAnimRef.current
      if (reducedMotion) {
        zoomAnimRef.current.t = toT
      } else {
        const u = Math.min(1, (now - startMs) / ZOOM_MS)
        const eased = easeOutCubic(u)
        zoomAnimRef.current.t = fromT + (toT - fromT) * eased
      }
      const sub = subZoomAnimRef.current
      if (reducedMotion) {
        sub.t = sub.toT
      } else {
        const u2 = Math.min(1, (now - sub.startMs) / ZOOM_MS)
        const eased2 = easeOutCubic(u2)
        sub.t = sub.fromT + (sub.toT - sub.fromT) * eased2
      }
    }

    const worldToScreen = (wx, wy, camT, focusWx, focusWy, cw, ch, extraScale = 1) => {
      const scale = (1 + (ZOOM_SCALE_MAX - 1) * camT) * extraScale
      const cx = cw / 2
      const cy = ch / 2
      return {
        sx: (wx - focusWx) * scale + cx,
        sy: (wy - focusWy) * scale + cy,
        scale,
      }
    }

    const draw = () => {
      const now = performance.now()
      const ms = reducedMotion ? 0 : now - startTimeRef.current
      lastFrameMsRef.current = ms
      updateCamT(now)
      const camT = zoomAnimRef.current.t

      const { w: cw, h: ch } = viewportRef.current
      const dpr = dprRef.current || 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const layoutS = Math.min(cw / 720, ch / 520)

      const worldById = buildResolvedWorldById(nodes, ms, layoutS, zoomedNodeId, camT)

      let targetFocusWx = 0
      let targetFocusWy = 0
      let targetExtraScale = 1
      const currentPanelFocus = panelFocusRef.current
      if (zoomedNodeId && worldById[zoomedNodeId]) {
        targetFocusWx = worldById[zoomedNodeId].wx
        targetFocusWy = worldById[zoomedNodeId].wy
        const subT = subZoomAnimRef.current.t
        if (subT > 0 && currentPanelFocus?.type === 'sottocorrente') {
          const subIdx = subDispositionStable.findIndex((s) => s.key === currentPanelFocus.rawKey)
          if (subIdx >= 0) {
            const nSat = subDispositionStable.length
            const angle = (subIdx / Math.max(1, nSat)) * Math.PI * 2 + ms * SATELLITE_ORBIT_SPEED
            const orbitR = layoutS * (SATELLITE_ORBIT_BASE + subIdx * SATELLITE_ORBIT_STEP)
            const subWx = targetFocusWx + Math.cos(angle) * orbitR
            const subWy = targetFocusWy + Math.sin(angle) * orbitR * 0.72
            targetFocusWx = targetFocusWx + (subWx - targetFocusWx) * subT
            targetFocusWy = targetFocusWy + (subWy - targetFocusWy) * subT
            targetExtraScale = 1 + (SUB_ZOOM_EXTRA_SCALE - 1) * subT
          }
        }
      }
      const smooth = cameraSmoothRef.current
      if (reducedMotion || !smooth.initialized) {
        smooth.initialized = true
        smooth.focusWx = targetFocusWx
        smooth.focusWy = targetFocusWy
        smooth.extraScale = targetExtraScale
      } else {
        const blend = zoomedNodeId ? 0.16 : 0.24
        smooth.focusWx += (targetFocusWx - smooth.focusWx) * blend
        smooth.focusWy += (targetFocusWy - smooth.focusWy) * blend
        smooth.extraScale += (targetExtraScale - smooth.extraScale) * blend
      }
      const focusWx = smooth.focusWx
      const focusWy = smooth.focusWy
      const extraScale = smooth.extraScale
      cameraStateRef.current = { focusWx, focusWy, extraScale }

      ctx.fillStyle = '#020817'
      ctx.fillRect(0, 0, cw, ch)
      ctx.drawImage(starsC, 0, 0, cw, ch)

      if (dominant?.colorHex) {
        const cx = cw / 2
        const cy = ch / 2
        const neb = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(cw, ch) * 0.55)
        const base = dominant.colorHex
        neb.addColorStop(0, base)
        neb.addColorStop(0.55, base)
        neb.addColorStop(1, base)
        ctx.save()
        ctx.globalAlpha = 0.04
        ctx.fillStyle = neb
        ctx.beginPath()
        ctx.ellipse(cx, cy, cw * 0.48, ch * 0.4, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      drawWindRoseBackdrop(ctx, cw, ch, ms, reducedMotion, windDots)

      if (!zoomedNodeId && !reducedMotion) {
        ctx.save()
        ctx.globalAlpha = 0.05
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 0.5
        nodes.forEach((node) => {
          const { wx, wy } = worldById[node.dispositionId]
          const { sx, sy } = worldToScreen(wx, wy, 0, 0, 0, cw, ch)
          const mx = cw / 2 + (sx - cw / 2) * 0.55
          const my = ch / 2 + (sy - ch / 2) * 0.55
          ctx.beginPath()
          ctx.moveTo(cw / 2, ch / 2)
          ctx.quadraticCurveTo(mx, my, sx, sy)
          ctx.stroke()
        })
        ctx.restore()
      }

      const project = (wx, wy) => worldToScreen(wx, wy, camT, focusWx, focusWy, cw, ch, extraScale)

      const hoveredRelationId = hoverRef.current?.kind === 'relation' ? hoverRef.current.relationId : null
      visibleRelations.forEach((relation, relIndex) => {
        const w1 = worldById[relation.fromDispositionId]
        const w2 = worldById[relation.toDispositionId]
        if (!w1 || !w2) return
        const from = project(w1.wx, w1.wy)
        const to = project(w2.wx, w2.wy)
        const id = `${relation.fromDispositionId}_${relation.toDispositionId}`
        const isSel = id === selectedRelationId || id === hoveredRelationId
        const visual = relationCurveVisual(relation.relationType, relation.relationScore, ms, isSel)
        const fromNode = nodeById[relation.fromDispositionId]
        const toNode = nodeById[relation.toDispositionId]
        const mx = (from.sx + to.sx) / 2
        const my = (from.sy + to.sy) / 2
        const dx = to.sx - from.sx
        const dy = to.sy - from.sy
        const len = Math.max(1, Math.hypot(dx, dy))
        const nx = -dy / len
        const ny = dx / len
        const phase = (ms * 0.0015 + relIndex) % (Math.PI * 2)
        const lift = visual.curve + Math.sin(phase) * 4
        const cx = mx + nx * lift
        const cy = my + ny * lift

        ctx.beginPath()
        ctx.moveTo(from.sx, from.sy + 2)
        ctx.quadraticCurveTo(cx, cy + 2, to.sx, to.sy + 2)
        ctx.strokeStyle = 'rgba(2,6,23,0.35)'
        ctx.lineWidth = visual.width + 1.1
        ctx.stroke()

        const lg = ctx.createLinearGradient(from.sx, from.sy, to.sx, to.sy)
        if (fromNode && toNode) {
          lg.addColorStop(0, fromNode.colorHex)
          lg.addColorStop(1, toNode.colorHex)
        } else {
          lg.addColorStop(0, '#94a3b8')
          lg.addColorStop(1, '#cbd5e1')
        }
        const relOp =
          0.12 + (relation.relationScore / 100) * 0.6
        ctx.beginPath()
        ctx.setLineDash(visual.dash)
        ctx.moveTo(from.sx, from.sy)
        ctx.quadraticCurveTo(cx, cy, to.sx, to.sy)
        ctx.strokeStyle = lg
        ctx.globalAlpha = relOp * (isSel ? 1.08 : 1)
        ctx.lineWidth = visual.width
        ctx.stroke()
        ctx.globalAlpha = 1
        ctx.setLineDash([])

        if (visual.flow) {
          const t = (Math.sin(ms * RELATION_FLOW_SPEED + relIndex) + 1) / 2
          const qx = (1 - t) * (1 - t) * from.sx + 2 * (1 - t) * t * cx + t * t * to.sx
          const qy = (1 - t) * (1 - t) * from.sy + 2 * (1 - t) * t * cy + t * t * to.sy
          ctx.beginPath()
          ctx.arc(qx, qy, 2.2 + (isSel ? 0.8 : 0), 0, Math.PI * 2)
          ctx.fillStyle = isSel ? 'rgba(248,250,252,0.92)' : `rgba(203,213,225,${0.35 + relOp * 0.4})`
          ctx.fill()
        }
      })

      const satHits = []

      nodes.forEach((node) => {
        const isSel = node.dispositionId === zoomedNodeId
        const { wx, wy } = worldById[node.dispositionId]
        const { sx, sy } = project(wx, wy)
        const radiusMul =
          zoomedNodeId && camT > 0
            ? isSel
              ? 1 + camT * 0.14
              : Math.max(OTHER_PLANETS_MIN_SCALE, 1 - camT * 0.55)
            : 1
        const fadeAlpha =
          zoomedNodeId && !isSel ? Math.max(OTHER_PLANETS_MIN_ALPHA, 1 - camT * 0.86) : 1
        const baseR = Math.max(6, node.sphereRadius * layoutS * radiusMul * 0.78)
        const glowPx = Math.max(8, node.glowRadius * layoutS * radiusMul)
        const peTint = applyGalaxyPeTint(node.colorHex, portatoRatios)

        ctx.save()
        ctx.globalAlpha = fadeAlpha
        const glow = ctx.createRadialGradient(sx, sy, Math.max(2, baseR * 0.1), sx, sy, baseR + glowPx)
        const go = node.glowOpacity * (portatoRatios.indifferenzaDominante ? 0.65 : 1)
        const a0 = Math.round(go * 255)
          .toString(16)
          .padStart(2, '0')
        const a1 = Math.round(go * 0.42 * 255)
          .toString(16)
          .padStart(2, '0')
        glow.addColorStop(0, `${node.colorHex}${a0}`)
        glow.addColorStop(0.55, `${node.colorHex}${a1}`)
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(sx, sy, baseR + glowPx, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(sx, sy, baseR, 0, Math.PI * 2)
        ctx.fillStyle = peTint.fillHex
        ctx.globalAlpha = peTint.fillAlpha * fadeAlpha
        ctx.fill()
        if (zoomedNodeId && !isSel) {
          ctx.beginPath()
          ctx.arc(sx, sy, baseR, 0, Math.PI * 2)
          ctx.fillStyle = '#020817'
          ctx.globalAlpha = OTHER_PLANETS_DARKEN_ALPHA * camT
          ctx.fill()
        }
        ctx.restore()

        if (zoomedNodeId === node.dispositionId && camT > 0.2 && !reducedMotion) {
          const cyc = (now % 1500) / 1500
          const ringScale = 1 + 0.3 * Math.sin(cyc * Math.PI * 2)
          const ringAlpha = (0.5 + 0.5 * Math.cos(cyc * Math.PI * 2)) * 0.85
          const ringR = baseR * ringScale
          ctx.beginPath()
          ctx.arc(sx, sy, ringR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(248,250,252,${ringAlpha})`
          ctx.lineWidth = 1.6
          ctx.stroke()
        }
      })

      if (zoomedNodeId && zoomedNode && camT > 0.35) {
        const cWorld = worldById[zoomedNode.dispositionId]
        const nSat = subDispositionStable.length
        const selectedSubKey = currentPanelFocus?.type === 'sottocorrente' ? currentPanelFocus.rawKey : null
        const satAppearT = easeOutCubic(clamp01((camT - 0.3) / 0.55))
        subDispositionStable.forEach((sub, index) => {
          const angle = (index / Math.max(1, nSat)) * Math.PI * 2 + ms * SATELLITE_ORBIT_SPEED
          const orbitR = layoutS * (SATELLITE_ORBIT_BASE + index * SATELLITE_ORBIT_STEP)
          const swx = cWorld.wx + Math.cos(angle) * orbitR
          const swy = cWorld.wy + Math.sin(angle) * orbitR * 0.72
          const pct = Math.min(1, (Number(sub.value) || 0) / Math.max(1, maxSubValue))
          const isSelectedSub = selectedSubKey === sub.key
          const baseSr = sub.value <= 0 ? SATELLITE_MIN_RADIUS : SATELLITE_MIN_RADIUS + pct * SATELLITE_RADIUS_GAIN
          const srTarget = isSelectedSub ? baseSr * SELECTED_SATELLITE_SCALE_BOOST : baseSr
          const sr = Math.max(4, srTarget * satAppearT)
          const p = clampSatelliteScreenPoint(project(swx, swy), sr, cw, ch)
          ctx.save()
          ctx.globalAlpha = 0.22 * satAppearT
          ctx.strokeStyle = '#94a3b8'
          ctx.lineWidth = 0.8
          ctx.beginPath()
          ctx.moveTo(project(cWorld.wx, cWorld.wy).sx, project(cWorld.wx, cWorld.wy).sy)
          ctx.lineTo(p.sx, p.sy)
          ctx.stroke()
          ctx.restore()
          const op = (sub.value <= 0 ? 0.2 : 0.3 + pct * 0.7) * satAppearT
          const fill = sub.meta?.colorHex || zoomedNode.colorHex
          ctx.save()
          ctx.globalAlpha = op * (portatoRatios.indifferenzaDominante ? 0.65 : 1)
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, sr, 0, Math.PI * 2)
          ctx.fillStyle = fill
          ctx.fill()
          ctx.globalAlpha = 0.9
          ctx.lineWidth = isSelectedSub ? 2.4 : 1.4
          ctx.strokeStyle = isSelectedSub ? 'rgba(255, 255, 255, 0.95)' : 'rgba(248, 250, 252, 0.78)'
          ctx.stroke()
          ctx.restore()
          if (isSelectedSub && !reducedMotion) {
            const cyc = (now % 1500) / 1500
            const ringScale = 1 + 0.32 * Math.sin(cyc * Math.PI * 2)
            const ringAlpha = (0.5 + 0.5 * Math.cos(cyc * Math.PI * 2)) * 0.85
            ctx.save()
            ctx.beginPath()
            ctx.arc(p.sx, p.sy, sr * ringScale + 4, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(248, 250, 252, ${ringAlpha})`
            ctx.lineWidth = 2
            ctx.stroke()
            ctx.restore()
          }
          const sdoc = getRawDocVisual(sub.key)
          if (sdoc) {
            drawGalaxyGlyph(ctx, sdoc.glyph, p.sx, p.sy, Math.max(5, sr * 1.05), sdoc.accentHex, ms, reducedMotion)
          }
          satHits.push({
            rawKey: sub.key,
            label: sub.label,
            sx: p.sx,
            sy: p.sy,
            r: sr + SATELLITE_HIT_PADDING + (isSelectedSub ? 6 : 0),
            value: sub.value,
            contributionPct: subDispositionMatrix.find((item) => item.key === sub.key)?.contributionPct || 0,
          })
        })
      }

      lastSatRef.current = satHits

      nodes.forEach((node) => {
        const isSel = node.dispositionId === zoomedNodeId
        const { wx, wy } = worldById[node.dispositionId]
        const { sx, sy } = project(wx, wy)
        const radiusMul =
          zoomedNodeId && camT > 0
            ? isSel
              ? 1 + camT * 0.14
              : Math.max(OTHER_PLANETS_MIN_SCALE, 1 - camT * 0.55)
            : 1
        const fadeAlpha =
          zoomedNodeId && !isSel ? Math.max(OTHER_PLANETS_MIN_ALPHA, 1 - camT * 0.86) : 1
        const baseR = Math.max(6, node.sphereRadius * layoutS * radiusMul)
        const rawKey = dominantRawKeyByDispositionId[node.dispositionId]
        const doc = rawKey ? getRawDocVisual(rawKey) : null
        if (doc) {
          ctx.save()
          ctx.globalAlpha = fadeAlpha
          drawGalaxyGlyph(ctx, doc.glyph, sx, sy - baseR * 0.58, Math.max(8, baseR * 0.48), doc.accentHex, ms, reducedMotion)
          ctx.restore()
        }
      })

      const h = hoverRef.current
      if (h && h.label && !h.suppressBubble) {
        drawHoverBubbleCanvas(ctx, h, cw, ch)
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    const maxSatSharePct = Math.max(...subDispositionMatrix.map((s) => s.contributionPct), 1)
    const allFamPcts = nodes.map((n) => {
      const raw = Number(totalsByKey?.[n.colorKey]) || 0
      const max = THEORETICAL_MAX_COLOR_TOTALS[n.colorKey] || 1
      return max > 0 ? Math.min(100, Math.round((raw / max) * 100)) : 0
    })
    const maxFamPct = Math.max(...allFamPcts, 1)

    const onCanvasMove = (ev) => {
      const rect = canvas.getBoundingClientRect()
      const sx = ev.clientX - rect.left
      const sy = ev.clientY - rect.top
      const ms = lastFrameMsRef.current
      const { w: cw, h: ch } = viewportRef.current
      const layoutS = Math.min(cw / 720, ch / 520)
      const camT = zoomAnimRef.current.t
      const worldById = buildResolvedWorldById(nodes, ms, layoutS, zoomedNodeId, camT)
      const { focusWx, focusWy, extraScale } = cameraStateRef.current
      let hit = null
      for (const s of lastSatRef.current) {
        if (Math.hypot(sx - s.sx, sy - s.sy) <= s.r) {
          const pct = s.contributionPct || 0
          const subTheory = getGalaxyTheoryForRawKey(s.rawKey)
          hit = {
            kind: 'satellite',
            label: subTheory?.title || s.label,
            sx: s.sx,
            sy: s.sy,
            r: s.r - 4,
            suppressBubble: false,
            detail1: `${pct}% nella corrente`,
            detail2: `Peso relativo ${relativeIntensityLabel(pct, maxSatSharePct).toLowerCase()}`,
            detail3: 'Clicca per aprire',
          }
          break
        }
      }
      if (!hit) {
        if (!zoomedNodeId) {
          for (const relation of visibleRelations) {
            const w1 = worldById[relation.fromDispositionId]
            const w2 = worldById[relation.toDispositionId]
            if (!w1 || !w2) continue
            const p1 = worldToScreen(w1.wx, w1.wy, camT, focusWx, focusWy, cw, ch)
            const p2 = worldToScreen(w2.wx, w2.wy, camT, focusWx, focusWy, cw, ch)
            const visual = relationCurveVisual(relation.relationType, relation.relationScore, ms, false)
            const mx = (p1.sx + p2.sx) / 2
            const my = (p1.sy + p2.sy) / 2
            const dx = p2.sx - p1.sx
            const dy = p2.sy - p1.sy
            const len = Math.max(1, Math.hypot(dx, dy))
            const nx = -dy / len
            const ny = dx / len
            const cx = mx + nx * visual.curve
            const cy = my + ny * visual.curve
            const d = Math.min(
              distPointSeg(sx, sy, p1.sx, p1.sy, cx, cy),
              distPointSeg(sx, sy, cx, cy, p2.sx, p2.sy),
            )
            if (d < 16) {
              const fromNode = nodeById[relation.fromDispositionId]
              const toNode = nodeById[relation.toDispositionId]
              hit = {
                kind: 'relation',
                relationId: `${relation.fromDispositionId}_${relation.toDispositionId}`,
                label: `${fromNode?.label || 'Corrente'} - ${toNode?.label || 'Corrente'}`,
                sx: (p1.sx + p2.sx) / 2,
                sy: (p1.sy + p2.sy) / 2,
                r: 10,
                detail1: relationPdfTooltipSentence(fromNode, toNode),
                detail2: `${relationTypeLabel(relation.relationType)} · forza ${relation.relationScore}%`,
                detail3: 'Clicca per fissare questo confronto',
              }
              break
            }
          }
        }
      }
      if (!hit) {
        for (const node of nodes) {
          const isSel = node.dispositionId === zoomedNodeId
          const { wx, wy } = worldById[node.dispositionId]
          const scale = (1 + (ZOOM_SCALE_MAX - 1) * camT) * extraScale
          const psx = (wx - focusWx) * scale + cw / 2
          const psy = (wy - focusWy) * scale + ch / 2
          const radiusMul =
            zoomedNodeId && camT > 0
              ? isSel
                ? 1 + camT * 0.14
                : Math.max(OTHER_PLANETS_MIN_SCALE, 1 - camT * 0.55)
              : 1
          const baseR = Math.max(6, node.sphereRadius * layoutS * radiusMul * 0.78)
          if (Math.hypot(sx - psx, sy - psy) <= baseR + 10) {
            const famRaw = Number(totalsByKey?.[node.colorKey]) || 0
            const famMax = THEORETICAL_MAX_COLOR_TOTALS[node.colorKey] || 1
            const famPct = famMax > 0 ? Math.min(100, Math.round((famRaw / famMax) * 100)) : 0
            const isDom = dominant?.dispositionId === node.dispositionId
            const tier = relativeIntensityLabel(famPct, maxFamPct).toLowerCase()
            const absoluteTier = intensityLabel(famPct).toLowerCase()
            hit = {
              kind: 'corrente',
              label: node.label,
              sx: psx,
              sy: psy,
              r: baseR,
              detail1: `${famPct}%`,
              detail2: isDom
                ? `Rilevanza locale ${tier}, dominante · assoluta ${absoluteTier} (${famPct}%)`
                : `Rilevanza locale ${tier} · assoluta ${absoluteTier} (${famPct}%)`,
              detail3: 'Clicca per aprire',
            }
            break
          }
        }
      }
      hoverRef.current = hit
      canvas.style.cursor = hit ? 'pointer' : 'default'
    }

    const onCanvasLeave = () => {
      hoverRef.current = null
      canvas.style.cursor = 'default'
    }

    const onCanvasPointerDown = (ev) => {
      const rect = canvas.getBoundingClientRect()
      const sx = ev.clientX - rect.left
      const sy = ev.clientY - rect.top
      const ms = lastFrameMsRef.current
      const { w: cw, h: ch } = viewportRef.current
      const layoutS = Math.min(cw / 720, ch / 520)
      const camT = zoomAnimRef.current.t
      const worldById = buildResolvedWorldById(nodes, ms, layoutS, zoomedNodeId, camT)
      const { focusWx, focusWy, extraScale } = cameraStateRef.current

      for (const s of lastSatRef.current) {
        if (Math.hypot(sx - s.sx, sy - s.sy) <= s.r) {
          setHudTipVisible(false)
          setPanelFocus({ type: 'sottocorrente', rawKey: s.rawKey })
          ev.stopPropagation()
          return
        }
      }

      for (const node of nodes) {
        const isSel = node.dispositionId === zoomedNodeId
        const { wx, wy } = worldById[node.dispositionId]
        const scale = (1 + (ZOOM_SCALE_MAX - 1) * camT) * extraScale
        const psx = (wx - focusWx) * scale + cw / 2
        const psy = (wy - focusWy) * scale + ch / 2
        const radiusMul =
          zoomedNodeId && camT > 0
            ? isSel
              ? 1 + camT * 0.14
              : Math.max(OTHER_PLANETS_MIN_SCALE, 1 - camT * 0.55)
            : 1
        const baseR = Math.max(6, node.sphereRadius * layoutS * radiusMul * 0.78)
        if (Math.hypot(sx - psx, sy - psy) <= baseR + 12) {
          setHudTipVisible(false)
          enterCorrente(node.dispositionId)
          ev.stopPropagation()
          return
        }
      }

      if (!zoomedNodeId) {
        for (const relation of visibleRelations) {
          const w1 = worldById[relation.fromDispositionId]
          const w2 = worldById[relation.toDispositionId]
          if (!w1 || !w2) continue
          const p1 = worldToScreen(w1.wx, w1.wy, camT, focusWx, focusWy, cw, ch)
          const p2 = worldToScreen(w2.wx, w2.wy, camT, focusWx, focusWy, cw, ch)
          const visual = relationCurveVisual(relation.relationType, relation.relationScore, ms, false)
          const mx = (p1.sx + p2.sx) / 2
          const my = (p1.sy + p2.sy) / 2
          const dx = p2.sx - p1.sx
          const dy = p2.sy - p1.sy
          const len = Math.max(1, Math.hypot(dx, dy))
          const nx = -dy / len
          const ny = dx / len
          const lift = visual.curve
          const cx = mx + nx * lift
          const cy = my + ny * lift
          const d = Math.min(
            distPointSeg(sx, sy, p1.sx, p1.sy, cx, cy),
            distPointSeg(sx, sy, cx, cy, p2.sx, p2.sy),
          )
          if (d < 14) {
            setHudTipVisible(false)
            setSelectedRelationId(`${relation.fromDispositionId}_${relation.toDispositionId}`)
            ev.stopPropagation()
            return
          }
        }
      }

      if (zoomedNodeId) {
        if (panelFocusRef.current?.type === 'sottocorrente') {
          setPanelFocus({ type: 'corrente', dispositionId: zoomedNodeId })
        } else {
          backToGalaxy()
        }
        ev.stopPropagation()
      }
    }

    resize()
    startTimeRef.current = Date.now()
    animFrameRef.current = requestAnimationFrame(draw)
    window.addEventListener('resize', resize)
    canvas.addEventListener('pointermove', onCanvasMove)
    canvas.addEventListener('pointerleave', onCanvasLeave)
    canvas.addEventListener('pointerdown', onCanvasPointerDown)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onCanvasMove)
      canvas.removeEventListener('pointerleave', onCanvasLeave)
      canvas.removeEventListener('pointerdown', onCanvasPointerDown)
    }
  }, [
    nodes,
    visibleRelations,
    zoomedNodeId,
    selectedRelationId,
    subDispositionStable,
    subDispositionMatrix,
    maxSubValue,
    zoomedNode,
    reducedMotion,
    windDots,
    dominantRawKeyByDispositionId,
    dominant,
    totalsByKey,
    portatoRatios,
    nodeById,
    enterCorrente,
    backToGalaxy,
  ])

  return (
    <section
      id="report-galassia"
      ref={sectionRef}
      className="report-galaxy report-xp-section"
      aria-labelledby="report-galaxy-title"
    >
      <div className="report-xp-section-shell">
        <div className="report-xp-block report-xp-block--result report-galaxy-shell">
          <h2 id="report-galaxy-title" className="report-section-title">
            Galassia degli affetti
          </h2>
          <div
            className={`report-galaxy-layout ${reducedMotion ? 'is-reduced-motion' : ''} ${
              showZoomPanel ? 'is-zoomed' : ''
            }`}
          >
        <div className="report-galaxy-map-wrap" ref={mapWrapRef}>
          {!zoomedNodeId && (
            <div className="report-galaxy-mini-legend" role="list" aria-label="Legenda correnti">
              {nodes.map((node) => (
                <span key={node.dispositionId} role="listitem" className="report-galaxy-legend-item">
                  <span style={{ background: node.colorHex }} aria-hidden />
                  {node.label}
                </span>
              ))}
            </div>
          )}
          <div className="report-galaxy-map report-galaxy-map--canvasHit" aria-label="Mappa galassia 3D delle correnti">
            <canvas ref={canvasRef} className="report-galaxy-canvas" />
            {hudTipVisible && (
              <div className="report-galaxy-hud report-galaxy-hud--top">
                <p>
                  {(() => {
                    const full =
                      panelFocus?.type === 'sottocorrente'
                        ? 'Focus locale: cambia satellite per confrontare una sfumatura vicina.'
                        : zoomedNodeId
                          ? 'Dentro una corrente: scegli un satellite per leggere la sua composizione.'
                          : 'Prova una linea: mostra un confronto grafico tra due famiglie sulle basi di questo report (non dal testo STATI D’ANIMO IN 4 FAMIGLIE).'
                    const { lead, body } = galaxyHudLeadBody(full)
                    return body ? (
                      <>
                        <strong className="report-galaxy-hud-em">{lead}</strong>{' '}
                        {body}
                      </>
                    ) : (
                      full
                    )
                  })()}
                </p>
                <button
                  type="button"
                  className="report-galaxy-hud-dismiss"
                  aria-label="Nascondi suggerimento"
                  onClick={() => setHudTipVisible(false)}
                >
                  ×
                </button>
              </div>
            )}
            {!zoomedNodeId ? (
              <div className="report-galaxy-hud report-galaxy-hud--status report-galaxy-hud--interpreter">
                {renderStandaloneComputerinoPanel()}
              </div>
            ) : null}
            <div className="report-galaxy-hud report-galaxy-hud--bottom">
              {zoomedNodeId && (
                <button type="button" className="report-galaxy-reset report-galaxy-reset--primary" onClick={backToGalaxy}>
                  Zoom out
                </button>
              )}
            </div>

          </div>
        </div>

        <aside
          className={`report-galaxy-side-monitor ${showZoomPanel ? 'report-galaxy-side-monitor--with-panel' : ''}`}
          aria-live="polite"
          aria-label="Monitor spiegazioni galassia"
        >
          <div className="report-galaxy-side-monitor-screen">
            <div className="report-galaxy-side-monitor-headline">
              <div className="report-galaxy-side-monitor-dots" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <p className="report-galaxy-side-monitor-kicker">Computerino</p>
            </div>
            <div className="report-galaxy-side-monitor-content">
              {showZoomPanel ? (
                <div className="report-galaxy-side-monitor-panel">{renderZoomPanel()}</div>
              ) : (
                <div className="report-galaxy-side-monitor-status">
                  {renderStandaloneComputerinoPanel()}
                </div>
              )}
            </div>
            <div className="report-galaxy-side-monitor-scanline" aria-hidden />
          </div>
          <div className="report-galaxy-side-monitor-hinge" aria-hidden />
          <div className="report-galaxy-side-monitor-keyboard" aria-hidden>
            <span />
          </div>
        </aside>

        {showZoomPanel ? (
          <div className="report-galaxy-ui report-galaxy-ui--dock" aria-live="polite">
            {renderZoomPanel()}
          </div>
        ) : null}

          </div>
        </div>
      </div>

    </section>
  )
}
