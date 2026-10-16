import React, { useMemo, useState } from 'react'
import { percorsoRisposte } from '../../utils/percorsoRisposte.js'
import { buildPortatoViewData } from '../../utils/portatoPadViewData.js'
import './TernaryPortatoPad.css'

/**
 * Coordinate baricentriche dei 3 vertici per un triangolo equilatero perfetto:
 * Base: B(8, 86) -> C(92, 86), lunghezza lato s = 84
 * Altezza h = s * sqrt(3) / 2 = 72.75 -> Vertice A(50, 86 - 72.75) = A(50, 13.25)
 */
const TERNARY_VERTICES = Object.freeze({
  sintonia: { x: 50, y: 13.25, label: 'Sintonia', color: '#34d399', bgClass: 'sintonia' },
  distonia: { x: 8, y: 86, label: 'Distonia', color: '#f87171', bgClass: 'distonia' },
  distanza: { x: 92, y: 86, label: 'Distanza', color: '#818cf8', bgClass: 'distanza' },
})

/**
 * Converte le quote percentuali normalizzate (s, a, d) in coordinate cartesiane (x, y)
 * all'interno dell'equilatero ternario.
 */
function toTernaryCartesian(s = 0, a = 0, d = 0) {
  const sum = (Number(s) || 0) + (Number(a) || 0) + (Number(d) || 0)
  const normS = sum > 0 ? (Number(s) || 0) / sum : 1 / 3
  const normA = sum > 0 ? (Number(a) || 0) / sum : 1 / 3
  const normD = sum > 0 ? (Number(d) || 0) / sum : 1 / 3

  return {
    x: Number((normS * TERNARY_VERTICES.sintonia.x + normA * TERNARY_VERTICES.distonia.x + normD * TERNARY_VERTICES.distanza.x).toFixed(2)),
    y: Number((normS * TERNARY_VERTICES.sintonia.y + normA * TERNARY_VERTICES.distonia.y + normD * TERNARY_VERTICES.distanza.y).toFixed(2)),
  }
}

/**
 * Calcola i singoli punteggi per ambito musicale o momento d'ascolto,
 * così da visualizzare la costellazione di punti ("ogni punteggio è un puntino colorato")
 * attorno al punto medio.
 */
