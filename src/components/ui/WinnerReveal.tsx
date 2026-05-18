import { useLotteryStore } from '@/store/useLotteryStore'
import { motion, AnimatePresence } from 'framer-motion'

export function WinnerReveal() {
  const phase = useLotteryStore((s) => s.phase)
  const currentWinner = useLotteryStore((s) => s.currentWinner)
  const currentRound = useLotteryStore((s) => s.currentRound)

  return (
    <AnimatePresence>
      {phase === 'revealed' && currentWinner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <div
            className="text-center px-12 py-10 rounded-[30px]"
            style={{
              background: 'linear-gradient(180deg, rgba(96, 25, 34, 0.76) 0%, rgba(21, 6, 10, 0.9) 100%)',
              border: '1px solid rgba(246, 221, 154, 0.34)',
              boxShadow:
                '0 24px 90px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 90px rgba(213, 166, 74, 0.16)',
            }}
          >
            {/* Top decoration */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm tracking-[0.3em] mb-4"
              style={{ color: 'rgba(255, 230, 173, 0.86)' }}
            >
              第 {currentRound} 轮
            </motion.div>

            {/* Main title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="text-2xl mb-6 tracking-wider"
              style={{ color: 'rgba(255, 244, 226, 0.96)' }}
            >
              喜宴幸运嘉宾
            </motion.div>

            {/* Winner number - big and prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 12 }}
              className="text-7xl font-bold mb-6 tracking-wider"
              style={{
                color: '#ffe1a0',
                textShadow: '0 0 28px rgba(213, 166, 74, 0.58), 0 0 62px rgba(213, 166, 74, 0.24)',
              }}
            >
              NO.{currentWinner.code}
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg tracking-[0.2em]"
              style={{ color: 'rgba(255, 235, 205, 0.68)' }}
            >
              恭喜中奖
            </motion.div>

            {/* Keyboard hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 text-xs tracking-wider"
              style={{ color: 'rgba(255, 239, 219, 0.42)' }}
            >
              按 N 进入下一轮
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
