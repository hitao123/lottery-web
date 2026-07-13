import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const storeSource = readFileSync(new URL('./useLotteryStore.ts', import.meta.url), 'utf8')
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8')
const hudSource = readFileSync(new URL('../components/ui/HUD.tsx', import.meta.url), 'utf8')

test('winner selection has no browser-random fallback and is protected by an in-flight lock', () => {
  assert.doesNotMatch(storeSource, /Math\.random/)
  assert.match(storeSource, /isDrawing: true/)
  assert.match(storeSource, /if \(isDrawing \|\| \(guests\.every\(\(guest\) => guest\.hasWon\) && !getPendingDrawRequestId\(\)\)\)/)
  assert.match(storeSource, /const requestId = getPendingDrawRequestId\(\) \|\| newDrawRequestId\(\)/)
  assert.match(storeSource, /const response = await apiDraw\(1, requestId\)/)
})

test('draw request id generation does not require crypto.randomUUID support', () => {
  assert.doesNotMatch(storeSource, /return crypto\.randomUUID\(\)/)
  assert.match(storeSource, /typeof globalThis\.crypto\?\.randomUUID === 'function'/)
  assert.match(storeSource, /Date\.now\(\)\.toString\(36\)/)
})

test('app restores the saved backend snapshot instead of loading demo guests', () => {
  assert.match(appSource, /void loadLottery\(\)/)
  assert.doesNotMatch(appSource, /5200001/)
})

test('operator HUD mounts both status and winner result UI', () => {
  assert.match(hudSource, /<StatusBar \/>/)
  assert.match(hudSource, /<WinnerReveal \/>/)
})
