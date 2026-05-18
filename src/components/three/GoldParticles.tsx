import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE, COLORS_HEX } from '@/utils/constants'

export function GoldParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = SCENE.goldParticleCount

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      // Distribute in a large sphere
      const radius = 15 + Math.random() * 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = radius * Math.cos(phi)
    }

    return arr
  }, [count])

  // Store initial positions for noise-based movement
  const initialPositions = useMemo(() => new Float32Array(positions), [positions])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime * 0.1
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      // Simple sine-based drift for organic motion
      posArr[ix] = initialPositions[ix] + Math.sin(t + i * 0.1) * 0.3
      posArr[ix + 1] = initialPositions[ix + 1] + Math.cos(t * 0.7 + i * 0.15) * 0.3
      posArr[ix + 2] = initialPositions[ix + 2] + Math.sin(t * 0.5 + i * 0.2) * 0.2
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color={COLORS_HEX.gold}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
