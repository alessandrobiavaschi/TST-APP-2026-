import React, { useMemo } from 'react'
import { THEORETICAL_MAX_COLOR_TOTALS } from '../../testLogic.js'
import { FAMILY_ORDER, FAMILY_THEME, getFamilyTheme } from '../../config/reportFamilyTheme'

const CENTER = 160
const PETAL_DISTANCE = 58
const MIN_RADIUS = 30
const MAX_RADIUS = 92
const PETAL_BASE_ANGLE = -Math.PI / 2

/**
 * Calcola, per ciascuna famiglia, il peso relativo (% rispetto al massimo
 * teorico della famiglia) e il raggio del cerchio del fiore (area ∝ peso).
 */
function buildFamilies(totalsByKey) {
  return FAMILY_ORDER.map((name) => {
    const theme = FAMILY_THEME[name]
    const key = theme.key
    const value = Number(totalsByKey?.[key]) || 0
    const max = Number(THEORETICAL_MAX_COLOR_TOTALS?.[key]) || 0
    const percent = max > 0 ? Math.round(Math.min(100, (value / max) * 100)) : 0
    const radius = MIN_RADIUS + (MAX_RADIUS - MIN_RADIUS) * Math.sqrt(percent / 100)
    return { name, theme, value, percent, radius }
  })
}

/**
 * SEZIONE SINTESI (prima sezione del Report).
 * - Sinistra: "fiore" SVG delle 5 famiglie (cerchi sovrapposti, area ∝ peso).
 * - Destra: lista delle 5 famiglie con dot colore e percentuale.
 * - Sotto: corrente dominante e focus (data-driven dal record).
 */
export default function ReportSintesi({ totalsByKey, dominantColorName, focus }) {
  const families = useMemo(() => buildFamilies(totalsByKey), [totalsByKey])
  const theme = getFamilyTheme(dominantColorName)
  const sortedForList = useMemo(
    () => [...families].sort((a, b) => b.percent - a.percent),
    [families],
  )
  // I petali più piccoli vanno disegnati per ultimi (sopra), così restano visibili.
  const petals = useMemo(
    () => [...families].sort((a, b) => b.radius - a.radius),
    [families],
  )

  return (
    <section
      id="report-sintesi"
      aria-labelledby="report-sintesi-title"
      className="scroll-mt-20 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10"
    >
      <h2
        id="report-sintesi-title"
        className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
      >
        Il tuo profilo in sintesi
      </h2>

      <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        {/* Fiore SVG delle 5 famiglie */}
        <div className="flex justify-center">
          <svg
            viewBox="0 0 320 320"
            role="img"
            aria-label="Fiore delle cinque famiglie emotive, proporzionale al peso relativo"
            className="h-auto w-full max-w-[20rem]"
          >
            <g style={{ mixBlendMode: 'screen' }}>
              {petals.map((fam) => {
                const idx = FAMILY_ORDER.indexOf(fam.name)
                const angle = PETAL_BASE_ANGLE + (idx / FAMILY_ORDER.length) * Math.PI * 2
                const cx = CENTER + PETAL_DISTANCE * Math.cos(angle)
                const cy = CENTER + PETAL_DISTANCE * Math.sin(angle)
                return (
                  <circle
                    key={fam.name}
                    cx={cx}
                    cy={cy}
                    r={fam.radius}
                    fill={fam.theme.dot}
                    fillOpacity={0.55}
                  />
                )
              })}
            </g>
            <circle cx={CENTER} cy={CENTER} r={6} fill="#ffffff" fillOpacity={0.85} />
          </svg>
        </div>

        {/* Lista famiglie con dot e percentuale */}
        <ul className="space-y-3">
          {sortedForList.map((fam) => (
            <li key={fam.name} className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 rounded-full"
                style={{ background: fam.theme.dot }}
              />
              <span className="flex-1 text-sm font-medium text-white">
                {fam.theme.label}
                <span className="ml-2 text-white/55">· {fam.theme.macro}</span>
              </span>
              <span className="w-28 shrink-0">
                <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <span
                    className="block h-full rounded-full"
                    style={{ width: `${fam.percent}%`, background: fam.theme.dot }}
                  />
                </span>
              </span>
              <span className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums text-white">
                {fam.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:gap-8">
        <p className="text-sm text-white/70">
          Corrente dominante:{' '}
          <strong className="font-semibold text-white">{theme.corrente}</strong>
        </p>
        {focus && (
          <p className="text-sm text-white/70">
            Focus: <strong className="font-semibold text-white">{focus}</strong>
          </p>
        )}
      </div>
    </section>
  )
}
