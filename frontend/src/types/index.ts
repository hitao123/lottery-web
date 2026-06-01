export type Guest = {
  id: number
  code: string // "001", "052", "188" etc.
  hasWon: boolean
  wonAtRound?: number
}

export type LotteryPhase =
  | 'idle'
  | 'spinning'
  | 'chasing'
  | 'locking'
  | 'revealed'

export type LotteryStore = {
  // State
  phase: LotteryPhase
  guests: Guest[]
  winners: Guest[]
  currentRound: number
  currentWinner: Guest | null

  // Actions
  setPhase: (phase: LotteryPhase) => void
  addGuests: (codes: string[]) => void
  startDraw: () => void
  /**
   * 本地伪随机抽奖（基于 Math.random）。保留作为后端不可用时的兜底，
   * 调用方一般应优先使用 selectWinnerAsync。
   */
  selectWinner: () => Guest | null
  /**
   * 调用后端 /api/lottery/draw 进行加密安全抽奖。
   * 失败/超时时自动降级为 selectWinner()，保证体验不被打断。
   */
  selectWinnerAsync: () => Promise<Guest | null>
  confirmWinner: () => void
  removeWinner: (guestId: number) => void
  nextRound: () => void
  reset: () => void
}
