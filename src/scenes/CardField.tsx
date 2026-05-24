import { useMemo, useRef, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { Card } from '@/components/three/Card'
import { useLotteryStore } from '@/store/useLotteryStore'
import {
  startBackgroundMusic,
  stopBackgroundMusic,
  playChasingSound,
  playLockingSound,
  playRevealSound,
} from '@/utils/audio'

type SlipLayout = {
  id: number
  basePosition: [number, number, number]
  baseRotation: [number, number, number]
  radius: number
  speed: number
  swirlOffset: number
  verticalOffset: number
  tilt: number
}

const BOX_CENTER = new THREE.Vector3(0, -1.78, 1.02)
const BOX_SIZE = {
  width: 2.2,
  height: 1.18,
  depth: 1.44,
}
const VISUAL_CARD_LIMIT = 42
const DEFAULT_SLIP_CODE = '囍'

function getCardMaterial(card: THREE.Group | null) {
  if (!card) return null
  const child = card.children[0]
  if (!(child instanceof THREE.Mesh)) return null
  return child.material instanceof THREE.MeshPhysicalMaterial || child.material instanceof THREE.MeshStandardMaterial
    ? child.material
    : null
}

function isCardMaterial(
  material: unknown
): material is THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  return material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial
}

function clampInsideBox(target: THREE.Vector3) {
  target.x = THREE.MathUtils.clamp(target.x, BOX_CENTER.x - BOX_SIZE.width * 0.5, BOX_CENTER.x + BOX_SIZE.width * 0.5)
  target.y = THREE.MathUtils.clamp(target.y, BOX_CENTER.y - BOX_SIZE.height * 0.5, BOX_CENTER.y + BOX_SIZE.height * 0.5)
  target.z = THREE.MathUtils.clamp(target.z, BOX_CENTER.z - BOX_SIZE.depth * 0.5, BOX_CENTER.z + BOX_SIZE.depth * 0.5)
  return target
}

