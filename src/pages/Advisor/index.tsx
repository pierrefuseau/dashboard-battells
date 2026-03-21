import { motion } from 'framer-motion'
import { BotMessageSquare } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Advisor() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
    >
      <motion.h1
        variants={fadeUp}
        className="title-display text-text-primary mb-6"
      >
        CONSEILLER IA
      </motion.h1>

      {/* Empty state */}
      <motion.div variants={fadeUp} className="card p-12 flex flex-col items-center justify-center text-center">
        <BotMessageSquare size={48} className="text-text-tertiary/40 mb-4" />
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-2">
          Conseiller IA non configuré
        </h2>
        <p className="text-sm font-[var(--font-satoshi)] text-text-secondary max-w-md">
          Le conseiller IA analysera automatiquement les performances de la chaîne et proposera des recommandations une fois le module connecté.
        </p>
      </motion.div>
    </motion.div>
  )
}
