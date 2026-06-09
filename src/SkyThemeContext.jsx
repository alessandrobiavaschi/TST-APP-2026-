/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getSkyVisualProfile } from './skyVideosConfig.js'

const STORAGE_KEY = 'tst_sky_config_v1'

const DEFAULT_CONFIG = {
  speedFactor: 1,
  weatherOptions: ['sereno', 'nuvoloso', 'caldissimo', 'neve'],
  weatherChangeFrequencyMinutes: 15,
  allowedTimes: ['morning', 'afternoon', 'sunset', 'twilight', 'night'],
  staticMode: false,
}

const PRIORITY_SKY_SEQUENCE = ['sereno', 'nuvoloso', 'caldissimo', 'neve']

const SkyThemeContext = createContext(null)

const clampHour = (hour) => {
  if (hour < 0) return 0
  if (hour > 23) return 23
  return hour
}

const computeTimeOfDay = (date) => {
  const hour = clampHour(date.getHours())
  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 20) return 'sunset'
  if (hour >= 20 && hour < 22) return 'twilight'
  return 'night'
}

const pickRandom = (array) => {
  if (!array || array.length === 0) return null
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

const normalizeConfig = (config) => {
  const next = {
    ...DEFAULT_CONFIG,
    ...(config || {}),
  }

  if (Array.isArray(config?.allowedWeathers)) {
    next.weatherOptions = config.allowedWeathers
  }
  if (Array.isArray(config?.allowedTimesOfDay)) {
    next.allowedTimes = config.allowedTimesOfDay
  }
  if (typeof config?.weatherChangeMinutes === 'number') {
    next.weatherChangeFrequencyMinutes = config.weatherChangeMinutes
  }

  return next
}

export function SkyThemeProvider({ children }) {
  const [config, setConfig] = useState(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (!stored) return DEFAULT_CONFIG
      const parsed = JSON.parse(stored)
      return normalizeConfig(parsed)
    } catch {
      return DEFAULT_CONFIG
    }
  })
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const [weather, setWeather] = useState('sereno')
  const [landingSkyOverride, setLandingSkyOverride] = useState(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch (error) {
      console.error('Errore nel salvare la configurazione del cielo:', error)
    }
  }, [config])

  useEffect(() => {
    if (config.staticMode) return undefined

    const updateTimeOfDay = () => {
      const now = new Date()
      let next = computeTimeOfDay(now)
      if (!config.allowedTimes.includes(next)) {
        next = config.allowedTimes[0] || 'morning'
      }
      setTimeOfDay(next)
    }

    updateTimeOfDay()

    const baseIntervalMs = 60_000
    const intervalMs = baseIntervalMs / (config.speedFactor || 1)

    const id = window.setInterval(updateTimeOfDay, intervalMs)
    return () => {
      window.clearInterval(id)
    }
  }, [config.staticMode, config.speedFactor, config.allowedTimes])

  useEffect(() => {
    if (config.staticMode) return undefined

    const updateWeather = () => {
      const options =
        config.weatherOptions && config.weatherOptions.length > 0
          ? config.weatherOptions
          : DEFAULT_CONFIG.weatherOptions
      const next = pickRandom(options) || 'sereno'
      setWeather(next)
    }

    updateWeather()

    const minutes =
      typeof config.weatherChangeFrequencyMinutes === 'number' &&
      config.weatherChangeFrequencyMinutes > 0
        ? config.weatherChangeFrequencyMinutes
        : DEFAULT_CONFIG.weatherChangeFrequencyMinutes

    const intervalMs = (minutes * 60_000) / (config.speedFactor || 1)
    const id = window.setInterval(updateWeather, intervalMs)
    return () => {
      window.clearInterval(id)
    }
  }, [config.staticMode, config.weatherOptions, config.weatherChangeFrequencyMinutes, config.speedFactor])

  const setWeatherChangeFrequencyMinutes = useCallback((minutes) => {
    setConfig((prev) => ({
      ...prev,
      weatherChangeFrequencyMinutes: minutes,
    }))
  }, [])

  const setAllowedWeathers = useCallback((weatherKeys) => {
    setConfig((prev) => ({
      ...prev,
      weatherOptions: weatherKeys && weatherKeys.length > 0 ? weatherKeys : DEFAULT_CONFIG.weatherOptions,
    }))
  }, [])

  const setAllowedTimesOfDay = useCallback((timeKeys) => {
    setConfig((prev) => ({
      ...prev,
      allowedTimes: timeKeys && timeKeys.length > 0 ? timeKeys : DEFAULT_CONFIG.allowedTimes,
    }))
  }, [])

  const forceRandomWeatherChange = useCallback(
    ({ scheduleAfterMs } = {}) => {
      const changeWeather = () => {
        setWeather((currentWeather) => {
          const options =
            config.weatherOptions && config.weatherOptions.length > 0
              ? config.weatherOptions
              : DEFAULT_CONFIG.weatherOptions
          const priorityOptions = PRIORITY_SKY_SEQUENCE.filter((weatherKey) =>
            options.includes(weatherKey),
          )
          const currentPriorityIndex = priorityOptions.indexOf(currentWeather)

          if (currentPriorityIndex >= 0 && currentPriorityIndex < priorityOptions.length - 1) {
            return priorityOptions[currentPriorityIndex + 1]
          }

          const alternatives = options.filter((weatherKey) => weatherKey !== currentWeather)
          return pickRandom(alternatives) || pickRandom(options) || 'sereno'
        })
      }

      changeWeather()

      if (scheduleAfterMs && typeof window !== 'undefined') {
        window.setTimeout(changeWeather, scheduleAfterMs)
      }
    },
    [config.weatherOptions],
  )

  const effectiveTimeOfDay = landingSkyOverride?.timeOfDay || timeOfDay
  const effectiveWeather = landingSkyOverride?.weather || weather
  const visualProfile = getSkyVisualProfile(effectiveTimeOfDay, effectiveWeather)

  const value = useMemo(
    () => ({
      timeOfDay: effectiveTimeOfDay,
      weather: effectiveWeather,
      visualProfile,
      config: {
        ...config,
        allowedWeathers: config.weatherOptions,
        allowedTimesOfDay: config.allowedTimes,
        weatherChangeMinutes: config.weatherChangeFrequencyMinutes,
      },
      setConfig,
      setSpeedFactor: (speedFactor) =>
        setConfig((prev) => ({
          ...prev,
          speedFactor,
        })),
      setWeatherChangeFrequencyMinutes,
      setWeatherChangeMinutes: setWeatherChangeFrequencyMinutes,
      setAllowedWeathers,
      setAllowedTimesOfDay,
      toggleWeatherOption: (weatherKey) =>
        setConfig((prev) => {
          const exists = prev.weatherOptions.includes(weatherKey)
          const nextOptions = exists
            ? prev.weatherOptions.filter((w) => w !== weatherKey)
            : [...prev.weatherOptions, weatherKey]
          return {
            ...prev,
            weatherOptions: nextOptions,
          }
        }),
      toggleTimeOfDay: (timeKey) =>
        setConfig((prev) => {
          const exists = prev.allowedTimes.includes(timeKey)
          let nextAllowed = exists
            ? prev.allowedTimes.filter((t) => t !== timeKey)
            : [...prev.allowedTimes, timeKey]
          if (nextAllowed.length === 0) {
            nextAllowed = [timeKey]
          }
          return {
            ...prev,
            allowedTimes: nextAllowed,
          }
        }),
      setStaticMode: (staticMode) =>
        setConfig((prev) => ({
          ...prev,
          staticMode,
        })),
      setLandingSkyOverride,
      forceRandomWeatherChange,
    }),
    [
      effectiveTimeOfDay,
      effectiveWeather,
      visualProfile,
      config,
      setWeatherChangeFrequencyMinutes,
      setAllowedWeathers,
      setAllowedTimesOfDay,
      forceRandomWeatherChange,
    ],
  )

  return <SkyThemeContext.Provider value={value}>{children}</SkyThemeContext.Provider>
}

export function useSkyTheme() {
  const context = useContext(SkyThemeContext)
  if (!context) {
    console.warn('useSkyTheme deve essere utilizzato all’interno di SkyThemeProvider.')
  }
  return context
}
