import { copyFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

async function main() {
const root = process.cwd()
const sourceDir = path.join(root, 'audio')
const targetDir = path.join(root, 'public', 'audio')
const entries = await readdir(sourceDir, { withFileTypes: true })
const sources = new Map()

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.mp3')) continue
  const match = entry.name.match(/^TST_(\d{2})\b/)
  if (match) sources.set(Number(match[1]), entry.name)
}

const missing = Array.from({ length: 72 }, (_, index) => index + 1).filter(
  (number) => !sources.has(number),
)
if (missing.length) throw new Error(`Audio TST mancanti in audio/: ${missing.join(', ')}`)

await mkdir(targetDir, { recursive: true })
await Promise.all(
  [...sources].map(([number, filename]) =>
    copyFile(path.join(sourceDir, filename), path.join(targetDir, `${number}.mp3`)),
  ),
)

console.log(`Preparati ${sources.size} audio locali in public/audio/.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
