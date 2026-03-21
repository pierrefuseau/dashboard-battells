import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Ideas() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <h1 className="title-display text-text-primary">
          IDÉES DE VIDÉOS
        </h1>
      </motion.div>

      {/* Empty state */}
      <motion.div variants={fadeUp} className="card p-12 flex flex-col items-center justify-center text-center">
        <Lightbulb size={48} className="text-text-tertiary/40 mb-4" />
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-2">
          Aucune idée enregistrée
        </h2>
        <p className="text-sm font-[var(--font-satoshi)] text-text-secondary max-w-md">
          Les idées de vidéos seront affichées ici une fois ajoutées à la base de données. L'IA pourra ensuite proposer des suggestions basées sur les tendances.
        </p>
      </motion.div>
    </motion.div>
  )
}