export function CardField() {
  const guests = useLotteryStore((s) => s.guests)
  const phase = useLotteryStore((s) => s.phase)
  const currentWinner = useLotteryStore((s) => s.currentWinner)
  const setPhase = useLotteryStore((s) => s.setPhase)
  const selectWinner = useLotteryStore((s) => s.selectWinner)
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera)
  const cardRefs = useRef<(THREE.Group | null)[]>([])
  const materialRefs = useRef<((THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial) | null)[]>([])
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const initialCameraFovRef = useRef(camera.fov)
  const visualCardCount = Math.min(guests.length, VISUAL_CARD_LIMIT)
  const winnerSlotIndex = currentWinner && visualCardCount > 0 ? currentWinner.id % visualCardCount : -1

  const slipData = useMemo<SlipLayout[]>(() => {
    return Array.from({ length: visualCardCount }, (_, index) => {
      const ring = index % 12
      const layer = Math.floor(index / 12)
      const radius = 0.2 + (ring % 6) * 0.09 + Math.random() * 0.04
      const angle = (ring / 12) * Math.PI * 2 + layer * 0.34
      return {
        id: index + 1,
        basePosition: [
          BOX_CENTER.x + Math.cos(angle) * radius,
          BOX_CENTER.y - 0.34 + layer * 0.1,
          BOX_CENTER.z + Math.sin(angle) * (0.26 + (layer % 3) * 0.09),
        ],
        baseRotation: [
          -0.48 + Math.random() * 0.3,
          Math.random() * Math.PI * 2,
          -0.28 + Math.random() * 0.56,
        ],
        radius,
        speed: 0.9 + Math.random() * 0.9,
        swirlOffset: Math.random() * Math.PI * 2,
        verticalOffset: Math.random() * Math.PI * 2,
        tilt: -0.18 + Math.random() * 0.36,
      }
    })
  }, [visualCardCount])

  const resetCards = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    cardRefs.current.slice(0, slipData.length).forEach((card, index) => {
      if (!card) return
      gsap.killTweensOf(card.position)
      gsap.killTweensOf(card.rotation)
      gsap.killTweensOf(card.scale)

      const material = materialRefs.current[index]
      if (isCardMaterial(material)) {
        gsap.killTweensOf(material)
        material.opacity = 0.94
        material.emissiveIntensity = 0.04
      }

      const layout = slipData[index]
      card.visible = true
      card.scale.setScalar(0.34)
      card.position.set(...layout.basePosition)
      card.rotation.set(...layout.baseRotation)
    })

    camera.position.set(0, 2.8, 20)
    camera.lookAt(0, 0.45, -1.7)
    camera.fov = initialCameraFovRef.current
    camera.updateProjectionMatrix()
  }, [camera, slipData])

  const startSpin = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'idle') return
    setPhase('spinning')
    startBackgroundMusic()
  }, [setPhase])

  const stopSpin = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'spinning') return

    stopBackgroundMusic()

    const cards = cardRefs.current.slice(0, slipData.length).filter((card): card is THREE.Group => card !== null)
    if (cards.length === 0) return

    const winner = selectWinner()
    if (!winner) return

    const winnerIndex = visualCardCount > 0 ? winner.id % visualCardCount : -1
    if (winnerIndex < 0) return

    setPhase('chasing')
    playChasingSound()

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        setPhase('revealed')
        playRevealSound()
        useLotteryStore.getState().confirmWinner()
      },
    })

    timeline.to(
      camera.position,
      {
        x: 0,
        y: 2.5,
        z: 16.3,
        duration: 1.2,
        ease: 'sine.inOut',
        onUpdate: () => camera.lookAt(0, 0.9, 0.8),
      },
      0
    )

    timeline.to(
      camera,
      {
        fov: 37,
        duration: 1.2,
        ease: 'sine.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      0
    )

    timeline.call(() => {
      setPhase('locking')
      playLockingSound()
    }, [], 1.2)

    cards.forEach((card, index) => {
      const material = materialRefs.current[index]
      if (index === winnerIndex) {
        timeline.to(
          card.position,
          {
            x: 0,
            y: 0.72,
            z: 1.32,
            duration: 0.78,
            ease: 'expo.out',
          },
          1.2
        )
        timeline.to(
          card.rotation,
          {
            x: -0.12,
            y: 0,
            z: 0,
            duration: 0.78,
            ease: 'expo.out',
          },
          1.2
        )
        timeline.to(
          card.scale,
          {
            x: 1.22,
            y: 1.22,
            z: 1.22,
            duration: 0.78,
            ease: 'expo.out',
          },
          1.2
        )
        if (isCardMaterial(material)) {
          timeline.to(
            material,
            {
              emissiveIntensity: 0.24,
              opacity: 1,
              duration: 0.56,
              ease: 'sine.out',
            },
            1.2
          )
        }
      } else {
        const dir = new THREE.Vector3(card.position.x - BOX_CENTER.x, card.position.y - BOX_CENTER.y, card.position.z - BOX_CENTER.z)
        if (dir.lengthSq() < 0.001) {
          dir.set((index % 2 === 0 ? 1 : -1) * 0.4, 0.2, (index % 3 - 1) * 0.24)
        }
        dir.normalize()
        const target = clampInsideBox(
          new THREE.Vector3(
            BOX_CENTER.x + dir.x * (BOX_SIZE.width * 0.46),
            BOX_CENTER.y + dir.y * (BOX_SIZE.height * 0.42),
            BOX_CENTER.z + dir.z * (BOX_SIZE.depth * 0.46)
          )
        )

        timeline.to(
          card.position,
          {
            x: target.x,
            y: target.y,
            z: target.z,
            duration: 0.64,
            ease: 'power2.out',
          },
          1.2
        )
        timeline.to(
          card.rotation,
          {
            x: card.rotation.x + (Math.random() - 0.5) * 1.6,
            y: card.rotation.y + (Math.random() - 0.5) * 1.6,
            z: card.rotation.z + (Math.random() - 0.5) * 1.2,
            duration: 0.64,
            ease: 'power2.out',
          },
          1.2
        )
        timeline.to(
          card.scale,
          {
            x: 0.32,
            y: 0.32,
            z: 0.32,
            duration: 0.64,
            ease: 'power2.out',
          },
          1.2
        )
        if (isCardMaterial(material)) {
          timeline.to(
            material,
            {
              opacity: 0.9,
              emissiveIntensity: 0.02,
              duration: 0.52,
              ease: 'power1.out',
            },
            1.2
          )
        }
      }
    })

    timeline.to(
      camera.position,
      {
        x: 0,
        y: 2.16,
        z: 14.1,
        duration: 0.72,
        ease: 'expo.out',
        onUpdate: () => camera.lookAt(0, 2.88, 0.95),
      },
      1.2
    )

    timeline.to(
      camera,
      {
        fov: 32,
        duration: 0.66,
        ease: 'expo.out',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      1.2
    )

    timeline.call(() => {
      cards.forEach((card) => {
        card.visible = false
      })
    }, [], 2.04)

    timelineRef.current = timeline
    timeline.play()
  }, [camera, selectWinner, setPhase, slipData, visualCardCount])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const winnerId = currentWinner?.id

    for (let i = 0; i < slipData.length; i++) {
      const card = cardRefs.current[i]
      if (!card) continue

      const layout = slipData[i]
      const material = materialRefs.current[i]

      if (phase === 'idle') {
        card.visible = true
        card.scale.setScalar(0.34)
        card.position.x = layout.basePosition[0] + Math.sin(t * 0.8 + layout.swirlOffset) * 0.05
        card.position.y = layout.basePosition[1] + Math.sin(t * 0.9 + layout.verticalOffset) * 0.04
        card.position.z = layout.basePosition[2] + Math.cos(t * 0.74 + layout.swirlOffset) * 0.05
        card.rotation.x = layout.baseRotation[0] + Math.sin(t * 0.6 + layout.verticalOffset) * 0.05
        card.rotation.y = layout.baseRotation[1] + Math.sin(t * 0.45 + layout.swirlOffset) * 0.1
        card.rotation.z = layout.baseRotation[2] + Math.cos(t * 0.7 + layout.verticalOffset) * 0.05
        if (isCardMaterial(material)) {
          material.opacity = 0.94
          material.emissiveIntensity = 0.03 + Math.sin(t * 0.9 + layout.swirlOffset) * 0.01
        }
        continue
      }

      if (phase === 'spinning') {
        const swirl = t * (2.8 + layout.speed) + layout.swirlOffset
        const orbitX = Math.cos(swirl) * (0.32 + layout.radius * 0.28)
        const orbitZ = Math.sin(swirl * 1.14) * (0.22 + layout.radius * 0.34)
        const vertical = Math.sin(t * (3.3 + layout.speed) + layout.verticalOffset) * 0.36
        const depthSwap = Math.sin(t * (2.5 + layout.speed * 0.5) + layout.swirlOffset) * 0.46

        card.visible = true
        card.scale.setScalar(0.36)
        card.position.x = BOX_CENTER.x + orbitX
        card.position.y = BOX_CENTER.y + vertical
        card.position.z = BOX_CENTER.z + orbitZ + depthSwap * 0.25
        card.rotation.x = -0.7 + Math.sin(swirl * 1.4) * 0.52
        card.rotation.y = swirl * 1.9
        card.rotation.z = layout.tilt + Math.cos(swirl * 1.8) * 0.48

        if (isCardMaterial(material)) {
          material.opacity = 0.88
          material.emissiveIntensity = 0.08 + Math.sin(t * 5.4 + layout.swirlOffset) * 0.03
        }
        continue
      }

      if (phase === 'chasing') {
        card.visible = true
        const chaseTarget = new THREE.Vector3(
          BOX_CENTER.x + Math.cos(i * 0.7 + t * 1.2) * (0.34 + (i % 4) * 0.06),
          BOX_CENTER.y + Math.sin(i * 0.45 + t * 1.6) * 0.22,
          BOX_CENTER.z + Math.sin(i * 0.8 + t * 1.1) * 0.28
        )
        card.position.lerp(chaseTarget, 0.08)
        card.rotation.x += (-0.32 - card.rotation.x) * 0.08
        card.rotation.y += (card.rotation.y + 0.28) * 0.02
        card.rotation.z += (0.1 - card.rotation.z) * 0.08
        if (isCardMaterial(material)) {
          material.opacity += (layout.id === winnerId ? 0.98 : 0.62 - material.opacity) * 0.08
          material.emissiveIntensity += ((layout.id === winnerId ? 0.12 : 0.05) - material.emissiveIntensity) * 0.08
        }
        continue
      }

      if (
        (phase === 'locking' || phase === 'revealed') &&
        layout.id === winnerId &&
        isCardMaterial(material)
      ) {
        material.emissiveIntensity += (0.2 - material.emissiveIntensity) * 0.08
      }

      if (phase === 'revealed' && layout.id !== winnerId) {
        card.visible = false
      }
    }
  })

  useEffect(() => {
    cardRefs.current.length = slipData.length
    materialRefs.current.length = slipData.length
  }, [slipData.length])

  useEffect(() => {
    const globals = window as unknown as Record<string, unknown>
    globals.__lotteryStartSpin = startSpin
    globals.__lotteryStopSpin = stopSpin
    globals.__lotteryResetCards = resetCards

    return () => {
      if (globals.__lotteryStartSpin === startSpin) delete globals.__lotteryStartSpin
      if (globals.__lotteryStopSpin === stopSpin) delete globals.__lotteryStopSpin
      if (globals.__lotteryResetCards === resetCards) delete globals.__lotteryResetCards
    }
  }, [resetCards, startSpin, stopSpin])

  return (
    <group>
      {slipData.map((slip, index) => (
        <Card
          key={slip.id}
          code={winnerSlotIndex === index && currentWinner ? currentWinner.code : DEFAULT_SLIP_CODE}
          position={slip.basePosition}
          initialRotation={slip.baseRotation}
          scale={0.34}
          ref={(el) => {
            cardRefs.current[index] = el
            materialRefs.current[index] = getCardMaterial(el)
          }}
        />
      ))}
    </group>
  )
}
