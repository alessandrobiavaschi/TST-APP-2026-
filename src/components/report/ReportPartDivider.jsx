import React from 'react'
import './ReportPartDivider.css'

/**
 * Cambio di capitolo tra le due parti del report: la Parte 1 (natura emotiva) e la Parte 2
 * (come cambia nei diversi ambiti). Deve essere impossibile confondere le due parti — la
 * distinzione passa da spazio e tipografia, non da decorazioni.
 */
export default function ReportPartDivider({ index, title }) {
  return (
    <div className="report-part-divider">
      <div className="report-part-divider__inner">
        <span className="report-part-divider__eyebrow">Parte {index}</span>
        <h2 className="report-part-divider__title">{title}</h2>
      </div>
    </div>
  )
}
