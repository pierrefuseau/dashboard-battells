import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Pipeline from './components/Pipeline'
import SponsorTable from './components/SponsorTable'
import RevenueBreakdown from './components/RevenueBreakdown'
import { mockSponsors, revenueData } from './mockData'

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

export default function Sponsors() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="title-display text-text-primary">
          SPONSORS & PARTENARIATS
        </h1>
        <button className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto">
          <Plus size={18} />
          Nouveau sponsor
        </button>
      </motion.div>

      {/* Pipeline */}
      <motion.div variants={fadeUp}>
        <Pipeline sponsors={mockSponsors} />
      </motion.div>

      {/* Sponsor Table */}
      <motion.div variants={fadeUp}>
        <SponsorTable sponsors={mockSponsors} />
      </motion.div>

      {/* Revenue Breakdown */}
      <motion.div variants={fadeUp}>
        <RevenueBreakdown data={revenueData} />
      </motion.div>
    </motion.div>
  )
}
