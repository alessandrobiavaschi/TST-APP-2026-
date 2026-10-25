import React, { useState } from 'react'
import {
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

export default function GuidaFamiglieSuono({
  userDominantFamily = 'Blu',
}) {
  const [selectedFamilyKey, setSelectedFamilyKey] = useState(userDominantFamily || 'Blu')

  const selectedFamilyData = SUONO_PER_FAMIGLIA[selectedFamilyKey] || SUONO_PER_FAMIGLIA.Blu
  const familyNatureList = NATURE_DETTAGLIO_12.filter(
    (n) => n.famigliaNome.toLowerCase() === selectedFamilyData.famiglia.toLowerCase(),
  )

  return (
    <section id="fm-famiglie" className="fm-section fm-famiglie-suono" aria-labelledby="fm-famiglie-title">
      <div className="fm-book-atlas__head">
        <p className="fm-kicker">Sezione 6 · Guida alle famiglie musicali</p>
        <h2 id="fm-famiglie-title">Caratteristiche sonore delle 5 famiglie</h2>
        <p className="fm-section-lead">
          Esplora i timbri, i ritmi, le scale e le sfumature emotive di ciascuna delle cinque famiglie nella musica.
        </p>
      </div>

      <div className="fm-encyclopedia">
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

          {/* Le Nature della Famiglia */}
          <div className="fm-family-nature-block">
            <h4 className="fm-family-nature-block__title">
              Le Nature della Famiglia {selectedFamilyData.famiglia}:
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
    </section>
  )
}
