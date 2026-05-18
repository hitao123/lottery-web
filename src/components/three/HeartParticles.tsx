import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { COLORS_HEX, SCENE } from '@/utils/constants'

/**
 * Heart-shaped particles that burst outward during the REVEALED phase.
 */
export function HeartParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const phase = useLotteryStore((s) => s.phase)
  const count = SCENE.heartParticleCount

  // Pre-compute particle data
  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifetimes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Start at center
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 4

      // Random outward velocity
      const theta = Math.random() * Math.PI * 2
      const radius = 2.4 + Math.random() * 3.6
      velocities[i * 3] = Math.cos(theta) * radius * (0.7 + Math.random() * 0.5)
      velocities[i * 3 + 1] = 2.2 + Math.random() * 2.6
      velocities[i * 3 + 2] = Math.sin(theta) * radius * (0.25 + Math.random() * 0.55)

      lifetimes[i] = 0
    }

    return { positions, velocities, lifetimes }
  }, [count])

  const startTimeRef = useRef<number>(0)
  const activeRef = useRef(false)

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    // Activate particles when entering revealed/locking phase
    if ((phase === 'revealed' || phase === 'locking') && !activeRef.current) {
      activeRef.current = true
      startTimeRef.current = state.clock.elapsedTime
      // Reset positions
      for (let i = 0; i < count; i++) {
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 4
        lifetimes[i] = 0

        const theta = Math.random() * Math.PI * 2
        const radius = 2.4 + Math.random() * 3.6
        velocities[i * 3] = Math.cos(theta) * radius * (0.7 + Math.random() * 0.5)
        velocities[i * 3 + 1] = 2.2 + Math.random() * 2.6
        velocities[i * 3 + 2] = Math.sin(theta) * radius * (0.25 + Math.random() * 0.55)
      }
    }

    if (phase === 'idle') {
      activeRef.current = false
    }

    if (!activeRef.current) {
      pointsRef.current.visible = false
      return
    }

    pointsRef.current.visible = true
    const elapsed = state.clock.elapsedTime - startTimeRef.current
    const dt = Math.min(delta, 0.033)
    let aliveCount = 0

    for (let i = 0; i < count; i++) {
      lifetimes[i] += dt
      const life = lifetimes[i]

      if (life > 2.8) continue // Particle expired
      aliveCount += 1

      const spiral = 1 + Math.sin(life * 7 + i * 0.6) * 0.35
      positions[i * 3] += velocities[i * 3] * dt * spiral
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt - 0.9 * dt
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt * 0.9

      velocities[i * 3] *= 0.985
      velocities[i * 3 + 1] *= 0.985
      velocities[i * 3 + 2] *= 0.988
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    const material = pointsRef.current.material as THREE.PointsMaterial
    material.opacity = Math.max(0, 0.95 - elapsed / 2.8)
    material.size = 0.13 + Math.sin(elapsed * 6) * 0.02

    if (aliveCount === 0 && phase === 'revealed') {
      pointsRef.current.visible = false
    }
  })

  return (
    <points ref={pointsRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={COLORS_HEX.goldLight}
        transparent
        opacity={1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
