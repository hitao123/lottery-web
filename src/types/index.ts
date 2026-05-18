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
  selectWinner: () => Guest | null
  confirmWinner: () => void
  removeWinner: (guestId: number) => void
  nextRound: () => void
  reset: () => void
}
