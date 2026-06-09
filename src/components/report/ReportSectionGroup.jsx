import React, { useId } from 'react'

/**
 * Wrapper accordion per macro-blocchi del report.
 *
 * Animazione: grid-template-rows 0fr → 1fr (no max-height su auto).
 */
export default function ReportSectionGroup({
  id,
  title,
  subtitle,
  intro,
  isOpen,
  onToggle,
  children,
}) {
  const triggerId = useId()
  const panelId = `${id}-panel`

  return (
    <section
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
        <span className="report-section-group__heading">
          <span className="report-section-group__title">{title}</span>
          {subtitle ? (
            <span className="report-section-group__subtitle">{subtitle}</span>
          ) : null}
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
