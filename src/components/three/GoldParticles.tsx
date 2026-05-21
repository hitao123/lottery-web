import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE, COLORS_HEX } from '@/utils/constants'

export function GoldParticles() {
  const pointsRef = useRef<THREE.Points>(null)
  const count = SCENE.goldParticleCount

  const { positions, colors: particleColors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const goldColor = new THREE.Color(COLORS_HEX.gold)
    const brightColor = new THREE.Color(COLORS_HEX.goldBright)
    const whiteColor = new THREE.Color(0xffffff)

    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 50
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      // 60% champagne gold, 25% bright gold, 15% pure white sparkle
      const r = Math.random()
      const color = r < 0.6 ? goldColor : r < 0.85 ? brightColor : whiteColor
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return { positions, colors }
  }, [count])

  const initialPositions = useMemo(() => new Float32Array(positions), [positions])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime * 0.04
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      posArr[ix] = initialPositions[ix] + Math.sin(t + i * 0.3) * 0.2
      posArr[ix + 1] = initialPositions[ix + 1] + Math.cos(t * 0.7 + i * 0.4) * 0.2
      posArr[ix + 2] = initialPositions[ix + 2] + Math.sin(t * 0.5 + i * 0.5) * 0.15
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[particleColors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
