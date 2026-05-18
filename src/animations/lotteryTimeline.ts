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
 * Flow: CHASING → LOCKING → REVEALED
 * (Spinning is handled by useFrame loop, not by this timeline)
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
  const visitIndices = pickChaseTargets(cards.length, winnerIndex, 4)

  const startPos = camera.position.clone()
  const orbitRadius = Math.sqrt(startPos.x * startPos.x + startPos.z * startPos.z)
  const perspectiveCamera = camera instanceof THREE.PerspectiveCamera ? camera : null

  // ═══════════════════════════════════════════════
  // PHASE 1: CHASING (0s - 3.5s)
  // Camera flies past multiple cards, building suspense
  // ═══════════════════════════════════════════════
  master.addLabel('chasing', 0)

  const chaseDuration = TIMING.chasingDuration / visitIndices.length

  visitIndices.forEach((cardIdx, i) => {
    const cardPos = cardPositions[cardIdx]
    const dir = cardPos.clone().normalize()
    const cameraTarget = dir.multiplyScalar(orbitRadius * (i === visitIndices.length - 1 ? 0.74 : 0.92))
    cameraTarget.y += i % 2 === 0 ? 0.8 : -0.6
    const lookTarget = cardPos.clone()

    const startTime = i * chaseDuration
    master.add(flashCard(cards[cardIdx], chaseDuration * 0.72, i === visitIndices.length - 1 ? 0.38 : 0.28), startTime)
    master.to(
      camera.position,
      {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: chaseDuration * 0.85,
        ease: i === visitIndices.length - 1 ? 'expo.out' : 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(lookTarget)
        },
      },
      startTime
    )

    if (perspectiveCamera) {
      master.to(
        perspectiveCamera,
        {
          fov: i === visitIndices.length - 1 ? 34 : 38,
          duration: chaseDuration * 0.5,
          ease: 'power2.out',
          yoyo: true,
          repeat: 1,
          onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
        },
        startTime
      )
    }
  })

  // ═══════════════════════════════════════════════
  // PHASE 2: LOCKING (3.5s - 5.5s)
  // Winner card locks to center, others scatter
  // ═══════════════════════════════════════════════
  const lockStart = TIMING.chasingDuration
  master.addLabel('locking', lockStart)
  master.call(() => onPhaseChange('locking'), [], 'locking')

  // Camera to front viewing position
  master.to(
    camera.position,
    {
      x: 0,
      y: 0,
      z: 8.4,
      duration: TIMING.lockingDuration,
      ease: 'expo.out',
      onUpdate: () => camera.lookAt(0, 0, 0),
    },
    'locking'
  )

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 30,
        duration: TIMING.lockingDuration * 0.75,
        ease: 'expo.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      'locking'
    )
  }

  // Winner card
  master.add(flashCard(winnerCard, TIMING.lockingDuration * 0.55, 0.42), 'locking')
  master.add(lockWinnerCard(winnerCard, TIMING.lockingDuration), 'locking')
  master.add(rotateToFaceCamera(winnerCard, TIMING.lockingDuration * 0.8), 'locking')
  master.add(
    scaleWinnerCard(winnerCard, TIMING.lockingDuration),
    `locking+=${TIMING.lockingDuration * 0.3}`
  )
  master.add(igniteWinnerCard(winnerCard, TIMING.lockingDuration * 0.9), 'locking')

  // Other cards scatter
  master.add(scatterCards(cards, winnerIndex, TIMING.lockingDuration), 'locking')

  // ═══════════════════════════════════════════════
  // PHASE 3: REVEALED
  // ═══════════════════════════════════════════════
  master.addLabel('revealed', lockStart + TIMING.lockingDuration)

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 36,
        duration: TIMING.revealedDelay + 0.35,
        ease: 'sine.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      'revealed'
    )
  }

  return master
}

/**
 * Pick random card indices to visit during chase, ending near the winner
 */
function pickChaseTargets(totalCards: number, winnerIndex: number, count: number): number[] {
  const indices: number[] = []
  const used = new Set<number>()
  used.add(winnerIndex)

  while (indices.length < count - 1 && indices.length < totalCards - 1) {
    const idx = Math.floor(Math.random() * totalCards)
    if (!used.has(idx)) {
      used.add(idx)
      indices.push(idx)
    }
  }

  // Last visit is near the winner for dramatic approach
  const nearWinner = (winnerIndex + 1) % totalCards
  indices.push(nearWinner)

  return indices
}
