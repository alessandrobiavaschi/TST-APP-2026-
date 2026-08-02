import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

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
  Giallo: 'Entusiasmo',
  Grigio: 'Anaffettività',
  Blu: 'Malinconia',
  Verde: 'Calma',
  Rosso: 'Volitività'
}

const CENTER_X = 600
const CENTER_Y = 600
const GRID_BASE_RADIUS = 155
const GRID_STEP = 42
const LABEL_MIN_X = 60
const LABEL_MAX_X = 1140
const LABEL_MIN_Y = 60
const LABEL_MAX_Y = 1140
const MIN_VISIBLE_TAGLIA = 1

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export default function EmotionalShape({
  familiesData = [],
  height = 'clamp(440px, 42vw, 560px)',
  activeFamilyKey = null,
  onFamilySelect = null,
  onFamilyHover = null,
}) {
  const [hoveredFamily, setHoveredFamily] = useState(null)
  const [isHoveredChart, setIsHoveredChart] = useState(false)
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
    if (onFamilySelect) {
      onFamilySelect(familyKey.toLowerCase())
    } else {
      setLocalSelectedFamily(prev => prev === familyKey ? null : familyKey)
    }
  }

  const handleFamilyHover = (familyKey) => {
    setHoveredFamily(familyKey)
    if (onFamilyHover) {
      onFamilyHover(familyKey ? familyKey.toLowerCase() : null)
    }
  }

  const maxScore = Math.max(...familiesData.map((f) => Number(f.peso) || 0), 1)
  const activeFamilyKeyResolved = selectedFamily || hoveredFamily
  const activeFamilyData = familiesData.find((f) => (f.family || 'Verde') === activeFamilyKeyResolved)
  const activeScore = activeFamilyData
    ? Math.max(1 + (Number(activeFamilyData.peso) || 0) / maxScore * 6, MIN_VISIBLE_TAGLIA)
    : null
  const activeColor = activeFamilyKeyResolved ? (FAMILY_PARAMS[activeFamilyKeyResolved] || FAMILY_PARAMS.Verde).color : null
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  const isTouch = typeof window !== 'undefined' && (isMobile || 'ontouchstart' in window || navigator.maxTouchPoints > 0)

  const renderPetalo = (data, idx) => {
    const familyKey = data.family || 'Verde'
    const params = FAMILY_PARAMS[familyKey] || FAMILY_PARAMS.Verde
    const score = Number(data.peso) || 0
    
    // NORMALIZZAZIONE 1-7: Il punteggio più alto diventa esattamente 7.
    const normalizedTaglia = 1 + (score / maxScore) * 6
    const visibleTaglia = Math.max(normalizedTaglia, MIN_VISIBLE_TAGLIA)
    
    const outerTip = GRID_BASE_RADIUS + (visibleTaglia - 1) * GRID_STEP
    const overlapCentro = 20 // I petali si incrociano al centro di 20 pixel costanti
    const rx = (outerTip + overlapCentro) / 2
    const offset = rx - overlapCentro
    const ry = 50 + (visibleTaglia - 1) * 8
    
    // Calcolo coordinate del centro del petalo
    const rad = params.angle * (Math.PI / 180)
    const cx = CENTER_X + Math.cos(rad) * offset
    const cy = CENTER_Y + Math.sin(rad) * offset
    
    // Opacità interna proporzionale alla taglia e stato hover/selezionato
    const baseOpacity = 0.40 + (normalizedTaglia / 7) * 0.35
    const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)
    const fillOpacity = isHighlighted ? Math.min(baseOpacity + 0.25, 1) : baseOpacity
    
    // Posizione calcolata per le etichette di testo (rimangono dritte fuori dalla rotazione)
    const textRadius = outerTip + 65
    const tx = clamp(CENTER_X + Math.cos(rad) * textRadius, LABEL_MIN_X, LABEL_MAX_X)
    const ty = clamp(CENTER_Y + Math.sin(rad) * textRadius, LABEL_MIN_Y, LABEL_MAX_Y)
    
    // Offset manuale per allineare bene i testi
    let align = 'middle'
    let tOffsetX = 0
    if (Math.cos(rad) < -0.1) {
      align = 'end'
      tOffsetX = 30
    } else if (Math.cos(rad) > 0.1) {
      align = 'start'
      tOffsetX = -30
    }
    const labelX = clamp(tx + tOffsetX, LABEL_MIN_X, LABEL_MAX_X)
    const transition = prefersReducedMotion ? { duration: 0 } : { duration: 1.0, ease: "easeOut", delay: idx * 0.1 }
    const labelTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.6 + idx * 0.1 }
    
    return (
      <g 
        key={`text-${familyKey}`}
        tabIndex={0}
        role="button"
        aria-label={`Petalo ${NOMI_FAMIGLIE[familyKey] || familyKey}, valore normalizzato in scala ${activeScore ? activeScore.toFixed(1) : 0} su 7`}
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
        <g transform={`rotate(${params.angle} ${cx} ${cy})`}>
        <motion.ellipse
          cx={cx} cy={cy} rx={rx} ry={ry}
          fill="none"
          stroke={params.color}
          strokeWidth={4}
          filter="url(#glow)"
          opacity={isHighlighted ? 0.9 : 0.6}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: isHighlighted ? 0.7 : 0.4 }}
          transition={transition}
        />
        <motion.ellipse
          onMouseEnter={() => handleFamilyHover(familyKey)}
          onMouseLeave={() => handleFamilyHover(null)}
          onClick={(e) => {
            e.stopPropagation()
            handleFamilySelect(familyKey)
          }}
          cx={cx} cy={cy} rx={rx} ry={ry}
          fill={params.color}
          fillOpacity={fillOpacity}
          stroke={params.color}
          strokeWidth={1.5}
          style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
          initial={{ scale: 0.8, opacity: 0, fillOpacity: 0 }}
          animate={{ scale: 1, opacity: 1, fillOpacity }}
          transition={transition}
        />
        </g>
        
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={labelTransition}
        >
          <text
            onMouseEnter={() => handleFamilyHover(familyKey)}
            onMouseLeave={() => handleFamilyHover(null)}
            onClick={(e) => {
              e.stopPropagation()
              handleFamilySelect(familyKey)
            }}
            x={labelX}
            y={ty}
            fill="#F8FAFC"
            fontSize="28"
            fontWeight="760"
            textAnchor={align}
            dominantBaseline="middle"
            paintOrder="stroke"
            stroke="#071123"
            strokeWidth="5"
            strokeLinejoin="round"
            style={{ cursor: 'pointer' }}
          >
            <tspan x={labelX} dy="0" style={{ transition: 'fill 0.2s', fill: isHighlighted ? params.color : '#F8FAFC' }}>
              {NOMI_FAMIGLIE[familyKey] || familyKey}
            </tspan>
          </text>
        </motion.g>
      </g>
    )
  }

  const ordered = [...familiesData].sort((a, b) => {
    if (a.family === activeFamilyKeyResolved) return 1
    if (b.family === activeFamilyKeyResolved) return -1
    return 0
  })

  return (
    <div
      className="emotional-shape-container"
      style={{
        width: '100%',
        maxWidth: 940,
        height,
        margin: '0 auto',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg 
        className="sintesi-correnti__svg sintesi-correnti__svg--ellipses"
        onMouseEnter={() => setIsHoveredChart(true)}
        onMouseLeave={() => setIsHoveredChart(false)}
        viewBox="40 40 1120 1120"
        width="100%" 
        height="100%" 
        preserveAspectRatio="xMidYMid meet"
        style={{
          display: 'block',
          overflow: 'hidden',
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

        <g className="emotional-shape-grid">
          {[1, 2, 3, 4, 5, 6, 7].map(t => {
            const r = GRID_BASE_RADIUS + (t - 1) * GRID_STEP
            const rad = -135 * (Math.PI / 180)
                  <rect x={textX - 22} y={textY - 22} width="44" height="44" fill="#070d1b" stroke="#475569" strokeWidth="1.5" opacity="0.95" rx="22" />
                  <text x={textX} y={textY} fill="#f8fafc" fontSize="24" fontWeight="800" textAnchor="middle" dominantBaseline="central">
                    {t}
                  </text>
                </motion.g>
              </g>
            )
          })}
        </g>

        <g style={{ mixBlendMode: 'screen' }}>
          {familiesData.map((data, idx) => {
            const familyKey = data.family || 'Verde'
            const params = FAMILY_PARAMS[familyKey] || FAMILY_PARAMS.Verde
            const score = Number(data.peso) || 0
            
            // NORMALIZZAZIONE 1-7: Il punteggio più alto diventa esattamente 7.
            const normalizedTaglia = 1 + (score / maxScore) * 6
            const visibleTaglia = Math.max(normalizedTaglia, MIN_VISIBLE_TAGLIA)
            
            const outerTip = GRID_BASE_RADIUS + (visibleTaglia - 1) * GRID_STEP
            const overlapCentro = 20 // I petali si incrociano al centro di 20 pixel costanti
            const rx = (outerTip + overlapCentro) / 2
            const offset = rx - overlapCentro
            const ry = 50 + (visibleTaglia - 1) * 8
            
            // Calcolo coordinate del centro del petalo
            const rad = params.angle * (Math.PI / 180)
            const cx = CENTER_X + Math.cos(rad) * offset
            const cy = CENTER_Y + Math.sin(rad) * offset
            
            // Opacità interna proporzionale alla taglia e stato hover/selezionato
            const baseOpacity = 0.40 + (normalizedTaglia / 7) * 0.35
            const isHighlighted = (hoveredFamily === familyKey) || (selectedFamily === familyKey)
            const fillOpacity = isHighlighted ? Math.min(baseOpacity + 0.25, 1) : baseOpacity
            
            // Posizione calcolata per le etichette di testo (rimangono dritte fuori dalla rotazione)
            const textRadius = outerTip + 65
            const tx = clamp(CENTER_X + Math.cos(rad) * textRadius, LABEL_MIN_X, LABEL_MAX_X)
            const ty = clamp(CENTER_Y + Math.sin(rad) * textRadius, LABEL_MIN_Y, LABEL_MAX_Y)
            
            // Offset manuale per allineare bene i testi come in reference
            let align = 'middle'
            let tOffsetX = 0
            if (Math.cos(rad) < -0.1) {
              align = 'end'
              tOffsetX = 30
            } else if (Math.cos(rad) > 0.1) {
              align = 'start'
              tOffsetX = -30
            }
            const labelX = clamp(tx + tOffsetX, LABEL_MIN_X, LABEL_MAX_X)
            const transition = prefersReducedMotion ? { duration: 0 } : { duration: 1.0, ease: "easeOut", delay: idx * 0.1 }
            const labelTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: 0.6 + idx * 0.1 }
            
            return (
              <g 
                key={`text-${familyKey}`}
                tabIndex={0}
                role="button"
                aria-label={`Petalo ${NOMI_FAMIGLIE[familyKey] || familyKey}, valore normalizzato in scala ${activeScore ? activeScore.toFixed(1) : 0} su 7`}
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
                <g transform={`rotate(${params.angle} ${cx} ${cy})`}>
                {/* Ellisse di glow esterno (leggermente ridotto lo spessore per non impastare) */}
                <motion.ellipse
                  cx={cx} cy={cy} rx={rx} ry={ry}
                  fill="none"
                  stroke={params.color}
                  strokeWidth={4}
                  filter="url(#glow)"
                  opacity={isHighlighted ? 0.9 : 0.6}
                  style={{ transformOrigin: `${cx}px ${cy}px` }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: isHighlighted ? 0.7 : 0.4 }}
                  transition={transition}
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
                  fill={params.color}
                  fillOpacity={fillOpacity}
                  stroke={params.color}
                  strokeWidth={1.5}
                  style={{ transformOrigin: `${cx}px ${cy}px`, cursor: 'pointer' }}
                  initial={{ scale: 0.8, opacity: 0, fillOpacity: 0 }}
                  animate={{ scale: 1, opacity: 1, fillOpacity }}
                  transition={transition}
                />
                </g>
                
                {/* Etichetta di testo interna (Fuori dal gruppo di rotazione per restare dritta) */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={labelTransition}
                >
                  <text
                    onMouseEnter={() => handleFamilyHover(familyKey)}
                    onMouseLeave={() => handleFamilyHover(null)}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFamilySelect(familyKey)
                    }}
                    x={labelX}
                    y={ty}
                    fill="#F8FAFC"
                    fontSize="28"
                    fontWeight="760"
                    textAnchor={align}
                    dominantBaseline="middle"
                    paintOrder="stroke"
                    stroke="#071123"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    style={{ cursor: 'pointer' }}
                  >
                    <tspan x={labelX} dy="0" style={{ transition: 'fill 0.2s', fill: isHighlighted ? params.color : '#F8FAFC' }}>
                      {NOMI_FAMIGLIE[familyKey] || familyKey}
                    </tspan>
                  </text>
                </motion.g>
              </g>
            )
          })}
        </g>
        
        {/* Lettura unica e fissa in alto: evita sovrapposizioni con le etichette dei petali */}
        {activeFamilyKeyResolved ? (
          <g style={{ pointerEvents: 'none' }}>
            <rect x="380" y="60" width="440" height="60" rx="16" fill="#070d1b" stroke={activeColor} strokeWidth="1.5" opacity="0.95" />
            <text x="600" y="90" fill="#f8fafc" fontSize="24" fontWeight="800" textAnchor="middle" dominantBaseline="central">
              {NOMI_FAMIGLIE[activeFamilyKeyResolved] || activeFamilyKeyResolved}
              <tspan fill={activeColor}> — {activeScore.toFixed(1)} / 7 (Scala 1-7)</tspan>
            </text>
          </g>
        ) : (
          <text x="600" y="90" fill="#94a3b8" fontSize="18" fontWeight="600" textAnchor="middle" opacity="0.8">
            Passa il cursore o premi Tab sui petali per i punteggi in scala normalizzata 1-7
          </text>
        )}
      </svg>
    </div>
  )
}
