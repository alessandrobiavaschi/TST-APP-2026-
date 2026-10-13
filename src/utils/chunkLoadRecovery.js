const CHUNK_ERROR_FRAGMENTS = [
  'failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'importing a module script failed',
  'chunkloaderror',
  'loading chunk',
]

export const CHUNK_RELOAD_STORAGE_KEY = 'tst_chunk_reload_attempt_v1'
export const CHUNK_RELOAD_COOLDOWN_MS = 30_000

export function isRecoverableChunkLoadError(error) {
  const message = [error?.name, error?.message, String(error || '')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return CHUNK_ERROR_FRAGMENTS.some((fragment) => message.includes(fragment))
}

export function buildChunkRecoveryUrl(href, timestamp = Date.now()) {
  const url = new URL(href)
  url.searchParams.set('__tst_reload', String(timestamp))
  return url.toString()
}

export function shouldRetryChunkLoad(lastAttempt, now = Date.now()) {
  const previous = Number(lastAttempt)
  return !Number.isFinite(previous) || previous <= 0 || now - previous >= CHUNK_RELOAD_COOLDOWN_MS
}
