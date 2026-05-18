import gsap from 'gsap'
import * as THREE from 'three'
import { CARD } from '@/utils/constants'

function getCardMaterial(card: THREE.Group) {
  const mesh = card.children[0]
  if (!(mesh instanceof THREE.Mesh)) return null
  return mesh.material instanceof THREE.MeshStandardMaterial ? mesh.material : null
}

export function flashCard(
  card: THREE.Group,
  duration: number = 0.35,
  peakEmissive: number = 0.3
): gsap.core.Timeline {
  const tl = gsap.timeline()
  const material = getCardMaterial(card)

  tl.to(
    card.scale,
    {
      x: 1.1,
      y: 1.1,
      z: 1.1,
      duration: duration * 0.45,
      ease: 'power2.out',
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
        duration: duration * 0.35,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
      0
    )
  }

  return tl
}

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

    // Fade out via scale
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
          duration: duration * 0.85,
          ease: 'power3.out',
        },
        0
      )
    }
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
    keyframes: [
      {
        x: 0,
        y: 0.2,
        z: 2.8,
        duration: duration * 0.58,
        ease: 'power3.in',
      },
      {
        x: 0,
        y: 0,
        z: 4.85,
        duration: duration * 0.42,
        ease: 'expo.out',
      },
    ],
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
    keyframes: [
      {
        x: 1.18,
        y: 1.18,
        z: 1.18,
        duration: duration * 0.3,
        ease: 'power2.out',
      },
      {
        x: 1.52,
        y: 1.52,
        z: 1.52,
        duration: duration * 0.35,
        ease: 'power3.out',
      },
      {
        x: 1.28,
        y: 1.28,
        z: 1.28,
        duration: duration * 0.35,
        ease: 'back.out(1.7)',
      },
    ],
  })
}

export function igniteWinnerCard(
  card: THREE.Group,
  duration: number = 1
): gsap.core.Timeline {
  const material = getCardMaterial(card)
  const tl = gsap.timeline()

  if (material) {
    tl.to(material, {
      keyframes: [
        {
          emissiveIntensity: 0.45,
          opacity: 1,
          duration: duration * 0.45,
          ease: 'power2.out',
        },
        {
          emissiveIntensity: 0.22,
          opacity: CARD.opacity,
          duration: duration * 0.55,
          ease: 'sine.out',
        },
      ],
    })
  }

  return tl
}

/**
 * Reset card to face camera (rotation)
 */
export function rotateToFaceCamera(
  card: THREE.Group,
  duration: number = 1
): gsap.core.Tween {
  return gsap.to(card.rotation, {
    keyframes: [
      {
        x: 0.08,
        y: 0.18,
        z: -0.05,
        duration: duration * 0.35,
        ease: 'power2.out',
      },
      {
        x: 0,
        y: 0,
        z: 0,
        duration: duration * 0.65,
        ease: 'expo.out',
      },
    ],
  })
}
