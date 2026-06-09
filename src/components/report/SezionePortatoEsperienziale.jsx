import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PORTATO_UI } from './reportUiCopy.js'

void motion

const PORTATO_ACCENT = {
  Simpatia: '#4ade80',
  Antipatia: '#f87171',
  Indifferenza: '#94a3b8',
}

function formatValore(n) {
  const v = Number(n)
  if (!Number.isFinite(v) || v <= 0) return '—'
  return String(v)
}

/**
 * SezionePortatoEsperienziale — Blocco C (portato esperienziale) nel Report TST.
 *
 * Presenta Simpatia, Antipatia e Indifferenza con punteggi, barre proporzionali,
 * prevalenza e testi da content_report (nessun nuovo scoring).
 *
 * Props:
 *   portato: oggetto da buildReportData.portato
 *   correnteColore: hex accento UI (corrente dominante)
 */
export default function SezionePortatoEsperienziale({
  portato,
  correnteColore = '#4ade80',
}) {
  const reduceMotion = useReducedMotion()
  const dimensioni = useMemo(
    () => (Array.isArray(portato?.dimensioni) ? portato.dimensioni : []),
    [portato],
  )
  const hasData = Boolean(portato?.hasData)
  const prevalente = portato?.prevalente || ''
  const accent = correnteColore || '#4ade80'

  const maxValore = useMemo(() => {
    if (!dimensioni.length) return 0
    return Math.max(...dimensioni.map((d) => Number(d.valore) || 0), 0)
  }, [dimensioni])

  const sectionVariants = reduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

  return (
    <section
      id="report-tst-portato"
      className="report-tst-portato report-tst-section-anchor"
      aria-labelledby="report-tst-portato-heading"
    >
      <div className="report-tst-portato__inner">
        <motion.header
          className="report-tst-portato__header"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={sectionVariants}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <p className="report-tst-portato__eyebrow" style={{ color: accent }}>
            {PORTATO_UI.eyebrow}
          </p>
          <h2 id="report-tst-portato-heading" className="report-tst-portato__title">
            {PORTATO_UI.title}
          </h2>
          <p className="report-tst-portato__lead">
            {PORTATO_UI.lead}
          </p>
        </motion.header>

        {prevalente && hasData ? (
          <motion.p
            className="report-tst-portato__prevalente-pill"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={sectionVariants}
            transition={{ duration: 0.4, ease: 'easeOut', delay: 0.05 }}
          >
            <span className="report-tst-portato__prevalente-label">{PORTATO_UI.prevalenteLabel}</span>
            <span className="report-tst-portato__prevalente-value">
              {portato.prevalenteLabel || prevalente}
            </span>
          </motion.p>
        ) : null}

        <motion.div
          className="report-tst-portato__grid"
          role="list"
          aria-label={PORTATO_UI.gridAria}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={sectionVariants}
          transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
        >
          {dimensioni.map((dim, i) => {
            const isPrevalente = dim.key === prevalente && hasData
            const barColor = PORTATO_ACCENT[dim.key] || accent
            const valore = Number(dim.valore) || 0
            const barWidth =
              maxValore > 0 ? Math.round((valore / maxValore) * 100) : 0
            return (
              <article
                key={dim.key}
                role="listitem"
                className={`report-tst-portato__card${isPrevalente ? ' report-tst-portato__card--prevalente' : ''}`}
                style={
                  isPrevalente
                    ? {
                        borderColor: `${barColor}66`,
                        boxShadow: `0 0 24px ${barColor}22`,
                      }
                    : undefined
                }
              >
                <div className="report-tst-portato__card-top">
                  <p className="report-tst-portato__dim-label">{dim.label}</p>
                  {isPrevalente ? (
                    <span className="report-tst-portato__badge">Prevalente</span>
                  ) : null}
                </div>
                <p
                  className="report-tst-portato__valore"
                  aria-label={`${dim.label}: ${hasData && valore > 0 ? valore : 'non disponibile'}`}
                >
                  {formatValore(valore)}
                </p>
                {hasData && valore > 0 ? (
                  <p className="report-tst-portato__percent" aria-hidden="true">
                    {dim.percentuale}%
                  </p>
                ) : (
                  <p className="report-tst-portato__percent report-tst-portato__percent--ghost" aria-hidden="true">
                    —
                  </p>
                )}
                <div
                  className="report-tst-portato__bar-track"
                  role="presentation"
                  aria-hidden="true"
                >
                  <motion.div
                    className="report-tst-portato__bar-fill"
                    style={{ backgroundColor: barColor }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${barWidth}%` }}
                    viewport={{ once: true }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.6, ease: 'easeOut', delay: i * 0.06 }
                    }
                  />
                </div>
                <p className="report-tst-portato__def">{dim.definizioneBreve}</p>
              </article>
            )
          })}
        </motion.div>

        {portato?.descrizione ? (
          <motion.div
            className="report-tst-portato__narrative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={sectionVariants}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.12 }}
          >
            <p className="report-tst-portato__narrative-text">{portato.descrizione}</p>
            {portato.vitalita ? (
              <p className="report-tst-portato__vitalita">
                <span className="report-tst-portato__vitalita-label">Asse vitalità</span>
                {portato.vitalita}
              </p>
            ) : null}
          </motion.div>
        ) : (
          <p className="report-tst-portato__empty">
            {hasData
              ? 'Restituzione testuale non disponibile per questo profilo.'
              : 'Punteggi portato esperienziale non disponibili per questo test.'}
          </p>
        )}
      </div>
    </section>
  )
}
