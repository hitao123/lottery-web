/**
 * 集中读取 import.meta.env 中的抽奖后端配置。
 * 默认值与开发态行为保持安全：超时短、走同源 /api/lottery。
 */

const DEFAULT_API_BASE = '/api/lottery'
const DEFAULT_DRAW_TIMEOUT_MS = 1500

export const LOTTERY_API_BASE: string =
  (import.meta.env.VITE_LOTTERY_API_BASE?.replace(/\/+$/, '')) || DEFAULT_API_BASE

export const DRAW_TIMEOUT_MS: number = (() => {
  const raw = import.meta.env.VITE_LOTTERY_DRAW_TIMEOUT_MS
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DRAW_TIMEOUT_MS
})()
