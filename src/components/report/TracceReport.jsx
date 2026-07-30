import React from 'react'
import { TRACCE_UI } from './reportUiCopy.js'

/**
 * <TracceReport /> — SEGNAPOSTO.
 */
export default function TracceReport({ correnteColore = '#4ade80' }) {
  return (
    <section
      aria-labelledby="tracce-heading"
      className="report-placeholder"
    >
      <div className="report-placeholder__inner">
        <p
          className="report-placeholder__eyebrow"
          style={{ color: correnteColore }}
        >
          {TRACCE_UI.eyebrow}
        </p>
        <h2 id="tracce-heading" className="report-placeholder__title">
          {TRACCE_UI.title}
        </h2>
        <p className="report-placeholder__lead">
          {TRACCE_UI.lead}
        </p>
        <p className="report-placeholder__note">— {TRACCE_UI.note} —</p>
      </div>
    </section>
  )
}
