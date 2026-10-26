import React from 'react'
import './ReportChaptersIndex.css'

export default function ReportChaptersIndex({
  chapters = [],
  onSelectChapter,
  onOpenModalita,
  onSwitchToContinuous,
  accentColor = '#4ade80',
  userName = '',
  dominantFamily = '',
  dominantNature = '',
  eyebrow = 'PROGRAMMA DI LETTURA TST',
  title = 'I Capitoli del tuo Profilo',
  lead = null,
}) {
  return (
    <div className="report-chapters-index" style={{ '--chap-accent': accentColor }}>
      <header className="report-chapters-index__header">
        {eyebrow && (
          <div className="report-chapters-index__eyebrow">
            <span>{eyebrow}</span>
            {userName && <span className="report-chapters-index__dot">·</span>}
            {userName && <span className="report-chapters-index__user">{userName}</span>}
          </div>
        )}
        <h2 className="report-chapters-index__title">{title}</h2>
        <p className="report-chapters-index__lead">
          {lead || (dominantFamily ? (
            <>
              Profilo a prevalenza <strong>{dominantFamily}</strong>
              {dominantNature ? ` (${dominantNature})` : ''}. Esplora i capitoli del tuo report uno alla volta, con una lettura focalizzata e ordinata.
            </>
          ) : (
            'Esplora i capitoli del tuo report uno alla volta, con una lettura focalizzata e ordinata.'
          ))}
        </p>

        <div className="report-chapters-index__quick-actions">
          <button
            type="button"
            className="report-chapters-btn report-chapters-btn--primary"
            onClick={() => chapters[0]?.id && onSelectChapter?.(chapters[0].id)}
          >
            Inizia dal Capitolo 1 →
          </button>
          {onSwitchToContinuous && (
            <button
              type="button"
              className="report-chapters-btn report-chapters-btn--ghost"
              onClick={onSwitchToContinuous}
              title="Visualizza tutte le sezioni su un'unica pagina continua da scorrere"
            >
              Passa alla vista continua (scorrimento unico)
            </button>
          )}
        </div>
      </header>

      {/* Griglia dei capitoli principali */}
      <div className="report-chapters-grid" role="list">
        {chapters.map((chap, idx) => {
          const numStr = String(idx + 1).padStart(2, '0')
          return (
            <article
              key={chap.id}
              className="report-chapter-card"
              role="listitem"
              onClick={() => onSelectChapter?.(chap.id)}
            >
              <div className="report-chapter-card__meta">
                <span className="report-chapter-card__num">Capitolo {numStr}</span>
                {chap.readingFocus && (
                  <span className="report-chapter-card__tag">{chap.readingFocus}</span>
                )}
              </div>

              <h3 className="report-chapter-card__title">{chap.title}</h3>
              <p className="report-chapter-card__desc">{chap.subtitle || chap.intro}</p>

              <div className="report-chapter-card__footer">
                <span className="report-chapter-card__cta">
                  Leggi capitolo <span aria-hidden="true">→</span>
                </span>
              </div>
            </article>
          )
        })}
      </div>

      {/* Altre letture del programma: solo nell'indice del report */}
      {onOpenModalita && (
        <div className="report-chapters-index__alt-section">
          <h3 className="report-chapters-index__alt-title">Altre viste del programma</h3>
          <div className="report-chapters-alt-grid">
            <div
              className="report-chapter-card report-chapter-card--alt"
              onClick={() => onOpenModalita?.('for-musicians')}
            >
              <div className="report-chapter-card__meta">
                <span className="report-chapter-card__num">Lettura 2</span>
                <span className="report-chapter-card__tag">Acustica &amp; Suono</span>
              </div>
              <h4 className="report-chapter-card__title">Lettura per Musicisti</h4>
              <p className="report-chapter-card__desc">
                La tua famiglia nella Musica, con eseguire, interpretare e comporre, e le altre famiglie da leggere. In fondo i dati delle tue risposte.
              </p>
              <div className="report-chapter-card__footer">
                <span className="report-chapter-card__cta">
                  Apri lettura musicale <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>

            <div
              className="report-chapter-card report-chapter-card--alt"
              onClick={() => onOpenModalita?.('galassia')}
            >
              <div className="report-chapter-card__meta">
                <span className="report-chapter-card__num">Lettura 3</span>
                <span className="report-chapter-card__tag">Mappa Tridimensionale</span>
              </div>
              <h4 className="report-chapter-card__title">Galassia Lessicale 3D</h4>
              <p className="report-chapter-card__desc">
                Navigazione spaziale immersiva tra le 285 parole degli stati d'animo, i 5 ammassi emotivi e le parole emerse dal tuo test.
              </p>
              <div className="report-chapter-card__footer">
                <span className="report-chapter-card__cta">
                  Esplora la Galassia <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
