import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { COLORS_HEX } from '@/utils/constants'

/**
 * Heart-shaped particles that burst outward during the REVEALED phase.
 */
export function HeartParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const phase = useLotteryStore((s) => s.phase)
  const count = 40

  // Pre-compute particle data
  const { positions, velocities, lifetimes } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const lifetimes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Start at center
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 5

      // Random outward velocity
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = 2 + Math.random() * 4
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed + 2 // bias upward
      velocities[i * 3 + 2] = Math.cos(phi) * speed * 0.3

      lifetimes[i] = 0
    }

    return { positions, velocities, lifetimes }
  }, [count])

  const startTimeRef = useRef<number>(0)
  const activeRef = useRef(false)

  useFrame((state) => {
    if (!pointsRef.current) return

    // Activate particles when entering revealed/locking phase
    if ((phase === 'revealed' || phase === 'locking') && !activeRef.current) {
      activeRef.current = true
      startTimeRef.current = state.clock.elapsedTime
      // Reset positions
      for (let i = 0; i < count; i++) {
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 5
        lifetimes[i] = 0
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
    const dt = 0.016 // Approximate frame time

    for (let i = 0; i < count; i++) {
      lifetimes[i] += dt
      const life = lifetimes[i]

      if (life > 3) continue // Particle expired

      // Update position with velocity and gravity
      positions[i * 3] += velocities[i * 3] * dt
      positions[i * 3 + 1] += velocities[i * 3 + 1] * dt - 0.5 * dt // gravity
      positions[i * 3 + 2] += velocities[i * 3 + 2] * dt

      // Slow down over time
      velocities[i * 3] *= 0.99
      velocities[i * 3 + 1] *= 0.99
      velocities[i * 3 + 2] *= 0.99
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // Fade out after 3 seconds
    const material = pointsRef.current.material as THREE.PointsMaterial
    material.opacity = Math.max(0, 1 - elapsed / 3)
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
