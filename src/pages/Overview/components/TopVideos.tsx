import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCompact, formatEuros } from '@/lib/formatters'

interface TopVideoRow {
  video_id: string
  total_views: number
  total_revenue: number
  title: string
  thumbnail_url: string | null
}

export default function TopVideos() {
  const [videos, setVideos] = useState<TopVideoRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopVideos() {
      setLoading(true)

      // Get the date 30 days ago
      const since = new Date()
      since.setDate(since.getDate() - 30)
      const sinceStr = since.toISOString().split('T')[0]

      // Aggregate yt_daily_stats by video_id for the last 30 days
      // Supabase JS doesn't support GROUP BY, so we fetch and aggregate client-side
      const { data: statsData, error: statsErr } = await supabase
        .from('yt_daily_stats')
        .select('video_id, views, estimated_revenue')
        .gte('date', sinceStr)

      if (statsErr || !statsData || statsData.length === 0) {
        setLoading(false)
        return
      }

      // Aggregate by video_id
      const agg = new Map<string, { views: number; revenue: number }>()
      for (const row of statsData) {
        const existing = agg.get(row.video_id)
        if (existing) {
          existing.views += row.views
          existing.revenue += row.estimated_revenue
        } else {
          agg.set(row.video_id, { views: row.views, revenue: row.estimated_revenue })
        }
      }

      // Sort by views descending, take top 5
      const top5Ids = [...agg.entries()]
        .sort((a, b) => b[1].views - a[1].views)
        .slice(0, 5)

      // Fetch video metadata
      const videoIds = top5Ids.map(([id]) => id)
      const { data: videosData } = await supabase
        .from('yt_videos')
        .select('id, title, thumbnail_url')
        .in('id', videoIds)

      const videoMap = new Map((videosData ?? []).map(v => [v.id, v]))

      const result: TopVideoRow[] = top5Ids.map(([id, stats]) => {
        const video = videoMap.get(id)
        return {
          video_id: id,
          total_views: stats.views,
          total_revenue: stats.revenue,
          title: video?.title ?? id,
          thumbnail_url: video?.thumbnail_url ?? null,
        }
      })

      setVideos(result)
      setLoading(false)
    }

    fetchTopVideos()
  }, [])

  const displayVideos = videos.map(v => ({ id: v.video_id, title: v.title, views: v.total_views, revenue: v.total_revenue, thumbnail: v.thumbnail_url }))

  return (
    <div className="card p-6 h-full flex flex-col">
      <h2 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary mb-4 shrink-0">
        Top Vidéos
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-32 text-text-secondary font-[var(--font-satoshi)]">
          Chargement...
        </div>
      ) : (
        <div className="flex flex-col gap-3 flex-1 justify-between">
          {displayVideos.map((video, i) => (
            <div
              key={video.id}
              className="flex items-center gap-3 group cursor-pointer"
            >
              {/* Rank */}
              <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-text-tertiary w-4 shrink-0">
                {i + 1}
              </span>

              {/* Thumbnail */}
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-[60px] h-[34px] rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-[60px] h-[34px] rounded-lg bg-border-light shrink-0 flex items-center justify-center">
                  <span className="text-[10px] text-text-tertiary">&#9654;</span>
                </div>
              )}

              {/* Title + metric */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-[var(--font-satoshi)] text-text-primary truncate group-hover:text-primary transition-colors">
                  {video.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-medium font-[var(--font-space-grotesk)] text-text-secondary">
                    {formatCompact(video.views)} vues
                  </span>
                  <span className="text-xs text-text-tertiary">&middot;</span>
                  <span className="text-xs font-medium font-[var(--font-space-grotesk)] text-primary">
                    {formatEuros(video.revenue)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
