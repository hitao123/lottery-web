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
    <div className="absolute bottom-5 left-0 right-0 flex justify-center px-4 pointer-events-none z-10">
      <div
        className="glass-surface w-full max-w-[980px] rounded-[22px] px-5 py-3 text-sm"
        style={{
          fontFamily: '"Outfit", system-ui, sans-serif',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, max-content)) 1fr',
          alignItems: 'center',
          columnGap: '18px',
          rowGap: '8px',
          padding: '8px 15px'
        }}
      >
        <span style={{ color: '#fff1c9', fontWeight: 600 }}>
          第{currentRound}轮
        </span>

        <span style={{ color: 'rgba(255, 248, 240, 0.78)' }}>
          已抽 <strong style={{ color: '#fff1c9' }}>{wonCount}</strong> / {totalGuests} 人
        </span>

        <span style={{ color: 'rgba(255, 248, 240, 0.56)' }}>
          剩余 {remaining} 人
        </span>

        <span style={{ color: 'rgba(255, 241, 201, 0.2)' }}>|</span>

        <span style={{ color: 'rgba(255, 248, 240, 0.42)', justifySelf: 'end', textAlign: 'right' }}>
          {phase === 'idle' && 'Space 开始洗牌'}
          {phase === 'spinning' && '抽奖箱洗牌中，按 S 最终锁定中奖者'}
          {phase === 'chasing' && '正在从抽奖箱中筛出幸运来宾...'}
          {phase === 'locking' && '幸运来宾锁定中'}
          {phase === 'revealed' && 'Enter / N 下一轮 | F 全屏'}
        </span>
      </div>
    </div>
  )
}
