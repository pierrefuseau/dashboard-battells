import { motion } from 'framer-motion'
import PlatformCard from './components/PlatformCard'
import RadarComparison from './components/RadarComparison'
import { platforms } from './mockData'

const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Platforms() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="title-display text-[56px] text-text-primary">
          COMPARAISON PLATEFORMES
        </h1>
      </motion.div>

      {/* Platform Cards */}
      <motion.div variants={fadeUp} className="flex gap-6">
        {platforms.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} />
        ))}
      </motion.div>

      {/* Radar Chart */}
      <motion.div variants={fadeUp}>
        <RadarComparison />
      </motion.div>
    </motion.div>
  )
}
