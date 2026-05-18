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
      if (['Space', 'Enter', 'KeyN', 'KeyF', 'KeyR', 'Escape'].includes(e.code)) {
        e.preventDefault()
      }

      switch (e.code) {
        case 'Space': {
          if (phase === 'idle') {
            // Start spinning (no winner selected yet)
            const startFn = (window as unknown as Record<string, unknown>).__lotteryStartSpin
            if (typeof startFn === 'function') {
              (startFn as () => void)()
            }
          } else if (phase === 'spinning') {
            // Stop! Select winner NOW and play lock animation
            const stopFn = (window as unknown as Record<string, unknown>).__lotteryStopSpin
            if (typeof stopFn === 'function') {
              (stopFn as () => void)()
            }
          }
          break
        }
        case 'Enter': {
          if (phase === 'revealed') {
            useLotteryStore.getState().confirmWinner()
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
            const resetFn = (window as unknown as Record<string, unknown>).__lotteryResetCards
            if (typeof resetFn === 'function') {
              (resetFn as () => void)()
            }
            useLotteryStore.getState().reset()
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
