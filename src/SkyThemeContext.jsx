import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { getSkyVisualProfile } from './skyVideosConfig.js'

const DEFAULT_CONFIG = {
  // quali meteo sono abilitati
  allowedWeathers: ['sereno', 'nuvoloso', 'caldissimo', 'neve'],
  // moltiplicatore della velocità del ciclo giorno/notte
  speedFactor: 1, // 1x di default
  // ogni quanti minuti reali può cambiare il meteo
  weatherChangeMinutes: 15,
  // fasce orarie consentite per il cielo
  allowedTimesOfDay: ['morning', 'afternoon', 'sunset', 'twilight', 'night'],
  // se true, niente video animato (solo fallback statico)
  staticMode: false,
}

const STORAGE_KEY = 'tst_sky_config_v1'
const PRIORITY_SKY_SEQUENCE = [
  { timeOfDay: 'sunset', weather: 'sereno' }, // 1) tardo pomeriggio, sereno
  { timeOfDay: 'afternoon', weather: 'nuvoloso' }, // 2) variazione netta per feedback immediato
  { timeOfDay: 'night', weather: 'sereno' },  // 3) poi notte
]

const SkyThemeContext = createContext(null)

function getTimeOfDayFromDate(date) {
  const hours = date.getHours()

  if (hours >= 6 && hours < 11) return 'morning'
  if (hours >= 11 && hours < 17) return 'afternoon'
  if (hours >= 17 && hours < 20) return 'sunset'
  if (hours >= 20 || hours < 23) return 'twilight'
  return 'night'
}

function loadStoredConfig() {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
      allowedWeathers:
        Array.isArray(parsed.allowedWeathers) && parsed.allowedWeathers.length > 0
          ? parsed.allowedWeathers
          : DEFAULT_CONFIG.allowedWeathers,
      allowedTimesOfDay:
        Array.isArray(parsed.allowedTimesOfDay) && parsed.allowedTimesOfDay.length > 0
          ? parsed.allowedTimesOfDay
          : DEFAULT_CONFIG.allowedTimesOfDay,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

function persistConfig(config) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    // ignore
  }
}

