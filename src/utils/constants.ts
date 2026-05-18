// Color Palette — Korean minimalist + gold luxury
export const COLORS = {
  spaceDeep: '#120406',
  spaceMid: '#2a0b11',
  ruby: '#611017',
  rose: '#bf4348',
  gold: '#d5a64a',
  goldLight: '#f6dd9a',
  goldBright: '#ffe6a9',
  cream: '#fff5e4',
  glassBg: 'rgba(81, 17, 24, 0.16)',
  glassBorder: 'rgba(231, 191, 98, 0.42)',
  glassBorderHover: 'rgba(255, 223, 140, 0.92)',
} as const

// Three.js color values (hex numbers)
export const COLORS_HEX = {
  spaceDeep: 0x120406,
  spaceMid: 0x2a0b11,
  ruby: 0x611017,
  rose: 0xbf4348,
  gold: 0xd5a64a,
  goldLight: 0xf6dd9a,
  goldBright: 0xffe6a9,
  cream: 0xfff5e4,
} as const

// Card dimensions — taller, thinner, more elegant
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
  chasingDuration: 3.5,
  lockingDuration: 2,
  revealedDelay: 0.5,
  totalDuration: 10,
  idleRotationSpeed: 0.15,
  idleFloatSpeed: 0.5,
  idleFloatAmplitude: 0.15,
} as const

// Scene parameters — much wider spread
export const SCENE = {
  cardSphereRadius: 20,
  cameraIdleDistance: 28,
  cameraLockDistance: 10,
  starCount: 2000,
  starDepth: 100,
  goldParticleCount: 400,
  heartParticleCount: 72,
} as const

export const POSTPROCESSING = {
  idle: {
    bloomIntensity: 0.28,
    bloomRadius: 0.72,
    chromaticOffset: [0.0003, 0.00015] as const,
    luminanceThreshold: 0.92,
    noiseOpacity: 0.02,
    vignetteDarkness: 0.68,
  },
  spinning: {
    bloomIntensity: 0.62,
    bloomRadius: 0.82,
    chromaticOffset: [0.0009, 0.00035] as const,
    luminanceThreshold: 0.72,
    noiseOpacity: 0.04,
    vignetteDarkness: 0.74,
  },
  chasing: {
    bloomIntensity: 0.9,
    bloomRadius: 0.9,
    chromaticOffset: [0.0016, 0.00065] as const,
    luminanceThreshold: 0.58,
    noiseOpacity: 0.055,
    vignetteDarkness: 0.79,
  },
  locking: {
    bloomIntensity: 1.45,
    bloomRadius: 0.98,
    chromaticOffset: [0.0025, 0.001] as const,
    luminanceThreshold: 0.34,
    noiseOpacity: 0.075,
    vignetteDarkness: 0.84,
  },
  revealed: {
    bloomIntensity: 1.02,
    bloomRadius: 0.88,
    chromaticOffset: [0.0011, 0.0004] as const,
    luminanceThreshold: 0.5,
    noiseOpacity: 0.03,
    vignetteDarkness: 0.76,
  },
} as const
