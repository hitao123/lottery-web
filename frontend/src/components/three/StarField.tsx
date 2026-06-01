import { Stars } from '@react-three/drei'
import { SCENE } from '@/utils/constants'

export function StarField() {
  return (
    <Stars
      radius={SCENE.starDepth}
      depth={16}
      count={SCENE.starCount}
      factor={2.1}
      saturation={0.6}
      fade
      speed={0.05}
    />
  )
}
