import React, { useState } from 'react'

const TEMPERAMENT_FAMILY_LEGEND = [
  { id: 1, colorName: 'Blu', title: 'Malinconica e nostalgica' },
  { id: 2, colorName: 'Rosso', title: 'Collerico-volitiva' },
  { id: 3, colorName: 'Verde', title: 'Flemmatica contemplativa' },
  { id: 4, colorName: 'Giallo', title: "Dell'entusiasmo" },
  { id: 5, colorName: 'Grigio', title: 'Agnostica anaffettiva' },
]

function applyProfiloNarrazionePlaceholders(text, { dominantColorName, currentFamily, restituzione }) {
  if (!text || typeof text !== 'string') return ''
  const famigliaLabel = currentFamily?.title ?? ''
  return text
    .replace(/\{\{colore\}\}/g, dominantColorName || '—')
    .replace(/\{\{famiglia_label\}\}/g, famigliaLabel || '—')
    .replace(/\{\{natura\}\}/g, (restituzione?.natura || '—').replace(/\s+/g, ' ').trim())
    .replace(/\{\{caratteri\}\}/g, (restituzione?.caratteri || '—').replace(/\s+/g, ' ').trim())
}

function outroToParagraphs(raw) {
  if (!raw || typeof raw !== 'string') return []
  return raw.split(/\n+/).map((s) => s.trim()).filter(Boolean)
}

/**
 * Chiusura narrativa del report: stesso schema collassabile della sezione dati avanzati (barra + Apri/Chiudi).
 */
function ReportClosingEpilogue({ narrazione, dominantColorName, restituzione, accentColor }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentFamily =
    TEMPERAMENT_FAMILY_LEGEND.find((item) => item.colorName === dominantColorName) || null
  const outroRaw = narrazione?.outro
    ? applyProfiloNarrazionePlaceholders(narrazione.outro, {
        dominantColorName,
        currentFamily,
        restituzione,
      })
    : ''
  const paragraphs = outroToParagraphs(outroRaw)
  if (paragraphs.length === 0) return null

  return (
    <section
      id="report-closing-epilogue"
      data-report-section="closing-epilogue"
      className="report-section report-data-tables report-closing-epilogue report-xp-section"
      aria-labelledby="report-closing-epilogue-heading"
      style={{ '--report-closing-accent': accentColor }}
    >
      <header className="report-data-header">
        <div className="report-data-heading-row">
          <h2 id="report-closing-epilogue-heading" className="report-section-title">
            prima di chiudere
          </h2>
          <button
            type="button"
            className="report-data-toggle-main"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? 'Chiudi' : 'Apri'}
          </button>
        </div>
      </header>

      {isExpanded ? (
        <div className="report-closing-epilogue-body">
          {paragraphs.map((p, i) => (
            <p key={`closing-epilogue-${i}`} className="report-closing-epilogue-text">
              {p}
            </p>
          ))}
        </div>
      ) : null}
    </section>
  )
}

export default ReportClosingEpilogue
