import React from 'react'
import { motion } from 'framer-motion'

void motion

/** 5 famiglie emotive: settori radiali con poligoni irregolari. */
const DISPOSIZIONI = [
  { label: 'Malinconica', key: 'blu', color: '#60a5fa', sectorIndex: 0 },
  { label: 'Marziale', key: 'rosso', color: '#f87171', sectorIndex: 1 },
  { label: 'Entusiasta', key: 'giallo', color: '#fde047', sectorIndex: 2 },
  { label: 'Flemmatica', key: 'verde', color: '#4ade80', sectorIndex: 3 },
  { label: 'Razionale', key: 'grigio', color: '#9ca3af', sectorIndex: 4 },
]
const SECTOR_COUNT = 5
const DEG_PER_SECTOR = 360 / SECTOR_COUNT

const VIEW_SIZE = 200
const CX = VIEW_SIZE / 2
const CY = VIEW_SIZE / 2
const AXIS_EXTENT = 92
const MIN_EXTENT_RATIO = 0.18
const MARKER_R = 3
const MARKER_COUNT = 5

const VERTICES_PER_SECTOR = 10

/** Wobble più marcato per poligoni irregolari (reference: bordi non perfettamente curvi). */
function wobble(angleDeg, sectorIndex) {
  const rad = (angleDeg * Math.PI) / 180
  const phase = sectorIndex * 1.3
  return 0.14 * Math.sin(rad * 2 + phase) + 0.1 * Math.cos(rad * 3) + 0.06 * Math.sin(rad * 5)
}

/** Angoli in gradi (0=destra, 90=giù, 270=su). Settore 0 = Malinconia in alto, poi senso orario. */
function getSectorAngles(sectorIndex) {
  const mid = 270 - sectorIndex * DEG_PER_SECTOR
  const half = DEG_PER_SECTOR / 2
  return { start: mid - half, end: mid + half }
}

/** Vertici irregolari sul bordo del settore (wobble forte = forma organica come reference). */
function getIrregularVertices(sectorIndex, extent) {
  const { start, end } = getSectorAngles(sectorIndex)
  const points = []
  for (let i = 0; i <= VERTICES_PER_SECTOR; i++) {
    const t = i / VERTICES_PER_SECTOR
    const angleDeg = start + t * (end - start)
    const r = extent * (1 + wobble(angleDeg, sectorIndex))
    const rad = (angleDeg * Math.PI) / 180
    points.push({
      x: CX + r * Math.cos(rad),
      y: CY + r * Math.sin(rad),
    })
  }
  return points
}

/** Extent effettivo per quadrante: da levels[key] 1-7, con minimo per visibilità (UX). */
function getExtent(levels, key) {
  const level = Math.max(1, Math.min(7, Number(levels?.[key]) || 1))
  const raw = (level / 7) * AXIS_EXTENT
  return Math.max(MIN_EXTENT_RATIO * AXIS_EXTENT, raw)
}

/** Path a poligono irregolare (segmenti L) come nella reference: bordi visibili, non smooth. */
function getSectorPath(sectorIndex, extent) {
  const vertices = getIrregularVertices(sectorIndex, extent)
  const c = CX
  const d = CY
  const n = vertices.length
  if (n < 2) return `M ${c} ${d} Z`
  const parts = [`M ${c} ${d}`, `L ${vertices[0].x} ${vertices[0].y}`]
  for (let i = 1; i < n; i++) parts.push(`L ${vertices[i].x} ${vertices[i].y}`)
  parts.push('Z')
  return parts.join(' ')
}

/** Posizione etichetta spostata verso l'esterno, come nella reference annotata. */
function getLabelPosition(sectorIndex) {
  const midDeg = 270 - sectorIndex * DEG_PER_SECTOR
  const rad = (midDeg * Math.PI) / 180

  // Raggio base per tutte le etichette (leggermente oltre la fine degli assi)
  const baseDist = AXIS_EXTENT + 16

  // Piccole correzioni manuali per allineare alle posizioni desiderate
  const perSectorOffset = {
    0: { dx: -10, dy: 18 }, // Malinconia in basso-sinistra
    1: { dx: 0, dy: 20 }, // Volitività in basso
    2: { dx: 12, dy: -8 }, // Entusiasmo in alto-destra
    3: { dx: -8, dy: -12 }, // Calma in alto-sinistra
    4: { dx: -16, dy: 0 }, // Anaffettività a sinistra
  }[sectorIndex] ?? { dx: 0, dy: 0 }

  const x = CX + baseDist * Math.cos(rad) + perSectorOffset.dx
  const y = CY + baseDist * Math.sin(rad) + perSectorOffset.dy

  return { x, y }
}

