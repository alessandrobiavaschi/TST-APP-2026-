import React from 'react'
import { COPPIE_ARTISTI_MUSSIDA } from '../../content/musicaPerMusicisti.js'

export default function AscoltiEArtisti({ accentColor = '#4ade80' }) {
  return (
    <section className="fm-section fm-artists-list" aria-labelledby="fm-artists-title">
      <div className="fm-artists-list__head">
        <p className="fm-kicker">Metodo di ascolto · Il Pianeta della Musica</p>
        <h2 id="fm-artists-title">Ascolti e artisti: le 5 coppie del libro</h2>
        <p className="fm-section-lead">
          Le cinque dimensioni fondamentali del codice musicale raccontate attraverso dieci brani reali
          agli estremi opposti di una stessa sensazione. L'analisi esperienziale di Franco Mussida
          guida l'ascolto per riconoscere come il suono orienta il nostro mondo interiore.
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
                  <span className="fm-artist-track__pole">{traccia.polo}</span>
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
