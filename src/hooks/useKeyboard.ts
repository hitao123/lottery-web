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
            // Trigger draw via global function exposed by CardField
            const startFn = (window as unknown as Record<string, unknown>).__lotteryStartDraw
            if (typeof startFn === 'function') {
              (startFn as () => void)()
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
            // Reset cards and go to next round
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
          // Future: cancel ongoing draw
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onToggleFullscreen])
}
