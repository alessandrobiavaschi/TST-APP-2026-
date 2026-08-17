const LOCAL_DEVELOPER_SESSION_KEY = 'tst_local_developer_session_v1'

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1'])

export function isLoopbackHostname(hostname) {
  return LOOPBACK_HOSTNAMES.has(String(hostname || '').trim().toLowerCase())
}
export function isLocalDeveloperAccessAvailable({
  isDev = Boolean(import.meta.env?.DEV),
  hostname = globalThis.location?.hostname || '',
} = {}) {
  return Boolean(isDev) && isLoopbackHostname(hostname)
}

export function createLocalDeveloperUser() {
  return {
    uid: 'local-developer',
    email: 'sviluppo@tst.local',
    displayName: 'Sviluppo TST',
    emailVerified: true,
    isAnonymous: false,
    providerData: [],
    __tstLocalDeveloper: true,
  }
}

export function restoreLocalDeveloperSession({
  storage = globalThis.sessionStorage,
  available = isLocalDeveloperAccessAvailable(),
} = {}) {
  if (!available || !storage) return null
  try {
    return storage.getItem(LOCAL_DEVELOPER_SESSION_KEY) === '1'
      ? createLocalDeveloperUser()
      : null
  } catch {
    return null
  }
}

export function startLocalDeveloperSession({
  storage = globalThis.sessionStorage,
  available = isLocalDeveloperAccessAvailable(),
} = {}) {
  if (!available) {
    throw new Error('Accesso sviluppo disponibile solo sul server locale.')
  }
  try {
    storage?.setItem(LOCAL_DEVELOPER_SESSION_KEY, '1')
  } catch {
    // La sessione resta comunque valida per la scheda corrente.
  }
  return createLocalDeveloperUser()
}

export function clearLocalDeveloperSession({ storage = globalThis.sessionStorage } = {}) {
  try {
    storage?.removeItem(LOCAL_DEVELOPER_SESSION_KEY)
  } catch {
    // Nessuna azione necessaria se lo storage non e disponibile.
  }
}
