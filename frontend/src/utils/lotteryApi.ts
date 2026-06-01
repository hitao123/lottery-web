import type { Guest } from '@/types'
import { DRAW_TIMEOUT_MS, LOTTERY_API_BASE } from '@/config/env'

export type LotteryApiErrorCode = 'TIMEOUT' | 'NETWORK' | 'HTTP' | 'PARSE'

/**
 * 统一的抽奖后端调用错误。调用方根据 code 决定是否降级。
 */
export class LotteryApiError extends Error {
  readonly code: LotteryApiErrorCode
  readonly status?: number

  constructor(code: LotteryApiErrorCode, message: string, status?: number) {
    super(message)
    this.name = 'LotteryApiError'
    this.code = code
    this.status = status
  }
}

export interface DrawResponse {
  winners: Guest[]
}

export interface GuestsResponse {
  guests: Guest[]
  currentRound: number
  total: number
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: unknown
  timeoutMs?: number
  signal?: AbortSignal
}

/**
 * 内部 fetch 封装：超时、错误归一化、JSON 解析。
 */
async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, timeoutMs = DRAW_TIMEOUT_MS, signal } = opts

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  const onExternalAbort = () => controller.abort()
  signal?.addEventListener('abort', onExternalAbort)

  let res: Response
  try {
    res = await fetch(`${LOTTERY_API_BASE}${path}`, {
      method,
      headers: body != null ? { 'Content-Type': 'application/json' } : undefined,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new LotteryApiError('TIMEOUT', `request timed out after ${timeoutMs}ms`)
    }
    throw new LotteryApiError('NETWORK', (err as Error).message)
  } finally {
    window.clearTimeout(timer)
    signal?.removeEventListener('abort', onExternalAbort)
  }

  if (!res.ok) {
    let detail = ''
    try {
      detail = await res.text()
    } catch {
      /* ignore */
    }
    throw new LotteryApiError('HTTP', `HTTP ${res.status}: ${detail}`, res.status)
  }

  try {
    return (await res.json()) as T
  } catch (err) {
    throw new LotteryApiError('PARSE', (err as Error).message)
  }
}

/** 上传/重置宾客列表。 */
export function uploadGuests(codes: string[], signal?: AbortSignal) {
  return request<{ total: number }>('/guests', {
    method: 'POST',
    body: { codes },
    signal,
  })
}

/** 查询宾客与轮次。 */
export function listGuests(signal?: AbortSignal) {
  return request<GuestsResponse>('/guests', { signal })
}

/** 抽奖。count 默认 1。 */
export function draw(count = 1, signal?: AbortSignal) {
  return request<DrawResponse>('/draw', {
    method: 'POST',
    body: { count },
    signal,
  })
}

/** 撤销中奖。 */
export function revokeWinner(guestId: number, signal?: AbortSignal) {
  return request<{ ok: boolean }>(`/winners/${guestId}/revoke`, {
    method: 'POST',
    signal,
  })
}

/** 全部重置。 */
export function resetLottery(signal?: AbortSignal) {
  return request<{ ok: boolean }>('/reset', { method: 'POST', signal })
}
