import React, { useMemo } from 'react'
import { useSkyTheme } from '../SkyThemeContext.jsx'
import { useUiSounds } from '../UiSoundProvider.jsx'

const SPEED_OPTIONS = [
  { value: 0.5, label: '0,5× (più lento)' },
  { value: 1, label: '1× (normale)' },
  { value: 2, label: '2× (più veloce)' },
  { value: 4, label: '4× (molto veloce)' },
]

const WEATHER_FREQUENCY_OPTIONS = [
  { value: 5, label: 'Ogni 5 minuti' },
  { value: 15, label: 'Ogni 15 minuti' },
  { value: 30, label: 'Ogni 30 minuti' },
  { value: 60, label: 'Ogni ora' },
]

const WEATHER_LABELS = {
  sereno: 'Sereno',
  nuvoloso: 'Nuvoloso',
  caldissimo: 'Caldo intenso',
  neve: 'Neve',
}

const TIME_OF_DAY_LABELS = {
  morning: 'Mattina',
  afternoon: 'Pomeriggio',
  sunset: 'Tramonto',
  twilight: 'Crepuscolo',
  night: 'Notte',
}

function SkySettingsPanel() {
  const sky = useSkyTheme()
  const { playLightSwitchTap, playSoftTap } = useUiSounds()

  const {
    config,
    setSpeedFactor,
    setWeatherChangeMinutes,
    setAllowedWeathers,
    setAllowedTimesOfDay,
    setStaticMode,
    forceRandomWeatherChange,
  } = sky || {}

  const activeSpeed = config?.speedFactor ?? 1
  const activeFrequency = config?.weatherChangeMinutes ?? 15
  const activeWeather = config?.allowedWeathers ?? []
  const activeTimes = config?.allowedTimesOfDay ?? []
  const staticMode = config?.staticMode ?? false

  const isReady = useMemo(() => Boolean(sky && config), [sky, config])

  const handleChangeBackgroundNow = () => {
    if (!forceRandomWeatherChange) return
    if (playLightSwitchTap) {
      playLightSwitchTap()
    } else if (playSoftTap) {
      playSoftTap()
    }
    forceRandomWeatherChange({ scheduleAfterMs: 60_000 })
  }

  if (!isReady) {
    return (
      <div className="sky-settings-panel">
        <p className="sky-settings-helper">
          Le impostazioni visive saranno disponibili quando il tema cielo dinamico sarà attivo.
        </p>
      </div>
    )
  }

  const handleSpeedChange = (event) => {
    const nextValue = Number(event.target.value)
    if (Number.isNaN(nextValue)) return
    setSpeedFactor(nextValue)
  }

  const handleFrequencyChange = (event) => {
    const nextValue = Number(event.target.value)
    if (Number.isNaN(nextValue)) return
    setWeatherChangeMinutes(nextValue)
  }

  const handleWeatherToggle = (weatherKey) => () => {
    if (!setAllowedWeathers) return
    const nextWeather = activeWeather.includes(weatherKey)
      ? activeWeather.filter((key) => key !== weatherKey)
      : [...activeWeather, weatherKey]
    setAllowedWeathers(nextWeather)
  }

  const handleTimeToggle = (timeKey) => () => {
    if (!setAllowedTimesOfDay) return
    const nextTimes = activeTimes.includes(timeKey)
      ? activeTimes.filter((key) => key !== timeKey)
      : [...activeTimes, timeKey]
    setAllowedTimesOfDay(nextTimes)
  }

  const handleStaticModeChange = (event) => {
    setStaticMode(event.target.checked)
  }

  return (
    <div className="sky-settings-panel">
      <div className="sky-settings-quick-actions">
        <button
          type="button"
          className="btn btn-secondary sky-settings-change-background-button"
          onClick={handleChangeBackgroundNow}
        >
          Cambia sfondo
        </button>
      </div>
      <p className="sky-settings-intro">
        Personalizza il cielo dinamico che fa da sfondo all’app. Le tue scelte vengono salvate e
        riapplicate automaticamente alle prossime sessioni.
      </p>

      <div className="sky-settings-grid">
        <section className="sky-settings-section">
          <h3 className="sky-settings-section-title">Ciclo giorno / notte</h3>
          <label className="sky-settings-field">
            <span className="sky-settings-label">Velocità del ciclo</span>
            <select
              className="sky-settings-select"
              value={String(activeSpeed)}
              onChange={handleSpeedChange}
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="sky-settings-fieldset">
            <legend className="sky-settings-label">Fasce orarie visibili</legend>
            <div className="sky-settings-chips">
              {Object.entries(TIME_OF_DAY_LABELS).map(([key, label]) => {
                const isActive = activeTimes.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    className={`sky-chip ${isActive ? 'sky-chip--active' : ''}`}
                    onClick={handleTimeToggle(key)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        </section>

        <section className="sky-settings-section">
          <h3 className="sky-settings-section-title">Meteo</h3>
          <label className="sky-settings-field">
            <span className="sky-settings-label">Frequenza cambio meteo</span>
            <select
              className="sky-settings-select"
              value={String(activeFrequency)}
              onChange={handleFrequencyChange}
            >
              {WEATHER_FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="sky-settings-fieldset">
            <legend className="sky-settings-label">Tipi di meteo consentiti</legend>
            <div className="sky-settings-checkboxes">
              {Object.entries(WEATHER_LABELS).map(([key, label]) => {
                const isChecked = activeWeather.includes(key)
                return (
                  <label key={key} className="sky-settings-checkbox">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleWeatherToggle(key)}
                    />
                    <span>{label}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        </section>

        <section className="sky-settings-section">
          <h3 className="sky-settings-section-title">Accessibilità</h3>
          <label className="sky-settings-checkbox sky-settings-field">
            <input type="checkbox" checked={staticMode} onChange={handleStaticModeChange} />
            <span>Modalità statica (disattiva il video e usa uno sfondo più leggero)</span>
          </label>
          <p className="sky-settings-helper">
            Attiva questa opzione se preferisci uno sfondo meno animato o se stai usando una
            connessione lenta.
          </p>
        </section>
      </div>
    </div>
  )
}

export default SkySettingsPanel
