import React from 'react'
import { AREE, FAMIGLIE_MUSICA, STANZE } from '../../../content/musicistiStanze.js'
import BadgeBeta from './BadgeBeta.jsx'
import { NOME_SEZIONE_MUSICA } from './nomeSezione.js'

const STANZA_BY_ID = Object.fromEntries(STANZE.map((s) => [s.id, s]))

/** Ingresso (quattro aree) oppure l'interno di un'area (le sue stanze). */
export default function PiantaStanze({ area, famigliaPrevalente, onApriArea, onApriStanza }) {
  const tua = famigliaPrevalente ? FAMIGLIE_MUSICA[famigliaPrevalente] : null

  if (!area) {
    return (
      <div className="stanze-pianta">
        <header className="stanze-pianta__intro">
          <h1>
            {NOME_SEZIONE_MUSICA} <BadgeBeta />
          </h1>
          <p>Il rapporto tra le famiglie emotive e la musica, da consultare con calma. Scegli da dove partire.</p>
        </header>
        <div className="stanze-pianta__porte stanze-pianta__porte--aree">
          {AREE.map((a) => (
            <button key={a.id} type="button" className="stanze-porta stanze-porta--area" onClick={() => onApriArea(a.id)}>
              <span className="stanze-porta__nome">{a.titolo}</span>
              <span className="stanze-porta__descrizione">{a.descrizione}</span>
              <span className="stanze-porta__nota">
                {a.stanze.length === 1 ? '1 stanza' : `${a.stanze.length} stanze`}
              </span>
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
              {evidenziata ? <span className="stanze-porta__nota">Si apre sulla famiglia {tua.nome}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
