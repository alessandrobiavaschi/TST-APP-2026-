#!/usr/bin/env node
/**
 * Riesporta `public/SFONDO-LANDING.mp4` con bitrate/CRF più alti (meno macroblocchi a schermo intero).
 * Richiede ffmpeg (es. brew install ffmpeg). Salva il file precedente come `.bak` accanto all'MP4.
 *
 *   npm run media:landing-hq
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pub = path.resolve(__dirname, '..', 'public')
const loopPath = path.join(pub, 'SFONDO-LANDING.mp4')
const backupPath = `${loopPath}.bak`

function resolveFfmpegBin() {
  const envPath = process.env.FFMPEG_PATH?.trim()
  if (envPath) {
    if (!fs.existsSync(envPath)) {
      console.error(`FFMPEG_PATH non trovato: ${envPath}`)
      process.exit(1)
    }
    return envPath
  }
  const probe = spawnSync('ffmpeg', ['-hide_banner', '-version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (probe.status === 0) return 'ffmpeg'
  console.error('Installa ffmpeg (brew install ffmpeg) oppure imposta FFMPEG_PATH.')
  process.exit(1)
}

if (!fs.existsSync(loopPath)) {
  console.error(`Manca: ${loopPath}`)
  process.exit(1)
}

const ffmpegPath = resolveFfmpegBin()
const tmp = `${loopPath}.hq.tmp.mp4`

console.log('Backup →', path.basename(backupPath))
fs.copyFileSync(loopPath, backupPath)

/* Non ingrandisce sorgenti piccole; riduce solo se >2560px larghezza. Lanczos = downscale più pulito. */
const vf = "scale='min(2560,iw)':-2:flags=lanczos"

const r = spawnSync(
  ffmpegPath,
  [
    '-y',
    '-i',
    loopPath,
    '-movflags',
    '+faststart',
    '-pix_fmt',
    'yuv420p',
    '-vf',
    vf,
    '-an',
    '-c:v',
    'libx264',
    '-crf',
    '17',
    '-preset',
    'slow',
    tmp,
  ],
  { stdio: 'inherit' },
)

if (r.status !== 0 || r.error) {
  console.error('ffmpeg fallito. Ripristina da .bak se serve.')
  try {
    fs.unlinkSync(tmp)
  } catch {
    // ignore
  }
  process.exit(1)
}

fs.renameSync(tmp, loopPath)
console.log('OK:', loopPath)
console.log('Se non ti serve il backup:', backupPath)
