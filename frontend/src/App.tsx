import { useEffect } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'
import { LotteryScene } from '@/scenes/LotteryScene'
import { HUD } from '@/components/ui/HUD'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useFullscreen } from '@/hooks/useFullscreen'
import { startIdleMusic, stopBackgroundMusic, unlockAudio } from '@/utils/audio'

function App() {
  const loadLottery = useLotteryStore((s) => s.loadLottery)
  const phase = useLotteryStore((s) => s.phase)
  const guestCount = useLotteryStore((s) => s.guests.length)
  const { toggleFullscreen } = useFullscreen()

  // 只从后端恢复已保存状态；生产环境绝不覆盖为演示号码。
  useEffect(() => {
    void loadLottery()
  }, [loadLottery])

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
