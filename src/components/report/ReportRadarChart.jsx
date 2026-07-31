import React from 'react'
import { useReducedMotion } from 'framer-motion'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
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

function RadarTooltipContent({ active, payload, domain }) {
  if (!active || !payload || !payload.length) return null
  const item = payload[0]?.payload
  if (!item) return null
  const maxScale = Array.isArray(domain) ? domain[1] : null
  return (
    <div className="report-radar-chart__tooltip">
      <span className="report-radar-chart__tooltip-name">{item.corrente}</span>
      <span className="report-radar-chart__tooltip-value">
        {item.valore}{maxScale ? ` / ${maxScale}` : ''}
      </span>
    </div>
  )
}

/** Tick assi radar — sans-serif, dimensione e contrasto aumentati. */
export function ReportRadarAxisTick({ x, y, payload, textAnchor, cx, cy }) {
  let nudgedX = x
  let nudgedY = y

  if (typeof cx === 'number' && typeof cy === 'number') {
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist > 0) {
      const nudgeAmount = 12
      nudgedX = x + (dx / dist) * nudgeAmount
      nudgedY = y + (dy / dist) * nudgeAmount
    }
  }

  return (
    <text
      x={nudgedX}
      y={nudgedY}
      textAnchor={textAnchor}
      fill="#e2e8f0"
      fontSize={13}
      fontFamily="'Public Sans', system-ui, -apple-system, sans-serif"
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
  onFamilySelect = null,
}) {
  const reduceMotion = useReducedMotion()
  const strokeColor = color || FALLBACK_COLOR
  const radarData = data.map((d) => ({
    corrente: d.corrente,
    valore: typeof d.valore === 'number' ? d.valore : 0,
    familyKey: d.familyKey,
    familyLabel: d.familyLabel,
    rawValue: d.rawValue,
    distributionPercent: d.distributionPercent,
  }))

  if (!radarData.length) return null

  const handleChartClick = (state) => {
    if (state && typeof state.activeTooltipIndex === 'number' && onFamilySelect) {
      const clickedData = radarData[state.activeTooltipIndex]
      if (clickedData?.familyKey) {
        onFamilySelect(clickedData.familyKey)
      }
    }
  }

  return (
    <div
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', minHeight: height, cursor: onFamilySelect ? 'pointer' : 'default' }}
    >
      {scaleLabel ? (
        <p className="report-radar-chart__scale" aria-hidden="true">
          {scaleLabel}
        </p>
      ) : null}
      <ResponsiveContainer width="100%" height={height} debounce={100}>
        <RadarChart
          data={radarData}
          outerRadius={outerRadius}
          cx="50%"
          cy="50%"
          margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
          onClick={handleChartClick}
        >
          <PolarGrid stroke="#334155" strokeOpacity={0.5} />
          <PolarAngleAxis dataKey="corrente" tick={<ReportRadarAxisTick />} />
          <Tooltip content={<RadarTooltipContent domain={domain} />} />
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
            stroke={hexToRgba(strokeColor, 0.9)}
            strokeWidth={2.5}
            fill={strokeColor}
            fillOpacity={0.15}
            dot={{ r: 5, fill: strokeColor, stroke: strokeColor }}
            isAnimationActive={!reduceMotion}
            animationDuration={400}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
