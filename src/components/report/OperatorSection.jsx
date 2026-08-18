import React, { useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend as BarLegend,
  Customized,
} from 'recharts'
import ReportAccordion from './ReportAccordion'
import ReportPassageHeader from './ReportPassageHeader.jsx'
import PlainLanguageBox from './PlainLanguageBox.jsx'
import InfoTip from './InfoTip.jsx'
import { APPROFONDIMENTO_AREAS, APPROFONDIMENTO_UI, getAreaLabel } from './reportUiCopy.js'

const BAR_COLORS = {
  Blu: '#60a5fa',
  Rosso: '#f87171',
  Verde: '#4ade80',
  Giallo: '#fde047',
  Grigio: '#9ca3af',
}

const OPERATOR_LEGEND_ORDER = [
  { key: 'Grigio', label: 'Razionale' },
  { key: 'Verde', label: 'Flemmatica' },
  { key: 'Giallo', label: 'Entusiasta' },
  { key: 'Blu', label: 'Malinconica' },
  { key: 'Rosso', label: 'Marziale' },
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

function rowTotal(row) {
  return (row?.Blu || 0) + (row?.Rosso || 0) + (row?.Verde || 0) + (row?.Giallo || 0) + (row?.Grigio || 0)
}

/** Overlay "n/d" sulle colonne del grafico che non hanno dati calcolati. */
function EmptyAreaOverlay({ xAxisMap, yAxisMap, data = [], emptyAreas }) {
  if (!emptyAreas?.size) return null
  const xAxis = xAxisMap && Object.values(xAxisMap)[0]
  const yAxis = yAxisMap && Object.values(yAxisMap)[0]
  if (!xAxis?.scale || !yAxis?.scale) return null
  const bandwidth = xAxis.scale.bandwidth ? xAxis.scale.bandwidth() : 0
  const baseline = yAxis.scale(0)

  return (
    <g aria-hidden="true">
      {data.map((row) => {
        if (!emptyAreas.has(row.nome)) return null
        const x = xAxis.scale(row.nome)
        if (x == null) return null
        return (
          <text
            key={row.nome}
            x={x + bandwidth / 2}
            y={baseline - 10}
            textAnchor="middle"
            fontSize={11}
            fill="rgba(243, 241, 237, 0.55)"
          >
            n/d
          </text>
        )
      })}
    </g>
  )
}

function AreaGlossaryRow({ plainLanguage = false }) {
  const [activeTip, setActiveTip] = useState(null)
  return (
    <ul className="report-operator-areas" aria-label="Le cinque aree del test sonoro">
      {APPROFONDIMENTO_AREAS.map((nome) => (
        <li key={nome} className="report-operator-areas__item">
          <InfoTip
            term={getAreaLabel(nome, plainLanguage)}
            tip={APPROFONDIMENTO_UI.areaTips[nome]}
            open={activeTip === nome}
            onToggle={() => setActiveTip((cur) => (cur === nome ? null : nome))}
          />
        </li>
      ))}
    </ul>
  )
}

function FieldList({ label, children }) {
  if (!children) return null
  return (
    <div className="report-filtro-musicale__field">
      <dt className="report-filtro-musicale__dt">{label}</dt>
      <dd className="report-filtro-musicale__dd">{children}</dd>
    </div>
  )
}

function ChipList({ items = [], renderItem, empty = null }) {
  if (!items.length) return empty
  return (
    <ul className="report-filtro-musicale__chips">
      {items.map((item) => (
        <li key={item.code || item.label || item.nome} className="report-filtro-musicale__chip">
          {renderItem ? renderItem(item) : item.label}
        </li>
      ))}
    </ul>
  )
}

function AreaChip({ area }) {
  return (
    <span className="report-filtro-musicale__area">
      <span className="report-filtro-musicale__area-name">
        {area.code} · {area.nome}
      </span>
      {area.range ? (
        <span className="report-filtro-musicale__area-range">{area.range}</span>
      ) : null}
    </span>
  )
}

function FiltroMusicalePanel({ filtroMusicale, accentColor }) {
  if (!filtroMusicale?.hasData) return null

  return (
    <section
      id="report-tst-filtro-musicale"
      className="report-filtro-musicale report-tst-section-anchor"
      aria-labelledby="report-filtro-musicale-heading"
    >
      <header className="report-filtro-musicale__header">
        <div className="report-filtro-musicale__header-text">
          <p className="report-filtro-musicale__eyebrow">{APPROFONDIMENTO_UI.filtroEyebrow}</p>
          <h3 id="report-filtro-musicale-heading" className="report-filtro-musicale__title">
            {APPROFONDIMENTO_UI.filtroTitle}
          </h3>
        </div>
      </header>

      <PlainLanguageBox accentColor={accentColor} className="report-filtro-musicale__plain">
        {APPROFONDIMENTO_UI.filtroLead}
      </PlainLanguageBox>

      <dl className="report-filtro-musicale__grid">
        {filtroMusicale.areeMaggiorAgio?.length ? (
          <FieldList label="Aree di maggiore agio">
            <ChipList
              items={filtroMusicale.areeMaggiorAgio}
              renderItem={(area) => <AreaChip area={area} />}
            />
          </FieldList>
        ) : null}
        {filtroMusicale.areeMinorAgio?.length ? (
          <FieldList label="Aree di minore agio">
            <ChipList
              items={filtroMusicale.areeMinorAgio}
              renderItem={(area) => <AreaChip area={area} />}
            />
          </FieldList>
        ) : null}
        {filtroMusicale.statoAnimoFinale?.length ? (
          <FieldList label="Stato d'animo finale">
            <ChipList items={filtroMusicale.statoAnimoFinale} />
          </FieldList>
        ) : null}
        {filtroMusicale.difficolta || filtroMusicale.difficoltaDettaglio?.length ? (
          <FieldList label="Difficoltà">
            {filtroMusicale.difficolta?.label || null}
            <ChipList items={filtroMusicale.difficoltaDettaglio} />
          </FieldList>
        ) : null}
        {filtroMusicale.qualitaSuoni ? (
          <FieldList label="Qualità dei suoni">
            {filtroMusicale.qualitaSuoni.label}
          </FieldList>
        ) : null}
      </dl>
    </section>
  )
}

export default function OperatorSection({
  sezioniData,
  sezioniTest,
  filtroMusicale,
  correnteColore = '#4ade80',
  step = '6',
  plainLanguage = false,
}) {
  const accent = correnteColore || '#4ade80'
  const chartData = sezioniData || []
  const emptyAreas = chartData.filter((row) => rowTotal(row) === 0).map((row) => row.nome)
  const emptyAreaSet = new Set(emptyAreas)

  return (
    <section
      id="report-operatori"
      className="report-operator-section report-xp-section"
      aria-labelledby="operator-heading"
    >
      <ReportPassageHeader
        step={step}
        eyebrow={APPROFONDIMENTO_UI.eyebrow}
        title={APPROFONDIMENTO_UI.title}
        titleVisuallyHidden
        lead={APPROFONDIMENTO_UI.lead}
        accentColor={accent}
        titleId="operator-heading"
      />

      <PlainLanguageBox
        title={APPROFONDIMENTO_UI.chartPlainTitle}
        accentColor={accent}
        className="report-operator-chart-plain"
      >
        {APPROFONDIMENTO_UI.chartPlainSummary}
      </PlainLanguageBox>

      <AreaGlossaryRow plainLanguage={plainLanguage} />

      <div className="report-operator-chart-block">
        <p className="report-operator-chart-caption">{APPROFONDIMENTO_UI.chartCaption}</p>
        <div className="report-operator-chart-canvas">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            initialDimension={{ width: 320, height: 340 }}
          >
            <BarChart data={chartData} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
              <XAxis
                dataKey="nome"
                stroke="#64748b"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => getAreaLabel(value, plainLanguage)}
              />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value, name) => [value?.toFixed?.(0) ?? value, name]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                labelStyle={{ fontWeight: 600, color: '#0f172a' }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
              />
              <BarLegend verticalAlign="top" align="center" content={<OperatorLegend />} />
              <Bar dataKey="Grigio" fill={BAR_COLORS.Grigio} name="Anaffettività" />
              <Bar dataKey="Verde" fill={BAR_COLORS.Verde} name="Calma" />
              <Bar dataKey="Giallo" fill={BAR_COLORS.Giallo} name="Entusiasmo" />
              <Bar dataKey="Blu" fill={BAR_COLORS.Blu} name="Malinconia" />
              <Bar dataKey="Rosso" fill={BAR_COLORS.Rosso} name="Volitività" />
              <Customized component={(props) => <EmptyAreaOverlay {...props} data={chartData} emptyAreas={emptyAreaSet} />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {emptyAreas.length ? (
          <p className="report-operator-chart-empty-note">
            Dati non disponibili per: {emptyAreas.map((nome) => getAreaLabel(nome, plainLanguage)).join(', ')}.
          </p>
        ) : null}
      </div>

      <FiltroMusicalePanel filtroMusicale={filtroMusicale} accentColor={accent} />

      <ReportAccordion sezioniTest={sezioniTest} plainLanguage={plainLanguage} />
    </section>
  )
}
