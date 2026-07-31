import React, { useId } from 'react'
import SectionNumber from './SectionNumber.jsx'

/**
 * Wrapper accordion per macro-blocchi del report.
 *
 * Animazione: grid-template-rows 0fr → 1fr (no max-height su auto).
 */
export default function ReportSectionGroup({
  id,
  title,
  intro,
  stepLabel,
  isOpen,
  onToggle,
  children,
}) {
  const triggerId = useId()
  const panelId = `${id}-panel`

  return (
    <section
      id={id}
      className={`report-section-group${isOpen ? ' report-section-group--open' : ''}`}
      data-group-id={id}
    >
      <button
        type="button"
        id={triggerId}
        className="report-section-group__trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={onToggle}
      >
        {stepLabel ? <SectionNumber value={stepLabel} /> : null}
        <span className="report-section-group__heading">
          <span className="report-section-group__title">{title}</span>
        </span>
        <span className="report-section-group__chevron" aria-hidden="true" />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="report-section-group__panel"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className="report-section-group__inner">
          {intro ? <p className="report-section-group__intro">{intro}</p> : null}
          {children}
        </div>
      </div>
    </section>
  )
}
