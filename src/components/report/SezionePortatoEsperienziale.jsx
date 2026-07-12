import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { PORTATO_UI } from './reportUiCopy.js'
import ReportPassageHeader from './ReportPassageHeader.jsx'

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
  step = '3',
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
        <ReportPassageHeader
          step={step}
          eyebrow={PORTATO_UI.eyebrow}
          title={PORTATO_UI.title}
          lead={PORTATO_UI.lead}
          accentColor={accent}
          titleId="report-tst-portato-heading"
        />

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
              >
                <div className="report-tst-portato__card-top">
                  <p className="report-tst-portato__dim-label">{dim.label}</p>
                  {isPrevalente ? (
                    <span className="report-tst-portato__badge" title={PORTATO_UI.prevalenteLabel}>
                      {PORTATO_UI.badgePrevalente}
                    </span>
                  ) : null}
                </div>
                <p
                  className="report-tst-portato__valore"
                  aria-label={`${dim.label}: ${hasData && valore > 0 ? valore : 'non disponibile'}`}
                >
                  {formatValore(valore)}
                </p>
                {hasData && valore > 0 ? (
                  <p className="report-tst-portato__percent">
                    <span className="report-tst-portato__percent-label">{PORTATO_UI.quotaLabel}</span>
                    <span aria-hidden="true">{dim.percentuale}%</span>
                    <span className="sr-only">
                      {PORTATO_UI.quotaLabel}: {dim.percentuale} per cento
                    </span>
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
