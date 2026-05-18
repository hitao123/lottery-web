import gsap from 'gsap'
import * as THREE from 'three'
import { createChasePath } from './cameraAnimations'
import { scatterCards, lockWinnerCard, scaleWinnerCard, rotateToFaceCamera } from './cardAnimations'
import { TIMING } from '@/utils/constants'

interface TimelineOptions {
  camera: THREE.Camera
  cards: THREE.Group[]
  winnerIndex: number
  onPhaseChange: (phase: string) => void
}

/**
 * Creates the master GSAP timeline for the entire lottery draw animation.
 *
 * Phases: SPINNING → CHASING → LOCKING → REVEALED
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

  // Get card positions for chase path
  const cardPositions = cards.map((c) => c.position.clone())
  const chasePath = createChasePath(cardPositions, 5)

  // ═══════════════════════════════════════════════
  // PHASE 1: SPINNING (0s - 2s)
  // Camera dolly in, cards accelerate (handled by useFrame via phase)
  // ═══════════════════════════════════════════════
  master.addLabel('spinning', 0)

  master.to(
    camera.position,
    {
      x: camera.position.x * 0.7,
      y: camera.position.y * 0.7,
      z: camera.position.z * 0.7,
      duration: TIMING.spinningDuration,
      ease: 'power2.in',
      onUpdate: () => camera.lookAt(0, 0, 0),
    },
    'spinning'
  )

  // ═══════════════════════════════════════════════
  // PHASE 2: CHASING (2s - 6s)
  // Camera flies through multiple card positions
  // ═══════════════════════════════════════════════
  master.addLabel('chasing', TIMING.spinningDuration)

  master.call(() => onPhaseChange('chasing'), [], 'chasing')

  const chaseDuration = TIMING.chasingDuration / chasePath.length
  chasePath.forEach((pos, i) => {
    const startTime = TIMING.spinningDuration + i * chaseDuration
    master.to(
      camera.position,
      {
        x: pos.x,
        y: pos.y,
        z: pos.z,
        duration: chaseDuration * 0.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          // Look toward the card we're visiting
          const lookTarget = cardPositions[Math.min(i, cardPositions.length - 1)]
          camera.lookAt(lookTarget)
        },
      },
      startTime
    )
  })

  // ═══════════════════════════════════════════════
  // PHASE 3: LOCKING (6s - 8s)
  // Winner card locks to center, others scatter
  // ═══════════════════════════════════════════════
  const lockStart = TIMING.spinningDuration + TIMING.chasingDuration
  master.addLabel('locking', lockStart)

  master.call(() => onPhaseChange('locking'), [], 'locking')

  // Camera moves to viewing position
  master.to(
    camera.position,
    {
      x: 0,
      y: 0,
      z: 10,
      duration: TIMING.lockingDuration,
      ease: 'power3.out',
      onUpdate: () => camera.lookAt(0, 0, 0),
    },
    'locking'
  )

  // Winner card moves to center
  master.add(lockWinnerCard(winnerCard, TIMING.lockingDuration), 'locking')
  master.add(rotateToFaceCamera(winnerCard, TIMING.lockingDuration * 0.8), 'locking')
  master.add(scaleWinnerCard(winnerCard, TIMING.lockingDuration), `locking+=${TIMING.lockingDuration * 0.3}`)

  // Other cards scatter
  master.add(scatterCards(cards, winnerIndex, TIMING.lockingDuration), 'locking')

  // ═══════════════════════════════════════════════
  // PHASE 4: REVEALED (8s+)
  // Winner card gentle float, triggered by onComplete
  // ═══════════════════════════════════════════════
  master.addLabel('revealed', lockStart + TIMING.lockingDuration)

  return master
}