export function SkyThemeProvider({ children }) {
  const [config, setConfig] = useState(() => loadStoredConfig())
  const [timeOfDay, setTimeOfDay] = useState(() => {
    const initial = PRIORITY_SKY_SEQUENCE[0]?.timeOfDay || 'sunset'
    return initial
  })
  const [weather, setWeather] = useState(() => PRIORITY_SKY_SEQUENCE[0]?.weather || 'sereno')
  const landingOverrideRef = useRef(null)
  const manualSkySequenceStepRef = useRef(0)

  const lastWeatherChangeRef = useRef(Date.now())
  const simulatedClockRef = useRef(Date.now())
  const forceRandomWeatherTimeoutRef = useRef(null)

  useEffect(() => {
    persistConfig(config)
  }, [config])

  useEffect(() => {
    const intervalMs = 60_000 / (config.speedFactor || 1)

    const tick = () => {
      const baseIncrementMinutes = 10
      simulatedClockRef.current += baseIncrementMinutes * 60_000 * (config.speedFactor || 1)

      const simulatedDate = new Date(simulatedClockRef.current)
      let nextTimeOfDay = getTimeOfDayFromDate(simulatedDate)
      if (!config.allowedTimesOfDay.includes(nextTimeOfDay)) {
        nextTimeOfDay = config.allowedTimesOfDay[0] || nextTimeOfDay
      }
      setTimeOfDay(nextTimeOfDay)

      const now = Date.now()
      const elapsedMinutes = (now - lastWeatherChangeRef.current) / 60_000
      const minGap = Math.max(1, config.weatherChangeMinutes || DEFAULT_CONFIG.weatherChangeMinutes)

      if (elapsedMinutes >= minGap) {
        const candidates =
          config.allowedWeathers && config.allowedWeathers.length > 0
            ? config.allowedWeathers
            : DEFAULT_CONFIG.allowedWeathers
        const nextWeather = candidates[Math.floor(Math.random() * candidates.length)]
        setWeather(nextWeather)
        lastWeatherChangeRef.current = now
      }
    }

    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  }, [config.speedFactor, config.weatherChangeMinutes, config.allowedTimesOfDay, config.allowedWeathers])

  useEffect(() => {
    simulatedClockRef.current = Date.now()
    lastWeatherChangeRef.current = Date.now()
  }, [])

  useEffect(
    () => () => {
      if (forceRandomWeatherTimeoutRef.current) {
        window.clearTimeout(forceRandomWeatherTimeoutRef.current)
      }
    },
    [],
  )

  const updateConfig = useCallback((updater) => {
    setConfig((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return { ...prev, ...next }
    })
  }, [])

  const setAllowedWeathers = useCallback((weathers) => {
    updateConfig((prev) => ({
      ...prev,
      allowedWeathers: weathers && weathers.length > 0 ? weathers : DEFAULT_CONFIG.allowedWeathers,
    }))
  }, [updateConfig])

  const setSpeedFactor = useCallback((factor) => {
    const safe = Number.isFinite(factor) && factor > 0 ? factor : 1
    updateConfig((prev) => ({ ...prev, speedFactor: safe }))
  }, [updateConfig])

  const setWeatherChangeMinutes = useCallback((minutes) => {
    const safe = Number.isFinite(minutes) && minutes > 0 ? minutes : DEFAULT_CONFIG.weatherChangeMinutes
    updateConfig((prev) => ({ ...prev, weatherChangeMinutes: safe }))
  }, [updateConfig])

  const setAllowedTimesOfDay = useCallback((times) => {
    updateConfig((prev) => ({
      ...prev,
      allowedTimesOfDay: times && times.length > 0 ? times : DEFAULT_CONFIG.allowedTimesOfDay,
    }))
  }, [updateConfig])

  const setStaticMode = useCallback((value) => {
    updateConfig((prev) => ({ ...prev, staticMode: Boolean(value) }))
  }, [updateConfig])

  const setLandingSkyOverride = useCallback((override) => {
    landingOverrideRef.current = override
    if (override && override.timeOfDay) {
      setTimeOfDay(override.timeOfDay)
    }
    if (override && override.weather) {
      setWeather(override.weather)
    }
  }, [])

  const forceRandomWeatherChange = useCallback(
    (options = {}) => {
      const { scheduleAfterMs } = options

      const sequenceStep = manualSkySequenceStepRef.current
      const sequenceItem = PRIORITY_SKY_SEQUENCE[sequenceStep]
      if (sequenceItem) {
        setTimeOfDay(sequenceItem.timeOfDay)
        setWeather(sequenceItem.weather)
        lastWeatherChangeRef.current = Date.now()
        manualSkySequenceStepRef.current = sequenceStep + 1
      } else {
        const weatherCandidates =
          config.allowedWeathers && config.allowedWeathers.length > 0
            ? config.allowedWeathers
            : DEFAULT_CONFIG.allowedWeathers
        const timeCandidates =
          config.allowedTimesOfDay && config.allowedTimesOfDay.length > 0
            ? config.allowedTimesOfDay
            : DEFAULT_CONFIG.allowedTimesOfDay
        if (!weatherCandidates || weatherCandidates.length === 0) return
        if (!timeCandidates || timeCandidates.length === 0) return

        const maxAttempts = 8
        let nextWeather = weatherCandidates[Math.floor(Math.random() * weatherCandidates.length)]
        let nextTime = timeCandidates[Math.floor(Math.random() * timeCandidates.length)]
        let attempts = 0

        while (
          attempts < maxAttempts &&
          nextWeather === weather &&
          nextTime === timeOfDay &&
          (weatherCandidates.length > 1 || timeCandidates.length > 1)
        ) {
          nextWeather = weatherCandidates[Math.floor(Math.random() * weatherCandidates.length)]
          nextTime = timeCandidates[Math.floor(Math.random() * timeCandidates.length)]
          attempts += 1
        }
        setWeather(nextWeather)
        setTimeOfDay(nextTime)
        lastWeatherChangeRef.current = Date.now()
      }

      if (forceRandomWeatherTimeoutRef.current) {
        window.clearTimeout(forceRandomWeatherTimeoutRef.current)
        forceRandomWeatherTimeoutRef.current = null
      }

      if (typeof scheduleAfterMs === 'number' && scheduleAfterMs > 0) {
        forceRandomWeatherTimeoutRef.current = window.setTimeout(() => {
          const followUpCandidates =
            config.allowedWeathers && config.allowedWeathers.length > 0
              ? config.allowedWeathers
              : DEFAULT_CONFIG.allowedWeathers
          if (!followUpCandidates || followUpCandidates.length === 0) {
            forceRandomWeatherTimeoutRef.current = null
            return
          }
          const followUpIndex = Math.floor(Math.random() * followUpCandidates.length)
          setWeather(followUpCandidates[followUpIndex])
          lastWeatherChangeRef.current = Date.now()
          forceRandomWeatherTimeoutRef.current = null
        }, scheduleAfterMs)
      }
    },
    [config.allowedTimesOfDay, config.allowedWeathers, timeOfDay, weather],
  )

  const value = useMemo(
    () => {
      const visualProfile = getSkyVisualProfile(timeOfDay, weather)
      return {
        timeOfDay,
        weather,
        config,
        visualProfile,
        setConfig: updateConfig,
        setAllowedWeathers,
        setSpeedFactor,
        setWeatherChangeMinutes,
        setAllowedTimesOfDay,
        setStaticMode,
        setLandingSkyOverride,
        forceRandomWeatherChange,
      }
    },
    [
      timeOfDay,
      weather,
      config,
      updateConfig,
      setAllowedWeathers,
      setSpeedFactor,
      setWeatherChangeMinutes,
      setAllowedTimesOfDay,
      setStaticMode,
      setLandingSkyOverride,
      forceRandomWeatherChange,
    ],
  )

  return <SkyThemeContext.Provider value={value}>{children}</SkyThemeContext.Provider>
}

export function useSkyTheme() {
  const ctx = useContext(SkyThemeContext)
  if (!ctx) {
    throw new Error('useSkyTheme deve essere usato dentro SkyThemeProvider')
  }
  return ctx
}

