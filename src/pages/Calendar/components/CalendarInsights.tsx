import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, AlertTriangle, Trophy, BarChart3 } from 'lucide-react'

interface VideoData {
  published_at: string
  is_short: boolean
  format_tag: string | null
  totalViews: number
  totalLikes: number
  totalRevenue: number
  engagement: number
  rpm: number
}

interface CalendarInsightsProps {
  videos: VideoData[]
}

interface Insight {
  icon: typeof Sparkles
  title: string
  body: string
  color: string
  priority: number
}

const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function CalendarInsights({ videos }: CalendarInsightsProps) {
  const insights = useMemo<Insight[]>(() => {
    if (videos.length < 10) return []

    const result: Insight[] = []

    // 1. Best day of the week
    const dayStats: Record<number, { views: number; count: number }> = {}
    for (let i = 0; i < 7; i++) dayStats[i] = { views: 0, count: 0 }

    videos.forEach((v) => {
      const day = new Date(v.published_at).getDay()
      dayStats[day].views += v.totalViews
      dayStats[day].count += 1
    })

    const bestDay = Object.entries(dayStats)
      .filter(([, s]) => s.count >= 3)
      .sort(([, a], [, b]) => (b.views / b.count) - (a.views / a.count))[0]

    if (bestDay) {
      const avgViews = Math.round(dayStats[+bestDay[0]].views / dayStats[+bestDay[0]].count)
      result.push({
        icon: TrendingUp,
        title: 'Meilleur jour',
        body: `${DAYS_FR[+bestDay[0]]} — ${(avgViews / 1000).toFixed(0)}K vues moy. (basé sur ${dayStats[+bestDay[0]].count} vidéos)`,
        color: 'var(--color-success)',
        priority: 1,
      })
    }

    // 2. Best performing format
    const formatStats: Record<string, { views: number; engagement: number; rpm: number; count: number }> = {}
    videos.forEach((v) => {
      const tag = v.format_tag || 'other'
      if (!formatStats[tag]) formatStats[tag] = { views: 0, engagement: 0, rpm: 0, count: 0 }
      formatStats[tag].views += v.totalViews
      formatStats[tag].engagement += v.engagement
      formatStats[tag].rpm += v.rpm
      formatStats[tag].count += 1
    })

    const bestFormat = Object.entries(formatStats)
      .filter(([, s]) => s.count >= 5)
      .sort(([, a], [, b]) => (b.engagement / b.count) - (a.engagement / a.count))[0]

    if (bestFormat) {
      const avgEng = (formatStats[bestFormat[0]].engagement / formatStats[bestFormat[0]].count).toFixed(1)
      result.push({
        icon: Trophy,
        title: 'Format star',
        body: `${bestFormat[0].charAt(0).toUpperCase() + bestFormat[0].slice(1)} — ${avgEng}% engagement moy. sur ${formatStats[bestFormat[0]].count} vidéos`,
        color: 'var(--color-secondary)',
        priority: 2,
      })
    }

    // 3. Best RPM format
    const bestRpm = Object.entries(formatStats)
      .filter(([, s]) => s.count >= 5)
      .sort(([, a], [, b]) => (b.rpm / b.count) - (a.rpm / a.count))[0]

    if (bestRpm && bestRpm[0] !== bestFormat?.[0]) {
      const avgRpm = (formatStats[bestRpm[0]].rpm / formatStats[bestRpm[0]].count).toFixed(2)
      result.push({
        icon: BarChart3,
        title: 'Meilleur RPM',
        body: `${bestRpm[0].charAt(0).toUpperCase() + bestRpm[0].slice(1)} — €${avgRpm} RPM moy.`,
        color: 'var(--color-info)',
        priority: 3,
      })
    }

    // 4. Content balance alert
    const last20 = [...videos].sort((a, b) => b.published_at.localeCompare(a.published_at)).slice(0, 20)
    const shortsCount = last20.filter((v) => v.is_short).length
    const longsCount = last20.length - shortsCount

    if (shortsCount >= 15) {
      result.push({
        icon: AlertTriangle,
        title: 'Déséquilibre Shorts',
        body: `${shortsCount} Shorts sur tes 20 dernières vidéos. Planifie une vidéo longue pour diversifier.`,
        color: 'var(--color-warning)',
        priority: 1,
      })
    } else if (longsCount >= 15) {
      result.push({
        icon: AlertTriangle,
        title: 'Peu de Shorts',
        body: `${longsCount} vidéos longues sur 20 dernières. Les Shorts boostent la découvrabilité.`,
        color: 'var(--color-warning)',
        priority: 1,
      })
    }

    // 5. Shorts vs Long performance comparison
    const shorts = videos.filter((v) => v.is_short)
    const longs = videos.filter((v) => !v.is_short)
    if (shorts.length >= 10 && longs.length >= 10) {
      const avgViewsShorts = shorts.reduce((s, v) => s + v.totalViews, 0) / shorts.length
      const avgViewsLongs = longs.reduce((s, v) => s + v.totalViews, 0) / longs.length
      const winner = avgViewsShorts > avgViewsLongs ? 'Shorts' : 'Longs'
      const ratio = (Math.max(avgViewsShorts, avgViewsLongs) / Math.min(avgViewsShorts, avgViewsLongs)).toFixed(1)
      result.push({
        icon: Sparkles,
        title: 'Shorts vs Longs',
        body: `Les ${winner} font ${ratio}x plus de vues en moyenne. (${(avgViewsShorts / 1000).toFixed(0)}K vs ${(avgViewsLongs / 1000).toFixed(0)}K)`,
        color: 'var(--color-primary)',
        priority: 4,
      })
    }

    return result.sort((a, b) => a.priority - b.priority)
  }, [videos])

  if (insights.length === 0) {
    return (
      <div className="card p-5 flex flex-col items-center justify-center text-center min-h-[200px]">
        <Sparkles size={24} className="text-text-tertiary mb-2 opacity-40" />
        <p className="text-sm text-text-tertiary font-[var(--font-satoshi)]">
          Pas assez de données pour générer des suggestions.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="card p-5 space-y-4"
      variants={fadeUp}
    >
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-primary" />
        <h3 className="text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary uppercase">
          Suggestions IA
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-3 p-3 rounded-[var(--radius-input)] transition-colors hover:bg-page cursor-default"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <div
              className="w-8 h-8 rounded-[var(--radius-input)] flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${insight.color} 12%, transparent)` }}
            >
              <insight.icon size={15} style={{ color: insight.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold font-[var(--font-satoshi)] text-text-primary">
                {insight.title}
              </p>
              <p className="text-[11px] font-[var(--font-satoshi)] text-text-secondary leading-relaxed mt-0.5">
                {insight.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
