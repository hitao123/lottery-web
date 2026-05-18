import { StarField } from '@/components/three/StarField'
import { GoldParticles } from '@/components/three/GoldParticles'

export function Environment() {
  return (
    <group>
      <StarField />
      <GoldParticles />
      {/* Ambient fill light */}
      <ambientLight intensity={0.2} color={0x4444ff} />
      {/* Key light - warm gold */}
      <pointLight position={[20, 20, 20]} intensity={0.8} color={0xffd700} />
      {/* Fill light - cool blue */}
      <pointLight position={[-15, -10, -20]} intensity={0.3} color={0x4466ff} />
      {/* Rim light */}
      <pointLight position={[0, 30, -10]} intensity={0.4} color={0xffffff} />
    </group>
  )
}
