import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Sponsor } from '@/types/database'
import { formatEuros } from '@/lib/formatters'

interface PipelineStage {
  key: Sponsor['status']
  label: string
  bgClass: string
  textClass: string
  borderClass: string
}

const stages: PipelineStage[] = [
  { key: 'lead', label: 'Prospect', bgClass: 'bg-border-light', textClass: 'text-text-secondary', borderClass: 'border-border' },
  { key: 'contacted', label: 'Contacté', bgClass: 'bg-info-50', textClass: 'text-info', borderClass: 'border-info/30' },
  { key: 'negotiating', label: 'En négo', bgClass: 'bg-warning-50', textClass: 'text-warning', borderClass: 'border-warning/30' },
  { key: 'signed', label: 'Confirmé', bgClass: 'bg-success-50', textClass: 'text-success-dark', borderClass: 'border-success/30' },
  { key: 'delivered', label: 'Livré', bgClass: 'bg-[#F3E8FF]', textClass: 'text-[#7C3AED]', borderClass: 'border-[#7C3AED]/30' },
  { key: 'paid', label: 'Payé', bgClass: 'bg-success-50', textClass: 'text-success-dark', borderClass: 'border-success-dark/30' },
]

interface PipelineProps {
  sponsors: Sponsor[]
}

export default function Pipeline({ sponsors }: PipelineProps) {
  const stageData = stages.map((stage) => {
    const items = sponsors.filter((s) => s.status === stage.key)
    const total = items.reduce((sum, s) => sum + (s.amount ?? 0), 0)
    return { ...stage, count: items.length, total }
  })

  return (
    <div className="card p-6">
      <h3 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary mb-4">
        Pipeline Sponsors
      </h3>
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {stageData.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-2 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex-shrink-0 rounded-[var(--radius-card)] border ${stage.borderClass} ${stage.bgClass} p-4 min-w-[140px]`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider ${stage.textClass} mb-2`}>
                {stage.label}
              </p>
              <p className="text-2xl font-[var(--font-space-grotesk)] font-bold text-text-primary">
                {stage.count}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {formatEuros(stage.total)}
              </p>
            </motion.div>
            {i < stageData.length - 1 && (
              <ChevronRight size={18} className="text-text-tertiary flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
