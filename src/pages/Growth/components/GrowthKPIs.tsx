import { useMemo } from 'react'
import KpiCard from '@/components/ui/KpiCard'
import type { YtChannelDaily } from '@/types/database'

interface GrowthKPIsProps {
  currentStats: YtChannelDaily[]
  previousStats: YtChannelDaily[]
  loading: boolean
}

function sum(arr: YtChannelDaily[], key: 'views' | 'estimated_revenue' | 'watch_time_minutes'): number {
  return arr.reduce((acc, row) => acc + (row[key] ?? 0), 0)
}

function last(arr: YtChannelDaily[], key: keyof YtChannelDaily): number {
  if (arr.length === 0) return 0
  return (arr[arr.length - 1][key] as number) ?? 0
}

function trailing30(arr: YtChannelDaily[], key: keyof YtChannelDaily): number[] {
  return arr.slice(-30).map((row) => (row[key] as number) ?? 0)
}

export default function GrowthKPIs({ currentStats, previousStats, loading }: GrowthKPIsProps) {
  const kpis = useMemo(() => {
    const totalViews = sum(currentStats, 'views')
    const prevViews = sum(previousStats, 'views')

    const totalRevenue = sum(currentStats, 'estimated_revenue')
    const prevRevenue = sum(previousStats, 'estimated_revenue')

    const currentSubs = last(currentStats, 'subscribers')
    const prevSubs = last(previousStats, 'subscribers')

    const totalWatchMinutes = sum(currentStats, 'watch_time_minutes')
    const prevWatchMinutes = sum(previousStats, 'watch_time_minutes')

    const viewsSparkline = trailing30(currentStats, 'views')
    const revenueSparkline = trailing30(currentStats, 'estimated_revenue')
    const subsSparkline = trailing30(currentStats, 'subscribers')
    const watchSparkline = trailing30(currentStats, 'watch_time_minutes').map((m) => m / 60)

    return {
      totalViews,
      prevViews,
      totalRevenue,
      prevRevenue,
      currentSubs,
      prevSubs,
      totalWatchHours: totalWatchMinutes / 60,
      prevWatchHours: prevWatchMinutes / 60,
      viewsSparkline,
      revenueSparkline,
      subsSparkline,
      watchSparkline,
    }
  }, [currentStats, previousStats])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-3 w-20 mb-3 rounded" />
            <div className="skeleton h-8 w-28 mb-2 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <KpiCard
        label="Vues 365j"
        value={kpis.totalViews}
        previousValue={kpis.prevViews}
        format="compact"
        sparklineData={kpis.viewsSparkline}
      />
      <KpiCard
        label="Revenus 365j"
        value={kpis.totalRevenue}
        previousValue={kpis.prevRevenue}
        format="euros"
        sparklineData={kpis.revenueSparkline}
      />
      <KpiCard
        label="Abonnés"
        value={kpis.currentSubs}
        previousValue={kpis.prevSubs}
        format="compact"
        sparklineData={kpis.subsSparkline}
      />
      <KpiCard
        label="Watch Time"
        value={kpis.totalWatchHours}
        previousValue={kpis.prevWatchHours}
        format="compact"
        sparklineData={kpis.watchSparkline}
      />
    </div>
  )
}
