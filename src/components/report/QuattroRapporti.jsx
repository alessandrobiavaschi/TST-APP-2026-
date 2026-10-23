import React, { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

void motion
import { RAPPORTI_UI } from './reportUiCopy.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import SectionNumber from './SectionNumber.jsx'
import CalculationDisclosure from './CalculationDisclosure.jsx'
import { CompositionFamilyCards } from './CompositionContentCards.jsx'
import { buildProgressiveContentViewModel } from '../../utils/buildProgressiveContentViewModel.js'
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'
import '../../styles/quattro-rapporti.css'
import { ensureContrast } from '../../utils/contrastSafeColor.js'
import { useDialogFocus } from '../../hooks/useDialogFocus.js'

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

function splitSottotitolo(sottotitolo, fallback) {
  const match = typeof sottotitolo === 'string' ? sottotitolo.match(/^(.*?)\s*\(([^)]+)\)\s*$/) : null
  if (match) return { main: match[1], sub: match[2] }
  return { main: sottotitolo || fallback || '', sub: '' }
}

function AxisTick({ x, y, payload, textAnchor }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={textAnchor}
      fill="#e2e8f0"
      fontSize={13}
      fontFamily="'Manrope', system-ui, -apple-system, sans-serif"
      dominantBaseline="central"
    >
      {payload?.value}
    </text>
  )
}

function RadarTooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null

  return (
    <div
      className="quattro-rapporti-radar-tooltip"
      style={{ '--qr-tooltip-color': ensureContrast(item.colore || FALLBACK_COLOR) }}
    >
      <span className="quattro-rapporti-radar-tooltip__family">{item.corrente}</span>
      <strong className="quattro-rapporti-radar-tooltip__value">{item.valore}/7</strong>
      <small>
        {item.rawValue ?? 0} punti · {item.distributionPercent ?? 0}% della lente
      </small>
    </div>
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
        fill={ensureContrast(payload.colore || FALLBACK_COLOR)}
        stroke={selected ? '#ffffff' : ensureContrast(payload.colore || FALLBACK_COLOR)}
        strokeWidth={selected ? 2.5 : 1.5}
        pointerEvents="none"
      />
    </g>
  )
}

const RELATIONSHIP_ROWS = [
  ['Flemmatica + Malinconica', 'Modulazione', 'Calma e interiorità si accompagnano, senza essere in opposizione.'],
  ['Flemmatica + Marziale', 'Tensione', 'La pausa e la moderazione incontrano la spinta ad agire.'],
  ['Flemmatica + Entusiasta', 'Tensione', 'La quiete incontra il movimento e l’eccitazione.'],
  ['Marziale + Entusiasta', 'Affinità dinamica', 'Volontà e slancio si sostengono a vicenda.'],
  ['Marziale + Malinconica', 'Compensazione', 'Azione e riflessione si bilanciano.'],
  ['Razionale + Marziale / Entusiasta', 'Tensione', 'Distanza osservativa e slancio si confrontano.'],
  ['Razionale + Malinconica / Flemmatica', 'Attenuazione', 'La distanza razionale rende più misurata l’intensità emotiva.'],
]

