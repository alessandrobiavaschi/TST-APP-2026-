import React, { useState } from 'react'
import {
  COPPIE_ARTISTI_MUSSIDA,
  SUONO_PER_FAMIGLIA,
  NATURE_DETTAGLIO_12,
} from '../../content/musicaPerMusicisti.js'

const FAMIGLIE_KEYS = [
  { key: 'Blu', nome: 'Malinconica', color: '#2563eb' },
  { key: 'Rosso', nome: 'Marziale', color: '#dc2626' },
  { key: 'Verde', nome: 'Flemmatica', color: '#16a34a' },
  { key: 'Giallo', nome: 'Entusiasta', color: '#eab308' },
  { key: 'Grigio', nome: 'Razionale', color: '#64748b' },
]

export default function MussidaBookAtlas({
  accentColor = '#4ade80',
  userDominantFamily = 'Blu',
}) {
  const [activeAtlasTab, setActiveAtlasTab] = useState('artisti') // 'artisti' | 'enciclopedia'
  const [selectedFamilyKey, setSelectedFamilyKey] = useState(userDominantFamily || 'Blu')

  const selectedFamilyData = SUONO_PER_FAMIGLIA[selectedFamilyKey] || SUONO_PER_FAMIGLIA.Blu
  const familyNatureList = NATURE_DETTAGLIO_12.filter(
    (n) => n.famigliaNome.toLowerCase() === selectedFamilyData.famiglia.toLowerCase()
  )

  return (
    <section id="fm-atlante" className="fm-section fm-book-atlas" aria-labelledby="fm-atlante-title">
      <div className="fm-book-atlas__head">
        <p className="fm-kicker">Stanza 4 · L'Atlante del Pianeta della Musica</p>
        <h2 id="fm-atlante-title">L'Atlante Musicale di Franco Mussida</h2>
        <p className="fm-section-lead">
          Esplora l'intero corpus teorico del libro <em>«Il Pianeta della Musica»</em>:
          i grandi brani della storia a confronto polare e l'enciclopedia completa di tutte
          le 5 Famiglie e 12 Nature emotive.
        </p>

        {/* Tab switcher: Grandi ascolti vs Enciclopedia */}
        <div className="fm-atlas-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeAtlasTab === 'artisti'}
            className={`fm-atlas-tab-btn ${activeAtlasTab === 'artisti' ? 'is-active' : ''}`}
            onClick={() => setActiveAtlasTab('artisti')}
          >
            <span>🎧 Le 5 Coppie di Ascolti Polari</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeAtlasTab === 'enciclopedia'}
            className={`fm-atlas-tab-btn ${activeAtlasTab === 'enciclopedia' ? 'is-active' : ''}`}
            onClick={() => setActiveAtlasTab('enciclopedia')}
          >
            <span>📖 Enciclopedia delle 5 Famiglie &amp; 12 Nature</span>
          </button>
        </div>
      </div>

      {/* ── SOTTO-VISTA 1: I 10 GRANDI ASCOLTI A CONFRONTO POLARE ── */}
      {activeAtlasTab === 'artisti' && (
        <div className="fm-artists-list__container">
          <p className="fm-atlas-sub-lead">
            Cinque dimensioni fondamentali del codice musicale esplorate attraverso 10 brani di riferimento
            agli estremi opposti di una stessa vibrazione emotiva. L'analisi di Franco Mussida svela
            come il suono governa la nostra percezione.
          </p>
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
      )}

      {/* ── SOTTO-VISTA 2: ENCICLOPEDIA DELLE 5 FAMIGLIE & 12 NATURE ── */}
      {activeAtlasTab === 'enciclopedia' && (
        <div className="fm-encyclopedia">
          <p className="fm-atlas-sub-lead">
            Seleziona una famiglia per esplorare in dettaglio i suoi timbri, i ritmi, le scale
            e le nature emotive descritte da Franco Mussida nel libro:
          </p>

          {/* Selettore Famiglia a Pillole */}
          <div className="fm-family-selector" role="tablist" aria-label="Seleziona Famiglia">
            {FAMIGLIE_KEYS.map((fam) => {
              const isSelected = selectedFamilyKey === fam.key
              return (
                <button
                  key={fam.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`fm-family-selector__btn ${isSelected ? 'is-selected' : ''}`}
                  style={{ '--btn-family-color': fam.color }}
                  onClick={() => setSelectedFamilyKey(fam.key)}
                >
                  <span className="fm-family-selector__dot" style={{ backgroundColor: fam.color }} />
                  <span className="fm-family-selector__title">{fam.key}</span>
                  <span className="fm-family-selector__subtitle">{fam.nome}</span>
                </button>
              )
            })}
          </div>

          {/* Scheda Famiglia Selezionata */}
          <div
            className="fm-family-detail-card"
            style={{ '--detail-family-color': selectedFamilyData.colore }}
          >
            <div className="fm-family-detail-card__header">
              <span className="fm-kicker" style={{ color: selectedFamilyData.colore }}>
                Famiglia {selectedFamilyData.famiglia}
              </span>
              <h3 className="fm-family-detail-card__motto">«{selectedFamilyData.motto}»</h3>
            </div>

            {/* Griglia 4 Caratteristiche */}
            <div className="fm-family-detail-card__grid">
              <div className="fm-family-detail-module">
                <span className="fm-family-detail-module__label">Timbri d'Elezione</span>
                <h4>{selectedFamilyData.timbri.titolo}</h4>
                <p>{selectedFamilyData.timbri.descrizione}</p>
              </div>

              <div className="fm-family-detail-module">
                <span className="fm-family-detail-module__label">Ritmo &amp; BPM</span>
                <h4>{selectedFamilyData.ritmoBpm.titolo}</h4>
                <p>{selectedFamilyData.ritmoBpm.descrizione}</p>
              </div>

              <div className="fm-family-detail-module">
                <span className="fm-family-detail-module__label">Armonie &amp; Modi</span>
                <h4>{selectedFamilyData.armonieModi.titolo}</h4>
                <p>{selectedFamilyData.armonieModi.descrizione}</p>
              </div>

              <div className="fm-family-detail-module">
                <span className="fm-family-detail-module__label">Attitudine Esecutiva</span>
                <h4>{selectedFamilyData.ilMusicistaCheSei.titolo}</h4>
                <p>{selectedFamilyData.ilMusicistaCheSei.descrizione}</p>
              </div>
            </div>

            {/* Le Nature della Famiglia nel Libro */}
            <div className="fm-family-nature-block">
              <h4 className="fm-family-nature-block__title">
                Le Nature della Famiglia {selectedFamilyData.famiglia} nel Libro:
              </h4>
              <div className="fm-family-nature-cards">
                {familyNatureList.map((nat) => (
                  <article key={nat.id} className="fm-nature-encyclo-card">
                    <header className="fm-nature-encyclo-card__header">
                      <div className="fm-nature-encyclo-card__title-box">
                        <span className="fm-nature-encyclo-card__interval-tag">
                          {nat.intervallo} ({nat.rapportoFrequenza})
                        </span>
                        <h5>{nat.nome}</h5>
                      </div>
                    </header>
                    <p className="fm-nature-encyclo-card__evocativa">{nat.evocativa}</p>
                    <div className="fm-nature-encyclo-card__meta">
                      <div>
                        <strong>Codice sonoro:</strong> {nat.codiceSonoro}
                      </div>
                      <div>
                        <strong>Timbri evocati:</strong> {nat.timbriEvocati}
                      </div>
                      <div>
                        <strong>Attitudine:</strong> {nat.attitudineMusicale}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
