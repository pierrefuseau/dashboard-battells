import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  Label,
  ReferenceLine,
} from 'recharts'
import { type QuadrantVideo } from './mockData'
import { formatCompact, formatEuros } from '@/lib/formatters'
import { supabase } from '@/lib/supabase'

const FORMAT_COLORS: Record<string, string> = {
  challenge: '#FF6B00',
  reaction: '#E53935',
  vlog: '#2196F3',
  tuto: '#43A047',
  short: '#EC4899',
  other: '#6B7280',
}

const FORMAT_LABELS: Record<string, string> = {
  challenge: 'Challenge',
  reaction: 'Réaction',
  vlog: 'Vlog',
  tuto: 'Tutoriel',
  short: 'Short',
  other: 'Autre',
}

interface DotPayload {
  title: string
  views: number
  revenue: number
  format: string
  engagement: number
  dotSize: number
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DotPayload }> }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-surface border border-border rounded-[var(--radius-tooltip)] px-4 py-3 shadow-[var(--shadow-tooltip)]">
      <p className="font-[var(--font-satoshi)] font-bold text-sm text-text-primary mb-1">{data.title}</p>
      <p className="text-xs text-text-secondary">Vues : {formatCompact(data.views)}</p>
      <p className="text-xs text-text-secondary">Revenu : {formatEuros(data.revenue)}</p>
      <p className="text-xs text-text-secondary">
        Format : <span style={{ color: FORMAT_COLORS[data.format] }}>{FORMAT_LABELS[data.format]}</span>
      </p>
      <p className="text-xs text-text-secondary">Engagement : {data.engagement}%</p>
    </div>
  )
}

