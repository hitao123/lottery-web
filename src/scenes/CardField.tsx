import { useMemo } from 'react'
import { Card } from '@/components/three/Card'
import { useLotteryStore } from '@/store/useLotteryStore'
import { fibonacciSphere, randomRotation } from '@/utils/distributions'
import { SCENE } from '@/utils/constants'

export function CardField() {
  const guests = useLotteryStore((s) => s.guests)

  // Calculate positions once when guests change
  const cardData = useMemo(() => {
    if (guests.length === 0) return []
    const positions = fibonacciSphere(guests.length, SCENE.cardSphereRadius)
    return guests.map((guest, i) => ({
      guest,
      position: positions[i],
      rotation: randomRotation(),
    }))
  }, [guests])

  return (
    <group>
      {cardData.map(({ guest, position, rotation }) => (
        <Card
          key={guest.id}
          code={guest.code}
          position={position}
          initialRotation={rotation}
        />
      ))}
    </group>
  )
}
