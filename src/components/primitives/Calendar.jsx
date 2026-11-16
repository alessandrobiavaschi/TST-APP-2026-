import React, { useEffect, useMemo, useRef, useState } from 'react'
import './Calendar.css'

/**
 * Calendar — porting JS del Calendar di Tremor (v1.0.0), senza react-day-picker
 * (la v8 non supporta React 19). Stesso aspetto: frecce mese/anno, oggi
 * sottolineato, selezione blu, settimana da lunedì, giorni esterni attenuati.
 * In più: clic sul titolo → griglia degli anni (utile per la data di nascita).
 * Valori come stringhe 'YYYY-MM-DD' (lo stesso formato di <input type="date">);
 * `min`/`max` accettano anche 'today'.
 */

const pad = (n) => String(n).padStart(2, '0')
const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const fromIso = (s) => {
  if (s === 'today') return startOfDay(new Date())
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '')
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const sameDay = (a, b) => a && b && toIso(a) === toIso(b)
const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1)
const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1)
const monthKey = (d) => d.getFullYear() * 12 + d.getMonth()

function Icon({ d }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="tst-cal__icon">
      <path d={d} fill="currentColor" />
    </svg>
  )
}
// Remix Icon: arrow-left-s-line, arrow-left-double-line (e speculari)
const LEFT = 'M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z'
const RIGHT = 'M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z'
const LEFT2 = 'M4.836 12l6.207 6.207-1.414 1.414L2.007 12l7.622-7.621 1.414 1.414zm7 0l6.207 6.207-1.414 1.414L9.007 12l7.622-7.621 1.414 1.414z'
const RIGHT2 = 'M19.164 12l-6.207-6.207 1.414-1.414L21.993 12l-7.622 7.621-1.414-1.414zm-7 0L5.957 5.793l1.414-1.414L14.993 12l-7.622 7.621-1.414-1.414z'

function NavButton({ icon, label, disabled, onClick }) {
  return (
    <button type="button" className="tst-cal__nav" aria-label={label} disabled={disabled} onClick={onClick}>
      <Icon d={icon} />
    </button>
  )
}

