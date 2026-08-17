import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PORTATO_UI, GALASSIA_PORTATO_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'

void motion

const DIMENSION_UI = {
  Simpatia: { label: PORTATO_UI.labels?.Simpatia || 'Sintonia', className: 'sintonia' },
  Antipatia: { label: PORTATO_UI.labels?.Antipatia || 'Distonia', className: 'distonia' },
  Indifferenza: { label: PORTATO_UI.labels?.Indifferenza || 'Distanza', className: 'distanza' },
}

const MEANING_BY_KEY = Object.fromEntries(
  GALASSIA_PORTATO_UI.cards.map((card) => [card.id, card.meaning]),
)

const TRIANGLE_VERTICES = {
  Simpatia: { x: 8, y: 8 },
  Antipatia: { x: 92, y: 8 },
  Indifferenza: { x: 50, y: 92 },
}

function toNonNegativeNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : 0
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function formatPoints(value) {
  return `${value} ${value === 1 ? 'punto' : 'punti'}`
}

function readContractShare(shares, key) {
  if (!shares || typeof shares !== 'object') return null
  const aliases = {
    Simpatia: ['Simpatia', 'simpatia', 'Sintonia', 'sintonia'],
    Antipatia: ['Antipatia', 'antipatia', 'Distonia', 'distonia'],
    Indifferenza: ['Indifferenza', 'indifferenza', 'Distanza', 'distanza'],
  }
  const match = aliases[key].find((alias) => shares[alias] != null)
  if (!match) return null
  const value = Number(shares[match])
  if (!Number.isFinite(value) || value < 0) return null
  return value > 1 ? value / 100 : value
}

function buildInterpretation(dimensions) {
  const sorted = [...dimensions].sort((a, b) => b.share - a.share)
  const spread = sorted[0].share - sorted[2].share
  if (spread <= 0.05) {
    return 'Durante questo ascolto sintonia, distonia e distanza si sono distribuite in modo equilibrato: il contenuto musicale ha generato risposte diverse, senza un unico orientamento netto.'
  }

  return `Durante questo ascolto ha prevalso la ${sorted[0].ui.label.toLowerCase()} con il contenuto musicale; la ${sorted[1].ui.label.toLowerCase()} è emersa in misura secondaria, mentre la ${sorted[2].ui.label.toLowerCase()} è rimasta più contenuta.`
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

  const viewData = useMemo(() => {
    const sourceDimensions = Array.isArray(portato?.dimensioni) ? portato.dimensioni : []
    const sourceByKey = new Map(sourceDimensions.map((dimension) => [dimension?.key, dimension]))
    const rawDimensions = Object.keys(DIMENSION_UI).map((key) => ({
      key,
      ui: DIMENSION_UI[key],
      value: toNonNegativeNumber(sourceByKey.get(key)?.valore ?? portato?.[key.toLowerCase()]),
    }))
    const total = rawDimensions.reduce((sum, dimension) => sum + dimension.value, 0)
    const contractShares = portato?.quoteNormalizzate || portato?.pad?.quote ||
      portato?.pad?.quotes || portato?.normalizedShares || portato?.shares
    const contractValues = rawDimensions.map((dimension) =>
      readContractShare(contractShares, dimension.key) ??
        (() => {
          const value = Number(sourceByKey.get(dimension.key)?.quotaNormalizzata)
          return Number.isFinite(value) && value >= 0 ? value : null
        })(),
    )
    const contractTotal = contractValues.every((value) => value != null)
      ? contractValues.reduce((sum, value) => sum + value, 0)
      : 0

    const dimensions = rawDimensions.map((dimension, index) => {
      const share = contractTotal > 0
        ? contractValues[index] / contractTotal
        : total > 0
          ? dimension.value / total
          : 0
      return {
        ...dimension,
        share,
        percentage: Math.round(share * 100),
      }
    })

    const contractPoint = portato?.pad?.punto || portato?.puntoTriangolo ||
      portato?.trianglePoint || portato?.point
    const pointX = Number(contractPoint?.x)
    const pointY = Number(contractPoint?.y)
    const hasContractPoint = Number.isFinite(pointX) && Number.isFinite(pointY)
    const normalizedContractPoint = hasContractPoint
      ? {
          x: pointX <= 1 ? 8 + clamp(pointX, 0, 1) * 84 : clamp(pointX, 8, 92),
          y: pointY <= 1 ? 8 + clamp(pointY, 0, 1) * 84 : clamp(pointY, 8, 92),
        }
      : null
    const barycentricPoint = total > 0 || contractTotal > 0
      ? dimensions.reduce(
          (point, dimension) => ({
            x: point.x + TRIANGLE_VERTICES[dimension.key].x * dimension.share,
            y: point.y + TRIANGLE_VERTICES[dimension.key].y * dimension.share,
          }),
          { x: 0, y: 0 },
        )
      : null

    return {
      dimensions,
      hasData: portato?.hasData === false ? false : total > 0 || contractTotal > 0,
      point: normalizedContractPoint || barycentricPoint,
    }
  }, [portato])

  const interpretation = portato?.sintesiInterpretativa || portato?.interpretation ||
    (viewData.hasData ? buildInterpretation(viewData.dimensions) : '')
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
                <button
                  type="button"
                  className={`report-tst-portato__puck${openVertexKey === 'puck' ? ' report-tst-portato__puck--open' : ''}`}
                  aria-expanded={openVertexKey === 'puck'}
                  aria-controls="report-tst-portato-puck-popover"
                  aria-label={PORTATO_UI.padCenterLabel || 'Compresenza'}
                  onClick={() =>
                    setOpenVertexKey((current) => (current === 'puck' ? null : 'puck'))
                  }
                  style={{ '--puck-x': `${viewData.point.x}%`, '--puck-y': `${viewData.point.y}%` }}
                />
                {openVertexKey === 'puck' ? (
                  <div
                    id="report-tst-portato-puck-popover"
                    role="note"
                    className="report-tst-portato__puck-popover"
                    style={{ '--puck-x': `${viewData.point.x}%`, '--puck-y': `${viewData.point.y}%` }}
                  >
                    <p className="report-tst-portato__vertex-popover-stats">
                      {PORTATO_UI.padCenterLabel || 'Compresenza'}
                    </p>
                    <p className="report-tst-portato__vertex-popover-meaning">
                      {PORTATO_UI.lead}
                    </p>
                  </div>
                ) : null}
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
                  <line x1="50" y1="64" x2="8" y2="8" />
                  <line x1="50" y1="64" x2="92" y2="8" />
                  <line x1="50" y1="64" x2="50" y2="92" />
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
