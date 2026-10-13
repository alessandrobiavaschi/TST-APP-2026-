import React from 'react'

const LEGEND_ITEMS = [
  { subject: 'Malinconica', key: 'blu', color: '#60a5fa' },
  { subject: 'Marziale', key: 'rosso', color: '#f87171' },
  { subject: 'Entusiasta', key: 'giallo', color: '#fde047' },
  { subject: 'Flemmatica', key: 'verde', color: '#4ade80' },
  { subject: 'Razionale', key: 'grigio', color: '#9ca3af' },
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
