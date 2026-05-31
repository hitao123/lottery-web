import { ControlPanel } from './ControlPanel'

export function HUD() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute top-6 left-0 right-0 flex justify-center px-4">
        <div className="title-shell w-full max-w-[720px] rounded-[30px] px-8 py-3.5 text-center sm:px-12">
          <div
            className="title-text text-lg sm:text-xl tracking-[0.18em] font-medium leading-none"
            style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
          >
            Wedding Lucky Draw
          </div>
          <div
            className="mt-2 text-[11px] tracking-[0.24em] uppercase leading-none"
            style={{ padding: '2px 0', color: 'rgba(255, 241, 201, 0.62)', fontFamily: '"Outfit", system-ui, sans-serif' }}
          >
            新郎新娘邀您见证幸运时刻
          </div>
        </div>
      </div>
      <div className="pointer-events-auto">
        <ControlPanel />
      </div>
    </div>
  )
}
