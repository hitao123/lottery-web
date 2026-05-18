import { StarField } from '@/components/three/StarField'
import { GoldParticles } from '@/components/three/GoldParticles'
import { HeartParticles } from '@/components/three/HeartParticles'

export function Environment() {
  return (
    <group>
      <StarField />
      <GoldParticles />
      <HeartParticles />
      {/* Subtle ambient — dark scene */}
      <ambientLight intensity={0.15} color={0x334477} />
      {/* Key light — warm gold, far away */}
      <directionalLight position={[20, 15, 10]} intensity={0.4} color={0xc9a96e} />
      {/* Fill — very subtle cool */}
      <pointLight position={[-20, -10, -15]} intensity={0.15} color={0x4466aa} />
    </group>
  )
}
