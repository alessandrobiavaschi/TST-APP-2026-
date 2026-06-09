import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { getFamilyTheme, getFamilyGradientCss } from '../../config/reportFamilyTheme'

void motion

/**
 * HERO full-bleed del report (Sezione 1).
 *
 * Sfondo data-driven con il colore dominante del profilo, nome della natura in
 * tipografia grande, disposizione in tracking largo, riga descrittiva e due CTA
 * in basso a destra ("Leggi il Report" / "Esplora la Galassia").
 *
 * Nessun header/navbar sopra: la hero occupa l'intero viewport.
 */
export default function ReportHero({
  dominantColorName,
  nature: natureOverride,
  disposition: dispositionOverride,
  tagline: taglineOverride,
  onReadReport,
  onExploreGalaxy,
}) {
  const reduceMotion = useReducedMotion()
  const theme = getFamilyTheme(dominantColorName)
  const gradient = getFamilyGradientCss(dominantColorName)
  // Nome natura, disposizione e riga descrittiva derivano dalla famiglia
  // dominante (mappa data-driven); gli override sono opzionali.
  const nature = natureOverride || theme.nature
  const disposition = dispositionOverride || theme.disposition
  const tagline = taglineOverride || theme.tagline

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
        }

  return (
    <section
      id="report-hero"
      aria-label="Sintesi immediata del profilo"
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden text-white"
      style={{ background: gradient }}
    >
      {/* Texture luminosa morbida, nessuna immagine generica */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(120% 80% at 15% 0%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%), radial-gradient(90% 70% at 100% 100%, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pt-24 pb-28 sm:px-10 sm:pt-28">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <motion.p
            {...fadeUp(0)}
            className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-white/70"
          >
            Profilo {theme.label}
          </motion.p>

          <motion.h1
            {...fadeUp(0.08)}
            className="text-balance text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {nature}
          </motion.h1>

          <motion.p
            {...fadeUp(0.16)}
            className="mt-6 text-sm font-light uppercase tracking-[0.5em] text-white/85 sm:text-lg sm:tracking-[0.6em]"
          >
            {disposition}
          </motion.p>

          {tagline && (
            <motion.p
              {...fadeUp(0.24)}
              className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg"
            >
              {tagline}
            </motion.p>
          )}
        </div>
      </div>

      {/* CTA in basso a destra */}
      <motion.div
        {...fadeUp(0.32)}
        className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 pb-12 sm:flex-row sm:justify-end sm:px-10"
      >
        <button
          type="button"
          onClick={onReadReport}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          Leggi il Report
        </button>
        <button
          type="button"
          onClick={onExploreGalaxy}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/60 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        >
          Esplora la Galassia
        </button>
      </motion.div>

      {/* Indicatore scroll */}
      <div
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-white/55"
      >
        <span className="block h-9 w-5 rounded-full border border-white/40">
          <span className="mx-auto mt-1.5 block h-2 w-0.5 animate-bounce rounded-full bg-white/70" />
        </span>
      </div>
    </section>
  )
}
