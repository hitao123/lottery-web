import { StarField } from '@/components/three/StarField'
import { GoldParticles } from '@/components/three/GoldParticles'
import { HeartParticles } from '@/components/three/HeartParticles'
import { COLORS_HEX } from '@/utils/constants'

export function Environment() {
  return (
    <group>
      <color attach="background" args={[COLORS_HEX.spaceDeep]} />
      <fog attach="fog" args={[COLORS_HEX.spaceMid, 34, 118]} />
      <StarField />
      <GoldParticles />
      <HeartParticles />
      <ambientLight intensity={0.22} color={COLORS_HEX.ruby} />
      <directionalLight position={[22, 18, 12]} intensity={0.62} color={COLORS_HEX.goldLight} />
      <pointLight position={[-18, 10, -10]} intensity={0.5} color={COLORS_HEX.rose} />
      <pointLight position={[0, -10, 24]} intensity={0.35} color={COLORS_HEX.gold} />
    </group>
  )
}