export function Calendar({
  value = '',
  onChange,
  min,
  max,
  weekStartsOn = 1,
  enableYearNavigation = false,
  locale = 'it-IT',
  defaultMonth,
  className = '',
  autoFocus = false,
}) {
  const selected = fromIso(value)
  const minD = fromIso(min)
  const maxD = fromIso(max)
  const today = new Date()
  const [month, setMonth] = useState(() => startOfMonth(selected || fromIso(defaultMonth) || today))
  const [view, setView] = useState('days')
  const [focused, setFocused] = useState(() => selected || today)
  const gridRef = useRef(null)

  useEffect(() => {
    if (selected) setMonth(startOfMonth(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const isDisabled = (d) => (minD && d < minD) || (maxD && d > maxD)
  const canPrev = (n) => !minD || monthKey(addMonths(month, -n)) >= monthKey(minD)
  const canNext = (n) => !maxD || monthKey(addMonths(month, n)) <= monthKey(maxD)

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'short' })
    // 2024-01-01 è un lunedì
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(2024, 0, 1 + ((i + weekStartsOn - 1 + 7) % 7))).replace('.', ''),
    )
  }, [locale, weekStartsOn])

  const weekdaysLong = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: 'long' })
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 1 + ((i + weekStartsOn - 1 + 7) % 7))))
  }, [locale, weekStartsOn])

  const weeks = useMemo(() => {
    const first = startOfMonth(month)
    const offset = (first.getDay() - weekStartsOn + 7) % 7
    const start = new Date(first.getFullYear(), first.getMonth(), 1 - offset)
    return Array.from({ length: 6 }, (_, w) =>
      Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + i)),
    )
  }, [month, weekStartsOn])

  const title = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(month)
  // giorno raggiungibile col Tab: quello a fuoco se è nel mese mostrato, altrimenti il 1°
  const tabDay = monthKey(focused) === monthKey(month) ? focused : month

  const moveFocus = (d) => {
    setFocused(d)
    if (monthKey(d) !== monthKey(month)) setMonth(startOfMonth(d))
  }

  useEffect(() => {
    if (view !== 'days' || !gridRef.current) return
    if (!autoFocus && !gridRef.current.contains(document.activeElement)) return
    gridRef.current.querySelector(`[data-day="${toIso(focused)}"]`)?.focus()
  }, [focused, view, autoFocus])

  const onKeyDown = (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key]
    if (step) {
      e.preventDefault()
      moveFocus(new Date(focused.getFullYear(), focused.getMonth(), focused.getDate() + step))
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault()
      const n = (e.key === 'PageUp' ? -1 : 1) * (e.shiftKey ? 12 : 1)
      moveFocus(new Date(focused.getFullYear(), focused.getMonth() + n, Math.min(focused.getDate(), 28)))
    }
  }

  // ── Vista anni ─────────────────────────────────────────────────────────
  const yearPageStart = month.getFullYear() - (month.getFullYear() % 12)
  if (view === 'years') {
    const years = Array.from({ length: 12 }, (_, i) => yearPageStart + i)
    const yearOk = (y) => (!minD || y >= minD.getFullYear()) && (!maxD || y <= maxD.getFullYear())
    return (
      <div className={`tst-cal ${className}`}>
        <div className="tst-cal__caption">
          <NavButton icon={LEFT} label="Anni precedenti" disabled={!yearOk(yearPageStart - 1)} onClick={() => setMonth(new Date(yearPageStart - 12, month.getMonth(), 1))} />
          <button type="button" className="tst-cal__title" onClick={() => setView('days')}>
            {yearPageStart} – {yearPageStart + 11}
          </button>
          <NavButton icon={RIGHT} label="Anni successivi" disabled={!yearOk(yearPageStart + 12)} onClick={() => setMonth(new Date(yearPageStart + 12, month.getMonth(), 1))} />
        </div>
        <div className="tst-cal__years">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              disabled={!yearOk(y)}
              className={`tst-cal__year${y === month.getFullYear() ? ' is-current' : ''}${selected && y === selected.getFullYear() ? ' is-selected' : ''}`}
              onClick={() => {
                let m = new Date(y, month.getMonth(), 1)
                if (minD && m < startOfMonth(minD)) m = startOfMonth(minD)
                if (maxD && m > maxD) m = startOfMonth(maxD)
                setMonth(m)
                setView('days')
              }}
            >
              {y}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Vista giorni ───────────────────────────────────────────────────────
  return (
    <div className={`tst-cal ${className}`}>
      <div className="tst-cal__caption">
        <div className="tst-cal__nav-group">
          {enableYearNavigation && (
            <NavButton icon={LEFT2} label="Anno precedente" disabled={!canPrev(12)} onClick={() => setMonth(addMonths(month, -12))} />
          )}
          <NavButton icon={LEFT} label="Mese precedente" disabled={!canPrev(1)} onClick={() => setMonth(addMonths(month, -1))} />
        </div>
        <button type="button" className="tst-cal__title" aria-live="polite" title="Scegli l'anno" onClick={() => setView('years')}>
          {title}
        </button>
        <div className="tst-cal__nav-group">
          <NavButton icon={RIGHT} label="Mese successivo" disabled={!canNext(1)} onClick={() => setMonth(addMonths(month, 1))} />
          {enableYearNavigation && (
            <NavButton icon={RIGHT2} label="Anno successivo" disabled={!canNext(12)} onClick={() => setMonth(addMonths(month, 12))} />
          )}
        </div>
      </div>

      <table className="tst-cal__table" role="grid" aria-label={title} ref={gridRef} onKeyDown={onKeyDown}>
        <thead>
          <tr>
            {weekdays.map((w, i) => (
              <th key={w} scope="col" abbr={weekdaysLong[i]} className="tst-cal__head">{w}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={toIso(week[0])}>
              {week.map((d) => {
                const outside = d.getMonth() !== month.getMonth()
                const disabled = isDisabled(d)
                const isSel = sameDay(d, selected)
                const isToday = sameDay(d, today)
                const cls = ['tst-cal__day', outside && 'is-outside', isSel && 'is-selected', isToday && 'is-today'].filter(Boolean).join(' ')
                return (
                  <td key={toIso(d)} className="tst-cal__cell">
                    <button
                      type="button"
                      className={cls}
                      data-day={toIso(d)}
                      disabled={disabled}
                      aria-selected={isSel || undefined}
                      aria-current={isToday ? 'date' : undefined}
                      tabIndex={sameDay(d, tabDay) ? 0 : -1}
                      onFocus={() => setFocused(d)}
                      onClick={() => {
                        setFocused(d)
                        onChange?.(toIso(d))
                      }}
                    >
                      {d.getDate()}
                      {isToday && <span className="tst-cal__today" aria-hidden="true" />}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * DateField — campo che apre il Calendar in un popover.
 * Sostituisce <input type="date">: stesso `value` 'YYYY-MM-DD', e `onChange`
 * riceve un oggetto { target: { value } } come un evento di input.
 */
const isoToText = (iso) => {
  const d = fromIso(iso)
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : ''
}
/** Solo cifre → 'gg/mm/aaaa' mentre si scrive. */
const maskDate = (raw) => {
  const digits = String(raw).replace(/\D/g, '').slice(0, 8)
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/')
}
/** 'gg/mm/aaaa' completo e reale → 'YYYY-MM-DD', altrimenti ''. */
const textToIso = (text) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!m) return ''
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  const real = d.getFullYear() === Number(m[3]) && d.getMonth() === Number(m[2]) - 1 && d.getDate() === Number(m[1])
  return real ? toIso(d) : ''
}

/**
 * Campo data: si scrive a mano (gg/mm/aaaa, le barre si inseriscono da sole)
 * oppure si apre il calendario dal pulsante a destra.
 */
export function DateField({ value = '', onChange, placeholder = 'Scegli una data', min, max, enableYearNavigation = true, defaultMonth, disabled, id, locale = 'it-IT' }) {
  const [open, setOpen] = useState(false)
  // Testo in corso di scrittura; null = mostra la data salvata.
  const [draft, setDraft] = useState(null)
  const rootRef = useRef(null)
  const btnRef = useRef(null)
  const text = draft ?? isoToText(value)
  const minD = fromIso(min)
  const maxD = fromIso(max)
  const isComplete = text.length === 10
  const typedIso = textToIso(text)
  const typedDate = fromIso(typedIso)
  const outOfRange = Boolean(typedDate && ((minD && typedDate < minD) || (maxD && typedDate > maxD)))
  const invalid = draft !== null && isComplete && (!typedIso || outOfRange)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false) }
    const onEsc = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const emit = (iso) => onChange?.({ target: { value: iso } })

  const handleType = (event) => {
    const next = maskDate(event.target.value)
    const iso = textToIso(next)
    const date = fromIso(iso)
    const ok = Boolean(date) && !(minD && date < minD) && !(maxD && date > maxD)
    if (ok) {
      setDraft(null)
      if (iso !== value) emit(iso)
      return
    }
    setDraft(next)
    if (value) emit('')
  }

  return (
    <div className="tst-datefield" ref={rootRef}>
      <div className={`tst-datefield__control${invalid ? ' is-invalid' : ''}`}>
        <input
          id={id}
          type="text"
          className="tst-datefield__input"
          inputMode="numeric"
          autoComplete="off"
          placeholder="gg/mm/aaaa"
          aria-label={`${placeholder} (giorno, mese, anno)`}
          aria-invalid={invalid || undefined}
          maxLength={10}
          value={text}
          disabled={disabled}
          onChange={handleType}
        />
        <button
          ref={btnRef}
          type="button"
          className="tst-datefield__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label="Apri il calendario"
          title="Apri il calendario"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="tst-datefield__icon">
            <path fill="currentColor" d="M9 1v2h6V1h2v2h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2zm11 10H4v8h16v-8zM7 5H4v4h16V5h-3v2h-2V5H9v2H7V5z" />
          </svg>
        </button>
      </div>
      <p className={`tst-datefield__hint${invalid ? ' is-invalid' : ''}`} aria-live="polite">
        {invalid ? 'Data non valida: controlla giorno, mese e anno.' : 'Scrivi la data oppure aprila dal calendario.'}
      </p>
      {open && (
        <div className="tst-datefield__popover" role="dialog" aria-label={placeholder}>
          <Calendar
            value={value}
            min={min}
            max={max}
            locale={locale}
            defaultMonth={defaultMonth}
            enableYearNavigation={enableYearNavigation}
            autoFocus
            onChange={(v) => {
              setDraft(null)
              emit(v)
              setOpen(false)
              btnRef.current?.focus()
            }}
          />
        </div>
      )}
    </div>
  )
}

export default Calendar
