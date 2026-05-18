import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
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
    const materialRef = useRef<THREE.MeshStandardMaterial>(null)
    const texture = useCardTexture({ code })
    const phase = useLotteryStore((s) => s.phase)

    // Expose group ref to parent
    useImperativeHandle(ref, () => groupRef.current!, [])

    // Per-card random values for organic feel
    const randoms = useMemo(
      () => ({
        rotSpeed: 0.08 + Math.random() * 0.12,
        floatSpeed: 0.2 + Math.random() * 0.3,
        floatAmplitude: 0.08 + Math.random() * 0.12,
        floatOffset: Math.random() * Math.PI * 2,
        breathOffset: Math.random() * Math.PI * 2,
      }),
      []
    )

    useFrame((state) => {
      if (!groupRef.current) return
      const t = state.clock.elapsedTime
      const group = groupRef.current

      if (phase === 'idle') {
        // Gentle Y rotation
        group.rotation.y += randoms.rotSpeed * 0.005
        // Soft floating
        group.position.y =
          position[1] +
          Math.sin(t * randoms.floatSpeed + randoms.floatOffset) * randoms.floatAmplitude
        // Subtle breathing glow
        if (materialRef.current) {
          materialRef.current.emissiveIntensity =
            0.05 + Math.sin(t * 0.6 + randoms.breathOffset) * 0.03
        }
      } else if (phase === 'spinning') {
        // Faster rotation
        group.rotation.y += randoms.rotSpeed * 0.04
        // Slightly more energetic float
        group.position.y =
          position[1] +
          Math.sin(t * 1.5 + randoms.floatOffset) * randoms.floatAmplitude * 2
        if (materialRef.current) {
          materialRef.current.emissiveIntensity = 0.15
        }
      }
      // CHASING, LOCKING, REVEALED: driven by GSAP timeline
    })

    return (
      <group
        ref={groupRef}
        position={position}
        rotation={initialRotation}
      >
        <mesh>
          <planeGeometry args={[CARD.width, CARD.height]} />
          <meshStandardMaterial
            ref={materialRef}
            map={texture}
            transparent
            opacity={0.92}
            roughness={0.4}
            metalness={0.3}
            emissive={COLORS_HEX.gold}
            emissiveIntensity={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    )
  }
)
