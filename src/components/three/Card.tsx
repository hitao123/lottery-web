import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useCardTexture } from './CardText'
import { CARD, COLORS_HEX } from '@/utils/constants'
import { useLotteryStore } from '@/store/useLotteryStore'

interface CardProps {
  code: string
  position: [number, number, number]
  initialRotation?: [number, number, number]
}

export const Card = forwardRef<THREE.Group, CardProps>(
  function Card({ code, position, initialRotation = [0, 0, 0] }, ref) {
    const groupRef = useRef<THREE.Group>(null)
    const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)
    const texture = useCardTexture({ code })
    const phase = useLotteryStore((s) => s.phase)

    // Expose group ref to parent
    useImperativeHandle(ref, () => groupRef.current!, [])

    // Per-card random values for organic feel
    const randoms = useMemo(
      () => ({
        rotSpeed: 0.1 + Math.random() * 0.2,
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatAmplitude: 0.1 + Math.random() * 0.2,
        floatOffset: Math.random() * Math.PI * 2,
        breathOffset: Math.random() * Math.PI * 2,
        orbitSpeed: (Math.random() - 0.5) * 0.4,
        orbitAxis: Math.random() * Math.PI,
      }),
      []
    )

    useFrame((state) => {
      if (!groupRef.current) return
      const t = state.clock.elapsedTime
      const mesh = groupRef.current

      if (phase === 'idle') {
        // Slow Y rotation
        mesh.rotation.y += randoms.rotSpeed * 0.01
        // Floating motion (only vertical, keep x/z stable)
        mesh.position.y =
          position[1] +
          Math.sin(t * randoms.floatSpeed + randoms.floatOffset) * randoms.floatAmplitude
        // Breathing glow
        if (materialRef.current) {
          materialRef.current.emissiveIntensity =
            0.1 + Math.sin(t * 0.8 + randoms.breathOffset) * 0.05
        }
      } else if (phase === 'spinning') {
        // Faster rotation around own axis
        mesh.rotation.y += randoms.rotSpeed * 0.08
        mesh.rotation.x += randoms.rotSpeed * 0.03
        // Orbital motion around original position (not toward center!)
        const orbitRadius = 0.5
        mesh.position.x = position[0] + Math.sin(t * 2 + randoms.floatOffset) * orbitRadius
        mesh.position.y = position[1] + Math.cos(t * 1.5 + randoms.orbitAxis) * orbitRadius
        mesh.position.z = position[2] + Math.sin(t * 1.8 + randoms.breathOffset) * orbitRadius * 0.5
        // Increase glow
        if (materialRef.current) {
          materialRef.current.emissiveIntensity = 0.2
        }
      }
      // CHASING, LOCKING, REVEALED: driven by GSAP timeline (no useFrame interference)
    })

    return (
      <group
        ref={groupRef}
        position={position}
        rotation={initialRotation}
      >
        <RoundedBox
          args={[CARD.width, CARD.height, CARD.depth]}
          radius={CARD.borderRadius}
          smoothness={4}
        >
          <meshPhysicalMaterial
            ref={materialRef}
            map={texture}
            transparent
            opacity={0.85}
            roughness={0.2}
            metalness={0.1}
            transmission={0.1}
            thickness={0.5}
            emissive={COLORS_HEX.gold}
            emissiveIntensity={0.1}
            side={THREE.DoubleSide}
          />
        </RoundedBox>
      </group>
    )
  }
)
