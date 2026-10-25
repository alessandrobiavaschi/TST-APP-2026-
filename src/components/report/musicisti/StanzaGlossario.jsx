import React from 'react'
import { GLOSSARIO } from '../../../content/musicistiContenuti.js'
import { STANZE } from '../../../content/musicistiStanze.js'
import Finestra, { Finestre } from './Finestra.jsx'

/** Glossario: una parola per finestra, con il rimando alla stanza dove si ascolta. */
export default function StanzaGlossario({ onApri }) {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Glossario</h1>
        <p>Le parole della musica usate nelle stanze.</p>
      </header>
      <Finestre>
        {GLOSSARIO.map((voce) => {
          const stanza = STANZE.find((s) => s.id === voce.stanza)
          return (
            <Finestra key={voce.termine} titolo={voce.termine} gruppo="glossario">
              <p>{voce.definizione}</p>
              {stanza ? (
                <button type="button" className="stanza-rimando" onClick={() => onApri(stanza.id)}>
                  {stanza.titolo} →
                </button>
              ) : null}
            </Finestra>
          )
        })}
      </Finestre>
    </div>
  )
}
