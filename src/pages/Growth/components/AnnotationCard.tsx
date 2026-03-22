import { motion } from 'framer-motion'
import { Flame, Euro, Trophy, Clapperboard, ExternalLink, type LucideIcon } from 'lucide-react'
import type { GrowthAnnotation, AnnotationType } from '../hooks/useGrowthData'
import { formatDate, formatCompact, formatEuros } from '@/lib/formatters'

// ── Type config ────────────────────────────────────────────────────

interface TypeConfig {
  icon: LucideIcon
  color: string
}

const TYPE_CONFIG: Record<AnnotationType, TypeConfig> = {
  views_spike: { icon: Flame, color: '#FF6B00' },
  revenue_spike: { icon: Euro, color: '#10B981' },
  subscriber_milestone: { icon: Trophy, color: '#8B5CF6' },
  long_form_publish: { icon: Clapperboard, color: '#3B82F6' },
}

// ── Metric formatter by type ───────────────────────────────────────

function formatMetric(annotation: GrowthAnnotation): string {
  switch (annotation.type) {
    case 'views_spike':
      return `${formatCompact(annotation.value)} vues`
    case 'revenue_spike':
      return formatEuros(annotation.value)
    case 'subscriber_milestone':
      return `${formatCompact(annotation.value)} abonnés`
    case 'long_form_publish':
      return `${Math.floor(annotation.value / 60)} min`
  }
}

// ── Animation config ───────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const

const motionProps = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: 0.2, ease: EASE },
}

// ── Component ──────────────────────────────────────────────────────

interface AnnotationCardProps {
  annotation: GrowthAnnotation
  isVideo?: boolean
  style?: React.CSSProperties
}

export default function AnnotationCard({ annotation, isVideo, style }: AnnotationCardProps) {
  const config = TYPE_CONFIG[annotation.type]
  const Icon = config.icon

  return (
    <motion.div
      {...motionProps}
      style={style}
      className="pointer-events-none absolute z-50 w-[240px]"
    >
      <div
        className="relative rounded-[12px] bg-surface/95 backdrop-blur-sm shadow-[var(--shadow-tooltip)] border border-border-light overflow-hidden"
        style={{ borderLeft: `3px solid ${config.color}` }}
      >
        {/* Content */}
        <div className="flex items-start gap-3 p-3">
          {/* Thumbnail or icon */}
          {annotation.thumbnailUrl ? (
            <img
              src={annotation.thumbnailUrl}
              alt=""
              className="h-12 w-12 shrink-0 rounded-[6px] object-cover"
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[6px]"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon size={20} style={{ color: config.color }} />
            </div>
          )}

          {/* Text */}
          <div className="min-w-0 flex-1">
            <p className="truncate font-[var(--font-clash)] text-sm font-semibold text-text-primary">
              {annotation.title}
            </p>
            <p className="mt-0.5 font-[var(--font-satoshi)] text-xs text-text-secondary">
              {formatMetric(annotation)}
            </p>
            <p className="mt-0.5 font-[var(--font-satoshi)] text-xs text-text-tertiary">
              {formatDate(annotation.date)}
            </p>
          </div>
        </div>

        {/* Video CTA */}
        {isVideo && (
          <div className="flex items-center gap-1.5 px-3 pb-2.5 -mt-0.5">
            <ExternalLink size={10} style={{ color: config.color }} />
            <span className="text-[10px] font-[var(--font-satoshi)] font-medium" style={{ color: config.color }}>
              Voir les stats de la vidéo
            </span>
          </div>
        )}
      </div>

      {/* Arrow pointing down */}
      <div className="flex justify-center">
        <div
          className="-mt-[1px] h-2.5 w-2.5 rotate-45 border-r border-b border-border-light"
          style={{ backgroundColor: config.color }}
        />
      </div>
    </motion.div>
  )
}
