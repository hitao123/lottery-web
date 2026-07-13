import { useEffect } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'

interface UseKeyboardOptions {
  onToggleFullscreen: () => void
}

export function useKeyboard({ onToggleFullscreen }: UseKeyboardOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const { phase } = useLotteryStore.getState()

      // Prevent default for our shortcuts
      if (['Space', 'Enter', 'KeyS', 'KeyN', 'KeyF', 'KeyR', 'Escape'].includes(e.code)) {
        e.preventDefault()
      }

      switch (e.code) {
        case 'Space': {
          if (phase === 'idle') {
            const startFn = (window as unknown as Record<string, unknown>).__lotteryStartSpin
            if (typeof startFn === 'function') {
              (startFn as () => void)()
            }
          }
          break
        }
        case 'KeyS': {
          if (phase === 'spinning') {
            const stopFn = (window as unknown as Record<string, unknown>).__lotteryStopSpin
            if (typeof stopFn === 'function') {
              (stopFn as () => void)()
            }
          }
          break
        }
        case 'Enter': {
          if (phase === 'revealed') {
            const resetFn = (window as unknown as Record<string, unknown>).__lotteryResetCards
            if (typeof resetFn === 'function') {
              (resetFn as () => void)()
            }
            useLotteryStore.getState().nextRound()
          }
          break
        }
        case 'KeyN': {
          if (phase === 'revealed') {
            const resetFn = (window as unknown as Record<string, unknown>).__lotteryResetCards
            if (typeof resetFn === 'function') {
              (resetFn as () => void)()
            }
            useLotteryStore.getState().nextRound()
          }
          break
        }
        case 'KeyF': {
          onToggleFullscreen()
          break
        }
        case 'KeyR': {
          if (phase === 'idle' || phase === 'revealed') {
            if (!window.confirm('确定重置全部中奖记录吗？此操作会立即保存。')) return
            void useLotteryStore.getState().reset().then((ok) => {
              if (!ok) return
              const resetFn = (window as unknown as Record<string, unknown>).__lotteryResetCards
              if (typeof resetFn === 'function') (resetFn as () => void)()
            })
          }
          break
        }
        case 'Escape': {
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleFullscreen])
}
