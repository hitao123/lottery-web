import { useCallback } from 'react'

export function useFullscreen() {
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        // Silently fail if fullscreen is not supported
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  return { toggleFullscreen }
}
