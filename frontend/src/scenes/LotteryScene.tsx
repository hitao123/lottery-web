import { Suspense, useEffect, useMemo, useState } from 'react'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { Environment, SCENE_BACKGROUND_COLOR } from './Environment'
import { CardField } from './CardField'
import { CameraRig } from './CameraRig'
import { PostProcessing } from '@/effects/PostProcessing'
import { WeddingStage } from '@/components/three/WeddingStage'
import { useLotteryStore } from '@/store/useLotteryStore'
import { getStageViewportLayout } from '@/utils/responsiveStage'

export function LotteryScene() {
  const phase = useLotteryStore((s) => s.phase)
  const [viewportSize, setViewportSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const [keepRevealAnimation, setKeepRevealAnimation] = useState(false)

  useEffect(() => {
    const onResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (phase === 'revealed') {
      setKeepRevealAnimation(true)
      const settleTimer = window.setTimeout(() => setKeepRevealAnimation(false), 3200)
      return () => window.clearTimeout(settleTimer)
    }

    setKeepRevealAnimation(false)
  }, [phase])

  const layout = useMemo(() => {
    return getStageViewportLayout(viewportSize.width / Math.max(1, viewportSize.height))
  }, [viewportSize.height, viewportSize.width])
  const shouldRenderContinuously = phase !== 'idle' && (phase !== 'revealed' || keepRevealAnimation)

  return (
    <Canvas
      camera={{ position: layout.cameraPosition, fov: layout.fov, near: 0.1, far: 300 }}
      shadows={false}
      gl={{ antialias: true, alpha: false, powerPreference: 'default' }}
      frameloop={shouldRenderContinuously ? 'always' : 'demand'}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(SCENE_BACKGROUND_COLOR)
        scene.background = new THREE.Color(SCENE_BACKGROUND_COLOR)
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 10%, #8c2130 0%, #5a111c 48%, #2c070b 100%)',
      }}
      dpr={[1, 1.35]}
      resize={{ debounce: 0 }}
    >
      <CameraRig />
      <OrbitControls
        enabled={phase === 'idle' || phase === 'revealed'}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.9}
        minAzimuthAngle={-0.65}
        maxAzimuthAngle={0.65}
        target={layout.target}
      />
      <Suspense fallback={null}>
        <Environment />
        <WeddingStage />
        <CardField />
        <ContactShadows position={[0, -3.02, -1.4]} scale={layout.shadowScale} blur={2.1} far={1.8} opacity={0.08} />
        <PostProcessing />
      </Suspense>
    </Canvas>
  )
}
