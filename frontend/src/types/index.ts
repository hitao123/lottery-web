export type Guest = {
  id: number
  code: string // "001", "052", "188" etc.
  hasWon: boolean
  wonAtRound?: number
}

export type LotteryPhase =
  | 'idle'
  | 'spinning'
  | 'drawing'
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
  isLoading: boolean
  isDrawing: boolean
  error: string | null

  // Actions
  setPhase: (phase: LotteryPhase) => void
  loadLottery: () => Promise<void>
  addGuests: (codes: string[]) => Promise<boolean>
  startDraw: () => void
  /**
   * 后端是唯一中奖结果源；失败时显示错误而不使用本地随机兜底。
   */
  selectWinnerAsync: () => Promise<Guest | null>
  removeWinner: (guestId: number) => Promise<boolean>
  nextRound: () => void
  reset: () => Promise<boolean>
  clearError: () => void
}
