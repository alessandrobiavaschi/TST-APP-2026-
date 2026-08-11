// Configurazione centrale dei video cielo.
// Ogni combinazione timeOfDay+weather punta a un file video presente in /public.
// Le fasce diurne privilegiano i clip a 25/30 fps per un movimento lento e regolare.

export const SKY_TIME_OF_DAY = ['morning', 'afternoon', 'sunset', 'twilight', 'night']

export const SKY_WEATHERS = ['sereno', 'nuvoloso', 'caldissimo', 'neve']

// File realmente disponibili in public/Video Background.
const V_NOTTE = '/Video Background/Notte.mp4'
const V_NEVOSO = '/Video Background/Nevoso.mp4'
const V_PRIMA_DEL_TEMPORALE = '/Video Background/Prima del temporale.mp4'
const V_TEMPORALE = '/Video Background/Temporale.mp4'
const V_MATTINO_PASTELLO = '/Video Background/855607-hd_1920_1080_30fps.mp4'
const V_CUMULI_AZZURRI = '/Video Background/13585267_1920_1080_30fps.mp4'
const V_CUMULI_APERTI = '/Video Background/2865145-hd_1920_1080_30fps.mp4'
const V_TARDO_POMERIGGIO_LIEVE = '/Video Background/3876270-hd_1920_1080_30fps.mp4'
const V_TRAMONTO_DORATO = '/Video Background/12545533_1920_1080_30fps.mp4'
const V_TRAMONTO_ROSSO = '/Video Background/15650369_1920_1080_25fps.mp4'
const V_NUVOLE_CALDE = '/Video Background/854740-hd_1920_1080_30fps.mp4'

// Mappatura timeOfDay + weather → video (sereno = predilezione sole)
// Ogni entry include anche un profilo visivo/emotivo per l'armocromia:
// - tone:      'light' | 'medium' | 'dark'     → luminosità percepita
// - warmth:    'cool' | 'neutral' | 'warm'     → tinta emotiva dominante
// - intensity: 'soft' | 'normal' | 'rich'      → quanta \"energia\" visiva si percepisce
export const SKY_VIDEOS = {
  morning: {
    sereno:     { src: V_MATTINO_PASTELLO, tone: 'light', warmth: 'neutral', intensity: 'soft' },
    nuvoloso:   { src: V_CUMULI_AZZURRI, tone: 'light', warmth: 'cool', intensity: 'soft' },
    caldissimo: { src: V_NUVOLE_CALDE, tone: 'medium', warmth: 'warm', intensity: 'normal' },
    neve:       { src: V_NEVOSO, tone: 'light',   warmth: 'cool',    intensity: 'soft' },
  },

  afternoon: {
    sereno:     { src: V_CUMULI_APERTI, tone: 'medium', warmth: 'neutral', intensity: 'normal' },
    nuvoloso:   { src: V_CUMULI_AZZURRI, tone: 'medium', warmth: 'cool', intensity: 'normal' },
    caldissimo: { src: V_NUVOLE_CALDE, tone: 'medium', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, tone: 'light', warmth: 'cool', intensity: 'soft' },
  },

  sunset: {
    sereno:     { src: V_TARDO_POMERIGGIO_LIEVE, tone: 'medium', warmth: 'warm', intensity: 'rich' },
    nuvoloso:   { src: V_TRAMONTO_DORATO, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    caldissimo: { src: V_TRAMONTO_ROSSO, tone: 'medium', warmth: 'warm', intensity: 'normal' },
    neve:       { src: V_NEVOSO, tone: 'medium', warmth: 'cool', intensity: 'normal' },
  },

  twilight: {
    sereno:     { src: V_TRAMONTO_DORATO, tone: 'medium', warmth: 'neutral', intensity: 'normal' },
    nuvoloso:   { src: V_TRAMONTO_ROSSO, tone: 'dark', warmth: 'cool', intensity: 'rich' },
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
