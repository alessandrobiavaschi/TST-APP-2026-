import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via `motion.div`
void motion
import { RAPPORTI_UI } from './reportUiCopy.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import SectionNumber from './SectionNumber.jsx'
import InfoTip from './InfoTip.jsx'
import CalculationDisclosure from './CalculationDisclosure.jsx'
import { scrollElementToReportCenter } from './reportSectionNavUtils.js'
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
const FAMILY_THEME_BY_KEY = Object.fromEntries(
  Object.values(FAMILY_THEME).map((theme) => [theme.key, theme]),
)

function normalizeFamilyDatum(datum = {}) {
  const familyTheme = FAMILY_THEME_BY_KEY[datum.familyKey]
  return {
    ...datum,
    // I confronti mostrano famiglie distinte. Le nature (per esempio Lunare
    // o Solare) appartengono al livello di dettaglio della singola famiglia.
    corrente: familyTheme?.family || datum.corrente,
  }
}

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

function AxisTick({ x, y, payload, textAnchor }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#e2e8f0"
      fontSize={13}
      fontFamily="'Public Sans', system-ui, -apple-system, sans-serif"
      dominantBaseline="central"
    >
      {payload?.value}
    </text>
  )
}

function RadarPoint({ cx, cy, payload, index, selectedFamilyKey, onSelect }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !payload) return null
  const selected = payload.familyKey === selectedFamilyKey
  const label = `${payload.corrente}: ${payload.valore} su 7. Seleziona per i dettagli.`
  return (
    <g
      role="button"
      tabIndex="0"
      aria-label={label}
      aria-pressed={selected}
      style={{ cursor: 'pointer' }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect?.(payload.familyKey, index)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onSelect?.(payload.familyKey, index)
      }}
    >
      <title>{label}</title>
      <circle cx={cx} cy={cy} r="14" fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={selected ? 7 : 5}
        fill={payload.colore || FALLBACK_COLOR}
        stroke={selected ? '#ffffff' : payload.colore || FALLBACK_COLOR}
        strokeWidth={selected ? 2.5 : 1.5}
        pointerEvents="none"
      />
    </g>
  )
}

function buildRapportiTitle(profilo = {}) {
  const family = profilo?.famiglia || 'Verde'
  const families = {
    Blu: { famiglia: 'Malinconica', natura: 'Lunare' },
    Rosso: { famiglia: 'Marziale', natura: 'Volitivo-collerica' },
    Verde: { famiglia: 'Flemmatica', natura: 'Contemplativa' },
    Giallo: { famiglia: 'Entusiasta', natura: 'Solare' },
    Grigio: { famiglia: 'Razionale', natura: 'Intellettuale-Razionale' },
  }
  const labels = families[family] || families.Verde
  return `Il quadro dei rapporti della famiglia ${labels.famiglia}, natura ${labels.natura}`
}

