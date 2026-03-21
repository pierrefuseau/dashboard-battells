import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { YtDailyStat } from '@/types/database'

interface UseVideoStatsParams {
  videoId: string
  days?: number
}

interface VideoStatsTotals {
  totalViews: number
  totalRevenue: number
  totalLikes: number
  totalComments: number
  totalShares: number
  avgCTR: number
  avgViewDuration: number
}

interface UseVideoStatsReturn {
  stats: YtDailyStat[]
  totals: VideoStatsTotals
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVideoStats({ videoId, days = 30 }: UseVideoStatsParams): UseVideoStatsReturn {
  const [stats, setStats] = useState<YtDailyStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    if (!videoId) {
      setStats([])
      setLoading(false)
      return
    }

    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    const since = new Date()
    since.setDate(since.getDate() - days)

    const { data, error: err } = await supabase
      .from('yt_daily_stats')
      .select('*')
      .eq('video_id', videoId)
      .gte('date', since.toISOString().split('T')[0])
      .order('date', { ascending: true })

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setStats((data as YtDailyStat[]) ?? [])
    setLoading(false)
  }, [videoId, days])

  useEffect(() => {
    fetch()
  }, [fetch])

  const totals = useMemo<VideoStatsTotals>(() => {
    if (stats.length === 0) {
      return { totalViews: 0, totalRevenue: 0, totalLikes: 0, totalComments: 0, totalShares: 0, avgCTR: 0, avgViewDuration: 0 }
    }

    const totalViews = stats.reduce((s, r) => s + r.views, 0)
    const totalRevenue = stats.reduce((s, r) => s + r.estimated_revenue, 0)
    const totalLikes = stats.reduce((s, r) => s + r.likes, 0)
    const totalComments = stats.reduce((s, r) => s + r.comments, 0)
    const totalShares = stats.reduce((s, r) => s + r.shares, 0)
    const avgCTR = stats.reduce((s, r) => s + r.impressions_ctr, 0) / stats.length
    const avgViewDuration = stats.reduce((s, r) => s + r.avg_view_duration_seconds, 0) / stats.length

    return { totalViews, totalRevenue, totalLikes, totalComments, totalShares, avgCTR, avgViewDuration }
  }, [stats])

  return { stats, totals, loading, error, refetch: fetch }
}
