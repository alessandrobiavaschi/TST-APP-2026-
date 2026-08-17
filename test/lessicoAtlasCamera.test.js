import test from 'node:test'
import assert from 'node:assert/strict'

import {
  getAtlasWordFontSize,
  projectAtlasPoint,
} from '../src/utils/lessicoAtlasCamera.js'

test('projectAtlasPoint increases the distance between words with zoom', () => {
  const viewport = { width: 1000, height: 600 }
  const left = { x: 40, y: 50 }
  const right = { x: 60, y: 50 }

  const leftAtOne = projectAtlasPoint(left, { x: 0, y: 0, scale: 1 }, viewport)
  const rightAtOne = projectAtlasPoint(right, { x: 0, y: 0, scale: 1 }, viewport)
  const leftAtThree = projectAtlasPoint(left, { x: 0, y: 0, scale: 3 }, viewport)
  const rightAtThree = projectAtlasPoint(right, { x: 0, y: 0, scale: 3 }, viewport)

  assert.equal(rightAtOne.x - leftAtOne.x, 200)
  assert.equal(rightAtThree.x - leftAtThree.x, 600)
})

test('getAtlasWordFontSize grows progressively and keeps selected labels readable', () => {
  const base = getAtlasWordFontSize(10, 1)
  const zoomed = getAtlasWordFontSize(10, 4)
  const selected = getAtlasWordFontSize(8, 2.2, true)

  assert.ok(zoomed > base)
  assert.ok(selected >= 24)
  assert.ok(selected <= 42)
})
