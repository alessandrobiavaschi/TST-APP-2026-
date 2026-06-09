import React, { useMemo, useState } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from 'framer-motion'
import { getFlowerStillByColor } from '../../colorAssets.js'
import { HERO_UI } from './reportUiCopy.js'

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
 *  - naturaName: string            es. "NATURA FLEMMATICA"  (diventa l'unico <h1>)
 *  - disposizione: string          es. "CONTEMPLATIVA"
 *  - fraseChiave: string
 *  - correnteColore: string        hex colore dominante (es. "#16a34a")
 *  - correnteColoreChiara?: string hex versione chiara (opzionale; default calcolato)
 *  - correnteColoreMedia?: string  hex versione media/scura (opzionale; default calcolato)
 *  - correnti: Array<{ nome: string, colore: string, peso: number }>  // 5 correnti
 *  - famigliaColore?: string        es. "Verde" → still fiore per famiglia (colorAssets)
 *  - onStartReport: () => void
 *  - onStartGalassia: () => void
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

const FAMIGLIA_TO_COLOR_KEY = {
  blu: 'blu',
  rosso: 'rosso',
  verde: 'verde',
  giallo: 'giallo',
  grigio: 'grigio',
}

function resolveColorKeyFromFamiglia(famigliaColore) {
  if (!famigliaColore) return null
  const normalized = String(famigliaColore).trim().toLowerCase()
  return FAMIGLIA_TO_COLOR_KEY[normalized] || null
}

/* ------------------------------------------------------------------ */
/* Cerchio singolo della mini-sintesi correnti.                       */
/* ------------------------------------------------------------------ */

function CorrenteCircle({ corrente, size, index, reduceMotion }) {
  return (
    <motion.span
      role="img"
      aria-label={corrente.nome}
      title={corrente.nome}
      initial={reduceMotion ? false : { scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.9 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { delay: 1.5 + index * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
      style={{
        display: 'inline-block',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '9999px',
        backgroundColor: corrente.colore,
        marginLeft: index === 0 ? 0 : '-5px',
        border: '2px solid rgba(255, 255, 255, 0.55)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
        cursor: 'default',
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Componente principale.                                             */
/* ------------------------------------------------------------------ */

export default function HeroScreen({
  naturaName = 'NATURA FLEMMATICA',
  disposizione = 'CONTEMPLATIVA',
  fraseChiave = '',
  correnteColore = '#16a34a',
  correnteColoreChiara,
  correnteColoreMedia,
  correnti = [],
  famigliaColore,
  onStartReport,
  onStartGalassia,
}) {
  const reduceMotion = useReducedMotion()
  const [scrolled, setScrolled] = useState(false)

  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (v) => {
    if (v > 24 && !scrolled) setScrolled(true)
  })

  /* Varianti colore: usa le prop se fornite, altrimenti deriva dal dominante. */
  const colors = useMemo(() => {
    const media = correnteColoreMedia || darken(correnteColore, 0.32)
    const chiara = correnteColoreChiara || lighten(correnteColore, 0.35)
    // Stop intermedio OPACO (media → bordo), così lo sfondo non traspare mai.
    const edgeRgb = parseHex(EDGE_COLOR) || BLACK
    const mid = mixToward(media, edgeRgb, 0.62)
    return { media, chiara, mid }
  }, [correnteColore, correnteColoreChiara, correnteColoreMedia])

  /* Dimensione cerchi ∝ peso (range 18px → 48px, relativo al peso massimo).
     Il minimo è abbastanza grande da rendere visibili anche le 5 correnti
     marginali (prima alcune sparivano a ~10px sovrapposte). */
  const circles = useMemo(() => {
    const list = Array.isArray(correnti) ? correnti.filter(Boolean) : []
    const maxPeso = list.reduce((m, c) => Math.max(m, Number(c?.peso) || 0), 0) || 1
    const MIN = 18
    const MAX = 48
    return list.map((c) => ({
      ...c,
      size: Math.round(MIN + ((Number(c?.peso) || 0) / maxPeso) * (MAX - MIN)),
    }))
  }, [correnti])

  /* Still fiore TST (stesso asset di FinalFlowerTransition / HeroSummary). */
  const flowerStillUrl = useMemo(() => {
    const key = resolveColorKeyFromFamiglia(famigliaColore)
    return key ? getFlowerStillByColor(key) : null
  }, [famigliaColore])

  /* CSS custom properties iniettate sul root → tutta la scena è data-driven. */
  const rootStyle = {
    '--corrente': correnteColore,
    '--corrente-chiara': colors.chiara,
    '--corrente-media': colors.media,
    '--hero-edge': EDGE_COLOR,
    minHeight: 'calc(100svh - var(--app-header-offset, 56px))',
    position: 'relative',
    overflow: 'visible',
    paddingBottom: 'clamp(2rem, 6vh, 4rem)',
    backgroundColor: EDGE_COLOR,
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

  const gradientStyle = flowerStillUrl
    ? {
        backgroundImage: `radial-gradient(circle at 50% 40%, ${rgba(colors.media, 0.62)} 0%, ${rgba(colors.mid, 0.78)} 42%, ${rgba(EDGE_COLOR, 0.52)} 72%, ${rgba(EDGE_COLOR, 0.28)} 100%)`,
      }
    : {
        backgroundImage: `radial-gradient(circle at 50% 42%, var(--corrente-media) 0%, ${colors.mid} 46%, var(--hero-edge) 100%)`,
      }

  return (
    <section
      style={rootStyle}
      aria-label={HERO_UI.ariaSection}
      className="hero-screen relative w-full"
    >
      <div className="hero-screen__backdrop" aria-hidden="true">
        {/* Layer 0 — foto fiore full-bleed (famiglia / disposizione prevalente). */}
        {flowerStillUrl ? (
          <div
            className="hero-screen__flower"
            style={{ backgroundImage: `url("${flowerStillUrl}")` }}
          />
        ) : null}
        {/* Layer 1 — gradiente radiale: centro opaco per il titolo, bordi più trasparenti. */}
        <div
          className="hero-screen__gradient"
          style={{
            ...gradientStyle,
            backgroundColor: flowerStillUrl ? 'transparent' : EDGE_COLOR,
          }}
        />
        {/* Layer 2 — noise. */}
        <div
          className="hero-screen__noise"
          style={{ backgroundImage: `url("${NOISE_SVG}")` }}
        />
      </div>

      {/* Layer 3 — contenuto (titolo, disposizione, cerchi, CTA). */}
      <div
        className="report-tst-hero__content hero-screen__content flex w-full flex-col items-center justify-center px-6 py-6 text-center sm:py-8"
      >
        <div className="report-tst-hero__inner flex w-full max-w-3xl flex-col items-center gap-5 sm:gap-6">
          {/* 1. Label monospace */}
          <motion.p
            {...fade(0.2)}
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              fontSize: '0.7rem',
              color: rgba(colors.chiara, 0.6),
              margin: 0,
            }}
          >
            {HERO_UI.label}
          </motion.p>

          {/* 2. Nome natura — unico h1, dominante */}
          <motion.h1
            {...fade(0.5, 24)}
            style={{
              fontSize: 'clamp(3rem, 8vw, 7rem)',
              lineHeight: 1.05,
              color: '#ffffff',
              margin: 0,
            }}
          >
            {naturaName}
          </motion.h1>

          {/* 3. Disposizione */}
          <motion.p
            {...fade(0.8)}
            style={{
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)',
              fontWeight: 500,
              color: 'var(--corrente-chiara)',
              margin: 0,
            }}
          >
            {disposizione}
          </motion.p>

          {/* 4. Linea divisoria animata (width 0 → 60px) */}
          <motion.span
            aria-hidden="true"
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: 60 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 1, duration: 0.6, ease: 'easeOut' }}
            style={{
              display: 'block',
              height: '1px',
              backgroundColor: rgba(correnteColore, 0.4),
            }}
          />

          {/* 5. Frase chiave */}
          {fraseChiave ? (
            <motion.p
              {...fade(1.2)}
              className="report-tst-hero__frase-chiave"
            >
              {fraseChiave}
            </motion.p>
          ) : null}

          {/* 6. Cerchi correnti (mini sintesi) */}
          {circles.length > 0 ? (
            <div
              className="flex items-center justify-center"
              role="list"
              aria-label={HERO_UI.correntiAriaLabel}
              style={{ marginTop: '0.25rem' }}
            >
              {circles.map((c, i) => (
                <CorrenteCircle
                  key={`${c.nome}-${i}`}
                  corrente={c}
                  size={c.size}
                  index={i}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          ) : null}

          {/* 7. Bottoni */}
          <motion.div
            {...fade(1.8)}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            style={{ marginTop: '0.5rem' }}
          >
            <button
              type="button"
              onClick={onStartReport}
              className="hero-screen-btn-primary"
              style={{
                backgroundColor: 'var(--corrente)',
                color: '#ffffff',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '1rem',
                padding: '14px 32px',
                minHeight: '44px',
                border: 'none',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'filter 0.2s ease, background-color 0.2s ease',
              }}
            >
              {HERO_UI.ctaReport}
            </button>
            <button
              type="button"
              onClick={onStartGalassia}
              className="hero-screen-btn-secondary"
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: '1rem',
                padding: '14px 32px',
                minHeight: '44px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, color 0.2s ease',
              }}
            >
              {HERO_UI.ctaGalassia}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator: scompare dopo il primo scroll. */}
      {!scrolled ? (
        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 2.2, duration: 0.6 }}
            style={{
              position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
            transition={
              reduceMotion ? undefined : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
            }
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.25em',
              color: 'rgba(255, 255, 255, 0.4)',
            }}
          >
            {HERO_UI.scrollHint}
          </span>
        </motion.div>
      ) : null}

      {/* Stili hover (scoped via classi dedicate). Usa la CSS custom property
          --corrente per la box-shadow del bottone primario. */}
      <style>{`
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
