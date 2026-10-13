import test from 'node:test'
import assert from 'node:assert/strict'
import { getFocusableElements, FOCUSABLE_SELECTOR } from '../src/hooks/useDialogFocus.js'

test('getFocusableElements restituisce array vuoto per elementi null o senza querySelectorAll', () => {
  assert.deepEqual(getFocusableElements(null), [])
  assert.deepEqual(getFocusableElements(undefined), [])
  assert.deepEqual(getFocusableElements({}), [])
})

test('getFocusableElements interroga il selettore FOCUSABLE_SELECTOR ed esclude elementi inert', () => {
  const el1 = { closest: () => null }
  const el2 = { closest: (sel) => (sel === '[inert]' ? {} : null) }
  const el3 = { closest: () => null }

  let passedSelector = ''
  const mockContainer = {
    querySelectorAll: (selector) => {
      passedSelector = selector
      return [el1, el2, el3]
    },
  }

  const result = getFocusableElements(mockContainer)
  assert.equal(passedSelector, FOCUSABLE_SELECTOR)
  assert.equal(result.length, 2)
  assert.equal(result[0], el1)
  assert.equal(result[1], el3)
})
