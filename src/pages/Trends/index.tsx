import { motion } from 'framer-motion'
import TrendList from './components/TrendList'
import CharacterGrid from './components/CharacterGrid'
import { trends, characters } from './mockData'

export default function Trends() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
    >
      <h1 className="text-4xl font-bold font-[var(--font-clash)] text-text-primary mb-8">
        Tendances
      </h1>

      <div className="grid grid-cols-12 gap-6">
        <motion.div
          className="col-span-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' as const }}
        >
          <TrendList trends={trends} />
        </motion.div>

        <motion.div
          className="col-span-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' as const }}
        >
          <CharacterGrid characters={characters} />
        </motion.div>
      </div>
    </motion.div>
  )
}
