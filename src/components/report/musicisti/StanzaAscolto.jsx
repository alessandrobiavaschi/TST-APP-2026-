import React from 'react'
import { ELEMENTI_ASCOLTO } from '../../../content/musicistiContenuti.js'
import Finestra, { Finestre } from './Finestra.jsx'

const cerca = (b) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${b.autore} ${b.titolo}`)}`

/** Stanza dell'ascolto guidato: un elemento per finestra. Prima le domande, poi i due brani, poi la direzione. */
export default function StanzaAscolto() {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Ascolto guidato</h1>
        <p>Ogni parte della musica si può immaginare come un elemento. Leggi le domande, ascolta i due brani e osserva dove ti portano.</p>
      </header>
      <Finestre>
        {ELEMENTI_ASCOLTO.map((el) => (
          <Finestra key={el.nome} titolo={el.nome} nota={el.codice} gruppo="ascolto">
            <ul className="stanza-generica__elenco">
              {el.domande.map((d) => <li key={d}>{d}</li>)}
            </ul>
            <div className="stanza-riquadri">
              {el.brani.map((b) => (
                <section key={b.titolo} className="stanza-riquadro">
                  <h2>{b.titolo}</h2>
                  <p>{b.autore}</p>
                  <a href={cerca(b)} target="_blank" rel="noopener noreferrer">Cerca l’ascolto ↗</a>
                  <details>
                    <summary>Direzione</summary>
                    <p>{b.direzione}</p>
                  </details>
                </section>
              ))}
            </div>
          </Finestra>
        ))}
      </Finestre>
    </div>
  )
}
