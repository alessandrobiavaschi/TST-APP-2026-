import React from 'react'
import {
  MUSICISTI_APPROFONDIMENTO,
  MUSICISTI_SCHEDE,
} from '../../content/musicaDisposizione.js'
import '../../styles/sezione-musica.css'

function BulletList({ items }) {
  if (!items?.length) return null
  return (
    <ul className="sezione-musica__list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  )
}

function PracticeItem({ index, title, text }) {
  if (!text) return null
  return (
    <div className="fm-practice__item">
      <span className="fm-practice__index">{index}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Intervals({ data }) {
  if (!data?.correnti?.length) return null
  return (
    <section className="fm-section" aria-labelledby="fm-intervals-title">
      <h2 id="fm-intervals-title">Cosa gli evocano gli intervalli</h2>
      {data.intro ? <p className="fm-section-lead">{data.intro}</p> : null}
      <h3 className="fm-subsection-title">Il suo intervallo musicale di riferimento</h3>
      <div className="fm-interval-list">
        {data.correnti.map((item, index) => (
          <article className="fm-interval-item" key={`${item.intervallo}-${index}`}>
            <p className="fm-interval-item__name">{item.intervallo}</p>
            {item.nome ? <p className="fm-interval-item__subtitle">{item.nome}</p> : null}
            {item.significato ? (
              <p className="fm-interval-item__meaning">{item.significato}</p>
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
  const approfondimento = MUSICISTI_APPROFONDIMENTO[profilo?.famiglia || ''] || []
  if (!scheda) return null

  const narrativa = [scheda.profiloEmotivo, scheda.cosaCerca, scheda.piaceriAscolto, ...approfondimento]
    .filter(Boolean)
  const hasSummaryLists = Boolean(scheda.valorizza?.length || scheda.difficolta?.length)

  return (
    <>
      <section className="fm-section" aria-labelledby="fm-profile-title">
        <h2 id="fm-profile-title">Il modo di vivere la Musica</h2>
        <div className={`fm-narrative${scheda.pullQuote ? ' fm-narrative--with-quote' : ''}`}>
          <div className="fm-narrative__main">
            {narrativa.map((paragrafo) => <p key={paragrafo}>{paragrafo}</p>)}
          </div>
          {scheda.pullQuote ? (
            <aside className="fm-pullquote">
              <p className="fm-pullquote__title">{scheda.pullQuote.titolo}</p>
              <p className="fm-pullquote__text">{scheda.pullQuote.testo}</p>
            </aside>
          ) : null}
        </div>
      </section>

      {scheda.fareMusica ? (
        <section className="fm-section" aria-labelledby="fm-practice-title">
          <h2 id="fm-practice-title">Quando ascolta e fa Musica</h2>
          <p className="fm-section-lead">Il rapporto con l'ascolto e la pratica musicale</p>
          <div className="fm-practice">
            <PracticeItem index="01" title="Eseguire" text={scheda.fareMusica.suonare} />
            <PracticeItem index="02" title="Interpretare" text={scheda.fareMusica.interpretare} />
            <PracticeItem index="03" title="Comporre" text={scheda.fareMusica.comporre} />
            <PracticeItem index="04" title="Improvvisare" text={scheda.fareMusica.improvvisare} />
          </div>
        </section>
      ) : null}

      <section className="fm-section fm-section--summary" aria-labelledby="fm-summary-title">
        <h2 id="fm-summary-title">Attitudini e consigli pratici</h2>
        {hasSummaryLists ? (
          <div className="fm-summary__grid">
            {scheda.valorizza?.length ? (
              <div>
                <h3>Cosa valorizzare</h3>
                <BulletList items={scheda.valorizza} />
              </div>
            ) : null}
            {scheda.difficolta?.length ? (
              <div>
                <h3>Punti di attenzione</h3>
                <BulletList items={scheda.difficolta} />
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  )
}