function renderLegend() {
  return (
    <div className="flex items-center justify-center gap-5 mt-2">
      {Object.entries(FORMAT_LABELS).map(([key, label]) => (
        <div key={key} className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: FORMAT_COLORS[key] }} />
          <span className="text-xs font-[var(--font-satoshi)] text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  )
}

function determineFormat(isShort: boolean, durationSeconds: number | null): string {
  if (isShort) return 'short'
  if (durationSeconds == null) return 'other'
  if (durationSeconds <= 600) return 'challenge'
  return 'vlog'
}

export default function Quadrant() {
  const [videos, setVideos] = useState<QuadrantVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      const { data, error } = await supabase
        .from('yt_videos')
        .select('id, title, is_short, duration_seconds, yt_daily_stats(views, estimated_revenue, likes)')
        .order('published_at', { ascending: false })

      if (error) {
        console.error('Error fetching quadrant data:', error)
        setLoading(false)
        return
      }

      const transformed: QuadrantVideo[] = (data ?? [])
        .map((v: any) => {
          const stats = v.yt_daily_stats?.[0]
          const views = stats?.views ?? 0
          const revenue = stats?.estimated_revenue ?? 0
          const likes = stats?.likes ?? 0
          const engagement = views > 0 ? Math.round((likes / views) * 100 * 100) / 100 : 0
          return {
            id: v.id,
            title: v.title ?? 'Sans titre',
            views,
            revenue,
            format: determineFormat(v.is_short ?? false, v.duration_seconds),
            engagement,
          }
        })
        .filter((v: QuadrantVideo) => v.views > 50_000)

      setVideos(transformed)
      setLoading(false)
    }
    fetchVideos()
  }, [])

  const { chartData, medianViews, medianRevenue } = useMemo(() => {
    const data = videos.map((v) => ({
      ...v,
      dotSize: Math.max(40, v.engagement * 12),
    }))
    const sortedViews = [...videos].sort((a, b) => a.views - b.views)
    const sortedRevenue = [...videos].sort((a, b) => a.revenue - b.revenue)
    const mid = Math.floor(videos.length / 2)
    return {
      chartData: data,
      medianViews: sortedViews[mid]?.views ?? 0,
      medianRevenue: sortedRevenue[mid]?.revenue ?? 0,
    }
  }, [videos])

  // Group data by format for legend
  const groupedByFormat = useMemo(() => {
    const groups: Record<string, (QuadrantVideo & { dotSize: number })[]> = {}
    for (const d of chartData) {
      if (!groups[d.format]) groups[d.format] = []
      groups[d.format].push(d)
    }
    return groups
  }, [chartData])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
    >
      <h1 className="title-display text-text-primary mb-6 sm:mb-8">
        QUADRANT DE CONTENU
      </h1>

      {loading ? (
        <div className="card p-6 flex items-center justify-center" style={{ height: 'clamp(320px, 50vw, 560px)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-text-secondary/30 border-t-text-primary rounded-full animate-spin" />
            <span className="text-sm text-text-secondary font-[var(--font-satoshi)]">Chargement des vidéos...</span>
          </div>
        </div>
      ) : videos.length === 0 ? (
        <div className="card p-6 flex items-center justify-center" style={{ height: 'clamp(320px, 50vw, 560px)' }}>
          <span className="text-sm text-text-secondary font-[var(--font-satoshi)]">Aucune vidéo avec plus de 50K vues trouvée.</span>
        </div>
      ) : (
      <motion.div
        className="card p-3 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' as const }}
      >
        <div className="relative w-full" style={{ height: 'clamp(320px, 50vw, 560px)' }}>
          {/* Quadrant labels — hidden on small screens */}
          <div className="absolute inset-0 pointer-events-none z-10 hidden sm:flex">
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-start justify-start pl-16 pt-12">
                <span className="text-sm lg:text-lg font-[var(--font-satoshi)] text-text-tertiary/40 select-none">
                  Pépites cachées
                </span>
              </div>
              <div className="flex-1 flex items-end justify-start pl-16 pb-16">
                <span className="text-sm lg:text-lg font-[var(--font-satoshi)] text-text-tertiary/40 select-none">
                  Sous-performeurs
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-start justify-end pr-8 pt-12">
                <span className="text-sm lg:text-lg font-[var(--font-satoshi)] text-text-tertiary/40 select-none">
                  Étoiles
                </span>
              </div>
              <div className="flex-1 flex items-end justify-end pr-8 pb-16">
                <span className="text-sm lg:text-lg font-[var(--font-satoshi)] text-text-tertiary/40 select-none">
                  Faiseurs de reach
                </span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
              <XAxis
                type="number"
                dataKey="views"
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => formatCompact(v)}
                tick={{ fontSize: 12, fontFamily: 'var(--font-space-grotesk)', fill: 'var(--color-text-secondary)' }}
                stroke="var(--color-border)"
              >
                <Label
                  value="Vues"
                  position="insideBottomRight"
                  offset={-5}
                  style={{ fontSize: 13, fontFamily: 'var(--font-satoshi)', fill: 'var(--color-text-secondary)' }}
                />
              </XAxis>
              <YAxis
                type="number"
                dataKey="revenue"
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => `${v}€`}
                tick={{ fontSize: 12, fontFamily: 'var(--font-space-grotesk)', fill: 'var(--color-text-secondary)' }}
                stroke="var(--color-border)"
              >
                <Label
                  value="Revenu (€)"
                  position="insideTopLeft"
                  offset={10}
                  style={{ fontSize: 13, fontFamily: 'var(--font-satoshi)', fill: 'var(--color-text-secondary)' }}
                />
              </YAxis>
              <ReferenceLine x={medianViews} stroke="var(--color-border)" strokeDasharray="6 4" />
              <ReferenceLine y={medianRevenue} stroke="var(--color-border)" strokeDasharray="6 4" />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend content={renderLegend} />
              {Object.entries(groupedByFormat).map(([format, data]) => (
                <Scatter
                  key={format}
                  name={FORMAT_LABELS[format]}
                  data={data}
                  fill={FORMAT_COLORS[format]}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={`cell-${format}-${idx}`}
                      fill={FORMAT_COLORS[format]}
                      fillOpacity={0.75}
                      r={Math.max(5, entry.engagement * 1.2)}
                    />
                  ))}
                </Scatter>
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      )}
    </motion.div>
  )
}
