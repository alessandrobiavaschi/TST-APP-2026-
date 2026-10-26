import React from 'react'
import { MUSICISTI_SCHEDE } from '../../../content/musicaDisposizione.js'
import { FAMILY_THEME } from '../../../config/reportFamilyTheme.js'

const ORDINE_FAMIGLIE = ['Rosso', 'Blu', 'Verde', 'Giallo', 'Grigio']

/**
 * La famiglia nella Musica:
 * Presentazione editoriale e narrativa del rapporto tra temperamento e fare musica,
 * organizzata in prosa fluida e priva di schematismi artificiali o box ridondanti.
 */
export default function FamigliaMusicale({ famigliaUtente = '', attiva, onChange }) {
  const prima = MUSICISTI_SCHEDE[famigliaUtente] ? famigliaUtente : ORDINE_FAMIGLIE[0]
  const famiglie = [prima, ...ORDINE_FAMIGLIE.filter((f) => f !== prima)]
  const scheda = MUSICISTI_SCHEDE[attiva]
  const colore = FAMILY_THEME[attiva]?.dot

  const fareMusica = scheda?.fareMusica || {}
  const haFareMusica = Boolean(
    fareMusica.suonare || fareMusica.interpretare || fareMusica.comporre || fareMusica.improvvisare
  )

  return (
    <section
      id="fm-famiglia"
      className="fm-section fm-famiglia-musicale"
      aria-labelledby="fm-famiglia-title"
      style={colore ? { '--music-accent': colore } : undefined}
    >
      <div className="fm-famiglia-musicale__header">
        <h2 id="fm-famiglia-title">La famiglia {scheda?.label} nella Musica</h2>
      </div>

      <div className="fm-famiglia-musicale__switch" role="group" aria-label="Seleziona la famiglia da esplorare">
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

      <article className="fm-famiglia-musicale__article">
        {scheda?.cosaCerca ? (
          <p className="fm-article__lead">{scheda.cosaCerca}</p>
        ) : null}

        {scheda?.piaceriAscolto ? (
          <p className="fm-article__p">{scheda.piaceriAscolto}</p>
        ) : null}

        {scheda?.profiloEmotivo && scheda.profiloEmotivo !== scheda.cosaCerca ? (
          <p className="fm-article__p">{scheda.profiloEmotivo}</p>
        ) : null}

        {haFareMusica ? (
          <div className="fm-article__practices">
            <h3 className="fm-article__subheading">L'espressione e il fare musica</h3>
            <p className="fm-article__p">
              {fareMusica.suonare && <span>{fareMusica.suonare} </span>}
              {fareMusica.interpretare && <span>{fareMusica.interpretare} </span>}
              {fareMusica.comporre && <span>{fareMusica.comporre} </span>}
              {fareMusica.improvvisare && <span>{fareMusica.improvvisare}</span>}
            </p>
          </div>
        ) : null}

        {(scheda?.valorizza?.length || scheda?.difficolta?.length) ? (
          <div className="fm-article__insights">
            {scheda?.valorizza?.length ? (
              <div className="fm-article__insight-col">
                <h4 className="fm-article__insight-title">Cosa valorizza naturalmente</h4>
                <ul className="fm-article__insight-list">
                  {scheda.valorizza.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {scheda?.difficolta?.length ? (
              <div className="fm-article__insight-col">
                <h4 className="fm-article__insight-title">Aree di attenzione ed espressività</h4>
                <ul className="fm-article__insight-list">
                  {scheda.difficolta.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </article>
    </section>
  )
}
