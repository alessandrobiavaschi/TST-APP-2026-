import React, { useState } from 'react'
import { SUONO_PER_FAMIGLIA } from '../../../content/musicaPerMusicisti.js'
import { MUSICISTI_IN_GRUPPO } from '../../../content/musicistiInGruppo.js'
import { MUSICISTI_SCHEDE } from '../../../content/musicaDisposizione.js'
import { FAMILY_THEME } from '../../../config/reportFamilyTheme.js'

const ORDINE_FAMIGLIE = ['Rosso', 'Blu', 'Verde', 'Giallo', 'Grigio']

function Voce({ titolo, testo, fonte }) {
  if (!titolo && !testo) return <span className="fm-scheda__vuoto">Non indicato nelle fonti</span>
  return (
    <>
      {titolo ? <strong className="fm-scheda__titolo">{titolo}</strong> : null}
      {testo ? <span className="fm-scheda__testo">{testo}</span> : null}
      {fonte ? <span className="fm-scheda__fonte">{fonte}</span> : null}
    </>
  )
}

const RIGHE = [
  {
    id: 'timbri',
    label: 'Timbri preferiti',
    shortLabel: 'Timbri',
    icon: '🎧',
    voce: (s) => ({ titolo: s?.timbri?.titolo }),
  },
  {
    id: 'strumenti',
    label: 'Strumenti e tessiture',
    shortLabel: 'Strumenti',
    icon: '🎸',
    voce: (s) => ({ testo: s?.timbri?.descrizione }),
  },
  {
    id: 'bpm',
    label: 'Tempo e andamento BPM',
    shortLabel: 'Tempo / BPM',
    icon: '⏱',
    voce: (s) => ({ titolo: s?.ritmoBpm?.titolo, testo: s?.ritmoBpm?.descrizione }),
  },
  {
    id: 'armonia',
    label: 'Armonie, scale e modi',
    shortLabel: 'Armonie',
    icon: '🎼',
    voce: (s) => ({ titolo: s?.armonieModi?.titolo, testo: s?.armonieModi?.descrizione }),
  },
  {
    id: 'musicista',
    label: 'Il musicista che sei',
    shortLabel: 'Ruolo ed espressione',
    icon: '👤',
    voce: (s) => ({ titolo: s?.ilMusicistaCheSei?.titolo, testo: s?.ilMusicistaCheSei?.descrizione }),
  },
  {
    id: 'gruppo',
    label: 'Come suona in gruppo',
    shortLabel: 'Interplay',
    icon: '👥',
    voce: (_s, fam) => {
      const g = MUSICISTI_IN_GRUPPO[fam]
      return g ? { testo: g.testo, fonte: `Approfondimento metodologico (p. ${g.pagine})` } : {}
    },
  },
]

/**
 * Scheda del musicista: timbri, strumenti, BPM, armonie, ruolo e
 * suonare in gruppo. Mostra la famiglia scelta come card dedicate o a confronto tra tutte e cinque.
 */
export default function SchedaMusicista({ famigliaAttiva, famigliaUtente = '' }) {
  const [confronta, setConfronta] = useState(false)
  const colonne = confronta ? ORDINE_FAMIGLIE : [famigliaAttiva]
  const nome = (fam) => MUSICISTI_SCHEDE[fam]?.label || fam

  return (
    <section id="fm-scheda" className="fm-section fm-scheda" aria-labelledby="fm-scheda-title">
      <div className="fm-scheda__head">
        <div>
          <p className="fm-kicker">Parametri compositivi & attitudini</p>
          <h2 id="fm-scheda-title">La scheda del musicista</h2>
        </div>
        <div className="fm-scheda__toggle" role="group" aria-label="Vista della scheda">
          <button
            type="button"
            aria-pressed={!confronta}
            className={!confronta ? 'is-active' : ''}
            onClick={() => setConfronta(false)}
          >
            Vista singola ({nome(famigliaAttiva)})
          </button>
          <button
            type="button"
            aria-pressed={confronta}
            className={confronta ? 'is-active' : ''}
            onClick={() => setConfronta(true)}
          >
            Confronta tutte le 5 famiglie
          </button>
        </div>
      </div>

      {!confronta ? (
        <div className="fm-scheda-cards-grid" aria-label={`Parametri musicali per la famiglia ${nome(famigliaAttiva)}`}>
          {RIGHE.map((riga) => {
            const v = riga.voce(SUONO_PER_FAMIGLIA[famigliaAttiva], famigliaAttiva)
            if (!v.titolo && !v.testo) return null
            return (
              <article key={riga.id} className="fm-scheda-card">
                <header className="fm-scheda-card__header">
                  <span className="fm-scheda-card__icon" aria-hidden="true">{riga.icon}</span>
                  <span className="fm-scheda-card__label">{riga.label}</span>
                </header>
                {v.titolo ? <h3 className="fm-scheda-card__title">{v.titolo}</h3> : null}
                {v.testo ? <p className="fm-scheda-card__text">{v.testo}</p> : null}
                {v.fonte ? <span className="fm-scheda-card__source">{v.fonte}</span> : null}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="fm-scheda__scroll fm-scheda__scroll--confronto">
          <table className="fm-scheda__table">
            <thead>
              <tr>
                <th scope="col"><span className="visually-hidden">Voce</span></th>
                {colonne.map((fam) => (
                  <th
                    key={fam}
                    scope="col"
                    className={fam === famigliaAttiva ? 'is-active' : ''}
                    style={{ '--col-color': FAMILY_THEME[fam]?.dot }}
                  >
                    <span className="fm-scheda__col-dot" style={{ backgroundColor: FAMILY_THEME[fam]?.dot }} aria-hidden="true" />
                    {nome(fam)}
                    {fam === famigliaUtente ? <span className="fm-scheda__tua"> · la tua</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RIGHE.map((riga) => (
                <tr key={riga.id}>
                  <th scope="row">
                    <span className="fm-scheda__row-icon" aria-hidden="true">{riga.icon}</span>
                    <span>{riga.shortLabel || riga.label}</span>
                  </th>
                  {colonne.map((fam) => (
                    <td key={fam} className={fam === famigliaAttiva ? 'is-active' : ''}>
                      <Voce {...riga.voce(SUONO_PER_FAMIGLIA[fam], fam)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
