import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { COPPIE_ARTISTI_MUSSIDA } from '../../content/musicaPerMusicisti.js'

void motion

const DIMENSION_SHORT_FOCUS = {
  Timbro: 'Materia & Peso',
  Ritmo: 'Tempo & Flusso',
  Melodia: 'Respiro & Linea',
  Intervallo: 'Chiaroscuro & Note',
  Armonia: 'Coralità & Accordi',
}

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    x: dir > 0 ? -30 : 30,
    opacity: 0,
    transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
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
    setDirection(-1)
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }

  const handleNext = () => {
    setDirection(1)
    setActiveIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNext()
    } else if (e.key === 'ArrowLeft') {
      handlePrev()
    }
  }

  return (
    <section
      id="fm-ascolti"
      className="fm-section fm-artists-list"
      aria-labelledby="fm-artists-title"
      onKeyDown={handleKeyDown}
      style={{ '--ascolti-accent': accentColor }}
    >
      <div className="fm-artists-list__head">
        <h2 id="fm-artists-title">Ascolti consigliati: i cinque contrasti sonori</h2>
        <p className="fm-section-lead">
          La musica comunica con le nostre emozioni attraverso cinque parametri fondamentali:
          {' '}<strong>Timbro</strong>, <strong>Ritmo</strong>, <strong>Melodia</strong>, <strong>Intervallo</strong> e <strong>Armonia</strong>.
          Ciascuna dimensione orienta la percezione ed esplora due brani d'autore a polarità opposte.
        </p>
      </div>

      {/* ── BARRA DELLE 5 DIMENSIONI (SENZA EMOJI E NUMERAZIONI RIDONDANTI) ── */}
      <div className="fm-dimensions-bar" role="tablist" aria-label="Seleziona la dimensione sonora da esplorare">
        {COPPIE_ARTISTI_MUSSIDA.map((coppiaObj, idx) => {
          const isActive = idx === activeIndex
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
              <span className="fm-dimensions-bar__tab-name">{coppiaObj.dimensione}</span>
              {shortFocus ? <span className="fm-dimensions-bar__tab-focus">{shortFocus}</span> : null}
            </button>
          )
        })}
      </div>

      {/* ── CONTROLLI SFOGLIO + INDICATORE STEP ── */}
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
            {current.dimensione} · <strong>{activeIndex + 1}</strong> di <strong>{total}</strong>
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

      {/* ── PANNELLO ATTIVO EDITORIALE ── */}
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
            {/* Header editoriale: testo in prosa, privo di badge rigidi e box artificiali */}
            <header className="fm-dimension-editorial-header">
              <h3 className="fm-dimension-editorial-title">{current.dimensione}</h3>
              {current.sottotitolo ? (
                <p className="fm-dimension-editorial-subtitle">{current.sottotitolo}</p>
              ) : null}

              <div className="fm-dimension-editorial-body">
                {current.descrizione ? (
                  <p className="fm-dimension-editorial-desc">{current.descrizione}</p>
                ) : null}
                {current.domandaGuida ? (
                  <p className="fm-dimension-editorial-guide">
                    <em>«{current.domandaGuida}»</em>
                  </p>
                ) : null}
              </div>
            </header>

            {/* Tracce a confronto: fluide, pulite, senza micro-kicker gridati */}
            <div className="fm-artist-pair-card__dual-grid">
              {current.coppia.map((traccia) => {
                const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${traccia.artista} ${traccia.brano}`)}`

                return (
                  <div key={traccia.artista + traccia.brano} className="fm-artist-track">
                    <div className="fm-artist-track__header">
                      <span className="fm-artist-track__orientation">{traccia.polo}</span>
                      <h4 className="fm-artist-track__title">{traccia.brano}</h4>
                      <p className="fm-artist-track__author">{traccia.artista}</p>
                    </div>

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

      {/* ── NAVIGATORE INFERIORE ── */}
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
