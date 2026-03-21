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
    transition: { staggerChildren: 0.08 },
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
      className="relative"
    >
      {/* Decorative blobs (inspired by Sebas Baldeon) */}
      <div className="blob-decorator w-[400px] h-[400px] -top-32 -right-32" />
      <div className="blob-decorator w-[250px] h-[250px] top-[600px] -left-24" style={{ animationDelay: '4s' }} />

      {/* Channel Header */}
      <motion.div variants={fadeUp}>
        <ChannelHeader />
      </motion.div>

      {/* Page Title — MASSIVE Bebas Neue style like the portfolios */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="title-display text-[72px] text-text-primary">
          VUE D'ENSEMBLE
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <div className="h-1 w-16 bg-primary rounded-full" />
          <span className="text-sm font-[var(--font-satoshi)] text-text-secondary">
            Tableau de bord analytique
          </span>
        </div>
      </motion.div>

      {/* ── Section 1: KPI Row ─────────────────────────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-5 mb-8">
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
          label="Abonnés"
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
      <motion.div variants={fadeUp} className="grid grid-cols-12 gap-5 mb-8">
        <div className="col-span-8">
          <ViewsTrendChart />
        </div>
        <div className="col-span-4">
          <TopVideos />
        </div>
      </motion.div>

      {/* ── Section 3: Dark Card + Monthly Goals ──────── */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-5 mb-8">
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
