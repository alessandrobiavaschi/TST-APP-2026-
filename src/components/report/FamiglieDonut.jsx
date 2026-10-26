import React, { useMemo, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import './FamiglieDonut.css'

/**
 * FamiglieDonut — le cinque famiglie come fette di un intero.
 * Dati: la stessa Presenza (distributionPercent) del radar, nessun nuovo calcolo.
 * Due varianti: ciambella (con la prevalente al centro) e torta.
 */

const FAMILY_COLOR = Object.fromEntries(Object.values(FAMILY_THEME).map((t) => [t.key, t.dot]))
const FALLBACK = '#94a3b8'
const fmt = (n) => `${Number(n).toLocaleString('it-IT', { maximumFractionDigits: 1 })}%`

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="famiglie-donut__tooltip">
      <span className="famiglie-donut__tooltip-dot" style={{ background: d.color }} aria-hidden="true" />
      <span>{d.name}</span>
      <strong>{fmt(d.value)}</strong>
    </div>
  )
}

export default function FamiglieDonut({
  data = [],
  activeFamilyKey = null,
  onFamilySelect,
  onFamilyHover,
  initialVariant = 'pie',
  showCaption = true,
}) {
  const [variant, setVariant] = useState(initialVariant)
  const prefersReducedMotion = useReducedMotion()

  const slices = useMemo(
    () =>
      data
        .map((d) => ({
          key: d.familyKey,
          name: d.familyLabel || d.corrente,
          value: Number(d.distributionPercent) || 0,
          color: FAMILY_COLOR[d.familyKey] || FALLBACK,
          item: d,
        }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value),
    [data],
  )

  if (!slices.length) return null
  const lead = slices[0]
  const focus = slices.find((s) => s.key === activeFamilyKey) || lead
  const isDonut = variant === 'donut'

  return (
    <figure className="famiglie-donut" aria-label="Distribuzione delle cinque famiglie emotive">
      <div className="famiglie-donut__head">
        {showCaption ? (
          <figcaption className="famiglie-donut__caption">
            Quanto pesa ogni famiglia sul totale delle tue risposte.
          </figcaption>
        ) : <span />}
        <div className="famiglie-donut__toggle" role="group" aria-label="Tipo di grafico">
          {[['pie', 'Torta'], ['donut', 'Ciambella']].map(([v, label]) => (
            <button
              key={v}
              type="button"
              aria-pressed={variant === v}
              className={variant === v ? 'is-active' : ''}
              onClick={() => setVariant(v)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="famiglie-donut__body">
        <div className="famiglie-donut__chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="value"
                nameKey="name"
                innerRadius={isDonut ? '62%' : 0}
                outerRadius="92%"
                startAngle={90}
                endAngle={-270}
                paddingAngle={isDonut ? 2 : 0}
                stroke="rgba(10, 12, 20, 0.9)"
                strokeWidth={isDonut ? 0 : 1.5}
                isAnimationActive={!prefersReducedMotion}
                onMouseEnter={(s) => onFamilyHover?.(s?.key ?? null)}
                onMouseLeave={() => onFamilyHover?.(null)}
                onClick={(s) => s?.item && onFamilySelect?.(s.key)}
              >
                {slices.map((s) => (
                  <Cell
                    key={s.key}
                    fill={s.color}
                    fillOpacity={!activeFamilyKey || s.key === activeFamilyKey ? 1 : 0.35}
                    style={{ cursor: onFamilySelect ? 'pointer' : 'default', outline: 'none' }}
                  />
                ))}
              </Pie>
              {!isDonut && <Tooltip content={<DonutTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
          {isDonut && (
            <div className="famiglie-donut__center" aria-hidden="true">
              <span className="famiglie-donut__center-value">{fmt(focus.value)}</span>
              <span className="famiglie-donut__center-name" style={{ color: focus.color }}>{focus.name}</span>
            </div>
          )}
        </div>

        <ul className="famiglie-donut__legend" aria-label="Quota di ogni famiglia">
          {slices.map((s) => (
            <li key={s.key} className={s.key === activeFamilyKey ? 'is-active' : ''}>
              <button
                type="button"
                onClick={() => onFamilySelect?.(s.key)}
                onMouseEnter={() => onFamilyHover?.(s.key)}
                onMouseLeave={() => onFamilyHover?.(null)}
                onFocus={() => onFamilyHover?.(s.key)}
                onBlur={() => onFamilyHover?.(null)}
              >
                <span className="famiglie-donut__dot" style={{ background: s.color }} aria-hidden="true" />
                <span>{s.name}</span>
                <span className="famiglie-donut__value">{fmt(s.value)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
