import { useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import TimePeriodToggle from '@/components/ui/TimePeriodToggle'
import { useChannelStats } from '@/hooks'
import { formatNumber, formatEuros } from '@/lib/formatters'

const PERIODS = ['7j', '30j']

interface TooltipPayloadItem {
  value: number
  dataKey: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface rounded-[var(--radius-tooltip)] shadow-[var(--shadow-tooltip)] px-4 py-3 border border-border-light">
      <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mb-1">{label}</p>
      <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">
        {formatNumber(payload[0].value)} vues
      </p>
      {payload[1] && (
        <p className="text-xs font-[var(--font-satoshi)] text-text-secondary">
          {formatEuros(payload[1].value)}
        </p>
      )}
    </div>
  )
}

export default function ViewsTrendChart() {
  const [period, setPeriod] = useState('30j')
  const { stats, loading } = useChannelStats({ days: 30 })

  const chartData = useMemo(() => {
    return stats.map(s => ({
      date: s.date,
      dateLabel: new Date(s.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      views: s.views,
      revenue: s.estimated_revenue,
    }))
  }, [stats])

  const data = period === '7j' ? chartData.slice(-7) : chartData

  return (
    <div className="card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary">
          Tendance des vues
        </h2>
        <TimePeriodToggle periods={PERIODS} activePeriod={period} onChange={setPeriod} />
      </div>

      <div className="flex-1 min-h-[280px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-text-secondary font-[var(--font-satoshi)]">
            Chargement...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-tertiary font-[var(--font-satoshi)]">
            Aucune donnée disponible
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B00" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF6B00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="var(--color-border-light)"
              vertical={false}
            />
            <XAxis
              dataKey="dateLabel"
              tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-satoshi)' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontFamily: 'var(--font-satoshi)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="#FF6B00"
              strokeWidth={2}
              fill="url(#viewsGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="transparent"
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
