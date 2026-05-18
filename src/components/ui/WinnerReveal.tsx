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
          <div className="text-center">
            {/* Top decoration */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm tracking-[0.3em] uppercase mb-4"
              style={{ color: 'rgba(255, 215, 0, 0.7)' }}
            >
              Round {currentRound}
            </motion.div>

            {/* Main title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
              className="text-2xl mb-6 tracking-wider"
              style={{ color: 'rgba(255, 248, 231, 0.9)' }}
            >
              Lucky Guest
            </motion.div>

            {/* Winner number - big and prominent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 12 }}
              className="text-7xl font-bold mb-6 tracking-wider"
              style={{
                color: '#d4af37',
                textShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
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
              style={{ color: 'rgba(255, 255, 255, 0.5)' }}
            >
              Forever Love
            </motion.div>

            {/* Keyboard hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 text-xs tracking-wider"
              style={{ color: 'rgba(255, 255, 255, 0.3)' }}
            >
              Press N for next round
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