export default function QuattroRapporti({
  rapporti = [],
  coloriCorrenti = {},
  profilo = {},
  sottocorrenti = [],
  step = '2',
}) {
  const reduceMotion = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedFamilyByRapporto, setSelectedFamilyByRapporto] = useState({})
  const rapportiMainRef = useRef(null)
  const shouldCenterRapportoRef = useRef(false)

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
    return active.datiRadar.map((datum) => ({
      ...normalizeFamilyDatum(datum),
      valore: typeof datum.valore === 'number' ? datum.valore : 0,
    }))
  }, [active])

  const selectedFamilyKey =
    selectedFamilyByRapporto[active?.id] || active?.correntePrincipale?.familyKey || radarData[0]?.familyKey
  const selectedFamily =
    radarData.find((item) => item.familyKey === selectedFamilyKey) || radarData[0] || null
  const selectedTheme = FAMILY_THEME_BY_KEY[selectedFamily?.familyKey]
  const selectedShades = sottocorrenti.filter(
    (item) => item.familyKey === selectedFamily?.familyKey && item.misurabile !== false,
  )
  const ranking = active?.graduatoria?.length
    ? active.graduatoria.map(normalizeFamilyDatum)
    : [...radarData].sort((a, b) => b.valore - a.valore || b.rawValue - a.rawValue)

  const selectFamily = (familyKey) => {
    if (!active?.id || !familyKey) return
    setSelectedFamilyByRapporto((current) => ({ ...current, [active.id]: familyKey }))
  }

  const fadeDuration = reduceMotion ? 0 : 0.15

  const selectRapporto = (index) => {
    shouldCenterRapportoRef.current = true
    if (index === selectedIndex) {
      window.requestAnimationFrame(() => {
        shouldCenterRapportoRef.current = false
        scrollElementToReportCenter(rapportiMainRef.current, {
          reduceMotion,
          placement: 'start',
        })
      })
    }
    setSelectedIndex(index)
  }

  useEffect(() => {
    if (!shouldCenterRapportoRef.current) return undefined
    shouldCenterRapportoRef.current = false
    const raf = window.requestAnimationFrame(() => {
      scrollElementToReportCenter(rapportiMainRef.current, {
        reduceMotion,
        placement: 'start',
      })
    })
    return () => window.cancelAnimationFrame(raf)
  }, [selectedIndex, reduceMotion])

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
            const lensCopy = RAPPORTI_LENS_BY_ID[r?.id]
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
                onClick={() => selectRapporto(i)}
              >
                <SectionNumber value={i + 1} size="sm" className="quattro-rapporti-tab__index" />
                <span className="quattro-rapporti-tab__name">{r?.nome}</span>
                <span className="quattro-rapporti-tab__meaning">{lensCopy?.plain}</span>
                <span className="quattro-rapporti-tab__dot" aria-hidden="true" />
              </button>
            )
          })}
        </div>

        <div ref={rapportiMainRef} className="quattro-rapporti-main">
          <div className="quattro-rapporti-radar-wrap">
            <div
              className="quattro-rapporti-radar"
              role="group"
              aria-label={
                active
                  ? `Radar del rapporto ${active.nome}: ${RAPPORTI_UI.radarCaption}`
                  : 'Radar dei rapporti'
              }
            >
              <ResponsiveContainer width="100%" height={320} debounce={100}>
                <RadarChart data={radarData} outerRadius="64%">
                  <PolarGrid stroke="#334155" strokeOpacity={0.5} />
                  <PolarAngleAxis
                    dataKey="corrente"
                    tick={<AxisTick />}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 7]}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                  />
                  <Radar
                    dataKey="valore"
                    stroke={hexToRgba(activeColor, 0.9)}
                    strokeWidth={2.5}
                    fill={activeColor}
                    fillOpacity={0.15}
                    dot={(
                      <RadarPoint
                        selectedFamilyKey={selectedFamilyKey}
                        onSelect={selectFamily}
                      />
                    )}
                    isAnimationActive={!reduceMotion}
                    animationDuration={400}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="quattro-rapporti-radar-guide">
                <p className="quattro-rapporti-radar-caption">{RAPPORTI_UI.radarCaption}</p>
                <p className="quattro-rapporti-radar-scale">{RAPPORTI_UI.radarScaleNote}</p>
              </div>
              {ranking.length ? (
                <div className="quattro-rapporti-ranking" aria-label="Classifica completa delle famiglie in questa lente">
                  <p className="quattro-rapporti-ranking__summary">
                    {active.esitoComposizione || 'Confronta tutti i valori della lente.'}
                  </p>
                  <div className="quattro-rapporti-ranking__list">
                    {ranking.map((item, index) => {
                      const sameGraphLevel = index > 0 && item.valore === ranking[index - 1].valore
                      const tied = sameGraphLevel && item.rawValue === ranking[index - 1].rawValue
                      return (
                        <button
                          key={item.familyKey}
                          type="button"
                          className={`quattro-rapporti-ranking__item${item.familyKey === selectedFamilyKey ? ' quattro-rapporti-ranking__item--selected' : ''}`}
                          style={{ '--qr-family-color': item.colore || FALLBACK_COLOR }}
                          aria-pressed={item.familyKey === selectedFamilyKey}
                          onClick={() => selectFamily(item.familyKey)}
                        >
                          <span>
                            {item.corrente}
                            {tied ? ' · pari punti' : sameGraphLevel ? ' · stesso livello grafico' : ''}
                          </span>
                          <strong>{item.valore}/7</strong>
                          <small>
                            {item.rawValue} punti · {item.distributionPercent}% della lente
                          </small>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
              {selectedFamily ? (
                <div
                  className="quattro-rapporti-radar-detail"
                  aria-live="polite"
                  style={{
                    '--qr-selected-color': selectedFamily.colore || selectedTheme?.dot || activeColor,
                  }}
                >
                  <div className="quattro-rapporti-radar-detail__heading">
                    <strong>{selectedFamily.corrente}</strong>
                    {selectedTheme?.characteristic ? (
                      <span>natura {selectedTheme.characteristic.toLowerCase()}</span>
                    ) : null}
                  </div>
                  <p className="quattro-rapporti-radar-detail__value">
                    {selectedFamily.valore}/7 · {selectedFamily.distributionPercent ?? 0}% dei punti di questa lente
                  </p>
                  {selectedShades.length ? (
                    <div className="quattro-rapporti-shades">
                      <p>Sfumature della famiglia nel profilo complessivo</p>
                      <ul>
                        {selectedShades.map((shade) => (
                          <li key={shade.rawKey}>
                            <span>{shade.nome}</span>
                            <strong>{shade.percentuale}%</strong>
                          </li>
                        ))}
                      </ul>
                      <small>
                        Queste percentuali non appartengono alla singola lente: indicano l'attivazione
                        complessiva di ogni sfumatura sul suo massimo teorico. Sono indipendenti e non
                        devono sommare a 100%.
                      </small>
                    </div>
                  ) : null}
                  <CalculationDisclosure>
                    <div className="calculation-disclosure__method">
                      <p>{active.composizioneSemplice}</p>
                      <p><strong>Risposte considerate:</strong> {active.composizione}</p>
                    </div>
                    <div className="calculation-disclosure__metrics">
                      <p><strong>Punti ottenuti:</strong> {selectedFamily.rawValue ?? 0}</p>
                      <p><strong>Presenza in questo rapporto:</strong> {selectedFamily.distributionPercent ?? 0}%</p>
                      <p><strong>Valore nel grafico:</strong> {selectedFamily.valore} su 7</p>
                    </div>
                    {selectedFamily.maxRawPoints > 0 && selectedFamily.rawValue > 0 ? (
                      <p className="calculation-disclosure__formula">
                        Formula: {selectedFamily.rawValue ?? 0} ÷ {selectedFamily.maxRawPoints} × 7,
                        arrotondata all'intero più vicino. La famiglia con più punti vale quindi 7;
                        le altre sono proporzionate allo stesso massimo. Il{' '}
                        {selectedFamily.distributionPercent ?? 0}% indica invece la quota di{' '}
                        {selectedFamily.rawValue ?? 0} punti sui {selectedFamily.totalRawPoints ?? 0}{' '}
                        complessivi della lente. Più famiglie possono raggiungere 7 per effetto
                        dell'arrotondamento: i punti grezzi permettono di distinguere un vero pari merito.
                        Un 7, un 6 e un 5 restano tutti visibili e descrivono un profilo composto.
                      </p>
                    ) : selectedFamily.maxRawPoints > 0 ? (
                      <p className="calculation-disclosure__formula">
                        Questa famiglia ha ottenuto 0 punti e rappresenta lo 0% della lente. Per la
                        sola leggibilità del poligono, il radar mostra il minimo visuale 1/7: non è
                        un punto ottenuto né una presenza misurata.
                      </p>
                    ) : (
                      <p className="calculation-disclosure__formula">
                        Non ci sono punti sufficienti per calcolare questa lente.
                      </p>
                    )}
                  </CalculationDisclosure>
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
                    <SectionNumber value={activeIndex + 1} size="sm" className="quattro-rapporti-read__index-prefix" />
                    {active.nome}
                  </h3>

                  {active.sottotitolo ? (
                    <p className="quattro-rapporti-read__question">{active.sottotitolo}</p>
                  ) : null}

                  {active.cosaIndica ? (
                    <p className="quattro-rapporti-read__subtitle">{active.cosaIndica}</p>
                  ) : null}

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
