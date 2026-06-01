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
    const whiteColor = new THREE.Color(0xfffaf3)
    const roseColor = new THREE.Color(0xffc4d3)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24
      positions[i * 3 + 1] = -1 + Math.random() * 14
      positions[i * 3 + 2] = -10 + Math.random() * 18

      const r = Math.random()
      const color = r < 0.4 ? goldColor : r < 0.68 ? brightColor : r < 0.88 ? whiteColor : roseColor
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return { positions, colors }
  }, [count])

  const initialPositions = useMemo(() => new Float32Array(positions), [positions])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.elapsedTime
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      posArr[ix] = initialPositions[ix] + Math.sin(t * 0.22 + i * 0.8) * 0.12
      posArr[ix + 1] = ((initialPositions[ix + 1] + t * (0.14 + (i % 4) * 0.008) + i * 0.018) % 16) - 2
      posArr[ix + 2] = initialPositions[ix + 2] + Math.cos(t * 0.18 + i * 0.45) * 0.14
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
        size={0.09}
        vertexColors
        transparent
        opacity={0.42}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
