import React, { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import ReportRadarChart from './ReportRadarChart.jsx'
import { REPORT_CRITERION, SINTESI_UI, formatAttivazione } from './reportUiCopy.js'
import ReportCriterionLegend from './ReportCriterionLegend.jsx'
import InfoTip from './InfoTip.jsx'
import { normalizeFamigliaName } from '../../content/reportRestitution.js'
import { FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { GlossaryLink } from './ReportGlossaryDrawer.jsx'
import './SintesiCorrenti.css'

void motion

function famigliaMacroFor(famiglia) {
  const fam = normalizeFamigliaName(famiglia)
  return FAMILY_THEME[fam]?.macro || ''
}

function splitSentences(text) {
  const trimmed = String(text || '').trim()
  if (!trimmed) return []
  return trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function joinSentences(sentences) {
  return sentences.join(' ')
}

function compactParagraph(text, maxSentences = 2) {
  const sentences = splitSentences(text)
  if (sentences.length) return joinSentences(sentences.slice(0, maxSentences))
  return String(text || '').trim()
}

/**
 * SintesiCorrenti — distribuzione delle cinque famiglie emotive.
 * Apertura visuale: hero compatto, chip chiave, grafici; narrativa in disclosure.
 */

const FAMILY_REF = {
  Verde: { color: '#16a34a', pos: { cx: 200, cy: 260 } },
  Blu: { color: '#2563eb', pos: { cx: 130, cy: 180 } },
  Rosso: { color: '#dc2626', pos: { cx: 270, cy: 180 } },
  Giallo: { color: '#ca8a04', pos: { cx: 200, cy: 110 } },
  Grigio: { color: '#6b7280', pos: { cx: 200, cy: 200 } },
}
const FAMILY_ORDER = ['Verde', 'Blu', 'Rosso', 'Giallo', 'Grigio']

const MAX_RX = 95
const MIN_RX = 16
const RY_RATIO = 120 / 110

function hexToRgb(hex) {
  if (typeof hex !== 'string') return null
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return null
  const int = parseInt(h, 16)
  if (Number.isNaN(int)) return null
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 }
}

function colorDistance(a, b) {
  if (!a || !b) return Number.POSITIVE_INFINITY
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
}

function assignFamilies(correnti) {
  const refRgb = FAMILY_ORDER.map((name) => ({ name, rgb: hexToRgb(FAMILY_REF[name].color) }))
  const candidates = []
  correnti.forEach((c, idx) => {
    const rgb = hexToRgb(c.colore)
    refRgb.forEach((ref) => {
      candidates.push({ idx, family: ref.name, dist: colorDistance(rgb, ref.rgb) })
    })
  })
  candidates.sort((a, b) => a.dist - b.dist)
  const assigned = new Array(correnti.length).fill(null)
  const usedFamilies = new Set()
  candidates.forEach(({ idx, family, dist }) => {
    if (assigned[idx] !== null) return
    if (usedFamilies.has(family)) return
    if (!Number.isFinite(dist)) return
    assigned[idx] = family
    usedFamilies.add(family)
  })
  correnti.forEach((_, idx) => {
    if (assigned[idx] === null) {
      assigned[idx] = FAMILY_ORDER[idx % FAMILY_ORDER.length]
    }
  })
  return assigned
}

function blobPath(cx, cy, rx, ry, seed = 1) {
  const steps = 6
  const pts = []
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * Math.PI * 2
    const wobble = 0.86 + 0.28 * (Math.sin(seed * 12.9898 + i * 4.233) * 0.5 + 0.5)
    pts.push({
      x: cx + Math.cos(angle) * rx * wobble,
      y: cy + Math.sin(angle) * ry * wobble,
    })
  }
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 0; i < steps; i++) {
    const p0 = pts[(i - 1 + steps) % steps]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % steps]
    const p3 = pts[(i + 2) % steps]
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return d + ' Z'
}

