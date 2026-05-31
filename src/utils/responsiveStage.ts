export type StageViewportLayout = {
  cameraPosition: [number, number, number]
  fov: number
  stageScale: number
  target: [number, number, number]
  shadowScale: number
}

/**
 * Aspect 档位说明（按目标显示设备）：
 *   >= 3.2   双 1080p 拼接 / 32:9 (≈3.555)
 *   >= 2.4   超宽屏 21:9 ~ 24:10
 *   >= 2.0   宽屏 18:9 / 2:1
 *   1.65 ~ 2 标准 16:9 / 16:10
 *   1.45 ~ 1.65 4:3 / 3:2
 *   <= 1.45  竖屏 / 接近正方形
 */
export function getStageViewportLayout(aspect: number): StageViewportLayout {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 16 / 9

  if (safeAspect >= 3.2) {
    return {
      cameraPosition: [0, 2.26, 12.9],
      fov: 29.5,
      stageScale: 1.24,
      target: [0, 1.48, 0.82],
      shadowScale: 5.4,
    }
  }

  if (safeAspect >= 2.4) {
    return {
      cameraPosition: [0, 2.2, 13.55],
      fov: 32.5,
      stageScale: 1.12,
      target: [0, 1.44, 0.78],
      shadowScale: 4.8,
    }
  }

  if (safeAspect >= 2.0) {
    return {
      cameraPosition: [0, 2.18, 14.2],
      fov: 35,
      stageScale: 1.06,
      target: [0, 1.4, 0.74],
      shadowScale: 4.5,
    }
  }

  if (safeAspect <= 1.45) {
    return {
      cameraPosition: [0, 2.22, 16.05],
      fov: 40,
      stageScale: 0.92,
      target: [0, 1.3, 0.66],
      shadowScale: 4.0,
    }
  }

  if (safeAspect <= 1.65) {
    return {
      cameraPosition: [0, 2.18, 15.55],
      fov: 39,
      stageScale: 0.96,
      target: [0, 1.32, 0.69],
      shadowScale: 4.1,
    }
  }

  return {
    cameraPosition: [0, 2.16, 14.95],
    fov: 38,
    stageScale: 0.98,
    target: [0, 1.36, 0.7],
    shadowScale: 4.2,
  }
}
