import { Stars } from '@react-three/drei'
import { SCENE } from '@/utils/constants'

export function StarField() {
  return (
    <Stars
      radius={SCENE.starDepth}
      depth={50}
      count={SCENE.starCount}
      factor={3}
      saturation={0}
      fade
      speed={0.3}
    />
  )
}
