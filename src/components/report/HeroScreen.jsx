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
}) {
  void disposizione
  void correnti
  void portato
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
        <div className="report-tst-hero__inner report-tst-hero__identity flex w-full max-w-4xl flex-col items-center">
          {/* Metadata dell'ascoltatore */}
          {(userName || formattedTestDate) && (
            <motion.p {...fade(0.1, 12)} className="hero-screen__metadata">
              {userName ? <span>{userName}</span> : null}
              {userName && formattedTestDate ? <span aria-hidden="true"> · </span> : null}
              {formattedTestDate ? <span>Test del {formattedTestDate}</span> : null}
            </motion.p>
          )}

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

          {/* CTAs */}
          <motion.div {...fade(0.45, 8)} className="hero-screen__cta-container">
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
