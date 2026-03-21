import { motion } from 'framer-motion'
import ChatPanel from './components/ChatPanel'
import RecommendationsPanel from './components/RecommendationsPanel'

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Advisor() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Page Title */}
      <motion.h1
        variants={fadeUp}
        className="title-display text-text-primary mb-6"
      >
        CONSEILLER IA
      </motion.h1>

      {/* 2-column layout: stacked mobile, 8/4 desktop */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8">
          <ChatPanel />
        </div>
        <div className="lg:col-span-4">
          <RecommendationsPanel />
        </div>
      </motion.div>
    </motion.div>
  )
}
