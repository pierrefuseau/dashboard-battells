import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { YtChannelDaily, YtVideo } from '@/types/database'

// ── Types ───────────────────────────────────────────────────────────

export type AnnotationType =
  | 'views_spike'
  | 'revenue_spike'
  | 'subscriber_milestone'
  | 'long_form_publish'

export interface GrowthAnnotation {
  date: string
  type: AnnotationType
  title: string
  value: number
  secondaryValue?: number
  videoId?: string
  thumbnailUrl?: string
}

interface UseGrowthDataReturn {
  dailyStats: YtChannelDaily[]
  previousStats: YtChannelDaily[]
  annotations: GrowthAnnotation[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// ── Helpers ─────────────────────────────────────────────────────────

function rollingAverage(data: number[], index: number, window: number): number {
  const start = Math.max(0, index - window)
  const slice = data.slice(start, index)
  if (slice.length === 0) return 0
  return slice.reduce((a, b) => a + b, 0) / slice.length
}

function computeAnnotations(
  allStats: YtChannelDaily[],
  currentStats: YtChannelDaily[],
  videos: YtVideo[],
): GrowthAnnotation[] {
  const annotations: GrowthAnnotation[] = []

  // We need the full 730-day array for rolling averages that span before the 365 cutoff
  const allViews = allStats.map((s) => s.views)
  const allRevenue = allStats.map((s) => s.estimated_revenue)

  // Offset: where currentStats starts inside allStats
  const offset = allStats.length - currentStats.length

  // ── Views spikes: views > 2x rolling 7-day average ──
  currentStats.forEach((day, i) => {
    const globalIdx = offset + i
    const avg = rollingAverage(allViews, globalIdx, 7)
    if (avg > 0 && day.views > 2 * avg) {
      annotations.push({
        date: day.date,
        type: 'views_spike',
        title: `Pic de vues : ${day.views.toLocaleString('fr-FR')}`,
        value: day.views,
        secondaryValue: Math.round(avg),
      })
    }
  })

  // ── Revenue spikes: revenue > 3x rolling 7-day average ──
  currentStats.forEach((day, i) => {
    const globalIdx = offset + i
    const avg = rollingAverage(allRevenue, globalIdx, 7)
    if (avg > 0 && day.estimated_revenue > 3 * avg) {
      annotations.push({
        date: day.date,
        type: 'revenue_spike',
        title: `Pic de revenus : ${day.estimated_revenue.toFixed(0)} €`,
        value: day.estimated_revenue,
        secondaryValue: Math.round(avg),
      })
    }
  })

  // ── Subscriber milestones: crossing 50K thresholds ──
  for (let i = 1; i < currentStats.length; i++) {
    const prev = currentStats[i - 1].subscribers
    const curr = currentStats[i].subscribers
    // Find every 50K threshold crossed between prev and curr
    const prevBucket = Math.floor(prev / 50_000)
    const currBucket = Math.floor(curr / 50_000)
    if (currBucket > prevBucket) {
      const milestone = currBucket * 50_000
      annotations.push({
        date: currentStats[i].date,
        type: 'subscriber_milestone',
        title: `${(milestone / 1_000).toFixed(0)}K abonnes atteints`,
        value: milestone,
        secondaryValue: curr,
      })
    }
  }

  // ── Long-form publishes ──
  videos.forEach((v) => {
    const pubDate = v.published_at.split('T')[0]
    annotations.push({
      date: pubDate,
      type: 'long_form_publish',
      title: v.title,
      value: v.duration_seconds,
      videoId: v.id,
      thumbnailUrl: v.thumbnail_url ?? undefined,
    })
  })

  // ── Dedupe: same day + same type → keep first ──
  const seen = new Set<string>()
  const deduped: GrowthAnnotation[] = []
  for (const a of annotations) {
    const key = `${a.date}|${a.type}`
    if (!seen.has(key)) {
      seen.add(key)
      deduped.push(a)
    }
  }

  return deduped.sort((a, b) => a.date.localeCompare(b.date))
}

// ── Hook ────────────────────────────────────────────────────────────

export function useGrowthData(): UseGrowthDataReturn {
  const [allStats, setAllStats] = useState<YtChannelDaily[]>([])
  const [videos, setVideos] = useState<YtVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetchData = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    // 730 days for rolling average context, 365 days for video filter
    const since730 = new Date()
    since730.setDate(since730.getDate() - 730)
    const since365 = new Date()
    since365.setDate(since365.getDate() - 365)

    const [channelRes, videoRes] = await Promise.all([
      supabase
        .from('yt_channel_daily')
        .select('*')
        .gte('date', since730.toISOString().split('T')[0])
        .order('date', { ascending: true }),
      supabase
        .from('yt_videos')
        .select('*')
        .eq('is_short', false)
        .gte('published_at', since365.toISOString().split('T')[0])
        .order('published_at', { ascending: true }),
    ])

    if (id !== fetchId.current) return

    if (channelRes.error) {
      setError(channelRes.error.message)
      setLoading(false)
      return
    }
    if (videoRes.error) {
      setError(videoRes.error.message)
      setLoading(false)
      return
    }

    setAllStats((channelRes.data as YtChannelDaily[]) ?? [])
    setVideos((videoRes.data as YtVideo[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Current 365-day window and previous 365-730 day window
  const { dailyStats, previousStats } = useMemo(() => {
    const now = new Date()
    const cutoff365 = new Date(now)
    cutoff365.setDate(cutoff365.getDate() - 365)
    const cutoff730 = new Date(now)
    cutoff730.setDate(cutoff730.getDate() - 730)
    const cutoffStr365 = cutoff365.toISOString().split('T')[0]
    const cutoffStr730 = cutoff730.toISOString().split('T')[0]

    const current: YtChannelDaily[] = []
    const previous: YtChannelDaily[] = []

    for (const s of allStats) {
      if (s.date >= cutoffStr365) current.push(s)
      else if (s.date >= cutoffStr730) previous.push(s)
    }

    return { dailyStats: current, previousStats: previous }
  }, [allStats])

  const annotations = useMemo(
    () => computeAnnotations(allStats, dailyStats, videos),
    [allStats, dailyStats, videos],
  )

  return { dailyStats, previousStats, annotations, loading, error, refetch: fetchData }
}
