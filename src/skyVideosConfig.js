// Configurazione centrale dei video cielo.
// Ogni combinazione timeOfDay+weather punta a un file video presente in /public.
// Tutti i 12 video sono utilizzati; predilezione per clip soleggiate su sereno e fasce diurne.

export const SKY_TIME_OF_DAY = ['morning', 'afternoon', 'sunset', 'twilight', 'night']

export const SKY_WEATHERS = ['sereno', 'nuvoloso', 'caldissimo', 'neve']

// File realmente disponibili in public/Video Background.
const V_SERENO = '/Video Background/Sereno.mp4'
const V_NUVOLOSO = '/Video Background/Nuvoloso.mp4'
const V_TARDO_POMERIGGIO_SERENO = '/Video Background/Tardo pomeriggio, sereno.mp4'
const V_TRAMONTO = '/Video Background/Tramonto.mp4'
const V_NOTTE = '/Video Background/Notte.mp4'
const V_NEVOSO = '/Video Background/Nevoso.mp4'
const V_PRIMA_DEL_TEMPORALE = '/Video Background/Prima del temporale.mp4'
const V_TEMPORALE = '/Video Background/Temporale.mp4'

// Mappatura timeOfDay + weather → video (tutti e 12 i file usati; sereno = predilezione sole)
// Ogni entry include anche un profilo visivo/emotivo per l'armocromia:
// - tone:         'light' | 'medium' | 'dark'     → luminosità percepita
// - warmth:       'cool' | 'neutral' | 'warm'     → tinta emotiva dominante
// - intensity:    'soft' | 'normal' | 'rich'      → quanta "energia" visiva si percepisce
// - playbackRate: number (opzionale, es. 0.15)   → velocità di riproduzione (default: 0.25)
export const SKY_VIDEOS = {
  morning: {
    sereno:     { src: V_SERENO,  tone: 'light',  warmth: 'neutral', intensity: 'soft' },
    nuvoloso:   { src: V_NUVOLOSO, tone: 'light', warmth: 'cool',    intensity: 'soft' },
    caldissimo: { src: V_PRIMA_DEL_TEMPORALE, tone: 'medium', warmth: 'warm', intensity: 'normal' },
    neve:       { src: V_NEVOSO, tone: 'light',   warmth: 'cool',    intensity: 'soft' },
  },

  afternoon: {
    sereno:     { src: V_SERENO, tone: 'medium', warmth: 'neutral', intensity: 'normal' },
    nuvoloso:   { src: V_NUVOLOSO, tone: 'medium', warmth: 'cool',   intensity: 'normal' },
    caldissimo: { src: V_PRIMA_DEL_TEMPORALE, tone: 'medium', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, tone: 'light', warmth: 'cool', intensity: 'soft' },
  },

  sunset: {
    sereno:     { src: V_TARDO_POMERIGGIO_SERENO, tone: 'medium', warmth: 'warm', intensity: 'rich' },   // tardo pomeriggio, sereno
    nuvoloso:   { src: V_TRAMONTO, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    caldissimo: { src: V_TRAMONTO, tone: 'medium', warmth: 'warm', intensity: 'normal' },
    neve:       { src: V_NEVOSO, tone: 'medium', warmth: 'cool', intensity: 'normal' },
  },

  twilight: {
    sereno:     { src: V_TRAMONTO, tone: 'medium', warmth: 'neutral', intensity: 'normal' },
    nuvoloso:   { src: V_NUVOLOSO, tone: 'dark', warmth: 'cool', intensity: 'rich' },
    caldissimo: { src: V_TEMPORALE, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, tone: 'medium', warmth: 'cool', intensity: 'normal' },
  },

  night: {
    sereno:     { src: V_NOTTE, tone: 'dark', warmth: 'neutral', intensity: 'soft' },   // notte serena
    nuvoloso:   { src: V_PRIMA_DEL_TEMPORALE, tone: 'dark', warmth: 'cool', intensity: 'normal' },
    caldissimo: { src: V_TEMPORALE, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, tone: 'dark', warmth: 'cool', intensity: 'rich' },
  },
}

export function getSkyVideo(timeOfDay, weather) {
  const dayGroup = SKY_VIDEOS[timeOfDay]
  if (!dayGroup) return null
  const entry = dayGroup[weather] || dayGroup.sereno
  return entry || null
}

// Profilo visivo/emotivo derivato dal video corrente.
// Usato dal calcolatore armocromatico per adattare colori dei testi e filtri.
export function getSkyVisualProfile(timeOfDay, weather) {
  const entry = getSkyVideo(timeOfDay, weather)
  if (!entry) {
    return {
      tone: 'medium',
      warmth: 'neutral',
      intensity: 'normal',
    }
  }
  const {
    tone = 'medium',
    warmth = 'neutral',
    intensity = 'normal',
  } = entry
  return { tone, warmth, intensity }
}
