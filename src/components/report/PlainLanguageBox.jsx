import React from 'react'

/**
 * Micro-box "In parole semplici" — bordo accento famiglia dominante.
 */
export default function PlainLanguageBox({
  title = 'In parole semplici',
  children,
  accentColor = '#4ade80',
  className = '',
}) {
  if (!children) return null

  return (
    <div
      className={`report-plain-box ${className}`.trim()}
      style={{ '--report-plain-accent': accentColor }}
    >
      <p className="report-plain-box__label">{title}</p>
      <p className="report-plain-box__text">{children}</p>
    </div>
  )
}
