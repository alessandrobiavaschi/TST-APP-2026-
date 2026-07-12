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
import ReportPassageHeader from './ReportPassageHeader.jsx'
import PlainLanguageBox from './PlainLanguageBox.jsx'
import InfoTip from './InfoTip.jsx'
import { APPROFONDIMENTO_AREAS, APPROFONDIMENTO_UI } from './reportUiCopy.js'

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

function AreaGlossaryRow() {
  return (
    <ul className="report-operator-areas" aria-label="Le cinque aree del test sonoro">
      {APPROFONDIMENTO_AREAS.map((nome) => (
        <li key={nome} className="report-operator-areas__item">
          <InfoTip term={nome} tip={APPROFONDIMENTO_UI.areaTips[nome]} />
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
}) {
  const accent = correnteColore || '#4ade80'

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

      <AreaGlossaryRow />

      <div className="report-operator-chart-block">
        <p className="report-operator-chart-caption">{APPROFONDIMENTO_UI.chartCaption}</p>
        <div className="report-operator-chart-canvas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sezioniData || []} margin={{ top: 16, right: 16, bottom: 16, left: 8 }}>
              <XAxis dataKey="nome" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value?.toFixed?.(0) ?? value, '']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
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

      <FiltroMusicalePanel filtroMusicale={filtroMusicale} accentColor={accent} />

      <ReportAccordion sezioniTest={sezioniTest} />
    </section>
  )
}
