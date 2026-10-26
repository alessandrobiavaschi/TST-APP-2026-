import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COPPIE_ARTISTI_MUSSIDA } from '../../content/musicaPerMusicisti.js'

void motion

const DIMENSION_ICONS = {
  Timbro: '🎻',
  Ritmo: '🥁',
  Melodia: '🎷',
  Intervallo: '🌓',
  Armonia: '🎼',
}

const DIMENSION_SHORT_FOCUS = {
  Timbro: 'Materia & Peso',
  Ritmo: 'Tempo & Flusso',
  Melodia: 'Respiro & Linea',
  Intervallo: 'Chiaroscuro & Note',
  Armonia: 'Coralità & Accordi',
}

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.26, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
  }),
}

export default function AscoltiEArtisti({ accentColor = '#4ade80' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const cardRef = useRef(null)

  const total = COPPIE_ARTISTI_MUSSIDA.length
  const current = COPPIE_ARTISTI_MUSSIDA[activeIndex] || COPPIE_ARTISTI_MUSSIDA[0]

  const handleSelect = (idx) => {
    if (idx === activeIndex) return
    setDirection(idx > activeIndex ? 1 : -1)
    setActiveIndex(idx)
  }

  const handlePrev = () => {
    if (activeIndex > 0) {
      setDirection(-1)
      setActiveIndex((prev) => prev - 1)
    } else {
      setDirection(-1)
      setActiveIndex(total - 1)
    }
  }

  const handleNext = () => {
    if (activeIndex < total - 1) {
      setDirection(1)
      setActiveIndex((prev) => prev + 1)
    } else {
      setDirection(1)
      setActiveIndex(0)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      handlePrev()
    }
  }

  const num = String(activeIndex + 1).padStart(2, '0')

  return (
    <section
      id="fm-ascolti"
      className="fm-section fm-artists-list"
      aria-labelledby="fm-artists-title"
      onKeyDown={handleKeyDown}
      style={{ '--ascolti-accent': accentColor }}
    >
      <div className="fm-artists-list__head">
        <p className="fm-kicker">Guida all'ascolto consapevole · I 5 codici musicali</p>
        <h2 id="fm-artists-title">Ascolti consigliati: i 5 contrasti sonori</h2>
        <p className="fm-section-lead">
          La musica comunica con le nostre emozioni attraverso cinque parametri fondamentali:
          {' '}<strong>Timbro</strong>, <strong>Ritmo</strong>, <strong>Melodia</strong>, <strong>Intervallo</strong> e <strong>Armonia</strong>.
          Sfoglia le 5 dimensioni in orizzontale per esplorare come ciascuna orienta la percezione ed esplorare due brani d'autore a polarità opposte.
        </p>
      </div>

      {/* ── BARRA DI SELEZIONE ORIZZONTALE DELLE 5 DIMENSIONI ── */}
      <div className="fm-dimensions-bar" role="tablist" aria-label="Seleziona la dimensione sonora da esplorare">
        {COPPIE_ARTISTI_MUSSIDA.map((coppiaObj, idx) => {
          const isActive = idx === activeIndex
          const tabNum = String(idx + 1).padStart(2, '0')
          const icon = DIMENSION_ICONS[coppiaObj.dimensione] || '🎵'
          const shortFocus = DIMENSION_SHORT_FOCUS[coppiaObj.dimensione] || ''

          return (
            <button
              key={coppiaObj.dimensione}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`dimension-panel-${coppiaObj.dimensione}`}
              id={`dimension-tab-${coppiaObj.dimensione}`}
              className={`fm-dimensions-bar__tab ${isActive ? 'is-active' : ''}`}
              style={isActive ? { '--dim-accent': accentColor } : undefined}
              onClick={() => handleSelect(idx)}
            >
              <div className="fm-dimensions-bar__tab-top">
                <span className="fm-dimensions-bar__tab-icon" aria-hidden="true">{icon}</span>
                <span className="fm-dimensions-bar__tab-num">{tabNum}</span>
              </div>
              <span className="fm-dimensions-bar__tab-name">{coppiaObj.dimensione}</span>
              <span className="fm-dimensions-bar__tab-focus">{shortFocus}</span>
            </button>
          )
        })}
      </div>

      {/* ── CONTROLLI SFOGLIO ORIZZONTALE + INDICATORE STEP ── */}
      <div className="fm-carousel-controls">
        <button
          type="button"
          className="fm-carousel-btn fm-carousel-btn--prev"
          onClick={handlePrev}
          aria-label="Dimensione precedente"
        >
          <span aria-hidden="true">←</span>
          <span className="fm-carousel-btn__label">Precedente</span>
        </button>

        <div className="fm-carousel-indicator">
          <span className="fm-carousel-indicator__text">
            Dimensione <strong>{num}</strong> di <strong>{String(total).padStart(2, '0')}</strong> · <span className="fm-carousel-indicator__name">{current.dimensione}</span>
          </span>
          <div className="fm-carousel-dots" role="presentation">
            {COPPIE_ARTISTI_MUSSIDA.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`fm-carousel-dot ${dotIdx === activeIndex ? 'is-active' : ''}`}
                onClick={() => handleSelect(dotIdx)}
                aria-label={`Vai alla dimensione ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="fm-carousel-btn fm-carousel-btn--next"
          onClick={handleNext}
          aria-label="Dimensione successiva"
        >
          <span className="fm-carousel-btn__label">Successiva</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {/* ── PANNELLO ATTIVO SFOGLIABILE ── */}
      <div className="fm-carousel-viewport" ref={cardRef}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.article
            key={current.dimensione}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            id={`dimension-panel-${current.dimensione}`}
            role="tabpanel"
            aria-labelledby={`dimension-tab-${current.dimensione}`}
            className="fm-artist-pair-card fm-artist-pair-card--carousel"
          >
            <header className="fm-artist-pair-card__header">
              <div className="fm-artist-pair-card__meta">
                <span className="fm-artist-pair-card__badge" style={{ borderColor: accentColor, color: accentColor }}>
                  {DIMENSION_ICONS[current.dimensione]} Dimensione {num} · {current.dimensione}
                </span>
                {current.sottotitolo ? (
                  <span className="fm-artist-pair-card__subtitle">
                    {current.sottotitolo}
                  </span>
                ) : null}
              </div>

              {current.descrizione ? (
                <p className="fm-artist-pair-card__desc">
                  {current.descrizione}
                </p>
              ) : null}

              <div className="fm-artist-pair-card__prompt">
                <span className="fm-artist-pair-card__prompt-label">Chiave di ascolto</span>
                <p className="fm-artist-pair-card__question">«{current.domandaGuida}»</p>
              </div>
            </header>

            <div className="fm-artist-pair-card__dual-grid">
              {current.coppia.map((traccia, trackIdx) => {
                const poleLabel = trackIdx === 0 ? 'Polo A' : 'Polo B'
                const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${traccia.artista} ${traccia.brano}`)}`

                return (
                  <div key={traccia.artista + traccia.brano} className="fm-artist-track">
                    <div className="fm-artist-track__header">
                      <span className="fm-artist-track__pole-tag">{poleLabel}</span>
                      <span className="fm-artist-track__pole">{traccia.polo}</span>
                    </div>

                    <h3 className="fm-artist-track__title">{traccia.brano}</h3>
                    <p className="fm-artist-track__author">{traccia.artista}</p>

                    <p className="fm-artist-track__analysis">{traccia.analisi}</p>

                    <div className="fm-artist-track__actions">
                      <a
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fm-artist-track__listen-btn"
                        title={`Cerca e ascolta "${traccia.brano}" di ${traccia.artista} su YouTube`}
                      >
                        <span className="fm-artist-track__play-icon" aria-hidden="true">▶</span>
                        <span>Ascolta su YouTube</span>
                        <span className="fm-artist-track__ext-arrow" aria-hidden="true">↗</span>
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      {/* ── NAVIGATORE INFERIORE DI CONTINUITÀ ── */}
      <div className="fm-carousel-footer-nav">
        <button
          type="button"
          className="fm-carousel-btn fm-carousel-btn--prev"
          onClick={handlePrev}
          aria-label="Torna alla dimensione precedente"
        >
          <span>← Dimensione precedente</span>
        </button>
        <button
          type="button"
          className="fm-carousel-btn fm-carousel-btn--next"
          onClick={handleNext}
          aria-label="Passa alla dimensione successiva"
        >
          <span>Dimensione successiva →</span>
        </button>
      </div>
    </section>
  )
}
