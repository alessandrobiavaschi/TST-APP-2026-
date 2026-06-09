import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via `motion.div`
// (stessa convenzione di RelationalTabs.jsx).
void motion
import { RAPPORTI_UI } from './reportUiCopy.js'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts'

/**
 * <QuattroRapporti /> — sezione presentazionale "I quattro rapporti".
 *
 * Sostituisce la versione "radar piccolo + tab": mostra 4 card-tab selezionabili,
 * un radar grande (recharts) data-driven e una colonna di lettura del rapporto,
 * I punteggi portato esperienziale (Blocco C) sono nella sezione dedicata
 * `SezionePortatoEsperienziale`, subito dopo questa sezione nel report.
 *
 * Componente puro: nessuna chiamata a scoring/DB, tutto guidato dalle props.
 *
 * Props:
 *   rapporti: Array<{
 *     id: string,
 *     nome: string,
 *     definizione: string,
 *     composizione: string,                       // es. "Timbro + Intervalli + Armonia"
 *     cosaIndica: string,
 *     correntePrincipale: { nome: string, colore: string },
 *     datiRadar: Array<{ corrente: string, valore: number }>
 *   }>                                            // 4 oggetti
 *   coloriCorrenti: { [nome: string]: string }    // hex per corrente (fallback colore assi/dot)
 */

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

function pad2(n) {
  return String(n + 1).padStart(2, '0')
}

