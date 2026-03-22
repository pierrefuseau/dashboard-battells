import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import { ArrowRight } from 'lucide-react'
import { useGrowthData } from '@/pages/Growth/hooks/useGrowthData'

export default function GrowthSparkline() {
  const { dailyStats, loading } = useGrowthData()
  const navigate = useNavigate()

  // Downsample 365 points → ~60
  const sparkData = useMemo(() => {
    if (dailyStats.length === 0) return []
    const n = Math.max(1, Math.floor(dailyStats.length / 60))
    return dailyStats
      .filter((_, i) => i % n === 0)
      .map((d) => ({ views: d.views }))
  }, [dailyStats])

  // Delta: sum views second half vs first half
  const delta = useMemo(() => {
    if (dailyStats.length < 2) return 0
    const mid = Math.floor(dailyStats.length / 2)
    const firstHalf = dailyStats.slice(0, mid).reduce((s, d) => s + d.views, 0)
    const secondHalf = dailyStats.slice(mid).reduce((s, d) => s + d.views, 0)
    if (firstHalf === 0) return 0
    return ((secondHalf - firstHalf) / firstHalf) * 100
  }, [dailyStats])

  const isPositive = delta >= 0

  if (loading) {
    return <div className="card p-5 h-[120px] skeleton rounded-xl" />
  }

  return (
    <button
      type="button"
      onClick={() => navigate('/croissance')}
      className="card p-5 w-full text-left cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary">
          CROISSANCE 365J
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-primary">
          Voir <ArrowRight size={12} />
        </span>
      </div>

      {/* Sparkline area chart */}
      <div className="h-[48px] w-full mb-3">
        {sparkData.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#FF6B00"
                strokeWidth={1.5}
                fill="url(#growthGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Delta badge */}
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive ? 'text-success bg-success-50' : 'text-error bg-error-50'
          }`}
        >
          {isPositive ? '\u25B2' : '\u25BC'} {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-[11px] text-text-tertiary">vs 1er semestre</span>
      </div>
    </button>
  )
}
