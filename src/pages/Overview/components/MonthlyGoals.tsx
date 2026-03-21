import { monthlyGoals } from '../mockData'
import { formatCompact } from '@/lib/formatters'

interface GaugeChartProps {
  label: string
  current: number
  target: number
  color: string
}

function GaugeChart({ label, current, target, color }: GaugeChartProps) {
  const ratio = Math.min(current / target, 1)
  const angle = ratio * 180
  const r = 44
  const cx = 50
  const cy = 50

  // Arc path helper (semicircle from left to right)
  function describeArc(startAngle: number, endAngle: number) {
    const startRad = ((180 - startAngle) * Math.PI) / 180
    const endRad = ((180 - endAngle) * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy - r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy - r * Math.sin(endRad)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`
  }

  const formatted = current >= 10000
    ? formatCompact(current)
    : current.toString()
  const targetFormatted = target >= 10000
    ? formatCompact(target)
    : target.toString()

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 10 100 50" className="w-full max-w-[120px]">
        {/* Background arc */}
        <path
          d={describeArc(0, 180)}
          fill="none"
          stroke="var(--color-border-light)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        {angle > 0 && (
          <path
            d={describeArc(0, angle)}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
          />
        )}
        {/* Value text */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-text-primary"
          style={{ fontSize: '11px', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700 }}
        >
          {formatted}
        </text>
        <text
          x={cx}
          y={cx + 6}
          textAnchor="middle"
          className="fill-text-tertiary"
          style={{ fontSize: '7px', fontFamily: 'var(--font-satoshi)' }}
        >
          / {targetFormatted}
        </text>
      </svg>
      <span className="text-xs font-medium font-[var(--font-satoshi)] text-text-secondary mt-1">
        {label}
      </span>
    </div>
  )
}

export default function MonthlyGoals() {
  return (
    <div className="card p-6 h-full">
      <h2 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary mb-6">
        Objectifs du mois
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {monthlyGoals.map((goal) => (
          <GaugeChart
            key={goal.label}
            label={goal.label}
            current={goal.current}
            target={goal.target}
            color={goal.color}
          />
        ))}
      </div>
    </div>
  )
}
