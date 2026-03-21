import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCompact } from '@/lib/formatters'

// ── Données réelles YouTube Analytics API (12 mois : mars 2025 – mars 2026) ──

const TRAFFIC_LABELS: Record<string, string> = {
  SHORTS: 'Feed Shorts',
  YT_CHANNEL: 'Page chaîne',
  SUBSCRIBER: 'Flux abonnés',
  YT_SEARCH: 'Recherche YouTube',
  YT_OTHER_PAGE: 'Autres pages YT',
  RELATED_VIDEO: 'Vidéos suggérées',
  SHORTS_CONTENT_LINKS: 'Liens contenu Shorts',
  NOTIFICATION: 'Notifications',
  PLAYLIST: 'Playlists',
  EXT_URL: 'URL externes',
  NO_LINK_OTHER: 'Autres (sans lien)',
  HASHTAGS: 'Hashtags',
  SOUND_PAGE: 'Page son',
  END_SCREEN: 'Écrans de fin',
  IMMERSIVE_LIVE: 'Live immersif',
  VIDEO_REMIXES: 'Remix vidéos',
}

const TRAFFIC_COLORS = [
  '#FF6B00', '#FFB800', '#3B82F6', '#10B981', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#EF4444',
  '#14B8A6', '#6366F1', '#F59E0B', '#D946EF', '#0EA5E9', '#64748B',
]

const trafficData = [
  { source: 'SHORTS', views: 98_276_980, minutes: 56_833_475 },
  { source: 'YT_CHANNEL', views: 19_131_694, minutes: 9_111_259 },
  { source: 'SUBSCRIBER', views: 8_109_975, minutes: 5_889_075 },
  { source: 'YT_SEARCH', views: 6_519_267, minutes: 3_817_147 },
  { source: 'YT_OTHER_PAGE', views: 1_316_966, minutes: 739_689 },
  { source: 'RELATED_VIDEO', views: 324_673, minutes: 303_571 },
  { source: 'SHORTS_CONTENT_LINKS', views: 227_309, minutes: 280_619 },
  { source: 'NOTIFICATION', views: 115_476, minutes: 80_491 },
  { source: 'PLAYLIST', views: 94_185, minutes: 56_110 },
  { source: 'EXT_URL', views: 40_645, minutes: 29_413 },
  { source: 'NO_LINK_OTHER', views: 37_478, minutes: 49_280 },
  { source: 'HASHTAGS', views: 17_730, minutes: 7_788 },
  { source: 'SOUND_PAGE', views: 14_513, minutes: 7_089 },
  { source: 'END_SCREEN', views: 546, minutes: 1_239 },
  { source: 'IMMERSIVE_LIVE', views: 155, minutes: 52 },
  { source: 'VIDEO_REMIXES', views: 30, minutes: 16 },
]

const totalViews = trafficData.reduce((s, d) => s + d.views, 0)

// Sharing data
const sharingData = [
  { service: 'WhatsApp', shares: 17_477 },
  { service: 'Autre', shares: 6_860 },
  { service: 'SMS', shares: 6_648 },
  { service: 'Copier-coller', shares: 4_772 },
  { service: 'Messenger', shares: 3_170 },
  { service: 'Partage système', shares: 2_482 },
  { service: 'Snapchat Camera', shares: 1_233 },
  { service: 'Snapchat', shares: 995 },
  { service: 'Samsung Messages', shares: 706 },
  { service: 'Gmail', shares: 514 },
]

