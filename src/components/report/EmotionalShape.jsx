import React, { useState, useEffect, useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useUiSounds } from '../../UiSoundProvider.jsx'
import { normalizeFamigliaName } from '../../content/reportRestitution.js'

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
// Righello dei petali: lo 0 coincide con il bordo del nucleo, il 7 con l'anello esterno.
// Un punteggio sopra zero sporge sempre dal nucleo; una famiglia a zero non ha petalo.
const SCALE_ZERO_RADIUS = 48
const SCALE_MAX_RADIUS = 351
const GRID_STEP = (SCALE_MAX_RADIUS - SCALE_ZERO_RADIUS) / 7
const radiusForScore = (score) => SCALE_ZERO_RADIUS + score * GRID_STEP
const PETAL_THICKNESS_RY = 50 // Larghezza trasversale costante: scalatura dell'area rigorosamente lineare

/**
 * Punteggio 0–7 del petalo: lo stesso valore del radar delle famiglie (scala1a7),
 * con 0 riservato alle famiglie senza punti.
 */
function petalScore(data, maxPeso) {
  const raw = 'valoreAssoluto' in data ? Number(data.valoreAssoluto) || 0 : Number(data.peso) || 0
  if (raw <= 0) return 0
  const scala = Number(data.scala1a7)
  if (Number.isFinite(scala) && scala > 0) return Math.min(7, scala)
  const peso = Number(data.peso) || 0
  return Math.min(7, Math.max(1, Math.round((peso / maxPeso) * 7)))
}

function formatScaleScore(score) {
  const roundedScore = Math.round((Number(score) || 0) * 10) / 10
  return Number.isInteger(roundedScore) ? String(roundedScore) : roundedScore.toFixed(1)
}

