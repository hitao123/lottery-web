// Color Palette
export const COLORS = {
  spaceDeep: '#0a0a1a',
  spaceMid: '#1a1a3e',
  gold: '#d4af37',
  goldLight: '#f5e6a3',
  cream: '#fff8e7',
  glassBg: 'rgba(255, 255, 255, 0.06)',
  glassBorder: 'rgba(255, 215, 0, 0.4)',
  glassBorderHover: 'rgba(255, 215, 0, 0.7)',
} as const

// Three.js color values (hex numbers)
export const COLORS_HEX = {
  spaceDeep: 0x0a0a1a,
  spaceMid: 0x1a1a3e,
  gold: 0xd4af37,
  goldLight: 0xf5e6a3,
  cream: 0xfff8e7,
} as const

// Card dimensions
export const CARD = {
  width: 1.4,
  height: 2.0,
  depth: 0.02,
  borderRadius: 0.08,
} as const

// Animation timing (seconds)
export const TIMING = {
  spinningDuration: 2,
  chasingDuration: 4,
  lockingDuration: 2,
  revealedDelay: 0.5,
  totalDuration: 10,
  idleRotationSpeed: 0.15,
  idleFloatSpeed: 0.5,
  idleFloatAmplitude: 0.2,
} as const

// Scene parameters
export const SCENE = {
  cardSphereRadius: 10,
  cameraIdleDistance: 16,
  cameraLockDistance: 8,
  starCount: 3000,
  starDepth: 80,
  goldParticleCount: 800,
  heartParticleCount: 30,
} as const

// Bloom settings per phase
export const BLOOM = {
  idle: { intensity: 0.5, luminanceThreshold: 0.8 },
  spinning: { intensity: 1.0, luminanceThreshold: 0.6 },
  chasing: { intensity: 1.2, luminanceThreshold: 0.5 },
  locking: { intensity: 2.0, luminanceThreshold: 0.3 },
  revealed: { intensity: 1.5, luminanceThreshold: 0.5 },
} as const
