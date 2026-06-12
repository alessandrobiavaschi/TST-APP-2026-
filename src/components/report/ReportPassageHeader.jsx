import React from 'react'

/**
 * Intestazione unificata per ogni passaggio del report.
 * step + domanda guida + una riga di orientamento.
 */
export default function ReportPassageHeader({
  step,
  eyebrow,
  title,
  lead,
  accentColor,
  className = '',
  titleId,
}) {
  return (
    <header
      className={`report-passage-header ${className}`.trim()}
      style={accentColor ? { '--passage-accent': accentColor } : undefined}
    >
      <div className="report-passage-header__meta">
        {step ? (
          <span className="report-passage-header__step" aria-hidden="true">
            {step}
          </span>
        ) : null}
        {eyebrow ? (
          <p className="report-passage-header__eyebrow">{eyebrow}</p>
        ) : null}
      </div>
      {title ? (
        <h2 id={titleId} className="report-passage-header__title">
          {title}
        </h2>
      ) : null}
      {lead ? <p className="report-passage-header__lead">{lead}</p> : null}
    </header>
  )
}
