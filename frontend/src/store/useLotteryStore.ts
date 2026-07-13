import { create } from 'zustand'
import type { Guest, LotteryPhase, LotteryStore } from '@/types'
import {
  draw as apiDraw,
  getPendingDrawRequestId,
  listGuests,
  LotteryApiError,
  resetLottery,
  revokeWinner,
  setPendingDrawRequestId,
  uploadGuests,
  type GuestsResponse,
} from '@/utils/lotteryApi'

function winnersFrom(guests: Guest[]) {
  return guests.filter((guest) => guest.hasWon)
}

function snapshotState(snapshot: GuestsResponse) {
  return {
    guests: snapshot.guests,
    winners: winnersFrom(snapshot.guests),
    currentRound: snapshot.currentRound,
  }
}

function messageFor(error: unknown) {
  if (error instanceof LotteryApiError) {
    if (error.status === 401) return '需要先在控制面板输入操作密码。'
    if (error.code === 'TIMEOUT') return '抽奖请求超时。请重新开始并按 S 重试；系统会恢复同一次抽奖，不会另抽一人。'
    return `服务请求失败：${error.message}`
  }
  return '发生未知错误，请检查服务连接后重试。'
}

let drawRequestIdSequence = 0

function getCryptoRandomHex(byteLength: number) {
  const getRandomValues = globalThis.crypto?.getRandomValues
  if (typeof getRandomValues !== 'function') return ''

  const bytes = new Uint8Array(byteLength)
  getRandomValues.call(globalThis.crypto, bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function newDrawRequestId() {
  const randomUUID = globalThis.crypto?.randomUUID
  if (typeof globalThis.crypto?.randomUUID === 'function') return randomUUID.call(globalThis.crypto)

  drawRequestIdSequence += 1
  const entropy = getCryptoRandomHex(8) || drawRequestIdSequence.toString(36)
  return `draw-${Date.now().toString(36)}-${entropy}`
}

export const useLotteryStore = create<LotteryStore>((set, get) => ({
  phase: 'idle' as LotteryPhase,
  guests: [],
  winners: [],
  currentRound: 1,
  currentWinner: null,
  isLoading: false,
  isDrawing: false,
  error: null,

  setPhase: (phase) => set({ phase }),

  loadLottery: async () => {
    set({ isLoading: true, error: null })
    try {
      const snapshot = await listGuests()
      set({ ...snapshotState(snapshot), currentWinner: null })
    } catch (error) {
      set({ error: messageFor(error) })
    } finally {
      set({ isLoading: false })
    }
  },

  addGuests: async (codes) => {
    if (get().isLoading || get().isDrawing) return false
    set({ isLoading: true, error: null })
    try {
      const snapshot = await uploadGuests(codes)
      setPendingDrawRequestId('')
      set({ ...snapshotState(snapshot), phase: 'idle', currentWinner: null })
      return true
    } catch (error) {
      set({ error: messageFor(error) })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  startDraw: () => {
    const { phase, guests, isDrawing } = get()
    if (phase !== 'idle' || (guests.every((guest) => guest.hasWon) && !getPendingDrawRequestId()) || isDrawing) return
    set({ phase: 'spinning', error: null })
  },

  selectWinnerAsync: async () => {
    const { guests, isDrawing } = get()
    const requestId = getPendingDrawRequestId() || newDrawRequestId()
    if (isDrawing || (guests.every((guest) => guest.hasWon) && !getPendingDrawRequestId())) return null

    setPendingDrawRequestId(requestId)
    set({ isDrawing: true, error: null })
    try {
      const response = await apiDraw(1, requestId)
      const winner = response.winners[0]
      if (!winner) throw new Error('draw response did not include a winner')

      setPendingDrawRequestId('')
      set({ ...snapshotState(response), currentWinner: winner })
      return winner
    } catch (error) {
      set({ error: messageFor(error) })
      return null
    } finally {
      set({ isDrawing: false })
    }
  },

  removeWinner: async (guestId) => {
    if (get().isLoading || get().isDrawing) return false
    set({ isLoading: true, error: null })
    try {
      const snapshot = await revokeWinner(guestId)
      setPendingDrawRequestId('')
      set({ ...snapshotState(snapshot) })
      return true
    } catch (error) {
      set({ error: messageFor(error) })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  nextRound: () => set({ phase: 'idle', currentWinner: null }),

  reset: async () => {
    if (get().isLoading || get().isDrawing) return false
    set({ isLoading: true, error: null })
    try {
      const snapshot = await resetLottery()
      setPendingDrawRequestId('')
      set({ ...snapshotState(snapshot), phase: 'idle', currentWinner: null })
      return true
    } catch (error) {
      set({ error: messageFor(error) })
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))
