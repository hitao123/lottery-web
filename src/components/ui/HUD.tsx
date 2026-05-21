import { WinnerReveal } from './WinnerReveal'
import { StatusBar } from './StatusBar'
import { ControlPanel } from './ControlPanel'

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Title — clean, minimal */}
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <h1
          className="title-text text-xl tracking-[0.35em] font-medium"
          style={{
            fontFamily: '"Outfit", system-ui, sans-serif',
          }}
        >
          婚礼幸运抽奖
        </h1>
      </div>

      {/* Winner reveal */}
      <WinnerReveal />

      {/* Bottom status */}
      <StatusBar />

      {/* Control panel */}
      <div className="pointer-events-auto">
        <ControlPanel />
      </div>
    </div>
  )
}