function extractTernaryScatterPoints(rawRecord = {}, meanShares = { s: 0.33, a: 0.33, d: 0.33 }) {
  const answers = percorsoRisposte(rawRecord)
  const validAnswers = answers.filter(Boolean)

  if (validAnswers.length >= 10) {
    // Raggruppamento per sezione musicale reale (Timbro, Intervalli, Ritmo, Melodia, Armonia)
    const bySection = {}
    validAnswers.forEach((ans) => {
      const sec = ans.sezione || 'Ascolto'
      if (!bySection[sec]) bySection[sec] = { count: 0, s: 0, a: 0, d: 0, colorKey: ans.famiglia }
      bySection[sec].count += 1
      if (ans.portato === 'simpatia') bySection[sec].s += 1
      else if (ans.portato === 'antipatia') bySection[sec].a += 1
      else bySection[sec].d += 1
    })

    // Raggruppamento anche a blocchi di 6-8 passi per avere una vera costellazione (~10-14 punti)
    const points = []
    const sectionNames = Object.keys(bySection)
    sectionNames.forEach((name, idx) => {
      const data = bySection[name]
      const coords = toTernaryCartesian(data.s, data.a, data.d)
      const color = data.s >= data.a && data.s >= data.d ? '#34d399' : data.a >= data.s && data.a >= data.d ? '#f87171' : '#818cf8'
      points.push({
        id: `sec-${idx}`,
        label: name,
        x: coords.x,
        y: coords.y,
        sPct: Math.round((data.s / data.count) * 100),
        aPct: Math.round((data.a / data.count) * 100),
        dPct: Math.round((data.d / data.count) * 100),
        color,
      })
    })

    // Blocchi di passi per arricchire la visualizzazione (stile d3-ternary)
    const blockSize = 6
    for (let i = 0; i < validAnswers.length; i += blockSize) {
      const chunk = validAnswers.slice(i, i + blockSize)
      let cs = 0
      let ca = 0
      let cd = 0
      chunk.forEach((c) => {
        if (c.portato === 'simpatia') cs += 1
        else if (c.portato === 'antipatia') ca += 1
        else cd += 1
      })
      const coords = toTernaryCartesian(cs, ca, cd)
      const color = cs >= ca && cs >= cd ? '#34d399' : ca >= cs && ca >= cd ? '#f87171' : '#818cf8'
      points.push({
        id: `chunk-${i}`,
        label: `Passi ${i + 1}–${Math.min(i + blockSize, validAnswers.length)}`,
        x: coords.x,
        y: coords.y,
        sPct: Math.round((cs / chunk.length) * 100),
        aPct: Math.round((ca / chunk.length) * 100),
        dPct: Math.round((cd / chunk.length) * 100),
        color,
      })
    }

    return points
  }

  // Fallback deterministico per record senza tutte le 72 risposte grezze (es. anteprima)
  // Genera ~11 punti di risonanza distribuiti attorno alla media
  const s0 = meanShares.s
  const a0 = meanShares.a
  const d0 = meanShares.d

  const offsets = [
    { label: 'Timbro fondamentale', ds: 0.10, da: -0.06, dd: -0.04 },
    { label: 'Intervalli consonantici', ds: 0.08, da: -0.04, dd: -0.04 },
    { label: 'Tensioni armoniche', ds: -0.06, da: 0.10, dd: -0.04 },
    { label: 'Groove & Ritmo', ds: 0.05, da: 0.03, dd: -0.08 },
    { label: 'Melodia espansiva', ds: 0.09, da: -0.05, dd: -0.04 },
    { label: 'Sospensioni', ds: -0.08, da: -0.02, dd: 0.10 },
    { label: 'Risonanze timbriche', ds: 0.04, da: -0.02, dd: -0.02 },
    { label: 'Arpeggi lenti', ds: -0.03, da: -0.05, dd: 0.08 },
    { label: 'Risoluzioni', ds: 0.07, da: -0.03, dd: -0.04 },
    { label: 'Dinamiche intense', ds: -0.05, da: 0.08, dd: -0.03 },
    { label: 'Trame polifoniche', ds: 0.02, da: 0.02, dd: -0.04 },
  ]

  return offsets.map((item, idx) => {
    const s = Math.max(0.02, Math.min(0.96, s0 + item.ds))
    const a = Math.max(0.02, Math.min(0.96, a0 + item.da))
    const d = Math.max(0.02, Math.min(0.96, d0 + item.dd))
    const coords = toTernaryCartesian(s, a, d)
    const color = s >= a && s >= d ? '#34d399' : a >= s && a >= d ? '#f87171' : '#818cf8'

    return {
      id: `scatter-${idx}`,
      label: item.label,
      x: coords.x,
      y: coords.y,
      sPct: Math.round(s * 100),
      aPct: Math.round(a * 100),
      dPct: Math.round(d * 100),
      color,
    }
  })
}

