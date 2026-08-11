import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { test } from 'node:test'

import { SKY_VIDEOS } from '../src/skyVideosConfig.js'

const NEW_SKY_FILES = [
  '12545533_1920_1080_30fps.mp4',
  '13585267_1920_1080_30fps.mp4',
  '15650369_1920_1080_25fps.mp4',
  '2865145-hd_1920_1080_30fps.mp4',
  '3876270-hd_1920_1080_30fps.mp4',
  '854740-hd_1920_1080_30fps.mp4',
  '855607-hd_1920_1080_30fps.mp4',
]

test('tutti i nuovi cieli sono disponibili e collegati alla configurazione', async () => {
  const configuredSources = new Set(
    Object.values(SKY_VIDEOS).flatMap((period) =>
      Object.values(period).map(({ src }) => src),
    ),
  )

  await Promise.all(
    NEW_SKY_FILES.map(async (fileName) => {
      const src = `/Video Background/${fileName}`
      assert.ok(configuredSources.has(src), `${fileName} non e collegato a SKY_VIDEOS`)
      await access(new URL(`../public${src}`, import.meta.url))
    }),
  )
})

test('il player applica velocita lenta e transizioni morbide a entrambi i layer', async () => {
  const source = await readFile(
    new URL('../src/components/SkyBackground.jsx', import.meta.url),
    'utf8',
  )

  assert.match(source, /const PLAYBACK_RATE = 0\.5/)
  assert.match(source, /videoEl\.defaultPlaybackRate = PLAYBACK_RATE/)
  assert.match(source, /videoEl\.playbackRate = PLAYBACK_RATE/)
  assert.match(source, /const DEFAULT_CROSSFADE_DURATION_MS = 2400/)
  assert.match(source, /const LANDING_CROSSFADE_DURATION_MS = 1600/)
  assert.equal((source.match(/CROSSFADE_EASING/g) || []).length, 3)
})
