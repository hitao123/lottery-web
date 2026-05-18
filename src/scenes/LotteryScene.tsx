import { Canvas } from '@react-three/fiber'
import { Environment } from './Environment'
import { CardField } from './CardField'
import { CameraRig } from './CameraRig'
import { PostProcessing } from '@/effects/PostProcessing'

export function LotteryScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 28], fov: 55, near: 0.1, far: 300 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#050510',
      }}
      dpr={[1, 1.5]}
    >
      <CameraRig />
      <Environment />
      <CardField />
      <PostProcessing />
    </Canvas>
  )
}
