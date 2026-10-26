import React from 'react'
import ApprofondimentoSezioni from '../ApprofondimentoSezioni.jsx'
import SuoniDelTuoTest from '../SuoniDelTuoTest.jsx'

/**
 * Dati analitici: le macro risposte del test per musicisti e ricercatori.
 * Grafico delle cinque aree sonore con le risposte finali, poi i 72 ascolti.
 */
export default function DatiPerNerd({ approfondimento = {}, filtroMusicale = {}, rawRecord = {}, accentColor }) {
  return (
    <section id="fm-dati" className="fm-section fm-dati-nerd" aria-labelledby="fm-dati-title">
      <div className="fm-dati-nerd__head">
        <h2 id="fm-dati-title">Dati analitici del test</h2>
        <p className="fm-section-lead">
          La distribuzione dei tuoi punteggi nelle 5 aree del codice musicale
          (Timbro, Intervalli, Ritmo, Melodia, Accordi) e il registro dettagliato di ciascuno dei 72 ascolti del test con le risposte date.
        </p>
      </div>

      <ApprofondimentoSezioni
        sezioniData={approfondimento?.sezioniData}
        sezioniTest={null}
        filtroMusicale={filtroMusicale}
        correnteColore={accentColor}
        plainLanguage={false}
      />

      <div className="fm-dati-nerd__ascolti-wrap">
        <details className="fm-dati-nerd__ascolti">
          <summary className="fm-dati-nerd__summary">
            <span className="fm-dati-nerd__summary-main">
              <span className="fm-dati-nerd__summary-title">Registro dei 72 ascolti del test</span>
            </span>
            <span className="fm-dati-nerd__summary-hint">Espandi per consultare tutte le 72 tracce ▾</span>
          </summary>
          <div className="fm-dati-nerd__ascolti-content">
            <SuoniDelTuoTest rawRecord={rawRecord} accentColor={accentColor} />
          </div>
        </details>
      </div>
    </section>
  )
}
