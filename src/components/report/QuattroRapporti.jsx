import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via `motion.div`
void motion
import { RAPPORTI_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import PlainLanguageBox from './PlainLanguageBox.jsx'
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
  const [showRadarDetail, setShowRadarDetail] = useState(false)

  const compareLevels = useMemo(() => {
    return rapporti.map((r) => {
      const values = (r?.datiRadar || []).map((d) => Number(d.valore) || 0)
      const level = values.length ? Math.max(...values) : 0
      return {
        id: r?.id,
        nome: r?.nome,
        level,
        color: r?.correntePrincipale?.colore || FALLBACK_COLOR,
      }
    })
  }, [rapporti])

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
      corrente: d.corrente,
      valore: typeof d.valore === 'number' ? d.valore : 0,
    }))
  }, [active])

  const fadeDuration = reduceMotion ? 0 : 0.15

  return (
    <section
      aria-labelledby="quattro-rapporti-heading"
      className="quattro-rapporti-section"
      style={{ '--qr-accent': activeColor }}
    >
      <div className="quattro-rapporti-section__inner">
        <ReportPassageHeader
          step="3"
          eyebrow={RAPPORTI_UI.eyebrow}
          title={RAPPORTI_UI.title}
          lead={RAPPORTI_UI.intro}
          accentColor={activeColor}
          titleId="quattro-rapporti-heading"
        />

        <PlainLanguageBox
          title={RAPPORTI_UI.scaleBannerTitle}
          accentColor={activeColor}
          className="quattro-rapporti-scale-banner"
        >
          {RAPPORTI_UI.scaleBanner}
        </PlainLanguageBox>

        <div className="quattro-rapporti-compare" aria-label="Confronto rapido dei quattro rapporti">
          {compareLevels.map((item, i) => (
            <button
              key={item.id ?? i}
              type="button"
              className={`quattro-rapporti-compare-card${i === activeIndex ? ' quattro-rapporti-compare-card--active' : ''}`}
              style={{ '--qr-accent': item.color }}
              onClick={() => setSelectedIndex(i)}
            >
              <span className="quattro-rapporti-compare-card__name">{item.nome}</span>
              <span className="quattro-rapporti-compare-card__track" aria-hidden="true">
                <span
                  className="quattro-rapporti-compare-card__fill"
                  style={{ width: `${Math.round((item.level / 7) * 100)}%` }}
                />
              </span>
              <span className="quattro-rapporti-compare-card__value">
                {item.level > 0 ? `${item.level}/7` : '—'}
              </span>
            </button>
          ))}
        </div>

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
            <button
              type="button"
              className="quattro-rapporti-radar-toggle"
              aria-expanded={showRadarDetail}
              onClick={() => setShowRadarDetail((prev) => !prev)}
            >
              {showRadarDetail ? 'Nascondi grafico radar' : 'Approfondisci grafico radar'}
            </button>
            {showRadarDetail ? (
          <div
            className="quattro-rapporti-radar"
            role="img"
            aria-label={
              active
                ? `Radar del rapporto ${active.nome}: ${RAPPORTI_UI.radarCaption}`
                : 'Radar dei rapporti'
            }
          >
            <p className="quattro-rapporti-radar-caption">{RAPPORTI_UI.radarCaption}</p>
            <p className="quattro-rapporti-radar-scale">{RAPPORTI_UI.radarScaleNote}</p>
            <ResponsiveContainer width="100%" height={320} debounce={100}>
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                <PolarAngleAxis dataKey="corrente" tick={<AxisTick />} />
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
          </div>
            ) : null}
          </div>

          <div className="quattro-rapporti-divider" aria-hidden="true">
            <span className="quattro-rapporti-divider-num">{pad2(activeIndex)}</span>
          </div>

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
                  <h3 className="quattro-rapporti-read__title">{active.nome}</h3>

                  <p className="quattro-rapporti-read__definition">{active.definizione}</p>

                  <div className="quattro-rapporti-read__block">
                    <p className="quattro-rapporti-read__label">
                      {RAPPORTI_UI.readLabels.composizione}
                    </p>
                    <p className="quattro-rapporti-read__mono">{active.composizione}</p>
                  </div>

                  <div className="quattro-rapporti-read__block">
                    <p className="quattro-rapporti-read__label">
                      {RAPPORTI_UI.readLabels.cosaIndica}
                    </p>
                    <p className="quattro-rapporti-read__text">{active.cosaIndica}</p>
                  </div>

                  <div className="quattro-rapporti-read__block">
                    <p className="quattro-rapporti-read__label">
                      {RAPPORTI_UI.correntePrincipaleLabel}
                    </p>
                    <span className="quattro-rapporti-read__badge">
                      <span className="quattro-rapporti-read__badge-dot" aria-hidden="true" />
                      <span className="quattro-rapporti-read__badge-label">
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
    </section>
  )
}
