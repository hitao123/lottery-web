export type StageViewportLayout = {
  cameraPosition: [number, number, number]
  fov: number
  stageScale: number
  target: [number, number, number]
  shadowScale: number
}

export function getStageViewportLayout(aspect: number): StageViewportLayout {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9

  if (safeAspect >= 2.4) {
    return {
      cameraPosition: [0, 2.24, 13.1],
      fov: 31,
      stageScale: 1.18,
      target: [0, 1.7, 0.78],
      shadowScale: 4.8,
    }
  }

  if (safeAspect >= 2.0) {
    return {
      cameraPosition: [0, 2.22, 13.8],
      fov: 33.5,
      stageScale: 1.1,
      target: [0, 1.66, 0.74],
      shadowScale: 4.5,
    }
  }

  if (safeAspect <= 1.45) {
    return {
      cameraPosition: [0, 2.28, 15.7],
      fov: 38,
      stageScale: 0.94,
      target: [0, 1.54, 0.66],
      shadowScale: 4.0,
    }
  }

  if (safeAspect <= 1.65) {
    return {
      cameraPosition: [0, 2.24, 15.15],
      fov: 37,
      stageScale: 0.98,
      target: [0, 1.58, 0.69],
      shadowScale: 4.1,
    }
  }

  return {
    cameraPosition: [0, 2.2, 14.6],
    fov: 36,
    stageScale: 1,
    target: [0, 1.6, 0.7],
    shadowScale: 4.2,
  }
}
