import React, { useState } from 'react'
import { APPROFONDIMENTO_AREAS, APPROFONDIMENTO_UI, getAreaLabel, getAreaCopy } from './reportUiCopy.js'
import '../../styles/sezione-musica.css'

export default function AreeMusicaliSection({ sezioniTest, plainLanguage = false }) {
  const [activeArea, setActiveArea] = useState(APPROFONDIMENTO_AREAS[0])

  if (!sezioniTest || typeof sezioniTest !== 'object') {
    return null
  }

  const availableAreas = APPROFONDIMENTO_AREAS.filter((nome) =>
    Boolean(getAreaCopy(nome, sezioniTest[nome], plainLanguage)),
  )
  if (!availableAreas.length) return null

  const current = availableAreas.includes(activeArea) ? activeArea : availableAreas[0]
  const sezione = getAreaCopy(current, sezioniTest[current], plainLanguage)
  const label = getAreaLabel(current, plainLanguage)
  const panelId = `fm-areas-panel-${current.toLowerCase()}`

  return (
    <section className="fm-areas" aria-labelledby="fm-areas-heading">
      <div className="fm-areas__head">
        <p className="fm-kicker">{APPROFONDIMENTO_UI.areeSectionEyebrow}</p>
        <h2 id="fm-areas-heading">{APPROFONDIMENTO_UI.areeSectionTitle}</h2>
        <p className="fm-section-lead">{APPROFONDIMENTO_UI.areeSectionIntro}</p>
      </div>

      <div className="fm-areas__nav" role="tablist" aria-label={APPROFONDIMENTO_UI.accordionTitle}>
        {availableAreas.map((nomeSezione, index) => {
          const isActive = nomeSezione === current
          return (
            <button
              key={nomeSezione}
              type="button"
              role="tab"
              id={`fm-areas-tab-${nomeSezione.toLowerCase()}`}
              aria-selected={isActive}
              aria-controls={`fm-areas-panel-${nomeSezione.toLowerCase()}`}
              className={`fm-areas__tab${isActive ? ' fm-areas__tab--active' : ''}`}
              onClick={() => setActiveArea(nomeSezione)}
            >
              <span className="fm-areas__tab-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="fm-areas__tab-name">{getAreaLabel(nomeSezione, plainLanguage)}</span>
            </button>
          )
        })}
      </div>

      <div
        key={current}
        id={panelId}
        role="tabpanel"
        aria-labelledby={`fm-areas-tab-${current.toLowerCase()}`}
        className="fm-areas__panel"
      >
        <div className="fm-areas__panel-head">
          <span className="fm-areas__panel-index" aria-hidden="true">
            {String(availableAreas.indexOf(current) + 1).padStart(2, '0')}
          </span>
          <div>
            <h3 className="fm-areas__panel-title">{label}</h3>
            {APPROFONDIMENTO_UI.areaTips[current] ? (
              <p className="fm-areas__panel-subtitle">{APPROFONDIMENTO_UI.areaTips[current]}</p>
            ) : null}
          </div>
        </div>

        <div className="fm-areas__panel-body">
          {sezione.cosa_comprende ? (
            <div className="fm-areas__block">
              <p className="fm-areas__block-label">Cosa comprende</p>
              <p className="fm-areas__block-text">{sezione.cosa_comprende}</p>
            </div>
          ) : null}
          {sezione.cosa_rappresenta ? (
            <div className="fm-areas__block fm-areas__block--rappresenta">
              <p className="fm-areas__block-label">Cosa rappresenta</p>
              <p className="fm-areas__block-text">{sezione.cosa_rappresenta}</p>
            </div>
          ) : null}
          {sezione.cosa_attiva ? (
            <div className="fm-areas__block fm-areas__block--attiva">
              <p className="fm-areas__block-label">Cosa attiva</p>
              <p className="fm-areas__block-text">{sezione.cosa_attiva}</p>
            </div>
          ) : null}
          {sezione.rapporto_anima ? (
            <div className="fm-areas__quote">
              <p className="fm-areas__quote-label">Rapporto con l&apos;anima</p>
              <p className="fm-areas__quote-text">{sezione.rapporto_anima}</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
