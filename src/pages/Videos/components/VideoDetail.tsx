import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Play, Youtube } from 'lucide-react'
import { FORMAT_TAGS } from '@/lib/constants.ts'
import { formatCompact, formatEuros, formatDate, formatDuration } from '@/lib/formatters.ts'
import type { MockVideo } from '../mockData.ts'

interface VideoDetailProps {
  video: MockVideo
}

// ── Metric mini-card ──────────────────────────────────────────
function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 flex flex-col gap-1">
      <span className="text-xs font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xl font-bold font-[var(--font-space-grotesk)] text-text-primary">
        {value}
      </span>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────
export default function VideoDetail({ video }: VideoDetailProps) {
  const formatTag = video.format_tag
    ? FORMAT_TAGS[video.format_tag as keyof typeof FORMAT_TAGS]
    : null

  // Chart data: daily views
  const chartData = video.dailyStats.map((s) => ({
    date: new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    vues: s.views,
  }))

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Thumbnail placeholder */}
      <motion.div
        variants={fadeUp}
        className="w-full aspect-video rounded-[var(--radius-card)] bg-dark flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-dark" />
        <Play size={48} className="text-white/60 relative z-10" />
        {video.is_short && (
          <div className="absolute top-3 right-3 z-10 bg-primary text-white text-[10px] font-bold font-[var(--font-satoshi)] px-2 py-0.5 rounded-full">
            SHORT
          </div>
        )}
        <div className="absolute bottom-3 right-3 z-10 bg-black/70 text-white text-xs font-[var(--font-space-grotesk)] px-2 py-0.5 rounded">
          {formatDuration(video.duration_seconds)}
        </div>
      </motion.div>

      {/* Title + meta */}
      <motion.div variants={fadeUp} className="space-y-3">
        <h2 className="font-[var(--font-clash)] text-xl font-bold text-text-primary leading-tight">
          {video.title}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform badge */}
          <span className="badge bg-error-50 text-error-dark">
            <Youtube size={12} className="mr-1" />
            YouTube
          </span>

          {/* Format badge */}
          {formatTag && (
            <span
              className="badge text-white"
              style={{ backgroundColor: formatTag.color }}
            >
              {formatTag.label}
            </span>
          )}

          {/* Language */}
          <span className="badge bg-border-light text-text-secondary">
            {video.language === 'fr' ? 'Francais' : 'English'}
          </span>

          {/* Type */}
          <span className="badge bg-border-light text-text-secondary">
            {video.is_short ? 'Short' : 'Long-form'}
          </span>
        </div>

        <p className="text-sm text-text-secondary font-[var(--font-satoshi)]">
          Publiee le {formatDate(video.published_at)}
        </p>
      </motion.div>

      {/* Daily views chart */}
      <motion.div variants={fadeUp} className="card p-4 space-y-3">
        <h3 className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">
          Vues par jour
        </h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => formatCompact(v)}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-tooltip)',
                  fontSize: 12,
                  fontFamily: 'var(--font-space-grotesk)',
                }}
                formatter={(value) => [formatCompact(Number(value ?? 0)), 'Vues']}
              />
              <Line
                type="monotone"
                dataKey="vues"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--color-primary)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Metrics grid */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3">
        <MetricCard label="Vues" value={formatCompact(video.totalViews)} />
        <MetricCard label="Likes" value={formatCompact(video.totalLikes)} />
        <MetricCard label="CTR" value={`${video.ctr}%`} />
        <MetricCard label="RPM" value={formatEuros(video.rpm)} />
        <MetricCard label="Revenu" value={formatEuros(video.totalRevenue)} />
        <MetricCard label="Engagement" value={`${video.engagement}%`} />
      </motion.div>

      {/* Tags */}
      {video.tags.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-1.5">
          {video.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-[var(--font-satoshi)] text-text-tertiary bg-border-light px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
