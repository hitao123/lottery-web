import { useState } from 'react'
import { useLotteryStore } from '@/store/useLotteryStore'
import { motion, AnimatePresence } from 'framer-motion'

export function ControlPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [rangeInput, setRangeInput] = useState('1-200')
  const addGuests = useLotteryStore((s) => s.addGuests)
  const winners = useLotteryStore((s) => s.winners)
  const guests = useLotteryStore((s) => s.guests)
  const reset = useLotteryStore((s) => s.reset)

  const handleImport = () => {
    const match = rangeInput.match(/^(\d+)-(\d+)$/)
    if (match) {
      const start = parseInt(match[1])
      const end = parseInt(match[2])
      if (start > 0 && end >= start && end <= 9999) {
        const codes = Array.from({ length: end - start + 1 }, (_, i) =>
          String(start + i).padStart(3, '0')
        )
        addGuests(codes)
      }
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          color: 'rgba(255, 215, 0, 0.7)',
        }}
      >
        {isOpen ? '×' : '⚙'}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 w-80 h-full z-20 p-6 overflow-y-auto"
            style={{
              background: 'rgba(10, 10, 26, 0.95)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(255, 215, 0, 0.15)',
            }}
          >
            <h2
              className="text-lg font-semibold mb-6 tracking-wider"
              style={{ color: 'rgba(255, 215, 0, 0.9)' }}
            >
              控制面板
            </h2>

            {/* Number import */}
            <div className="mb-6">
              <label
                className="block text-sm mb-2"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                来宾编号范围
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={rangeInput}
                  onChange={(e) => setRangeInput(e.target.value)}
                  placeholder="1-200"
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                />
                <button
                  onClick={handleImport}
                  className="px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:brightness-110"
                  style={{
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    color: '#d4af37',
                  }}
                >
                  确认
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                当前已加载：{guests.length} 位来宾
              </p>
            </div>

            {/* Winners list */}
            <div className="mb-6">
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                中奖名单（{winners.length}）
              </h3>
              <div
                className="max-h-48 overflow-y-auto rounded-lg p-3"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                {winners.length === 0 ? (
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                    暂无中奖者
                  </p>
                ) : (
                  winners.map((w) => (
                    <div
                      key={w.id}
                      className="flex justify-between py-1 text-sm"
                      style={{ color: 'rgba(255, 215, 0, 0.7)' }}
                    >
                      <span>NO.{w.code}</span>
                      <span style={{ color: 'rgba(255, 255, 255, 0.3)' }}>
                        第 {w.wonAtRound} 轮
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              className="w-full px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:brightness-110"
              style={{
                background: 'rgba(255, 80, 80, 0.1)',
                border: '1px solid rgba(255, 80, 80, 0.3)',
                color: 'rgba(255, 80, 80, 0.8)',
              }}
            >
              重置所有
            </button>

            {/* Keyboard shortcuts */}
            <div className="mt-8">
              <h3
                className="text-sm font-medium mb-3"
                style={{ color: 'rgba(255, 255, 255, 0.6)' }}
              >
                快捷键
              </h3>
              <div className="space-y-2 text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                <div className="flex justify-between">
                  <span>空格</span><span>开始抽奖</span>
                </div>
                <div className="flex justify-between">
                  <span>Enter</span><span>确认中奖</span>
                </div>
                <div className="flex justify-between">
                  <span>N</span><span>下一轮</span>
                </div>
                <div className="flex justify-between">
                  <span>F</span><span>全屏</span>
                </div>
                <div className="flex justify-between">
                  <span>R</span><span>重置</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
