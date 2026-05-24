import { Clone, Text, useGLTF } from '@react-three/drei'
import { memo, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { getStageViewportLayout } from '@/utils/responsiveStage'
type HostVariant = 'bride' | 'groom'

const goldMaterial = new THREE.MeshStandardMaterial({ color: '#d9bf92', metalness: 0.74, roughness: 0.24 })
const creamMaterial = new THREE.MeshStandardMaterial({ color: '#fff7ef', roughness: 0.8 })
const redMaterial = new THREE.MeshStandardMaterial({ color: '#b11f34', roughness: 0.32, metalness: 0.18 })
const deepRedMaterial = new THREE.MeshStandardMaterial({ color: '#8f6947', roughness: 0.72 })
const roseMaterial = new THREE.MeshStandardMaterial({ color: '#f0d7cb', roughness: 0.9 })
const blushMaterial = new THREE.MeshStandardMaterial({ color: '#fae8df', roughness: 0.94 })
const leafMaterial = new THREE.MeshStandardMaterial({ color: '#6f8c5b', roughness: 0.9 })
const boxGlassMaterial = new THREE.MeshPhysicalMaterial({
  color: '#b62538',
  transparent: true,
  opacity: 0.52,
  transmission: 0.08,
  roughness: 0.2,
  thickness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.14,
})

function WeddingModel({
  path,
  position,
  rotation,
  scale,
  variant,
}: {
  path: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  variant: HostVariant
}) {
  const phase = useLotteryStore((s) => s.phase)
  const currentWinner = useLotteryStore((s) => s.currentWinner)
  const rootRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const gltf = useGLTF(path)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        if (Array.isArray(obj.material)) {
          obj.material = obj.material.map((material) => material.clone())
        } else if (obj.material) {
          obj.material = obj.material.clone()
        }
      }
    })
  }, [scene])

  useFrame((state) => {
    const root = rootRef.current
    const model = modelRef.current
    if (!root || !model) return

    const t = state.clock.elapsedTime
    const pointing = Boolean(currentWinner) && (phase === 'locking' || phase === 'revealed')

    root.position.set(position[0], position[1], position[2])
    root.rotation.y = rotation[1] + Math.sin(t * 0.4 + (variant === 'bride' ? 0 : 0.65)) * 0.03

    model.rotation.x = Math.sin(t * 0.55 + (variant === 'groom' ? 0.3 : 0)) * 0.01
    model.rotation.z = Math.sin(t * 0.42 + (variant === 'bride' ? 0.8 : 0.2)) * 0.01

    if (pointing) {
      root.rotation.y = rotation[1] + (variant === 'bride' ? 0.16 : -0.16)
      model.rotation.z = variant === 'bride' ? -0.04 : 0.04
    }
  })

  return (
    <group ref={rootRef} position={position} rotation={rotation}>
      <group ref={modelRef} scale={scale}>
        <Clone object={scene} />
      </group>
    </group>
  )
}

function FlowerCluster({ position, scale = 1, rotation = 0 }: { position: [number, number, number]; scale?: number; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]} material={leafMaterial}>
        <sphereGeometry args={[0.24, 16, 16]} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.26, 0.28, 0.08]} material={roseMaterial}>
        <sphereGeometry args={[0.24, 16, 16]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.22, 0.32, -0.04]} material={blushMaterial}>
        <sphereGeometry args={[0.2, 16, 16]} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.42, 0.12]} material={creamMaterial}>
        <sphereGeometry args={[0.18, 16, 16]} />
      </mesh>
      <mesh castShadow position={[0.05, -0.12, 0]} rotation={[0.3, 0.2, 0]} material={leafMaterial}>
        <coneGeometry args={[0.12, 0.45, 8]} />
      </mesh>
      <mesh castShadow position={[-0.12, -0.08, -0.06]} rotation={[0.45, -0.4, 0.2]} material={leafMaterial}>
        <coneGeometry args={[0.1, 0.38, 8]} />
      </mesh>
    </group>
  )
}

function Drapery({ side }: { side: 'left' | 'right' }) {
  const sign = side === 'left' ? -1 : 1

  return (
    <group position={[sign * 5.25, 4.45, -7.35]}>
      <mesh castShadow receiveShadow rotation={[0, 0, sign * 0.1]}>
        <planeGeometry args={[2.8, 4.6, 1, 24]} />
        <meshStandardMaterial color={side === 'left' ? '#efe0d3' : '#f7efe7'} roughness={0.98} side={THREE.DoubleSide} />
      </mesh>
      <mesh castShadow position={[sign * -0.3, -0.35, 0.05]} rotation={[0, 0, sign * 0.22]}>
        <torusGeometry args={[1.05, 0.08, 16, 48, Math.PI]} />
        <meshStandardMaterial color="#c9ab79" metalness={0.72} roughness={0.22} />
      </mesh>
    </group>
  )
}

