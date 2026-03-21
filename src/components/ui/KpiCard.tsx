import { useSpring, animated } from '@react-spring/web'
import { motion } from 'framer-motion'
import Sparkline from '@/components/ui/Sparkline'
import { formatNumber, formatCompact, formatEuros, formatPercent, formatDuration } from '@/lib/formatters'

type FormatType = 'number' | 'compact' | 'euros' | 'percent' | 'duration'

interface KpiCardProps {
  label: string
  value: number
  previousValue: number
  format: FormatType
  sparklineData?: number[]
  loading?: boolean
}

function formatValue(value: number, format: FormatType): string {
  switch (format) {
    case 'number': return formatNumber(value)
    case 'compact': return formatCompact(value)
    case 'euros': return formatEuros(value)
    case 'percent': return formatPercent(value)
    case 'duration': return formatDuration(value)
  }
}

function AnimatedValue({ value, format }: { value: number; format: FormatType }) {
  const spring = useSpring({
    from: { val: 0 },
    to: { val: value },
    config: { tension: 80, friction: 20 },
  })

  return (
    <animated.span className="text-[36px] font-bold font-[var(--font-space-grotesk)] text-text-primary leading-none">
      {spring.val.to((v) => formatValue(Math.round(v), format))}
    </animated.span>
  )
}

export default function KpiCard({ label, value, previousValue, format, sparklineData, loading = false }: KpiCardProps) {
  if (loading) {
    return (
      <div className="card p-5">
        <div className="skeleton h-3 w-20 mb-3 rounded" />
        <div className="skeleton h-8 w-28 mb-2 rounded" />
        <div className="skeleton h-3 w-16 rounded" />
      </div>
    )
  }

  const delta = previousValue !== 0 ? ((value - previousValue) / Math.abs(previousValue)) * 100 : 0
  const isPositive = delta >= 0

  return (
    <motion.div
      className="card p-5 flex flex-col gap-2 transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {/* Label — Bebas Neue for section labels */}
      <span className="text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary">
        {label.toUpperCase()}
      </span>

      <div className="flex items-end justify-between gap-2">
        <AnimatedValue value={value} format={format} />
        {sparklineData && sparklineData.length > 1 && (
          <Sparkline data={sparklineData} color={isPositive ? 'var(--color-success)' : 'var(--color-error)'} />
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'text-success bg-success-50'
              : 'text-error bg-error-50'
          }`}
        >
          {isPositive ? '\u25B2' : '\u25BC'} {Math.abs(delta).toFixed(1)}%
        </span>
        <span className="text-[11px] text-text-tertiary">vs préc.</span>
      </div>
    </motion.div>
  )
}
