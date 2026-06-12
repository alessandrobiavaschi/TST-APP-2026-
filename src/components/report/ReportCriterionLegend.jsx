import React from 'react'
import { REPORT_CRITERION } from './reportUiCopy.js'

/**
 * Legenda epistemologica condivisa del report TST (unica istanza in SintesiCorrenti).
 * @param {'full' | 'compact'} variant
 */
export default function ReportCriterionLegend({
  variant = 'full',
  className = '',
  id,
}) {
  if (variant === 'compact') {
    return (
      <p
        id={id}
        className={`report-criterion-legend report-criterion-legend--compact ${className}`.trim()}
        role="note"
      >
        {REPORT_CRITERION.legendCompact}
      </p>
    )
  }

  return (
    <ul
      id={id}
      className={`report-criterion-legend report-criterion-legend--full ${className}`.trim()}
      role="note"
    >
      {REPORT_CRITERION.legendItems.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>
  )
}
