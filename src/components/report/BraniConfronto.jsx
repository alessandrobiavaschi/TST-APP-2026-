import React from 'react'
import { COPPIE_ARTISTI_MUSSIDA } from '../../content/musicaPerMusicisti.js'

export default function BraniConfronto({ accentColor = '#4ade80' }) {
  return (
    <section id="fm-confronti" className="fm-section fm-brani-confronto" aria-labelledby="fm-confronti-title">
      <div className="fm-book-atlas__head">
        <p className="fm-kicker">Sezione 5 · Brani a confronto</p>
        <h2 id="fm-confronti-title">Confronto tra brani musicali</h2>
        <p className="fm-section-lead">
          Cinque dimensioni fondamentali del linguaggio musicale esplorate attraverso 10 brani di riferimento
          posti agli estremi di una stessa risonanza emotiva.
        </p>
      </div>

      <div className="fm-artists-list__container">
        {COPPIE_ARTISTI_MUSSIDA.map((coppiaObj) => (
          <article key={coppiaObj.dimensione} className="fm-artist-pair-card">
            <header className="fm-artist-pair-card__header">
              <span className="fm-artist-pair-card__dimension" style={{ color: accentColor }}>
                {coppiaObj.dimensione} · {coppiaObj.elemento}
              </span>
              <p className="fm-artist-pair-card__question">«{coppiaObj.domandaGuida}»</p>
            </header>

            <div className="fm-artist-pair-card__dual-grid">
              {coppiaObj.coppia.map((traccia) => (
                <div key={traccia.artista + traccia.brano} className="fm-artist-track">
                  <span className="fm-artist-track__polo">{traccia.polo}</span>
                  <h3 className="fm-artist-track__title">{traccia.brano}</h3>
                  <p className="fm-artist-track__author">{traccia.artista}</p>
                  <p className="fm-artist-track__analysis">{traccia.analisi}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
