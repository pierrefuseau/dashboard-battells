import { motion } from 'framer-motion'
import { Handshake } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Sponsors() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="title-display text-text-primary">
          SPONSORS & PARTENARIATS
        </h1>
      </motion.div>

      {/* Empty state */}
      <motion.div variants={fadeUp} className="card p-12 flex flex-col items-center justify-center text-center">
        <Handshake size={48} className="text-text-tertiary/40 mb-4" />
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-2">
          Aucun sponsor enregistré
        </h2>
        <p className="text-sm font-[var(--font-satoshi)] text-text-secondary max-w-md">
          Les données sponsors seront affichées ici une fois les partenariats ajoutés à la base de données Supabase.
        </p>
      </motion.div>
    </motion.div>
  )
}
