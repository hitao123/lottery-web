import gsap from 'gsap'
import * as THREE from 'three'
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

  // Pick 4-5 random cards to "visit" during chase, end with one near winner
  const visitIndices = pickChaseTargets(cards.length, winnerIndex, 4)

  // ═══════════════════════════════════════════════
  // PHASE 1: SPINNING (0s - 2s)
  // Camera orbit accelerates — stays at same distance but rotates faster
  // ═══════════════════════════════════════════════
  master.addLabel('spinning', 0)

  const startPos = camera.position.clone()
  const orbitRadius = Math.sqrt(startPos.x * startPos.x + startPos.z * startPos.z)

  // Camera does a faster orbit during spinning (no dolly in)
  master.to(
    camera.position,
    {
      x: -startPos.x * 0.8,
      z: -startPos.z * 0.8,
      y: startPos.y + 2,
      duration: TIMING.spinningDuration,
      ease: 'power1.in',
      onUpdate: () => camera.lookAt(0, 0, 0),
    },
    'spinning'
  )

  // ═══════════════════════════════════════════════
  // PHASE 2: CHASING (2s - 6s)
  // Camera flies past multiple cards (stays OUTSIDE the sphere)
  // ═══════════════════════════════════════════════
  master.addLabel('chasing', TIMING.spinningDuration)
  master.call(() => onPhaseChange('chasing'), [], 'chasing')

  const chaseDuration = TIMING.chasingDuration / visitIndices.length

  visitIndices.forEach((cardIdx, i) => {
    const cardPos = cardPositions[cardIdx]
    // Camera position: same direction as card but further out from center
    const dir = cardPos.clone().normalize()
    const cameraTarget = dir.multiplyScalar(orbitRadius * 0.95)
    // Look at the card
    const lookTarget = cardPos.clone()

    const startTime = TIMING.spinningDuration + i * chaseDuration
    master.to(
      camera.position,
      {
        x: cameraTarget.x,
        y: cameraTarget.y,
        z: cameraTarget.z,
        duration: chaseDuration * 0.85,
        ease: i === visitIndices.length - 1 ? 'power3.out' : 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(lookTarget)
        },
      },
      startTime
    )
  })

  // ═══════════════════════════════════════════════
  // PHASE 3: LOCKING (6s - 8s)
  // Winner card locks to center, others scatter, camera pulls back
  // ═══════════════════════════════════════════════
  const lockStart = TIMING.spinningDuration + TIMING.chasingDuration
  master.addLabel('locking', lockStart)
  master.call(() => onPhaseChange('locking'), [], 'locking')

  // Camera moves to front viewing position
  master.to(
    camera.position,
    {
      x: 0,
      y: 0,
      z: 8,
      duration: TIMING.lockingDuration,
      ease: 'power3.out',
      onUpdate: () => camera.lookAt(0, 0, 0),
    },
    'locking'
  )

  // Winner card moves to center, facing camera
  master.add(lockWinnerCard(winnerCard, TIMING.lockingDuration), 'locking')
  master.add(rotateToFaceCamera(winnerCard, TIMING.lockingDuration * 0.8), 'locking')
  master.add(
    scaleWinnerCard(winnerCard, TIMING.lockingDuration),
    `locking+=${TIMING.lockingDuration * 0.3}`
  )

  // Other cards scatter outward
  master.add(scatterCards(cards, winnerIndex, TIMING.lockingDuration), 'locking')

  // ═══════════════════════════════════════════════
  // PHASE 4: REVEALED (8s+)
  // Triggered by onComplete
  // ═══════════════════════════════════════════════
  master.addLabel('revealed', lockStart + TIMING.lockingDuration)

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

  // Last visit is a card near the winner (for dramatic approach)
  const nearWinner = (winnerIndex + 1) % totalCards
  indices.push(nearWinner)

  return indices
}
