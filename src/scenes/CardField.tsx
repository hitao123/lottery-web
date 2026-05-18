import { useMemo, useRef, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { Card } from '@/components/three/Card'
import { useLotteryStore } from '@/store/useLotteryStore'
import { fibonacciSphere, randomRotation } from '@/utils/distributions'
import { SCENE } from '@/utils/constants'
import { createLotteryTimeline } from '@/animations/lotteryTimeline'
import type { LotteryPhase } from '@/types'

type LayoutGuest = {
  id: number
  code: string
}

type CardMotion = {
  emissiveOffset: number
  floatAmplitude: number
  floatOffset: number
  floatSpeed: number
  idleYawSpeed: number
  orbitOffset: number
  spinRadius: number
  spinYawSpeed: number
  swayAmplitude: number
  swayOffset: number
}

type CardLayout = {
  guest: LayoutGuest
  motion: CardMotion
  position: [number, number, number]
  rotation: [number, number, number]
}

const BASE_EMISSIVE = 0.05

function getCardMaterial(card: THREE.Group | null) {
  if (!card) return null
  const child = card.children[0]
  if (!(child instanceof THREE.Mesh)) return null
  return child.material instanceof THREE.MeshStandardMaterial ? child.material : null
}

export function CardField() {
  const guests = useLotteryStore((s) => s.guests)
  const phase = useLotteryStore((s) => s.phase)
  const currentWinnerId = useLotteryStore((s) => s.currentWinner?.id ?? null)
  const setPhase = useLotteryStore((s) => s.setPhase)
  const selectWinner = useLotteryStore((s) => s.selectWinner)
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera)
  const cardRefs = useRef<(THREE.Group | null)[]>([])
  const materialRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const initialCameraFovRef = useRef(camera.fov)

  const layoutSignature = useMemo(
    () => guests.map((guest) => `${guest.id}:${guest.code}`).join('|'),
    [guests]
  )

  const layoutGuests = useMemo<LayoutGuest[]>(
    () => guests.map(({ id, code }) => ({ id, code })),
    [layoutSignature]
  )

  const guestIndexById = useMemo(
    () => new Map(layoutGuests.map((guest, index) => [guest.id, index])),
    [layoutGuests]
  )

  // Calculate positions once when guests change
  const cardData = useMemo<CardLayout[]>(() => {
    if (layoutGuests.length === 0) return []
    const positions = fibonacciSphere(layoutGuests.length, SCENE.cardSphereRadius)
    return layoutGuests.map((guest, i) => ({
      guest,
      motion: {
        emissiveOffset: Math.random() * Math.PI * 2,
        floatAmplitude: 0.08 + Math.random() * 0.12,
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.2 + Math.random() * 0.35,
        idleYawSpeed: 0.22 + Math.random() * 0.2,
        orbitOffset: Math.random() * Math.PI * 2,
        spinRadius: 0.16 + Math.random() * 0.34,
        spinYawSpeed: 1.8 + Math.random() * 1.5,
        swayAmplitude: 0.025 + Math.random() * 0.04,
        swayOffset: Math.random() * Math.PI * 2,
      },
      position: positions[i],
      rotation: randomRotation(),
    }))
  }, [layoutGuests])

  // Store initial positions for reset
  const initialTransforms = useMemo(
    () =>
      cardData.map((card) => ({
        position: [...card.position] as [number, number, number],
        rotation: [...card.rotation] as [number, number, number],
      })),
    [cardData]
  )

  const resetCards = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    cardRefs.current.slice(0, cardData.length).forEach((card, index) => {
      if (!card) return

      gsap.killTweensOf(card.position)
      gsap.killTweensOf(card.rotation)
      gsap.killTweensOf(card.scale)

      const material = materialRefs.current[index] ?? getCardMaterial(card)
      if (material) {
        gsap.killTweensOf(material)
        material.emissiveIntensity = BASE_EMISSIVE
        materialRefs.current[index] = material
      }

      card.scale.set(1, 1, 1)
      const initial = initialTransforms[index]
      if (initial) {
        card.position.set(...initial.position)
        card.rotation.set(...initial.rotation)
      }
    })

    camera.fov = initialCameraFovRef.current
    camera.updateProjectionMatrix()
  }, [camera, cardData.length, initialTransforms])

  // Start spinning — no winner yet, just visual acceleration
  const startSpin = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'idle') return
    setPhase('spinning')
  }, [setPhase])

  // Stop spinning — NOW select winner and play lock animation
  const stopSpin = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'spinning') return

    const cards = cardRefs.current
      .slice(0, cardData.length)
      .filter((card): card is THREE.Group => card !== null)
    if (cards.length !== cardData.length || cards.length === 0) return

    const winner = selectWinner()
    if (!winner) return

    const winnerIndex = guestIndexById.get(winner.id)
    if (winnerIndex === undefined) return

    // Transition to chasing immediately
    setPhase('chasing')

    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const timeline = createLotteryTimeline({
      camera,
      cards,
      winnerIndex,
      onPhaseChange: (p: string) => {
        setPhase(p as LotteryPhase)
        if (p === 'revealed') {
          useLotteryStore.getState().confirmWinner()
        }
      },
    })

    timelineRef.current = timeline
    timeline.play()
  }, [camera, cardData.length, guestIndexById, selectWinner, setPhase])

  useFrame((state, delta) => {
    if (phase !== 'idle' && phase !== 'spinning' && phase !== 'revealed') return

    const t = state.clock.elapsedTime

    for (let i = 0; i < cardData.length; i++) {
      const card = cardRefs.current[i]
      if (!card) continue

      const { guest, motion, position, rotation } = cardData[i]
      const material = materialRefs.current[i] ?? getCardMaterial(card)
      if (material) {
        materialRefs.current[i] = material
      }

      if (phase === 'idle') {
        card.position.x = position[0] + Math.sin(t * 0.18 + motion.orbitOffset) * 0.18
        card.position.y =
          position[1] + Math.sin(t * motion.floatSpeed + motion.floatOffset) * motion.floatAmplitude
        card.position.z = position[2] + Math.cos(t * 0.16 + motion.orbitOffset) * 0.18

        card.rotation.x = rotation[0] + Math.sin(t * 0.42 + motion.swayOffset) * motion.swayAmplitude
        card.rotation.y += motion.idleYawSpeed * delta
        card.rotation.z =
          rotation[2] + Math.cos(t * 0.36 + motion.swayOffset) * motion.swayAmplitude * 0.7

        if (material) {
          material.emissiveIntensity =
            BASE_EMISSIVE + Math.sin(t * 0.75 + motion.emissiveOffset) * 0.03
        }
        continue
      }

      if (phase === 'spinning') {
        const contraction = 0.84 + Math.sin(t * 4.8 + motion.orbitOffset) * 0.04
        card.position.x =
          position[0] * contraction + Math.sin(t * 2.7 + motion.orbitOffset) * motion.spinRadius
        card.position.y =
          position[1] * 0.82 +
          Math.sin(t * (2.4 + motion.floatSpeed) + motion.floatOffset) *
            motion.floatAmplitude *
            2.4
        card.position.z =
          position[2] * contraction + Math.cos(t * 2.3 + motion.orbitOffset) * motion.spinRadius

        card.rotation.x = rotation[0] + Math.sin(t * 5.4 + motion.swayOffset) * 0.24
        card.rotation.y += motion.spinYawSpeed * delta
        card.rotation.z = rotation[2] + Math.cos(t * 5.9 + motion.swayOffset) * 0.18

        if (material) {
          material.emissiveIntensity = 0.16 + Math.sin(t * 6.1 + motion.emissiveOffset) * 0.05
        }
        continue
      }

      if (guest.id === currentWinnerId) {
        card.position.y = Math.sin(t * 1.9 + motion.floatOffset) * 0.12
        card.rotation.x = Math.sin(t * 0.85 + motion.swayOffset) * 0.05
        card.rotation.z = Math.sin(t * 1.35 + motion.orbitOffset) * 0.035

        if (material) {
          material.emissiveIntensity = 0.22 + Math.sin(t * 3.4 + motion.emissiveOffset) * 0.09
        }
      }
    }
  })

  useEffect(() => {
    cardRefs.current.length = cardData.length
    materialRefs.current.length = cardData.length
  }, [cardData.length])

  // Expose controls via global refs for the keyboard hook
  useEffect(() => {
    const globals = window as unknown as Record<string, unknown>
    globals.__lotteryStartSpin = startSpin
    globals.__lotteryStopSpin = stopSpin
    globals.__lotteryResetCards = resetCards

    return () => {
      if (globals.__lotteryStartSpin === startSpin) {
        delete globals.__lotteryStartSpin
      }
      if (globals.__lotteryStopSpin === stopSpin) {
        delete globals.__lotteryStopSpin
      }
      if (globals.__lotteryResetCards === resetCards) {
        delete globals.__lotteryResetCards
      }
    }
  }, [resetCards, startSpin, stopSpin])

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
            materialRefs.current[index] = getCardMaterial(el)
          }}
        />
      ))}
    </group>
  )
}
