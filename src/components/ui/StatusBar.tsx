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
        className="glass-surface px-8 py-3 rounded-full flex items-center gap-6 text-sm"
        style={{ fontFamily: '"Outfit", system-ui, sans-serif' }}
      >
        {/* Round */}
        <span style={{ color: '#f0d78c' }}>
          第{currentRound}轮
        </span>

        <span style={{ color: 'rgba(201, 168, 76, 0.2)' }}>|</span>

        {/* Progress */}
        <span style={{ color: 'rgba(232, 232, 232, 0.75)' }}>
          已抽 <strong style={{ color: '#f0d78c' }}>{wonCount}</strong> / {totalGuests} 人
        </span>

        <span style={{ color: 'rgba(201, 168, 76, 0.2)' }}>|</span>

        {/* Remaining */}
        <span style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
          剩余 {remaining} 人
        </span>

        <span style={{ color: 'rgba(201, 168, 76, 0.2)' }}>|</span>

        {/* Phase hint */}
        <span style={{ color: 'rgba(232, 232, 232, 0.35)' }}>
          {phase === 'idle' && '按空格开始'}
          {phase === 'spinning' && '按空格停止'}
          {phase === 'chasing' && '选号中...'}
          {phase === 'locking' && '锁定'}
          {phase === 'revealed' && 'N: 下一轮 | F: 全屏'}
        </span>
      </div>
    </div>
  )
}
