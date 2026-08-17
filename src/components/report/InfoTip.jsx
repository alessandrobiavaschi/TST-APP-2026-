import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getGlossaryEntry } from '../../content/tstPlainLanguage.js'

const VIEWPORT_MARGIN = 16
const TRIGGER_GAP = 10
const ARROW_EDGE_MARGIN = 16

function computePlacement(triggerRect, popoverRect) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const spaceAbove = triggerRect.top
  const spaceBelow = vh - triggerRect.bottom
  const placement = spaceAbove >= popoverRect.height + TRIGGER_GAP || spaceAbove >= spaceBelow
    ? 'top'
    : 'bottom'

  const rawTop = placement === 'top'
    ? triggerRect.top - popoverRect.height - TRIGGER_GAP
    : triggerRect.bottom + TRIGGER_GAP
  const top = Math.max(VIEWPORT_MARGIN, Math.min(rawTop, vh - popoverRect.height - VIEWPORT_MARGIN))

  const rawLeft = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2
  const left = Math.max(VIEWPORT_MARGIN, Math.min(rawLeft, vw - popoverRect.width - VIEWPORT_MARGIN))

  const triggerCenter = triggerRect.left + triggerRect.width / 2
  const rawArrowLeft = triggerCenter - left
  const arrowLeft = Math.max(
    ARROW_EDGE_MARGIN,
    Math.min(rawArrowLeft, popoverRect.width - ARROW_EDGE_MARGIN)
  )

  return { top, left, placement, arrowLeft }
}

/**
 * Popover contestuale con freccia, ancorato al trigger tramite portal.
 * Stato controllato dal parent (`open` / `onToggle`) per garantire un
 * solo popover attivo alla volta tra più InfoTip fratelli.
 * @param {object} props
 * @param {string} [props.glossaryId] — id in tstPlainLanguage GLOSSARY
 * @param {string} [props.term] — etichetta visibile (default: entry.term)
 * @param {string} [props.tip] — testo se non si usa glossario
 * @param {'button'|'term'} [props.variant]
 * @param {boolean} [props.open] — stato controllato dal parent
 * @param {() => void} [props.onToggle] — invertire lo stato (apri/chiudi)
 */
export default function InfoTip({
  glossaryId,
  term: termProp,
  tip: tipProp,
  variant = 'term',
  className = '',
  open = false,
  onToggle,
}) {
  const entry = glossaryId ? getGlossaryEntry(glossaryId) : null
  const term = termProp || entry?.term || 'Info'
  const tip = tipProp || entry?.oneLine || entry?.explain || ''
  const tipId = useId()
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)
  const [coords, setCoords] = useState(null)

  const close = () => {
    if (open) onToggle?.()
  }

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return undefined
    }
    const updatePosition = () => {
      if (!triggerRef.current || !popoverRef.current) return
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      setCoords(computePlacement(triggerRect, popoverRect))
    }
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, tip])

  useEffect(() => {
    if (!open) return undefined
    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target)) return
      if (popoverRef.current?.contains(event.target)) return
      close()
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!tip) return <span className={className}>{term}</span>

  const triggerClass = variant === 'button'
    ? 'report-info-tip__trigger report-info-tip__trigger--icon'
    : 'report-info-tip__trigger report-info-tip__trigger--term'

  const popover = open ? createPortal(
    <span
      ref={popoverRef}
      id={tipId}
      role="dialog"
      aria-modal="false"
      aria-label={term}
      className={`report-info-tip__bubble is-open report-info-tip__bubble--${coords?.placement || 'top'}`}
      style={{
        top: coords ? `${coords.top}px` : 0,
        left: coords ? `${coords.left}px` : 0,
        '--tip-arrow-left': `${coords?.arrowLeft ?? 24}px`,
        visibility: coords ? 'visible' : 'hidden',
      }}
    >
      <span className="report-info-tip__bubble-arrow" aria-hidden="true" />
      <strong className="report-info-tip__bubble-term">{term}</strong>
      <span>{tip}</span>
    </span>,
    document.body
  ) : null

  return (
    <span className={`report-info-tip report-info-tip--${variant} ${className}`.trim()}>
      <button
        type="button"
        ref={triggerRef}
        className={triggerClass}
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => onToggle?.()}
      >
        {variant === 'button' ? (
          <>
            <span aria-hidden="true">i</span>
            <span className="sr-only">Spiegazione: {term}</span>
          </>
        ) : term}
      </button>
      {popover}
    </span>
  )
}
