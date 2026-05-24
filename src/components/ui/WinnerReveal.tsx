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
          className="absolute inset-0 flex items-start justify-center pt-24 pointer-events-none z-20"
        >
          <div
            className="winner-card text-center px-11 py-9 rounded-[28px] relative"
            style={{
              background: 'linear-gradient(170deg, rgba(125, 18, 37, 0.92) 0%, rgba(53, 7, 16, 0.97) 100%)',
              border: '1.5px solid rgba(255, 241, 201, 0.36)',
              boxShadow: '0 24px 80px rgba(0, 0, 0, 0.55), 0 0 60px rgba(255, 215, 147, 0.12)',
            }}
          >
            <div
              className="absolute left-6 right-6 top-4 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255, 241, 201, 0.38), transparent)' }}
            />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs tracking-[0.5em] mb-4"
              style={{
                color: 'rgba(255, 241, 201, 0.72)',
                fontFamily: '"Outfit", system-ui, sans-serif',
              }}
            >
              第 {currentRound} 轮
            </motion.div>

            <div
              className="mx-auto mb-6"
              style={{
                width: '50%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 241, 201, 0.6), transparent)',
              }}
            />

            <div
              className="text-sm tracking-[0.35em] uppercase"
              style={{ color: 'rgba(255, 248, 240, 0.7)', fontFamily: '"Outfit", system-ui, sans-serif' }}
            >
              Lucky Guest
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 140, damping: 18 }}
              className="winner-number text-7xl font-bold my-4 tracking-[0.03em]"
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                lineHeight: 1.1,
              }}
            >
              NO.{currentWinner.code}
            </motion.div>

            <div
              className="mx-auto mt-6 mb-5"
              style={{
                width: '50%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255, 241, 201, 0.6), transparent)',
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-sm"
              style={{ color: 'rgba(255, 248, 240, 0.78)', fontFamily: '"Outfit", system-ui, sans-serif' }}
            >
              已自动加入中奖名单
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="text-[11px] tracking-[0.16em]"
              style={{
                color: 'rgba(255, 248, 240, 0.5)',
                fontFamily: '"Outfit", system-ui, sans-serif',
              }}
            >
              按 Enter 或 N 进入下一轮
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
