import React, { useId } from 'react'

/**
 * Plugin BANANA – Generatore di fiori temperamentali.
 * Restituisce un fiore con 5 petali ellittici sovrapposti e semitrasparenti:
 * ogni petalo è un colore (Blu, Rosso, Giallo, Verde, Grigio) e la dimensione
 * è proporzionale all'intensità (livello 1–7). La forma riflette il portato esperienziale.
 */

const BANANA_CORRENTI = [
  { key: 'blu', label: 'Malinconia (Blu)', color: '#60a5fa' },
  { key: 'rosso', label: 'Volitività (Rosso)', color: '#f87171' },
  { key: 'verde', label: 'Calma (Verde)', color: '#4ade80' },
  { key: 'giallo', label: 'Entusiasmo (Giallo)', color: '#fde047' },
  { key: 'grigio', label: 'Anaffettività (Grigio)', color: '#9ca3af' },
]

const ANGOLO_PER_PETALO = 360 / 5 // 72°

function FlowerBANANA({ levels, portato, size = 320, className = '', showLegend = true }) {
  const gradientPrefix = useId().replace(/:/g, '')
  const viewSize = 120
  const cx = viewSize / 2
  const cy = viewSize / 2
  const R = 48
  const baseRx = 20
  const baseRy = 36

  const petali = BANANA_CORRENTI.map((c, i) => ({
    ...c,
    level: Math.max(1, Math.min(7, levels[c.key] ?? 1)),
    rotation: i * ANGOLO_PER_PETALO,
  }))

  // Ordine di disegno: dal livello più basso al più alto così i petali più grandi stanno sopra
  const petaliOrdinati = [...petali].sort((a, b) => a.level - b.level)

  const portatoClass = portato ? `banana-flower--${portato}` : ''

  return (
    <div
      className={`banana-flower ${portatoClass} ${className}`.trim()}
      role="img"
      aria-label="Restituzione visiva: il tuo fiore (plugin BANANA)"
    >
      <div className="banana-flower-box">
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          width={size}
          height={size}
          className="banana-flower-svg"
        >
          <defs>
            {petali.map((p) => (
              <linearGradient
                key={p.key}
                id={`${gradientPrefix}-banana-${p.key}`}
                x1="0%"
                y1="1%"
                x2="0%"
                y2="0%"
                gradientUnits="objectBoundingBox"
              >
                <stop offset="0%" stopColor={p.color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={p.color} stopOpacity={0.82} />
              </linearGradient>
            ))}
          </defs>
          <g transform={`translate(${cx}, ${cy})`}>
            {petaliOrdinati.map((p) => {
              const scale = p.level / 7
              const rx = baseRx * scale
              const ry = baseRy * scale
              return (
                <g key={p.key} transform={`rotate(${p.rotation})`}>
                  <ellipse
                    cx="0"
                    cy={-R}
                    rx={rx}
                    ry={ry}
                    fill={`url(#${gradientPrefix}-banana-${p.key})`}
                    stroke={p.color}
                    strokeWidth={1}
                    strokeOpacity={0.55}
                    className="banana-flower-petal"
                    data-nature={p.key}
                    data-level={p.level}
                  />
                </g>
              )
            })}
            <circle cx="0" cy="0" r="10" fill="#2d3329" fillOpacity={0.9} />
            <circle cx="0" cy="0" r="6" fill="#f6eee1" fillOpacity={0.6} />
          </g>
        </svg>
      </div>
      {showLegend && (
        <div className="banana-flower-legend" aria-hidden="true">
          {BANANA_CORRENTI.map(({ key, label, color }) => (
            <div key={key} className="banana-flower-legend-item" data-nature={key}>
              <span className="banana-flower-legend-swatch" style={{ backgroundColor: color }} />
              <span className="banana-flower-legend-label">{label}</span>
              <span className="banana-flower-legend-level">
                liv. {levels[key] ?? 1}/7
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FlowerBANANA
export { BANANA_CORRENTI }
