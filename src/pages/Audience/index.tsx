import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { formatCompact, formatEuros } from '@/lib/formatters'

// ── Données réelles YouTube Analytics API (12 mois : mars 2025 – mars 2026) ──

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France', BE: 'Belgique', CA: 'Canada', CI: "Côte d'Ivoire",
  DZ: 'Algérie', MA: 'Maroc', RE: 'La Réunion', SN: 'Sénégal',
  CH: 'Suisse', GA: 'Gabon', CD: 'RD Congo', MG: 'Madagascar',
  CG: 'Congo', GP: 'Guadeloupe', MQ: 'Martinique', TG: 'Togo',
  BF: 'Burkina Faso', TN: 'Tunisie', HT: 'Haïti', CM: 'Cameroun',
}

const geoData = [
  { country: 'FR', views: 94_674_551, revenue: 7313.42, watchMinutes: 53_008_166 },
  { country: 'BE', views: 6_586_853, revenue: 524.82, watchMinutes: 3_821_919 },
  { country: 'CA', views: 5_492_085, revenue: 760.69, watchMinutes: 3_399_748 },
  { country: 'CI', views: 2_588_703, revenue: 0, watchMinutes: 1_685_417 },
  { country: 'DZ', views: 2_462_210, revenue: 7.46, watchMinutes: 1_380_669 },
  { country: 'MA', views: 2_223_113, revenue: 22.08, watchMinutes: 1_306_020 },
  { country: 'RE', views: 2_143_751, revenue: 37.91, watchMinutes: 1_290_363 },
  { country: 'SN', views: 2_020_876, revenue: 15.54, watchMinutes: 1_322_328 },
  { country: 'CH', views: 1_921_987, revenue: 301.90, watchMinutes: 1_073_179 },
  { country: 'GA', views: 1_416_948, revenue: 0, watchMinutes: 979_293 },
  { country: 'CD', views: 1_106_974, revenue: 0, watchMinutes: 698_253 },
  { country: 'MG', views: 795_166, revenue: 0, watchMinutes: 486_737 },
  { country: 'CG', views: 786_026, revenue: 0, watchMinutes: 541_338 },
  { country: 'GP', views: 642_396, revenue: 21.52, watchMinutes: 401_171 },
  { country: 'MQ', views: 635_008, revenue: 21.08, watchMinutes: 396_312 },
  { country: 'TG', views: 627_199, revenue: 0, watchMinutes: 411_390 },
  { country: 'BF', views: 622_242, revenue: 0, watchMinutes: 414_364 },
  { country: 'TN', views: 529_446, revenue: 2.10, watchMinutes: 296_180 },
  { country: 'HT', views: 512_050, revenue: 0, watchMinutes: 337_602 },
  { country: 'CM', views: 496_559, revenue: 0, watchMinutes: 336_770 },
]

const totalGeoViews = geoData.reduce((s, d) => s + d.views, 0)

const deviceData = [
  { name: 'Mobile', views: 75_034_325, minutes: 38_687_538, color: '#FF6B00' },
  { name: 'TV', views: 30_778_487, minutes: 22_594_095, color: '#FFB800' },
  { name: 'Tablette', views: 17_991_902, minutes: 9_740_500, color: '#3B82F6' },
  { name: 'Ordinateur', views: 10_359_604, minutes: 6_143_359, color: '#10B981' },
]

const totalDeviceViews = deviceData.reduce((s, d) => s + d.views, 0)

const playbackData = [
  { name: 'Feed Shorts', views: 132_861_892, color: '#FF6B00' },
  { name: 'Page de lecture', views: 1_253_363, color: '#3B82F6' },
  { name: 'Navigation', views: 94_632, color: '#10B981' },
  { name: 'Intégration externe', views: 17_734, color: '#8B5CF6' },
]

const totalPlaybackViews = playbackData.reduce((s, d) => s + d.views, 0)

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

interface PieTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}

function PieTooltipContent({ active, payload }: PieTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-surface rounded-[var(--radius-tooltip)] shadow-[var(--shadow-tooltip)] px-4 py-2 border border-border-light">
      <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">{d.name}</p>
      <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(d.value)} vues</p>
    </div>
  )
}

