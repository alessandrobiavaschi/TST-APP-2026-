import React from 'react'
import { MUSICISTI_SCHEDE } from '../../../content/musicaDisposizione.js'
import { FAMILY_THEME } from '../../../config/reportFamilyTheme.js'

const ORDINE_FAMIGLIE = ['Rosso', 'Blu', 'Verde', 'Giallo', 'Grigio']

const PRATICHE = [
  { key: 'suonare', titolo: 'Eseguire', icon: '🎹' },
  { key: 'interpretare', titolo: 'Interpretare', icon: '🎭' },
  { key: 'comporre', titolo: 'Comporre', icon: '🎼' },
  { key: 'improvvisare', titolo: 'Improvvisare', icon: '✨' },
]

/**
 * La famiglia nella Musica: un paragrafo musicale sulla famiglia, la scheda
 * eseguire / interpretare / comporre / improvvisare, cosa valorizza e aree di attenzione.
 * La famiglia letta (attiva) è condivisa con la scheda del musicista: si parte dalla prevalente del test.
 */
export default function FamigliaMusicale({ famigliaUtente = '', attiva, onChange }) {
  const prima = MUSICISTI_SCHEDE[famigliaUtente] ? famigliaUtente : ORDINE_FAMIGLIE[0]
  const famiglie = [prima, ...ORDINE_FAMIGLIE.filter((f) => f !== prima)]
  const scheda = MUSICISTI_SCHEDE[attiva]
  const colore = FAMILY_THEME[attiva]?.dot
  const pratiche = PRATICHE.filter((p) => scheda?.fareMusica?.[p.key])

  return (
    <section
      id="fm-famiglia"
      className="fm-section fm-famiglia-musicale"
      aria-labelledby="fm-famiglia-title"
      style={colore ? { '--music-accent': colore } : undefined}
    >
      <div className="fm-famiglia-musicale__header">
        <p className="fm-kicker">Dimensioni espressive · La tua natura al suonare</p>
        <h2 id="fm-famiglia-title">La famiglia {scheda?.label} nella Musica</h2>
      </div>

      <div className="fm-famiglia-musicale__switch" role="group" aria-label="Leggi un'altra famiglia">
        {famiglie.map((fam) => (
          <button
            key={fam}
            type="button"
            aria-pressed={fam === attiva}
            className={`fm-famiglia-musicale__chip${fam === attiva ? ' is-active' : ''}`}
            style={{ '--chip-color': FAMILY_THEME[fam]?.dot }}
            onClick={() => onChange?.(fam)}
          >
            <span className="fm-famiglia-musicale__dot" aria-hidden="true" />
            {MUSICISTI_SCHEDE[fam]?.label}
            {fam === famigliaUtente ? <span className="fm-famiglia-musicale__tua">la tua</span> : null}
          </button>
        ))}
      </div>

      {scheda?.cosaCerca ? (
        <div className="fm-famiglia-musicale__intro-box">
          <p className="fm-famiglia-musicale__testo">{scheda.cosaCerca}</p>
        </div>
      ) : null}

      {scheda?.pullQuote ? (
        <aside className="fm-pullquote fm-pullquote--featured">
          <p className="fm-pullquote__title">{scheda.pullQuote.titolo}</p>
          <p className="fm-pullquote__text">{scheda.pullQuote.testo}</p>
        </aside>
      ) : null}

      {pratiche.length ? (
        <div className="fm-practices-block">
          <div className="fm-practices-block__header">
            <h3 className="fm-practices-block__title">I modi di fare Musica</h3>
            <p className="fm-practices-block__subtitle">
              Come questa propensione interiore orienta l'approccio allo strumento, al testo e alla creatività:
            </p>
          </div>

          <div className="fm-practice-grid" aria-label="Eseguire, interpretare, comporre, improvvisare">
            {pratiche.map((p, i) => (
              <div key={p.key} className="fm-practice-card">
                <div className="fm-practice-card__top">
                  <span className="fm-practice-card__icon" aria-hidden="true">{p.icon}</span>
                  <span className="fm-practice-card__index">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <h4 className="fm-practice-card__title">{p.titolo}</h4>
                <p className="fm-practice-card__text">{scheda.fareMusica[p.key]}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {(scheda?.valorizza?.length || scheda?.difficolta?.length) ? (
        <div className="fm-attitudes-grid">
          {scheda?.valorizza?.length ? (
            <div className="fm-attitude-card fm-attitude-card--strength">
              <div className="fm-attitude-card__head">
                <span className="fm-attitude-card__icon" aria-hidden="true">✓</span>
                <h4>Cosa valorizza naturalmente</h4>
              </div>
              <ul className="fm-attitude-card__list">
                {scheda.valorizza.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {scheda?.difficolta?.length ? (
            <div className="fm-attitude-card fm-attitude-card--alert">
              <div className="fm-attitude-card__head">
                <span className="fm-attitude-card__icon" aria-hidden="true">✦</span>
                <h4>Aree di attenzione ed espressività</h4>
              </div>
              <ul className="fm-attitude-card__list">
                {scheda.difficolta.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}

      {scheda?.paroleChiave?.length ? (
        <div className="fm-keywords-bar">
          <span className="fm-keywords-bar__label">Tratti sonori chiave:</span>
          <div className="fm-keywords-bar__list">
            {scheda.paroleChiave.map((kw) => (
              <span key={kw} className="fm-keyword-pill">#{kw}</span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
