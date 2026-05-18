import { memo, forwardRef, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { useCardTexture } from './CardText'
import { CARD, COLORS_HEX } from '@/utils/constants'

interface CardProps {
  code: string
  position: [number, number, number]
  initialRotation?: [number, number, number]
}

const cardGeometry = new THREE.PlaneGeometry(CARD.width, CARD.height)

const cardMaterialProps = {
  transparent: true,
  opacity: CARD.opacity,
  roughness: 0.42,
  metalness: 0.28,
  emissive: COLORS_HEX.gold,
  emissiveIntensity: 0.05,
  side: THREE.DoubleSide,
} as const

export const Card = memo(
  forwardRef<THREE.Group, CardProps>(function Card(
    { code, position, initialRotation = [0, 0, 0] },
    ref
  ) {
    const groupRef = useRef<THREE.Group>(null)
    const texture = useCardTexture({ code })

    // Expose group ref to parent
    useImperativeHandle(ref, () => groupRef.current!, [])

    return (
      <group
        ref={groupRef}
        position={position}
        rotation={initialRotation}
      >
        <mesh geometry={cardGeometry}>
          <meshStandardMaterial map={texture} {...cardMaterialProps} />
        </mesh>
      </group>
    )
  })
)

Card.displayName = 'Card'
