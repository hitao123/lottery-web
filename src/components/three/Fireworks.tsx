import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { COLORS_HEX, SCENE } from '@/utils/constants'

const FIREWORK_COLORS = [
  COLORS_HEX.gold,
  COLORS_HEX.goldBright,
  COLORS_HEX.cream,
  0xffffff,
  0x8899cc,
  COLORS_HEX.goldLight,
]
const BURST_COUNT = 5

export function Fireworks() {
  const pointsRef = useRef<THREE.Points>(null)
  const phase = useLotteryStore((s) => s.phase)
  const currentWinnerId = useLotteryStore((s) => s.currentWinner?.id ?? null)
  const count = SCENE.fireworkParticleCount

  const { positions, velocities, lifetimes, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifetimes = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    return { positions, velocities, lifetimes, colors }
  }, [count])

  const activeRef = useRef(false)
  const startTimeRef = useRef(0)
  const lastWinnerIdRef = useRef<number | null>(null)

  const resetBursts = (elapsedTime: number) => {
    startTimeRef.current = elapsedTime
    activeRef.current = true

    for (let i = 0; i < count; i++) {
      const burstIndex = i % BURST_COUNT
      const burstAngle = (burstIndex / BURST_COUNT) * Math.PI * 2
      const burstRadius = 0.8 + burstIndex * 0.35
      const originX = Math.cos(burstAngle) * burstRadius
      const originY = 0.3 + (burstIndex % 2) * 0.7
      const originZ = 4.5 + Math.sin(burstAngle) * 0.15

      positions[i * 3] = originX
      positions[i * 3 + 1] = originY
      positions[i * 3 + 2] = originZ

      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speed = 2.0 + Math.random() * 2.8

      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[i * 3 + 1] = Math.cos(phi) * speed + 1.2
      velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed * 0.4
      lifetimes[i] = 0

      const color = new THREE.Color(FIREWORK_COLORS[(i + burstIndex) % FIREWORK_COLORS.length])
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
  }

  useFrame((state, delta) => {
    const points = pointsRef.current
    if (!points) return

    if (phase === 'revealed' && currentWinnerId !== null && currentWinnerId !== lastWinnerIdRef.current) {
      lastWinnerIdRef.current = currentWinnerId
      resetBursts(state.clock.elapsedTime)
    }

    if (phase === 'idle') {
      activeRef.current = false
      points.visible = false
      return
    }

    if (!activeRef.current) {
      points.visible = false
      return
    }

    points.visible = true
    const dt = Math.min(delta, 0.033)
    const elapsed = state.clock.elapsedTime - startTimeRef.current
    let aliveCount = 0

    for (let i = 0; i < count; i++) {
      lifetimes[i] += dt
      const life = lifetimes[i]
      if (life > 2.0) continue

      aliveCount += 1
      positions[i * 3] += velocities[i * 3] * dt
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt

      velocities[i * 3] *= 0.984
      velocities[i * 3 + 1] -= 3.6 * dt
      velocities[i * 3 + 2] *= 0.987
    }

    points.geometry.attributes.position.needsUpdate = true
    const material = points.material as THREE.PointsMaterial
    material.opacity = Math.max(0, 0.95 - elapsed / 2.0)
    material.size = 0.1 + Math.sin(elapsed * 12) * 0.015

    if (aliveCount === 0) {
      activeRef.current = false
      points.visible = false
    }
  })

  return (
    <points ref={pointsRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
