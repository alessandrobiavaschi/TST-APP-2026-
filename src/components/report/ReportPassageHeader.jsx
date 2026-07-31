import React from 'react'
import SectionNumber from './SectionNumber.jsx'

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
  titleVisuallyHidden = false,
}) {
  return (
    <header
      className={`report-passage-header ${className}`.trim()}
    >
      {title ? (
        <h2 id={titleId} className="report-passage-header__title">
          {step && !titleVisuallyHidden ? (
            <SectionNumber value={step} size="sm" className="report-passage-header__step-inline" />
          ) : null}
          <span className={titleVisuallyHidden ? 'sr-only' : undefined}>{title}</span>
        </h2>
      ) : null}
      {lead ? <p className="report-passage-header__lead">{lead}</p> : null}
    </header>
  )
}
