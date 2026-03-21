import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Youtube, ArrowUpDown, Loader2 } from 'lucide-react'
import DetailPanel from '@/components/ui/DetailPanel.tsx'
import { FORMAT_TAGS } from '@/lib/constants.ts'
import { formatCompact, formatEuros, formatDuration, formatDate } from '@/lib/formatters.ts'
import { supabase } from '@/lib/supabase.ts'
import type { VideoWithStats } from '@/types/database'
import FilterBar, { DEFAULT_FILTERS, type Filters } from './components/FilterBar.tsx'
import VideoDetail from './components/VideoDetail.tsx'

// ── Types ─────────────────────────────────────────────────────
type SortKey = 'totalViews' | 'ctr' | 'rpm' | 'totalRevenue' | 'published_at'
type SortDir = 'asc' | 'desc'

// ── Helper: period filter ─────────────────────────────────────
function filterByPeriod(video: VideoWithStats, period: string): boolean {
  if (!period) return true
  const now = new Date()
  const pub = new Date(video.published_at)
  const diffDays = Math.floor((now.getTime() - pub.getTime()) / (1000 * 60 * 60 * 24))

  switch (period) {
    case '7d': return diffDays <= 7
    case '30d': return diffDays <= 30
    case '90d': return diffDays <= 90
    case '1y': return diffDays <= 365
    default: return true
  }
}

// ── Column definition ─────────────────────────────────────────
interface Column {
  key: string
  label: string
  sortable: boolean
  sortKey?: SortKey
  className?: string
}

const COLUMNS: Column[] = [
  { key: 'thumbnail', label: '', sortable: false, className: 'w-16' },
  { key: 'title', label: 'Titre', sortable: false, className: 'min-w-[200px]' },
  { key: 'platform', label: 'Plateforme', sortable: false, className: 'w-24' },
  { key: 'format', label: 'Format', sortable: false, className: 'w-28' },
  { key: 'duration', label: 'Durée', sortable: false, className: 'w-20 text-right' },
  { key: 'views', label: 'Vues', sortable: true, sortKey: 'totalViews', className: 'w-24 text-right' },
  { key: 'ctr', label: 'CTR', sortable: true, sortKey: 'ctr', className: 'w-20 text-right' },
  { key: 'rpm', label: 'RPM', sortable: true, sortKey: 'rpm', className: 'w-20 text-right' },
  { key: 'revenue', label: 'Revenu', sortable: true, sortKey: 'totalRevenue', className: 'w-24 text-right' },
  { key: 'date', label: 'Date', sortable: true, sortKey: 'published_at', className: 'w-28 text-right' },
]

