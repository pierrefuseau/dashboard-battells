import { motion } from 'framer-motion'
import KpiCard from '@/components/ui/KpiCard'
import ChannelHeader from './components/ChannelHeader'
import ViewsTrendChart from './components/ViewsTrendChart'
import TopVideos from './components/TopVideos'
import DarkCard from '@/components/ui/DarkCard'
import GrowthSparkline from './components/GrowthSparkline'
import { useChannelStats } from '@/hooks'
import { YOUTUBE_CONFIG } from '@/lib/youtube'
import { formatCompact, formatEuros } from '@/lib/formatters'

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

  // Real data — subscribers from config (API doesn't return daily subs)
  const viewsValue = kpis.totalViews
  const viewsPrev = kpis.prevTotalViews
  const viewsSparkline = kpis.viewsSparkline

  const revenueValue = kpis.totalRevenue
  const revenuePrev = kpis.prevTotalRevenue
  const revenueSparkline = kpis.revenueSparkline

  const subscribersValue = kpis.latestSubscribers > 0 ? kpis.latestSubscribers : YOUTUBE_CONFIG.subscriberCount
  const subscribersPrev = 0
  const subscribersSparkline: number[] = []

  // RPM moyen (revenu / 1000 vues)
  const rpmValue = kpis.totalViews > 0 ? (kpis.totalRevenue / kpis.totalViews) * 1000 : 0
  const rpmPrev = kpis.prevTotalViews > 0 ? (kpis.prevTotalRevenue / kpis.prevTotalViews) * 1000 : 0

  // Compute real DarkCard content from KPIs
  const rpm = kpis.totalViews > 0 ? (kpis.totalRevenue / kpis.totalViews) * 1000 : 0
  const darkCardTitle = `${formatCompact(kpis.totalViews)} vues ce mois`
  const darkCardSubtitle = `${formatEuros(kpis.totalRevenue)} de revenu AdSense sur 30 jours`
  const darkCardDetail = `RPM moyen : ${formatEuros(rpm)} — ${YOUTUBE_CONFIG.videoCount} vidéos publiées`

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
              label="RPM moyen"
              value={rpmValue}
              previousValue={rpmPrev}
              format="euros"
              sparklineData={[]}
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

      {/* Growth Sparkline widget */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <GrowthSparkline />
      </motion.div>

      {/* Dark Card — real data summary */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <DarkCard
          emoji="📊"
          title={darkCardTitle}
          subtitle={darkCardSubtitle}
          detail={darkCardDetail}
        />
      </motion.div>
    </motion.div>
  )
}
