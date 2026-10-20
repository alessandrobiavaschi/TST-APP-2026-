import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useUiSounds } from '../../UiSoundProvider.jsx'

void motion

// Parametri geometrici e psicofisiologici delle 5 famiglie (Modello Franco Mussida / TST)
const FAMILY_PARAMS = {
  Giallo: {
    color: '#fde047',
    angle: -90, // Ore 12: Polo Espansione
    polarity: 'Espansione & Gioia',
    description: 'Apertura relazionale espansiva, vitalità e naturale propensione alla condivisione gioiosa.',
    labelX: 600,
    labelY: 110,
    textAnchor: 'middle',
  },
  Grigio: {
    color: '#94a3b8',
    angle: -30, // Ore 2: Polo Analisi
    polarity: 'Analisi & Lucidità',
    description: 'Distacco analitico, lucidità intellettuale, visione strutturata e discernimento obiettivo.',
    labelX: 1010,
    labelY: 355,
    textAnchor: 'start',
  },
  Blu: {
    color: '#60a5fa',
    angle: 30, // Ore 4: Polo Introspezione
    polarity: 'Introspezione & Ascolto',
    description: 'Sensibilità intimista, profondità del dialogo interiore e ascolto delle risonanze affettive.',
    labelX: 1010,
    labelY: 845,
    textAnchor: 'start',
  },
  Verde: {
    color: '#4ade80',
    angle: 90, // Ore 6: Polo Radicamento
    polarity: 'Radicamento & Calma',
    description: 'Forza portante radicata nella calma fisiologica, nel riposo e nella capacità di ascolto contemplativo.',
    labelX: 600,
    labelY: 1085,
    textAnchor: 'middle',
  },
  Rosso: {
    color: '#f87171',
    angle: 180, // Ore 9: Polo Azione
    polarity: 'Azione & Volontà',
    description: 'Spinta dinamica orientata all\'azione decisa, alla volontà, alla presenza e alla determinazione.',
    labelX: 125,
    labelY: 600,
    textAnchor: 'end',
  },
}

const NOMI_FAMIGLIE = {
  Giallo: 'Entusiasta',
  Grigio: 'Razionale',
  Blu: 'Malinconica',
  Verde: 'Flemmatica',
  Rosso: 'Marziale',
}

const CENTER_X = 600
const CENTER_Y = 600
const GRID_BASE_RADIUS = 155
const GRID_STEP = 42
const MIN_VISIBLE_TAGLIA = 1
const PETAL_THICKNESS_RY = 58 // Larghezza trasversale costante: scalatura dell'area rigorosamente lineare

function formatScaleScore(score) {
  const roundedScore = Math.round((Number(score) || 0) * 10) / 10
  return Number.isInteger(roundedScore) ? String(roundedScore) : roundedScore.toFixed(1)
}

