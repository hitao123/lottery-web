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
          第 {currentRound} 轮
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Progress */}
        <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          已抽 {wonCount} / {totalGuests} 人
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Remaining */}
        <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          剩余 {remaining} 人
        </span>

        <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

        {/* Keyboard hints */}
        <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
          {phase === 'idle' && '按空格键开始抽奖'}
          {phase === 'spinning' && '抽奖中...'}
          {phase === 'chasing' && '选号中...'}
          {phase === 'locking' && '锁定中...'}
          {phase === 'revealed' && 'N: 下一轮 | F: 全屏'}
        </span>
      </div>
    </div>
  )
}
