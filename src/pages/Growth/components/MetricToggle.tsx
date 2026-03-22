import { motion } from 'framer-motion'

export type MetricKey = 'views' | 'revenue' | 'subscribers' | 'watchTime'

interface MetricConfig {
  key: MetricKey
  label: string
  color: string
}

export const METRICS: MetricConfig[] = [
  { key: 'views', label: 'Vues', color: '#FF6B00' },
  { key: 'revenue', label: 'Revenus', color: '#10B981' },
  { key: 'subscribers', label: 'Abonnés', color: '#8B5CF6' },
  { key: 'watchTime', label: 'Watch Time', color: '#3B82F6' },
]

interface MetricToggleProps {
  active: MetricKey
  onChange: (key: MetricKey) => void
}

export default function MetricToggle({ active, onChange }: MetricToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Metric selector"
      className="inline-flex items-center gap-1 rounded-[var(--radius-button)] bg-border-light p-1"
    >
      {METRICS.map((metric) => {
        const isActive = metric.key === active
        return (
          <button
            key={metric.key}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(metric.key)}
            className="relative px-3 py-2.5 rounded-[var(--radius-button)] text-xs font-medium font-[var(--font-satoshi)] cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors duration-200"
            style={{ color: isActive ? metric.color : undefined }}
          >
            {isActive && (
              <motion.span
                layoutId="metric-pill"
                className="absolute inset-0 rounded-[var(--radius-button)]"
                style={{ backgroundColor: `${metric.color}20` }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{metric.label}</span>
          </button>
        )
      })}
    </div>
  )
}
