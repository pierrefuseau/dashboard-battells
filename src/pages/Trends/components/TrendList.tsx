import { TrendingUp, Video, BarChart3 } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import Badge from '@/components/ui/Badge'
import type { Trend } from '../mockData'

const sourceConfig: Record<Trend['source'], { icon: typeof TrendingUp; color: string; bg: string }> = {
  google: { icon: TrendingUp, color: '#43A047', bg: '#E8F5E9' },
  tiktok: { icon: Video, color: '#E53935', bg: '#FFEBEE' },
  youtube: { icon: BarChart3, color: '#E53935', bg: '#FFEBEE' },
}

interface TrendListProps {
  trends: Trend[]
}

export default function TrendList({ trends }: TrendListProps) {
  return (
    <div className="card p-6 h-full">
      <h2 className="text-lg font-bold font-[var(--font-clash)] text-text-primary mb-5">
        Tendances du moment
      </h2>
      <div className="flex flex-col">
        {trends.map((trend, i) => {
          const config = sourceConfig[trend.source]
          const Icon = config.icon
          const sparkData = trend.sparkline.map((v) => ({ v }))

          return (
            <div
              key={trend.id}
              className={`flex items-center gap-4 py-3 px-3 rounded-[var(--radius-input)] ${
                i % 2 === 0 ? 'bg-page' : ''
              }`}
            >
              {/* Source icon */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: config.bg }}
              >
                <Icon size={16} style={{ color: config.color }} />
              </div>

              {/* Name */}
              <span className="flex-1 font-[var(--font-satoshi)] font-medium text-sm text-text-primary truncate">
                {trend.name}
              </span>

              {/* Sparkline */}
              <div className="w-[60px] h-[20px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparkData}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={config.color}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Status badge */}
              {trend.status === 'opportunity' ? (
                <Badge variant="warning">Opportunite</Badge>
              ) : (
                <Badge variant="success">Couvert</Badge>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
