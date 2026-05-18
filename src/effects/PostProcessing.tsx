import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing'
import { useLotteryStore } from '@/store/useLotteryStore'
import { BLOOM } from '@/utils/constants'

export function PostProcessing() {
  const phase = useLotteryStore((s) => s.phase)
  const bloomSettings = BLOOM[phase]

  // DOF settings per phase
  const dofSettings = {
    idle: { focusDistance: 0.02, focalLength: 0.05, bokehScale: 3 },
    spinning: { focusDistance: 0.015, focalLength: 0.04, bokehScale: 4 },
    chasing: { focusDistance: 0.01, focalLength: 0.03, bokehScale: 5 },
    locking: { focusDistance: 0.005, focalLength: 0.02, bokehScale: 6 },
    revealed: { focusDistance: 0.005, focalLength: 0.025, bokehScale: 4 },
  }

  const dof = dofSettings[phase]

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField
        focusDistance={dof.focusDistance}
        focalLength={dof.focalLength}
        bokehScale={dof.bokehScale}
      />
      <Bloom
        intensity={bloomSettings.intensity}
        luminanceThreshold={bloomSettings.luminanceThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  )
}
