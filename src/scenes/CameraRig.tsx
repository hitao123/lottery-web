import { useFrame } from '@react-three/fiber'
import { useLotteryStore } from '@/store/useLotteryStore'
import { SCENE } from '@/utils/constants'

export function CameraRig() {
  const phase = useLotteryStore((s) => s.phase)

  useFrame((state) => {
    const camera = state.camera
    const t = state.clock.elapsedTime

    if (phase === 'idle') {
      // Slow cinematic orbit
      const radius = SCENE.cameraIdleDistance
      const speed = 0.03
      camera.position.x = Math.sin(t * speed) * radius
      camera.position.z = Math.cos(t * speed) * radius
      camera.position.y = Math.sin(t * speed * 0.5) * 2
      camera.lookAt(0, 0, 0)
    }
    // Other phases handled by GSAP timeline
  })

  return null
}
