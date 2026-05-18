import { useMemo, useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { Card } from '@/components/three/Card'
import { useLotteryStore } from '@/store/useLotteryStore'
import { fibonacciSphere, randomRotation } from '@/utils/distributions'
import { SCENE } from '@/utils/constants'
import { createLotteryTimeline } from '@/animations/lotteryTimeline'
import type { LotteryPhase } from '@/types'

export function CardField() {
  const guests = useLotteryStore((s) => s.guests)
  const setPhase = useLotteryStore((s) => s.setPhase)
  const selectWinner = useLotteryStore((s) => s.selectWinner)
  const { camera } = useThree()
  const cardRefs = useRef<(THREE.Group | null)[]>([])
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Calculate positions once when guests change
  const cardData = useMemo(() => {
    if (guests.length === 0) return []
    const positions = fibonacciSphere(guests.length, SCENE.cardSphereRadius)
    return guests.map((guest, i) => ({
      guest,
      position: positions[i],
      rotation: randomRotation(),
    }))
  }, [guests])

  // Store initial positions for reset
  const initialPositions = useMemo(
    () => cardData.map((d) => [...d.position] as [number, number, number]),
    [cardData]
  )

  // Start draw - triggered externally via keyboard
  const startDraw = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'idle') return

    const winner = selectWinner()
    if (!winner) return

    // Set spinning phase immediately
    setPhase('spinning')

    const winnerIndex = guests.findIndex((g) => g.id === winner.id)
    const cards = cardRefs.current.filter((ref): ref is THREE.Group => ref !== null)
    if (cards.length === 0) return

    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const timeline = createLotteryTimeline({
      camera,
      cards,
      winnerIndex,
      onPhaseChange: (p: string) => setPhase(p as LotteryPhase),
    })

    timelineRef.current = timeline
    timeline.play()
  }, [camera, guests, selectWinner, setPhase])

  // Expose startDraw via a global ref for the keyboard hook
  useMemo(() => {
    ;(window as unknown as Record<string, unknown>).__lotteryStartDraw = startDraw
    ;(window as unknown as Record<string, unknown>).__lotteryResetCards = () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      const cards = cardRefs.current.filter((ref): ref is THREE.Group => ref !== null)
      cards.forEach((card, i) => {
        gsap.killTweensOf(card.position)
        gsap.killTweensOf(card.rotation)
        gsap.killTweensOf(card.scale)
        card.scale.set(1, 1, 1)
        if (initialPositions[i]) {
          card.position.set(...initialPositions[i])
        }
        // Reset rotation to something random
        card.rotation.set(
          (Math.random() - 0.5) * 0.3,
          Math.random() * Math.PI * 2,
          (Math.random() - 0.5) * 0.2
        )
      })
    }
  }, [startDraw, initialPositions])

  return (
    <group>
      {cardData.map(({ guest, position, rotation }, index) => (
        <Card
          key={guest.id}
          code={guest.code}
          position={position}
          initialRotation={rotation}
          ref={(el) => {
            cardRefs.current[index] = el
          }}
        />
      ))}
    </group>
  )
}
