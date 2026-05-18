import { create } from 'zustand'
import type { Guest, LotteryPhase, LotteryStore } from '@/types'

export const useLotteryStore = create<LotteryStore>((set, get) => ({
  // Initial state
  phase: 'idle' as LotteryPhase,
  guests: [],
  winners: [],
  currentRound: 1,
  currentWinner: null,

  // Actions
  setPhase: (phase) => set({ phase }),

  addGuests: (codes) => {
    const guests: Guest[] = codes.map((code, index) => ({
      id: index + 1,
      code,
      hasWon: false,
    }))
    set({ guests })
  },

  startDraw: () => {
    const { phase } = get()
    if (phase !== 'idle') return
    set({ phase: 'spinning' })
  },

  selectWinner: () => {
    const { guests } = get()
    const available = guests.filter((g) => !g.hasWon)
    if (available.length === 0) return null
    const randomIndex = Math.floor(Math.random() * available.length)
    const winner = available[randomIndex]
    set({ currentWinner: winner })
    return winner
  },

  confirmWinner: () => {
    const { currentWinner, guests, winners, currentRound } = get()
    if (!currentWinner) return
    const updatedGuests = guests.map((g) =>
      g.id === currentWinner.id
        ? { ...g, hasWon: true, wonAtRound: currentRound }
        : g
    )
    set({
      guests: updatedGuests,
      winners: [...winners, { ...currentWinner, hasWon: true, wonAtRound: currentRound }],
    })
  },

  nextRound: () => {
    const { currentRound } = get()
    set({
      phase: 'idle',
      currentRound: currentRound + 1,
      currentWinner: null,
    })
  },

  reset: () =>
    set({
      phase: 'idle',
      guests: get().guests.map((g) => ({ ...g, hasWon: false, wonAtRound: undefined })),
      winners: [],
      currentRound: 1,
      currentWinner: null,
    }),
}))
