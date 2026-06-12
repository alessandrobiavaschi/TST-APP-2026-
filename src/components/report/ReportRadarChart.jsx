import React from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'

const FALLBACK_COLOR = '#94a3b8'

function hexToRgba(hex, alpha) {
  if (typeof hex !== 'string') return `rgba(148, 163, 184, ${alpha})`
  let h = hex.replace('#', '').trim()
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  if (h.length !== 6) return `rgba(148, 163, 184, ${alpha})`
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) {
    return `rgba(148, 163, 184, ${alpha})`
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Tick assi radar (monospace 11px #94a3b8) — stile QuattroRapporti. */
export function ReportRadarAxisTick({ x, y, payload, textAnchor }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#94a3b8"
      fontSize={11}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
      dominantBaseline="central"
    >
      {payload?.value}
    </text>
  )
}

/**
 * Radar condiviso per report TST (Sintesi, Quattro rapporti).
 *
 * @param {Array<{ corrente: string, valore: number }>} data
 * @param {string} color — hex corrente dominante / accento
 * @param {number} [height=280]
 * @param {string} [outerRadius='72%']
 * @param {string} [className]
 * @param {string} [ariaLabel]
 * @param {string} [scaleLabel] — didascalia unità (es. "Attivazione %")
 * @param {[number, number]} [domain] — dominio assi radiali
 */
export default function ReportRadarChart({
  data = [],
  color = FALLBACK_COLOR,
  height = 280,
  outerRadius = '72%',
  className = '',
  ariaLabel = 'Grafico radar delle cinque correnti emotive',
  scaleLabel = '',
  domain = null,
}) {
  const reduceMotion = useReducedMotion()
  const strokeColor = color || FALLBACK_COLOR
  const radarData = data.map((d) => ({
    corrente: d.corrente,
    valore: typeof d.valore === 'number' ? d.valore : 0,
  }))

  if (!radarData.length) return null

  return (
    <div
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', minHeight: height }}
    >
      {scaleLabel ? (
        <p className="report-radar-chart__scale" aria-hidden="true">
          {scaleLabel}
        </p>
      ) : null}
      <ResponsiveContainer width="100%" height={height} debounce={100}>
        <RadarChart data={radarData} outerRadius={outerRadius}>
          <PolarGrid stroke="#334155" strokeOpacity={0.5} />
          <PolarAngleAxis dataKey="corrente" tick={<ReportRadarAxisTick />} />
          {domain ? (
            <PolarRadiusAxis
              angle={90}
              domain={domain}
              tick={{ fill: '#64748b', fontSize: 10 }}
              axisLine={false}
            />
          ) : null}
          <Radar
            dataKey="valore"
            stroke={hexToRgba(strokeColor, 0.8)}
            strokeWidth={2}
            fill={strokeColor}
            fillOpacity={0.3}
            dot={{ r: 6, fill: strokeColor, stroke: strokeColor }}
            isAnimationActive={!reduceMotion}
            animationDuration={400}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
