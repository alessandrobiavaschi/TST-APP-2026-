import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FioreVisivo } from '../../pages/ResultsPage'

void motion

const RAPPORTI_CONFIG = [
  {
    key: 'natura',
    label: 'Natura di base',
    description:
      'Mostra la tua impronta emotiva di fondo, al di là delle situazioni. Evidenzia il registro che tendi ad abitare più spesso.',
    sectionsFormula: 'Timbro + Intervalli + Armonia',
    meaning:
      'È la sintesi strutturale della tua disposizione prevalente: come risuoni nel profondo, prima della pressione delle circostanze.',
  },
  {
    key: 'se',
    label: 'Rapporto con te stesso',
    description:
      'Indica come vivi il tuo mondo interno: riflessione, dialogo con te stesso e qualità del sentire personale.',
    sectionsFormula: 'Intervalli + Melodia',
    meaning:
      'Rende visibile il tuo dialogo interiore: come ti ascolti, come elabori tensioni e come traduci il sentire in auto-consapevolezza.',
  },
  {
    key: 'altro',
    label: 'Rapporto con l\'Altro',
    description:
      'Rappresenta come ti disponi emotivamente verso persone e ambiente. Evidenzia quali famiglie entrano più facilmente in relazione.',
    sectionsFormula: 'Timbro + Melodia',
    meaning:
      'Descrive il tuo modo di entrare in contatto con persone e contesti: apertura, distanza, attrazione o cautela nella relazione.',
  },
  {
    key: 'agire',
    label: 'Rapporto con l\'Agire',
    description:
      'Mostra come trasformi le emozioni in azione: iniziativa, ritmo decisionale e tendenza a muoverti, fermarti o osservare.',
    sectionsFormula: 'Ritmo + Melodia',
    meaning:
      'Mostra il passaggio dal sentire al fare: quanto la tua energia emotiva si converte in slancio vitale, scelta e movimento.',
  },
]

function formatPortatoLabel(portatoKey) {
  if (portatoKey === 'Simpatia') return 'Simpatia / Empatia'
  if (portatoKey === 'Antipatia') return 'Antipatia'
  if (portatoKey === 'Indifferenza') return 'Indifferenza / Nichilismo'
  return '—'
}

export default function RelationalTabs({ rapportiLevels, portatoEsperienziale }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = RAPPORTI_CONFIG[activeIndex]
  const levels = rapportiLevels?.[active.key] || {}
  const hasPortatoData = Boolean(portatoEsperienziale?.dominantKey)

  return (
    <section id="report-rapporti" className="report-quattro-rapporti report-xp-section" aria-labelledby="relational-tabs-heading">
      <header className="report-quattro-rapporti-header">
        <h2 id="relational-tabs-heading" className="report-quattro-rapporti-title">
          I quattro rapporti
        </h2>
        <div className="report-quattro-rapporti-title-line" aria-hidden />
        <p className="report-quattro-rapporti-intro">
          Lo stesso grafico si legge da quattro prospettive. Seleziona un tab per vedere dati e significato in modo mirato.
        </p>
        <p className="report-quattro-rapporti-intro">
          Lettura metodologica: ogni rapporto nasce dalla combinazione di sezioni specifiche del test (Timbro, Intervalli, Ritmo, Melodia, Armonia).
        </p>
      </header>

      <div
        className="report-quattro-rapporti-tabs"
        role="tablist"
        aria-label="Seleziona rapporto"
      >
        {RAPPORTI_CONFIG.map((r, i) => (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={activeIndex === i}
            aria-controls={`panel-${r.key}`}
            id={`tab-${r.key}`}
            className={`report-quattro-rapporti-tab ${activeIndex === i ? 'report-quattro-rapporti-tab--active' : ''}`}
            onClick={() => setActiveIndex(i)}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="report-quattro-rapporti-panel">
        <div
          role="tabpanel"
          id={`panel-${active.key}`}
          aria-labelledby={`tab-${active.key}`}
          className="report-quattro-rapporti-panel-body"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active.key}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="report-quattro-rapporti-panel-title">
                {active.label}
              </h3>
              <p className="report-quattro-rapporti-panel-desc">
                {active.description}
              </p>
              <p className="report-quattro-rapporti-panel-desc">
                <strong>Composizione del rapporto:</strong> {active.sectionsFormula}.
              </p>
              <p className="report-quattro-rapporti-panel-desc">
                <strong>Cosa indica:</strong> {active.meaning}
              </p>
              <div
                className="report-quattro-rapporti-chart"
                role="img"
                aria-label={`Grafico ${active.label}: livelli per le 5 famiglie.`}
                style={{ minHeight: 280, minWidth: 280, width: '100%' }}
              >
                <FioreVisivo
                  levels={levels}
                  chartHeight={280}
                  showLegend={false}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {hasPortatoData ? (
        <div className="report-quattro-rapporti-panel" style={{ marginTop: '1rem' }}>
          <div className="report-quattro-rapporti-panel-body">
            <h3 className="report-quattro-rapporti-panel-title">Portato esperienziale</h3>
            <p className="report-quattro-rapporti-panel-desc">
              Il portato esperienziale descrive <strong>come</strong> hai vissuto l&apos;ascolto nel test: in attrazione (simpatia), in rifiuto (antipatia) o in distacco (indifferenza).
            </p>
            <p className="report-quattro-rapporti-panel-desc">
              <strong>Prevalenza:</strong> {formatPortatoLabel(portatoEsperienziale.dominantKey)}.
            </p>
            <p className="report-quattro-rapporti-panel-desc">
              {portatoEsperienziale.description}
            </p>
            <p className="report-quattro-rapporti-panel-desc">
              <strong>Asse vitalità/depressione:</strong> {portatoEsperienziale.vitalityInterpretation}
            </p>
            <p className="report-quattro-rapporti-panel-desc">
              Punteggi — Simpatia: {portatoEsperienziale.totals.simpatia} | Antipatia: {portatoEsperienziale.totals.antipatia} | Indifferenza: {portatoEsperienziale.totals.indifferenza}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  )
}
