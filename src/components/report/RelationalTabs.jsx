import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FioreVisivo } from '../../pages/ResultsPage'

const RAPPORTI_CONFIG = [
  {
    key: 'natura',
    label: 'Natura di base',
    description:
      'Mostra la tua impronta emotiva di fondo, al di là delle situazioni. Evidenzia il registro che tendi ad abitare più spesso.',
  },
  {
    key: 'se',
    label: 'Rapporto con te stesso',
    description:
      'Indica come vivi il tuo mondo interno: riflessione, dialogo con te stesso e qualità del sentire personale.',
  },
  {
    key: 'altro',
    label: 'Rapporto con l\'Altro',
    description:
      'Rappresenta come ti disponi emotivamente verso persone e ambiente. Evidenzia quali famiglie entrano più facilmente in relazione.',
  },
  {
    key: 'agire',
    label: 'Rapporto con l\'Agire',
    description:
      'Mostra come trasformi le emozioni in azione: iniziativa, ritmo decisionale e tendenza a muoverti, fermarti o osservare.',
  },
]

export default function RelationalTabs({ rapportiLevels }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = RAPPORTI_CONFIG[activeIndex]
  const levels = rapportiLevels?.[active.key] || {}

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
    </section>
  )
}
