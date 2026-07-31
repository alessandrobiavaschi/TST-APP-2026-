import React from 'react'

/**
 * Badge numerico unico per la numerazione di sezioni e sottocapitoli del
 * report (cerchietto). I sottocapitoli usano lo stesso badge con valori
 * tipo "1.1"; size="sm" per i contesti inline/compatti (accanto a titoli
 * più piccoli o dentro tab/card).
 */
export default function SectionNumber({ value, size = 'md', className = '' }) {
  if (value === undefined || value === null || value === '') return null

  return (
    <span
      className={`section-number section-number--${size} ${className}`.trim()}
      aria-hidden="true"
    >
      {value}
    </span>
  )
}
