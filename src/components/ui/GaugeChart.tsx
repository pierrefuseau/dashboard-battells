import { motion } from 'framer-motion'
import { formatCompact } from '@/lib/formatters'

interface GaugeChartProps {
  value: number
  max: number
  label: string
  color?: string
  size?: number
}

export default function GaugeChart({
  value,
  max,
  label,
  color = 'var(--color-primary)',
  size = 140,
}: GaugeChartProps) {
  const ratio = Math.min(value / max, 1)
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = Math.PI * radius // half-circle
  const offset = circumference * (1 - ratio)

  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size / 2 + strokeWidth} viewBox={`0 0 ${size} ${size / 2 + strokeWidth}`}>
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke="var(--color-border-light)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        {/* Center text */}
        <text
          x={center}
          y={size / 2 - 4}
          textAnchor="middle"
          className="font-[var(--font-space-grotesk)] text-xs fill-text-primary font-bold"
          fontSize={14}
        >
          {formatCompact(value)} / {formatCompact(max)}
        </text>
      </svg>
      <span className="text-xs text-text-secondary font-[var(--font-satoshi)] font-medium">
        {label}
      </span>
    </div>
  )
}
