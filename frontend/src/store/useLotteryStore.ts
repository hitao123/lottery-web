import { create } from 'zustand'
import type { Guest, LotteryPhase, LotteryStore } from '@/types'
import { LotteryApiError, draw as apiDraw, uploadGuests as apiUploadGuests } from '@/utils/lotteryApi'

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

    // 同步上传到后端（best-effort，失败仅打印 warn，不影响本地抽奖）。
    apiUploadGuests(codes).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[lottery] uploadGuests to backend failed, fallback to local only:', err)
    })
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

  selectWinnerAsync: async () => {
    const { guests } = get()
    const available = guests.filter((g) => !g.hasWon)
    if (available.length === 0) return null

    try {
      const { winners } = await apiDraw(1)
      const remoteWinner = winners[0]
      if (!remoteWinner) {
        // 后端返回空数组视为异常，降级到本地。
        return get().selectWinner()
      }

      // 在本地 guests 中按 id 定位；若 id 不匹配（例如 guests 仅在前端存在），
      // 退回按 code 匹配。两者都失败则降级到本地。
      const localMatch =
        guests.find((g) => g.id === remoteWinner.id) ??
        guests.find((g) => g.code === remoteWinner.code)

      if (!localMatch) {
        return get().selectWinner()
      }

      set({ currentWinner: localMatch })
      return localMatch
    } catch (err) {
      const code = err instanceof LotteryApiError ? err.code : 'UNKNOWN'
      // eslint-disable-next-line no-console
      console.warn(`[lottery] backend draw failed (${code}), fallback to local random:`, err)
      return get().selectWinner()
    }
  },

  confirmWinner: () => {
    const { currentWinner, guests, winners, currentRound } = get()
    if (!currentWinner) return
    // Prevent double-confirm
    if (winners.some((w) => w.id === currentWinner.id)) return
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

  removeWinner: (guestId: number) => {
    const { guests, winners } = get()
    // Mark guest as not won, remove from winners list
    const updatedGuests = guests.map((g) =>
      g.id === guestId ? { ...g, hasWon: false, wonAtRound: undefined } : g
    )
    const updatedWinners = winners.filter((w) => w.id !== guestId)
    set({
      guests: updatedGuests,
      winners: updatedWinners,
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
