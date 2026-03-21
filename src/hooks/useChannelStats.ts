import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { YtChannelDaily } from '@/types/database'

interface ChannelKPIs {
  totalViews: number
  totalRevenue: number
  latestSubscribers: number
  avgCTR: number
  // Previous period for delta calculation
  prevTotalViews: number
  prevTotalRevenue: number
  prevLatestSubscribers: number
  prevAvgCTR: number
  // Sparkline data (current period only)
  viewsSparkline: number[]
  revenueSparkline: number[]
  subscribersSparkline: number[]
  ctrSparkline: number[]
}

interface UseChannelStatsReturn {
  stats: YtChannelDaily[]
  kpis: ChannelKPIs
  loading: boolean
  error: string | null
  refetch: () => void
}

const emptyKPIs: ChannelKPIs = {
  totalViews: 0,
  totalRevenue: 0,
  latestSubscribers: 0,
  avgCTR: 0,
  prevTotalViews: 0,
  prevTotalRevenue: 0,
  prevLatestSubscribers: 0,
  prevAvgCTR: 0,
  viewsSparkline: [],
  revenueSparkline: [],
  subscribersSparkline: [],
  ctrSparkline: [],
}

export function useChannelStats({ days = 30 }: { days?: number } = {}): UseChannelStatsReturn {
  const [allStats, setAllStats] = useState<YtChannelDaily[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    // Fetch 2x the period to compute previous period deltas
    const since = new Date()
    since.setDate(since.getDate() - days * 2)

    const { data, error: err } = await supabase
      .from('yt_channel_daily')
      .select('*')
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setAllStats((data as YtChannelDaily[]) ?? [])
    setLoading(false)
  }, [days])

  useEffect(() => {
    fetch()
  }, [fetch])

  const currentStats = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = cutoff.toISOString().split('T')[0]
    return allStats.filter((s) => s.date >= cutoffStr)
  }, [allStats, days])

  const prevStats = useMemo(() => {
    const cutoffCurrent = new Date()
    cutoffCurrent.setDate(cutoffCurrent.getDate() - days)
    const cutoffPrev = new Date()
    cutoffPrev.setDate(cutoffPrev.getDate() - days * 2)
    const currentStr = cutoffCurrent.toISOString().split('T')[0]
    const prevStr = cutoffPrev.toISOString().split('T')[0]
    return allStats.filter((s) => s.date >= prevStr && s.date < currentStr)
  }, [allStats, days])

  const kpis = useMemo<ChannelKPIs>(() => {
    if (currentStats.length === 0) return emptyKPIs

    const totalViews = currentStats.reduce((s, r) => s + r.views, 0)
    const totalRevenue = currentStats.reduce((s, r) => s + r.estimated_revenue, 0)
    const latestSubscribers = currentStats[currentStats.length - 1]?.subscribers ?? 0
    const avgCTR = currentStats.reduce((s, r) => s + r.avg_ctr, 0) / currentStats.length

    const prevTotalViews = prevStats.reduce((s, r) => s + r.views, 0)
    const prevTotalRevenue = prevStats.reduce((s, r) => s + r.estimated_revenue, 0)
    const prevLatestSubscribers = prevStats.length > 0 ? prevStats[prevStats.length - 1].subscribers : 0
    const prevAvgCTR = prevStats.length > 0 ? prevStats.reduce((s, r) => s + r.avg_ctr, 0) / prevStats.length : 0

    return {
      totalViews,
      totalRevenue,
      latestSubscribers,
      avgCTR,
      prevTotalViews,
      prevTotalRevenue,
      prevLatestSubscribers,
      prevAvgCTR,
      viewsSparkline: currentStats.map((s) => s.views),
      revenueSparkline: currentStats.map((s) => s.estimated_revenue),
      subscribersSparkline: currentStats.map((s) => s.subscribers),
      ctrSparkline: currentStats.map((s) => s.avg_ctr),
    }
  }, [currentStats, prevStats])

  return { stats: currentStats, kpis, loading, error, refetch: fetch }
}
