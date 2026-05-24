/**
 * Generates points distributed on a sphere using the Fibonacci sphere algorithm.
 * Produces an approximately uniform distribution of points on a sphere surface.
 */
export function fibonacciSphere(
  count: number,
  radius: number,
  jitter: number = 0.5
): [number, number, number][] {
  const points: [number, number, number][] = []
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))

  for (let i = 0; i < count; i++) {
    // Compute the y position (from -1 to 1)
    const y = 1 - (i / (count - 1)) * 2
    // Radius at y
    const radiusAtY = Math.sqrt(1 - y * y)
    // Golden angle increment
    const theta = goldenAngle * i

    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY

    // Apply radius and jitter
    const jitterX = (Math.random() - 0.5) * jitter
    const jitterY = (Math.random() - 0.5) * jitter
    const jitterZ = (Math.random() - 0.5) * jitter

    points.push([
      x * radius + jitterX,
      y * radius + jitterY,
      z * radius + jitterZ,
    ])
  }

  return points
}

/**
 * Generate a front-facing floating backdrop so the audience looks toward a stage,
 * instead of being surrounded by cards on every side.
 */
export function weddingBackdropGrid(
  count: number,
  width: number,
  height: number,
  depthRange: number = 7
): [number, number, number][] {
  const points: [number, number, number][] = []
  if (count <= 0) return points

  const columns = Math.max(8, Math.ceil(Math.sqrt(count * 1.35)))
  const rows = Math.ceil(count / columns)
  const columnGap = columns > 1 ? width / (columns - 1) : 0
  const rowGap = rows > 1 ? height / (rows - 1) : 0

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / columns)
    const col = i % columns
    const u = columns > 1 ? col / (columns - 1) : 0.5
    const v = rows > 1 ? row / (rows - 1) : 0.5
    const normalizedX = u * 2 - 1
    const normalizedY = v * 2 - 1

    let x = -width * 0.5 + col * columnGap + (Math.random() - 0.5) * 0.45
    let y = height * 0.5 - row * rowGap + (Math.random() - 0.5) * 0.38
    const archOffset = (1 - normalizedX * normalizedX) * 1.8
    let z =
      -8
      - Math.abs(normalizedX) * depthRange * 0.6
      - Math.abs(normalizedY) * depthRange * 0.25
      + archOffset
      + (Math.random() - 0.5) * 1.4

    // Keep the visual center open so the stage and couple remain dominant.
    const inCenterWindow = Math.abs(normalizedX) < 0.34 && normalizedY > -0.46 && normalizedY < 0.5
    if (inCenterWindow) {
      const push = (0.34 - Math.abs(normalizedX)) / 0.34
      x += (normalizedX >= 0 ? 1 : -1) * (4.8 + push * 3.8)
      z -= 3.4 + push * 2.2
    }

    // Lift the lower rows outward so the base of the stage is cleaner.
    if (normalizedY > 0.2) {
      const edgePush = 2.6 + (normalizedY - 0.2) * 3.4
      x += (normalizedX >= 0 ? 1 : -1) * edgePush
      z -= 2.3 + normalizedY * 1.8
      y += 0.34
    }

    points.push([x, y + archOffset * 0.35, z])
  }

  return points
}

/**
 * Generate random rotation for initial card orientation
 */
export function randomRotation(): [number, number, number] {
  return [
    (Math.random() - 0.5) * 0.3,
    Math.random() * Math.PI * 2,
    (Math.random() - 0.5) * 0.2,
  ]
}
