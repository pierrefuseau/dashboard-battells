import { motion } from 'framer-motion'
import KpiCard from '@/components/ui/KpiCard'
import ChannelHeader from './components/ChannelHeader'
import ViewsTrendChart from './components/ViewsTrendChart'
import TopVideos from './components/TopVideos'
import MonthlyGoals from './components/MonthlyGoals'
import AlertsFeed from './components/AlertsFeed'
import { kpiData as mockKpiData, darkCardData } from './mockData'
import DarkCard from '@/components/ui/DarkCard'
import { useChannelStats } from '@/hooks'
import { YOUTUBE_CONFIG } from '@/lib/youtube'

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
  const { kpis, loading } = useChannelStats({ days: 30 })

  // Use real data when available, fall back to mock for fields with no real data
  const viewsValue = kpis.totalViews > 0 ? kpis.totalViews : mockKpiData.views.value
  const viewsPrev = kpis.prevTotalViews > 0 ? kpis.prevTotalViews : mockKpiData.views.previousValue
  const viewsSparkline = kpis.viewsSparkline.length > 0 ? kpis.viewsSparkline : mockKpiData.views.sparkline

  const revenueValue = kpis.totalRevenue > 0 ? kpis.totalRevenue : mockKpiData.revenue.value
  const revenuePrev = kpis.prevTotalRevenue > 0 ? kpis.prevTotalRevenue : mockKpiData.revenue.previousValue
  const revenueSparkline = kpis.revenueSparkline.length > 0 ? kpis.revenueSparkline : mockKpiData.revenue.sparkline

  // Subscribers: yt_channel_daily has 0, use constant from config
  const subscribersValue = kpis.latestSubscribers > 0 ? kpis.latestSubscribers : YOUTUBE_CONFIG.subscriberCount
  const subscribersPrev = kpis.prevLatestSubscribers > 0 ? kpis.prevLatestSubscribers : mockKpiData.subscribers.previousValue
  const subscribersSparkline = kpis.subscribersSparkline.some(v => v > 0) ? kpis.subscribersSparkline : mockKpiData.subscribers.sparkline

  // CTR: may be 0 if no impressions data, fall back to mock
  const ctrValue = kpis.avgCTR > 0 ? kpis.avgCTR : mockKpiData.ctr.value
  const ctrPrev = kpis.prevAvgCTR > 0 ? kpis.prevAvgCTR : mockKpiData.ctr.previousValue
  const ctrSparkline = kpis.ctrSparkline.some(v => v > 0) ? kpis.ctrSparkline : mockKpiData.ctr.sparkline

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative"
    >
      {/* Decorative blobs — hidden on mobile via CSS */}
      <div className="blob-decorator w-[400px] h-[400px] -top-32 -right-32" />
      <div className="blob-decorator w-[250px] h-[250px] top-[600px] -left-24" style={{ animationDelay: '4s' }} />

      {/* Channel Header */}
      <motion.div variants={fadeUp}>
        <ChannelHeader />
      </motion.div>

      {/* Page Title — fluid via .title-display clamp() */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <h1 className="title-display text-text-primary">
          VUE D'ENSEMBLE
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <div className="h-1 w-12 sm:w-16 bg-primary rounded-full" />
          <span className="text-xs sm:text-sm font-[var(--font-satoshi)] text-text-secondary">
            Tableau de bord analytique
          </span>
        </div>
      </motion.div>

      {/* KPI Row — 2 cols mobile, 4 cols desktop */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
        {loading ? (
          <div className="col-span-2 lg:col-span-4 text-center py-8 text-text-secondary font-[var(--font-satoshi)]">
            Chargement...
          </div>
        ) : (
          <>
            <KpiCard
              label="Vues 30j"
              value={viewsValue}
              previousValue={viewsPrev}
              format="compact"
              sparklineData={viewsSparkline}
            />
            <KpiCard
              label="Revenu"
              value={revenueValue}
              previousValue={revenuePrev}
              format="euros"
              sparklineData={revenueSparkline}
            />
            <KpiCard
              label="Abonnés"
              value={subscribersValue}
              previousValue={subscribersPrev}
              format="compact"
              sparklineData={subscribersSparkline}
            />
            <KpiCard
              label="CTR moyen"
              value={ctrValue}
              previousValue={ctrPrev}
              format="percent"
              sparklineData={ctrSparkline}
            />
          </>
        )}
      </motion.div>

      {/* Charts — stacked on mobile, 8/4 on desktop */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <div className="lg:col-span-8">
          <ViewsTrendChart />
        </div>
        <div className="lg:col-span-4">
          <TopVideos />
        </div>
      </motion.div>

      {/* Dark Card + Monthly Goals — stacked on mobile */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
        <DarkCard
          emoji={darkCardData.emoji}
          title={darkCardData.title}
          subtitle={darkCardData.subtitle}
          detail={darkCardData.detail}
        />
        <MonthlyGoals />
      </motion.div>

      {/* Alerts Feed */}
      <motion.div variants={fadeUp}>
        <AlertsFeed />
      </motion.div>
    </motion.div>
  )
}