export default function EmotionalShape({
  familiesData = [],
  height = 'clamp(460px, 46vw, 620px)',
  activeFamilyKey = null,
  onFamilySelect = null,
  onFamilyHover = null,
}) {
  const uiSounds = useUiSounds()
  const [hoveredFamily, setHoveredFamily] = useState(null)
  const [hoveredCore, setHoveredCore] = useState(false)
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
      setLocalSelectedFamily((prev) => (prev === familyKey ? null : familyKey))
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

  // Calcolo delle righe con metriche allineate
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
      polarity: params.polarity,
      description: params.description,
      labelX: params.labelX,
      labelY: params.labelY,
      textAnchor: params.textAnchor,
      normalizedTaglia,
      visibleTaglia,
    }
  })

  // Famiglia attiva per la scheda di approfondimento contestuale
  const activeRow = familyRows.find(
    (r) => r.familyKey === (hoveredFamily || selectedFamily)
  ) || familyRows[0]

  return (
    <div
      className="emotional-shape-container"
      style={{
        width: '100%',
        maxWidth: 960,
        minHeight: height,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="emotional-shape-canvas">
        <svg
          className="sintesi-correnti__svg sintesi-correnti__svg--ellipses"
          viewBox="0 0 1200 1200"
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
          aria-label="La Geometria Emotiva: silhouette a 5 petali che mappa intensità e polarità psicofisiologiche"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id="coreAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Guide degli Assi Polari Psicofisiologici (Mussida CPM) */}
          <g className="emotional-shape-polar-guides" opacity="0.75">
            {/* Asse Verticale: Espansione (Alto) ↔ Radicamento (Basso) */}
            <line
              x1="600"
              y1="60"
              x2="600"
              y2="1140"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <text
              x="600"
              y="52"
              textAnchor="middle"
              fill="rgba(253, 224, 71, 0.6)"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.12em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              ▲ POLO ESPANSIONE
            </text>
            <text
              x="600"
              y="1160"
              textAnchor="middle"
              fill="rgba(74, 222, 128, 0.6)"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.12em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              ▼ POLO RADICAMENTO
            </text>

            {/* Asse Orizzontale: Azione (Sinistra) ↔ Riflessione (Destra) */}
            <line
              x1="60"
              y1="600"
              x2="1140"
              y2="600"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray="4 6"
            />
            <text
              x="60"
              y="576"
              textAnchor="start"
              fill="rgba(248, 113, 113, 0.6)"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.12em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              ◄ POLO AZIONE
            </text>
            <text
              x="1140"
              y="576"
              textAnchor="end"
              fill="rgba(96, 165, 250, 0.6)"
              fontSize="11"
              fontWeight="700"
              letterSpacing="0.12em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              POLO RIFLESSIONE ►
            </text>
          </g>

          {/* Griglia circolare dei livelli 1-7 con perimetro MAX in risalto */}
          <g className="emotional-shape-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((t) => {
              const r = GRID_BASE_RADIUS + (t - 1) * GRID_STEP
              const isMax = t === 7
              const isMedian = t === 4
              return (
                <circle
                  key={`grid-${t}`}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={r}
                  fill="none"
                  stroke={isMax ? 'rgba(255, 255, 255, 0.22)' : isMedian ? 'rgba(255, 255, 255, 0.13)' : 'rgba(255, 255, 255, 0.07)'}
                  strokeWidth={isMax ? 1.5 : 1}
                  strokeDasharray={isMax ? 'none' : isMedian ? '4 4' : '2 5'}
                />
              )
            })}
          </g>

          {/* Asse radiale graduato Scala 1-7 (diagonale a -135°, priva di petali) */}
          <g className="emotional-shape-scale-axis" opacity="0.85">
            {/* Linea guida graduata */}
            <line
              x1={600 - 130 * 0.7071}
              y1={600 - 130 * 0.7071}
              x2={600 - 425 * 0.7071}
              y2={600 - 425 * 0.7071}
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="1"
              strokeDasharray="2 4"
            />
            {/* Tacche numeriche 1..7 */}
            {[1, 2, 3, 4, 5, 6, 7].map((t) => {
              const r = GRID_BASE_RADIUS + (t - 1) * GRID_STEP
              const x = 600 - r * 0.7071
              const y = 600 - r * 0.7071
              const isMax = t === 7
              return (
                <g key={`scale-tick-${t}`}>
                  {/* Tacchetta ortogonale */}
                  <line
                    x1={x - 4 * 0.7071}
                    y1={y + 4 * 0.7071}
                    x2={x + 4 * 0.7071}
                    y2={y - 4 * 0.7071}
                    stroke={isMax ? 'rgba(248, 250, 252, 0.6)' : 'rgba(248, 250, 252, 0.25)'}
                    strokeWidth={isMax ? 1.5 : 1}
                  />
                  {/* Numero di scala */}
                  <text
                    x={x - 10}
                    y={y - 4}
                    textAnchor="end"
                    fill={isMax ? 'rgba(248, 250, 252, 0.85)' : 'rgba(248, 250, 252, 0.45)'}
                    fontSize={isMax ? '13' : '11'}
                    fontWeight={isMax ? '700' : '500'}
                    fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
                  >
                    {isMax ? '7 max' : String(t)}
                  </text>
                </g>
              )
            })}
          </g>

          {/* Fascio dei Petali Emotivi */}
          <g style={{ mixBlendMode: 'screen' }}>
            {familyRows.map((row, idx) => {
              const { familyKey, color, angle, visibleTaglia, label } = row

              const outerTip = GRID_BASE_RADIUS + (visibleTaglia - 1) * GRID_STEP
              const overlapCentro = 20 // Intersezione centrale per continuità organica
              const rx = (outerTip + overlapCentro) / 2
              const offset = rx - overlapCentro
              const ry = PETAL_THICKNESS_RY // Larghezza trasversale costante: scalatura dell'area lineare

              // Calcolo coordinate del centro del petalo
              const rad = angle * (Math.PI / 180)
              const cx = CENTER_X + Math.cos(rad) * offset
              const cy = CENTER_Y + Math.sin(rad) * offset

              // Opacità interna proporzionale alla taglia e stato hover/selezionato
              const baseOpacity = 0.38 + (row.normalizedTaglia / 7) * 0.34
              const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)
              const fillOpacity = isHighlighted ? Math.min(baseOpacity + 0.28, 0.95) : baseOpacity

              const transition = prefersReducedMotion
                ? { duration: 0 }
                : { duration: 1.0, ease: 'easeOut', delay: idx * 0.1 }

              return (
                <g
                  key={`petal-${familyKey}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`Petalo ${label}, punteggio ${formatScaleScore(row.normalizedTaglia)} su 7`}
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
                    {/* Ellisse di glow esterno */}
                    <motion.ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      fill="none"
                      stroke={color}
                      strokeWidth={isHighlighted ? 4 : 2}
                      filter="url(#glow)"
                      opacity={isHighlighted ? 0.9 : 0.5}
                      style={{ transformOrigin: `${cx}px ${cy}px` }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: (isHighlighted && !prefersReducedMotion) ? [1, 1.03, 1] : 1,
                        opacity: isHighlighted ? 0.85 : 0.45,
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
                      cx={cx}
                      cy={cy}
                      rx={rx}
                      ry={ry}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={color}
                      strokeWidth={isHighlighted ? 2 : 1.2}
                      style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
                      initial={{ scale: 0.8, opacity: 0, fillOpacity: 0 }}
                      animate={{
                        scale: (isHighlighted && !prefersReducedMotion) ? [1, 1.02, 1] : 1,
                        opacity: 1,
                        fillOpacity,
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

          {/* Nucleo Centrale di Equilibrio (Baricentro / Convergenza Armonica) */}
          <g
            className="emotional-shape-core"
            tabIndex={0}
            role="button"
            aria-label="Nucleo centrale di equilibrio: punto in cui tutte le 5 energie emotive si radicano e convivono"
            onMouseEnter={() => setHoveredCore(true)}
            onMouseLeave={() => setHoveredCore(false)}
            onClick={() => {
              if (uiSounds?.enabled) uiSounds.playSoftTap()
              setLocalSelectedFamily(null)
            }}
            style={{ cursor: 'pointer', outline: 'none' }}
          >
            {/* Alone soffuso del nucleo */}
            <circle cx={CENTER_X} cy={CENTER_Y} r={48} fill="url(#coreAura)" pointerEvents="none" />
            
            {/* Corpo satinato centrale */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={32}
              fill="rgba(10, 16, 28, 0.88)"
              stroke={hoveredCore ? '#38bdf8' : 'rgba(255, 255, 255, 0.22)'}
              strokeWidth={hoveredCore ? 2 : 1.5}
              style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
            />
            {/* Anello intermedio orbitale */}
            <circle
              cx={CENTER_X}
              cy={CENTER_Y}
              r={19}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity={hoveredCore ? 0.9 : 0.55}
            />
            {/* Punto di gravità centrale */}
            <circle cx={CENTER_X} cy={CENTER_Y} r={5} fill="#38bdf8" />
            <text
              x={CENTER_X}
              y={CENTER_Y + 4}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              letterSpacing="0.08em"
              fill={hoveredCore ? '#38bdf8' : 'rgba(248, 250, 252, 0.85)'}
              fontFamily="var(--font-mono, 'JetBrains Mono', monospace)"
            >
              CORE
            </text>
          </g>

          {/* Ancore Visive Dirette sul Grafico (Risoluzione Split-Attention) */}
          <g className="emotional-shape-direct-labels">
            {familyRows.map((row) => {
              const {
                familyKey,
                label,
                color,
                normalizedTaglia,
                polarity,
                labelX,
                labelY,
                textAnchor,
                angle,
                visibleTaglia,
              } = row
              const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)

              // Calcolo del vertice del petalo per linea di connessione guida
              const outerTip = GRID_BASE_RADIUS + (visibleTaglia - 1) * GRID_STEP
              const rad = angle * (Math.PI / 180)
              const tipX = CENTER_X + Math.cos(rad) * outerTip
              const tipY = CENTER_Y + Math.sin(rad) * outerTip

              // Coordinate della box badge in base al textAnchor
              let rectX = labelX - 95
              let rectY = labelY - 26
              let text1X = labelX
              let text1Y = labelY - 4
              let text2X = labelX
              let text2Y = labelY + 16

              if (textAnchor === 'start') {
                rectX = labelX - 12
                text1X = labelX + 4
                text2X = labelX + 4
              } else if (textAnchor === 'end') {
                rectX = labelX - 178
                text1X = labelX - 4
                text2X = labelX - 4
              }

              return (
                <g
                  key={`direct-label-${familyKey}`}
                  className={`emotional-shape-onchart-label${isHighlighted ? ' is-active' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${label}: ${formatScaleScore(normalizedTaglia)} su 7, ${polarity}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFamilySelect(familyKey)
                  }}
                  onMouseEnter={() => handleFamilyHover(familyKey)}
                  onMouseLeave={() => handleFamilyHover(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleFamilySelect(familyKey)
                    }
                  }}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  {/* Linea sottile guida dal vertice del petalo al badge */}
                  <line
                    x1={tipX}
                    y1={tipY}
                    x2={textAnchor === 'start' ? rectX : textAnchor === 'end' ? rectX + 190 : labelX}
                    y2={textAnchor === 'middle' ? (angle === -90 ? rectY + 52 : rectY) : labelY}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    opacity={isHighlighted ? 0.75 : 0.25}
                  />

                  {/* Sfondo Acoustic Glass del badge */}
                  <rect
                    x={rectX}
                    y={rectY}
                    width="190"
                    height="52"
                    rx="14"
                    fill="rgba(10, 16, 28, 0.88)"
                    stroke={isHighlighted ? color : 'rgba(255, 255, 255, 0.16)'}
                    strokeWidth={isHighlighted ? 1.8 : 1}
                    style={{
                      transition: 'stroke 0.2s ease, stroke-width 0.2s ease, filter 0.2s ease',
                      filter: isHighlighted ? `drop-shadow(0 0 10px ${color}40)` : 'none',
                    }}
                  />

                  {/* Riga 1: Nome famiglia e punteggio numerico */}
                  <text
                    x={text1X}
                    y={text1Y}
                    textAnchor={textAnchor}
                    fill="#f8fafc"
                    fontSize="15"
                    fontWeight="700"
                    fontFamily="var(--font-body, system-ui, sans-serif)"
                  >
                    {label}{' '}
                    <tspan fill={color} fontWeight="800" fontFamily="var(--font-mono, 'JetBrains Mono', monospace)">
                      {formatScaleScore(normalizedTaglia)}
                    </tspan>
                    <tspan fill="rgba(248, 250, 252, 0.45)" fontSize="11" fontFamily="var(--font-mono, 'JetBrains Mono', monospace)">
                      /7
                    </tspan>
                  </text>

                  {/* Riga 2: Polarità psicofisiologica */}
                  <text
                    x={text2X}
                    y={text2Y}
                    textAnchor={textAnchor}
                    fill={color}
                    fontSize="11"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    fontFamily="var(--font-body, system-ui, sans-serif)"
                    opacity="0.9"
                  >
                    {polarity}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Scheda interpretativa in tempo reale (Silhouette & Polarità) */}
      <div
        className="emotional-shape-insight"
        style={{ '--insight-color': hoveredCore ? '#38bdf8' : (activeRow ? activeRow.color : '#38bdf8') }}
        role="region"
        aria-label="Interpretazione della silhouette emotiva"
      >
        <div className="emotional-shape-insight__header">
          <span
            className="emotional-shape-insight__dot"
            style={{ backgroundColor: hoveredCore ? '#38bdf8' : (activeRow ? activeRow.color : '#38bdf8') }}
            aria-hidden="true"
          />
          <span className="emotional-shape-insight__badge">
            {hoveredCore
              ? 'Baricentro Armonico'
              : (activeRow ? `Famiglia ${activeRow.label}` : 'Silhouette Emotiva')}
          </span>
          <span className="emotional-shape-insight__score">
            {hoveredCore
              ? 'Nucleo di Coesistenza'
              : (activeRow ? `${formatScaleScore(activeRow.normalizedTaglia)}/7` : '')}
          </span>
          {activeRow && !hoveredCore && (
            <span className="emotional-shape-insight__polarity">
              {activeRow.polarity}
            </span>
          )}
        </div>
        <p className="emotional-shape-insight__desc">
          {hoveredCore
            ? 'Punto di convergenza in cui tutte e 5 le energie emotive si radicano e convivono in equilibrio interiore.'
            : (activeRow ? activeRow.description : 'Seleziona o passa con il cursore su un petalo per approfondirne il significato.')}
        </p>
      </div>

      {/* Legenda inferiore interattiva (Summary Pills sincronizzati) */}
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
