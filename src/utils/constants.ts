// Color Palette — 婚礼手办风: Rosewood + Cream + Soft Gold
export const COLORS = {
  spaceDeep: '#1f0d19',
  spaceMid: '#4b2237',
  charcoal: '#6d3850',
  slate: '#b36b82',
  gold: '#d9a85f',
  goldLight: '#f6d7a4',
  goldBright: '#fff2da',
  cream: '#fff7ef',
  white: '#ffffff',
  textPrimary: '#fff7ef',
  glassBg: 'rgba(67, 24, 44, 0.66)',
  glassBorder: 'rgba(246, 215, 164, 0.28)',
  glassBorderHover: 'rgba(255, 242, 218, 0.8)',
} as const

// Three.js color values (hex numbers)
export const COLORS_HEX = {
  spaceDeep: 0x1f0d19,
  spaceMid: 0x4b2237,
  charcoal: 0x6d3850,
  slate: 0xb36b82,
  gold: 0xd9a85f,
  goldLight: 0xf6d7a4,
  goldBright: 0xfff2da,
  cream: 0xfff7ef,
  white: 0xffffff,
} as const

// Card dimensions
export const CARD = {
  width: 0.9,
  height: 1.5,
  depth: 0.005,
  borderRadius: 0.04,
  opacity: 0.98,
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
  cameraIdleDistance: 20,
  cameraLockDistance: 10,
  starCount: 300,
  starDepth: 42,
  goldParticleCount: 160,
  fireworkParticleCount: 180,
} as const

export const POSTPROCESSING = {
  idle: {
    bloomIntensity: 0.42,
    bloomRadius: 0.72,
    chromaticOffset: [0.00012, 0.00006] as const,
    luminanceThreshold: 0.78,
    noiseOpacity: 0.008,
    vignetteDarkness: 0.42,
  },
  spinning: {
    bloomIntensity: 0.72,
    bloomRadius: 0.88,
    chromaticOffset: [0.0005, 0.00018] as const,
    luminanceThreshold: 0.62,
    noiseOpacity: 0.015,
    vignetteDarkness: 0.52,
  },
  chasing: {
    bloomIntensity: 1.08,
    bloomRadius: 0.92,
    chromaticOffset: [0.0012, 0.00045] as const,
    luminanceThreshold: 0.4,
    noiseOpacity: 0.022,
    vignetteDarkness: 0.62,
  },
  locking: {
    bloomIntensity: 1.55,
    bloomRadius: 0.95,
    chromaticOffset: [0.0022, 0.0011] as const,
    luminanceThreshold: 0.24,
    noiseOpacity: 0.03,
    vignetteDarkness: 0.68,
  },
  revealed: {
    bloomIntensity: 0.9,
    bloomRadius: 0.8,
    chromaticOffset: [0.00035, 0.00015] as const,
    luminanceThreshold: 0.48,
    noiseOpacity: 0.01,
    vignetteDarkness: 0.46,
  },
} as const
