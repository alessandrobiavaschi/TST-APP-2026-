import React from 'react'
import './ReportChapterBar.css'

export function ReportChapterTopBar({
  currentIndex = 0,
  totalChapters = 5,
  currentTitle = '',
  onBackToIndex,
  onPrevChapter,
  onNextChapter,
  onSwitchToContinuous,
  accentColor = '#4ade80',
}) {
  return (
    <div className="report-chapter-topbar" style={{ '--chap-accent': accentColor }}>
      <div className="report-chapter-topbar__inner">
        <button
          type="button"
          className="report-chapter-topbar__back-btn"
          onClick={onBackToIndex}
          aria-label="Torna all'indice dei capitoli"
        >
          <span aria-hidden="true">←</span>
          <span>Indice capitoli</span>
        </button>

        <div className="report-chapter-topbar__center">
          <span className="report-chapter-topbar__badge">
            Capitolo {currentIndex + 1} di {totalChapters}
          </span>
          <span className="report-chapter-topbar__title">{currentTitle}</span>
        </div>

        <div className="report-chapter-topbar__actions">
          <button
            type="button"
            className="report-chapter-topbar__nav-btn"
            disabled={currentIndex === 0}
            onClick={onPrevChapter}
            title="Capitolo precedente"
            aria-label="Capitolo precedente"
          >
            ←
          </button>
          <button
            type="button"
            className="report-chapter-topbar__nav-btn"
            disabled={currentIndex >= totalChapters - 1}
            onClick={onNextChapter}
            title="Capitolo successivo"
            aria-label="Capitolo successivo"
          >
            →
          </button>
          {onSwitchToContinuous && (
            <button
              type="button"
              className="report-chapter-topbar__mode-btn"
              onClick={onSwitchToContinuous}
              title="Passa alla vista a scorrimento unico di tutto il report"
            >
              Vista continua
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ReportChapterBottomNav({
  prevChapter = null,
  nextChapter = null,
  onSelectChapter,
  onBackToIndex,
  accentColor = '#4ade80',
}) {
  return (
    <nav className="report-chapter-bottom-nav" style={{ '--chap-accent': accentColor }} aria-label="Navigazione tra capitoli">
      <div className="report-chapter-bottom-nav__inner">
        {prevChapter ? (
          <button
            type="button"
            className="report-chapter-nav-btn report-chapter-nav-btn--prev"
            onClick={() => onSelectChapter(prevChapter.id)}
          >
            <span className="report-chapter-nav-btn__sub">← Precedente</span>
            <span className="report-chapter-nav-btn__title">{prevChapter.title}</span>
          </button>
        ) : (
          <div className="report-chapter-nav-btn report-chapter-nav-btn--placeholder" />
        )}

        <button
          type="button"
          className="report-chapter-nav-btn report-chapter-nav-btn--index"
          onClick={onBackToIndex}
        >
          <span className="report-chapter-nav-btn__sub">Indice</span>
          <span className="report-chapter-nav-btn__title">Tutti i capitoli</span>
        </button>

        {nextChapter ? (
          <button
            type="button"
            className="report-chapter-nav-btn report-chapter-nav-btn--next"
            onClick={() => onSelectChapter(nextChapter.id)}
          >
            <span className="report-chapter-nav-btn__sub">Successivo →</span>
            <span className="report-chapter-nav-btn__title">{nextChapter.title}</span>
          </button>
        ) : (
          <div className="report-chapter-nav-btn report-chapter-nav-btn--placeholder" />
        )}
      </div>
    </nav>
  )
}
