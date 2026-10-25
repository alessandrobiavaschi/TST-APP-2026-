import React from 'react'
import { COPPIE_ARMONIA, COPPIE_MELODIA, MODI_FAMIGLIA } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'
import Finestra, { Finestre } from './Finestra.jsx'

const SCHEDE = [
  { id: 'melodia', titolo: 'Melodia', coppie: COPPIE_MELODIA },
  { id: 'armonia', titolo: 'Armonia', coppie: COPPIE_ARMONIA },
  { id: 'famiglie', titolo: 'Le famiglie' },
]

/** Stanza melodia e armonia: confronti A/B in finestre chiuse, una aperta alla volta. */
export default function StanzaMelodia({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Melodia e armonia</h1>
        <p>Ascolta le due versioni una dopo l’altra: la differenza tra le due è ciò che conta.</p>
      </header>
      <Finestre>
        {SCHEDE.map((scheda) => (
          <Finestra
            key={scheda.id}
            titolo={scheda.titolo}
            nota={scheda.coppie ? `${scheda.coppie.length} confronti` : 'Il modo di ogni famiglia'}
            gruppo="melodia"
          >
            <div className="stanza-riquadri">
              {scheda.coppie
                ? scheda.coppie.map((c) => (
                    <section key={c.titolo} className="stanza-riquadro">
                      <h2>{c.titolo}</h2>
                      <div className="stanza-coppia__ab">
                        <BottoneSuono file={c.a} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
                        <BottoneSuono file={c.b} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
                      </div>
                    </section>
                  ))
                : MODI_FAMIGLIA.map((m) => {
                    const fam = FAMIGLIE_MUSICA[m.famiglia]
                    return (
                      <section
                        key={m.famiglia}
                        className={`stanza-riquadro${m.famiglia === famigliaPrevalente ? ' is-tua' : ''}`}
                        data-famiglia={fam.colorKey}
                      >
                        <h2>{fam.nome}</h2>
                        <p>{m.testo}</p>
                      </section>
                    )
                  })}
            </div>
          </Finestra>
        ))}
      </Finestre>
    </div>
  )
}
