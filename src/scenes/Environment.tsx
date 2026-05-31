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
        position={[-7, 13, 14]}
        angle={0.54}
        penumbra={0.95}
        intensity={20}
        color={0xffe0bb}
      />
      <spotLight
        position={[7, 13, 14]}
        angle={0.54}
        penumbra={0.95}
        intensity={20}
        color={0xffe9d0}
      />
      <pointLight position={[0, 5.2, 5]} intensity={5.8} distance={24} color={0xfff0d8} />
      <pointLight position={[0, 2.4, -8]} intensity={2.4} distance={18} color={0xb98d66} />
    </group>
  )
}
