import React, { useId, useState } from 'react'
import { getGlossaryEntry } from '../../content/tstPlainLanguage.js'

/**
 * Termine con spiegazione su hover/focus; tap per aprire su touch.
 * @param {object} props
 * @param {string} [props.glossaryId] — id in tstPlainLanguage GLOSSARY
 * @param {string} [props.term] — etichetta visibile (default: entry.term)
 * @param {string} [props.tip] — testo se non si usa glossario
 * @param {'button'|'term'} [props.variant]
 */
export default function InfoTip({
  glossaryId,
  term: termProp,
  tip: tipProp,
  variant = 'term',
  className = '',
}) {
  const entry = glossaryId ? getGlossaryEntry(glossaryId) : null
  const term = termProp || entry?.term || 'Info'
  const tip = tipProp || entry?.oneLine || entry?.explain || ''
  const [open, setOpen] = useState(false)
  const tipId = useId()

  if (!tip) return <span className={className}>{term}</span>

  const toggle = () => setOpen((v) => !v)
  const close = () => setOpen(false)

  if (variant === 'button') {
    return (
      <span className={`report-info-tip report-info-tip--button ${className}`.trim()}>
        <button
          type="button"
          className="report-info-tip__trigger report-info-tip__trigger--icon"
          aria-expanded={open}
          aria-describedby={open ? tipId : undefined}
          onClick={toggle}
          onBlur={close}
        >
          <span aria-hidden="true">i</span>
          <span className="sr-only">Spiegazione: {term}</span>
        </button>
        <span
          id={tipId}
          role="tooltip"
          className={`report-info-tip__bubble${open ? ' is-open' : ''}`}
        >
          <strong className="report-info-tip__bubble-term">{term}</strong>
          <span>{tip}</span>
        </span>
      </span>
    )
  }

  return (
    <span className={`report-info-tip report-info-tip--term ${className}`.trim()}>
      <button
        type="button"
        className="report-info-tip__trigger report-info-tip__trigger--term"
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onClick={toggle}
        onBlur={close}
      >
        {term}
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`report-info-tip__bubble${open ? ' is-open' : ''}`}
      >
        {tip}
      </span>
    </span>
  )
}
