import { GoldParticles } from '@/components/three/GoldParticles'
import { Fireworks } from '@/components/three/Fireworks'
export function Environment() {
  return (
    <group>
      <color attach="background" args={[0x140d08]} />
      <fog attach="fog" args={[0x3e2e22, 24, 60]} />
      <GoldParticles />
      <Fireworks />
      <ambientLight intensity={0.96} color={0xfff4ea} />
      <hemisphereLight intensity={0.76} color={0xfff8ef} groundColor={0x6d5845} />
      <spotLight
        castShadow
        position={[-7, 13, 14]}
        angle={0.54}
        penumbra={0.95}
        intensity={42}
        color={0xffe0bb}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        castShadow
        position={[7, 13, 14]}
        angle={0.54}
        penumbra={0.95}
        intensity={42}
        color={0xffe9d0}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[0, 5.2, 5]} intensity={13} distance={26} color={0xfff0d8} />
      <pointLight position={[0, 2.4, -8]} intensity={4} distance={20} color={0xb98d66} />
      <pointLight position={[-5.4, 5.4, -3]} intensity={5} distance={16} color={0xffebdc} />
      <pointLight position={[5.4, 5.4, -3]} intensity={5} distance={16} color={0xfff0da} />
    </group>
  )
}
