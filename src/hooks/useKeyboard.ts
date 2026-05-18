import { useEffect } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'

interface UseKeyboardOptions {
  onToggleFullscreen: () => void
}

export function useKeyboard({ onToggleFullscreen }: UseKeyboardOptions) {
  const phase = useLotteryStore((s) => s.phase)
  const setPhase = useLotteryStore((s) => s.setPhase)
  const nextRound = useLotteryStore((s) => s.nextRound)
  const confirmWinner = useLotteryStore((s) => s.confirmWinner)
  const reset = useLotteryStore((s) => s.reset)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (['Space', 'Enter', 'KeyN', 'KeyF', 'KeyR', 'Escape'].includes(e.code)) {
        e.preventDefault()
      }

      switch (e.code) {
        case 'Space': {
          if (phase === 'idle') {
            // Trigger draw via global function exposed by CardField
            setPhase('spinning')
            const startFn = (window as unknown as Record<string, unknown>).__lotteryStartDraw
            if (typeof startFn === 'function') {
              startFn()
            }
          }
          break
        }
        case 'Enter': {
          if (phase === 'revealed') {
            confirmWinner()
            // Stay in revealed state until N is pressed
          }
          break
        }
        case 'KeyN': {
          if (phase === 'revealed') {
            // Reset cards and go to next round
            const resetFn = (window as unknown as Record<string, unknown>).__lotteryResetCards
            if (typeof resetFn === 'function') {
              resetFn()
            }
            nextRound()
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
              resetFn()
            }
            reset()
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
  }, [phase, setPhase, nextRound, confirmWinner, reset, onToggleFullscreen])
}