/** Tick personalizzato per gli assi (label monospace 11px #94a3b8). */
function AxisTick({ x, y, payload, textAnchor }) {
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

export default function QuattroRapporti({
  rapporti = [],
  coloriCorrenti = {},
}) {
  const reduceMotion = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Clamp derivato: resta valido anche se cambia il numero di rapporti,
  // senza setState dentro un effect.
  const activeIndex =
    rapporti.length > 0
      ? Math.min(Math.max(selectedIndex, 0), rapporti.length - 1)
      : 0
  const setActiveIndex = setSelectedIndex

  const active = rapporti[activeIndex] || null
  const activeColor =
    active?.correntePrincipale?.colore ||
    coloriCorrenti?.[active?.correntePrincipale?.nome] ||
    FALLBACK_COLOR

  const radarData = useMemo(() => {
    if (!active?.datiRadar) return []
    return active.datiRadar.map((d) => ({
      corrente: d.corrente,
      valore: typeof d.valore === 'number' ? d.valore : 0,
    }))
  }, [active])

  const fadeDuration = reduceMotion ? 0 : 0.15

  return (
    <section
      aria-labelledby="quattro-rapporti-heading"
      style={{
        background: '#0f172a',
        padding: '120px 24px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* ── Header sezione ───────────────────────────────────────── */}
        <header style={{ marginBottom: 48 }}>
          <p
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: activeColor,
              opacity: 0.6,
              fontSize: 11,
              margin: 0,
            }}
          >
            {RAPPORTI_UI.eyebrow}
          </p>
          <h2
            id="quattro-rapporti-heading"
            className="report-tst-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              margin: '12px 0 16px',
              lineHeight: 1.1,
            }}
          >
            {RAPPORTI_UI.title}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              opacity: 0.5,
              color: '#ffffff',
              fontSize: '1rem',
              maxWidth: 560,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {RAPPORTI_UI.intro}
          </p>
        </header>

        {/* ── 4 card-tab (selezione orizzontale) ───────────────────── */}
        <div
          role="tablist"
          aria-label={RAPPORTI_UI.tablistAria}
          style={{
            display: 'grid',
            gap: 16,
            gridTemplateColumns:
              'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            marginBottom: 48,
          }}
        >
          {rapporti.map((r, i) => {
            const selected = i === activeIndex
            const color = r?.correntePrincipale?.colore || FALLBACK_COLOR
            return (
              <button
                key={r?.id ?? i}
                type="button"
                role="tab"
                id={`quattro-rapporti-tab-${r?.id ?? i}`}
                aria-selected={selected}
                aria-controls={`quattro-rapporti-panel-${r?.id ?? i}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(i)}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  minHeight: 44,
                  background: selected ? hexToRgba(color, 0.15) : '#1e293b',
                  border: selected
                    ? `1px solid ${hexToRgba(color, 0.6)}`
                    : '1px solid #334155',
                  borderRadius: 4,
                  padding: 20,
                  cursor: 'pointer',
                  transition: 'border-color 0.2s ease, background 0.2s ease',
                  boxShadow: 'none',
                  outlineOffset: 2,
                }}
              >
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    opacity: 0.3,
                    color: '#ffffff',
                    fontSize: 11,
                    display: 'block',
                  }}
                >
                  {pad2(i)}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1rem',
                    color: '#ffffff',
                    display: 'block',
                    margin: '8px 0 6px',
                  }}
                >
                  {r?.nome}
                </span>
                <span
                  style={{
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: 10,
                    opacity: 0.4,
                    color: '#ffffff',
                    display: 'block',
                  }}
                >
                  {r?.composizione}
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: 16,
                    bottom: 16,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: color,
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* ── Area principale: radar 55 / lettura 45 ───────────────── */}
        <div className="quattro-rapporti-main">
          {/* Colonna sinistra — RADAR GRANDE */}
          <div
            className="quattro-rapporti-radar"
            role="img"
            aria-label={
              active
                ? `Radar del rapporto ${active.nome}: livelli per le 5 correnti emotive.`
                : 'Radar dei rapporti'
            }
            style={{ width: '100%', minHeight: 400 }}
          >
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                <PolarAngleAxis dataKey="corrente" tick={<AxisTick />} />
                <Radar
                  dataKey="valore"
                  stroke={hexToRgba(activeColor, 0.8)}
                  strokeWidth={2}
                  fill={activeColor}
                  fillOpacity={0.3}
                  dot={{ r: 6, fill: activeColor, stroke: activeColor }}
                  isAnimationActive={!reduceMotion}
                  animationDuration={400}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Separatore verticale con numero del rapporto attivo */}
          <div className="quattro-rapporti-divider" aria-hidden="true">
            <span className="quattro-rapporti-divider-num">
              {pad2(activeIndex)}
            </span>
          </div>

          {/* Colonna destra — LETTURA DEL RAPPORTO */}
          <div
            className="quattro-rapporti-read"
            role="tabpanel"
            id={active ? `quattro-rapporti-panel-${active.id}` : undefined}
            aria-labelledby={
              active ? `quattro-rapporti-tab-${active.id}` : undefined
            }
          >
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id ?? activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fadeDuration }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  {/* 1. Nome rapporto grande */}
                  <h3
                    className="report-tst-display"
                    style={{
                      fontSize: '1.6rem',
                      margin: 0,
                    }}
                  >
                    {active.nome}
                  </h3>

                  {/* 2. Definizione */}
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      opacity: 0.7,
                      color: '#ffffff',
                      fontSize: '1rem',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    {active.definizione}
                  </p>

                  {/* 3. Composizione tecnica */}
                  <div>
                    <p style={labelStyle}>Composizione</p>
                    <p
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                        fontSize: '0.9rem',
                        color: activeColor,
                        margin: '4px 0 0',
                      }}
                    >
                      {active.composizione}
                    </p>
                  </div>

                  {/* 4. Cosa indica */}
                  <div>
                    <p style={labelStyle}>Cosa indica</p>
                    <p
                      style={{
                        fontFamily: 'var(--font-body)',
                        opacity: 0.8,
                        color: '#ffffff',
                        fontSize: '1rem',
                        lineHeight: 1.7,
                        margin: '4px 0 0',
                      }}
                    >
                      {active.cosaIndica}
                    </p>
                  </div>

                  {/* 5. Corrente prevalente */}
                  <div>
                    <p style={labelStyle}>Corrente prevalente</p>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        marginTop: 6,
                        background: hexToRgba(activeColor, 0.1),
                        border: `1px solid ${hexToRgba(activeColor, 0.3)}`,
                        padding: '6px 14px',
                        borderRadius: 2,
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: activeColor,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          color: '#ffffff',
                          fontSize: '0.95rem',
                        }}
                      >
                        {active.correntePrincipale?.nome}
                      </span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stili dedicati: responsive layout + reduced motion. */}
      <style>{`
        .quattro-rapporti-main {
          display: grid;
          grid-template-columns: 55fr 1px 45fr;
          gap: 32px;
          align-items: start;
        }
        .quattro-rapporti-divider {
          align-self: stretch;
          width: 1px;
          background: #1e293b;
          position: relative;
          min-height: 400px;
        }
        .quattro-rapporti-divider-num {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          font-size: 48px;
          color: #ffffff;
          opacity: 0.2;
        }
        @media (max-width: 768px) {
          .quattro-rapporti-main {
            grid-template-columns: 1fr;
          }
          .quattro-rapporti-divider {
            display: none;
          }
        }
        button[role="tab"]:focus-visible,
        .quattro-rapporti-read:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          button[role="tab"] {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  )
}

const labelStyle = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  textTransform: 'uppercase',
  fontSize: 10,
  opacity: 0.4,
  color: '#ffffff',
  letterSpacing: '0.1em',
  margin: 0,
}
