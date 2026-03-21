import { motion } from 'framer-motion'
import {
  Lightbulb, ClipboardList, PenLine, Film, Scissors, CalendarCheck, Rocket,
} from 'lucide-react'
import type { ContentCalendarItem } from '@/types/database'

interface StatusPipelineProps {
  items: ContentCalendarItem[]
}

const PIPELINE: { status: ContentCalendarItem['status']; label: string; color: string; icon: typeof Lightbulb }[] = [
  { status: 'idea', label: 'Idées', color: '#9CA3AF', icon: Lightbulb },
  { status: 'planned', label: 'Planifié', color: '#3B82F6', icon: ClipboardList },
  { status: 'scripted', label: 'Scripté', color: '#8B5CF6', icon: PenLine },
  { status: 'filmed', label: 'Tourné', color: '#F59E0B', icon: Film },
  { status: 'editing', label: 'Montage', color: '#EC4899', icon: Scissors },
  { status: 'scheduled', label: 'Programmé', color: '#06B6D4', icon: CalendarCheck },
  { status: 'published', label: 'Publié', color: '#43A047', icon: Rocket },
]

export default function StatusPipeline({ items }: StatusPipelineProps) {
  const counts = PIPELINE.map((p) => ({
    ...p,
    count: items.filter((i) => i.status === p.status).length,
  }))

  const total = items.filter((i) => i.status !== 'cancelled').length

  return (
    <div className="card p-4">
      <h3 className="text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-3">
        PIPELINE DE PRODUCTION
      </h3>

      {/* Pipeline bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-border-light mb-4">
        {counts.map((step) => {
          const pct = total > 0 ? (step.count / total) * 100 : 0
          if (pct === 0) return null
          return (
            <motion.div
              key={step.status}
              className="h-full"
              style={{ backgroundColor: step.color }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              title={`${step.label}: ${step.count}`}
            />
          )
        })}
      </div>

      {/* Steps grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {counts.map((step) => {
          const Icon = step.icon
          return (
            <div key={step.status} className="text-center">
              <div className="flex items-center justify-center mb-0.5">
                <Icon size={16} style={{ color: step.color }} />
              </div>
              <p className="text-lg font-bold font-[var(--font-space-grotesk)] text-text-primary leading-tight">
                {step.count}
              </p>
              <p className="text-[9px] font-[var(--font-bebas)] tracking-wider text-text-tertiary">
                {step.label.toUpperCase()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
