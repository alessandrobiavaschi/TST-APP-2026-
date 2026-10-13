import React, { useId, useRef, useState } from 'react'
import { GALASSIA_READING_STEPS, GALASSIA_TUTORIAL_UI } from './reportUiCopy.js'
import { markGalassiaTutorialSeen } from './galassiaTutorialStorage.js'
import { useDialogFocus } from '../../hooks/useDialogFocus.js'

/**
 * Overlay tutorial al primo accesso alla Galassia.
 */
export default function GalassiaTutorialOverlay({
  accentColor = '#4ade80',
  onComplete,
}) {
  const titleId = useId()
  const ctaRef = useRef(null)
  const overlayRef = useRef(null)
  const [dontShowAgain, setDontShowAgain] = useState(true)

  const finish = () => {
    if (dontShowAgain) {
      markGalassiaTutorialSeen()
    }
    onComplete?.()
  }

  useDialogFocus(overlayRef, { open: true, onClose: finish, initialFocusRef: ctaRef })

  return (
    <div
      ref={overlayRef}
      className="galassia-tutorial"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ '--galassia-tutorial-accent': accentColor }}
    >
      <div className="galassia-tutorial__backdrop" aria-hidden="true" />
      <div className="galassia-tutorial__card">
        <header className="galassia-tutorial__header">
          <p className="galassia-tutorial__eyebrow">{GALASSIA_TUTORIAL_UI.eyebrow}</p>
          <h2 id={titleId} className="galassia-tutorial__title">
            {GALASSIA_TUTORIAL_UI.title}
          </h2>
          <p className="galassia-tutorial__lead">{GALASSIA_TUTORIAL_UI.lead}</p>
        </header>

        <ol className="galassia-tutorial__steps" aria-label={GALASSIA_TUTORIAL_UI.dialogAria}>
          {GALASSIA_READING_STEPS.map((step) => (
            <li key={step.id} className="galassia-tutorial__step">
              <span className="galassia-tutorial__step-num" aria-hidden="true">
                {step.label}
              </span>
              <span className="galassia-tutorial__step-copy">
                <span className="galassia-tutorial__step-title">{step.title}</span>
                <span className="galassia-tutorial__step-text">{step.text}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="galassia-tutorial__actions">
          <button
            ref={ctaRef}
            type="button"
            className="galassia-tutorial__cta"
            onClick={finish}
          >
            {GALASSIA_TUTORIAL_UI.cta}
          </button>
        </div>

        <label className="galassia-tutorial__remember">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
          />
          <span>{GALASSIA_TUTORIAL_UI.dontShowAgainLabel}</span>
        </label>
      </div>
    </div>
  )
}
