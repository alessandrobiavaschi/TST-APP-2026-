import React from 'react'
import { colors } from '../../design-tokens'

const LEGEND_ITEMS = [
  { subject: 'Malinconica', key: 'blu', color: colors.famiglie.blu.hex },
  { subject: 'Marziale', key: 'rosso', color: colors.famiglie.rosso.hex },
  { subject: 'Entusiasta', key: 'giallo', color: colors.famiglie.giallo.hex },
  { subject: 'Flemmatica', key: 'verde', color: colors.famiglie.verde.hex },
  { subject: 'Razionale', key: 'grigio', color: colors.famiglie.grigio.hex },
]

export default function ReportLegend() {
  return (
    <div
      className="flex flex-wrap justify-center gap-4 gap-y-2 py-4"
      role="list"
      aria-label="Legenda famiglie emotive"
    >
      {LEGEND_ITEMS.map((f) => (
        <div
          key={f.key}
          className="flex items-center gap-2"
          role="listitem"
        >
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{
              backgroundColor: f.color,
              boxShadow: `0 0 10px ${f.color}55`,
            }}
            aria-hidden
          />
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--tst-color-text-secondary)' }}
          >
            {f.subject}
          </span>
        </div>
      ))}
    </div>
  )
}