const totalShares = sharingData.reduce((s, d) => s + d.shares, 0)

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export default function Traffic() {
  // Top 5 for pie chart
  const top5 = trafficData.slice(0, 5)
  const othersViews = trafficData.slice(5).reduce((s, d) => s + d.views, 0)
  const pieData = [
    ...top5.map((d, i) => ({ name: TRAFFIC_LABELS[d.source], value: d.views, color: TRAFFIC_COLORS[i] })),
    { name: 'Autres', value: othersViews, color: '#94A3B8' },
  ]

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="title-display text-text-primary">SOURCES DE TRAFIC</h1>
        <div className="flex items-center gap-3 mt-1">
          <div className="h-1 w-12 sm:w-16 bg-primary rounded-full" />
          <span className="text-xs sm:text-sm font-[var(--font-satoshi)] text-text-secondary">
            {formatCompact(totalViews)} vues — 12 derniers mois
          </span>
        </div>
      </motion.div>

      {/* KPI cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card p-4">
          <p className="text-xs font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider mb-1">Feed Shorts</p>
          <p className="text-xl font-bold font-[var(--font-space-grotesk)] text-primary tabular-nums">73.2%</p>
          <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(98_276_980)} vues</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider mb-1">Page chaîne</p>
          <p className="text-xl font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">14.3%</p>
          <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(19_131_694)} vues</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider mb-1">Flux abonnés</p>
          <p className="text-xl font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">6.0%</p>
          <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(8_109_975)} vues</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider mb-1">Recherche</p>
          <p className="text-xl font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">4.9%</p>
          <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(6_519_267)} vues</p>
        </div>
      </motion.div>

      {/* Pie chart + Full breakdown */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Pie */}
        <div className="card p-6 lg:col-span-5">
          <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-4">Répartition</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  strokeWidth={2}
                  stroke="var(--color-page)"
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]
                    return (
                      <div className="bg-surface rounded-[var(--radius-tooltip)] shadow-[var(--shadow-tooltip)] px-4 py-2 border border-border-light">
                        <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">{d.name}</p>
                        <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">
                          {formatCompact(d.value as number)} vues ({((d.value as number) / totalViews * 100).toFixed(1)}%)
                        </p>
                      </div>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] font-[var(--font-satoshi)] text-text-secondary">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Full breakdown bar chart */}
        <div className="card p-6 lg:col-span-7">
          <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-4">Détail par source</h2>
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trafficData.map((d, i) => ({
                  name: TRAFFIC_LABELS[d.source] || d.source,
                  vues: d.views,
                  minutes: d.minutes,
                  color: TRAFFIC_COLORS[i],
                }))}
                layout="vertical"
                margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border-light)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-satoshi)' }}
                  tickFormatter={(v: number) => formatCompact(v)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontFamily: 'var(--font-satoshi)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as { name: string; vues: number; minutes: number }
                    const pct = ((d.vues / totalViews) * 100).toFixed(1)
                    const hours = Math.round(d.minutes / 60)
                    return (
                      <div className="bg-surface rounded-[var(--radius-tooltip)] shadow-[var(--shadow-tooltip)] px-4 py-3 border border-border-light">
                        <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">{d.name}</p>
                        <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(d.vues)} vues ({pct}%)</p>
                        <p className="text-xs font-[var(--font-space-grotesk)] text-text-tertiary">{formatCompact(hours)}h de visionnage</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="vues" fill="#FF6B00" radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Sharing services */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-1">Services de partage</h2>
        <p className="text-xs font-[var(--font-satoshi)] text-text-tertiary mb-4">
          {formatCompact(totalShares)} partages totaux — 12 derniers mois
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {sharingData.map((d, i) => {
            const pct = ((d.shares / totalShares) * 100).toFixed(1)
            return (
              <div key={d.service} className="flex flex-col gap-1 p-3 rounded-[var(--radius-card)] bg-surface border border-border-light">
                <span className="text-xs font-[var(--font-satoshi)] text-text-tertiary">{d.service}</span>
                <span className="text-lg font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">
                  {formatCompact(d.shares)}
                </span>
                <div className="h-1.5 rounded-full bg-border-light overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(d.shares / sharingData[0].shares) * 100}%`,
                      backgroundColor: TRAFFIC_COLORS[i % TRAFFIC_COLORS.length],
                    }}
                  />
                </div>
                <span className="text-[10px] font-[var(--font-space-grotesk)] text-text-tertiary">{pct}%</span>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
