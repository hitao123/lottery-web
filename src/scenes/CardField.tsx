import { useCallback, useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { getStageViewportLayout } from '@/utils/responsiveStage'
import {
  startBackgroundMusic,
  stopBackgroundMusic,
  playChasingSound,
  playLockingSound,
  playRevealSound,
} from '@/utils/audio'

export function CardField() {
  const setPhase = useLotteryStore((s) => s.setPhase)
  const selectWinner = useLotteryStore((s) => s.selectWinner)
  const camera = useThree((state) => state.camera as THREE.PerspectiveCamera)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  const resetCards = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    const layout = getStageViewportLayout(camera.aspect || 16 / 9)
    camera.position.set(...layout.cameraPosition)
    camera.lookAt(...layout.target)
    camera.fov = layout.fov
    camera.updateProjectionMatrix()
  }, [camera])

  const startSpin = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'idle') return
    setPhase('spinning')
    startBackgroundMusic()
  }, [setPhase])

  const stopSpin = useCallback(() => {
    const { phase } = useLotteryStore.getState()
    if (phase !== 'spinning') return

    stopBackgroundMusic()

    const winner = selectWinner()
    if (!winner) return

    setPhase('chasing')
    playChasingSound()

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    const layout = getStageViewportLayout(camera.aspect || 16 / 9)
    const [camX, camY, camZ] = layout.cameraPosition
    const [tgtX, tgtY, tgtZ] = layout.target

    const timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        setPhase('revealed')
        playRevealSound()
        useLotteryStore.getState().confirmWinner()
      },
    })

    timeline.to(
      camera.position,
      {
        x: camX,
        y: camY + 0.3,
        z: camZ + 2.85,
        duration: 1.2,
        ease: 'sine.inOut',
        onUpdate: () => camera.lookAt(tgtX, tgtY - 0.55, tgtZ),
      },
      0
    )

    timeline.to(
      camera,
      {
        fov: layout.fov + 3,
        duration: 1.2,
        ease: 'sine.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      0
    )

    timeline.call(() => {
      setPhase('locking')
      playLockingSound()
    }, [], 1.2)

    timeline.to(
      camera.position,
      {
        x: 0,
        y: camY + 0.12,
        z: camZ + 2.25,
        duration: 0.72,
        ease: 'expo.out',
        onUpdate: () => camera.lookAt(tgtX, tgtY - 0.28, tgtZ),
      },
      1.2
    )

    timeline.to(
      camera,
      {
        fov: layout.fov + 2,
        duration: 0.66,
        ease: 'expo.out',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      1.2
    )

    timelineRef.current = timeline
    timeline.play()
  }, [camera, selectWinner, setPhase])

  useEffect(() => {
    const globals = window as unknown as Record<string, unknown>
    globals.__lotteryStartSpin = startSpin
    globals.__lotteryStopSpin = stopSpin
    globals.__lotteryResetCards = resetCards

    return () => {
      if (globals.__lotteryStartSpin === startSpin) delete globals.__lotteryStartSpin
      if (globals.__lotteryStopSpin === stopSpin) delete globals.__lotteryStopSpin
      if (globals.__lotteryResetCards === resetCards) delete globals.__lotteryResetCards
    }
  }, [resetCards, startSpin, stopSpin])

  return null
}
