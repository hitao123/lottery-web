// Color Palette — Korean minimalist + gold luxury
export const COLORS = {
  spaceDeep: '#050510',
  spaceMid: '#0d0d2b',
  gold: '#c9a96e',
  goldLight: '#e8d5a3',
  goldBright: '#ffd700',
  cream: '#f5f0e8',
  glassBg: 'rgba(255, 255, 255, 0.04)',
  glassBorder: 'rgba(201, 169, 110, 0.35)',
  glassBorderHover: 'rgba(201, 169, 110, 0.8)',
} as const

// Three.js color values (hex numbers)
export const COLORS_HEX = {
  spaceDeep: 0x050510,
  spaceMid: 0x0d0d2b,
  gold: 0xc9a96e,
  goldLight: 0xe8d5a3,
  goldBright: 0xffd700,
  cream: 0xf5f0e8,
} as const

// Card dimensions — taller, thinner, more elegant
export const CARD = {
  width: 0.9,
  height: 1.5,
  depth: 0.005,
  borderRadius: 0.04,
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
  heartParticleCount: 30,
} as const

// Bloom settings per phase — more subtle
export const BLOOM = {
  idle: { intensity: 0.3, luminanceThreshold: 0.9 },
  spinning: { intensity: 0.6, luminanceThreshold: 0.7 },
  chasing: { intensity: 0.8, luminanceThreshold: 0.6 },
  locking: { intensity: 1.2, luminanceThreshold: 0.4 },
  revealed: { intensity: 0.8, luminanceThreshold: 0.6 },
} as const
