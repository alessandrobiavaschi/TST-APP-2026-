import React, { useId } from 'react'

/**
 * Ruota delle correnti temperamentali (ispirata alla ruota delle emozioni).
 * 5 settori radiali distinti, senza sovrapposizione: ogni corrente è un "raggio"
 * con lunghezza proporzionale allo score (livello 1–7) e colore per natura.
 * Leggibile e immediato; lo sfondo è allineato al radar (surface-subtle).
 */

const NATURE_KEYS = ['blu', 'rosso', 'verde', 'giallo', 'grigio']
const NATURE_LABELS = {
  blu: 'Malinconia (Blu)',
  rosso: 'Volitività (Rosso)',
  verde: 'Calma (Verde)',
  giallo: 'Entusiasmo (Giallo)',
  grigio: 'Anaffettività (Grigio)',
}

const BASE_COLORS = {
  blu: '#3b82f6',
  rosso: '#ef4444',
  verde: '#22c55e',
  giallo: '#eab308',
  grigio: '#6b7280',
}

const SHADES = {
  blu: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
  rosso: ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
  verde: ['#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
  giallo: ['#fef9c3', '#fef08a', '#fde047', '#facc15', '#eab308', '#ca8a04', '#a16207'],
  grigio: ['#f3f4f6', '#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#4b5563', '#374151'],
}

function getShade(key, level) {
  const arr = SHADES[key]
  if (!arr) return BASE_COLORS[key] || '#94a3b8'
  const index = Math.min(7, Math.max(1, Math.round(level))) - 1
  return arr[index]
}

/** Angolo in gradi → radianti; SVG: 0° = destra, antiorario. Partiamo da "in alto" = -90° */
function degToRad(deg) {
  return ((deg - 90) * Math.PI) / 180
}

/** Path per un settore radiale: centro (0,0), da angleStart a angleEnd, raggio esterno = r */
function sectorPath(cx, cy, r, angleStartDeg, angleEndDeg) {
  if (r < 0.5) return ''
  const start = degToRad(angleStartDeg)
  const end = degToRad(angleEndDeg)
  const x1 = cx + r * Math.cos(start)
  const y1 = cy + r * Math.sin(start)
  const x2 = cx + r * Math.cos(end)
  const y2 = cy + r * Math.sin(end)
  const large = angleEndDeg - angleStartDeg > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`
}

const SECTOR_DEG = 360 / 5 // 72°

export default function VennTemperamentale({ levels, totals, size = 420, className = '' }) {
  const uid = useId().replace(/:/g, '-')
  const viewSize = 120
  const cx = viewSize / 2
  const cy = viewSize / 2
  const rMax = Math.min(cx, cy) * 0.88
  const vb = [0, 0, viewSize, viewSize].join(' ')
  const bgFill = '#F6EEE1' /* var(--color-surface-subtle), stesso sfondo del radar */

  const sectors = NATURE_KEYS.map((key, i) => {
    const level = Math.max(1, Math.min(7, levels[key] ?? 1))
    const scale = level / 7
    const r = Math.max(4, rMax * scale)
    const angleStart = i * SECTOR_DEG
    const angleEnd = (i + 1) * SECTOR_DEG
    const color = getShade(key, level)
    const label = NATURE_LABELS[key]
    return {
      key,
      label,
      level,
      r,
      angleStart,
      angleEnd,
      color,
      raw: totals?.[key] ?? 0,
    }
  })

  return (
    <div
      className={`correnti-temperamentale ${className}`.trim()}
      role="img"
      aria-label="Ruota delle cinque correnti temperamentali: ogni settore ha lunghezza proporzionale al livello e colore per natura."
    >
      <svg
        viewBox={vb}
        width={size}
        height={size}
        className="correnti-temperamentale-svg"
      >
        <defs>
          <rect id={`${uid}-bg`} width={viewSize} height={viewSize} fill={bgFill} />
          {sectors.map((s) => (
            <linearGradient
              key={s.key}
              id={`${uid}-grad-${s.key}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
              gradientUnits="objectBoundingBox"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity={0.92} />
              <stop offset="100%" stopColor={s.color} stopOpacity={1} />
            </linearGradient>
          ))}
        </defs>
        <use href={`#${uid}-bg`} />
        <g transform={`translate(${cx}, ${cy})`}>
          {sectors.map((s) => (
            <path
              key={s.key}
              d={sectorPath(0, 0, s.r, s.angleStart, s.angleEnd)}
              fill={`url(#${uid}-grad-${s.key})`}
              stroke={s.color}
              strokeWidth={0.8}
              strokeOpacity={0.6}
              className="correnti-sector"
              data-nature={s.key}
              data-level={s.level}
            />
          ))}
        </g>
      </svg>
      <div className="correnti-legend" aria-hidden="true">
        {sectors.map((p) => (
          <div key={p.key} className="correnti-legend-item" data-nature={p.key}>
            <span
              className="correnti-legend-swatch"
              style={{ backgroundColor: p.color }}
            />
            <span className="correnti-legend-label">{p.label}</span>
            <span className="correnti-legend-level">liv. {p.level}/7</span>
          </div>
        ))}
      </div>
      <p className="correnti-hint">
        Ogni settore rappresenta una corrente: la <strong>lunghezza</strong> è il livello (1–7),
        il <strong>colore</strong> la natura. Le correnti non si sovrappongono, per una lettura immediata del profilo.
      </p>
    </div>
  )
}
