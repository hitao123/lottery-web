import { useLotteryStore } from '@/store/useLotteryStore'
import { useEffect } from 'react'
import { LotteryScene } from '@/scenes/LotteryScene'

function App() {
  const addGuests = useLotteryStore((s) => s.addGuests)

  // Initialize with demo data
  useEffect(() => {
    const codes = Array.from({ length: 200 }, (_, i) =>
      String(i + 1).padStart(3, '0')
    )
    addGuests(codes)
  }, [addGuests])

  return (
    <div className="w-full h-full relative">
      <LotteryScene />
    </div>
  )
}

export default App
