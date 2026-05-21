import { StarField } from '@/components/three/StarField'
import { GoldParticles } from '@/components/three/GoldParticles'
import { Fireworks } from '@/components/three/Fireworks'
import { COLORS_HEX } from '@/utils/constants'

export function Environment() {
  return (
    <group>
      <color attach="background" args={[COLORS_HEX.spaceDeep]} />
      <fog attach="fog" args={[COLORS_HEX.spaceMid, 35, 120]} />
      <StarField />
      <GoldParticles />
      <Fireworks />
      {/* Cool neutral ambient */}
      <ambientLight intensity={0.2} color={0x404050} />
      {/* Key light — cool white from upper right */}
      <directionalLight position={[22, 18, 12]} intensity={0.6} color={0xf0f0ff} />
      {/* Single gold accent — below-front for subtle warmth */}
      <pointLight position={[0, -8, 18]} intensity={0.35} color={COLORS_HEX.gold} />
      {/* Blue rim light — premium depth */}
      <pointLight position={[-18, 10, -10]} intensity={0.2} color={0x4466aa} />
      {/* Dim fill — prevents crushing blacks */}
      <pointLight position={[15, -5, -15]} intensity={0.1} color={0x303040} />
    </group>
  )
}
