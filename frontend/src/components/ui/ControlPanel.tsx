import { useState } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'
import { motion, AnimatePresence } from 'framer-motion'
import { getMasterVolume, setMasterVolume } from '@/utils/audio'

export function ControlPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [rangeInput, setRangeInput] = useState('5200001-5200200')
  const [masterVolume, setMasterVolumeState] = useState(() => getMasterVolume())
  const addGuests = useLotteryStore((s) => s.addGuests)
  const winners = useLotteryStore((s) => s.winners)
  const guests = useLotteryStore((s) => s.guests)
  const reset = useLotteryStore((s) => s.reset)
  const removeWinner = useLotteryStore((s) => s.removeWinner)
  const currentRound = useLotteryStore((s) => s.currentRound)
  const phase = useLotteryStore((s) => s.phase)

  const totalGuests = guests.length
  const wonCount = winners.length
  const remaining = totalGuests - wonCount
  const phaseHint =
    phase === 'idle'
      ? 'Space 开始洗牌'
      : phase === 'spinning'
        ? '抽奖箱洗牌中，按 S 最终锁定中奖者'
        : phase === 'chasing'
          ? '正在从抽奖箱中筛出幸运来宾...'
          : phase === 'locking'
            ? '幸运来宾锁定中'
            : 'Enter / N 下一轮 | F 全屏'

  const handleImport = () => {
    const match = rangeInput.match(/^(\d+)-(\d+)$/)
    if (match) {
      const start = parseInt(match[1])
      const end = parseInt(match[2])
      if (start > 0 && end >= start && end - start <= 5000) {
        const codes = Array.from({ length: end - start + 1 }, (_, i) =>
          String(start + i)
        )
        addGuests(codes)
      }
    }
  }

  const handleVolumeChange = (value: number) => {
    setMasterVolumeState(value)
    setMasterVolume(value)
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-5 right-5 z-30 rounded-full px-5 py-2.5 cursor-pointer transition-all hover:brightness-110"
        style={{
          background:
            "linear-gradient(180deg, rgba(120, 18, 34, 0.92), rgba(88, 12, 25, 0.92))",
          border: "1px solid rgba(255, 241, 201, 0.26)",
          color: "#fff1c9",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.24)",
          fontFamily: '"Outfit", system-ui, sans-serif',
          fontSize: "13px",
          letterSpacing: "0.14em",
          padding: "0 12px",
        }}
      >
        {isOpen ? "收起面板" : "控制面板"}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 h-full z-20 overflow-y-auto"
            style={{
              width: "360px",
              background: "rgba(33, 8, 13, 0.94)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(255, 241, 201, 0.16)",
              padding: "32px 24px 36px",
              marginTop: "20px",
              height: "calc(100% - 20px)",
              boxSizing: "border-box",
            }}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  className="text-lg font-semibold tracking-wider leading-none"
                  style={{ color: "rgba(255, 241, 201, 0.92)" }}
                >
                  控制面板
                </h2>
                <p
                  className="mt-3 text-xs leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.38)" }}
                >
                  婚礼抽奖设置与名单管理
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all hover:brightness-110"
                style={{
                  background: "rgba(125, 18, 37, 0.88)",
                  border: "1px solid rgba(255, 241, 201, 0.22)",
                  color: "#fff1c9",
                }}
              >
                ×
              </button>
            </div>

            {/* Draw progress (moved from bottom status bar) */}
            <div
              className="mb-6 rounded-[22px] px-4 py-4"
              style={{
                background: "rgba(255, 248, 240, 0.035)",
                border: "1px solid rgba(255, 241, 201, 0.08)",
                marginBottom: "16px",
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <span style={{ color: "#fff1c9", fontWeight: 600, fontSize: "14px" }}>
                  第{currentRound}轮
                </span>
                <span style={{ color: "rgba(255, 248, 240, 0.56)", fontSize: "13px" }}>
                  剩余 {remaining} 人
                </span>
              </div>
              <div style={{ color: "rgba(255, 248, 240, 0.78)", fontSize: "13px" }}>
                已抽 <strong style={{ color: "#fff1c9" }}>{wonCount}</strong> / {totalGuests} 人
              </div>
              <p
                className="text-xs mt-3 leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              >
                {phaseHint}
              </p>
            </div>

            {/* Number import */}
            <div
              className="mb-6 rounded-[22px] px-4 py-4"
              style={{
                background: "rgba(255, 248, 240, 0.035)",
                border: "1px solid rgba(255, 241, 201, 0.08)",
                marginBottom: "16px",
              }}
            >
              <label
                className="block text-sm mb-3"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                来宾编号范围
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="5200001-5200200"
                  className="flex-1 px-3 py-3 rounded-xl text-sm outline-none"
                  style={{
                    background: "rgba(255, 248, 240, 0.07)",
                    border: "1px solid rgba(255, 241, 201, 0.18)",
                    color: "rgba(255, 255, 255, 0.88)",
                  }}
                />
                <button
                  onClick={handleImport}
                  className="px-4 py-3 rounded-xl text-sm cursor-pointer transition-all hover:brightness-110"
                  style={{
                    background: "rgba(146, 18, 36, 0.55)",
                    border: "1px solid rgba(255, 241, 201, 0.32)",
                    color: "#fff1c9",
                  }}
                >
                  确认
                </button>
              </div>
              <p
                className="text-xs mt-2 leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              >
                当前已加载：{guests.length} 位来宾
              </p>
            </div>

            {/* Winners list */}
            <div
              className="mb-6 rounded-[22px] px-4 py-4"
              style={{
                background: "rgba(255, 248, 240, 0.035)",
                border: "1px solid rgba(255, 241, 201, 0.08)",
                marginBottom: "16px",
              }}
            >
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                中奖名单（{winners.length}）
              </h3>
              <div
                className="max-h-48 overflow-y-auto rounded-lg p-3"
                style={{
                  background: "rgba(255, 248, 240, 0.04)",
                  border: "1px solid rgba(255, 241, 201, 0.08)",
                }}
              >
                {winners.length === 0 ? (
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(255, 255, 255, 0.3)" }}
                  >
                    暂无中奖者
                  </p>
                ) : (
                  winners.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                      style={{ color: "rgba(255, 241, 201, 0.84)" }}
                    >
                      <span className="min-w-0" style={{ fontWeight: 600 }}>
                        NO.{w.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>
                          第{w.wonAtRound}轮
                        </span>
                        <button
                          onClick={() => removeWinner(w.id)}
                          className="w-5 h-5 rounded flex items-center justify-center cursor-pointer transition-all hover:brightness-150"
                          style={{
                            background: "rgba(255, 96, 96, 0.18)",
                            color: "rgba(255, 208, 208, 0.84)",
                            fontSize: "11px",
                          }}
                          title="撤销中奖（不在现场则重抽）"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {winners.length > 0 && (
                <p
                  className="text-xs mt-2 leading-relaxed"
                  style={{ color: "rgba(255, 255, 255, 0.25)" }}
                >
                  点击 × 可撤销中奖（如来宾不在现场）
                </p>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              className="w-full px-4 py-3.5 rounded-[18px] text-sm cursor-pointer transition-all hover:brightness-110"
              style={{
                background: "rgba(120, 18, 34, 0.52)",
                border: "1px solid rgba(255, 224, 224, 0.22)",
                color: "rgba(255, 232, 232, 0.88)",
                display: "block",
                marginBottom: "16px",
              }}
            >
              重置所有
            </button>

            <div
              className="mt-6 rounded-[16px] p-4"
              style={{
                background: "rgba(255, 248, 240, 0.035)",
                border: "1px solid rgba(255, 241, 201, 0.08)",
                marginBottom: "16px",
              }}
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3
                  className="text-sm font-medium"
                  style={{ color: "rgba(255, 255, 255, 0.6)" }}
                >
                  音量
                </h3>
                <span
                  style={{
                    color: "#fff1c9",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full cursor-pointer align-middle"
                style={{ accentColor: "#d9bf92" }}
              />
              <p
                className="text-xs mt-3 leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.3)" }}
              >
                默认已提高主音量，可按现场设备继续微调
              </p>
            </div>

            {/* Keyboard shortcuts */}
            <div
              className="mt-6 rounded-[16px] p-4"
              style={{
                background: "rgba(255, 248, 240, 0.035)",
                border: "1px solid rgba(255, 241, 201, 0.08)",
              }}
            >
              <h3
                className="text-sm font-medium mb-4"
                style={{ color: "rgba(255, 255, 255, 0.6)" }}
              >
                快捷键
              </h3>
              <div
                className="space-y-3 text-xs"
                style={{ color: "rgba(255, 255, 255, 0.4)" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "#fff1c9", minWidth: 64 }}>空格</span>
                  <span>开始洗牌</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "#fff1c9", minWidth: 64 }}>S</span>
                  <span>最终锁定中奖者</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "#fff1c9", minWidth: 64 }}>
                    Enter / N
                  </span>
                  <span>进入下一轮</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "#fff1c9", minWidth: 64 }}>F</span>
                  <span>全屏</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span style={{ color: "#fff1c9", minWidth: 64 }}>R</span>
                  <span>重置</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
