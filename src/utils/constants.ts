// Color Palette — 黑金风: Cool Black + Champagne Gold
export const COLORS = {
  spaceDeep: '#0a0a0f',
  spaceMid: '#12121a',
  charcoal: '#1a1a24',
  slate: '#2a2a36',
  gold: '#c9a84c',
  goldLight: '#e8d5a3',
  goldBright: '#f0d78c',
  cream: '#f5f0e0',
  white: '#ffffff',
  textPrimary: '#e8e8e8',
  glassBg: 'rgba(18, 18, 26, 0.7)',
  glassBorder: 'rgba(201, 168, 76, 0.3)',
  glassBorderHover: 'rgba(240, 215, 140, 0.7)',
} as const

// Three.js color values (hex numbers)
export const COLORS_HEX = {
  spaceDeep: 0x0a0a0f,
  spaceMid: 0x12121a,
  charcoal: 0x1a1a24,
  slate: 0x2a2a36,
  gold: 0xc9a84c,
  goldLight: 0xe8d5a3,
  goldBright: 0xf0d78c,
  cream: 0xf5f0e0,
  white: 0xffffff,
} as const

// Card dimensions
export const CARD = {
  width: 0.9,
  height: 1.5,
  depth: 0.005,
  borderRadius: 0.04,
  opacity: 0.92,
} as const

// Animation timing (seconds)
export const TIMING = {
  spinningDuration: 2.5,
  chasingDuration: 5.0,
  lockingDuration: 1.0,
  revealedDelay: 0.3,
  totalDuration: 10,
  idleRotationSpeed: 0.15,
  idleFloatSpeed: 0.5,
  idleFloatAmplitude: 0.15,
  // Progressive chase: each pause longer than the last
  chaseVisitCount: 7,
  chasePauses: [0.3, 0.4, 0.5, 0.65, 0.8, 0.95, 1.15],
} as const

// Scene parameters
export const SCENE = {
  cardSphereRadius: 20,
  cameraIdleDistance: 28,
  cameraLockDistance: 10,
  starCount: 1500,
  starDepth: 100,
  goldParticleCount: 400,
  fireworkParticleCount: 180,
} as const

export const POSTPROCESSING = {
  idle: {
    bloomIntensity: 0.3,
    bloomRadius: 0.7,
    chromaticOffset: [0.0002, 0.0001] as const,
    luminanceThreshold: 0.9,
    noiseOpacity: 0.015,
    vignetteDarkness: 0.65,
  },
  spinning: {
    bloomIntensity: 0.6,
    bloomRadius: 0.8,
    chromaticOffset: [0.0008, 0.0003] as const,
    luminanceThreshold: 0.7,
    noiseOpacity: 0.03,
    vignetteDarkness: 0.75,
  },
  chasing: {
    bloomIntensity: 1.2,
    bloomRadius: 0.95,
    chromaticOffset: [0.002, 0.0008] as const,
    luminanceThreshold: 0.45,
    noiseOpacity: 0.05,
    vignetteDarkness: 0.82,
  },
  locking: {
    bloomIntensity: 2.0,
    bloomRadius: 1.0,
    chromaticOffset: [0.004, 0.002] as const,
    luminanceThreshold: 0.2,
    noiseOpacity: 0.08,
    vignetteDarkness: 0.9,
  },
  revealed: {
    bloomIntensity: 0.8,
    bloomRadius: 0.85,
    chromaticOffset: [0.0006, 0.0003] as const,
    luminanceThreshold: 0.55,
    noiseOpacity: 0.02,
    vignetteDarkness: 0.6,
  },
} as const
