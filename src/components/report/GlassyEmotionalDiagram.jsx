import React, { useId } from 'react'
import { motion } from 'framer-motion'

const FAMIGLIE = [
  { subject: 'Malinconia', key: 'blu', color: '#3b82f6' },
  { subject: 'Volitività', key: 'rosso', color: '#ef4444' },
  { subject: 'Entusiasmo', key: 'giallo', color: '#eab308' },
  { subject: 'Calma', key: 'verde', color: '#22c55e' },
  { subject: 'Anaffettività', key: 'grigio', color: '#6b7280' },
]

const SEGMENTS = 5
const ANGLE_START = -90 // top = 12 o'clock
const ANGLE_STEP = 360 / SEGMENTS

function polarToCart(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx, cy, r, startDeg, endDeg) {
  const start = polarToCart(cx, cy, r, endDeg)
  const end = polarToCart(cx, cy, r, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${end.x} ${end.y} A ${r} ${r} 0 ${large} 1 ${start.x} ${start.y} Z`
}

export default function GlassyEmotionalDiagram({ levels, size = 280 }) {
  const gradientPrefix = useId().replace(/:/g, '')
  const viewSize = 120
  const cx = viewSize / 2
  const cy = viewSize / 2
  const R = 46

  const segments = FAMIGLIE.map((f, i) => {
    const level = Math.max(1, Math.min(7, levels[f.key] ?? 1))
    const radius = (level / 7) * R
    const startDeg = ANGLE_START + i * ANGLE_STEP
    const endDeg = ANGLE_START + (i + 1) * ANGLE_STEP
    return {
      ...f,
      level,
      path: wedgePath(0, 0, radius, startDeg, endDeg),
      startDeg,
      endDeg,
    }
  })

  return (
    <motion.div
      className="glassy-diagram"
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      role="img"
      aria-label="Profilo emotivo: livelli per le 5 famiglie con effetto vitreo"
    >
      <div className="glassy-diagram-inner">
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          width={size}
          height={size}
          className="glassy-diagram-svg"
        >
          <defs>
            <filter id={`${gradientPrefix}-glass-blur`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur" />
              <feColorMatrix in="blur" type="saturate" values="0.3" result="dim" />
            </filter>
            {segments.map((s) => (
              <linearGradient
                key={s.key}
                id={`${gradientPrefix}-seg-${s.key}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.55} />
                <stop offset="60%" stopColor={s.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.65} />
              </linearGradient>
            ))}
            <linearGradient
              id={`${gradientPrefix}-glass-highlight`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#fff" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <g transform={`translate(${cx}, ${cy})`}>
            {segments.map((s, i) => (
              <motion.path
                key={s.key}
                d={s.path}
                fill={`url(#${gradientPrefix}-seg-${s.key})`}
                className="glassy-diagram-segment"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.06 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
            {/* Glass overlay ellipse at center */}
            <motion.circle
              r={R}
              fill={`url(#${gradientPrefix}-glass-highlight)`}
              className="glassy-diagram-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            />
            {/* Segment borders (soft) */}
            {segments.map((s) => {
              const mid = (s.startDeg + s.endDeg) / 2
              const p = polarToCart(0, 0, R, mid)
              return (
                <line
                  key={`line-${s.key}`}
                  x1={0}
                  y1={0}
                  x2={p.x}
                  y2={p.y}
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={0.8}
                  strokeOpacity={0.9}
                />
              )
            })}
            <circle cx={0} cy={0} r={R} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={1.2} />
            <circle cx={0} cy={0} r={8} fill="rgba(255,255,255,0.4)" className="glassy-diagram-core" />
          </g>
        </svg>
      </div>
    </motion.div>
  )
}

export { FAMIGLIE as GLASSY_FAMIGLIE }
