import React from 'react'

/**
 * <SectionDivider /> — separatore tra le sezioni del Report TST.
 *
 * Altezza 80px, linea 1px full-width (#1e293b), al centro un rombo ◆ (6px,
 * ruotato 45°) nel colore della corrente (`var(--corrente-primaria)`) con
 * opacity 0.4 e un piccolo "gap" di sfondo ai lati per staccarlo dalla linea.
 *
 * Props:
 *   - bg: string   colore di sfondo del gap attorno al rombo (default #020817)
 */
export default function SectionDivider({ bg = '#020817' }) {
  return (
    <div className="report-divider" role="presentation" aria-hidden="true">
      <span className="report-divider__line" />
      <span className="report-divider__diamond" style={{ '--divider-gap-bg': bg }} />
    </div>
  )
}
