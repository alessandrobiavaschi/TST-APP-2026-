import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PORTATO_UI, GALASSIA_PORTATO_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import {
  buildPortatoInterpretation,
  buildPortatoViewData,
} from '../../utils/portatoPadViewData.js'

void motion

const MEANING_BY_KEY = Object.fromEntries(
  GALASSIA_PORTATO_UI.cards.map((card) => [card.id, card.meaning]),
)

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
  const [openVertexKey, setOpenVertexKey] = useState(null)
  const padRef = useRef(null)

  useEffect(() => {
    if (!openVertexKey) return undefined
    function handlePointerDown(event) {
      if (padRef.current && !padRef.current.contains(event.target)) {
        setOpenVertexKey(null)
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpenVertexKey(null)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openVertexKey])

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
          accentColor={accent}
          titleId="report-tst-portato-heading"
        />

        {viewData.hasData ? (
          <div className="report-tst-portato__layout">
            <div className="report-tst-portato__text">
              <p className="report-tst-portato__lead">{PORTATO_UI.lead}</p>

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

              {portato?.descrizione ? (
                <p className="report-tst-portato__narrative-text">{portato.descrizione}</p>
              ) : null}
            </div>

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
              <div className="report-tst-portato__pad" ref={padRef}>
                <div className="report-tst-portato__field" aria-hidden="true" />
                <svg
                  className="report-tst-portato__mesh"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <polygon points="8,8 92,8 50,92" />
                  <line x1="50" y1="36" x2="8" y2="8" />
                  <line x1="50" y1="36" x2="92" y2="8" />
                  <line x1="50" y1="36" x2="50" y2="92" />
                </svg>
                <span
                  className="report-tst-portato__puck"
                  aria-hidden="true"
                  style={{ '--puck-x': `${viewData.point.x}%`, '--puck-y': `${viewData.point.y}%` }}
                />
                {!reduceMotion && (
                  <>
                    <span
                      className="report-tst-portato__puck-ripple report-tst-portato__puck-ripple--1"
                      aria-hidden="true"
                      style={{ '--puck-x': `${viewData.point.x}%`, '--puck-y': `${viewData.point.y}%` }}
                    />
                    <span
                      className="report-tst-portato__puck-ripple report-tst-portato__puck-ripple--2"
                      aria-hidden="true"
                      style={{ '--puck-x': `${viewData.point.x}%`, '--puck-y': `${viewData.point.y}%` }}
                    />
                  </>
                )}
                {viewData.dimensions.map((dimension) => {
                  const isOpen = openVertexKey === dimension.key
                  const popoverId = `report-tst-portato-detail-${dimension.key}`
                  return (
                    <div
                      key={dimension.key}
                      className={`report-tst-portato__vertex-wrap report-tst-portato__vertex-wrap--${dimension.ui.className}`}
                    >
                      <button
                        type="button"
                        className={`report-tst-portato__vertex${isOpen ? ' report-tst-portato__vertex--open' : ''}`}
                        aria-expanded={isOpen}
                        aria-controls={popoverId}
                        onClick={() =>
                          setOpenVertexKey((current) => (current === dimension.key ? null : dimension.key))
                        }
                      >
                        <span className="report-tst-portato__vertex-label">{dimension.ui.label}</span>
                        <span className="report-tst-portato__vertex-percent">{dimension.percentage}%</span>
                      </button>
                      {isOpen ? (
                        <div id={popoverId} role="note" className="report-tst-portato__vertex-popover">
                          <p className="report-tst-portato__vertex-popover-stats">
                            <strong>{dimension.percentage}%</strong> · {formatPoints(dimension.value)}
                          </p>
                          <p className="report-tst-portato__vertex-popover-meaning">
                            {MEANING_BY_KEY[dimension.key]}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </motion.figure>
          </div>
        ) : (
          <p className="report-tst-portato__empty" role="status">
            I dati di sintonia, distonia e distanza non sono disponibili per questo ascolto.
          </p>
        )}
      </div>
    </section>
  )
}
