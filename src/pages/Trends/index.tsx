import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Trends() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <h1 className="title-display text-text-primary mb-6 sm:mb-8">
          TENDANCES
        </h1>
      </motion.div>

      {/* Empty state */}
      <motion.div variants={fadeUp} className="card p-12 flex flex-col items-center justify-center text-center">
        <TrendingUp size={48} className="text-text-tertiary/40 mb-4" />
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-2">
          Tendances non disponibles
        </h2>
        <p className="text-sm font-[var(--font-satoshi)] text-text-secondary max-w-md">
          L'analyse de tendances sera activée une fois le module IA configuré. Il détectera automatiquement les sujets porteurs dans la niche food.
        </p>
      </motion.div>
    </motion.div>
  )
}
