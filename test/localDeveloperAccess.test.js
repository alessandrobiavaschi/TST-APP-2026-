import test from 'node:test'
import assert from 'node:assert/strict'

import {
  clearLocalDeveloperSession,
  createLocalDeveloperUser,
  isLocalDeveloperAccessAvailable,
  isLoopbackHostname,
  restoreLocalDeveloperSession,
  startLocalDeveloperSession,
} from '../src/localDeveloperAccess.js'

function createMemoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

test('local developer access is limited to dev mode on loopback hosts', () => {
  assert.equal(isLoopbackHostname('localhost'), true)
  assert.equal(isLoopbackHostname('127.0.0.1'), true)
  assert.equal(isLoopbackHostname('::1'), true)
  assert.equal(isLoopbackHostname('192.168.1.20'), false)
  assert.equal(isLocalDeveloperAccessAvailable({ isDev: true, hostname: '127.0.0.1' }), true)
  assert.equal(isLocalDeveloperAccessAvailable({ isDev: false, hostname: '127.0.0.1' }), false)
  assert.equal(isLocalDeveloperAccessAvailable({ isDev: true, hostname: 'tst.example' }), false)
})

test('local developer session can be restored and cleared', () => {
  const storage = createMemoryStorage()
  assert.equal(restoreLocalDeveloperSession({ storage, available: true }), null)

  const user = startLocalDeveloperSession({ storage, available: true })
  assert.deepEqual(user, createLocalDeveloperUser())
  assert.equal(restoreLocalDeveloperSession({ storage, available: true })?.uid, 'local-developer')

  clearLocalDeveloperSession({ storage })
  assert.equal(restoreLocalDeveloperSession({ storage, available: true }), null)
})

test('local developer session cannot start outside the allowed environment', () => {
  assert.throws(
    () => startLocalDeveloperSession({ storage: createMemoryStorage(), available: false }),
    /solo sul server locale/,
  )
})

