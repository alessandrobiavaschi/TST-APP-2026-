import React from 'react'
import ApprofondimentoSezioni from '../ApprofondimentoSezioni.jsx'
import SuoniDelTuoTest from '../SuoniDelTuoTest.jsx'

/**
 * Dati per nerd: le macro risposte del test in un'unica stanza.
 * Grafico delle cinque aree sonore con le risposte finali, poi i 72 ascolti.
 */
export default function DatiPerNerd({ approfondimento = {}, filtroMusicale = {}, rawRecord = {}, accentColor }) {
  return (
    <section id="fm-dati" className="fm-section fm-dati-nerd" aria-labelledby="fm-dati-title">
      <h2 id="fm-dati-title">Dati per nerd</h2>
      <p className="fm-section-lead">Le macro risposte del test, area per area. In fondo i 72 ascolti con la risposta data.</p>
      <ApprofondimentoSezioni
        sezioniData={approfondimento?.sezioniData}
        sezioniTest={null}
        filtroMusicale={filtroMusicale}
        correnteColore={accentColor}
        plainLanguage={false}
      />
      <details className="fm-dati-nerd__ascolti">
        <summary>I 72 ascolti del test</summary>
        <SuoniDelTuoTest rawRecord={rawRecord} accentColor={accentColor} />
      </details>
    </section>
  )
}
