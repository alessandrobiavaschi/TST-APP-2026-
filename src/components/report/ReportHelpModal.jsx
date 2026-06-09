import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { HELP_MODAL_UI } from './reportUiCopy.js'
import { GLOSSARY_UI } from '../../content/tstPlainLanguage.js'

// Il flat-config ESLint del repo non rileva l'uso di `motion` via JSX member.
void motion

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Modal guida alla lettura del report.
 */
export default function ReportHelpModal({ open, onClose, accentColor = '#4ade80', onOpenGlossary }) {
  const dialogRef = useRef(null)
  const previouslyFocusedRef = useRef(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!open) return undefined
    previouslyFocusedRef.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const id = window.requestAnimationFrame(() => {
      const root = dialogRef.current
      if (!root) return
      const nodes = root.querySelectorAll(FOCUSABLE)
      ;(nodes[0] || root).focus({ preventScroll: true })
    })

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const root = dialogRef.current
      if (!root) return
      const nodes = [...root.querySelectorAll(FOCUSABLE)]
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      window.cancelAnimationFrame(id)
      previouslyFocusedRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="help-modal" role="presentation">
          <motion.button
            type="button"
            aria-label="Chiudi"
            className="help-modal__overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-help-title"
            tabIndex={-1}
            className="help-modal__card"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            <div className="help-modal__head">
              <h2 id="report-help-title" className="help-modal__title">
                {HELP_MODAL_UI.title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={HELP_MODAL_UI.closeAria}
                className="help-modal__close"
              >
                ×
              </button>
            </div>
            <p className="help-modal__lead">{HELP_MODAL_UI.lead}</p>
            <ul className="help-modal__list">
              {HELP_MODAL_UI.items.map((item) => (
                <li key={item.title} className="help-modal__item">
                  <span
                    className="help-modal__dot"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden="true"
                  />
                  <span className="help-modal__item-body">
                    <span className="help-modal__item-label">{item.title}</span>
                    <span className="help-modal__item-text">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            {onOpenGlossary ? (
              <p className="help-modal__glossary-cta">
                <button
                  type="button"
                  className="nav-button ghost"
                  onClick={onOpenGlossary}
                >
                  {GLOSSARY_UI.openGlossary}
                </button>
              </p>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
