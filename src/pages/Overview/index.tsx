import { motion } from 'framer-motion'

export default function Overview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1 className="font-[var(--font-clash)] text-4xl font-bold text-text-primary mb-6">
        Overview
      </h1>
      <p className="text-text-secondary">Page en construction — Phase 1 MVP</p>
    </motion.div>
  )
}