// ── Component ─────────────────────────────────────────────────
export default function Videos() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [sortKey, setSortKey] = useState<SortKey>('published_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selectedVideo, setSelectedVideo] = useState<VideoWithStats | null>(null)
  const [videos, setVideos] = useState<VideoWithStats[]>([])
  const [loading, setLoading] = useState(true)

  // ── Fetch real data from Supabase ─────────────────────────
  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      const { data, error } = await supabase
        .from('yt_videos')
        .select('*, yt_daily_stats(views, estimated_revenue, likes, comments, shares, avg_view_duration_seconds, impressions_ctr)')
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error fetching videos:', error)
        setLoading(false)
        return
      }

      const mapped: VideoWithStats[] = (data ?? []).map((v: any) => {
        const stats = v.yt_daily_stats?.[0]
        const totalViews = stats?.views ?? 0
        const totalRevenue = stats?.estimated_revenue ?? 0
        const totalLikes = stats?.likes ?? 0
        const comments = stats?.comments ?? 0
        const rpm = totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0
        const engagement = totalViews > 0 ? ((totalLikes + comments) / totalViews) * 100 : 0

        const ctr = stats?.impressions_ctr ? +(stats.impressions_ctr * 100).toFixed(2) : 0

        return {
          id: v.id,
          title: v.title,
          published_at: v.published_at,
          duration_seconds: v.duration_seconds,
          is_short: v.is_short,
          format_tag: v.format_tag,
          language: v.language,
          thumbnail_url: v.thumbnail_url,
          description: v.description,
          tags: v.tags ?? [],
          created_at: v.created_at ?? v.published_at,
          platform: 'youtube' as const,
          totalViews,
          totalLikes,
          totalRevenue,
          ctr,
          rpm: +rpm.toFixed(2),
          engagement: +engagement.toFixed(2),
          dailyStats: [],
        }
      })

      setVideos(mapped)
      setLoading(false)
    }

    fetchVideos()
  }, [])

  // ── Filter + sort ───────────────────────────────────────────
  const filteredVideos = useMemo(() => {
    let result = videos.filter((v) => {
      if (filters.platform && v.platform !== filters.platform) return false
      if (filters.format && v.format_tag !== filters.format) return false
      if (filters.type) {
        if (filters.type === 'short' && !v.is_short) return false
        if (filters.type === 'long' && v.is_short) return false
      }
      if (filters.language && v.language !== filters.language) return false
      if (!filterByPeriod(v, filters.period)) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        if (!v.title.toLowerCase().includes(q) && !v.tags.some((t) => t.includes(q))) {
          return false
        }
      }
      return true
    })

    result.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      if (sortKey === 'published_at') {
        aVal = a.published_at
        bVal = b.published_at
      } else {
        aVal = a[sortKey]
        bVal = b[sortKey]
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc'
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return result
  }, [videos, filters, sortKey, sortDir])

  // ── Sort handler ────────────────────────────────────────────
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  // ── Render helpers ──────────────────────────────────────────
  const renderFormatBadge = (tag: string | null) => {
    if (!tag) return null
    const fmt = FORMAT_TAGS[tag as keyof typeof FORMAT_TAGS]
    if (!fmt) return null
    return (
      <span
        className="badge text-white text-[10px]"
        style={{ backgroundColor: fmt.color }}
      >
        {fmt.label}
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="space-y-4">
        <h1 className="title-display text-text-primary">
          EXPLORATEUR VIDÉOS
        </h1>
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {/* ── Data Table ───────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-border">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider ${col.className ?? ''} ${col.sortable ? 'cursor-pointer select-none hover:text-text-primary transition-colors' : ''}`}
                    onClick={col.sortable && col.sortKey ? () => handleSort(col.sortKey!) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && col.sortKey && (
                        <ArrowUpDown
                          size={12}
                          className={
                            sortKey === col.sortKey
                              ? 'text-primary'
                              : 'text-text-tertiary/40'
                          }
                        />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-16">
                    <div className="flex flex-col items-center justify-center text-text-tertiary">
                      <Loader2 size={32} className="mb-3 animate-spin opacity-50" />
                      <p className="text-sm font-[var(--font-satoshi)]">Chargement des vidéos...</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredVideos.map((video, i) => (
                <motion.tr
                  key={video.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  onClick={() => setSelectedVideo(video)}
                  className={`border-b border-border-light cursor-pointer transition-colors hover:bg-primary-50/40 ${
                    selectedVideo?.id === video.id ? 'bg-primary-50/60' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    <div className="w-[60px] h-[34px] rounded bg-dark-secondary flex items-center justify-center relative overflow-hidden group">
                      {video.thumbnail_url ? (
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                          <Play size={12} className="text-white/50" />
                        </>
                      )}
                      
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                        <Play size={12} className="text-white" fill="currentColor" />
                      </div>

                      {video.is_short && (
                        <div className="absolute top-0.5 right-0.5 bg-primary text-white text-[6px] font-bold px-1 rounded-sm leading-tight z-30 shadow-sm">
                          S
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td className="px-4 py-3">
                    <span 
                      className="text-sm font-medium font-[var(--font-satoshi)] text-text-primary line-clamp-2"
                      title={video.title}
                    >
                      {video.title}
                    </span>
                  </td>

                  {/* Platform */}
                  <td className="px-4 py-3">
                    <a 
                      href={`https://youtube.com/watch?v=${video.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex hover:scale-110 transition-transform drop-shadow-sm"
                      title="Voir sur YouTube"
                    >
                      <Youtube size={16} className="text-error" />
                    </a>
                  </td>

                  {/* Format */}
                  <td className="px-4 py-3">
                    {renderFormatBadge(video.format_tag)}
                  </td>

                  {/* Duration */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-[var(--font-space-grotesk)] text-text-secondary">
                      {formatDuration(video.duration_seconds)}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold font-[var(--font-space-grotesk)] text-text-primary">
                      {formatCompact(video.totalViews)}
                    </span>
                  </td>

                  {/* CTR */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-[var(--font-space-grotesk)] text-text-secondary">
                      {video.ctr}%
                    </span>
                  </td>

                  {/* RPM */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-[var(--font-space-grotesk)] text-text-secondary">
                      {formatEuros(video.rpm)}
                    </span>
                  </td>

                  {/* Revenue */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold font-[var(--font-space-grotesk)] text-text-primary">
                      {formatEuros(video.totalRevenue)}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-[var(--font-satoshi)] text-text-secondary">
                      {formatDate(video.published_at)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {/* Empty state */}
          {!loading && filteredVideos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
              <Play size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-[var(--font-satoshi)]">Aucune vidéo trouvée</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between">
          <span className="text-xs font-[var(--font-satoshi)] text-text-tertiary">
            {filteredVideos.length} vidéo{filteredVideos.length !== 1 ? 's' : ''} sur {videos.length}
          </span>
        </div>
      </div>

      {/* ── Detail Panel ─────────────────────────────────────── */}
      <DetailPanel
        isOpen={selectedVideo !== null}
        onClose={() => setSelectedVideo(null)}
      >
        {selectedVideo && <VideoDetail video={selectedVideo} />}
      </DetailPanel>
    </motion.div>
  )
}
