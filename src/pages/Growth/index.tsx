import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGrowthData } from './hooks/useGrowthData'
import type { MetricKey } from './components/MetricToggle'
import MetricToggle from './components/MetricToggle'
import GrowthKPIs from './components/GrowthKPIs'
import GrowthChart from './components/GrowthChart'
import MomentsTimeline from './components/MomentsTimeline'

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

export default function Growth() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('views')
  const [zoomRange, setZoomRange] = useState<{ startIndex: number; endIndex: number } | null>(null)
  const { dailyStats, previousStats, annotations, loading, error } = useGrowthData()
  const chartRef = useRef<HTMLDivElement>(null)

  // Click on a moment → zoom chart to ±15 days around that date, scroll to chart
  const handleMomentClick = useCallback(
    (date: string) => {
      const idx = dailyStats.findIndex((s) => s.date === date)
      if (idx < 0) return
      const start = Math.max(0, idx - 15)
      const end = Math.min(dailyStats.length - 1, idx + 15)
      setZoomRange({ startIndex: start, endIndex: end })
      chartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    },
    [dailyStats],
  )

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative"
    >
      {/* Decorative blobs */}
      <div className="blob-decorator w-[400px] h-[400px] -top-32 -right-32" />
      <div className="blob-decorator w-[250px] h-[250px] top-[600px] -left-24" style={{ animationDelay: '4s' }} />

      {/* Header row: title + MetricToggle */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="title-display text-text-primary">
              CROISSANCE
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <div className="h-1 w-12 sm:w-16 bg-primary rounded-full" />
              <span className="text-xs sm:text-sm font-[var(--font-satoshi)] text-text-secondary">
                Ta trajectoire sur 365 jours
              </span>
            </div>
          </div>
          <MetricToggle active={activeMetric} onChange={setActiveMetric} />
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} aria-live="polite">
        <GrowthKPIs
          currentStats={dailyStats}
          previousStats={previousStats}
          loading={loading}
        />
      </motion.div>

      {/* Error card */}
      {error && (
        <motion.div variants={fadeUp} className="my-6">
          <div className="rounded-xl bg-surface border-l-4 border-l-error p-4">
            <p className="text-sm text-text-secondary font-[var(--font-satoshi)]">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Growth Chart */}
      <motion.div ref={chartRef} variants={fadeUp} className="my-6 sm:my-8">
        {loading ? (
          <div className="h-[400px] rounded-2xl bg-surface animate-pulse" />
        ) : (
          <GrowthChart
            dailyStats={dailyStats}
            annotations={annotations}
            activeMetric={activeMetric}
            externalBrushRange={zoomRange}
            onBrushChange={() => setZoomRange(null)}
          />
        )}
      </motion.div>

      {/* Moments Timeline */}
      <motion.div variants={fadeUp}>
        <MomentsTimeline
          annotations={annotations}
          onMomentClick={handleMomentClick}
        />
      </motion.div>
    </motion.div>
  )
}
