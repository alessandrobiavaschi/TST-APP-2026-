import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via `motion.div`
void motion
import { RAPPORTI_UI } from './reportUiCopy.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import InfoTip from './InfoTip.jsx'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import '../../styles/quattro-rapporti.css'

const FALLBACK_COLOR = '#94a3b8'
const RAPPORTI_LENS_BY_ID = (RAPPORTI_UI.lensCards || []).reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {})

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

function AxisTick({ x, y, payload, textAnchor, index, onSelect }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#94a3b8"
      fontSize={11}
      fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
      dominantBaseline="central"
      role="button"
      tabIndex="0"
      style={{ cursor: 'pointer' }}
      onClick={() => onSelect?.(index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onSelect?.(index)
      }}
    >
      {payload?.value}
    </text>
  )
}

function buildRapportiTitle(profilo = {}) {
  const family = profilo?.famiglia || 'Verde'
  const names = {
    Blu: 'Malinconico-Nostalgica',
    Rosso: 'Volitivo-Collerica',
    Verde: 'Calma Flemmatica',
    Giallo: 'Sanguigno-Entusiasta',
    Grigio: 'Anaffettiva-Nichilista',
  }
  const nomeNatura = names[family] || names.Verde
  return `Il quadro dei rapporti della natura ${nomeNatura}`
}

