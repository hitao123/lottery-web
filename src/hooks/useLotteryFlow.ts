import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { createLotteryTimeline } from '@/animations/lotteryTimeline'
import type { LotteryPhase } from '@/types'

/**
 * Hook that orchestrates the entire lottery draw flow.
 * Call startDraw() to begin, manages timeline and phase transitions.
 */
export function useLotteryFlow(cardRefs: React.MutableRefObject<(THREE.Group | null)[]>) {
  const { camera } = useThree()
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const store = useLotteryStore

  const startDraw = useCallback(() => {
    const { phase, selectWinner, setPhase } = store.getState()
    if (phase !== 'idle') return

    // Select winner first
    const winner = selectWinner()
    if (!winner) return

    // Set spinning phase
    setPhase('spinning')

    // Find the winner card index
    const guests = store.getState().guests
    const winnerIndex = guests.findIndex((g) => g.id === winner.id)

    // Get valid card refs
    const cards = cardRefs.current.filter((ref): ref is THREE.Group => ref !== null)
    if (cards.length === 0) return

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    // Create and play the master timeline
    const timeline = createLotteryTimeline({
      camera,
      cards,
      winnerIndex,
      onPhaseChange: (p: string) => setPhase(p as LotteryPhase),
    })

    timelineRef.current = timeline
    timeline.play()
  }, [camera, cardRefs, store])

  const resetCards = useCallback(() => {
    // Kill timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    // Reset all card positions and scales
    const cards = cardRefs.current.filter((ref): ref is THREE.Group => ref !== null)
    cards.forEach((card) => {
      gsap.killTweensOf(card.position)
      gsap.killTweensOf(card.rotation)
      gsap.killTweensOf(card.scale)
      card.scale.set(1, 1, 1)
    })
  }, [cardRefs])

  return { startDraw, resetCards }
}
