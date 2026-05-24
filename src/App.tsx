import { useEffect } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'
import { LotteryScene } from '@/scenes/LotteryScene'
import { HUD } from '@/components/ui/HUD'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useFullscreen } from '@/hooks/useFullscreen'
import { startIdleMusic, stopBackgroundMusic, unlockAudio } from '@/utils/audio'

function App() {
  const addGuests = useLotteryStore((s) => s.addGuests)
  const phase = useLotteryStore((s) => s.phase)
  const guestCount = useLotteryStore((s) => s.guests.length)
  const { toggleFullscreen } = useFullscreen()

  // Initialize with demo data
  useEffect(() => {
    const codes = Array.from({ length: 200 }, (_, i) =>
      String(5200001 + i)
    )
    addGuests(codes)
  }, [addGuests])

  useEffect(() => {
    const resumeIdleMusic = () => {
      unlockAudio()
      if (useLotteryStore.getState().phase === 'idle' && useLotteryStore.getState().guests.length > 0) {
        startIdleMusic()
      }
    }

    window.addEventListener('pointerdown', resumeIdleMusic, { once: true })
    window.addEventListener('keydown', resumeIdleMusic, { once: true })

    return () => {
      window.removeEventListener('pointerdown', resumeIdleMusic)
      window.removeEventListener('keydown', resumeIdleMusic)
    }
  }, [])

  useEffect(() => {
    if (guestCount === 0) {
      stopBackgroundMusic()
      return
    }

    if (phase === 'idle') {
      startIdleMusic()
      return
    }

    if (phase === 'chasing' || phase === 'locking' || phase === 'revealed') {
      stopBackgroundMusic()
    }
  }, [guestCount, phase])

  // Register keyboard shortcuts
  useKeyboard({ onToggleFullscreen: toggleFullscreen })

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <LotteryScene />
      <HUD />
    </div>
  )
}

export default App
