import { WinnerReveal } from './WinnerReveal'
import { StatusBar } from './StatusBar'
import { ControlPanel } from './ControlPanel'

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Title */}
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <h1
          className="text-xl tracking-[0.4em] uppercase font-light"
          style={{ color: 'rgba(255, 215, 0, 0.6)' }}
        >
          Wedding Lucky Draw
        </h1>
      </div>

      {/* Winner reveal panel */}
      <WinnerReveal />

      {/* Bottom status */}
      <StatusBar />

      {/* Control panel (has its own pointer-events) */}
      <div className="pointer-events-auto">
        <ControlPanel />
      </div>
    </div>
  )
}
