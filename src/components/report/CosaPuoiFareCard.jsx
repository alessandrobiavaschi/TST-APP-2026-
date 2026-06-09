import React from 'react'
import { getActionHintsForFamily } from '../../content/tstPlainLanguage.js'

/**
 * Card operativa: suggerimenti concreti per famiglia dominante.
 */
export default function CosaPuoiFareCard({ famiglia = 'Verde', accentColor = '#4ade80' }) {
  const hints = getActionHintsForFamily(famiglia)
  if (!hints?.bullets?.length) return null

  return (
    <aside
      className="report-plain-card page-card"
      aria-labelledby="cosa-puoi-fare-title"
      style={{ '--report-plain-accent': accentColor }}
    >
      <h3 id="cosa-puoi-fare-title" className="report-plain-card__title">
        {hints.title}
      </h3>
      {hints.intro ? <p className="report-plain-card__intro">{hints.intro}</p> : null}
      <ul className="report-plain-card__list">
        {hints.bullets.map((bullet) => (
          <li key={bullet.slice(0, 48)} className="report-plain-card__item">
            {bullet}
          </li>
        ))}
      </ul>
    </aside>
  )
}
