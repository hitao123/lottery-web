import { WinnerReveal } from './WinnerReveal'
import { StatusBar } from './StatusBar'
import { ControlPanel } from './ControlPanel'

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Title */}
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <h1
          className="text-xl tracking-[0.3em] font-light"
          style={{
            color: 'rgba(255, 232, 184, 0.82)',
            textShadow: '0 0 28px rgba(213, 166, 74, 0.25)',
          }}
        >
          婚礼幸运抽奖
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
