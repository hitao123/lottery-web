import { Canvas } from '@react-three/fiber'
import { Environment } from './Environment'
import { CardField } from './CardField'
import { CameraRig } from './CameraRig'
import { PostProcessing } from '@/effects/PostProcessing'

export function LotteryScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 30], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ background: '#0a0a1a' }}
      dpr={[1, 2]}
    >
      <CameraRig />
      <Environment />
      <CardField />
      <PostProcessing />
    </Canvas>
  )
}
