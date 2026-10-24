import React from 'react'
import { ELEMENTI_ASCOLTO } from '../../../content/musicistiContenuti.js'

const cerca = (b) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${b.autore} ${b.titolo}`)}`

/** Stanza 6: guida all'ascolto. Prima le domande, poi i due brani, poi la direzione. */
export default function StanzaAscolto() {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Ascolto guidato</h1>
        <p>
          Ogni parte della musica si può immaginare come un elemento. Leggi le domande, ascolta i due brani e osserva
          in che direzione ti portano.
        </p>
      </header>
      {ELEMENTI_ASCOLTO.map((el) => (
        <section key={el.nome} className="stanza-elemento">
          <h2>{el.nome} <span>· {el.codice}</span></h2>
          <ul className="stanza-generica__elenco">
            {el.domande.map((d) => <li key={d}>{d}</li>)}
          </ul>
          <div className="stanza-coppie">
            {el.brani.map((b) => (
              <div key={b.titolo} className="stanza-coppia">
                <h3>{b.titolo}</h3>
                <p>{b.autore}</p>
                <a href={cerca(b)} target="_blank" rel="noopener noreferrer">Cerca l’ascolto ↗</a>
                <details>
                  <summary>Direzione</summary>
                  <p>{b.direzione}</p>
                </details>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
