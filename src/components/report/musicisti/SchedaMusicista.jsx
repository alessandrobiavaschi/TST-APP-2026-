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

// Righe della scheda: ogni riga legge un campo per famiglia.
const RIGHE = [
  { id: 'timbri', label: 'Timbri', voce: (s) => ({ titolo: s?.timbri?.titolo }) },
  { id: 'strumenti', label: 'Strumenti', voce: (s) => ({ testo: s?.timbri?.descrizione }) },
  { id: 'bpm', label: 'Tempo e BPM', voce: (s) => ({ titolo: s?.ritmoBpm?.titolo, testo: s?.ritmoBpm?.descrizione }) },
  { id: 'armonia', label: 'Armonie e modi', voce: (s) => ({ titolo: s?.armonieModi?.titolo, testo: s?.armonieModi?.descrizione }) },
  { id: 'musicista', label: 'Il musicista che sei', voce: (s) => ({ titolo: s?.ilMusicistaCheSei?.titolo, testo: s?.ilMusicistaCheSei?.descrizione }) },
  {
    id: 'gruppo',
    label: 'Come suona in gruppo',
    voce: (_s, fam) => {
      const g = MUSICISTI_IN_GRUPPO[fam]
      return g ? { testo: g.testo, fonte: `Il Pianeta della Musica, p. ${g.pagine}` } : {}
    },
  },
]

/**
 * Scheda del musicista: una tabella con timbri, strumenti, BPM, armonie, ruolo e
 * suonare in gruppo. Mostra la famiglia scelta o il confronto tra tutte e cinque.
 */
export default function SchedaMusicista({ famigliaAttiva, famigliaUtente = '' }) {
  const [confronta, setConfronta] = useState(false)
  const colonne = confronta ? ORDINE_FAMIGLIE : [famigliaAttiva]
  const nome = (fam) => MUSICISTI_SCHEDE[fam]?.label || fam

  return (
    <section id="fm-scheda" className="fm-section fm-scheda" aria-labelledby="fm-scheda-title">
      <div className="fm-scheda__head">
        <h2 id="fm-scheda-title">La scheda del musicista</h2>
        <div className="fm-scheda__toggle" role="group" aria-label="Vista della scheda">
          <button type="button" aria-pressed={!confronta} className={!confronta ? 'is-active' : ''} onClick={() => setConfronta(false)}>
            {nome(famigliaAttiva)}
          </button>
          <button type="button" aria-pressed={confronta} className={confronta ? 'is-active' : ''} onClick={() => setConfronta(true)}>
            Confronta tutte
          </button>
        </div>
      </div>

      <div className={`fm-scheda__scroll${confronta ? ' fm-scheda__scroll--confronto' : ''}`}>
        <table className="fm-scheda__table">
          {confronta ? (
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
                    {nome(fam)}
                    {fam === famigliaUtente ? <span className="fm-scheda__tua"> · la tua</span> : null}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {RIGHE.map((riga) => (
              <tr key={riga.id}>
                <th scope="row">{riga.label}</th>
                {colonne.map((fam) => (
                  <td key={fam} className={confronta && fam === famigliaAttiva ? 'is-active' : ''}>
                    <Voce {...riga.voce(SUONO_PER_FAMIGLIA[fam], fam)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
