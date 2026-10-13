import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildChunkRecoveryUrl,
  CHUNK_RELOAD_COOLDOWN_MS,
  isRecoverableChunkLoadError,
  shouldRetryChunkLoad,
} from '../src/utils/chunkLoadRecovery.js'

test('riconosce gli errori di chunk dinamico dei browser principali', () => {
  const messages = [
    'Failed to fetch dynamically imported module: https://example.test/assets/Report.js',
    'Importing a module script failed.',
    'error loading dynamically imported module',
    'ChunkLoadError: Loading chunk 42 failed.',
  ]

  messages.forEach((message) => {
    assert.equal(isRecoverableChunkLoadError(new Error(message)), true, message)
  })
})

test('non ricarica automaticamente gli errori applicativi ordinari', () => {
  assert.equal(isRecoverableChunkLoadError(new TypeError('Cannot read properties of null')), false)
})

test('il recupero conserva percorso, query e hash aggiungendo il cache buster', () => {
  assert.equal(
    buildChunkRecoveryUrl('https://example.test/risultati/report?view=full#galassia', 123),
    'https://example.test/risultati/report?view=full&__tst_reload=123#galassia',
  )
})

test('il cooldown impedisce loop di reload ma consente un tentativo successivo', () => {
  const now = 100_000
  assert.equal(shouldRetryChunkLoad(null, now), true)
  assert.equal(shouldRetryChunkLoad(String(now - 1_000), now), false)
  assert.equal(shouldRetryChunkLoad(String(now - CHUNK_RELOAD_COOLDOWN_MS), now), true)
})
