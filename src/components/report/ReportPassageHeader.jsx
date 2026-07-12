import React from 'react'

/**
 * Intestazione unificata per ogni passaggio del report.
 * step + domanda guida + una riga di orientamento.
 */
export default function ReportPassageHeader({
  step,
  title,
  lead,
  className = '',
  titleId,
}) {
  return (
    <header
      className={`report-passage-header ${className}`.trim()}
    >
      {title ? (
        <h2 id={titleId} className="report-passage-header__title">
          {step ? (
            <span className="report-passage-header__step-inline" aria-hidden="true">
              {step}
            </span>
          ) : null}
          {title}
        </h2>
      ) : null}
      {lead ? <p className="report-passage-header__lead">{lead}</p> : null}
    </header>
  )
}
