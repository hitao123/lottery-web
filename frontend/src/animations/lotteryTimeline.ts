import gsap from 'gsap'
import * as THREE from 'three'
import {
  flashCard,
  scatterCards,
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

  const visitCount = TIMING.chaseVisitCount
  const visitIndices = pickChaseTargets(cards.length, winnerIndex, visitCount)
  const perspectiveCamera = camera instanceof THREE.PerspectiveCamera ? camera : null

  // ═══════════════════════════════════════════════
  // PHASE 1: CHASING (0s → ~5s)
  // Camera visits 7 cards with PROGRESSIVE pauses.
  // Each stop is longer, building genuine suspense.
  // ═══════════════════════════════════════════════
  master.addLabel('chasing', 0)

  visitIndices.forEach((cardIdx, i) => {
    master.add(
      flashCard(cards[cardIdx], 0.28 + i * 0.04, 0.18 + i * 0.05),
      0.22 + i * 0.28
    )
  })

  master.to(
    camera.position,
    {
      x: 0,
      y: 2.35,
      z: 17.2,
      duration: TIMING.chasingDuration,
      ease: 'sine.inOut',
      onUpdate: () => camera.lookAt(0, 0.45, -1.5),
    },
    0
  )

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 41,
        duration: TIMING.chasingDuration * 0.55,
        ease: 'sine.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      0
    )
    master.to(
      perspectiveCamera,
      {
        fov: 38,
        duration: TIMING.chasingDuration * 0.45,
        ease: 'sine.inOut',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      TIMING.chasingDuration * 0.55
    )
  }

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
      y: 2.1,
      z: 14.4,
      duration: TIMING.lockingDuration * 0.72,
      ease: 'expo.out',
      onUpdate: () => camera.lookAt(0, 2.9, 0.8),
    },
    'locking'
  )

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 32,
        duration: TIMING.lockingDuration * 0.5,
        ease: 'expo.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      'locking'
    )
  }

  // Other cards fade back into the wall so the stage number becomes the hero.
  master.add(scatterCards(cards, winnerIndex, TIMING.lockingDuration * 0.8), 'locking')

  // ═══════════════════════════════════════════════
  // PHASE 3: REVEALED — brief settle
  // ═══════════════════════════════════════════════
  master.addLabel('revealed', lockStart + TIMING.lockingDuration)

  if (perspectiveCamera) {
    master.to(
      perspectiveCamera,
      {
        fov: 36,
        duration: TIMING.revealedDelay + 0.4,
        ease: 'sine.out',
        onUpdate: () => perspectiveCamera.updateProjectionMatrix(),
      },
      'revealed'
    )
  }

  master.call(
    () => {
      winnerCard.visible = false
    },
    [],
    'revealed'
  )

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
