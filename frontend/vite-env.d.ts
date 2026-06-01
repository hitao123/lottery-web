/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * 抽奖后端 API 基础路径，默认 `/api/lottery`，
   * 生产环境通常由 Nginx 反向代理到 Go 后端。
   */
  readonly VITE_LOTTERY_API_BASE?: string
  /**
   * 单次抽奖请求的超时（毫秒），默认 1500。超时后将自动降级为本地随机。
   */
  readonly VITE_LOTTERY_DRAW_TIMEOUT_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
