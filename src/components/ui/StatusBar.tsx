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
          background: 'linear-gradient(180deg, rgba(88, 20, 28, 0.48) 0%, rgba(20, 7, 11, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(246, 221, 154, 0.24)',
          padding: '0 12px',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
        }}
      >
        {/* Round info */}
        <span style={{ color: 'rgba(255, 232, 184, 0.9)' }}>
          第 {currentRound} 轮
        </span>

        <span style={{ color: 'rgba(255, 242, 224, 0.22)' }}>|</span>

        {/* Progress */}
        <span style={{ color: 'rgba(255, 244, 226, 0.72)' }}>
          已抽 {wonCount} / {totalGuests} 人
        </span>

        <span style={{ color: 'rgba(255, 242, 224, 0.22)' }}>|</span>

        {/* Remaining */}
        <span style={{ color: 'rgba(255, 235, 214, 0.56)' }}>
          剩余 {remaining} 人
        </span>

        <span style={{ color: 'rgba(255, 242, 224, 0.22)' }}>|</span>

        {/* Keyboard hints */}
        <span style={{ color: 'rgba(255, 240, 221, 0.42)' }}>
          {phase === 'idle' && '按空格键开始'}
          {phase === 'spinning' && '按空格键停止'}
          {phase === 'chasing' && '选号中...'}
          {phase === 'locking' && '锁定中...'}
          {phase === 'revealed' && 'N: 下一轮 | F: 全屏'}
        </span>
      </div>
    </div>
  )
}
