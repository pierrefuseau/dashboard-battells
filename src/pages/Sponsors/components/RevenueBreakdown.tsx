import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { RevenueMonth } from '../mockData'
import { formatEuros } from '@/lib/formatters'

interface RevenueBreakdownProps {
  data: RevenueMonth[]
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="card p-3 shadow-[var(--shadow-tooltip)] border border-border">
      <p className="font-[var(--font-satoshi)] font-semibold text-sm text-text-primary mb-2">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-[var(--font-space-grotesk)] font-semibold">
            {formatEuros(entry.value)}
          </span>
        </div>
      ))}
      <div className="border-t border-border-light mt-2 pt-2 flex justify-between text-xs font-semibold">
        <span>Total</span>
        <span className="font-[var(--font-space-grotesk)]">
          {formatEuros(payload.reduce((s, e) => s + e.value, 0))}
        </span>
      </div>
    </div>
  )
}

export default function RevenueBreakdown({ data }: RevenueBreakdownProps) {
  return (
    <div className="card p-6">
      <h3 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-6">
        Répartition des revenus
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: '#6B7280', fontFamily: 'var(--font-satoshi)' }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'var(--font-space-grotesk)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}€`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, fontFamily: 'var(--font-satoshi)', paddingTop: 16 }}
          />
          <Bar dataKey="adsense" name="AdSense" stackId="rev" fill="#FF6B00" radius={[0, 0, 0, 0]} />
          <Bar dataKey="sponsors" name="Sponsors" stackId="rev" fill="#FFB800" radius={[0, 0, 0, 0]} />
          <Bar dataKey="affiliation" name="Affiliation" stackId="rev" fill="#6B7280" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
