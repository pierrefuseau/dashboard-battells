import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { radarData } from '../mockData'

export default function RadarComparison() {
  return (
    <div className="card p-6">
      <h2 className="font-[var(--font-clash)] text-xl font-bold text-text-primary mb-6">
        Performance comparative
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
          />
          <Radar
            name="YouTube"
            dataKey="youtube"
            stroke="#FF6B00"
            fill="#FF6B00"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          <Radar
            name="TikTok"
            dataKey="tiktok"
            stroke="#000000"
            fill="#000000"
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Radar
            name="Instagram"
            dataKey="instagram"
            stroke="#E1306C"
            fill="#E1306C"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{ fontSize: 13, fontFamily: 'var(--font-satoshi)' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