function RapportiHelpModal({ onClose }) {
  const [page, setPage] = useState(1)
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)

  useDialogFocus(dialogRef, { open: true, onClose, initialFocusRef: closeButtonRef })

  return (
    <div className="quattro-rapporti-help" role="presentation" onMouseDown={onClose}>
      <section
        ref={dialogRef}
        className="quattro-rapporti-help__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quattro-rapporti-help-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="quattro-rapporti-help__close"
          aria-label="Chiudi la guida ai quattro rapporti"
          onClick={onClose}
        >
          ×
        </button>
        <p className="quattro-rapporti-help__eyebrow">Guida semplice</p>
        <h2 id="quattro-rapporti-help-title">
          {page === 1 ? 'Come si formano i quattro rapporti' : 'Come le famiglie cambiano la lettura'}
        </h2>

        {page === 1 ? (
          <div className="quattro-rapporti-help__page">
            <p>
              Ogni rapporto somma soltanto alcune parti del test. Per ciascuna delle cinque famiglie
              emotive confrontiamo quei punteggi: la famiglia che incide di più orienta la lettura.
            </p>
            <div className="quattro-rapporti-help__formula-list">
              <div><strong>Natura di base</strong><span>Suono + Distanze tra le note + Accordi</span></div>
              <div><strong>Rapporto con te stesso</strong><span>Distanze tra le note + Melodia</span></div>
              <div><strong>Rapporto con l’Altro</strong><span>Suono + Melodia</span></div>
              <div><strong>Rapporto con l’Agire</strong><span>Scala 1–7, per il triangolo</span></div>
            </div>
            <p className="quattro-rapporti-help__note">
              Non è un voto: è un modo per capire quale componente del tuo profilo è più rilevante in quella situazione.
            </p>
          </div>
        ) : (
          <div className="quattro-rapporti-help__page">
            <p>
              Ogni lente usa una componente principale e la mette in relazione con la tua natura di base:
              Malinconica per il rapporto con te stesso, Entusiasta per l’Altro, Marziale per l’Agire.
            </p>
            <div className="quattro-rapporti-help__relationship-list">
              {RELATIONSHIP_ROWS.map(([pair, type, copy]) => (
                <div key={pair}>
                  <strong>{pair}</strong>
                  <span>{type}</span>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="quattro-rapporti-help__footer">
          <span>Pagina {page} di 2</span>
          <button type="button" onClick={() => setPage((current) => current === 1 ? 2 : 1)}>
            {page === 1 ? 'Vedi le relazioni tra famiglie' : 'Torna ai calcoli'}
          </button>
        </footer>
      </section>
    </div>
  )
}

export default function QuattroRapporti({
  rapporti = [],
  coloriCorrenti = {},
  sottocorrenti = [],
}) {
  const reduceMotion = useReducedMotion()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [selectedFamilyByRapporto, setSelectedFamilyByRapporto] = useState({})
  const [approfondimentoOpen, setApprofondimentoOpen] = useState(false)

  const activeIndex = rapporti.length > 0
    ? Math.min(Math.max(selectedIndex, 0), rapporti.length - 1)
    : 0
  const active = rapporti[activeIndex] || null
  const activeColor = ensureContrast(
    active?.correntePrincipale?.colore ||
    coloriCorrenti?.[active?.correntePrincipale?.nome] ||
    FALLBACK_COLOR
  )
  const fadeDuration = reduceMotion ? 0 : 0.3

  const sintesiParagraphs = Array.isArray(active?.sintesiBreveParagrafi) && active.sintesiBreveParagrafi.length
    ? active.sintesiBreveParagrafi
    : active?.definizione ? [active.definizione] : []
  const [leadParagraph, ...restParagraphs] = sintesiParagraphs
  const { main: titleMain, sub: titleSub } = splitSottotitolo(active?.sottotitolo, active?.nome)

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
  const selectedShades = sottocorrenti.filter(
    (item) => item.familyKey === selectedFamily?.familyKey && item.misurabile !== false,
  )
  const ranking = active?.graduatoria?.length
    ? active.graduatoria.map(normalizeFamilyDatum)
    : [...radarData].sort((a, b) => b.valore - a.valore || b.rawValue - a.rawValue)
  const agoDellaBilancia = active?.agoDellaBilancia || null
  const relationBreakdown = active?.relationBreakdown || null
  // Schede famiglia per QUESTO rapporto: primary/companion nell'approfondimento contestuale,
  // marginal soltanto nella composizione completa. displayPriority segue sempre localRanking.
  const rapportoViewModel = useMemo(
    () => buildProgressiveContentViewModel({
      ranking: active?.relationContract?.localRanking,
      contentCards: active?.contentCards || {},
    }),
    [active],
  )

  const selectFamily = (familyKey) => {
    if (!active?.id || !familyKey) return
    setSelectedFamilyByRapporto((current) => ({ ...current, [active.id]: familyKey }))
  }

  useEffect(() => {
    if (!isHelpOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [isHelpOpen])

  const selectRapporto = (index) => {
    if (index !== selectedIndex) setApprofondimentoOpen(false)
    setSelectedIndex(index)
  }

  return (
    <section
      aria-label="I quattro rapporti"
      className="quattro-rapporti-section"
      style={{ '--qr-accent': activeColor }}
    >
      <div className="quattro-rapporti-section__inner">
        <p className="quattro-rapporti-intro">
          La famiglia prevalente nel singolo rapporto può essere diversa da quella generale: non è una
          contraddizione, mostra come le diverse correnti assumono pesi differenti nei diversi ambiti
          dell’esperienza sonora.
        </p>

        <div className={`quattro-rapporti-toolbar${approfondimentoOpen ? ' quattro-rapporti-toolbar--sticky' : ''}`}>
          <div
            role="tablist"
            aria-label={RAPPORTI_UI.tablistAria}
            className="quattro-rapporti-tabs"
          >
            {rapporti.map((r, i) => {
              const selected = i === activeIndex
              const color = ensureContrast(r?.correntePrincipale?.colore || FALLBACK_COLOR)
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
                </button>
              )
            })}
          </div>

          <div className="quattro-rapporti-toolbar__aside">
            <div className="quattro-rapporti-pager" role="group" aria-label="Naviga tra i quattro rapporti">
              <button
                type="button"
                className="quattro-rapporti-pager__btn"
                aria-label="Rapporto precedente"
                disabled={activeIndex === 0}
                onClick={() => selectRapporto(Math.max(activeIndex - 1, 0))}
              >
                ‹
              </button>
              <span className="quattro-rapporti-pager__count">
                {activeIndex + 1} di {rapporti.length}
              </span>
              <button
                type="button"
                className="quattro-rapporti-pager__btn"
                aria-label="Rapporto successivo"
                disabled={activeIndex === rapporti.length - 1}
                onClick={() => selectRapporto(Math.min(activeIndex + 1, rapporti.length - 1))}
              >
                ›
              </button>
            </div>
            <button
              type="button"
              className="quattro-rapporti-help-trigger"
              aria-label="Apri la guida su come vengono calcolati i quattro rapporti"
              onClick={() => setIsHelpOpen(true)}
            >
              ?
            </button>
          </div>
        </div>

        <div className="quattro-rapporti-main quattro-rapporti-stage">
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
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                initialDimension={{ width: 320, height: 380 }}
                debounce={100}
              >
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
                  <Tooltip
                    content={<RadarTooltipContent />}
                    cursor={false}
                    wrapperStyle={{ pointerEvents: 'none', zIndex: 4 }}
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
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: fadeDuration, ease: 'easeOut' }}
                >
                  <div className="quattro-rapporti-read__heading">
                    <SectionNumber value={activeIndex + 1} size="md" className="quattro-rapporti-read__index-prefix" />
                    <div className="quattro-rapporti-read__heading-text">
                      <h3 className="quattro-rapporti-read__title">{titleMain}</h3>
                      {titleSub ? <p className="quattro-rapporti-read__subtitle">{titleSub}</p> : null}
                    </div>
                  </div>

                  {active.levelLabel ? <p className="quattro-rapporti-read__level-label">{active.levelLabel}</p> : null}

                  {leadParagraph ? (
                    <p className="quattro-rapporti-read__text quattro-rapporti-read__text--lead">{leadParagraph}</p>
                  ) : null}

                  <CalculationDisclosure
                    label="Approfondisci il rapporto"
                    className="quattro-rapporti-approfondisci"
                    onOpenChange={setApprofondimentoOpen}
                  >
                    {restParagraphs.length ? (
                      <div className="quattro-rapporti-read__block">
                        {restParagraphs.map((paragraph, index) => (
                          <p key={`${active.id}-summary-${index}`} className="quattro-rapporti-read__text">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {rapportoViewModel.primaryFamilies.length || rapportoViewModel.hasCompanion ? (
                      <div className="quattro-rapporti-read__block quattro-rapporti-read__block--composition">
                        {rapportoViewModel.primaryFamilies.length ? (
                          <CompositionFamilyCards cards={rapportoViewModel.primaryFamilies} />
                        ) : null}
                        {rapportoViewModel.hasCompanion ? (
                          <CompositionFamilyCards cards={rapportoViewModel.companionFamilies} />
                        ) : null}
                      </div>
                    ) : null}

                    <CalculationDisclosure
                      label="Vedi calcoli e relazioni tra le famiglie"
                      className="quattro-rapporti-toggle"
                    >
                      <div className="qr-toggle-section">
              <h4>Da cosa nasce questo rapporto</h4>
              {active.composizioneSemplice ? <p>{active.composizioneSemplice}</p> : null}
              {active.composizione && active.id !== 'agire' ? (
                <p>
                  <strong>{RAPPORTI_UI.readLabels?.composizione || 'Aree sonore usate'}:</strong> {active.composizione}
                </p>
              ) : null}
            </div>

            <div className="qr-toggle-section">
              <h4>Come leggere il grafico</h4>
              <p className="quattro-rapporti-radar-caption">{RAPPORTI_UI.radarCaption}</p>
              <p className="quattro-rapporti-radar-scale">{RAPPORTI_UI.radarScaleNote}</p>
            </div>

            <div className="qr-toggle-section">
              <h4>Classifica delle famiglie</h4>
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
                      style={{ '--qr-family-color': ensureContrast(item.colore || FALLBACK_COLOR) }}
                      aria-pressed={item.familyKey === selectedFamilyKey}
                      onClick={() => selectFamily(item.familyKey)}
                    >
                      <span>
                        {index + 1}ª · {item.corrente}
                        {tied ? ' · pari punti' : sameGraphLevel ? ' · stesso livello grafico' : ''}
                      </span>
                      <strong>{item.valore}/7</strong>
                      {active.id !== 'agire' ? (
                        <small>
                          {item.rawValue} punti · {item.distributionPercent}% della lente
                        </small>
                      ) : null}
                    </button>
                  )
                })}
              </div>
              {selectedFamily ? (
                <div className="qr-toggle-family-detail">
                  {selectedShades.length ? (
                    <div className="quattro-rapporti-shades">
                      <p>Sfumature di {selectedFamily.corrente} nel profilo complessivo</p>
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
                  {active.id === 'agire' ? (
                    <p className="calculation-disclosure__formula">
                      Il valore va da 1 a 7: indica la vivacità di questa esperienza e viene
                      rappresentato graficamente nel triangolo.
                    </p>
                  ) : selectedFamily.maxRawPoints > 0 && selectedFamily.rawValue > 0 ? (
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
                </div>
              ) : null}
            </div>

            {/* Blocco tecnico "ago della bilancia" volutamente non renderizzato in questa fase
                (Fase 2B): agoDellaBilancia/relationBreakdown restano disponibili internamente
                per una futura UX basata su referenceFamily/relationContract. */}

            {relationBreakdown?.others?.length ? (
              <div className="qr-toggle-section">
                <h4>Influenze</h4>
                <ul className="qr-toggle-list">
                  {relationBreakdown.others.map((item) => (
                    <li key={item.familyKey}>
                      <strong>{item.corrente}</strong> — {item.distributionPercent}% (distanza di{' '}
                      {item.gap} punti percentuali da {agoDellaBilancia?.nome}): influenza{' '}
                      {item.influenceDescriptor}.
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="qr-toggle-section">
              <h4>Relazioni e tensioni</h4>
              {relationBreakdown?.tensions?.length ? (
                <ul className="qr-toggle-list">
                  {relationBreakdown.tensions.map((item) => (
                    <li key={item.familyKey}>
                      {agoDellaBilancia?.nome} e {item.corrente}: {item.relation.copy} Distanza di{' '}
                      {item.gap} punti percentuali — tensione {item.tensionDescriptor}.
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {relationBreakdown?.supportsStrongReference === false
                    ? 'La componente di riferimento è troppo debole per mettere in primo piano un\'opposizione teorica.'
                    : 'Nessuna tensione significativa rilevata in base alla matrice delle famiglie per questo rapporto.'}
                </p>
              )}
            </div>

            <div className="qr-toggle-section">
              <h4>Armonia</h4>
              {relationBreakdown?.harmony ? (
                <>
                  <p className="calculation-disclosure__formula">
                    Distanza {agoDellaBilancia?.nome}–{relationBreakdown.others[0]?.corrente}:{' '}
                    {relationBreakdown.others[0]?.gap} punti · Distanza {agoDellaBilancia?.nome}–
                    {relationBreakdown.others[1]?.corrente}: {relationBreakdown.others[1]?.gap} punti ·
                    Media: {relationBreakdown.harmony.gap} punti
                  </p>
                  <p>
                    Il risultato indica {relationBreakdown.harmony.descriptor} tra le componenti di
                    questo rapporto.
                  </p>
                </>
              ) : (
                <p>
                  Non ci sono abbastanza famiglie misurabili per calcolare l'armonia complessiva di
                  questo rapporto.
                </p>
              )}
            </div>

                    {active.levelLabel ? (
                      <div className="qr-toggle-section">
                        <h4>Come si arriva alla frase finale</h4>
                        <p>Per questo il risultato viene descritto come «{active.levelLabel}».</p>
                      </div>
                    ) : null}

                    {rapportoViewModel.marginalFamilies.length || rapportoViewModel.theoreticalFamilies.length ? (
                      <div className="qr-toggle-section">
                        <h4>Composizione completa</h4>
                        <CompositionFamilyCards
                          cards={[...rapportoViewModel.theoreticalFamilies, ...rapportoViewModel.marginalFamilies]}
                        />
                      </div>
                    ) : null}
                    </CalculationDisclosure>
                  </CalculationDisclosure>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {isHelpOpen ? <RapportiHelpModal onClose={() => setIsHelpOpen(false)} /> : null}
    </section>
  )
}
