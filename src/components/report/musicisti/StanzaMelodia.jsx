import React from 'react'
import { COPPIE_ARMONIA, COPPIE_MELODIA, MODI_FAMIGLIA } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'

function Coppie({ titolo, coppie, fileInAscolto, onAscolta }) {
  return (
    <section className="stanza-atlante">
      <h2>{titolo}</h2>
      <div className="stanza-coppie">
        {coppie.map((c) => (
          <div key={c.titolo} className="stanza-coppia">
            <h3>{c.titolo}</h3>
            <div className="stanza-coppia__ab">
              <BottoneSuono file={c.a} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
              <BottoneSuono file={c.b} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Stanza 5: confronti A/B tra le arpe e tra le coppie di accordi del test. */
export default function StanzaMelodia({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Melodia e armonia</h1>
        <p>Ascolta le due versioni una dopo l’altra: la differenza tra le due è ciò che conta.</p>
      </header>
      <Coppie titolo="Melodia" coppie={COPPIE_MELODIA} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
      <Coppie titolo="Armonia: andata e ritorno" coppie={COPPIE_ARMONIA} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
      <section className="stanza-atlante">
        <h2>Dove ogni famiglia può sentirsi a casa</h2>
        <ul className="stanza-generica__elenco">
          {MODI_FAMIGLIA.map((m) => (
            <li key={m.famiglia} className={m.famiglia === famigliaPrevalente ? 'is-tua' : ''}>
              <b>{FAMIGLIE_MUSICA[m.famiglia].nome}</b>: {m.testo}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
