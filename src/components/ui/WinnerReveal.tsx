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
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <div
            className="winner-card text-center px-14 py-12 rounded-2xl relative"
            style={{
              background: 'linear-gradient(170deg, rgba(26, 26, 36, 0.92) 0%, rgba(10, 10, 15, 0.96) 100%)',
              border: '1.5px solid rgba(201, 168, 76, 0.35)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 60px rgba(201, 168, 76, 0.08)',
            }}
          >
            {/* Round indicator */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs tracking-[0.5em] mb-4"
              style={{
                color: 'rgba(232, 213, 163, 0.55)',
                fontFamily: '"Outfit", system-ui, sans-serif',
              }}
            >
              第 {currentRound} 轮
            </motion.div>

            {/* Decorative line */}
            <div
              className="mx-auto mb-6"
              style={{
                width: '50%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.45), transparent)',
              }}
            />

            {/* Winner number — THE star of the show */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 140, damping: 18 }}
              className="winner-number text-8xl font-bold my-4 tracking-[0.02em]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                lineHeight: 1.1,
              }}
            >
              NO.{currentWinner.code}
            </motion.div>

            {/* Bottom decorative line */}
            <div
              className="mx-auto mt-6 mb-5"
              style={{
                width: '50%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.45), transparent)',
              }}
            />

            {/* Keyboard hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-xs tracking-[0.2em]"
              style={{
                color: 'rgba(232, 232, 232, 0.3)',
                fontFamily: '"Outfit", system-ui, sans-serif',
              }}
            >
              按 N 进入下一轮
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
