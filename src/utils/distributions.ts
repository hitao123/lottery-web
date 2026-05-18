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
 * Generate random rotation for initial card orientation
 */
export function randomRotation(): [number, number, number] {
  return [
    (Math.random() - 0.5) * 0.3,
    Math.random() * Math.PI * 2,
    (Math.random() - 0.5) * 0.2,
  ]
}
