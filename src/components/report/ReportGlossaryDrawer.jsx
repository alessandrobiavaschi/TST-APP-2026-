import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { GLOSSARY_UI, searchGlossary } from '../../content/tstPlainLanguage.js'

void motion

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Drawer/modal glossario TST — ricercabile, linguaggio accessibile.
 */
export default function ReportGlossaryDrawer({
  open,
  onClose,
  accentColor = '#4ade80',
  initialFocusId = null,
}) {
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const [query, setQuery] = useState('')

  const entries = useMemo(() => searchGlossary(query), [query])

  const handleClose = useCallback(() => {
    setQuery('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    previouslyFocusedRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const id = window.requestAnimationFrame(() => {
      const root = dialogRef.current
      if (!root) return
      if (initialFocusId) {
        const target = root.querySelector(`[data-glossary-id="${initialFocusId}"]`)
        if (target) {
          target.scrollIntoView({ block: 'nearest' })
          return
        }
      }
      const nodes = root.querySelectorAll(FOCUSABLE)
      ;(nodes[0] || root).focus({ preventScroll: true })
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      window.cancelAnimationFrame(id)
      previouslyFocusedRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, handleClose, initialFocusId])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="help-modal help-modal--glossary" role="presentation">
          <motion.button
            type="button"
            aria-label={GLOSSARY_UI.closeAria}
            className="help-modal__overlay"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-glossary-title"
            tabIndex={-1}
            className="help-modal__card help-modal__card--glossary"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            <div className="help-modal__head">
              <h2 id="report-glossary-title" className="help-modal__title">
                {GLOSSARY_UI.title}
              </h2>
              <button
                type="button"
                onClick={handleClose}
                aria-label={GLOSSARY_UI.closeAria}
                className="help-modal__close"
              >
                ×
              </button>
            </div>

            <label className="help-modal__search-wrap">
              <span className="help-modal__search-sr">{GLOSSARY_UI.searchAria}</span>
              <input
                type="search"
                className="help-modal__search"
                placeholder={GLOSSARY_UI.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={GLOSSARY_UI.searchAria}
              />
            </label>

            <ul className="help-modal__glossary-list">
              {entries.length === 0 ? (
                <li className="help-modal__glossary-empty">{GLOSSARY_UI.noResults}</li>
              ) : (
                entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="help-modal__glossary-item"
                    data-glossary-id={entry.id}
                  >
                    <h3 className="help-modal__glossary-term">
                      <span
                        className="help-modal__dot"
                        style={{ backgroundColor: accentColor }}
                        aria-hidden="true"
                      />
                      {entry.term}
                    </h3>
                    <p className="help-modal__glossary-oneline">{entry.oneLine}</p>
                    <p className="help-modal__glossary-explain">{entry.explain}</p>
                    <p className="help-modal__glossary-useful">
                      <strong>{GLOSSARY_UI.usefulForLabel}:</strong> {entry.usefulFor}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Link testuale riutilizzabile per aprire il glossario. */
export function GlossaryLink({ onOpen, className = '', children }) {
  return (
    <button
      type="button"
      className={`nav-button ghost help-modal__open-link ${className}`.trim()}
      onClick={onOpen}
    >
      {children || GLOSSARY_UI.openLink}
    </button>
  )
}
