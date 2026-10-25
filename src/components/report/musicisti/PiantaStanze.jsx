import React from 'react'
import { AREE, FAMIGLIE_MUSICA, STANZE } from '../../../content/musicistiStanze.js'
import { NOME_SEZIONE_MUSICA } from './nomeSezione.js'

const STANZA_BY_ID = Object.fromEntries(STANZE.map((s) => [s.id, s]))

/** Indice (quattro aree) oppure l'interno di un'area (le sue stanze). */
export default function PiantaStanze({ area, famigliaPrevalente, onApriArea, onApriStanza }) {
  const tua = famigliaPrevalente ? FAMIGLIE_MUSICA[famigliaPrevalente] : null

  if (!area) {
    return (
      <div className="stanze-pianta">
        <header className="stanze-pianta__intro">
          <h1>{NOME_SEZIONE_MUSICA}</h1>
          <p>Il rapporto tra le famiglie emotive e la musica, da consultare con calma. Scegli da dove partire.</p>
        </header>
        <div className="stanze-pianta__porte stanze-pianta__porte--aree">
          {AREE.map((a) => (
            <button key={a.id} type="button" className="stanze-porta stanze-porta--area" onClick={() => onApriArea(a.id)}>
              <span className="stanze-porta__nome">{a.titolo}</span>
              <span className="stanze-porta__descrizione">{a.descrizione}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="stanze-pianta">
      <header className="stanze-pianta__intro">
        <h1>{area.titolo}</h1>
        <p>{area.descrizione}</p>
      </header>
      <div className="stanze-pianta__porte">
        {area.stanze.map((id) => {
          const stanza = STANZA_BY_ID[id]
          const evidenziata = id === 'famiglia' && tua
          return (
            <button
              key={id}
              type="button"
              className={`stanze-porta${evidenziata ? ' is-tua' : ''}`}
              data-famiglia={evidenziata ? tua.colorKey : undefined}
              onClick={() => onApriStanza(id)}
            >
              <span className="stanze-porta__nome">{stanza.titolo}</span>
              <span className="stanze-porta__descrizione">{stanza.descrizione}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
