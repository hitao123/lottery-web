import { useMemo } from 'react'
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { useLotteryStore } from '@/store/useLotteryStore'
import { POSTPROCESSING } from '@/utils/constants'

export function PostProcessing() {
  const phase = useLotteryStore((s) => s.phase)
  const settings = POSTPROCESSING[phase]
  const chromaticOffset = useMemo(
    () => new Vector2(...settings.chromaticOffset),
    [settings.chromaticOffset]
  )

  return (
    <EffectComposer multisampling={0} resolutionScale={0.75}>
      <Bloom
        intensity={settings.bloomIntensity}
        luminanceThreshold={settings.luminanceThreshold}
        luminanceSmoothing={0.9}
        radius={settings.bloomRadius}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromaticOffset}
        radialModulation
        modulationOffset={0.2}
      />
      <Noise opacity={settings.noiseOpacity} premultiply />
      <Vignette offset={0.28} darkness={settings.vignetteDarkness} />
    </EffectComposer>
  )
}
