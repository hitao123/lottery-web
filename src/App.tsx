import { Canvas } from '@react-three/fiber'
import { useLotteryStore } from '@/store/useLotteryStore'
import { useEffect } from 'react'

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
      <Canvas
        camera={{ position: [0, 0, 30], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a1a' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
      </Canvas>
    </div>
  )
}

export default App