export default function CompassEmotionalDiagram({ levels, size = 280 }) {
  return (
    <motion.div
      className="compass-diagram"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label="Profilo 5 disposizioni: Malinconia, Volitività, Entusiasmo, Calma, Anaffettività; livelli 1-7"
    >
      <div className="compass-diagram-inner">
        <svg
          viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
          width={size}
          height={size}
          className="compass-diagram-svg"
        >
          <defs>
            <filter id="compass-soft" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
            </filter>
            {DISPOSIZIONI.map((q) => {
              const extent = getExtent(levels, q.key)
              const midDeg = 270 - q.sectorIndex * DEG_PER_SECTOR
              const rad = (midDeg * Math.PI) / 180
              const gdist = extent * 0.6
              const gx = CX + gdist * Math.cos(rad)
              const gy = CY + gdist * Math.sin(rad)
              return (
                <radialGradient
                  key={q.key}
                  id={`compass-grad-${q.key}`}
                  gradientUnits="userSpaceOnUse"
                  cx={gx}
                  cy={gy}
                  r={extent * 1.2}
                >
                  <stop offset="0%" stopColor={q.color} stopOpacity={0.98} />
                  <stop offset="70%" stopColor={q.color} stopOpacity={0.85} />
                  <stop offset="100%" stopColor={q.color} stopOpacity={0.75} />
                </radialGradient>
              )
            })}
          </defs>

          {/* 5 settori a poligoni irregolari (blur leggero); extent da levels */}
          <g className="compass-quadrants" filter="url(#compass-soft)">
            {DISPOSIZIONI.map((q, i) => {
              const extent = getExtent(levels, q.key)
              const level = Math.max(1, Math.min(7, Number(levels?.[q.key]) || 1))
              return (
                <motion.path
                  key={q.key}
                  d={getSectorPath(q.sectorIndex, extent)}
                  fill={`url(#compass-grad-${q.key})`}
                  className="compass-quadrant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.04 * i, duration: 0.35 }}
                  title={`${q.label}: livello ${level}/7`}
                />
              )
            })}
          </g>

          {/* 5 assi radiali (uno per disposizione) */}
          <g className="compass-axes" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5">
            {DISPOSIZIONI.map((_, i) => {
              const midDeg = 270 - i * DEG_PER_SECTOR
              const rad = (midDeg * Math.PI) / 180
              const x2 = CX + AXIS_EXTENT * Math.cos(rad)
              const y2 = CY + AXIS_EXTENT * Math.sin(rad)
              return <line key={i} x1={CX} y1={CY} x2={x2} y2={y2} />
            })}
          </g>

          {/* Marcatori sugli assi (pallini bianchi) */}
          <g className="compass-markers" fill="rgba(255,255,255,0.95)">
            {DISPOSIZIONI.map((_, si) => {
              const midDeg = 270 - si * DEG_PER_SECTOR
              const rad = (midDeg * Math.PI) / 180
              return Array.from({ length: MARKER_COUNT }).map((_, i) => {
                const t = (i + 1) / (MARKER_COUNT + 1)
                const r = t * AXIS_EXTENT
                return (
                  <circle
                    key={`${si}-${i}`}
                    cx={CX + r * Math.cos(rad)}
                    cy={CY + r * Math.sin(rad)}
                    r={MARKER_R}
                  />
                )
              })
            })}
          </g>

          {/* Etichette nelle 5 disposizioni con livello numerico */}
          <g className="compass-labels">
            {DISPOSIZIONI.map((q) => {
              const level = Math.max(1, Math.min(7, Number(levels?.[q.key]) || 1))
              const pos = getLabelPosition(q.sectorIndex)
              return (
                <text
                  key={q.key}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={12}
                  fontWeight={700}
                  className="compass-label"
                >
                  {q.label} {level}/7
                </text>
              )
            })}
          </g>
        </svg>
      </div>
    </motion.div>
  )
}
