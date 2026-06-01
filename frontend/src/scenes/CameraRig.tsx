import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useLotteryStore } from '@/store/useLotteryStore'
import { getStageViewportLayout } from '@/utils/responsiveStage'

export function CameraRig() {
  const phase = useLotteryStore((s) => s.phase)
  const shakeRef = useRef({ active: false, startTime: 0 })
  const prevPhaseRef = useRef(phase)

  useFrame((state) => {
    const camera = state.camera
    const t = state.clock.elapsedTime
    const aspect = state.size.width / Math.max(1, state.size.height)
    const layout = getStageViewportLayout(aspect)

    if (phase === 'spinning') {
      // 洗牌阶段：在基础机位上整体后撤 + 略微下压视线，
      // 保证抽奖球与新郎新娘都完整在画面内，不会被拉近切掉。
      camera.position.x = layout.cameraPosition[0] + Math.sin(t * 0.24) * 0.24
      camera.position.y = layout.cameraPosition[1] + 0.3 + Math.cos(t * 0.34) * 0.05
      camera.position.z = layout.cameraPosition[2] + 2.7 + Math.sin(t * 0.22) * 0.12
      camera.lookAt(layout.target[0], layout.target[1] - 0.58, layout.target[2])
    }

    if (phase !== 'spinning') {
      camera.rotation.z *= 0.9
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
