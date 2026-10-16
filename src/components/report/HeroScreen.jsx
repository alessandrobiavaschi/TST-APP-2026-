import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HERO_UI } from './reportUiCopy.js'
import { getFlowerStillByColor } from '../../colorAssets.js'
import {
  computeColorTotals,
  formatDateShort,
  getDominantColorInfo,
} from '../../utils/reportRecordUtils.js'
import { FAMILY_NAME_BY_KEY, FAMILY_THEME } from '../../config/reportFamilyTheme.js'
import { buildPortatoViewData } from '../../utils/portatoPadViewData.js'

// Il setup ESLint del progetto non riconosce l'uso di `motion.X` nel JSX come
// riferimento alla variabile (stessa convenzione di HeroSummary.jsx).
void motion

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function parseHex(hex) {
  if (typeof hex !== 'string') return null
  let value = hex.trim().replace('#', '')
  if (value.length === 3) value = value.split('').map((char) => char + char).join('')
  if (value.length !== 6) return null

  const color = {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
  return Object.values(color).some(Number.isNaN) ? null : color
}

function toHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => clamp255(value).toString(16).padStart(2, '0')).join('')}`
}

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

function mixToward(hex, target, amount) {
  const color = parseHex(hex)
  if (!color) return hex
  return toHex({
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount,
  })
}

const lighten = (hex, amount) => mixToward(hex, WHITE, amount)
const darken = (hex, amount) => mixToward(hex, BLACK, amount)

function toTitleCase(value) {
  return String(value || '').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function rgba(hex, alpha) {
  const color = parseHex(hex)
  if (!color) return hex
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`
}

const NOISE_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(%23n)'/></svg>",
  )

/**
 * <HeroScreen /> — schermata d'apertura (100vh) del report TST.
 *
 * Carta d'identità del risultato: nome/data, famiglia, natura e frase chiave.
 * Supporta due varianti di presentazione del Portato Esperienziale:
 * - 'bussola' (default): Aura d'ascolto centrata e badge satinato.
 * - 'dittico': Struttura a due colonne asimmetriche (Radice & Finestra d'Ascolto).
 */