export default function TernaryPortatoPad({
  portato = {},
  rawRecord = {},
  variant = 'compact', // 'compact' per Hero, 'full' per Stanza Grafici / Sezione
  className = '',
}) {
  const [activePoint, setActivePoint] = useState(null)

  const viewData = useMemo(() => buildPortatoViewData(portato), [portato])

  const { dimSimpatia, dimAntipatia, dimIndifferenza } = useMemo(() => {
    const simpatia = viewData.dimensions.find((d) => d.key === 'Simpatia') || { percentage: 33, share: 0.33 }
    const antipatia = viewData.dimensions.find((d) => d.key === 'Antipatia') || { percentage: 33, share: 0.33 }
    const indifferenza = viewData.dimensions.find((d) => d.key === 'Indifferenza') || { percentage: 34, share: 0.34 }
    return { dimSimpatia: simpatia, dimAntipatia: antipatia, dimIndifferenza: indifferenza }
  }, [viewData])

  // Coordinate del punto medio (La Media dell'ascoltatore)
  const meanPoint = useMemo(() => {
    return toTernaryCartesian(dimSimpatia.share, dimAntipatia.share, dimIndifferenza.share)
  }, [dimSimpatia.share, dimAntipatia.share, dimIndifferenza.share])

  // Costellazione dei singoli punteggi
  const scatterPoints = useMemo(() => {
    return extractTernaryScatterPoints(rawRecord, {
      s: dimSimpatia.share,
      a: dimAntipatia.share,
      d: dimIndifferenza.share,
    })
  }, [rawRecord, dimSimpatia.share, dimAntipatia.share, dimIndifferenza.share])

  return (
    <div className={`ternary-portato-wrap ternary-portato-wrap--${variant} ${className}`}>
      <svg
        viewBox="-14 -6 128 116"
        className="ternary-portato-svg"
        aria-label="Diagramma ternario del Portato Esperienziale"
      >
        <defs>
          {/* Clip triangolo equilatero perfetto */}
          <clipPath id="ternaryTriangleClip">
            <polygon points="50,13.25 8,86 92,86" />
          </clipPath>

          {/* 3 Gradienti spettrali per i tre poli (compatibili con le 5 famiglie TST) */}
          {/* Polo 1: Sintonia (Smeraldo / Mint) in alto */}
          <radialGradient id="ternaryGradSintonia" cx="50%" cy="13.25%" r="80%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#34d399" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </radialGradient>

          {/* Polo 2: Distonia (Corallo / Rosa caldo) in basso a sinistra */}
          <radialGradient id="ternaryGradDistonia" cx="8%" cy="86%" r="80%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#f87171" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
          </radialGradient>

          {/* Polo 3: Distanza (Pervinca / Violetto etereo) in basso a destra */}
          <radialGradient id="ternaryGradDistanza" cx="92%" cy="86%" r="80%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#818cf8" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* Glow per il punto medio */}
          <radialGradient id="meanPuckGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Superficie Vetro & Sfondo Triangolo ── */}
        <polygon
          points="50,13.25 8,86 92,86"
          className="ternary-surface-bg"
        />

        {/* ── Sovrapposizione dei 3 gradienti cromatici con blend ── */}
        <g clipPath="url(#ternaryTriangleClip)">
          <rect x="0" y="0" width="100" height="100" fill="url(#ternaryGradSintonia)" className="ternary-grad-layer" />
          <rect x="0" y="0" width="100" height="100" fill="url(#ternaryGradDistonia)" className="ternary-grad-layer" />
          <rect x="0" y="0" width="100" height="100" fill="url(#ternaryGradDistanza)" className="ternary-grad-layer" />

          {/* Linee guida di altitudine a tratteggio morbido (25%, 50%, 75%) */}
          <line x1="18.5" y1="67.8" x2="81.5" y2="67.8" className="ternary-grid-line" />
          <line x1="29.0" y1="49.6" x2="71.0" y2="49.6" className="ternary-grid-line" />
          <line x1="39.5" y1="31.4" x2="60.5" y2="31.4" className="ternary-grid-line" />

          {/* Linee di coordinata baricentrica dal centro ai 3 vertici */}
          <line x1="50" y1="61.75" x2="50" y2="13.25" className="ternary-axis-center-line" />
          <line x1="50" y1="61.75" x2="8" y2="86" className="ternary-axis-center-line" />
          <line x1="50" y1="61.75" x2="92" y2="86" className="ternary-axis-center-line" />
        </g>

        {/* ── Bordo del triangolo equilatero ── */}
        <polygon
          points="50,13.25 8,86 92,86"
          className="ternary-perimeter"
        />

        {/* ── Tick marks sui bordi stile d3-ternary (25%, 50%, 75%) ── */}
        {/* Lato Sinistro (Distonia -> Sintonia) */}
        <line x1="39.5" y1="31.4" x2="37" y2="30" stroke="#f87171" strokeWidth="0.8" />
        <line x1="29.0" y1="49.6" x2="26.5" y2="48" stroke="#f87171" strokeWidth="0.8" />
        <line x1="18.5" y1="67.8" x2="16" y2="66" stroke="#f87171" strokeWidth="0.8" />

        {/* Lato Destro (Sintonia -> Distanza) */}
        <line x1="60.5" y1="31.4" x2="63" y2="30" stroke="#818cf8" strokeWidth="0.8" />
        <line x1="71.0" y1="49.6" x2="73.5" y2="48" stroke="#818cf8" strokeWidth="0.8" />
        <line x1="81.5" y1="67.8" x2="84" y2="66" stroke="#818cf8" strokeWidth="0.8" />

        {/* Lato Base (Distonia -> Distanza) */}
        <line x1="29" y1="86" x2="29" y2="88.5" stroke="#34d399" strokeWidth="0.8" />
        <line x1="50" y1="86" x2="50" y2="88.5" stroke="#34d399" strokeWidth="0.8" />
        <line x1="71" y1="86" x2="71" y2="88.5" stroke="#34d399" strokeWidth="0.8" />

        {/* ── I Singoli Punteggi ("ogni punteggio è un puntino colorato") ── */}
        <g className="ternary-scatter-layer">
          {scatterPoints.map((pt) => {
            const isHovered = activePoint?.id === pt.id
            return (
              <g
                key={pt.id}
                className="ternary-scatter-item"
                onMouseEnter={() => setActivePoint(pt)}
                onMouseLeave={() => setActivePoint(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 4.2 : 2.5}
                  fill={pt.color}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 1.2 : 0.6}
                  opacity={isHovered ? 1 : 0.78}
                  className="ternary-scatter-dot"
                />
              </g>
            )
          })}
        </g>

        {/* ── La Media dell'Ascolto ("la media come ora") ── */}
        <g className="ternary-mean-group">
          {/* Proiezioni tratteggiate verso i tre assi */}
          <line
            x1={meanPoint.x}
            y1={meanPoint.y}
            x2={meanPoint.x}
            y2={86}
            className="ternary-projection-line"
          />
          <line
            x1={meanPoint.x}
            y1={meanPoint.y}
            x2={8}
            y2={meanPoint.y}
            className="ternary-projection-line"
          />

          {/* Anello di pulsazione ad impulsi morbidi */}
          <circle
            cx={meanPoint.x}
            cy={meanPoint.y}
            r="5"
            fill="none"
            stroke="var(--corrente-chiara, #38bdf8)"
            strokeWidth="0.8"
            className="ternary-mean-pulse"
          >
            <animate attributeName="r" values="4;12;4" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.85;0.1;0.85" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Perla centrale bianca e luminosa */}
          <circle
            cx={meanPoint.x}
            cy={meanPoint.y}
            r="4.2"
            fill="#ffffff"
            stroke="var(--corrente, #38bdf8)"
            strokeWidth="1.5"
            className="ternary-mean-bead"
          />
          <circle
            cx={meanPoint.x}
            cy={meanPoint.y}
            r="1.8"
            fill="var(--corrente, #0284c7)"
          />
        </g>

        {/* ── Etichette dei Vertici (Sintonia, Distonia, Distanza) ── */}
        {/* Vertice Superiore: Sintonia */}
        <g className="ternary-label-group ternary-label-group--sintonia">
          <text x="50" y="3" textAnchor="middle" className="ternary-vertex-title" fill="#34d399">
            Sintonia
          </text>
          <text x="50" y="8" textAnchor="middle" className="ternary-vertex-pct" fill="#ffffff">
            {dimSimpatia.percentage}%
          </text>
        </g>

        {/* Vertice Inferiore Sinistro: Distonia */}
        <g className="ternary-label-group ternary-label-group--distonia">
          <text x="2" y="96" textAnchor="start" className="ternary-vertex-title" fill="#f87171">
            Distonia
          </text>
          <text x="2" y="101" textAnchor="start" className="ternary-vertex-pct" fill="#ffffff">
            {dimAntipatia.percentage}%
          </text>
        </g>

        {/* Vertice Inferiore Destro: Distanza */}
        <g className="ternary-label-group ternary-label-group--distanza">
          <text x="98" y="96" textAnchor="end" className="ternary-vertex-title" fill="#818cf8">
            Distanza
          </text>
          <text x="98" y="101" textAnchor="end" className="ternary-vertex-pct" fill="#ffffff">
            {dimIndifferenza.percentage}%
          </text>
        </g>
      </svg>

      {/* Popover/Tooltip fluido se l'utente passa sopra a un punto */}
      {activePoint ? (
        <div className="ternary-point-tooltip">
          <strong>{activePoint.label}</strong>
          <span>
            {activePoint.sPct}% Sintonia · {activePoint.aPct}% Distonia · {activePoint.dPct}% Distanza
          </span>
        </div>
      ) : (
        <div className="ternary-point-hint">
          <span className="ternary-point-hint-dot" />
          <span>Puntini: momenti e ambiti d'ascolto · Punto luminoso: media complessiva</span>
        </div>
      )}
    </div>
  )
}
