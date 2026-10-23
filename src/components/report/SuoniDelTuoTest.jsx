import React, { useState, useMemo } from 'react'
import { ASCOLTI_72_TEST } from '../../content/musicaPerMusicisti.js'

const SEZIONI_FILTRO = [
  { key: 'all', label: 'Tutti i 72 passi' },
  { key: 'A_TIMBRO', label: 'Timbro (1–28)' },
  { key: 'B_INTERVALLI', label: 'Intervalli (29–41)' },
  { key: 'C_RITMO', label: 'Ritmo (42–51)' },
  { key: 'D_MELODIA', label: 'Melodia (52–58)' },
  { key: 'E_ARMONIA', label: 'Accordi (59–72)' },
]

export default function SuoniDelTuoTest({
  rawRecord = {},
  accentColor = '#4ade80',
}) {
  const [selectedSezione, setSelectedSezione] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredAscolti = useMemo(() => {
    return ASCOLTI_72_TEST.filter((ascolto) => {
      const matchSezione =
        selectedSezione === 'all' || ascolto.sezione === selectedSezione
      if (!matchSezione) return false
      if (!searchQuery.trim()) return true

      const q = searchQuery.toLowerCase().trim()
      const passoStr = String(ascolto.passo)
      const key = `File_${passoStr.padStart(2, '0')}`
      const risposta = String(rawRecord?.[key] || '').toLowerCase()
      const titolo = ascolto.titoloTecnico.toLowerCase()
      const spiegazione = ascolto.spiegazione.toLowerCase()

      return (
        passoStr.includes(q) ||
        titolo.includes(q) ||
        spiegazione.includes(q) ||
        risposta.includes(q)
      )
    })
  }, [selectedSezione, searchQuery, rawRecord])

  return (
    <section id="fm-passi" className="fm-section fm-test-sounds" aria-labelledby="fm-test-sounds-title">
      <div className="fm-test-sounds__head">
        <p className="fm-kicker">Stanza 3 · La macchina del test decodificata</p>
        <h2 id="fm-test-sounds-title">I 72 suoni del tuo test (Dietro le quinte)</h2>
        <p className="fm-section-lead">
          La mappa tecnica di tutti i 72 brani e stimoli acustici ascoltati durante la prova:
          il nome compositivo formale, il principio armonico e la risposta esatta che hai
          indicato durante la tua sessione.
        </p>
      </div>

      <div className="fm-test-sounds__toolbar">
        <div className="fm-test-sounds__filters" role="tablist" aria-label="Filtra per area musicale">
          {SEZIONI_FILTRO.map((filtro) => {
            const isSelected = selectedSezione === filtro.key
            return (
              <button
                key={filtro.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`fm-test-sounds__tab-btn${isSelected ? ' is-active' : ''}`}
                style={isSelected ? { borderColor: accentColor, color: '#f8fafc' } : {}}
                onClick={() => setSelectedSezione(filtro.key)}
              >
                {filtro.label}
              </button>
            )
          })}
        </div>

        <div className="fm-test-sounds__search">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cerca per strumento, accordo, risposta o n° passo…"
            className="fm-test-sounds__input"
            aria-label="Cerca nei 72 suoni del test"
          />
        </div>
      </div>

      <div className="fm-test-sounds__grid" role="list">
        {filteredAscolti.map((ascolto) => {
          const fileKey = `File_${String(ascolto.passo).padStart(2, '0')}`
          const userResponse = rawRecord?.[fileKey]
          const hasResponse = userResponse !== undefined && userResponse !== null && String(userResponse).trim() !== ''

          return (
            <article
              key={ascolto.passo}
              role="listitem"
              className="fm-sound-card"
            >
              <div className="fm-sound-card__meta">
                <span className="fm-sound-card__step">
                  Passo {String(ascolto.passo).padStart(2, '0')}
                </span>
                <span className="fm-sound-card__section-tag">
                  {ascolto.sezioneNome}
                </span>
              </div>

              <h3 className="fm-sound-card__title">{ascolto.titoloTecnico}</h3>
              <p className="fm-sound-card__explanation">{ascolto.spiegazione}</p>

              <div className="fm-sound-card__response-box">
                <span className="fm-sound-card__response-label">La tua risposta:</span>
                {hasResponse ? (
                  <span className="fm-sound-card__response-value" style={{ color: accentColor }}>
                    «{String(userResponse)}»
                  </span>
                ) : (
                  <span className="fm-sound-card__response-empty">
                    Dato non registrato nel record
                  </span>
                )}
              </div>
            </article>
          )
        })}
      </div>

      {filteredAscolti.length === 0 && (
        <p className="fm-test-sounds__empty">
          Nessun ascolto trovato con i criteri di ricerca correnti.
        </p>
      )}
    </section>
  )
}
