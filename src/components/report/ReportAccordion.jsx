import React, { useState } from 'react'
import { APPROFONDIMENTO_AREAS, APPROFONDIMENTO_UI, getAreaLabel, getAreaCopy } from './reportUiCopy.js'
import InfoTip from './InfoTip.jsx'

/** Colore bordo sinistro per ogni sezione (palette leggera) */
const SEZIONE_ACCENT = {
  Timbro: 'var(--report-accordion-timbro, #60a5fa)',
  Intervalli: 'var(--report-accordion-intervalli, #8b5cf6)',
  Ritmo: 'var(--report-accordion-ritmo, #f87171)',
  Melodia: 'var(--report-accordion-melodia, #4ade80)',
  Armonia: 'var(--report-accordion-armonia, #fde047)',
}

export default function ReportAccordion({ sezioniTest, plainLanguage = false }) {
  const [openKey, setOpenKey] = useState(null)
  const [activeTip, setActiveTip] = useState(null)

  if (!sezioniTest || typeof sezioniTest !== 'object') {
    return null
  }

  return (
    <section
      className="report-sezioni-accordion"
      aria-labelledby="accordion-sezioni-heading"
    >
      <div className="report-sezioni-header">
        <h3 id="accordion-sezioni-heading" className="report-sezioni-title">
          {APPROFONDIMENTO_UI.accordionTitle}
        </h3>
        <p className="report-sezioni-intro">{APPROFONDIMENTO_UI.accordionIntro}</p>
      </div>
      <div className="report-sezioni-list">
        {APPROFONDIMENTO_AREAS.map((nomeSezione) => {
          const sezione = getAreaCopy(nomeSezione, sezioniTest[nomeSezione], plainLanguage)
          if (!sezione) return null
          const label = getAreaLabel(nomeSezione, plainLanguage)
          const isOpen = openKey === nomeSezione
          const id = `accordion-${nomeSezione.toLowerCase()}`
          const accent = SEZIONE_ACCENT[nomeSezione]
          return (
            <div
              key={nomeSezione}
              className={`report-sezione-item ${isOpen ? 'report-sezione-item--open' : ''}`}
              style={{ '--sezione-accent': accent }}
            >
              <div className="report-sezione-header">
                <button
                  type="button"
                  className="report-sezione-trigger"
                  onClick={() => setOpenKey(isOpen ? null : nomeSezione)}
                  aria-expanded={isOpen}
                  aria-controls={id}
                  id={`${id}-button`}
                >
                  <span className="report-sezione-name">{label}</span>
                  <span className="report-sezione-chevron" aria-hidden>
                    {isOpen ? '−' : '+'}
                  </span>
                </button>
                <InfoTip
                  variant="button"
                  term={label}
                  tip={APPROFONDIMENTO_UI.areaTips[nomeSezione]}
                  className="report-sezione-tip"
                  open={activeTip === nomeSezione}
                  onToggle={() => setActiveTip((cur) => (cur === nomeSezione ? null : nomeSezione))}
                />
              </div>
              <div
                id={id}
                role="region"
                aria-labelledby={`${id}-button`}
                className="report-sezione-panel"
                hidden={!isOpen}
              >
                <dl className="report-sezione-dl">
                  {sezione.cosa_comprende && (
                    <>
                      <dt className="report-sezione-dt">Cosa comprende</dt>
                      <dd className="report-sezione-dd">{sezione.cosa_comprende}</dd>
                    </>
                  )}
                  {sezione.cosa_rappresenta && (
                    <>
                      <dt className="report-sezione-dt">Cosa rappresenta</dt>
                      <dd className="report-sezione-dd">{sezione.cosa_rappresenta}</dd>
                    </>
                  )}
                  {sezione.cosa_attiva && (
                    <>
                      <dt className="report-sezione-dt">Cosa attiva</dt>
                      <dd className="report-sezione-dd">{sezione.cosa_attiva}</dd>
                    </>
                  )}
                  {sezione.rapporto_anima && (
                    <>
                      <dt className="report-sezione-dt">Rapporto con l&apos;anima</dt>
                      <dd className="report-sezione-dd">{sezione.rapporto_anima}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
