import React from 'react'
import { COPPIE_ARTISTI_MUSSIDA } from '../../content/musicaPerMusicisti.js'

export default function AscoltiEArtisti({ accentColor = '#4ade80' }) {
  return (
    <section id="fm-ascolti" className="fm-section fm-artists-list" aria-labelledby="fm-artists-title">
      <div className="fm-artists-list__head">
        <p className="fm-kicker">Guida all'ascolto consapevole · I 5 codici musicali</p>
        <h2 id="fm-artists-title">Ascolti consigliati: i 5 contrasti sonori</h2>
        <p className="fm-section-lead">
          La musica comunica con le nostre emozioni attraverso cinque parametri fondamentali:
          {' '}<strong>Timbro</strong>, <strong>Ritmo</strong>, <strong>Melodia</strong>, <strong>Intervallo</strong> e <strong>Armonia</strong>.
          Ciascuna dimensione orienta il nostro stato psicofisiologico. Per sperimentarlo in modo diretto,
          ecco dieci brani celebri messi a confronto a coppie su polarità opposte: una palestra d'ascolto
          per riconoscere in prima persona come ciascun elemento sonoro modella il nostro mondo interiore.
        </p>
      </div>

      <div className="fm-artists-list__container">
        {COPPIE_ARTISTI_MUSSIDA.map((coppiaObj, index) => {
          const num = String(index + 1).padStart(2, '0')
          return (
            <article key={coppiaObj.dimensione} className="fm-artist-pair-card">
              <header className="fm-artist-pair-card__header">
                <div className="fm-artist-pair-card__meta">
                  <span className="fm-artist-pair-card__badge" style={{ borderColor: accentColor, color: accentColor }}>
                    Dimensione {num} · {coppiaObj.dimensione}
                  </span>
                  {coppiaObj.sottotitolo ? (
                    <span className="fm-artist-pair-card__subtitle">
                      {coppiaObj.sottotitolo}
                    </span>
                  ) : null}
                </div>

                {coppiaObj.descrizione ? (
                  <p className="fm-artist-pair-card__desc">
                    {coppiaObj.descrizione}
                  </p>
                ) : null}

                <div className="fm-artist-pair-card__prompt">
                  <span className="fm-artist-pair-card__prompt-label">Chiave di ascolto</span>
                  <p className="fm-artist-pair-card__question">«{coppiaObj.domandaGuida}»</p>
                </div>
              </header>

              <div className="fm-artist-pair-card__dual-grid">
                {coppiaObj.coppia.map((traccia, trackIdx) => {
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
            </article>
          )
        })}
      </div>
    </section>
  )
}
