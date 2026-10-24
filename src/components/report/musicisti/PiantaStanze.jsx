import React from 'react'
import { FAMIGLIE_MUSICA, ORDINE_FAMIGLIE, STANZE } from '../../../content/musicistiStanze.js'

/** Ingresso: la pianta delle stanze. La famiglia prevalente compare per prima ed è evidenziata. */
export default function PiantaStanze({ famigliaPrevalente, onApri }) {
  const ordine = famigliaPrevalente && FAMIGLIE_MUSICA[famigliaPrevalente]
    ? [famigliaPrevalente, ...ORDINE_FAMIGLIE.filter((k) => k !== famigliaPrevalente)]
    : ORDINE_FAMIGLIE

  return (
    <div className="stanze-pianta">
      <header className="stanze-pianta__intro">
        <h1>Per musicisti</h1>
        <p>
          Stanze da consultare per studiare il rapporto tra le famiglie emotive e la musica. Ogni stanza ha un suo
          modo di lettura; gli ascolti sono i suoni del test.
        </p>
      </header>

      {STANZE.map((stanza) => (
        <section key={stanza.id} className="stanze-pianta__stanza" aria-labelledby={`stanza-${stanza.id}`}>
          <h2 id={`stanza-${stanza.id}`}>{stanza.titolo}</h2>
          <p>{stanza.descrizione}</p>
          <div className="stanze-pianta__porte">
            {ordine.map((key) => {
              const fam = FAMIGLIE_MUSICA[key]
              const tua = key === famigliaPrevalente
              return (
                <button
                  key={key}
                  type="button"
                  className={`stanze-porta${tua ? ' is-tua' : ''}`}
                  data-famiglia={fam.colorKey}
                  onClick={() => onApri(stanza.id, key)}
                >
                  <span className="stanze-porta__nome">{fam.nome}</span>
                  {tua ? <span className="stanze-porta__nota">La tua famiglia</span> : null}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
