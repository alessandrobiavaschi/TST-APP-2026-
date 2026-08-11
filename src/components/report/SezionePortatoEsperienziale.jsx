import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PORTATO_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import {
  buildPortatoInterpretation,
  buildPortatoViewData,
} from '../../utils/portatoPadViewData.js'

void motion

function formatPoints(value) {
  return `${value} ${value === 1 ? 'punto' : 'punti'}`
}

/**
 * Presenta i tre punteggi PE in un unico campo triangolare. Le chiavi dati
 * storiche restano invariate; Sintonia, Distonia e Distanza sono sole etichette UI.
 */
export default function SezionePortatoEsperienziale({
  portato,
  correnteColore = '#4ade80',
  step = '3',
}) {
  const reduceMotion = useReducedMotion()
  const accent = correnteColore || '#4ade80'

  const viewData = useMemo(
    () => buildPortatoViewData(portato, PORTATO_UI.labels),
    [portato],
  )

  const interpretation = portato?.sintesiInterpretativa || portato?.interpretation ||
    (viewData.hasData ? buildPortatoInterpretation(viewData.dimensions) : '')
  const chartSummary = viewData.dimensions
    .map((dimension) => `${dimension.ui.label}: ${formatPoints(dimension.value)}, ${dimension.percentage} per cento`)
    .join('; ')
  const sectionVariants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

  return (
    <section
      className="report-tst-portato report-tst-section-anchor"
      aria-labelledby="report-tst-portato-heading"
    >
      <div className="report-tst-portato__inner">
        <ReportPassageHeader
          step={step}
          eyebrow={PORTATO_UI.eyebrow}
          title={PORTATO_UI.title}
          titleVisuallyHidden
          lead={PORTATO_UI.lead}
          accentColor={accent}
          titleId="report-tst-portato-heading"
        />

        {viewData.hasData ? (
          <motion.p
            className="report-tst-portato__interpretation"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={sectionVariants}
            transition={{ duration: reduceMotion ? 0 : 0.4, ease: 'easeOut' }}
          >
            {interpretation}
          </motion.p>
        ) : (
          <p className="report-tst-portato__empty" role="status">
            I dati di sintonia, distonia e distanza non sono disponibili per questo ascolto.
          </p>
        )}

        {viewData.hasData ? (
          <>
            <motion.figure
              className="report-tst-portato__figure"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={sectionVariants}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut', delay: 0.05 }}
              aria-labelledby="report-tst-portato-map-title"
              aria-describedby="report-tst-portato-map-summary"
            >
              <figcaption id="report-tst-portato-map-title" className="sr-only">
                {PORTATO_UI.padAria || "Orientamento dell'ascolto tra sintonia, distonia e distanza"}
              </figcaption>
              <p id="report-tst-portato-map-summary" className="sr-only">{chartSummary}</p>
              <div className="report-tst-portato__pad" aria-hidden="true">
                <div className="report-tst-portato__field" />
                <svg className="report-tst-portato__mesh" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon points="8,8 92,8 50,92" />
                  <line x1="50" y1="36" x2="8" y2="8" />
                  <line x1="50" y1="36" x2="92" y2="8" />
                  <line x1="50" y1="36" x2="50" y2="92" />
                </svg>
                <span
                  className="report-tst-portato__puck"
                  style={{ '--puck-x': `${viewData.point.x}%`, '--puck-y': `${viewData.point.y}%` }}
                />
                {viewData.dimensions.map((dimension) => (
                  <span
                    key={dimension.key}
                    className={`report-tst-portato__vertex report-tst-portato__vertex--${dimension.ui.className}`}
                  >
                    {dimension.ui.label}
                  </span>
                ))}
              </div>
            </motion.figure>

            <ul className="report-tst-portato__results" aria-label="Risultati dell'orientamento all'ascolto">
              {viewData.dimensions.map((dimension) => (
                <li
                  key={dimension.key}
                  className={`report-tst-portato__result report-tst-portato__result--${dimension.ui.className}`}
                >
                  <span className="report-tst-portato__result-marker" aria-hidden="true" />
                  <span className="report-tst-portato__result-label">{dimension.ui.label}</span>
                  <span className="report-tst-portato__result-value">
                    {dimension.value} <span>{dimension.value === 1 ? 'punto' : 'punti'}</span>
                  </span>
                  <span className="report-tst-portato__result-percent">
                    {dimension.percentage}%
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {viewData.hasData && portato?.descrizione ? (
          <div className="report-tst-portato__narrative">
            <p className="report-tst-portato__narrative-text">{portato.descrizione}</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