const WeddingStageInner = () => {
  const phase = useLotteryStore((s) => s.phase)
  const currentWinner = useLotteryStore((s) => s.currentWinner)
  const size = useThree((state) => state.size)
  const boardRef = useRef<THREE.Group>(null)
  const boardGlowRef = useRef<THREE.Mesh>(null)
  const archGlowRef = useRef<THREE.Mesh>(null)
  const layout = useMemo(() => {
    return getStageViewportLayout(size.width / Math.max(1, size.height))
  }, [size.height, size.width])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const board = boardRef.current
    const boardGlow = boardGlowRef.current
    const archGlow = archGlowRef.current

    if (archGlow?.material instanceof THREE.MeshBasicMaterial) {
      archGlow.material.opacity = 0.14 + Math.sin(t * 1.2) * 0.03
    }

    if (!board || !boardGlow) return

    const showBoard = Boolean(currentWinner) && (phase === 'locking' || phase === 'revealed')
    const targetScale = showBoard ? (phase === 'locking' ? 1.03 : 1) : 0.001
    const nextScale = THREE.MathUtils.lerp(board.scale.x, targetScale, 0.16)
    board.scale.setScalar(nextScale)
    board.position.y = 3.1 + Math.sin(t * 1.1) * (showBoard ? 0.03 : 0)

    if (boardGlow.material instanceof THREE.MeshBasicMaterial) {
      boardGlow.material.opacity = showBoard ? 0.26 + Math.sin(t * 2.2) * 0.05 : 0
    }
  })

  return (
    <group position={[0, -3.62, 0]} scale={layout.stageScale}>
      <mesh receiveShadow position={[0, -0.54, -2.5]} material={deepRedMaterial}>
        <cylinderGeometry args={[8.6, 9.2, 0.82, 64]} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, -0.02, -2.05]} material={redMaterial}>
        <cylinderGeometry args={[6.55, 6.95, 0.9, 64]} />
      </mesh>

      <mesh receiveShadow position={[0, 0.45, -2.0]} rotation={[-Math.PI / 2, 0, 0]} material={creamMaterial}>
        <circleGeometry args={[5.35, 64]} />
      </mesh>

      <mesh position={[0, 0.47, -2.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4.1, 4.65, 64]} />
        <meshStandardMaterial color="#dbc192" metalness={0.5} roughness={0.36} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 3.7, -8.15]}>
        <boxGeometry args={[8.8, 5.2, 0.4]} />
        <meshStandardMaterial color="#fbf1e5" roughness={0.84} />
      </mesh>
      <mesh position={[0, 3.78, -7.92]}>
        <planeGeometry args={[7.8, 4.1]} />
        <meshStandardMaterial color="#f2e2d4" roughness={0.95} />
      </mesh>
      <mesh ref={archGlowRef} position={[0, 3.75, -7.78]}>
        <planeGeometry args={[7.1, 3.6]} />
        <meshBasicMaterial color="#fff3d1" transparent opacity={0.14} />
      </mesh>

      <Text position={[0, 4.9, -7.65]} fontSize={0.52} color="#9a6e3f" anchorX="center" anchorY="middle" fontWeight={700}>
        WEDDING LOTTERY
      </Text>
      <Text position={[0, 4.3, -7.65]} fontSize={0.28} color="#c8a27b" anchorX="center" anchorY="middle">
        Lucky Wedding Day
      </Text>

      <mesh castShadow position={[0, 4.25, -7.55]} material={goldMaterial}>
        <torusGeometry args={[4.85, 0.14, 20, 96, Math.PI]} />
      </mesh>
      <mesh castShadow position={[0, 4.25, -7.82]} material={goldMaterial}>
        <torusGeometry args={[4.85, 0.14, 20, 96, Math.PI]} />
      </mesh>
      <mesh castShadow receiveShadow position={[-4.85, 3.1, -7.72]} material={goldMaterial}>
        <cylinderGeometry args={[0.14, 0.14, 2.8, 20]} />
      </mesh>
      <mesh castShadow receiveShadow position={[4.85, 3.1, -7.72]} material={goldMaterial}>
        <cylinderGeometry args={[0.14, 0.14, 2.8, 20]} />
      </mesh>

      <Drapery side="left" />
      <Drapery side="right" />

      <FlowerCluster position={[-4.7, 5.2, -7.42]} scale={1.45} rotation={0.3} />
      <FlowerCluster position={[4.7, 5.16, -7.42]} scale={1.45} rotation={-0.3} />
      <FlowerCluster position={[-5.05, 2.35, -7.1]} scale={1.22} rotation={0.8} />
      <FlowerCluster position={[5.05, 2.35, -7.1]} scale={1.22} rotation={-0.8} />
      <FlowerCluster position={[-2.75, 0.62, 0.82]} scale={1.15} rotation={0.55} />
      <FlowerCluster position={[2.75, 0.62, 0.82]} scale={1.15} rotation={-0.55} />

      <mesh castShadow receiveShadow position={[0, 0.3, 0.96]} material={redMaterial}>
        <cylinderGeometry args={[2.2, 2.4, 0.24, 40]} />
      </mesh>
      <mesh castShadow position={[0, 0.46, 1.02]} material={goldMaterial}>
        <torusGeometry args={[2.18, 0.07, 16, 48]} />
      </mesh>

      <WeddingModel
        path="/models/bride.glb"
        position={[-2.55, 0.54, 0.78]}
        rotation={[0, 0.08, 0]}
        scale={3.18}
        variant="bride"
      />
      <WeddingModel
        path="/models/groom.glb"
        position={[2.55, 0.52, 0.74]}
        rotation={[0, -0.08, 0]}
        scale={3.18}
        variant="groom"
      />

      <group ref={boardRef} position={[0, 4.02, -0.1]} scale={0.001}>
        <mesh ref={boardGlowRef} position={[0, 0.02, -0.08]}>
          <planeGeometry args={[4.1, 1.72]} />
          <meshBasicMaterial color="#fff4d8" transparent opacity={0} />
        </mesh>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[3.46, 1.12, 0.18]} />
          <meshStandardMaterial color="#b58c58" metalness={0.18} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[3.08, 0.8]} />
          <meshStandardMaterial color="#fff8ef" />
        </mesh>
        <Text position={[0, 0.22, 0.12]} fontSize={0.13} color="#c8a983" anchorX="center" anchorY="middle">
          婚礼幸运签
        </Text>
        <Text position={[0, -0.02, 0.12]} fontSize={0.38} color="#9a6e3f" anchorX="center" anchorY="middle" fontWeight={700}>
          {currentWinner ? currentWinner.code : ''}
        </Text>
        <Text position={[0, -0.27, 0.12]} fontSize={0.11} color="#c29e73" anchorX="center" anchorY="middle">
          Lucky Wedding Day
        </Text>
      </group>

      <group position={[0, 0.92, 1.02]}>
        <mesh castShadow receiveShadow material={boxGlassMaterial}>
          <boxGeometry args={[3.02, 1.82, 2.18]} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -0.52, 0]} material={redMaterial}>
          <boxGeometry args={[2.7, 0.16, 1.82]} />
        </mesh>
        <mesh castShadow position={[0, 1.02, 0]} material={goldMaterial}>
          <boxGeometry args={[3.14, 0.12, 2.28]} />
        </mesh>
        <mesh castShadow position={[0, 0.18, 1.05]} material={goldMaterial}>
          <boxGeometry args={[2.9, 0.08, 0.08]} />
        </mesh>
        <mesh castShadow position={[0, -0.08, 1.12]} material={goldMaterial}>
          <boxGeometry args={[1.42, 0.36, 0.1]} />
        </mesh>
        <Text
          position={[0, -0.08, 1.19]}
          rotation={[0, 0, 0]}
          fontSize={0.18}
          color="#fff7ef"
          anchorX="center"
          anchorY="middle"
          fontWeight={700}
        >
          抽奖箱
        </Text>
        <mesh castShadow position={[0, -0.8, 0]} material={goldMaterial}>
          <cylinderGeometry args={[1.05, 1.12, 0.12, 32]} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.45, 40]} />
          <meshBasicMaterial color="#f7dcb0" transparent opacity={0.18} />
        </mesh>
      </group>
    </group>
  )
}

useGLTF.preload('/models/bride.glb')
useGLTF.preload('/models/groom.glb')

export const WeddingStage = memo(WeddingStageInner)
