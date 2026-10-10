import React from 'react'
import RoomRevealContent from './RoomRevealContent.jsx'
import { ASCOLTO_INTRO, ELEMENTI_ASCOLTO } from '../../content/ascoltoEmotivoConsapevole.js'
import '../../styles/ascolto-emotivo.css'

function Polo({ polo }) {
  return (
    <div className="ascolto__polo">
      <p className="fm-kicker">{polo.direzione}</p>
      <p className="ascolto__artista">{polo.artista}</p>
      <p className="ascolto__brano">{polo.brano}</p>
      <p className="ascolto__sintesi">{polo.sintesi}</p>
    </div>
  )
}

function ElementoAscolto({ elemento }) {
  return (
    <RoomRevealContent className="ascolto__elemento" as="article">
      <div className="ascolto__elemento-head">
        <p className="fm-kicker">
          {elemento.elemento} · {elemento.dimensione}
        </p>
        <p className="ascolto__definizione">{elemento.definizione}</p>
      </div>

      <div className="ascolto__poli">
        {elemento.poli.map((polo) => (
          <Polo key={polo.artista} polo={polo} />
        ))}
      </div>

      {elemento.domande?.length ? (
        <ul className="ascolto__domande">
          {elemento.domande.map((domanda) => (
            <li key={domanda}>{domanda}</li>
          ))}
        </ul>
      ) : null}
    </RoomRevealContent>
  )
}

export default function AscoltoEmotivoConsapevole({ accentColor = '#4ade80' }) {
  return (
    <section className="fm-section ascolto-emotivo" style={{ '--music-accent': accentColor }} aria-labelledby="ascolto-emotivo-title">
      <h2 id="ascolto-emotivo-title">Ascolto emotivo consapevole</h2>
      <p className="fm-section-lead">{ASCOLTO_INTRO}</p>

      <div className="ascolto__lista">
        {ELEMENTI_ASCOLTO.map((elemento) => (
          <ElementoAscolto key={elemento.key} elemento={elemento} />
        ))}
      </div>
    </section>
  )
}
