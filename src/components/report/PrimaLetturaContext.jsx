import React, { useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { PRIMA_LETTURA_UI } from './reportUiCopy.js'

/**
 * Schermata di contesto pre-profilo ("CONTEXT").
 */
function PrimaLetturaContext({ onOpenProfile, accentColor }) {
  const reduceMotion = useReducedMotion()
  const [whyOpen, setWhyOpen] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  return (
    <section
      className="report-context report-card report-xp-section"
      aria-labelledby="report-context-title"
      data-reduce-motion={reduceMotion ? 'true' : 'false'}
      style={accentColor ? { '--report-context-accent': accentColor } : undefined}
    >
      <div className="report-context-inner">
        <p className="report-context-eyebrow">{PRIMA_LETTURA_UI.eyebrow}</p>
        <h1 id="report-context-title" className="report-context-title">
          {PRIMA_LETTURA_UI.title}
        </h1>

        <div className="report-context-body">
          {PRIMA_LETTURA_UI.body.map((paragraph, index) => (
            <p key={`report-context-p-${index}`} className="report-context-paragraph">
              {paragraph}
            </p>
          ))}
        </div>

        {PRIMA_LETTURA_UI.pills.length > 0 && (
          <ul className="report-context-pills" aria-label={PRIMA_LETTURA_UI.pillsAria}>
            {PRIMA_LETTURA_UI.pills.map((pill) => (
              <li key={pill} className="report-context-pill">
                {pill}
              </li>
            ))}
          </ul>
        )}

        <div className="report-context-why">
          <button
            type="button"
            className="nav-button ghost report-context-why-toggle"
            aria-expanded={whyOpen}
            aria-controls="report-context-why-panel"
            onClick={() => setWhyOpen((prev) => !prev)}
          >
            {PRIMA_LETTURA_UI.whyToggle}
          </button>
          {whyOpen && (
            <div
              id="report-context-why-panel"
              className="report-context-why-panel"
              role="region"
              aria-label={PRIMA_LETTURA_UI.whyPanelAria}
            >
              <p className="report-context-why-text">{PRIMA_LETTURA_UI.whyExpanded}</p>
            </div>
          )}
        </div>
      </div>

      <div className="report-context-footer">
        <label className="report-context-dismiss">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
          />
          <span>{PRIMA_LETTURA_UI.dontShowAgainLabel}</span>
        </label>
        <button
          type="button"
          className="nav-button primary report-context-cta"
          onClick={() => onOpenProfile(dontShowAgain)}
        >
          {PRIMA_LETTURA_UI.cta}
        </button>
      </div>
    </section>
  )
}

export default PrimaLetturaContext
