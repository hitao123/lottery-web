import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import assert from 'node:assert/strict'

const lotterySceneSource = readFileSync(new URL('./LotteryScene.tsx', import.meta.url), 'utf8')
const environmentSource = readFileSync(new URL('./Environment.tsx', import.meta.url), 'utf8')
const weddingStageSource = readFileSync(new URL('../components/three/WeddingStage.tsx', import.meta.url), 'utf8')

test('Canvas initializes the red scene background before Suspense children resolve', () => {
  assert.match(lotterySceneSource, /import \* as THREE from 'three'/)
  assert.match(lotterySceneSource, /SCENE_BACKGROUND_COLOR/)
  assert.match(lotterySceneSource, /onCreated=\{\(\{ gl, scene \}\) => \{/)
  assert.match(lotterySceneSource, /gl\.setClearColor\(SCENE_BACKGROUND_COLOR\)/)
  assert.match(lotterySceneSource, /scene\.background = new THREE\.Color\(SCENE_BACKGROUND_COLOR\)/)

  const onCreatedIndex = lotterySceneSource.indexOf('onCreated=')
  const suspenseIndex = lotterySceneSource.indexOf('<Suspense')
  assert.ok(onCreatedIndex > -1 && suspenseIndex > -1 && onCreatedIndex < suspenseIndex)
})

test('Environment uses the same red background color constant', () => {
  assert.match(environmentSource, /export const SCENE_BACKGROUND_COLOR = 0x3f0d14/)
  assert.match(environmentSource, /<color attach="background" args=\{\[SCENE_BACKGROUND_COLOR\]\} \/>/)
})

test('Canvas stops continuous rendering while the scene is parked', () => {
  assert.match(lotterySceneSource, /const \[keepRevealAnimation, setKeepRevealAnimation\] = useState\(false\)/)
  assert.match(lotterySceneSource, /const shouldRenderContinuously = phase !== 'idle' && \(phase !== 'revealed' \|\| keepRevealAnimation\)/)
  assert.match(lotterySceneSource, /frameloop=\{shouldRenderContinuously \? 'always' : 'demand'\}/)
  assert.match(lotterySceneSource, /window\.setTimeout\(\(\) => setKeepRevealAnimation\(false\), 3200\)/)
})

test('Canvas caps device pixel ratio to reduce long-running GPU heat', () => {
  assert.match(lotterySceneSource, /dpr=\{\[1, 1\.35\]\}/)
})

test('winner board is hidden immediately when the next round clears currentWinner', () => {
  assert.match(weddingStageSource, /const showWinnerBoard = Boolean\(currentWinner\) && \(phase === 'locking' \|\| phase === 'revealed'\)/)
  assert.match(weddingStageSource, /const hideWinnerBoard = \(\) => \{/)
  assert.match(weddingStageSource, /board\.visible = false/)
  assert.match(weddingStageSource, /board\.scale\.setScalar\(0\.001\)/)
  assert.match(weddingStageSource, /useLayoutEffect\(\(\) => \{\n    if \(!showWinnerBoard\) hideWinnerBoard\(\)\n  \}, \[showWinnerBoard\]\)/)
})
