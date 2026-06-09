import React, { useMemo, useState } from 'react'
import { getDialogoCoppie, getFamigliaLabel, getFamigliaDot } from '../../content/dialogoCorrenti.js'
import { DIALOGO_UI } from './reportUiCopy.js'
import '../../styles/dialogo-correnti.css'

function KeywordChips({ keywords = [], color }) {
  if (keywords.length === 0) return null
  return (
    <ul className="dialogo-correnti__chips" aria-label="Parole chiave">
      {keywords.map((kw) => (
        <li key={kw} className="dialogo-correnti__chip" style={{ '--chip-color': color }}>
          {kw}
        </li>
      ))}
    </ul>
  )
}

function CoppiaCard({ coppia, isOpen, onToggle }) {
  const baseLabel = getFamigliaLabel(coppia.baseFamiglia)
  const partnerLabel = getFamigliaLabel(coppia.partnerFamiglia)
  const baseDot = getFamigliaDot(coppia.baseFamiglia)
  const partnerDot = getFamigliaDot(coppia.partnerFamiglia)
  const hasContent =
    coppia.keywords_base_su_partner.length > 0 || coppia.keywords_partner_su_base.length > 0

  if (!hasContent) return null

  const cardId = `dialogo-card-${coppia.baseFamiglia}-${coppia.partnerFamiglia}`

  return (
    <div className={`dialogo-correnti__card${isOpen ? ' dialogo-correnti__card--open' : ''}`}>
      <button
        type="button"
        id={`${cardId}-trigger`}
        className="dialogo-correnti__card-trigger"
        aria-expanded={isOpen}
        aria-controls={`${cardId}-panel`}
        onClick={onToggle}
      >
        <span className="dialogo-correnti__card-pair">
          <span className="dialogo-correnti__card-family">
            <span
              className="dialogo-correnti__dot"
              style={{ backgroundColor: baseDot }}
              aria-hidden="true"
            />
            <span className="dialogo-correnti__family-name">{baseLabel}</span>
            <span className="dialogo-correnti__family-pct">{coppia.baseWeight}%</span>
          </span>
          <span className="dialogo-correnti__card-arrow" aria-hidden="true">↔</span>
          <span className="dialogo-correnti__card-family">
            <span
              className="dialogo-correnti__dot"
              style={{ backgroundColor: partnerDot }}
              aria-hidden="true"
            />
            <span className="dialogo-correnti__family-name">{partnerLabel}</span>
            <span className="dialogo-correnti__family-pct">{coppia.partnerWeight}%</span>
          </span>
        </span>
        <span className="dialogo-correnti__card-chevron" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div
          id={`${cardId}-panel`}
          role="region"
          aria-labelledby={`${cardId}-trigger`}
          className="dialogo-correnti__card-body"
        >
          {coppia.keywords_base_su_partner.length > 0 && (
            <div className="dialogo-correnti__row">
              <p className="dialogo-correnti__row-label">
                La parte <strong>{baseLabel}</strong> con la parte <strong>{partnerLabel}</strong>
              </p>
              <KeywordChips keywords={coppia.keywords_base_su_partner} color={baseDot} />
            </div>
          )}
          {coppia.keywords_partner_su_base.length > 0 && (
            <div className="dialogo-correnti__row">
              <p className="dialogo-correnti__row-label">
                La parte <strong>{partnerLabel}</strong> con la parte <strong>{baseLabel}</strong>
              </p>
              <KeywordChips keywords={coppia.keywords_partner_su_base} color={partnerDot} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DialogoCorrenti({ colorTotals = {}, accentColor = '' }) {
  const coppie = useMemo(() => getDialogoCoppie(colorTotals), [colorTotals])
  const [openIndex, setOpenIndex] = useState(0)

  if (coppie.length === 0) return null

  const dominantLabel = getFamigliaLabel(coppie[0]?.baseFamiglia || '')
  const resolvedAccent = accentColor || getFamigliaDot(coppie[0]?.baseFamiglia || '')

  return (
    <section
      id="report-tst-dialogo"
      className="dialogo-correnti report-tst-section-anchor report-section"
      aria-labelledby="dialogo-correnti-heading"
      style={{ '--dc-accent': resolvedAccent }}
    >
      <header className="dialogo-correnti__header">
        <p className="dialogo-correnti__eyebrow">{DIALOGO_UI.eyebrow}</p>
        <h2 id="dialogo-correnti-heading" className="dialogo-correnti__title">
          {DIALOGO_UI.title}
        </h2>
        <p className="dialogo-correnti__subtitle">
          {DIALOGO_UI.subtitle(dominantLabel, coppie.length)}
        </p>
      </header>

      <div className="dialogo-correnti__cards">
        {coppie.map((coppia, i) => (
          <CoppiaCard
            key={`${coppia.baseFamiglia}-${coppia.partnerFamiglia}`}
            coppia={coppia}
            isOpen={i === openIndex}
            onToggle={() => setOpenIndex((prev) => (prev === i ? -1 : i))}
          />
        ))}
      </div>

      <details className="dialogo-correnti__nota">
        <summary className="dialogo-correnti__nota-toggle">{DIALOGO_UI.notaToggle}</summary>
        <p className="dialogo-correnti__nota-body">{DIALOGO_UI.notaBody}</p>
      </details>
    </section>
  )
}