function pctAttivazione(peso) {
  return formatAttivazione(peso)
}

function KeyFactRow({ facts = [] }) {
  if (!facts.length) return null
  return (
    <dl className="sintesi-correnti__key-facts" aria-label="Esiti principali del profilo">
      {facts.map((fact) => (
        <div key={fact.id} className="sintesi-correnti__key-fact">
          <dt className="sintesi-correnti__key-fact-label">{fact.label}</dt>
          <dd className="sintesi-correnti__key-fact-value">{fact.value}</dd>
          {fact.method ? (
            <dd className="sintesi-correnti__key-fact-method">{fact.method}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}

function SintesiDisclosure({ id, title, defaultOpen = false, children, className = '' }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = `${id}-panel`

  if (!children) return null

  return (
    <div className={`sintesi-correnti__disclosure ${className}`.trim()}>
      <button
        type="button"
        id={`${id}-trigger`}
        className="sintesi-correnti__disclosure-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="sintesi-correnti__disclosure-title">{title}</span>
        <span className="sintesi-correnti__disclosure-chevron" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={`${id}-trigger`}
          className="sintesi-correnti__disclosure-panel"
        >
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default function SintesiCorrenti({
  correnti = [],
  correnteDominante = '',
  focus = '',
  userName = '',
  correnteColore = '',
  famiglia = '',
  sintesiLead = '',
  sintesiKeyFacts = [],
  sintesiLeadExtended = [],
  sintesiParagrafi = [],
  datiRadar = null,
  sottocorrenti = [],
  onOpenGlossary,
  sottodisposizione = '',
  portato = null,
}) {
  const prefersReducedMotion = useReducedMotion()
  const [hovered, setHovered] = useState(null)

  const radarData = useMemo(() => {
    if (Array.isArray(datiRadar) && datiRadar.length) return datiRadar
    return correnti.map((c) => ({
      corrente: c.nome,
      valore: Number(c.peso) || 0,
    }))
  }, [datiRadar, correnti])

  const families = useMemo(() => assignFamilies(correnti), [correnti])
  const maxPeso = useMemo(
    () => correnti.reduce((m, c) => Math.max(m, Number(c.peso) || 0), 0) || 1,
    [correnti],
  )

  const blobs = useMemo(() => {
    return correnti.map((c, idx) => {
      const family = families[idx]
      const ref = FAMILY_REF[family] || FAMILY_REF.Grigio
      const peso = Number(c.peso) || 0
      const rx = Math.max(MIN_RX, Math.min(MAX_RX, MAX_RX * Math.sqrt(peso / maxPeso)))
      const ry = rx * RY_RATIO
      const color = c.colore || ref.color
      return {
        key: `${family}-${idx}`,
        nome: c.nome || family,
        peso,
        color,
        pos: ref.pos,
        path: blobPath(ref.pos.cx, ref.pos.cy, rx, ry, idx + 1),
        ry,
      }
    })
  }, [correnti, families, maxPeso])

  const ordered = useMemo(() => {
    return correnti
      .map((c, idx) => ({ ...c, _idx: idx, color: c.colore || FAMILY_REF[families[idx]]?.color }))
      .sort((a, b) => (Number(b.peso) || 0) - (Number(a.peso) || 0))
  }, [correnti, families])

  const topSottocorrenti = useMemo(() => {
    return (Array.isArray(sottocorrenti) ? sottocorrenti : [])
      .filter((sub) => (Number(sub?.valore) || 0) > 0 || (Number(sub?.percentuale) || 0) > 0)
      .slice(0, 6)
  }, [sottocorrenti])

  const accentColor =
    correnteColore || ordered[0]?.color || correnti[0]?.colore || FAMILY_REF.Verde.color

  const famigliaMacro = famigliaMacroFor(famiglia)
  const famigliaPrevalenteLabel = famigliaMacro || correnteDominante || ''

  const leadSentences = useMemo(() => splitSentences(sintesiLead), [sintesiLead])
  const leadShort = useMemo(() => joinSentences(leadSentences.slice(0, 1)), [leadSentences])

  const keyFacts = useMemo(() => {
    if (Array.isArray(sintesiKeyFacts) && sintesiKeyFacts.length) {
      return sintesiKeyFacts
    }
    const fallback = []
    if (famigliaPrevalenteLabel) {
      fallback.push({
        id: 'famiglia',
        label: SINTESI_UI.cardFamiglia,
        value: famigliaPrevalenteLabel,
        method: SINTESI_UI.prevalenzaMethod,
      })
    }
    if (sottodisposizione) {
      fallback.push({
        id: 'sfumatura',
        label: SINTESI_UI.chipSottodisposizione,
        value: sottodisposizione,
        method: SINTESI_UI.sottodisposizioneMethod,
      })
    }
    if (focus) {
      fallback.push({
        id: 'orientamento',
        label: SINTESI_UI.chipOrientamento,
        value: focus,
        method: 'Descrittivo',
      })
    }
    if (portato?.prevalenteLabel) {
      fallback.push({
        id: 'portato',
        label: SINTESI_UI.chipPortato,
        value: portato.prevalenteLabel,
        method: 'Voce con più punti',
      })
    }
    return fallback
  }, [
    sintesiKeyFacts,
    famigliaPrevalenteLabel,
    sottodisposizione,
    focus,
    portato,
  ])

  const extendedBlocks = useMemo(() => {
    const blocks = []
    if (leadSentences.length > 1) {
      blocks.push(joinSentences(leadSentences.slice(1)))
    }
    if (Array.isArray(sintesiLeadExtended)) {
      sintesiLeadExtended.forEach((p) => {
        if (p) blocks.push(p)
      })
    }
    return blocks.filter(Boolean)
  }, [leadSentences, sintesiLeadExtended])

  const summaryParagraphs = useMemo(() => {
    const paragraphs = []
    const add = (value, maxSentences = 2) => {
      const paragraph = compactParagraph(value, maxSentences)
      if (!paragraph || paragraphs.includes(paragraph)) return
      paragraphs.push(paragraph)
    }

    add(leadShort, 1)
    add(extendedBlocks[0] || (Array.isArray(sintesiParagrafi) ? sintesiParagrafi[0] : ''), 2)

    return paragraphs.slice(0, 2)
  }, [leadShort, extendedBlocks, sintesiParagrafi])

  const summaryTitle = famigliaPrevalenteLabel
    ? `Prevale ${famigliaPrevalenteLabel}`
    : 'Sintesi del profilo'
  const summarySubtitle = sottodisposizione
    ? `Sfumatura principale: ${sottodisposizione}`
    : correnteDominante || ''
  const summarySottocorrenti = topSottocorrenti.slice(0, 3)

  const viewport = { once: true, amount: 0.15 }
  const sectionFade = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport,
        transition: { duration: 0.45 },
      }

  const petalEnter = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport,
        transition: { duration: 0.35 },
      }

  const visibleTitle = userName
    ? `${SINTESI_UI.title} — ${userName}`
    : SINTESI_UI.title

  return (
    <section
      className="sintesi-correnti"
      aria-labelledby="sintesi-correnti-heading"
      style={{ '--sc-accent': accentColor }}
    >
      <ReportPassageHeader
        step="1"
        eyebrow={SINTESI_UI.eyebrow}
        title={visibleTitle}
        lead={SINTESI_UI.subtitle}
        accentColor={accentColor}
        titleId="sintesi-correnti-heading"
      />

      <div className="sintesi-correnti__summary">
        <div className="sintesi-correnti__answer-card">
          <div className="sintesi-correnti__answer-main">
            <p className="sintesi-correnti__answer-eyebrow">Sintesi chiara</p>
            <h3 className="sintesi-correnti__answer-title">
              {summaryTitle}
              {summarySubtitle ? (
                <span className="sintesi-correnti__answer-subtitle">{summarySubtitle}</span>
              ) : null}
            </h3>
            {summaryParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 52)}`} className="sintesi-correnti__answer-copy">
                {paragraph}
              </p>
            ))}
            {summarySottocorrenti.length > 0 ? (
              <div className="sintesi-correnti__answer-subcurrents">
                <span className="sintesi-correnti__answer-subcurrents-label">
                  Sottocorrenti più attive
                </span>
                <ul className="sintesi-correnti__answer-subcurrents-list">
                  {summarySottocorrenti.map((sub) => (
                    <li key={sub.rawKey} className="sintesi-correnti__answer-subcurrent">
                      <span
                        className="sintesi-correnti__answer-subcurrent-dot"
                        style={{ backgroundColor: sub.colore }}
                        aria-hidden="true"
                      />
                      <span className="sintesi-correnti__answer-subcurrent-name">{sub.nome}</span>
                      <span className="sintesi-correnti__answer-subcurrent-value">
                        {pctAttivazione(sub.percentuale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="sintesi-correnti__answer-side">
            <KeyFactRow facts={keyFacts} />
          </div>
        </div>

        <header className="sintesi-correnti__hero sintesi-correnti__hero--secondary">
          <p className="sintesi-correnti__prevalenza-nota">{SINTESI_UI.prevalenzaNota}</p>
          <p className="sintesi-correnti__disclaimer">{SINTESI_UI.disclaimerShort}</p>
          <div className="sintesi-correnti__criterion-legend-wrap">
            <ReportCriterionLegend
              variant="full"
              className="sintesi-correnti__criterion-legend"
            />
            <InfoTip
              glossaryId="configurazione-prevalente"
              term="Prevalenza"
              variant="button"
              className="sintesi-correnti__info-tip"
            />
            <InfoTip
              tip={REPORT_CRITERION.attivazioneTooltip}
              term="Presenza"
              variant="button"
              className="sintesi-correnti__info-tip"
            />
          </div>
        </header>

        <div className="sintesi-correnti__container sintesi-correnti__order-visuals">
          <h3 className="sintesi-correnti__section-title">{SINTESI_UI.distribuzioneTitle}</h3>
          <p className="sintesi-correnti__section-caption">{SINTESI_UI.distribuzioneCaption}</p>
          <div className="sintesi-correnti__visual sintesi-correnti__visual--desktop">
            <motion.div
              className="sintesi-correnti__flower sintesi-correnti__order-flower"
              {...sectionFade}
            >
              <svg
                className="sintesi-correnti__svg"
                viewBox="0 0 400 400"
                role="group"
                aria-label={SINTESI_UI.flowerAriaLabel}
                preserveAspectRatio="xMidYMid meet"
              >
                <g className="sintesi-correnti__petals">
                  {blobs.map((b, i) => {
                    const isHovered = hovered === i
                    const isDimmed = hovered !== null && hovered !== i
                    const fillOpacity = isHovered ? 0.9 : isDimmed ? 0.45 : 0.72

                    return (
                      <motion.g
                        key={b.key}
                        {...petalEnter}
                        transition={{
                          ...petalEnter.transition,
                          delay: prefersReducedMotion ? 0 : i * 0.06,
                        }}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                        onFocus={() => setHovered(i)}
                        onBlur={() => setHovered((h) => (h === i ? null : h))}
                        tabIndex={0}
                        role="img"
                        aria-label={`${b.nome}, ${REPORT_CRITERION.attivazione} ${pctAttivazione(b.peso)}`}
                      >
                        <motion.path
                          d={b.path}
                          fill={b.color}
                          stroke={b.color}
                          strokeOpacity={0.35}
                          strokeWidth={1.25}
                          animate={{ fillOpacity }}
                          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                          style={{ cursor: 'pointer' }}
                        />
                      </motion.g>
                    )
                  })}
                </g>

                {hovered !== null && blobs[hovered] && (
                  <g
                    pointerEvents="none"
                    transform={`translate(${blobs[hovered].pos.cx}, ${
                      blobs[hovered].pos.cy - blobs[hovered].ry - 14
                    })`}
                  >
                    <rect
                      x={-72}
                      y={-22}
                      width={144}
                      height={30}
                      rx={8}
                      fill="#0b1020"
                      fillOpacity={0.95}
                      stroke={blobs[hovered].color}
                      strokeOpacity={0.45}
                    />
                    <text
                      x={0}
                      y={-2}
                      textAnchor="middle"
                      fill="#f8fafc"
                      fontSize={13}
                      fontFamily="var(--font-display)"
                    >
                      {blobs[hovered].nome} · Attivazione {pctAttivazione(blobs[hovered].peso)}
                    </text>
                  </g>
                )}
              </svg>
            </motion.div>

            <motion.div
              className="sintesi-correnti__radar sintesi-correnti__order-radar"
              {...sectionFade}
              transition={{ ...sectionFade.transition, delay: prefersReducedMotion ? 0 : 0.12 }}
            >
              <p className="sintesi-correnti__radar-label">{SINTESI_UI.radarTitle}</p>
              {SINTESI_UI.radarCaption ? (
                <p className="sintesi-correnti__radar-caption">{SINTESI_UI.radarCaption}</p>
              ) : null}
              <ReportRadarChart
                data={radarData}
                color={accentColor}
                height={220}
                domain={[0, 100]}
                scaleLabel="Presenza %"
                className="sintesi-correnti__radar-chart"
                ariaLabel={SINTESI_UI.radarAriaLabel}
              />
            </motion.div>
          </div>

          <div className="sintesi-correnti__data">
            <div className="sintesi-correnti__data-head">
              <div className="sintesi-correnti__data-head-copy">
                <span className="sintesi-correnti__kicker">{SINTESI_UI.distribuzioneTitle}</span>
                {SINTESI_UI.distribuzioneOrderLabel ? (
                  <p className="sintesi-correnti__data-order">
                    {SINTESI_UI.distribuzioneOrderLabel}
                  </p>
                ) : null}
                {SINTESI_UI.distribuzioneCaption ? (
                  <p className="sintesi-correnti__data-caption">{SINTESI_UI.distribuzioneCaption}</p>
                ) : null}
              </div>
            </div>
            <ul className="sintesi-correnti__list sintesi-correnti__order-bars">
              {ordered.map((c, i) => {
                const peso = Number(c.peso) || 0
                const barColor = c.color
                const fillTransition = prefersReducedMotion
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 90,
                      damping: 18,
                      delay: i * 0.12,
                    }
                return (
                  <li className="sintesi-correnti__row" key={`${c.nome}-${c._idx}`}>
                    <span className="sintesi-correnti__rank" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="sintesi-correnti__dot"
                      style={{ backgroundColor: barColor }}
                      aria-hidden
                    />
                    <span className="sintesi-correnti__row-name">
                      <span className="sintesi-correnti__row-macro">{c.label || c.nome}</span>
                      {c.label && c.nome && c.label !== c.nome ? (
                        <span className="sintesi-correnti__row-temp">{c.nome}</span>
                      ) : null}
                    </span>
                    <span className="sintesi-correnti__bar-track">
                      <motion.span
                        className="sintesi-correnti__bar-fill"
                        style={{ backgroundColor: barColor }}
                        initial={prefersReducedMotion ? false : { width: '0%' }}
                        whileInView={{ width: `${Math.min(100, Math.max(0, peso))}%` }}
                        viewport={viewport}
                        transition={fillTransition}
                      />
                    </span>
                    <span
                      className="sintesi-correnti__row-pct"
                      title={REPORT_CRITERION.attivazione}
                    >
                      <span className="sintesi-correnti__row-pct-label" aria-hidden="true">
                        {REPORT_CRITERION.attivazioneShort}
                      </span>
                      <span className="sr-only">{REPORT_CRITERION.attivazione}: </span>
                      {pctAttivazione(peso)}
                    </span>
                  </li>
                )
              })}
            </ul>

            {topSottocorrenti.length > 0 ? (
              <div className="sintesi-correnti__subcurrents">
                <div className="sintesi-correnti__subcurrents-head">
                  <span className="sintesi-correnti__subcurrents-title">
                    {SINTESI_UI.subcurrentsTitle}
                  </span>
                  <span className="sintesi-correnti__subcurrents-count">
                    {topSottocorrenti.length}
                  </span>
                </div>
                <ul className="sintesi-correnti__subcurrents-list">
                  {topSottocorrenti.map((sub) => (
                    <li key={sub.rawKey} className="sintesi-correnti__subcurrent">
                      <span
                        className="sintesi-correnti__subcurrent-dot"
                        style={{ backgroundColor: sub.colore }}
                        aria-hidden="true"
                      />
                      <span className="sintesi-correnti__subcurrent-main">
                        <span className="sintesi-correnti__subcurrent-name">{sub.nome}</span>
                        <span className="sintesi-correnti__subcurrent-meta">
                          {sub.familyName}
                          {sub.shadeLabel ? ` · ${sub.shadeLabel}` : ''}
                        </span>
                      </span>
                      <span
                        className="sintesi-correnti__subcurrent-value"
                        title={REPORT_CRITERION.attivazione}
                      >
                        {pctAttivazione(sub.percentuale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="sintesi-correnti__editorial sintesi-correnti__order-note">
              {SINTESI_UI.editorialNote}
            </p>
          </div>
        </div>
      </div>

      <div className="sintesi-correnti__narrative sintesi-correnti__order-narrative">
        <SintesiDisclosure
          id="sintesi-visual-mobile"
          title={SINTESI_UI.visualToggle}
          className="sintesi-correnti__disclosure--visual-mobile"
        >
          <div className="sintesi-correnti__visual sintesi-correnti__visual--mobile-inline">
            <div className="sintesi-correnti__flower sintesi-correnti__order-flower">
              <svg
                className="sintesi-correnti__svg"
                viewBox="0 0 400 400"
                role="group"
                aria-label={SINTESI_UI.flowerAriaLabel}
                preserveAspectRatio="xMidYMid meet"
              >
                <g className="sintesi-correnti__petals">
                  {blobs.map((b) => (
                    <path
                      key={b.key}
                      d={b.path}
                      fill={b.color}
                      fillOpacity={0.72}
                      stroke={b.color}
                      strokeOpacity={0.35}
                      strokeWidth={1.25}
                    />
                  ))}
                </g>
              </svg>
            </div>
            <div className="sintesi-correnti__radar sintesi-correnti__order-radar">
              <p className="sintesi-correnti__radar-label">{SINTESI_UI.radarTitle}</p>
              {SINTESI_UI.radarCaption ? (
                <p className="sintesi-correnti__radar-caption">{SINTESI_UI.radarCaption}</p>
              ) : null}
              <ReportRadarChart
                data={radarData}
                color={accentColor}
                height={180}
                domain={[0, 100]}
                scaleLabel="Presenza %"
                className="sintesi-correnti__radar-chart"
                ariaLabel={SINTESI_UI.radarAriaLabel}
              />
            </div>
          </div>
        </SintesiDisclosure>

        {onOpenGlossary ? (
          <div className="sintesi-correnti__glossary-link sintesi-correnti__order-glossary">
            <GlossaryLink onOpen={() => onOpenGlossary()}>
              {SINTESI_UI.glossaryLink}
            </GlossaryLink>
          </div>
        ) : null}
      </div>
    </section>
  )
}
