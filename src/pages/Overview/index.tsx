import { motion } from 'framer-motion'
import KpiCard from '@/components/ui/KpiCard'
import ChannelHeader from './components/ChannelHeader'
import ViewsTrendChart from './components/ViewsTrendChart'
import TopVideos from './components/TopVideos'
import MonthlyGoals from './components/MonthlyGoals'
import AlertsFeed from './components/AlertsFeed'
import { kpiData, darkCardData } from './mockData'
import DarkCard from '@/components/ui/DarkCard'

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

export default function Overview() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Channel Header */}
      <motion.div variants={fadeUp}>
        <ChannelHeader />
      </motion.div>

      {/* Page Title */}
      <motion.h1
        variants={fadeUp}
        className="font-[var(--font-clash)] text-4xl font-bold text-text-primary mb-6"
      >
        Overview
      </motion.h1>

      {/* ── Section 1: KPI Row ─────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-6 mb-6">
        <KpiCard
          label="Vues 30j"
          value={kpiData.views.value}
          previousValue={kpiData.views.previousValue}
          format="compact"
          sparklineData={kpiData.views.sparkline}
        />
        <KpiCard
          label="Revenu"
          value={kpiData.revenue.value}
          previousValue={kpiData.revenue.previousValue}
          format="euros"
          sparklineData={kpiData.revenue.sparkline}
        />
        <KpiCard
          label="Abonnes"
          value={kpiData.subscribers.value}
          previousValue={kpiData.subscribers.previousValue}
          format="compact"
          sparklineData={kpiData.subscribers.sparkline}
        />
        <KpiCard
          label="CTR moyen"
          value={kpiData.ctr.value}
          previousValue={kpiData.ctr.previousValue}
          format="percent"
          sparklineData={kpiData.ctr.sparkline}
        />
      </motion.div>

      {/* ── Section 2: Charts (8/4 split) ─────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-12 gap-6 mb-6">
        <div className="col-span-8">
          <ViewsTrendChart />
        </div>
        <div className="col-span-4">
          <TopVideos />
        </div>
      </motion.div>

      {/* ── Section 3: Dark Card + Monthly Goals ──────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-6 mb-6">
        <DarkCard
          emoji={darkCardData.emoji}
          title={darkCardData.title}
          subtitle={darkCardData.subtitle}
          detail={darkCardData.detail}
        />
        <MonthlyGoals />
      </motion.div>

      {/* ── Section 4: Alerts Feed ────────────────────── */}
      <motion.div variants={fadeUp}>
        <AlertsFeed />
      </motion.div>
    </motion.div>
  )
}
