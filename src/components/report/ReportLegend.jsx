import React from 'react'

const LEGEND_ITEMS = [
  { subject: 'Malinconia', key: 'blu', color: '#3b82f6' },
  { subject: 'Volitività', key: 'rosso', color: '#ef4444' },
  { subject: 'Entusiasmo', key: 'giallo', color: '#eab308' },
  { subject: 'Calma', key: 'verde', color: '#22c55e' },
  { subject: 'Anaffettività', key: 'grigio', color: '#6b7280' },
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
            style={{ backgroundColor: f.color }}
            aria-hidden
          />
          <span className="text-sm font-medium text-slate-700">{f.subject}</span>
        </div>
      ))}
    </div>
  )
}
