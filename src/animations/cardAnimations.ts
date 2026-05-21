import gsap from 'gsap'
import * as THREE from 'three'
import { CARD } from '@/utils/constants'

function getCardMaterial(card: THREE.Group) {
  const mesh = card.children[0]
  if (!(mesh instanceof THREE.Mesh)) return null
  return mesh.material instanceof THREE.MeshStandardMaterial ? mesh.material : null
}

/**
 * Flash a card with scale punch and emissive burst.
 * Scale punch is proportional to intensity — higher intensity = bigger punch.
 */
export function flashCard(
  card: THREE.Group,
  duration: number = 0.35,
  peakEmissive: number = 0.3
): gsap.core.Timeline {
  const tl = gsap.timeline()
  const material = getCardMaterial(card)

  // Scale punch proportional to intensity (low=1.06, high=1.2)
  const scaleFactor = 1.0 + peakEmissive * 0.4

  tl.to(
    card.scale,
    {
      x: scaleFactor,
      y: scaleFactor,
      z: scaleFactor,
      duration: duration * 0.4,
      ease: 'power3.out',
      yoyo: true,
      repeat: 1,
    },
    0
  )

  if (material) {
    tl.to(
      material,
      {
        emissiveIntensity: peakEmissive,
        opacity: 1,
        duration: duration * 0.3,
        ease: 'power3.out',
        yoyo: true,
        repeat: 1,
      },
      0
    )
  }

  return tl
}

/**
 * Scatter all cards outward from center, except the winner.
 * Fast and explosive for the "slam" moment.
 */
export function scatterCards(
  cards: THREE.Group[],
  winnerIndex: number,
  duration: number = 0.8
): gsap.core.Timeline {
  const tl = gsap.timeline()

  cards.forEach((card, i) => {
    if (i === winnerIndex) return
    const dir = card.position.clone().normalize()
    const scatterDist = 10 + Math.random() * 14
    const material = getCardMaterial(card)
    const scatterTarget = card.position.clone().add(dir.multiplyScalar(scatterDist))
    scatterTarget.y += (Math.random() - 0.5) * 3.5
    scatterTarget.z = Math.min(scatterTarget.z - 1.5, -6 - Math.random() * 10)

    tl.to(
      card.position,
      {
        x: scatterTarget.x,
        y: scatterTarget.y,
        z: scatterTarget.z,
        duration,
        ease: 'expo.out',
      },
      0
    )

    tl.to(
      card.rotation,
      {
        x: card.rotation.x + (Math.random() - 0.5) * 1.8,
        y: card.rotation.y + (Math.random() - 0.5) * 2.8,
        z: card.rotation.z + (Math.random() - 0.5) * 1.4,
        duration,
        ease: 'power2.out',
      },
      0
    )

    tl.to(
      card.scale,
      {
        x: 0.04,
        y: 0.04,
        z: 0.04,
        duration,
        ease: 'power3.out',
      },
      0
    )

    if (material) {
      tl.to(
        material,
        {
          opacity: 0.008,
          emissiveIntensity: 0,
          duration: duration * 0.8,
          ease: 'power3.out',
        },
        0
      )
    }
  })

  return tl
}

/**
 * Lock the winner card to center — "slam" effect.
 * Uses power4.in for acceleration, then back.out for overshoot-settle.
 */
export function lockWinnerCard(
  card: THREE.Group,
  duration: number = 0.8
): gsap.core.Tween {
  return gsap.to(card.position, {
    keyframes: [
      {
        x: 0,
        y: 0.1,
        z: 3.8,
        duration: duration * 0.4,
        ease: 'power4.in',
      },
      {
        x: 0,
        y: 0,
        z: 5.65,
        duration: duration * 0.6,
        ease: 'back.out(1.4)',
      },
    ],
  })
}

/**
 * Scale up the winner card with slight overshoot
 */
export function scaleWinnerCard(
  card: THREE.Group,
  duration: number = 0.9
): gsap.core.Tween {
  return gsap.to(card.scale, {
    keyframes: [
      {
        x: 1.08,
        y: 1.08,
        z: 1.08,
        duration: duration * 0.25,
        ease: 'power2.out',
      },
      {
        x: 1.2,
        y: 1.2,
        z: 1.2,
        duration: duration * 0.35,
        ease: 'power3.out',
      },
      {
        x: 1.14,
        y: 1.14,
        z: 1.14,
        duration: duration * 0.4,
        ease: 'sine.out',
      },
    ],
  })
}

export function igniteWinnerCard(
  card: THREE.Group,
  duration: number = 0.8
): gsap.core.Timeline {
  const material = getCardMaterial(card)
  const tl = gsap.timeline()

  if (material) {
    tl.to(material, {
      keyframes: [
        {
          emissiveIntensity: 0.4,
          opacity: 1,
          duration: duration * 0.4,
          ease: 'power2.out',
        },
        {
          emissiveIntensity: 0.18,
          opacity: CARD.opacity,
          duration: duration * 0.6,
          ease: 'sine.out',
        },
      ],
    })
  }

  return tl
}

/**
 * Rotate winner card to face camera directly
 */
export function rotateToFaceCamera(
  card: THREE.Group,
  duration: number = 0.7
): gsap.core.Tween {
  return gsap.to(card.rotation, {
    keyframes: [
      {
        x: 0.03,
        y: 0.06,
        z: -0.02,
        duration: duration * 0.3,
        ease: 'power2.out',
      },
      {
        x: 0,
        y: 0,
        z: 0,
        duration: duration * 0.7,
        ease: 'expo.out',
      },
    ],
  })
}
