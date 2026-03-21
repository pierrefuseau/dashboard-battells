import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, Ratio, Clock, CalendarClock } from 'lucide-react'
import type { ContentCalendarItem } from '@/types/database'

interface CalendarKPIsProps {
  items: ContentCalendarItem[]
  publishedVideos: { published_at: string }[]
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function CalendarKPIs({ items, publishedVideos }: CalendarKPIsProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Publication frequency (last 30 days from real published videos)
    const recentVideos = publishedVideos.filter(
      (v) => new Date(v.published_at) >= thirtyDaysAgo
    )
    const frequency = recentVideos.length > 0
      ? +(recentVideos.length / 4.3).toFixed(1) // videos per week
      : 0

    // Shorts vs Long ratio (last 30 days from calendar items marked published OR from video data)
    const recentShorts = publishedVideos.filter(
      (v: any) => new Date(v.published_at) >= thirtyDaysAgo && v.is_short
    )
    const recentLongs = publishedVideos.filter(
      (v: any) => new Date(v.published_at) >= thirtyDaysAgo && !v.is_short
    )
    const ratioLabel = recentLongs.length > 0
      ? `${recentShorts.length}:${recentLongs.length}`
      : `${recentShorts.length}:0`

    // Days without publication streak
    const sortedDates = publishedVideos
      .map((v) => v.published_at.split('T')[0])
      .sort((a, b) => b.localeCompare(a))
    const today = now.toISOString().split('T')[0]
    const lastPubDate = sortedDates[0] || today
    const daysSince = Math.floor(
      (now.getTime() - new Date(lastPubDate).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Next planned content
    const todayStr = today
    const upcoming = items
      .filter((i) => i.planned_date && i.planned_date >= todayStr && i.status !== 'cancelled' && i.status !== 'published')
      .sort((a, b) => (a.planned_date ?? '').localeCompare(b.planned_date ?? ''))
    const nextItem = upcoming[0]
    let nextLabel = 'Aucun'
    let nextSub = 'Rien de planifié'
    if (nextItem?.planned_date) {
      const daysUntil = Math.ceil(
        (new Date(nextItem.planned_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      nextLabel = daysUntil <= 0 ? "Aujourd'hui" : `Dans ${daysUntil}j`
      nextSub = nextItem.title.length > 24 ? nextItem.title.slice(0, 22) + '...' : nextItem.title
    }

    return { frequency, ratioLabel, daysSince, nextLabel, nextSub }
  }, [items, publishedVideos])

  const kpis = [
    {
      icon: Activity,
      label: 'Fréquence',
      value: `${stats.frequency}/sem`,
      sub: '30 derniers jours',
      color: 'var(--color-primary)',
    },
    {
      icon: Ratio,
      label: 'Shorts / Longs',
      value: stats.ratioLabel,
      sub: '30 derniers jours',
      color: 'var(--color-info)',
    },
    {
      icon: Clock,
      label: 'Depuis dernière pub',
      value: `${stats.daysSince}j`,
      sub: stats.daysSince > 3 ? 'Attention au rythme' : 'Bon rythme',
      color: stats.daysSince > 3 ? 'var(--color-warning)' : 'var(--color-success)',
    },
    {
      icon: CalendarClock,
      label: 'Prochain contenu',
      value: stats.nextLabel,
      sub: stats.nextSub,
      color: 'var(--color-secondary)',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={fadeUp}
          className="card p-4 flex items-start gap-3 group cursor-default"
        >
          <div
            className="w-10 h-10 rounded-[var(--radius-button)] flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: `${kpi.color}12` }}
          >
            <kpi.icon size={18} style={{ color: kpi.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-[var(--font-bebas)] tracking-[0.1em] text-text-tertiary uppercase">
              {kpi.label}
            </p>
            <p className="text-xl font-bold font-[var(--font-space-grotesk)] text-text-primary leading-tight">
              {kpi.value}
            </p>
            <p className="text-[11px] font-[var(--font-satoshi)] text-text-tertiary truncate">
              {kpi.sub}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
