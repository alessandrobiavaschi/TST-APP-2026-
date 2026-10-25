import React from 'react'
import { SUONO_PER_FAMIGLIA } from '../../content/musicaPerMusicisti.js'

export default function IlTuoSuonoFamiglia({
  profilo = {},
  accentColor = '#4ade80',
}) {
  const famigliaKey = profilo?.famiglia || 'Blu'
  const schedaSuono = SUONO_PER_FAMIGLIA[famigliaKey] || SUONO_PER_FAMIGLIA.Blu
  const themeColor = schedaSuono.colore || accentColor

  return (
    <section className="fm-section fm-family-sound" aria-labelledby="fm-family-sound-title">
      <div className="fm-family-sound__head">
        <p className="fm-kicker">Profilo sonoro · Famiglia {schedaSuono.famiglia}</p>
        <h2 id="fm-family-sound-title">Il tuo suono per famiglia</h2>
        <p className="fm-section-lead">
          {schedaSuono.motto}. Una sintesi dei timbri, dei ritmi, delle armonie e del modo di fare
          musica che caratterizzano la tua disposizione prevalente secondo il modello di Franco Mussida.
        </p>
      </div>

      <div className="fm-family-sound__grid">
        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Timbri &amp; Strumenti</div>
          <h3 className="fm-sound-pillar__title">{schedaSuono.timbri.titolo}</h3>
          <p className="fm-sound-pillar__desc">{schedaSuono.timbri.descrizione}</p>
        </article>

        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Ritmo &amp; BPM</div>
          <h3 className="fm-sound-pillar__title">{schedaSuono.ritmoBpm.titolo}</h3>
          <p className="fm-sound-pillar__desc">{schedaSuono.ritmoBpm.descrizione}</p>
        </article>

        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Armonie &amp; Modi</div>
          <h3 className="fm-sound-pillar__title">{schedaSuono.armonieModi.titolo}</h3>
          <p className="fm-sound-pillar__desc">{schedaSuono.armonieModi.descrizione}</p>
        </article>

        <article className="fm-sound-pillar" style={{ '--pillar-accent': themeColor }}>
          <div className="fm-sound-pillar__badge">Il musicista che sei</div>
          <h3 className="fm-sound-pillar__title">{schedaSuono.ilMusicistaCheSei.titolo}</h3>
          <p className="fm-sound-pillar__desc">{schedaSuono.ilMusicistaCheSei.descrizione}</p>
        </article>
      </div>
    </section>
  )
}
