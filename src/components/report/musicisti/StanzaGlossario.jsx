import React from 'react'
import { GLOSSARIO } from '../../../content/musicistiContenuti.js'
import { STANZE } from '../../../content/musicistiStanze.js'

/** Stanza 7: dizionario A–Z con il rimando alla stanza dove la parola si ascolta. */
export default function StanzaGlossario({ onApri }) {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Glossario</h1>
        <p>Le parole della musica usate nelle stanze.</p>
      </header>
      <dl className="stanza-glossario">
        {GLOSSARIO.map((voce) => {
          const stanza = STANZE.find((s) => s.id === voce.stanza)
          return (
            <div key={voce.termine} className="stanza-glossario__voce">
              <dt>{voce.termine}</dt>
              <dd>
                {voce.definizione}{' '}
                {stanza ? (
                  <button type="button" className="stanza-rimando" onClick={() => onApri(stanza.id)}>
                    {stanza.titolo} →
                  </button>
                ) : null}
              </dd>
            </div>
          )
        })}
      </dl>
    </div>
  )
}
