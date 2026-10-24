import React, { useState } from 'react'
import { ELEMENTI_ASCOLTO } from '../../../content/musicistiContenuti.js'
import SchedeScorrevoli from './SchedeScorrevoli.jsx'

const cerca = (b) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${b.autore} ${b.titolo}`)}`

/** Stanza dell'ascolto guidato: un elemento alla volta. Prima le domande, poi i due brani, poi la direzione. */
export default function StanzaAscolto() {
  const [nome, setNome] = useState(ELEMENTI_ASCOLTO[0].nome)
  const el = ELEMENTI_ASCOLTO.find((e) => e.nome === nome)

  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Ascolto guidato</h1>
        <p>Ogni parte della musica si può immaginare come un elemento. Leggi le domande, ascolta i due brani e osserva dove ti portano.</p>
      </header>
      <SchedeScorrevoli
        etichetta="Elemento"
        schede={ELEMENTI_ASCOLTO.map((e) => ({ id: e.nome, titolo: e.nome }))}
        attiva={nome}
        onCambia={setNome}
      />
      <div role="tabpanel" className="stanza-generica">
        <p className="stanza-generica__nota">{el.codice}</p>
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
      </div>
    </div>
  )
}
