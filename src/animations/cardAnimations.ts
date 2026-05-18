import gsap from 'gsap'
import * as THREE from 'three'

/**
 * Scatter all cards outward from center, except the winner
 */
export function scatterCards(
  cards: THREE.Group[],
  winnerIndex: number,
  duration: number = 1.5
): gsap.core.Timeline {
  const tl = gsap.timeline()

  cards.forEach((card, i) => {
    if (i === winnerIndex) return
    const dir = card.position.clone().normalize()
    const scatterDist = 5 + Math.random() * 10

    tl.to(
      card.position,
      {
        x: card.position.x + dir.x * scatterDist,
        y: card.position.y + dir.y * scatterDist,
        z: card.position.z + dir.z * scatterDist,
        duration,
        ease: 'power2.out',
      },
      0
    )

    // Fade out via scale
    tl.to(
      card.scale,
      {
        x: 0.3,
        y: 0.3,
        z: 0.3,
        duration,
        ease: 'power2.out',
      },
      0
    )
  })

  return tl
}

/**
 * Lock the winner card to center position facing camera
 */
export function lockWinnerCard(
  card: THREE.Group,
  duration: number = 1.5
): gsap.core.Tween {
  return gsap.to(card.position, {
    x: 0,
    y: 0,
    z: 5,
    duration,
    ease: 'power3.out',
  })
}

/**
 * Scale up the winner card
 */
export function scaleWinnerCard(
  card: THREE.Group,
  duration: number = 1
): gsap.core.Tween {
  return gsap.to(card.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration,
    ease: 'elastic.out(1, 0.5)',
  })
}

/**
 * Reset card to face camera (rotation)
 */
export function rotateToFaceCamera(
  card: THREE.Group,
  duration: number = 1
): gsap.core.Tween {
  return gsap.to(card.rotation, {
    x: 0,
    y: 0,
    z: 0,
    duration,
    ease: 'power2.out',
  })
}