export default function HeroScreen({
  familyName = '',
  heroResult = null,
  disposizione = '',
  userName = '',
  fraseChiave = '',
  correnteColore = '#16a34a',
  correnteColoreChiara,
  correnteColoreMedia,
  correnti = [],
  rawRecord = {},
  portato = {},
  onReadReport,
  onDownload,
  onNavigateArchive,
  testDate,
  heroVariant = 'bussola',
}) {
  void disposizione
  void correnti
  const reduceMotion = useReducedMotion()

  const colorKey = useMemo(() => {
    const totals = computeColorTotals(rawRecord)
    const { dominantKey } = getDominantColorInfo(totals)
    return dominantKey
  }, [rawRecord])

  const bgImage = useMemo(() => {
    return getFlowerStillByColor(colorKey)
  }, [colorKey])

  const edgeColor = useMemo(() => {
    return darken(correnteColore, 0.75)
  }, [correnteColore])

  const colors = useMemo(() => {
    const media = correnteColoreMedia || darken(correnteColore, 0.32)
    const chiara = correnteColoreChiara || lighten(correnteColore, 0.16)
    const edgeRgb = parseHex(edgeColor) || BLACK
    const mid = mixToward(media, edgeRgb, 0.62)
    return { media, chiara, mid }
  }, [correnteColore, correnteColoreChiara, correnteColoreMedia, edgeColor])

  const rootStyle = {
    '--corrente': correnteColore,
    '--corrente-chiara': colors.chiara,
    '--corrente-media': colors.media,
    '--hero-edge': edgeColor,
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 'clamp(2rem, 5vh, 4rem) 1.5rem',
    backgroundColor: edgeColor,
  }

  const fade = (delay, y = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        }

  const familyThemeObj = FAMILY_THEME[FAMILY_NAME_BY_KEY[colorKey]] || {}
  const familyText = toTitleCase(
    familyName || familyThemeObj?.family || 'Flemmatica',
  )
  const formattedTestDate = formatDateShort(testDate)
  const finalFraseChiave = fraseChiave || familyThemeObj?.tagline || ''

  // Calcolo dinamico del Portato Esperienziale per l'Head
  const portatoView = useMemo(() => buildPortatoViewData(portato), [portato])

  const { dimSimpatia, dimAntipatia, dimIndifferenza, posturaInfo } = useMemo(() => {
    const simpatia =
      portatoView.dimensions.find((d) => d.key === 'Simpatia') || { percentage: 0, value: 0, share: 0 }
    const antipatia =
      portatoView.dimensions.find((d) => d.key === 'Antipatia') || { percentage: 0, value: 0, share: 0 }
    const indifferenza =
      portatoView.dimensions.find((d) => d.key === 'Indifferenza') || { percentage: 0, value: 0, share: 0 }

    const s = simpatia.share || 0
    const a = antipatia.share || 0
    const i = indifferenza.share || 0

    let postura
    if (s >= a && s >= i) {
      postura = {
        label: 'Sintonia ed Empatia',
        sub: 'Risonanza aperta e accogliente verso gli stimoli sonori',
      }
    } else if (a >= s && a >= i) {
      postura = {
        label: 'Attenzione Critica e Distonia',
        sub: 'Risonanza selettiva e vigile verso gli stimoli sonori',
      }
    } else {
      postura = {
        label: 'Distacco e Neutralità',
        sub: 'Ascolto riflessivo e sospensione del coinvolgimento emotivo',
      }
    }

    return {
      dimSimpatia: simpatia,
      dimAntipatia: antipatia,
      dimIndifferenza: indifferenza,
      posturaInfo: postura,
    }
  }, [portatoView])

  // Pareggio esatto o quasi pareggio
  const isExactTie = heroResult?.band === 'exact_tie' && Boolean(heroResult?.secondary)
  const secondaryFamilyText = heroResult?.secondary ? toTitleCase(heroResult.secondary.famiglia) : ''

  const gradientStyle = {
    backgroundImage: `
      radial-gradient(circle at 50% 46%, ${rgba(colors.media, 0.08)} 0%, ${rgba(colors.mid, 0.22)} 42%, ${rgba(edgeColor, 0.48)} 84%),
      linear-gradient(180deg, #020817 0%, rgba(2, 8, 23, 0.55) 5%, rgba(2, 8, 23, 0) 15%, ${rgba(edgeColor, 0.14)} 22%, ${rgba(edgeColor, 0.02)} 48%, ${rgba(edgeColor, 0.3)} 100%)
    `,
  }

  return (
    <section
      style={rootStyle}
      aria-label={HERO_UI.ariaSection}
      className="hero-screen relative w-full min-h-screen flex flex-col justify-center items-center"
    >
      <div className="hero-screen__backdrop" aria-hidden="true">
        {bgImage && (
          <div
            className="hero-screen__nature-bg"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}
        <div
          className="hero-screen__gradient"
          style={{
            ...gradientStyle,
            backgroundColor: bgImage ? 'transparent' : edgeColor,
          }}
        />
        {bgImage && <div className="hero-screen__legibility-overlay" />}
        <div
          className="hero-screen__noise"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />
      </div>

      <div className="report-tst-hero__content hero-screen__content flex w-full flex-col items-center justify-center px-6 py-10 z-10">
        <div
          className={`report-tst-hero__inner report-tst-hero__identity flex w-full max-w-4xl flex-col items-center ${
            heroVariant === 'dittico' ? 'hero-screen__inner--dittico' : ''
          }`}
        >
          {/* Metadata dell'ascoltatore */}
          {(userName || formattedTestDate) && (
            <motion.p {...fade(0.1, 12)} className="hero-screen__metadata">
              {userName ? <span>{userName}</span> : null}
              {userName && formattedTestDate ? <span aria-hidden="true"> · </span> : null}
              {formattedTestDate ? <span>Test del {formattedTestDate}</span> : null}
            </motion.p>
          )}

          {/* LAYOUT VARIANTE 2: DITTICO ASIMMETRICO */}
          {heroVariant === 'dittico' ? (
            <div className="hero-screen__dittico-grid">
              <div className="hero-screen__dittico-left">
                <motion.h1 {...fade(0.2, 20)} className="hero-screen__sintesi-title">
                  <span className="hero-screen__sintesi-bridge">
                    {isExactTie
                      ? 'Il tuo profilo emerge con pari intensità tra'
                      : 'La tua famiglia emotiva prevalente è'}
                  </span>
                  <strong className="hero-screen__sintesi-family">
                    {isExactTie ? `${familyText} e ${secondaryFamilyText}` : familyText}
                  </strong>
                </motion.h1>

                {finalFraseChiave && (
                  <motion.p {...fade(0.28, 14)} className="hero-screen__frase-chiave">
                    «{finalFraseChiave}»
                  </motion.p>
                )}

                <motion.div {...fade(0.42, 8)} className="hero-screen__cta-container">
                  <button
                    type="button"
                    className="hero-screen__cta-primary hero-screen-btn-primary"
                    onClick={onReadReport}
                  >
                    Leggi il tuo report
                  </button>
                  <button
                    type="button"
                    className="hero-screen__cta-secondary hero-screen-btn-secondary"
                    onClick={onDownload}
                  >
                    Scarica i dati
                  </button>
                  <button
                    type="button"
                    className="hero-screen__cta-tertiary"
                    onClick={onNavigateArchive}
                  >
                    Torna ai risultati
                  </button>
                </motion.div>
              </div>

              {/* Colonna destra: Finestra d'ascolto Portato (Acoustic Glass Constellation) */}
              {portatoView.hasData && (
                <motion.div {...fade(0.32, 20)} className="hero-screen__dittico-right">
                  <div className="hero-screen__dittico-card">
                    <span className="hero-screen__dittico-card-kicker">La tua esperienza d'ascolto</span>
                    <h3 className="hero-screen__dittico-card-title">{posturaInfo.label}</h3>

                    <div className="hero-screen__dittico-mini-pad">
                      <svg viewBox="-4 -4 108 108" className="hero-screen__mini-pad-svg" aria-hidden="true">
                        <defs>
                          <radialGradient id="tstConstellationGlow" cx="50%" cy="36%" r="58%">
                            <stop offset="0%" stopColor="var(--corrente, #38bdf8)" stopOpacity="0.18" />
                            <stop offset="50%" stopColor="var(--corrente, #38bdf8)" stopOpacity="0.04" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" stopOpacity="0" />
                          </radialGradient>
                          <radialGradient id="tstPuckAura" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="var(--corrente-chiara, #38bdf8)" stopOpacity="0.9" />
                            <stop offset="40%" stopColor="var(--corrente, #38bdf8)" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                          </radialGradient>
                        </defs>

                        {/* Constellation perimeter & aura */}
                        <polygon
                          points="8,8 92,8 50,92"
                          fill="url(#tstConstellationGlow)"
                          stroke="rgba(255, 255, 255, 0.14)"
                          strokeWidth="1"
                        />

                        {/* Concentric acoustic rings centered at barycenter (50, 36) */}
                        <circle
                          cx="50"
                          cy="36"
                          r="16"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.08)"
                          strokeWidth="0.75"
                          strokeDasharray="2 3"
                        />
                        <circle
                          cx="50"
                          cy="36"
                          r="30"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="0.75"
                          strokeDasharray="3 4"
                        />

                        {/* Radial axes from center to vertices */}
                        <line x1="50" y1="36" x2="8" y2="8" stroke="rgba(74, 222, 128, 0.25)" strokeWidth="0.8" strokeDasharray="2 2" />
                        <line x1="50" y1="36" x2="92" y2="8" stroke="rgba(248, 113, 113, 0.25)" strokeWidth="0.8" strokeDasharray="2 2" />
                        <line x1="50" y1="36" x2="50" y2="92" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="0.8" strokeDasharray="2 2" />

                        {/* Centroid subtle anchor */}
                        <circle cx="50" cy="36" r="1.5" fill="rgba(255, 255, 255, 0.3)" />

                        {/* Constellation anchor stars */}
                        {/* Simpatia / Sintonia */}
                        <circle cx="8" cy="8" r="4.5" fill="rgba(74, 222, 128, 0.15)" />
                        <circle cx="8" cy="8" r="2.2" fill="#4ade80" />
                        <text x="8" y="2.5" fill="#4ade80" fontSize="4.4" fontWeight="600" textAnchor="start" fontFamily="var(--font-body, 'Manrope', sans-serif)">
                          SINTONIA
                        </text>

                        {/* Antipatia / Distonia */}
                        <circle cx="92" cy="8" r="4.5" fill="rgba(248, 113, 113, 0.15)" />
                        <circle cx="92" cy="8" r="2.2" fill="#f87171" />
                        <text x="92" y="2.5" fill="#f87171" fontSize="4.4" fontWeight="600" textAnchor="end" fontFamily="var(--font-body, 'Manrope', sans-serif)">
                          DISTONIA
                        </text>

                        {/* Indifferenza / Distanza */}
                        <circle cx="50" cy="92" r="4.5" fill="rgba(148, 163, 184, 0.15)" />
                        <circle cx="50" cy="92" r="2.2" fill="#94a3b8" />
                        <text x="50" y="99" fill="#94a3b8" fontSize="4.4" fontWeight="600" textAnchor="middle" fontFamily="var(--font-body, 'Manrope', sans-serif)">
                          DISTANZA
                        </text>

                        {/* Resonance point (puck) */}
                        {portatoView.point && (
                          <g className="hero-screen__mini-pad-puck">
                            {/* Projection ray from barycenter to puck */}
                            <line
                              x1="50"
                              y1="36"
                              x2={portatoView.point.x}
                              y2={portatoView.point.y}
                              stroke="rgba(255, 255, 255, 0.45)"
                              strokeWidth="0.8"
                              strokeDasharray="1.5 2"
                            />
                            {/* Soft glowing aura */}
                            <circle
                              cx={portatoView.point.x}
                              cy={portatoView.point.y}
                              r="10"
                              fill="url(#tstPuckAura)"
                            />
                            {/* Pulsing ring */}
                            <circle
                              cx={portatoView.point.x}
                              cy={portatoView.point.y}
                              r="5"
                              fill="none"
                              stroke="var(--corrente-chiara, #38bdf8)"
                              strokeWidth="0.75"
                            >
                              <animate attributeName="r" values="4;8;4" dur="2.8s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.85;0.12;0.85" dur="2.8s" repeatCount="indefinite" />
                            </circle>
                            {/* Center bead */}
                            <circle
                              cx={portatoView.point.x}
                              cy={portatoView.point.y}
                              r="3.2"
                              fill="#ffffff"
                              stroke="var(--corrente, #38bdf8)"
                              strokeWidth="1.2"
                            />
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Minimal organic metric indicators */}
                    <div className="hero-screen__portato-fluid-metrics">
                      <div className="hero-screen__portato-fluid-col">
                        <div className="hero-screen__portato-fluid-head">
                          <span className="hero-screen__portato-fluid-left">
                            <span className="hero-screen__portato-fluid-dot" style={{ backgroundColor: '#4ade80', boxShadow: '0 0 6px rgba(74, 222, 128, 0.6)' }} />
                            <span className="hero-screen__portato-fluid-label">Sintonia</span>
                          </span>
                          <span className="hero-screen__portato-fluid-pct">{dimSimpatia.percentage}%</span>
                        </div>
                        <div className="hero-screen__portato-fluid-bar">
                          <div
                            className="hero-screen__portato-fluid-fill"
                            style={{
                              width: `${Math.max(4, dimSimpatia.percentage)}%`,
                              backgroundColor: '#4ade80',
                              boxShadow: '0 0 8px rgba(74, 222, 128, 0.35)',
                            }}
                          />
                        </div>
                      </div>

                      <div className="hero-screen__portato-fluid-col">
                        <div className="hero-screen__portato-fluid-head">
                          <span className="hero-screen__portato-fluid-left">
                            <span className="hero-screen__portato-fluid-dot" style={{ backgroundColor: '#f87171', boxShadow: '0 0 6px rgba(248, 113, 113, 0.6)' }} />
                            <span className="hero-screen__portato-fluid-label">Distonia</span>
                          </span>
                          <span className="hero-screen__portato-fluid-pct">{dimAntipatia.percentage}%</span>
                        </div>
                        <div className="hero-screen__portato-fluid-bar">
                          <div
                            className="hero-screen__portato-fluid-fill"
                            style={{
                              width: `${Math.max(4, dimAntipatia.percentage)}%`,
                              backgroundColor: '#f87171',
                              boxShadow: '0 0 8px rgba(248, 113, 113, 0.35)',
                            }}
                          />
                        </div>
                      </div>

                      <div className="hero-screen__portato-fluid-col">
                        <div className="hero-screen__portato-fluid-head">
                          <span className="hero-screen__portato-fluid-left">
                            <span className="hero-screen__portato-fluid-dot" style={{ backgroundColor: '#94a3b8', boxShadow: '0 0 6px rgba(148, 163, 184, 0.6)' }} />
                            <span className="hero-screen__portato-fluid-label">Distanza</span>
                          </span>
                          <span className="hero-screen__portato-fluid-pct">{dimIndifferenza.percentage}%</span>
                        </div>
                        <div className="hero-screen__portato-fluid-bar">
                          <div
                            className="hero-screen__portato-fluid-fill"
                            style={{
                              width: `${Math.max(4, dimIndifferenza.percentage)}%`,
                              backgroundColor: '#94a3b8',
                              boxShadow: '0 0 8px rgba(148, 163, 184, 0.35)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* LAYOUT VARIANTE 1 (DEFAULT): BUSSOLA DELLA RISONANZA CENTRATA */
            <>
              <motion.h1
                {...fade(0.2, 24)}
                className="hero-screen__sintesi-title"
                style={{
                  maxWidth: 'min(1040px, 92vw)',
                  color: '#ffffff',
                  margin: 0,
                  textAlign: 'center',
                  textShadow: '0 2px 24px rgba(0, 0, 0, 0.75)',
                }}
              >
                <span className="hero-screen__sintesi-bridge">
                  {isExactTie
                    ? 'Il tuo profilo emerge con pari intensità tra'
                    : 'La tua famiglia emotiva prevalente è'}
                </span>
                <strong className="hero-screen__sintesi-family">
                  {isExactTie ? `${familyText} e ${secondaryFamilyText}` : familyText}
                </strong>
              </motion.h1>

              {/* Frase Chiave */}
              {finalFraseChiave && (
                <motion.p {...fade(0.3, 16)} className="hero-screen__frase-chiave">
                  «{finalFraseChiave}»
                </motion.p>
              )}

              {/* Risonanza d'Ascolto (Portato) - Minimal, fluida e senza rettangoli */}
              {portatoView.hasData && (
                <motion.div {...fade(0.35, 12)} className="hero-screen__portato-line">
                  <div
                    className="hero-screen__portato-pill"
                    title={`Bilancio d'ascolto: ${dimSimpatia.percentage}% Sintonia, ${dimAntipatia.percentage}% Distonia, ${dimIndifferenza.percentage}% Distanza`}
                  >
                    <span className="hero-screen__portato-metric" title="Sintonia: apertura e risonanza verso gli stimoli sonori">
                      <span className="hero-screen__portato-dot" style={{ backgroundColor: '#4ade80', boxShadow: '0 0 8px rgba(74, 222, 128, 0.7)' }} />
                      <span className="hero-screen__portato-name">Sintonia</span>
                      <strong className="hero-screen__portato-val">{dimSimpatia.percentage}%</strong>
                    </span>

                    <span className="hero-screen__portato-sep" aria-hidden="true">·</span>

                    <span className="hero-screen__portato-metric" title="Distonia: reattività o rifiuto verso gli stimoli sonori">
                      <span className="hero-screen__portato-dot" style={{ backgroundColor: '#f87171', boxShadow: '0 0 8px rgba(248, 113, 113, 0.7)' }} />
                      <span className="hero-screen__portato-name">Distonia</span>
                      <strong className="hero-screen__portato-val">{dimAntipatia.percentage}%</strong>
                    </span>

                    <span className="hero-screen__portato-sep" aria-hidden="true">·</span>

                    <span className="hero-screen__portato-metric" title="Distanza: neutralità o distacco verso gli stimoli sonori">
                      <span className="hero-screen__portato-dot" style={{ backgroundColor: '#94a3b8', boxShadow: '0 0 8px rgba(148, 163, 184, 0.7)' }} />
                      <span className="hero-screen__portato-name">Distanza</span>
                      <strong className="hero-screen__portato-val">{dimIndifferenza.percentage}%</strong>
                    </span>
                  </div>
                </motion.div>
              )}

              {/* CTAs */}
              <motion.div {...fade(0.48, 8)} className="hero-screen__cta-container">
                <button
                  type="button"
                  className="hero-screen__cta-primary hero-screen-btn-primary"
                  onClick={onReadReport}
                >
                  Leggi il tuo report
                </button>
                <button
                  type="button"
                  className="hero-screen__cta-secondary hero-screen-btn-secondary"
                  onClick={onDownload}
                >
                  Scarica i dati
                </button>
                <button
                  type="button"
                  className="hero-screen__cta-tertiary"
                  onClick={onNavigateArchive}
                >
                  Torna ai risultati
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Stili Scoped per l'Head */}
      <style>{`
        .hero-screen__metadata {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: clamp(0.78rem, 1.1vw, 0.88rem);
          color: rgba(248, 250, 252, 0.72);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.75rem;
          text-align: center;
        }

        .hero-screen__frase-chiave {
          font-family: var(--font-display, 'Newsreader', serif);
          font-style: italic;
          font-size: clamp(1rem, 1.6vw, 1.25rem);
          color: rgba(248, 250, 252, 0.82);
          max-width: 680px;
          text-align: center;
          margin: 0.8rem 0 1.2rem;
          line-height: 1.45;
          text-shadow: 0 2px 16px rgba(0, 0, 0, 0.6);
        }

        .hero-screen__portato-line {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0.2rem 0 1.5rem;
        }

        .hero-screen__portato-pill {
          display: inline-flex;
          align-items: center;
          gap: clamp(0.6rem, 1.4vw, 1.1rem);
          padding: 0.38rem 1.15rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.28);
          transition: all 0.25s ease;
        }

        .hero-screen__portato-pill:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.24);
          transform: translateY(-1px);
        }

        .hero-screen__portato-metric {
          display: inline-flex;
          align-items: center;
          gap: 0.42rem;
          font-family: var(--font-body, 'Manrope', sans-serif);
          font-size: clamp(0.8rem, 1.05vw, 0.9rem);
          color: rgba(248, 250, 252, 0.9);
          cursor: default;
        }

        .hero-screen__portato-name {
          color: rgba(248, 250, 252, 0.78);
          font-weight: 500;
        }

        .hero-screen__portato-val {
          color: #ffffff;
          font-weight: 700;
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-size: 0.85rem;
        }

        .hero-screen__portato-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        .hero-screen__portato-sep {
          color: rgba(255, 255, 255, 0.25);
          font-size: 0.95rem;
          user-select: none;
        }

        /* ── Dittico styles ── */
        .hero-screen__inner--dittico {
          max-width: 1040px !important;
        }

        .hero-screen__dittico-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: clamp(1.8rem, 3.5vw, 3.2rem);
          align-items: center;
          width: 100%;
        }

        .hero-screen__dittico-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .hero-screen__dittico-left .hero-screen__sintesi-title {
          text-align: left !important;
        }

        .hero-screen__dittico-left .hero-screen__frase-chiave {
          text-align: left;
          margin-left: 0;
        }

        .hero-screen__dittico-left .hero-screen__cta-container {
          justify-content: flex-start;
          margin-top: 1.5rem;
        }

        /* ── Acoustic Glass Floating Panel ── */
        .hero-screen__dittico-card {
          position: relative;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(13, 17, 26, 0.40) 100%);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: clamp(1.4rem, 2.2vw, 1.85rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.16),
            0 24px 50px -12px rgba(0, 0, 0, 0.55),
            0 0 40px -10px color-mix(in srgb, var(--corrente, #38bdf8) 24%, transparent);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          overflow: hidden;
          width: 100%;
          max-width: 380px;
        }

        .hero-screen__dittico-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 20%;
          right: 20%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
          pointer-events: none;
        }

        .hero-screen__dittico-card:hover {
          transform: translateY(-2px);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.22),
            0 28px 56px -12px rgba(0, 0, 0, 0.6),
            0 0 50px -8px color-mix(in srgb, var(--corrente, #38bdf8) 32%, transparent);
        }

        .hero-screen__dittico-card-kicker {
          font-family: var(--font-body, 'Manrope', sans-serif);
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: color-mix(in srgb, var(--corrente-chiara, #38bdf8) 85%, #ffffff);
          margin-bottom: 0.35rem;
        }

        .hero-screen__dittico-card-title {
          font-family: var(--font-display, 'Newsreader', serif);
          font-size: clamp(1.2rem, 1.8vw, 1.5rem);
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 0.75rem;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .hero-screen__dittico-card-sub {
          font-family: var(--font-body, 'Manrope', sans-serif);
          font-size: clamp(0.78rem, 1vw, 0.85rem);
          color: rgba(248, 250, 252, 0.7);
          margin: 0 0 1rem;
          line-height: 1.4;
          max-width: 320px;
        }

        .hero-screen__dittico-mini-pad {
          width: 100%;
          max-width: 210px;
          height: 160px;
          margin: 0.2rem 0 1.25rem;
        }

        .hero-screen__mini-pad-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .hero-screen__portato-fluid-metrics {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .hero-screen__portato-fluid-col {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .hero-screen__portato-fluid-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
        }

        .hero-screen__portato-fluid-left {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .hero-screen__portato-fluid-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .hero-screen__portato-fluid-label {
          font-family: var(--font-body, 'Manrope', sans-serif);
          font-weight: 500;
          color: rgba(248, 250, 252, 0.78);
        }

        .hero-screen__portato-fluid-pct {
          font-family: var(--font-mono, 'JetBrains Mono', monospace);
          font-weight: 700;
          color: #ffffff;
          font-size: 0.85rem;
        }

        .hero-screen__portato-fluid-bar {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          overflow: hidden;
        }

        .hero-screen__portato-fluid-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 860px) {
          .hero-screen__dittico-grid {
            grid-template-columns: 1fr;
            gap: 1.8rem;
          }
          .hero-screen__dittico-left {
            align-items: center;
            text-align: center;
          }
          .hero-screen__dittico-left .hero-screen__sintesi-title {
            text-align: center !important;
          }
          .hero-screen__dittico-left .hero-screen__frase-chiave {
            text-align: center;
          }
          .hero-screen__dittico-left .hero-screen__cta-container {
            justify-content: center;
          }
          .hero-screen__dittico-card {
            margin: 0 auto;
          }
        }

        .hero-screen__cta-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: var(--space-sm, 14px);
          margin-top: clamp(1rem, 2vh, 1.8rem);
        }

        .hero-screen__sintesi-title {
          font-family: var(--font-body);
          font-weight: 450;
          line-height: 1.08;
          letter-spacing: 0;
          text-wrap: balance;
        }

        .hero-screen__sintesi-bridge {
          display: block;
          font-size: clamp(1.05rem, 1.6vw, 1.65rem);
          color: color-mix(in srgb, var(--corrente-chiara, #fde68a) 92%, #ffffff);
          font-weight: 420;
          margin-bottom: 0.1em;
        }

        .hero-screen__sintesi-family {
          display: block;
          margin-top: 0.18em;
          font-size: clamp(2.6rem, 6.1vw, 6.8rem);
          color: #ffffff;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .hero-screen__sintesi-family {
            font-size: clamp(2.15rem, 10vw, 4.2rem);
          }
        }

        .hero-screen-btn-primary {
          color: #ffffff;
          text-shadow: none;
        }
        .hero-screen-btn-primary:hover {
          filter: brightness(1.08);
          box-shadow: 0 6px 22px rgba(0, 0, 0, 0.42);
        }
        .hero-screen-btn-primary:focus-visible {
          outline: 2px solid #ffffff;
          outline-offset: 3px;
        }
        .hero-screen-btn-secondary {
          color: rgba(255, 255, 255, 0.92);
          border-color: rgba(255, 255, 255, 0.45);
        }
        .hero-screen-btn-secondary:hover {
          border-color: rgba(255, 255, 255, 0.95);
          color: #ffffff;
        }
        .hero-screen-btn-secondary:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.85);
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-screen-btn-primary,
          .hero-screen-btn-secondary { transition: none; }
        }
      `}</style>
    </section>
  )
}
