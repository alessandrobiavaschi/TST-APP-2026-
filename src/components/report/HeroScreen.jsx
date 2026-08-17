import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HERO_UI } from './reportUiCopy.js'
import { getFlowerStillByColor } from '../../colorAssets.js'
import { computeColorTotals, getDominantColorInfo } from '../../utils/reportRecordUtils.js'
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
 * Schermata iniziale in stile "home da videogioco" (Super Mario Bros Wii style):
 * - 100vh fullscreen
 * - Testo/Hero identitario
 * - 2 CTA chiare: "LEGGI IL TUO REPORT" (apre il report a stanze) e "NUOVO TEST" (naviga a /nuovo-test)
 */
export default function HeroScreen({
  familyName = '',
  naturaName = 'NATURA CONTEMPLATIVA',
  _disposizione = 'CONTEMPLATIVA',
  _userName = '',
  correnteColore = '#16a34a',
  correnteColoreChiara,
  correnteColoreMedia,
  _correnti = [],
  rawRecord = {},
  _portato = {},
  onOpenGlossary,
  onReadReport,
  onNewTest,
}) {
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
    const chiara = correnteColoreChiara || lighten(correnteColore, 0.35)
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

  const naturaText = toTitleCase(String(naturaName || '').replace(/^NATURA\s+/i, ''))
  const familyText = toTitleCase(
    familyName || FAMILY_THEME[FAMILY_NAME_BY_KEY[colorKey]]?.family || 'Flemmatica',
  )

  const gradientStyle = {
    backgroundImage: `
      radial-gradient(circle at 50% 46%, ${rgba(colors.media, 0.12)} 0%, ${rgba(colors.mid, 0.42)} 42%, ${rgba(edgeColor, 0.82)} 84%),
      linear-gradient(180deg, ${rgba(edgeColor, 0.42)} 0%, ${rgba(edgeColor, 0.08)} 48%, ${rgba(edgeColor, 0.56)} 100%)
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
        <div
          className="hero-screen__noise"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />
      </div>

      <div
        className="report-tst-hero__content hero-screen__content flex w-full flex-col items-center justify-center px-6 py-10 z-10"
      >
        <div className="report-tst-hero__inner report-tst-hero__identity flex w-full max-w-4xl flex-col items-center">
          <motion.p
            {...fade(0.1, 12)}
            className="hero-screen__restituzione-label"
          >
            Restituzioni del Test TST
          </motion.p>
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
              La tua famiglia emotiva prevalente è
            </span>
            <strong className="hero-screen__sintesi-family">{familyText}</strong>
            <span className="hero-screen__sintesi-bridge">
              <button
                type="button"
                className="hero-screen__glossary-trigger-inline"
                onClick={() => onOpenGlossary?.('corrente-emotiva')}
              >
                Natura
              </button>{' '}
              (caratteristica emotiva): {naturaText}
            </span>
          </motion.h1>
          {/* Dual CTAs: LEGGI IL TUO REPORT & NUOVO TEST */}
          <motion.div {...fade(0.45, 8)} className="hero-screen__cta-container flex flex-wrap gap-5 items-center justify-center mt-8">
            <button
              type="button"
              className="hero-screen__cta-primary"
              onClick={onReadReport}
            >
              LEGGI IL TUO REPORT
            </button>
            <button
              type="button"
              className="hero-screen__cta-secondary"
              onClick={onNewTest}
            >
              NUOVO TEST
            </button>
          </motion.div>
        </div>
      </div>


      {/* Stili hover (scoped via classi dedicate). Usa la CSS custom property
          --corrente per la box-shadow del bottone primario. */}
      <style>{`
        .hero-screen__flower-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          pointer-events: none;
          opacity: 0.72;
          transform: scale(1.12);
        }
        .hero-screen__flower-container .fiore-mood {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .hero-screen__sintesi-title {
          font-family: var(--font-body);
          font-weight: 450;
          line-height: 1.08;
          letter-spacing: 0;
          text-wrap: balance;
        }
        .hero-screen__sintesi-title span {
          display: inline;
        }
        .hero-screen__restituzione-label {
          font-size: clamp(0.68rem, 1vw, 0.82rem);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--report-structural-accent, #c4b5fd);
          font-weight: 500;
          margin: 0 0 clamp(0.85rem, 2vh, 1.3rem) 0;
          opacity: 0.82;
          text-align: center;
        }
        .hero-screen__sintesi-bridge {
          display: block;
          font-size: clamp(1.05rem, 1.6vw, 1.65rem);
          color: color-mix(in srgb, var(--corrente-chiara, #fde68a) 78%, #ffffff);
          font-weight: 420;
          margin-bottom: 0.1em;
        }
        .hero-screen__cta-sintesi {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-sm, 16px);
          margin-top: clamp(1.4rem, 3vh, 2rem);
        }
        .hero-screen__cta-sintesi-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: clamp(0.82rem, 1.1vw, 0.96rem);
          letter-spacing: 0.03em;
          text-decoration: none;
          padding: 0.78rem 1.35rem;
          border: 1px solid color-mix(in srgb, var(--corrente-chiara, #fde68a) 58%, transparent);
          border-radius: 999px;
          background: color-mix(in srgb, var(--corrente, #7c3aed) 72%, rgba(15, 23, 42, 0.42));
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.28);
          transition: transform 0.2s, filter 0.2s, box-shadow 0.2s;
        }
        .hero-screen__cta-sintesi-link.secondary {
          background: rgba(2, 8, 23, 0.52);
          border-color: rgba(255, 255, 255, 0.45);
        }
        .hero-screen__cta-sintesi-link:hover {
          color: #ffffff;
          transform: translateY(-2px);
          filter: brightness(1.08);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.34);
        }
        .hero-screen__cta-sintesi-link:focus-visible {
          outline: 2px solid rgba(255, 255, 255, 0.82);
          outline-offset: 4px;
        }
        .hero-screen__sintesi-nature-line {
          display: block;
          margin-top: clamp(0.85rem, 1.8vh, 1.35rem);
          font-size: clamp(1.85rem, 3.2vw, 3.75rem);
          line-height: 1.05;
          color: color-mix(in srgb, var(--corrente-chiara, #fde68a) 82%, #ffffff);
        }
        .hero-screen__sintesi-nature-label {
          display: inline;
          font-weight: 450;
        }
        .hero-screen__sintesi-family,
        .hero-screen__sintesi-nature {
          font-size: clamp(2.6rem, 6.1vw, 6.8rem);
          color: #ffffff;
          font-weight: 700;
        }
        .hero-screen__sintesi-title .hero-screen__sintesi-family {
          display: block;
          margin-top: 0.18em;
        }
        .hero-screen__sintesi-nature {
          display: inline;
          font-size: inherit;
          color: color-mix(in srgb, var(--corrente-chiara, #fde68a) 72%, #ffffff);
        }
        @media (max-width: 768px) {
          .hero-screen__flower-container {
            transform: scale(1.25);
          }
          .hero-screen__sintesi-family {
            font-size: clamp(2.15rem, 10vw, 4.2rem);
          }
          .hero-screen__sintesi-nature-line {
            font-size: clamp(1.55rem, 6.8vw, 2.7rem);
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
