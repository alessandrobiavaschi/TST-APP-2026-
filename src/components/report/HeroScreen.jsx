import React, { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { HERO_UI } from './reportUiCopy.js'
import { getFlowerStillByColor } from '../../colorAssets.js'
import { computeColorTotals, getDominantColorInfo } from '../../utils/reportRecordUtils.js'

// Il setup ESLint del progetto non riconosce l'uso di `motion.X` nel JSX come
// riferimento alla variabile (stessa convenzione di HeroSummary.jsx).
void motion

/**
 * <HeroScreen /> — schermata d'apertura (100vh) del report TST.
 *
 * Componente puro presentazionale, data-driven dalle props. Nessuna chiamata
 * a scoring o DB. I colori della corrente dominante sono iniettati come
 * CSS custom properties sul nodo radice, così l'intera scena cambia tinta
 * automaticamente per ogni profilo.
 *
 * Props:
 *  - naturaName: string            es. "NATURA FLEMMATICA"
 *  - disposizione: string          es. "CONTEMPLATIVA"
 *  - userName: string              nome e cognome della persona
 *  - correnteColore: string        hex colore dominante (es. "#16a34a")
 *  - correnteColoreChiara?: string hex versione chiara (opzionale; default calcolato)
 *  - correnteColoreMedia?: string  hex versione media/scura (opzionale; default calcolato)
 *  - correnti: Array<{ nome: string, colore: string, peso: number }>  // 5 correnti
 */

/* ------------------------------------------------------------------ */
/* Utility colore: derivano le varianti chiara/media dal colore hex.  */
/* ------------------------------------------------------------------ */

function clamp255(n) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function parseHex(hex) {
  if (typeof hex !== 'string') return null
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  if (h.length !== 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return null
  return { r, g, b }
}

function toHex({ r, g, b }) {
  return '#' + [r, g, b].map((v) => clamp255(v).toString(16).padStart(2, '0')).join('')
}

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }

function mixToward(hex, target, amount) {
  const c = parseHex(hex)
  if (!c) return hex
  return toHex({
    r: c.r + (target.r - c.r) * amount,
    g: c.g + (target.g - c.g) * amount,
    b: c.b + (target.b - c.b) * amount,
  })
}

const lighten = (hex, a) => mixToward(hex, WHITE, a)
const darken = (hex, a) => mixToward(hex, BLACK, a)

function toTitleCase(str) {
  return String(str || '').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
}

function rgba(hex, a) {
  const c = parseHex(hex)
  if (!c) return hex
  return `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`
}

/* Texture noise via SVG feTurbulence (nessuna immagine stock). */
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(%23n)'/></svg>",
  )

const EDGE_COLOR = '#020817'

/* ------------------------------------------------------------------ */
/* Componente principale.                                             */
/* ------------------------------------------------------------------ */

export default function HeroScreen({
  naturaName = 'NATURA FLEMMATICA',
  _disposizione = 'CONTEMPLATIVA',
  _userName = '',
  correnteColore = '#16a34a',
  correnteColoreChiara,
  correnteColoreMedia,
  _correnti = [],
  rawRecord = {},
  _portato = {},
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
    // Derive a very dark, premium ambient background color from the family's dominant color
    return darken(correnteColore, 0.75)
  }, [correnteColore])

  /* Varianti colore: usa le prop se fornite, altrimenti deriva dal dominante. */
  const colors = useMemo(() => {
    const media = correnteColoreMedia || darken(correnteColore, 0.32)
    const chiara = correnteColoreChiara || lighten(correnteColore, 0.35)
    // Stop intermedio OPACO (media → bordo), così lo sfondo non traspare mai.
    const edgeRgb = parseHex(edgeColor) || BLACK
    const mid = mixToward(media, edgeRgb, 0.62)
    return { media, chiara, mid }
  }, [correnteColore, correnteColoreChiara, correnteColoreMedia, edgeColor])

  /* CSS custom properties iniettate sul root → tutta la scena è data-driven. */
  const rootStyle = {
    '--corrente': correnteColore,
    '--corrente-chiara': colors.chiara,
    '--corrente-media': colors.media,
    '--hero-edge': edgeColor,
    position: 'relative',
    overflow: 'visible',
    paddingBottom: 'clamp(2rem, 4vh, 3rem)',
    backgroundColor: edgeColor,
  }

  /* Helper transizione fade-in (rispetta reduced-motion). */
  const fade = (delay, y = 0) =>
    reduceMotion
      ? { initial: false, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        }

  const naturaText = toTitleCase(String(naturaName || '').replace(/^NATURA\s+/i, ''))

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
      className="hero-screen relative w-full"
    >
      <div className="hero-screen__backdrop" aria-hidden="true">
        {/* Layer -1 — Nature background image matching the disposition */}
        {bgImage && (
          <div
            className="hero-screen__nature-bg"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
        )}

        {/* Layer 1 — Radial gradient overlay: ensures contrast for titles and text */}
        <div
          className="hero-screen__gradient"
          style={{
            ...gradientStyle,
            backgroundColor: bgImage ? 'transparent' : edgeColor,
          }}
        />
        {/* Layer 2 — Noise overlay */}
        <div
          className="hero-screen__noise"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />
      </div>

      {/* Layer 3 — contenuto essenziale: sintesi identitaria. */}
      <div
        className="report-tst-hero__content hero-screen__content flex w-full flex-col items-center justify-center px-6 py-10 sm:py-12"
      >
        <div className="report-tst-hero__inner report-tst-hero__identity flex w-full max-w-4xl flex-col items-center">
          <motion.p
            {...fade(0.1, 12)}
            className="hero-screen__restituzione-label"
          >
            Restituzioni del Test
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
            <span className="hero-screen__sintesi-bridge">La tua natura emotiva prevalente è</span>
            <strong className="hero-screen__sintesi-family">{naturaText}</strong>
          </motion.h1>
          <motion.div {...fade(0.45, 8)} className="hero-screen__cta-sintesi">
            <button
              type="button"
              className="nav-button primary hero-screen__cta-sintesi-link"
              onClick={onReadReport}
            >
              Leggi il tuo report
            </button>
            <button
              type="button"
              className="nav-button secondary hero-screen__cta-sintesi-link"
              onClick={onNewTest}
            >
              Nuovo test
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