export default function Audience() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="title-display text-text-primary">AUDIENCE</h1>
        <div className="flex items-center gap-3 mt-1">
          <div className="h-1 w-12 sm:w-16 bg-primary rounded-full" />
          <span className="text-xs sm:text-sm font-[var(--font-satoshi)] text-text-secondary">
            Données réelles — 12 derniers mois
          </span>
        </div>
      </motion.div>

      {/* Row 1: Devices + Playback locations */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Devices */}
        <div className="card p-6">
          <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-4">
            Appareils
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="views"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="var(--color-page)"
                  >
                    {deviceData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-2 w-full">
              {deviceData.map((d) => {
                const pct = ((d.views / totalDeviceViews) * 100).toFixed(1)
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm font-[var(--font-satoshi)] text-text-secondary flex-1">{d.name}</span>
                    <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">{pct}%</span>
                    <span className="text-xs font-[var(--font-space-grotesk)] text-text-tertiary tabular-nums w-16 text-right">{formatCompact(d.views)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Playback locations */}
        <div className="card p-6">
          <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-4">
            Lieux de lecture
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={playbackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="views"
                    nameKey="name"
                    strokeWidth={2}
                    stroke="var(--color-page)"
                  >
                    {playbackData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col gap-2 w-full">
              {playbackData.map((d) => {
                const pct = ((d.views / totalPlaybackViews) * 100).toFixed(1)
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="text-sm font-[var(--font-satoshi)] text-text-secondary flex-1">{d.name}</span>
                    <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-text-primary tabular-nums">{pct}%</span>
                    <span className="text-xs font-[var(--font-space-grotesk)] text-text-tertiary tabular-nums w-16 text-right">{formatCompact(d.views)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Row 2: Geography bar chart */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-1">
          Géographie
        </h2>
        <p className="text-xs font-[var(--font-satoshi)] text-text-tertiary mb-4">
          Top 20 pays — {formatCompact(totalGeoViews)} vues totales
        </p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={geoData.map(d => ({
                name: COUNTRY_NAMES[d.country] || d.country,
                vues: d.views,
                revenu: d.revenue,
                rpm: d.views > 0 ? +((d.revenue / d.views) * 1000).toFixed(3) : 0,
              }))}
              layout="vertical"
              margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="var(--color-border-light)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-satoshi)' }}
                tickFormatter={(v: number) => formatCompact(v)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontFamily: 'var(--font-satoshi)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload as { name: string; vues: number; revenu: number; rpm: number }
                  return (
                    <div className="bg-surface rounded-[var(--radius-tooltip)] shadow-[var(--shadow-tooltip)] px-4 py-3 border border-border-light">
                      <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">{d.name}</p>
                      <p className="text-xs font-[var(--font-space-grotesk)] text-text-secondary">{formatCompact(d.vues)} vues</p>
                      <p className="text-xs font-[var(--font-space-grotesk)] text-primary">{formatEuros(d.revenu)} &middot; RPM {formatEuros(d.rpm)}</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="vues" fill="#FF6B00" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3: Revenue by country table */}
      <motion.div variants={fadeUp} className="card overflow-hidden">
        <div className="px-6 pt-5 pb-3">
          <h2 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary">
            Revenu par pays
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">Pays</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">Vues</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">% total</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">Revenu</th>
                <th className="px-4 py-3 text-right text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">RPM</th>
                <th className="px-6 py-3 text-right text-xs font-semibold font-[var(--font-satoshi)] text-text-tertiary uppercase tracking-wider">Watch time</th>
              </tr>
            </thead>
            <tbody>
              {geoData.map((d) => {
                const pct = ((d.views / totalGeoViews) * 100).toFixed(1)
                const rpm = d.views > 0 ? (d.revenue / d.views) * 1000 : 0
                const hours = Math.round(d.watchMinutes / 60)
                return (
                  <tr key={d.country} className="border-b border-border-light hover:bg-primary-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className="text-sm font-medium font-[var(--font-satoshi)] text-text-primary">
                        {COUNTRY_NAMES[d.country] || d.country}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-[var(--font-space-grotesk)] text-text-primary tabular-nums">{formatCompact(d.views)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-[var(--font-space-grotesk)] text-text-secondary tabular-nums">{pct}%</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold font-[var(--font-space-grotesk)] text-primary tabular-nums">{formatEuros(d.revenue)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-[var(--font-space-grotesk)] text-text-secondary tabular-nums">{formatEuros(rpm)}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="text-sm font-[var(--font-space-grotesk)] text-text-tertiary tabular-nums">{formatCompact(hours)}h</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