export default function QuattroRapporti({
  rapporti = [],
  coloriCorrenti = {},
  profilo = {},
  step = '2',
}) {
  const reduceMotion = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedFamilyIndex, setSelectedFamilyIndex] = useState(0)

  const activeIndex =
    rapporti.length > 0
      ? Math.min(Math.max(selectedIndex, 0), rapporti.length - 1)
      : 0

  const active = rapporti[activeIndex] || null
  const activeColor =
    active?.correntePrincipale?.colore ||
    coloriCorrenti?.[active?.correntePrincipale?.nome] ||
    FALLBACK_COLOR

  const radarData = useMemo(() => {
    if (!active?.datiRadar) return []
    return active.datiRadar.map((d) => ({
      ...d,
      valore: typeof d.valore === 'number' ? d.valore : 0,
    }))
  }, [active])

  const selectedFamily = radarData[selectedFamilyIndex] || radarData[0] || null

  const handleRadarClick = (state) => {
    if (typeof state?.activeTooltipIndex === 'number') {
      setSelectedFamilyIndex(state.activeTooltipIndex)
    }
  }

  const fadeDuration = reduceMotion ? 0 : 0.15

  return (
    <section
      aria-labelledby="quattro-rapporti-heading"
      className="quattro-rapporti-section"
      style={{ '--qr-accent': activeColor }}
    >
      <div className="quattro-rapporti-section__inner">
        <ReportPassageHeader
          step={step}
          eyebrow={RAPPORTI_UI.eyebrow}
          title={buildRapportiTitle(profilo)}
          lead={
            <>
              {"Viene osservato da prospettive diverse: la tua natura di base, il rapporto con te stesso, il rapporto con l’altro e il rapporto con l’agire."}{' '}
              <InfoTip
                tip="I quattro rapporti leggono lo stesso profilo in quattro direzioni: Natura (tono emotivo stabile), Sé (interiorità), Altro (relazione) e Agire (movimento). Il valore (1–7) non è un voto, ma indica la forza della famiglia prevalente in quella direzione. I grafici usano questa scala interna 1–7, non le percentuali di attivazione della sintesi."
                term="Guida alla lettura dei rapporti"
                variant="button"
              />
            </>
          }
          accentColor={activeColor}
          titleId="quattro-rapporti-heading"
        />

        <p className="quattro-rapporti-intro-text" style={{
          fontSize: '1.05rem',
          lineHeight: '1.6',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '1.75rem',
          maxWidth: '860px',
          marginInline: 'auto'
        }}>
          Il tuo profilo emotivo si articola in quattro aspetti.
        </p>

        <div role="tablist" aria-label={RAPPORTI_UI.tablistAria} className="quattro-rapporti-tabs">
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
                className={`quattro-rapporti-tab${selected ? ' quattro-rapporti-tab--selected' : ''}`}
                style={{ '--qr-tab-color': color }}
                onClick={() => setSelectedIndex(i)}
              >
                <span className="quattro-rapporti-tab__index">{pad2(i)}</span>
                <span className="quattro-rapporti-tab__name">{r?.nome}</span>
                <span className="quattro-rapporti-tab__meta">{r?.composizione}</span>
                <span className="quattro-rapporti-tab__dot" aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div className="quattro-rapporti-main">
          <div className="quattro-rapporti-radar-wrap">
            <div
              className="quattro-rapporti-radar"
              role="img"
              aria-label={
                active
                  ? `Radar del rapporto ${active.nome}: ${RAPPORTI_UI.radarCaption}`
                  : 'Radar dei rapporti'
              }
            >
              <ResponsiveContainer width="100%" height={320} debounce={100}>
                <RadarChart data={radarData} outerRadius="72%" onClick={handleRadarClick}>
                  <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                  <PolarAngleAxis
                    dataKey="corrente"
                    tick={<AxisTick onSelect={setSelectedFamilyIndex} />}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[1, 7]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                  />
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
              <div className="quattro-rapporti-radar-guide">
                <p className="quattro-rapporti-radar-caption">{RAPPORTI_UI.radarCaption}</p>
                <p className="quattro-rapporti-radar-scale">{RAPPORTI_UI.radarScaleNote}</p>
              </div>
              {selectedFamily ? (
                <div className="quattro-rapporti-radar-detail" aria-live="polite">
                  <strong>{selectedFamily.familyLabel || selectedFamily.corrente}</strong>
                  <span>Punteggio grezzo: {selectedFamily.rawValue ?? 0}</span>
                  <span>Formalizzazione: {selectedFamily.valore}/7</span>
                  <span>Distribuzione interiore: {selectedFamily.distributionPercent ?? 0}%</span>
                  <small>
                    Calcolo 1–7: {selectedFamily.calculation}. Distribuzione: punteggio grezzo diviso
                    per la somma dei punti delle cinque famiglie in questa prospettiva.
                  </small>
                </div>
              ) : null}
            </div>
          </div>

          <div className="quattro-rapporti-divider" aria-hidden="true" />

          <div
            className="quattro-rapporti-read"
            role="tabpanel"
            id={active ? `quattro-rapporti-panel-${active.id}` : undefined}
            aria-labelledby={active ? `quattro-rapporti-tab-${active.id}` : undefined}
          >
            <AnimatePresence mode="wait">
              {active && (
                <motion.div
                  key={active.id ?? activeIndex}
                  className="quattro-rapporti-read__content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: fadeDuration }}
                >
                  <h3 className="quattro-rapporti-read__title">
                    <span className="quattro-rapporti-read__index-prefix">{pad2(activeIndex)} · </span>
                    {active.nome}
                  </h3>

                  {active.levelLabel ? (
                    <p
                      className="quattro-rapporti-read__level-label"
                      style={{
                        display: 'inline-block',
                        marginTop: '0.35rem',
                        marginBottom: '0.75rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '999px',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        background: hexToRgba(activeColor, 0.18),
                        color: activeColor,
                        border: `1px solid ${hexToRgba(activeColor, 0.35)}`,
                      }}
                    >
                      {active.levelLabel}
                    </p>
                  ) : null}

                  {active.sottotitolo ? (
                    <p className="quattro-rapporti-read__question">{active.sottotitolo}</p>
                  ) : null}

                  <div className="quattro-rapporti-read__block">
                    <p className="quattro-rapporti-read__label">
                      {RAPPORTI_UI.readLabels.cosaIndica}
                    </p>
                    <p className="quattro-rapporti-read__text">{active.cosaIndica}</p>
                  </div>

                  <div className="quattro-rapporti-read__block">
                    <p className="quattro-rapporti-read__label">
                      Lettura del risultato
                    </p>
                    <p className="quattro-rapporti-read__text">{active.definizione}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
