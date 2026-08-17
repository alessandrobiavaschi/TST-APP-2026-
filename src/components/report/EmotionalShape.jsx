import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useUiSounds } from '../../UiSoundProvider.jsx'

void motion

// Angoli e posizioni esatte basate sul design del modello CPM fornito
const FAMILY_PARAMS = {
  Giallo: { color: '#EAB308', angle: -90 }, // Entusiasmo: Alto (ore 12)
  Grigio: { color: '#9CA3AF', angle: -30 }, // Anaffettività: Alto Destra (ore 2)
  Blu:    { color: '#3B82F6', angle: 30 },  // Malinconia: Basso Destra (ore 4)
  Verde:  { color: '#22C55E', angle: 90 },  // Calma: Basso (ore 6)
  Rosso:  { color: '#EF4444', angle: 180 }, // Volitività: Sinistra (ore 9)
}

const NOMI_FAMIGLIE = {
  Giallo: 'Entusiasta',
  Grigio: 'Razionale',
  Blu: 'Malinconica',
  Verde: 'Flemmatica',
  Rosso: 'Marziale'
}

const CENTER_X = 600
const CENTER_Y = 600
const GRID_BASE_RADIUS = 155
const GRID_STEP = 42
const MIN_VISIBLE_TAGLIA = 1

function formatScaleScore(score) {
  const roundedScore = Math.round((Number(score) || 0) * 10) / 10
  return Number.isInteger(roundedScore) ? String(roundedScore) : roundedScore.toFixed(1)
}

