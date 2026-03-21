import { motion } from 'framer-motion'
import { MonitorSmartphone } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Platforms() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="title-display text-text-primary">
          COMPARAISON PLATEFORMES
        </h1>
      </motion.div>

      {/* Empty state */}
      <motion.div variants={fadeUp} className="card p-12 flex flex-col items-center justify-center text-center">
        <MonitorSmartphone size={48} className="text-text-tertiary/40 mb-4" />
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-2">
          Données non connectées
        </h2>
        <p className="text-sm font-[var(--font-satoshi)] text-text-secondary max-w-md">
          Seul YouTube est connecté pour le moment. Les données TikTok et Instagram seront disponibles une fois les API respectives configurées.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <span className="badge bg-error-50 text-error-dark">YouTube — connecté</span>
          <span className="badge bg-border-light text-text-tertiary">TikTok — non connecté</span>
          <span className="badge bg-border-light text-text-tertiary">Instagram — non connecté</span>
        </div>
      </motion.div>
    </motion.div>
  )
}
