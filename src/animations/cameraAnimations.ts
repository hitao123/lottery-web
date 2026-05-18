import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Fly camera smoothly to look at a specific position
 */
export function flyToPosition(
  camera: THREE.Camera,
  target: THREE.Vector3,
  lookAt: THREE.Vector3,
  duration: number,
  ease: string = 'power2.inOut'
) {
  return gsap.to(camera.position, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration,
    ease,
    onUpdate: () => {
      camera.lookAt(lookAt)
    },
  })
}

/**
 * Create a camera chase path visiting multiple card positions
 */
export function createChasePath(
  cardPositions: THREE.Vector3[],
  count: number = 5
): THREE.Vector3[] {
  // Pick random cards to visit
  const shuffled = [...cardPositions].sort(() => Math.random() - 0.5)
  const targets = shuffled.slice(0, count)

  // For each target, compute a camera position offset (slightly in front)
  return targets.map((pos) => {
    const dir = pos.clone().normalize()
    // Camera position: slightly further from center than the card
    return pos.clone().add(dir.multiplyScalar(3))
  })
}
