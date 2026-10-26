import React, { useState } from 'react'
import { MUSICISTI_SCHEDE } from '../../../content/musicaDisposizione.js'
import { FAMILY_THEME } from '../../../config/reportFamilyTheme.js'

const ORDINE_FAMIGLIE = ['Rosso', 'Blu', 'Verde', 'Giallo', 'Grigio']

const PRATICHE = [
  { key: 'suonare', titolo: 'Eseguire' },
  { key: 'interpretare', titolo: 'Interpretare' },
  { key: 'comporre', titolo: 'Comporre' },
  { key: 'improvvisare', titolo: 'Improvvisare' },
]

/**
 * La famiglia nella Musica: un paragrafo musicale sulla famiglia e la scheda
 * eseguire / interpretare / comporre / improvvisare. Si apre sulla famiglia
 * prevalente del test e permette di leggere le altre.
 */
export default function FamigliaMusicale({ famigliaUtente = '' }) {
  const iniziale = MUSICISTI_SCHEDE[famigliaUtente] ? famigliaUtente : ORDINE_FAMIGLIE[0]
  const [attiva, setAttiva] = useState(iniziale)
  const famiglie = [iniziale, ...ORDINE_FAMIGLIE.filter((f) => f !== iniziale)]
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
      <h2 id="fm-famiglia-title">La famiglia {scheda?.label} nella Musica</h2>

      <div className="fm-famiglia-musicale__switch" role="group" aria-label="Leggi un'altra famiglia">
        {famiglie.map((fam) => (
          <button
            key={fam}
            type="button"
            aria-pressed={fam === attiva}
            className={`fm-famiglia-musicale__chip${fam === attiva ? ' is-active' : ''}`}
            style={{ '--chip-color': FAMILY_THEME[fam]?.dot }}
            onClick={() => setAttiva(fam)}
          >
            <span className="fm-famiglia-musicale__dot" aria-hidden="true" />
            {MUSICISTI_SCHEDE[fam]?.label}
            {fam === famigliaUtente ? <span className="fm-famiglia-musicale__tua">la tua</span> : null}
          </button>
        ))}
      </div>

      {scheda?.cosaCerca ? <p className="fm-famiglia-musicale__testo">{scheda.cosaCerca}</p> : null}

      {pratiche.length ? (
        <div className="fm-practice" aria-label="Eseguire, interpretare, comporre, improvvisare">
          {pratiche.map((p, i) => (
            <div key={p.key} className="fm-practice__item">
              <span className="fm-practice__index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{p.titolo}</h3>
              <p>{scheda.fareMusica[p.key]}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
