import React, { useState } from 'react'
import { COPPIE_ARMONIA, COPPIE_MELODIA, MODI_FAMIGLIA } from '../../../content/musicistiContenuti.js'
import { FAMIGLIE_MUSICA } from '../../../content/musicistiStanze.js'
import BottoneSuono from './BottoneSuono.jsx'
import SchedeScorrevoli from './SchedeScorrevoli.jsx'

const SCHEDE = [
  { id: 'melodia', titolo: 'Melodia', coppie: COPPIE_MELODIA },
  { id: 'armonia', titolo: 'Armonia', coppie: COPPIE_ARMONIA },
  { id: 'famiglie', titolo: 'Le famiglie' },
]

/** Stanza melodia e armonia: confronti A/B, una scheda alla volta. */
export default function StanzaMelodia({ famigliaPrevalente, fileInAscolto, onAscolta }) {
  const [scheda, setScheda] = useState('melodia')
  const attuale = SCHEDE.find((s) => s.id === scheda)

  return (
    <div className="stanza-generica">
      <header className="stanza-generica__apertura">
        <h1>Melodia e armonia</h1>
        <p>Ascolta le due versioni una dopo l’altra: la differenza tra le due è ciò che conta.</p>
      </header>
      <SchedeScorrevoli etichetta="Argomento" schede={SCHEDE} attiva={scheda} onCambia={setScheda} />

      {attuale.coppie ? (
        <div className="stanza-riquadri" role="tabpanel">
          {attuale.coppie.map((c) => (
            <section key={c.titolo} className="stanza-riquadro">
              <h2>{c.titolo}</h2>
              <div className="stanza-coppia__ab">
                <BottoneSuono file={c.a} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
                <BottoneSuono file={c.b} fileInAscolto={fileInAscolto} onAscolta={onAscolta} />
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="stanza-riquadri" role="tabpanel">
          {MODI_FAMIGLIA.map((m) => {
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
      )}
    </div>
  )
}
