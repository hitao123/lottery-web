import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useLotteryStore } from '@/store/useLotteryStore'
import { BLOOM } from '@/utils/constants'

export function PostProcessing() {
  const phase = useLotteryStore((s) => s.phase)
  const bloomSettings = BLOOM[phase]

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomSettings.intensity}
        luminanceThreshold={bloomSettings.luminanceThreshold}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  )
}