export default function EmotionalShape({
  familiesData = [],
  height = 'clamp(440px, 42vw, 560px)',
  activeFamilyKey = null,
  onFamilySelect = null,
  onFamilyHover = null,
}) {
  const uiSounds = useUiSounds()
  const [hoveredFamily, setHoveredFamily] = useState(null)
  const [localSelectedFamily, setLocalSelectedFamily] = useState(null)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (activeFamilyKey) return undefined
    const handleDocumentClick = () => {
      setLocalSelectedFamily(null)
    }
    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [activeFamilyKey])

  const selectedFamily = activeFamilyKey
    ? (activeFamilyKey.charAt(0).toUpperCase() + activeFamilyKey.slice(1).toLowerCase())
    : localSelectedFamily

  const handleFamilySelect = (familyKey) => {
    if (uiSounds?.enabled) {
      uiSounds.playPrimaryTap()
    }
    if (onFamilySelect) {
      onFamilySelect(familyKey.toLowerCase())
    } else {
      setLocalSelectedFamily(prev => prev === familyKey ? null : familyKey)
    }
  }

  const handleFamilyHover = (familyKey) => {
    if (familyKey && uiSounds?.enabled) {
      uiSounds.playSoftTap()
    }
    setHoveredFamily(familyKey)
    if (onFamilyHover) {
      onFamilyHover(familyKey ? familyKey.toLowerCase() : null)
    }
  }

  const maxScore = Math.max(...familiesData.map((f) => Number(f.peso) || 0), 1)

  // Dati derivati condivisi da petali SVG e legenda esterna.
  const familyRows = familiesData.map((data) => {
    const familyKey = data.family || 'Verde'
    const params = FAMILY_PARAMS[familyKey] || FAMILY_PARAMS.Verde
    const score = Number(data.peso) || 0
    const normalizedTaglia = 1 + (score / maxScore) * 6
    const visibleTaglia = Math.max(normalizedTaglia, MIN_VISIBLE_TAGLIA)
    return {
      familyKey,
      label: NOMI_FAMIGLIE[familyKey] || familyKey,
      color: params.color,
      angle: params.angle,
      normalizedTaglia,
      visibleTaglia,
    }
  })

  return (
    <div
      className="emotional-shape-container"
      style={{
        width: '100%',
        maxWidth: 940,
        height,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="emotional-shape-canvas">
        <svg
          className="sintesi-correnti__svg sintesi-correnti__svg--ellipses"
          viewBox="40 40 1120 1120"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            maxWidth: '100%',
            maxHeight: '100%',
            margin: '0 auto',
          }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Griglia di metratura 1-7 di sfondo (proporzionale dal centro), senza numeri: la scala esatta è nella legenda sotto. */}
          <g className="emotional-shape-grid">
            {[1, 2, 3, 4, 5, 6, 7].map(t => {
              const r = GRID_BASE_RADIUS + (t - 1) * GRID_STEP
              return (
                <circle key={`grid-${t}`} cx={CENTER_X} cy={CENTER_Y} r={r} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
              )
            })}
          </g>

          <g style={{ mixBlendMode: 'screen' }}>
            {familyRows.map((row, idx) => {
              const { familyKey, color, angle, visibleTaglia, label } = row

              const outerTip = GRID_BASE_RADIUS + (visibleTaglia - 1) * GRID_STEP
              const overlapCentro = 20 // I petali si incrociano al centro di 20 pixel costanti
              const rx = (outerTip + overlapCentro) / 2
              const offset = rx - overlapCentro
              const ry = 50 + (visibleTaglia - 1) * 8

              // Calcolo coordinate del centro del petalo
              const rad = angle * (Math.PI / 180)
              const cx = CENTER_X + Math.cos(rad) * offset
              const cy = CENTER_Y + Math.sin(rad) * offset

              // Opacità interna proporzionale alla taglia e stato hover/selezionato
              const baseOpacity = 0.40 + (row.normalizedTaglia / 7) * 0.35
              const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)
              const fillOpacity = isHighlighted ? Math.min(baseOpacity + 0.25, 1) : baseOpacity

              const transition = prefersReducedMotion ? { duration: 0 } : { duration: 1.0, ease: "easeOut", delay: idx * 0.1 }

              return (
                <g
                  key={`petal-${familyKey}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Petalo ${label}, valore normalizzato ${formatScaleScore(row.normalizedTaglia)} su 7`}
                  onFocus={() => handleFamilyHover(familyKey)}
                  onBlur={() => handleFamilyHover(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFamilySelect(familyKey)
                    }
                  }}
                  style={{ outline: 'none' }}
                >
                  <g transform={`rotate(${angle} ${cx} ${cy})`}>
                    {/* Ellisse di glow esterno (leggermente ridotto lo spessore per non impastare) */}
                    <motion.ellipse
                      cx={cx} cy={cy} rx={rx} ry={ry}
                      fill="none"
                      stroke={color}
                      strokeWidth={4}
                      filter="url(#glow)"
                      opacity={isHighlighted ? 0.9 : 0.6}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: (isHighlighted && !prefersReducedMotion) ? [1, 1.04, 1] : 1,
                        opacity: isHighlighted ? 0.7 : 0.4
                      }}
                      transition={
                        (isHighlighted && !prefersReducedMotion)
                          ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                          : transition
                      }
                    />

                    {/* Ellisse principale nitida */}
                    <motion.ellipse
                      onMouseEnter={() => handleFamilyHover(familyKey)}
                      onMouseLeave={() => handleFamilyHover(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFamilySelect(familyKey)
                      }}
                      cx={cx} cy={cy} rx={rx} ry={ry}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={color}
                      strokeWidth={1.5}
                      style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
                      initial={{ scale: 0.8, opacity: 0, fillOpacity: 0 }}
                      animate={{
                        scale: (isHighlighted && !prefersReducedMotion) ? [1, 1.025, 1] : 1,
                        opacity: 1,
                        fillOpacity
                      }}
                      transition={
                        (isHighlighted && !prefersReducedMotion)
                          ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                          : transition
                      }
                    />
                  </g>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      <ul className="emotional-shape-legend" aria-hidden="false">
        {familyRows.map((row) => {
          const isHighlighted = (hoveredFamily === row.familyKey) || (selectedFamily === row.familyKey)
          return (
            <li
              key={`legend-${row.familyKey}`}
              className={`emotional-shape-legend__item${isHighlighted ? ' emotional-shape-legend__item--active' : ''}`}
              style={{ '--legend-color': row.color }}
              tabIndex={0}
              role="button"
              aria-label={`${row.label}, valore ${formatScaleScore(row.normalizedTaglia)} su 7`}
              onMouseEnter={() => handleFamilyHover(row.familyKey)}
              onMouseLeave={() => handleFamilyHover(null)}
              onClick={() => handleFamilySelect(row.familyKey)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleFamilySelect(row.familyKey)
                }
              }}
            >
              <span className="emotional-shape-legend__dot" style={{ backgroundColor: row.color }} aria-hidden="true" />
              <span className="emotional-shape-legend__name">{row.label}</span>
              <span className="emotional-shape-legend__score">
                {formatScaleScore(row.normalizedTaglia)}<span className="emotional-shape-legend__max">/7</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
