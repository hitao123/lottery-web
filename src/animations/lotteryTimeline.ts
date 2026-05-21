import gsap from 'gsap'
import * as THREE from 'three'
import {
  flashCard,
  igniteWinnerCard,
  scatterCards,
  lockWinnerCard,
  scaleWinnerCard,
  rotateToFaceCamera,
} from './cardAnimations'
import { TIMING } from '@/utils/constants'

interface TimelineOptions {
  camera: THREE.Camera
  cards: THREE.Group[]
  winnerIndex: number
  onPhaseChange: (phase: string) => void
}

/**
 * Creates the GSAP timeline for lock animation AFTER user stops spinning.
 *
 * Flow: CHASING (progressive suspense) → LOCKING (slam) → REVEALED
 *
 * The chase visits 7 cards with INCREASING pauses — each stop feels
 * more like "is it this one?" until the final SLAM lock.
 */
export function createLotteryTimeline({
  camera,
  cards,
  winnerIndex,
  onPhaseChange,
}: TimelineOptions): gsap.core.Timeline {
  const master = gsap.timeline({
    paused: true,
    onComplete: () => {
      onPhaseChange('revealed')
    },
  })

  const winnerCard = cards[winnerIndex]
  if (!winnerCard) return master

  const cardPositions = cards.map((c) => c.position.clone())
  const visitCount = TIMING.chaseVisitCount
  const pauseDurations = TIMING.chasePauses
  const visitIndices = pickChaseTargets(cards.length, winnerIndex, visitCount)

  const startPos = camera.position.clone()
  const orbitRadius = Math.sqrt(startPos.x * startPos.x + startPos.z * startPos.z)
  const perspectiveCamera = camera instanceof THREE.PerspectiveCamera ? camera : null

  // ═══════════════════════════════════════════════
  // PHASE 1: CHASING (0s → ~5s)
  // Camera visits 7 cards with PROGRESSIVE pauses.
  // Each stop is longer, building genuine suspense.
  // ═══════════════════════════════════════════════
  master.addLabel('chasing', 0)

  let cumulativeTime = 0

  visitIndices.forEach((cardIdx, i) => {
    const cardPos = cardPositions[cardIdx]
    const dir = cardPos.clone().normalize()
    const isLast = i === visitIndices.length - 1

    // Camera gets progressively closer (more intimate zoom each time)
    const distanceFactor = 0.95 - (i / visitIndices.length) * 0.2 // 0.95 → 0.75
    const cameraTarget = dir.clone().multiplyScalar(orbitRadius * distanceFactor)
    cameraTarget.y += (i % 2 === 0 ? 0.6 : -0.4) * (1 - i * 0.06)
    const lookTarget = cardPos.clone()

    const pauseDuration = pauseDurations[i]
    // Travel time also increases (momentum dying)
    const travelTime = 0.15 + i * 0.04 // 0.15s → 0.39s

    const startTime = cumulativeTime

    // Camera movement — easing gets progressively heavier
    const moveEase = isLast
      ? 'expo.out'
      : i > 4
        ? 'power3.inOut'
        : 'power2.inOut'

    master.to(
      camera.position,
      {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: travelTime,
        ease: moveEase,
        onUpdate: () => camera.lookAt(lookTarget),
      },
      startTime
    )

    // Flash effect — progressively MORE dramatic
    const flashIntensity = 0.12 + (i / visitIndices.length) * 0.4 // 0.12 → 0.52
    const flashDuration = pauseDuration * 0.8
    master.add(
      flashCard(cards[cardIdx], flashDuration, flashIntensity),
      startTime + travelTime * 0.3
    )

    // FOV zoom punch — gets heavier each time
    if (perspectiveCamera) {
      const fovPunch = 2 + i * 1.5 // 2° → 11°
      const baseFov = 40
      master.to(
        perspectiveCamera,
        {
          fov: baseFov - fovPunch,
          duration: pauseDuration * 0.35,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          repeatDelay: pauseDuration * 0.15,
          onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
        },
        startTime + travelTime
      )
    }

    cumulativeTime += travelTime + pauseDuration
  })

  // ═══════════════════════════════════════════════
  // PHASE 2: LOCKING (~5s → ~6s)
  // SUDDEN STOP — 1 second of pure impact.
  // Camera snaps, winner slams to center, others explode outward.
  // ═══════════════════════════════════════════════
  const lockStart = TIMING.chasingDuration
  master.addLabel('locking', lockStart)
  master.call(() => onPhaseChange('locking'), [], 'locking')

  // Camera SNAPS to front — aggressive expo.out (instant deceleration)
  master.to(
    camera.position,
    {
      x: 0,
      y: 0,
      z: 8.0,
      duration: TIMING.lockingDuration * 0.6,
      ease: 'expo.out',
      onUpdate: () => camera.lookAt(0, 0, 0),
    },
    'locking'
  )

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 28,
        duration: TIMING.lockingDuration * 0.5,
        ease: 'expo.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      'locking'
    )
  }

  // Winner card — fast, impactful lock
  master.add(flashCard(winnerCard, TIMING.lockingDuration * 0.4, 0.6), 'locking')
  master.add(lockWinnerCard(winnerCard, TIMING.lockingDuration * 0.8), 'locking')
  master.add(rotateToFaceCamera(winnerCard, TIMING.lockingDuration * 0.7), 'locking')
  master.add(
    scaleWinnerCard(winnerCard, TIMING.lockingDuration * 0.9),
    `locking+=${TIMING.lockingDuration * 0.15}`
  )
  master.add(igniteWinnerCard(winnerCard, TIMING.lockingDuration * 0.8), 'locking')

  // Other cards scatter (fast — 0.8s)
  master.add(scatterCards(cards, winnerIndex, TIMING.lockingDuration * 0.8), 'locking')

  // ═══════════════════════════════════════════════
  // PHASE 3: REVEALED — brief settle
  // ═══════════════════════════════════════════════
  master.addLabel('revealed', lockStart + TIMING.lockingDuration)

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 34,
        duration: TIMING.revealedDelay + 0.4,
        ease: 'sine.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      'revealed'
    )
  }

  return master
}

/**
 * Pick chase targets: random non-winner cards, with the LAST one being the winner.
 * Maximum drama: you think it might be any of the first 6, then the 7th IS it.
 */
function pickChaseTargets(totalCards: number, winnerIndex: number, count: number): number[] {
  const indices: number[] = []
  const used = new Set<number>()
  used.add(winnerIndex)

  // Fill (count - 1) random non-winner cards
  while (indices.length < count - 1 && indices.length < totalCards - 1) {
    const idx = Math.floor(Math.random() * totalCards)
    if (!used.has(idx)) {
      used.add(idx)
      indices.push(idx)
    }
  }

  // Last visit IS the winner — maximum suspense
  indices.push(winnerIndex)

  return indices
}