export default function EmotionalShape({
  familiesData = [],
  dominantFamily = null,
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

  // Identifica con precisione la famiglia con più punti (il major)
  const majorFamilyKey = useMemo(() => {
    if (dominantFamily) {
      return normalizeFamigliaName(dominantFamily)
    }
    if (!familiesData || familiesData.length === 0) return null
    let topFamily = null
    let topPoints = -Infinity
    familiesData.forEach((d) => {
      const pts = ('valoreAssoluto' in d && d.valoreAssoluto != null && !Number.isNaN(Number(d.valoreAssoluto)))
        ? Number(d.valoreAssoluto)
        : (Number(d.peso) || 0)
      if (pts > topPoints) {
        topPoints = pts
        topFamily = d.family || (d.familyKey ? (d.familyKey.charAt(0).toUpperCase() + d.familyKey.slice(1).toLowerCase()) : null)
      }
    })
    return topFamily
  }, [familiesData, dominantFamily])

  const maxScore = Math.max(...familiesData.map((f) => Number(f.peso) || 0), 1)

  // Calcolo delle righe con metriche allineate
  const familyRows = familiesData.map((data) => {
    const familyKey = data.family || 'Verde'
    const params = FAMILY_PARAMS[familyKey] || FAMILY_PARAMS.Verde
    const normalizedTaglia = petalScore(data, maxScore)
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
        maxWidth: '100%',
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
              y="48"
              textAnchor="middle"
              fill="rgba(253, 224, 71, 0.75)"
              fontSize="16"
              fontWeight="600"
              letterSpacing="0.08em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              Espansione
            </text>
            <text
              x="600"
              y="1165"
              textAnchor="middle"
              fill="rgba(74, 222, 128, 0.75)"
              fontSize="16"
              fontWeight="600"
              letterSpacing="0.08em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              Calma e Radicamento
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
              y="572"
              textAnchor="start"
              fill="rgba(248, 113, 113, 0.75)"
              fontSize="16"
              fontWeight="600"
              letterSpacing="0.08em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              Azione
            </text>
            <text
              x="1140"
              y="572"
              textAnchor="end"
              fill="rgba(96, 165, 250, 0.75)"
              fontSize="16"
              fontWeight="600"
              letterSpacing="0.08em"
              fontFamily="var(--font-body, system-ui, sans-serif)"
            >
              Riflessione
            </text>
          </g>

          {/* Griglia circolare dei livelli di intensità */}
          <g className="emotional-shape-grid">
            {[1, 2, 3, 4, 5, 6, 7].map((t) => {
              const r = radiusForScore(t)
              const isMax = t === 7
              const isMedian = t === 4
              return (
                <circle
                  key={`grid-${t}`}
                  cx={CENTER_X}
                  cy={CENTER_Y}
                  r={r}
                  fill="none"
                  stroke={isMax ? 'rgba(255, 255, 255, 0.16)' : isMedian ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.05)'}
                  strokeWidth={isMax ? 1.2 : 1}
                  strokeDasharray={isMax ? 'none' : isMedian ? '4 4' : '2 5'}
                />
              )
            })}
          </g>

          {/* Fascio dei Petali Emotivi */}
          <g style={{ mixBlendMode: 'screen' }}>
            {familyRows.map((row) => {
              const { familyKey, color, angle, normalizedTaglia, label } = row
              if (normalizedTaglia <= 0) return null

              const outerTip = radiusForScore(normalizedTaglia)
              const overlapCentro = 20 // Intersezione centrale per continuità organica
              const rx = (outerTip + overlapCentro) / 2
              const offset = rx - overlapCentro
              // Spessore costante; solo i petali corti si assottigliano per restare leggibili come petali.
              const ry = Math.min(PETAL_THICKNESS_RY, rx * 0.6)

              // Calcolo coordinate del centro del petalo
              const rad = angle * (Math.PI / 180)
              const cx = CENTER_X + Math.cos(rad) * offset
              const cy = CENTER_Y + Math.sin(rad) * offset

              // Opacità interna proporzionale alla taglia e stato hover/selezionato
              const baseOpacity = 0.38 + (row.normalizedTaglia / 7) * 0.34
              const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)
              const fillOpacity = isHighlighted ? Math.min(baseOpacity + 0.28, 0.95) : baseOpacity

              // L'unico a vibrare/muoversi/animarsi è il petalo con più punti (major)
              const isMajor =
                Boolean(majorFamilyKey) &&
                String(familyKey).toLowerCase() === String(majorFamilyKey).toLowerCase() &&
                normalizedTaglia > 0

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
                  {isMajor ? (
                    <g transform={`rotate(${angle} ${cx} ${cy})`}>
                      {/* Ellisse di glow esterno per il major (l'unico ad animare/vibrare) */}
                      <motion.ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill="none"
                        stroke={color}
                        strokeWidth={isHighlighted ? 4 : 2}
                        filter="url(#glow)"
                        opacity={isHighlighted ? 0.9 : 0.55}
                        style={{ transformOrigin: `${cx}px ${cy}px` }}
                        initial={false}
                        animate={{
                          scale: !prefersReducedMotion ? [1, 1.04, 1] : 1,
                          opacity: isHighlighted ? 0.9 : 0.55,
                        }}
                        transition={
                          !prefersReducedMotion
                            ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                            : { duration: 0 }
                        }
                      />

                      {/* Ellisse principale nitida per il major */}
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
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
                        initial={false}
                        animate={{
                          scale: !prefersReducedMotion ? [1, 1.025, 1] : 1,
                          opacity: 1,
                          fillOpacity,
                        }}
                        transition={
                          !prefersReducedMotion
                            ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                            : { duration: 0 }
                        }
                      />
                    </g>
                  ) : (
                    <g transform={`rotate(${angle} ${cx} ${cy})`}>
                      {/* Ellisse di glow esterno statica - NESSUNA vibrazione o movimento */}
                      <ellipse
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill="none"
                        stroke={color}
                        strokeWidth={isHighlighted ? 3.5 : 1.5}
                        filter="url(#glow)"
                        opacity={isHighlighted ? 0.75 : 0.35}
                      />

                      {/* Ellisse principale nitida statica - NESSUNA vibrazione o movimento */}
                      <ellipse
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
                        style={{ cursor: 'pointer' }}
                      />
                    </g>
                  )}
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
              r={28}
              fill="rgba(10, 16, 28, 0.88)"
              stroke={hoveredCore ? '#38bdf8' : 'rgba(255, 255, 255, 0.22)'}
              strokeWidth={hoveredCore ? 2 : 1.5}
              style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
            />
            {/* Punto di gravità centrale */}
            <circle cx={CENTER_X} cy={CENTER_Y} r={5} fill="#38bdf8" />
          </g>

          {/* Ancore Visive Dirette sul Grafico (Qualitative e senza box) */}
          <g className="emotional-shape-direct-labels">
            {familyRows.map((row) => {
              const {
                familyKey,
                label,
                color,
                polarity,
                labelX,
                labelY,
                textAnchor,
              } = row
              const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)

              return (
                <g
                  key={`direct-label-${familyKey}`}
                  className={`emotional-shape-onchart-label${isHighlighted ? ' is-active' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${label}, ${polarity}`}
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
                  {/* Riga 1: Nome Famiglia qualitativo */}
                  <text
                    x={labelX}
                    y={labelY - 6}
                    textAnchor={textAnchor}
                    fill="#f8fafc"
                    fontSize="26"
                    fontWeight="800"
                    fontFamily="var(--font-body, system-ui, sans-serif)"
                    style={{
                      textShadow: '0 3px 14px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.9)',
                      transition: 'fill 0.2s ease',
                    }}
                  >
                    {label}
                  </text>

                  {/* Riga 2: Polarità psicofisiologica */}
                  <text
                    x={labelX}
                    y={labelY + 22}
                    textAnchor={textAnchor}
                    fill={color}
                    fontSize="16"
                    fontWeight="600"
                    letterSpacing="0.04em"
                    fontFamily="var(--font-body, system-ui, sans-serif)"
                    style={{
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)',
                      opacity: isHighlighted ? 1 : 0.9,
                    }}
                  >
                    {polarity}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Scheda interpretativa e punteggi racchiusi in cassetto nerd chiuso di default */}
      <details className="emotional-shape-nerd-accordion">
        <summary className="emotional-shape-nerd-summary">
          <span
            className="emotional-shape-nerd-summary-dot"
            style={{ backgroundColor: activeRow ? activeRow.color : '#38bdf8' }}
          />
          <span>Dettagli e punteggi delle 5 famiglie</span>
          <span className="emotional-shape-nerd-chevron" aria-hidden="true">▾</span>
        </summary>
        <div className="emotional-shape-nerd-content">
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

          <ul className="emotional-shape-legend" aria-label="Punteggi delle 5 famiglie">
            {familyRows.map((row) => (
              <li
                key={row.familyKey}
                className={`emotional-shape-legend__item${(hoveredFamily === row.familyKey || selectedFamily === row.familyKey) ? ' emotional-shape-legend__item--active' : ''}`}
                style={{ '--legend-color': row.color }}
                onClick={() => handleFamilySelect(row.familyKey)}
              >
                <span className="emotional-shape-legend__dot" style={{ backgroundColor: row.color }} />
                <span className="emotional-shape-legend__name">{row.label}</span>
                <span className="emotional-shape-legend__score">{formatScaleScore(row.normalizedTaglia)}</span>
                <span className="emotional-shape-legend__max">/7</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  )
}
