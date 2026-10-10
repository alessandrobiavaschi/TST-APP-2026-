import React from 'react'

/**
 * Binario di lettura discreto posizionato lungo il blocco di testo:
 * mostra visivamente lo stato di avanzamento della lettura/scrittura
 * e i marker (pips) corrispondenti ai singoli paragrafi del testo attivo.
 */
export default function LandingReadingRail({
  progress = 0,
  paragraphCount = 4,
  activeParagraphIndex = 0,
  accentColor = '#8b5cf6',
}) {
  const clampedProgress = Math.min(1, Math.max(0, progress))
  const percent = Math.round(clampedProgress * 100)

  return (
    <aside
      className="tst-reading-rail"
      aria-label={`Avanzamento lettura: ${percent}%`}
      style={{ '--rail-accent': accentColor }}
    >
      <div className="tst-reading-rail-track">
        <div
          className="tst-reading-rail-fill"
          style={{
            height: `${clampedProgress * 100}%`,
            background: accentColor,
            boxShadow: `0 0 12px ${accentColor}`,
          }}
        />
        {Array.from({ length: paragraphCount }).map((_, idx) => {
          const isPassed = idx <= activeParagraphIndex
          const isCurrent = idx === activeParagraphIndex
          return (
            <div
              key={`pip-${idx}`}
              className={`tst-reading-rail-pip ${isPassed ? 'is-passed' : ''} ${
                isCurrent ? 'is-current' : ''
              }`}
              style={{
                top: `${((idx + 0.5) / paragraphCount) * 100}%`,
                borderColor: isPassed ? accentColor : 'rgba(255, 255, 255, 0.25)',
                background: isPassed ? accentColor : 'rgba(5, 6, 10, 0.8)',
                boxShadow: isCurrent ? `0 0 10px ${accentColor}` : 'none',
              }}
              title={`Paragrafo ${idx + 1} di ${paragraphCount}`}
            />
          )
        })}
      </div>
      <div className="tst-reading-rail-label" aria-hidden="true">
        <span>{String(activeParagraphIndex + 1).padStart(2, '0')}</span>
        <span className="tst-reading-rail-divider">/</span>
        <span>{String(paragraphCount).padStart(2, '0')}</span>
      </div>
    </aside>
  )
}
