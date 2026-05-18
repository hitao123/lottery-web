import { useLotteryStore } from '@/store/useLotteryStore'

export function StatusBar() {
  const guests = useLotteryStore((s) => s.guests)
  const winners = useLotteryStore((s) => s.winners)
  const currentRound = useLotteryStore((s) => s.currentRound)
  const phase = useLotteryStore((s) => s.phase)

  const totalGuests = guests.length
  const wonCount = winners.length
  const remaining = totalGuests - wonCount

  return (
    <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none z-10">
      <div
        className="px-8 py-3 rounded-full flex items-center gap-6 text-sm"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 215, 0, 0.15)',
        }}
      >
        {/* Round info */}
        <span style={{ color: 'rgba(255, 215, 0, 0.8)' }}>
          Round {currentRound}
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Progress */}
        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          {wonCount} / {totalGuests} drawn
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Remaining */}
        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          {remaining} remaining
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Keyboard hints */}
        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
          {phase === 'idle' && 'Space to draw'}
          {phase === 'spinning' && 'Drawing...'}
          {phase === 'chasing' && 'Selecting...'}
          {phase === 'locking' && 'Locking...'}
          {phase === 'revealed' && 'N: next | F: fullscreen'}
        </span>
      </div>
    </div>
  )
}
