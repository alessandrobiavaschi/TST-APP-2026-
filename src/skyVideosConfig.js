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

// Foto 4K d'autore online (CDN gratuita Unsplash ad altissima risoluzione).
// Caricamento istantaneo (WebP ~300KB), zero consumo repository/hosting, massima resa cromatica.
const P_MATTINO_SERENO = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=80'
const P_MATTINO_NUVOLOSO = 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=2560&q=80'
const P_MATTINO_CALDO = 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=2560&q=80'
const P_MATTINO_NEVE = 'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&w=2560&q=80'

const P_POMERIGGIO_SERENO = 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?auto=format&fit=crop&w=2560&q=80'
const P_POMERIGGIO_NUVOLOSO = 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2560&q=80'
const P_POMERIGGIO_CALDO = 'https://images.unsplash.com/photo-1562155955-1cb2d73488d7?auto=format&fit=crop&w=2560&q=80'
const P_POMERIGGIO_NEVE = 'https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=2560&q=80'

const P_TRAMONTO_SERENO = 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=2560&q=80'
const P_TRAMONTO_NUVOLOSO = 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&w=2560&q=80'
const P_TRAMONTO_CALDO = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=2560&q=80'
const P_TRAMONTO_NEVE = 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=2560&q=80'

const P_CREPUSCOLO_SERENO = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2560&q=80'
const P_CREPUSCOLO_NUVOLOSO = 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=2560&q=80'
const P_CREPUSCOLO_CALDO = 'https://images.unsplash.com/photo-1513069020900-a162c4db0762?auto=format&fit=crop&w=2560&q=80'
const P_CREPUSCOLO_NEVE = 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?auto=format&fit=crop&w=2560&q=80'

const P_NOTTE_SERENA = 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2560&q=80'
const P_NOTTE_NUVOLOSA = 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=2560&q=80'
const P_NOTTE_CALDA = 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=2560&q=80'
const P_NOTTE_NEVE = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2560&q=80'

// Foto 4K per landing, report e home (nebulosa cosmica contemplativa)
export const LANDING_ONLINE_PHOTO = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2560&q=80'

// Mappatura timeOfDay + weather → video + photo (sereno = predilezione sole)
// Ogni entry include anche un profilo visivo/emotivo per l'armocromia:
// - tone:         'light' | 'medium' | 'dark'     → luminosità percepita
// - warmth:       'cool' | 'neutral' | 'warm'     → tinta emotiva dominante
// - intensity:    'soft' | 'normal' | 'rich'      → quanta "energia" visiva si percepisce
// - playbackRate: number (opzionale, es. 0.15)   → velocità di riproduzione (default: 0.5)
export const SKY_VIDEOS = {
  morning: {
    sereno:     { src: V_MATTINO_PASTELLO, imageUrl: P_MATTINO_SERENO, tone: 'light', warmth: 'neutral', intensity: 'soft' },
    nuvoloso:   { src: V_CUMULI_AZZURRI, imageUrl: P_MATTINO_NUVOLOSO, tone: 'light', warmth: 'cool', intensity: 'soft' },
    caldissimo: { src: V_NUVOLE_CALDE, imageUrl: P_MATTINO_CALDO, tone: 'medium', warmth: 'warm', intensity: 'normal' },
    neve:       { src: V_NEVOSO, imageUrl: P_MATTINO_NEVE, tone: 'light', warmth: 'cool', intensity: 'soft' },
  },

  afternoon: {
    sereno:     { src: V_CUMULI_APERTI, imageUrl: P_POMERIGGIO_SERENO, tone: 'medium', warmth: 'neutral', intensity: 'normal' },
    nuvoloso:   { src: V_CUMULI_AZZURRI, imageUrl: P_POMERIGGIO_NUVOLOSO, tone: 'medium', warmth: 'cool', intensity: 'normal' },
    caldissimo: { src: V_NUVOLE_CALDE, imageUrl: P_POMERIGGIO_CALDO, tone: 'medium', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, imageUrl: P_POMERIGGIO_NEVE, tone: 'light', warmth: 'cool', intensity: 'soft' },
  },

  sunset: {
    sereno:     { src: V_TARDO_POMERIGGIO_LIEVE, imageUrl: P_TRAMONTO_SERENO, tone: 'medium', warmth: 'warm', intensity: 'rich' },
    nuvoloso:   { src: V_TRAMONTO_DORATO, imageUrl: P_TRAMONTO_NUVOLOSO, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    caldissimo: { src: V_TRAMONTO_ROSSO, imageUrl: P_TRAMONTO_CALDO, tone: 'medium', warmth: 'warm', intensity: 'normal' },
    neve:       { src: V_NEVOSO, imageUrl: P_TRAMONTO_NEVE, tone: 'medium', warmth: 'cool', intensity: 'normal' },
  },

  twilight: {
    sereno:     { src: V_TRAMONTO_DORATO, imageUrl: P_CREPUSCOLO_SERENO, tone: 'medium', warmth: 'neutral', intensity: 'normal' },
    nuvoloso:   { src: V_TRAMONTO_ROSSO, imageUrl: P_CREPUSCOLO_NUVOLOSO, tone: 'dark', warmth: 'cool', intensity: 'rich' },
    caldissimo: { src: V_TEMPORALE, imageUrl: P_CREPUSCOLO_CALDO, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, imageUrl: P_CREPUSCOLO_NEVE, tone: 'medium', warmth: 'cool', intensity: 'normal' },
  },

  night: {
    sereno:     { src: V_NOTTE, imageUrl: P_NOTTE_SERENA, tone: 'dark', warmth: 'neutral', intensity: 'soft' },
    nuvoloso:   { src: V_PRIMA_DEL_TEMPORALE, imageUrl: P_NOTTE_NUVOLOSA, tone: 'dark', warmth: 'cool', intensity: 'normal' },
    caldissimo: { src: V_TEMPORALE, imageUrl: P_NOTTE_CALDA, tone: 'dark', warmth: 'warm', intensity: 'rich' },
    neve:       { src: V_NEVOSO, imageUrl: P_NOTTE_NEVE, tone: 'dark', warmth: 'cool', intensity: 'rich' },
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
