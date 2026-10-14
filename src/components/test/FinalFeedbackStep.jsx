import React from 'react'
import {
  AREE_TEST,
  DIFFICOLTA_DETTAGLIO_OPTIONS,
  DIFFICOLTA_TEST_OPTIONS,
  MAX_SCELTE_DOMANDE_FINALI,
  QUALITA_SUONI_OPTIONS,
  STATO_ANIMO_FINALE_OPTIONS,
} from '../../config/domandeFinali.js'
import '../../styles/test-finale.css'

const parseCodes = (value) =>
  String(value || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

const AREE_OPTIONS = AREE_TEST.map((area) => ({
  value: area.value,
  label: `${area.value} · ${area.nome}`,
  detail: `passi ${area.from}–${area.to}`,
}))

function Chip({ type, name, option, checked, disabled, onChange }) {
  return (
    <label className={`tst-chip${option.detail ? ' tst-chip--detail' : ''}`}>
      <input
        type={type}
        name={name}
        value={option.value}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <span className="tst-chip-face">
        <span className={`tst-chip-mark tst-chip-mark--${type}`} aria-hidden="true" />
        <span className="tst-chip-text">
          {option.label}
          {option.detail && <small>{option.detail}</small>}
        </span>
      </span>
    </label>
  )
}

function Domanda({ n, title, aside, children }) {
  return (
    <fieldset className="tst-finale-q">
      <legend className="tst-finale-q-legend">
        <span className="tst-finale-q-num" aria-hidden="true">{n}</span>
        <span className="tst-finale-q-title">{title}</span>
      </legend>
      {aside && <div className="tst-finale-q-aside">{aside}</div>}
      {children}
    </fieldset>
  )
}

function SceltaMultipla({ name, options, value, onToggle, max, columns = 'auto' }) {
  const selected = parseCodes(value)
  return (
    <>
      {max && (
        <p className="tst-finale-count" aria-live="polite">
          {selected.length} di {max} scelte
        </p>
      )}
      <div className={`tst-chip-grid tst-chip-grid--${columns}`}>
        {options.map((opt) => {
          const checked = selected.includes(opt.value)
          return (
            <Chip
              key={`${name}-${opt.value}`}
              type="checkbox"
              name={name}
              option={opt}
              checked={checked}
              disabled={Boolean(max) && !checked && selected.length >= max}
              onChange={() => onToggle(opt.value)}
            />
          )
        })}
      </div>
    </>
  )
}

function SceltaSingola({ name, options, value, onChange, columns = 'auto' }) {
  return (
    <div className={`tst-chip-grid tst-chip-grid--${columns}`}>
      {options.map((opt) => (
        <Chip
          key={`${name}-${opt.value}`}
          type="radio"
          name={name}
          option={opt}
          checked={value === opt.value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

/**
 * Ultimo passo prima della consegna: domande sull'esperienza di ascolto.
 * Non cambia i dati salvati: riceve dal test i valori e i gestori esistenti.
 */
export default function FinalFeedbackStep({
  record,
  toggles,
  onQualitaChange,
  onDifficoltaChange,
  onOpenAreasHelp,
  onBack,
  onSubmit,
  isSubmitting,
  lastStep,
}) {
  const max = MAX_SCELTE_DOMANDE_FINALI
  const haDifficolta = record.Difficolta_Test === 'DT_SI'

  return (
    <section className="tst-finale" aria-labelledby="tst-finale-title">
      <header className="tst-finale-head">
        <p className="test-stage-step-label tst-finale-step">Domande finali · dopo il passo {lastStep}</p>
        <div className="stepper-progress" aria-hidden="true">
          <div className="stepper-progress-bar" style={{ width: '100%' }} />
        </div>
        <h2 id="tst-finale-title" className="tst-finale-title">
          Prima di consegnare, com’è andata?
        </h2>
        <p className="tst-finale-lead">
          Cinque domande brevi sull’esperienza di ascolto. Non cambiano il calcolo del profilo e puoi
          lasciarle in bianco.
        </p>
      </header>

      <div className="tst-finale-body">
        <Domanda n={1} title="Come ti senti adesso?">
          <SceltaMultipla
            name="stato-animo"
            options={STATO_ANIMO_FINALE_OPTIONS}
            value={record.Stato_Animo_Finale}
            onToggle={toggles.statoAnimo}
            max={max}
            columns="4"
          />
        </Domanda>

        <Domanda n={2} title="Hai trovato difficoltà durante il test?">
          <SceltaSingola
            name="difficolta-test"
            options={DIFFICOLTA_TEST_OPTIONS}
            value={record.Difficolta_Test}
            onChange={onDifficoltaChange}
            columns="2"
          />
          {haDifficolta && (
            <div className="tst-finale-reveal">
              <p className="tst-finale-sub">Di che tipo? Puoi sceglierne più di una.</p>
              <SceltaMultipla
                name="difficolta-dettaglio"
                options={DIFFICOLTA_DETTAGLIO_OPTIONS}
                value={record.Difficolta_Dettaglio}
                onToggle={toggles.difficoltaDettaglio}
                columns="2"
              />
            </div>
          )}
        </Domanda>

        <Domanda
          n={3}
          title="In quali aree ti sei sentito più a tuo agio?"
          aside={
            <button type="button" className="tst-finale-link" onClick={onOpenAreasHelp}>
              Cosa sono le aree A–E?
            </button>
          }
        >
          <SceltaMultipla
            name="area-maggior-agio"
            options={AREE_OPTIONS}
            value={record.Area_Maggior_Agio}
            onToggle={toggles.areaMaggiorAgio}
            max={max}
            columns="5"
          />
        </Domanda>

        <Domanda n={4} title="E in quali meno a tuo agio?">
          <SceltaMultipla
            name="area-minor-agio"
            options={AREE_OPTIONS}
            value={record.Area_Minor_Agio}
            onToggle={toggles.areaMinorAgio}
            max={max}
            columns="5"
          />
        </Domanda>

        <Domanda n={5} title="Com’era la qualità dei suoni?">
          <SceltaSingola
            name="qualita-suoni"
            options={QUALITA_SUONI_OPTIONS}
            value={record.Qualita_Suoni}
            onChange={onQualitaChange}
            columns="4"
          />
        </Domanda>
      </div>

      <footer className="tst-finale-foot">
        <button type="button" className="nav-button secondary" onClick={onBack} disabled={isSubmitting}>
          Torna al passo {lastStep}
        </button>
        <div className="tst-finale-cta">
          <button
            type="button"
            className="nav-button primary tst-finale-submit"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Consegna in corso…' : 'Consegna e vedi il profilo'}
          </button>
          <p className="tst-finale-cta-note">Il profilo si apre subito dopo la consegna.</p>
        </div>
      </footer>
    </section>
  )
}
