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
    const material = getCardMaterial(card)
    const scatterTarget = card.position.clone()
    scatterTarget.x += (Math.random() - 0.5) * 1.2
    scatterTarget.y += (Math.random() - 0.5) * 0.8
    scatterTarget.z -= 3.8 + Math.random() * 2.6

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
        x: card.rotation.x - 0.12 + (Math.random() - 0.5) * 0.16,
        y: card.rotation.y + (Math.random() - 0.5) * 0.08,
        z: card.rotation.z + (Math.random() - 0.5) * 0.12,
        duration,
        ease: 'sine.out',
      },
      0
    )

    tl.to(
      card.scale,
      {
        x: 0.9,
        y: 0.9,
        z: 0.9,
        duration,
        ease: 'sine.out',
      },
      0
    )

    if (material) {
      tl.to(
        material,
        {
          opacity: 0.16,
          emissiveIntensity: 0.02,
          duration: duration * 0.8,
          ease: 'power3.out',
        },
        0
      )
    }

    tl.call(
      () => {
        card.visible = false
      },
      [],
      duration * 0.92
    )
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
        y: 2.55,
        z: 1.35,
        duration: duration * 0.4,
        ease: 'power2.inOut',
      },
      {
        x: 0,
        y: 3.2,
        z: 1.8,
        duration: duration * 0.6,
        ease: 'back.out(1.2)',
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
        x: -0.02,
        y: 0,
        z: 0,
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
