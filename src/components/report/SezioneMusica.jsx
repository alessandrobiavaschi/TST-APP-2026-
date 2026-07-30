import React from 'react'
import { MUSICISTI_SCHEDE } from '../../content/musicaDisposizione.js'
import '../../styles/sezione-musica.css'

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="sezione-musica__list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

function DetailRows({ items }) {
  const availableItems = items.filter((item) => item.text)
  if (!availableItems.length) return null
  return (
    <div className="fm-music-rows">
      {availableItems.map((item) => (
        <div className="fm-music-row" key={item.title}>
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  )
}

function Intervals({ data }) {
  if (!data?.correnti?.length) return null
  return (
    <section className="fm-section" aria-labelledby="fm-intervals-title">
      <h2 id="fm-intervals-title">Cosa evocano gli intervalli</h2>
      <p className="fm-section-lead">
        Un intervallo è la distanza tra due note. Nel modello, ogni distanza può evocare
        una corrente emotiva, espressa attraverso diversi stati d’animo.
      </p>
      {data.intro ? <p className="fm-section-lead">{data.intro}</p> : null}
      <div className="fm-interval-list">
        {data.correnti.map((item) => (
          <article className="fm-interval-item" key={`${item.nome}-${item.intervallo}`}>
            <p className="fm-interval-item__label">Intervallo musicale</p>
            <span>{item.intervallo}</span>
            <p className="fm-interval-item__label">Corrente emotiva associata</p>
            <strong>{item.nome}</strong>
            {item.significato ? (
              <div className="fm-interval-item__meaning">
                <p className="fm-interval-item__label">Che cosa significa</p>
                <p>{item.significato}</p>
              </div>
            ) : null}
            {item.stati?.length ? (
              <div className="fm-interval-item__states">
                <p className="fm-interval-item__label">Stati d’animo associati</p>
                <ul>
                  {item.stati.map((stato) => <li key={stato}>{stato}</li>)}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

export default function SezioneMusica({ profilo = {} }) {
  const scheda = MUSICISTI_SCHEDE[profilo?.famiglia || '']
  if (!scheda) return null

  return (
    <>
      <section className="fm-section" aria-labelledby="fm-profile-title">
        <h2 id="fm-profile-title">Il suo modo di incontrare la Musica</h2>
        <div className="fm-narrative-block">
          <h3>Cosa caratterizza questa corrente</h3>
          <p>{scheda.profiloEmotivo}</p>
          <h3>Cosa cerca nella Musica</h3>
          <p>{scheda.cosaCerca}</p>
        </div>
        <h3 className="fm-subsection-title">Che cosa preferisce</h3>
        <DetailRows items={[
          { title: 'Timbri', text: scheda.linguaggioMusicale?.timbri },
          { title: 'Ritmo', text: scheda.linguaggioMusicale?.ritmo },
          { title: 'Melodia e armonia', text: scheda.linguaggioMusicale?.melodiaArmonia },
        ]} />
        {scheda.piaceriAscolto ? (
          <div className="fm-narrative-block fm-narrative-block--closing">
            <h3>Perché queste qualità musicali la attraggono</h3>
            <p>{scheda.piaceriAscolto}</p>
          </div>
        ) : null}
      </section>

      <Intervals data={scheda.intervalli} />

      <section className="fm-section" aria-labelledby="fm-practice-title">
        <h2 id="fm-practice-title">Quando ascolta e fa Musica</h2>
        {scheda.fareMusica ? (
          <>
            <h3 className="fm-subsection-title">Il rapporto con la pratica musicale</h3>
          <DetailRows items={[
            { title: 'Suonare', text: scheda.fareMusica.suonare },
            { title: 'Interpretare', text: scheda.fareMusica.interpretare },
            { title: 'Comporre', text: scheda.fareMusica.comporre },
          ]} />
          </>
        ) : null}
        <h3 className="fm-subsection-title">In sintesi</h3>
        <div className="fm-summary__grid">
          <div>
            <h3>Cosa valorizza</h3>
            <BulletList items={scheda.valorizza} />
          </div>
          <div>
            <h3>Attenzioni</h3>
            <BulletList items={scheda.difficolta} />
          </div>
        </div>
        {scheda.paroleChiave?.length ? (
          <div className="sezione-musica__keyword-block">
            <h3>Parole chiave</h3>
            <p className="sezione-musica__keywords">{scheda.paroleChiave.join(' • ')}</p>
          </div>
        ) : null}
      </section>
    </>
  )
}
