import React from 'react'
import { doveCompare, linkDefinizione } from './definizioneParola.js'

/**
 * Riquadro di una parola aperta: solo famiglia (e natura) di appartenenza
 * e il link alla definizione. Usato in Parole, nel Lessico e nella Galassia.
 */
export default function SchedaParola({ parola, onChiudi, compatta = false }) {
  const dove = doveCompare(parola)
  return (
    <div className={`scheda-parola${compatta ? ' scheda-parola--compatta' : ''}`} data-famiglia={dove[0]?.colorKey}>
      <div className="scheda-parola__testa">
        <span className="scheda-parola__parola">{parola}</span>
        {onChiudi ? (
          <button type="button" className="scheda-parola__chiudi" onClick={onChiudi} aria-label={`Chiudi ${parola}`}>
            ✕
          </button>
        ) : null}
      </div>
      {dove.length ? (
        <ul className="scheda-parola__dove">
          {dove.map((d) => (
            <li key={`${d.famiglia}-${d.natura}`} data-famiglia={d.colorKey}>
              Famiglia {d.famiglia} · {d.natura}
            </li>
          ))}
        </ul>
      ) : null}
      <a className="scheda-parola__link" href={linkDefinizione(parola)} target="_blank" rel="noopener noreferrer">
        Definizione su Treccani ↗
      </a>
    </div>
  )
}
