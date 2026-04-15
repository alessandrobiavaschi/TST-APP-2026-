#!/usr/bin/env node
/**
 * Comprime gli asset in public/ (Netlify / GitHub leggeri).
 * Richiede ffmpeg sul PATH (macOS: brew install ffmpeg) oppure FFMPEG_PATH assoluto al binario.
 *
 *   npm run optimize:media
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pub = path.resolve(__dirname, '..', 'public')

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
  console.error(
    'ffmpeg non trovato. Installa ffmpeg (es. brew install ffmpeg) oppure imposta la variabile FFMPEG_PATH.',
  )
  process.exit(1)
}

const ffmpegPath = resolveFfmpegBin()

function runFfmpeg(args, label) {
  const r = spawnSync(ffmpegPath, args, { stdio: 'inherit' })
  if (r.error) throw r.error
  if (r.status !== 0) throw new Error(`ffmpeg fallito: ${label}`)
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else acc.push(p)
  }
  return acc
}

function reencodeMp4(absPath, crf, maxW) {
  const vf = `scale='min(${maxW},iw)':-2`
  const tmp = `${absPath}.opt.tmp.mp4`
  runFfmpeg(
    [
      '-y',
      '-i',
      absPath,
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
      String(crf),
      '-preset',
      'medium',
      tmp,
    ],
    absPath,
  )
  fs.renameSync(tmp, absPath)
}

console.log('ffmpeg:', ffmpegPath)

const gifPath = path.join(pub, 'SFONDO LANDING.GIF')
const loopOut = path.join(pub, 'SFONDO-LANDING.mp4')
const posterOut = path.join(pub, 'SFONDO-LANDING-poster.webp')

if (fs.existsSync(gifPath)) {
  console.log('\n[1/3] SFONDO LANDING.GIF → WebP poster + MP4…')
  runFfmpeg(
    [
      '-y',
      '-i',
      gifPath,
      '-vframes',
      '1',
      '-vf',
      "scale='min(1280,iw)':-2",
      '-c:v',
      'libwebp',
      '-quality',
      '82',
      posterOut,
    ],
    'poster da GIF',
  )
  runFfmpeg(
    [
      '-y',
      '-i',
      gifPath,
      '-movflags',
      '+faststart',
      '-pix_fmt',
      'yuv420p',
      '-vf',
      "scale='min(1920,iw)':-2:flags=lanczos",
      '-an',
      '-c:v',
      'libx264',
      '-crf',
      '20',
      '-preset',
      'slow',
      loopOut,
    ],
    'gif→mp4',
  )
  fs.unlinkSync(gifPath)
  console.log('   Rimosso SFONDO LANDING.GIF')
} else {
  console.log('\n[1/3] Salto GIF (assente).')
}

const skyDir = path.join(pub, 'Video Background')
const skyMp4s = walk(skyDir).filter((p) => p.toLowerCase().endsWith('.mp4'))
if (skyMp4s.length) {
  console.log(`\n[2/3] Video cielo: ${skyMp4s.length} file (max 960px, crf 30)…`)
  for (const p of skyMp4s) {
    console.log('   ', path.relative(pub, p))
    reencodeMp4(p, 30, 960)
  }
} else {
  console.log('\n[2/3] Nessun video in Video Background.')
}

const flowerDir = path.join(pub, 'ANIMAZIONE FIORI')
const flowerMp4s = walk(flowerDir).filter((p) => p.toLowerCase().endsWith('.mp4'))
if (flowerMp4s.length) {
  console.log(`\n[3/3] Fiori: ${flowerMp4s.length} file (max 720px, crf 32)…`)
  for (const p of flowerMp4s) {
    console.log('   ', path.relative(pub, p))
    reencodeMp4(p, 32, 720)
  }
} else {
  console.log('\n[3/3] Nessun MP4 in ANIMAZIONE FIORI.')
}

const flowerPngs = walk(flowerDir).filter((p) => p.toLowerCase().endsWith('.png'))
if (flowerPngs.length) {
  console.log(`\n[4/5] PNG fiori (oxipng): ${flowerPngs.length} file…`)
  const r = spawnSync(
    'npx',
    ['--yes', 'oxipng', '-o', '4', '--strip', ...flowerPngs],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..'), shell: process.platform === 'win32' },
  )
  if (r.status !== 0) {
    console.warn('   oxipng non riuscito (opzionale). Installa o usa: npx oxipng …')
  }
}

const logosDir = path.join(pub, 'logos')
const logoSvgs = walk(logosDir).filter((p) => p.toLowerCase().endsWith('.svg'))
if (logoSvgs.length) {
  console.log(`\n[5/5] SVG loghi (svgo): ${logoSvgs.length} file…`)
  const r = spawnSync(
    'npx',
    ['--yes', 'svgo', '--multipass', '-f', logosDir, '-r'],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..'), shell: process.platform === 'win32' },
  )
  if (r.status !== 0) {
    console.warn('   svgo non riuscito (opzionale).')
  }
}

console.log('\nFatto. Verifica: du -sh public && npm run build')
