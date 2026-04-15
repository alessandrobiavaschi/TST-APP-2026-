import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend as BarLegend,
} from 'recharts'
import ReportAccordion from './ReportAccordion'

const BAR_COLORS = {
  Blu: '#3b82f6',
  Rosso: '#ef4444',
  Verde: '#22c55e',
  Giallo: '#eab308',
  Grigio: '#6b7280',
}

const OPERATOR_LEGEND_ORDER = [
  { key: 'Grigio', label: 'Anaffettività' },
  { key: 'Verde', label: 'Calma' },
  { key: 'Giallo', label: 'Entusiasmo' },
  { key: 'Blu', label: 'Malinconia' },
  { key: 'Rosso', label: 'Volitività' },
]

function OperatorLegend() {
  return (
    <div className="report-operator-legend" aria-hidden="true">
      {OPERATOR_LEGEND_ORDER.map((item) => (
        <span key={item.key} className="report-operator-legend-item">
          <span
            className="report-operator-legend-dot"
            style={{ backgroundColor: BAR_COLORS[item.key] }}
          />
          <span className="report-operator-legend-label">{item.label}</span>
        </span>
      ))}
    </div>
  )
}

export default function OperatorSection({ sezioniData, sezioniTest }) {
  return (
    <section id="report-operatori" className="report-operator-section report-xp-section" aria-labelledby="operator-heading">
      <header className="report-operator-header">
        <h2 id="operator-heading" className="report-operator-title">
          Approfondimento sulle singole sezioni
        </h2>
        <div className="report-operator-title-line" aria-hidden />
        <p className="report-operator-intro">
          Questa sezione mostra dove si concentra l&apos;energia emotiva nelle diverse aree del test. Ogni colonna rappresenta una sezione, con le cinque famiglie a confronto.
        </p>
      </header>

      {/* Bar chart sezioni */}
      <div className="report-operator-chart-block">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sezioniData || []} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
              <XAxis dataKey="nome" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value?.toFixed?.(0) ?? value, '']}
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ fontWeight: 600 }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
              />
              <BarLegend verticalAlign="top" align="center" content={<OperatorLegend />} />
              <Bar dataKey="Blu" fill={BAR_COLORS.Blu} name="Malinconia" />
              <Bar dataKey="Rosso" fill={BAR_COLORS.Rosso} name="Volitività" />
              <Bar dataKey="Verde" fill={BAR_COLORS.Verde} name="Calma" />
              <Bar dataKey="Giallo" fill={BAR_COLORS.Giallo} name="Entusiasmo" />
              <Bar dataKey="Grigio" fill={BAR_COLORS.Grigio} name="Anaffettività" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <ReportAccordion sezioniTest={sezioniTest} />
    </section>
  )
}
