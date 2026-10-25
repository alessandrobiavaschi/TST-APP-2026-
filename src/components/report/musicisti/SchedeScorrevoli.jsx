import React from 'react'

/**
 * Schede in una fila scorrevole: si vede un gruppo alla volta, così una stanza
 * non mostra mai tutto insieme. `schede`: [{ id, titolo }].
 */
export default function SchedeScorrevoli({ schede, attiva, onCambia, etichetta }) {
  return (
    <div className="stanza-schede" role="tablist" aria-label={etichetta}>
      {schede.map((s, i) => (
        <button
          key={s.id}
          type="button"
          role="tab"
          aria-selected={attiva === s.id}
          className="stanza-scheda"
          data-famiglia={s.colorKey}
          onClick={() => onCambia(s.id)}
        >
          <span className="stanza-scheda__numero">{i + 1}</span>
          {s.titolo}
        </button>
      ))}
    </div>
  )
}
