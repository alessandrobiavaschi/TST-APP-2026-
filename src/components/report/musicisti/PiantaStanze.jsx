import React from 'react'
import { FAMIGLIE_MUSICA, STANZE } from '../../../content/musicistiStanze.js'

/** Ingresso: la pianta delle stanze. La stanza della famiglia apre sulla famiglia prevalente. */
export default function PiantaStanze({ famigliaPrevalente, onApri }) {
  const tua = famigliaPrevalente ? FAMIGLIE_MUSICA[famigliaPrevalente] : null
  return (
    <div className="stanze-pianta">
      <header className="stanze-pianta__intro">
        <h1>Per musicisti</h1>
        <p>
          Stanze da consultare per studiare il rapporto tra le famiglie emotive e la musica. Ogni stanza ha un suo
          modo di lettura; gli ascolti sono i suoni del test.
        </p>
      </header>
      <div className="stanze-pianta__porte">
        {STANZE.map((stanza) => {
          const evidenziata = stanza.id === 'famiglia' && tua
          return (
            <button
              key={stanza.id}
              type="button"
              className={`stanze-porta${evidenziata ? ' is-tua' : ''}`}
              data-famiglia={evidenziata ? tua.colorKey : undefined}
              onClick={() => onApri(stanza.id)}
            >
              <span className="stanze-porta__nome">{stanza.titolo}</span>
              <span className="stanze-porta__descrizione">{stanza.descrizione}</span>
              {evidenziata ? <span className="stanze-porta__nota">Si apre sulla famiglia {tua.nome}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
