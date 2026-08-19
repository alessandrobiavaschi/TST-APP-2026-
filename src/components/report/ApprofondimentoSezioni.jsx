import React from 'react'
import OperatorSection from './OperatorSection'

/**
 * Sezione "Approfondimento" del report TST: grafico a barre per sezione
 * (Timbro … Armonia) + accordion narrativo da content_report.sezioni_test.
 *
 * Props:
 *   - sezioniData: array per Recharts (nome + Blu/Rosso/Verde/Giallo/Grigio)
 *   - sezioniTest: oggetto narrativo per AreeMusicaliSection
 *   - filtroMusicale: risposte finali su aree A-E / qualità / difficoltà
 */
export default function ApprofondimentoSezioni({
  sezioniData,
  sezioniTest,
  filtroMusicale,
  correnteColore = '#4ade80',
  step = '6',
  plainLanguage = false,
}) {
  if (!sezioniData?.length && !sezioniTest && !filtroMusicale?.hasData) {
    return null
  }

  return (
    <div className="report-tst-approfondimento">
      <OperatorSection
        sezioniData={sezioniData}
        sezioniTest={sezioniTest}
        filtroMusicale={filtroMusicale}
        correnteColore={correnteColore}
        step={step}
        plainLanguage={plainLanguage}
      />
    </div>
  )
}
