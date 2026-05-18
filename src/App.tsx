import { useEffect } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'
import { LotteryScene } from '@/scenes/LotteryScene'
import { HUD } from '@/components/ui/HUD'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useFullscreen } from '@/hooks/useFullscreen'

function App() {
  const addGuests = useLotteryStore((s) => s.addGuests)
  const { toggleFullscreen } = useFullscreen()

  // Initialize with demo data
  useEffect(() => {
    const codes = Array.from({ length: 200 }, (_, i) =>
      String(i + 1).padStart(3, '0')
    )
    addGuests(codes)
  }, [addGuests])

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
