import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useLotteryStore } from '@/store/useLotteryStore'
import { SCENE } from '@/utils/constants'

export function CameraRig() {
  const phase = useLotteryStore((s) => s.phase)
  const shakeRef = useRef({ active: false, startTime: 0 })
  const prevPhaseRef = useRef(phase)

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

    // Trigger shake when entering locking phase
    if (phase === 'locking' && prevPhaseRef.current !== 'locking') {
      shakeRef.current.active = true
      shakeRef.current.startTime = t
    }

    // Apply micro-shake during locking (decays over 0.4s)
    if (shakeRef.current.active && phase === 'locking') {
      const elapsed = t - shakeRef.current.startTime
      const decay = Math.max(0, 1 - elapsed / 0.4)
      if (decay > 0) {
        const intensity = 0.06 * decay
        camera.position.x += (Math.random() - 0.5) * intensity
        camera.position.y += (Math.random() - 0.5) * intensity
      } else {
        shakeRef.current.active = false
      }
    }

    prevPhaseRef.current = phase
  })

  return null
}
