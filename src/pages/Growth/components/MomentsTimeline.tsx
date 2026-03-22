import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Euro, Trophy, Clapperboard, ExternalLink, Filter, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { GrowthAnnotation, AnnotationType } from '../hooks/useGrowthData'
import { formatDate, formatCompact, formatEuros } from '@/lib/formatters'

// ── Type config ────────────────────────────────────────────────────

interface TypeConfig {
  icon: LucideIcon
  color: string
  label: string
}

const TYPE_CONFIG: Record<AnnotationType, TypeConfig> = {
  views_spike: { icon: Flame, color: '#FF6B00', label: 'Pic de vues' },
  revenue_spike: { icon: Euro, color: '#10B981', label: 'Pic de revenus' },
  subscriber_milestone: { icon: Trophy, color: '#8B5CF6', label: 'Jalon' },
  long_form_publish: { icon: Clapperboard, color: '#3B82F6', label: 'Publication' },
}

const ALL_TYPES: AnnotationType[] = ['views_spike', 'revenue_spike', 'subscriber_milestone', 'long_form_publish']

// ── Detail formatter ───────────────────────────────────────────────

function formatDetail(a: GrowthAnnotation): string {
  switch (a.type) {
    case 'views_spike':
      return `${formatCompact(a.value)} vues/jour${a.secondaryValue ? ` · ${a.secondaryValue.toFixed(1)}x moy.` : ''}`
    case 'revenue_spike':
      return `${formatEuros(a.value)}${a.secondaryValue ? ` · ${a.secondaryValue.toFixed(1)}x moy.` : ''}`
    case 'subscriber_milestone':
      return `${formatCompact(a.value)} abonnés`
    case 'long_form_publish':
      return `${Math.floor(a.value / 60)} min`
  }
}

// ── Component ──────────────────────────────────────────────────────

interface MomentsTimelineProps {
  annotations: GrowthAnnotation[]
  onMomentClick: (date: string) => void
}

export default function MomentsTimeline({ annotations, onMomentClick }: MomentsTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<AnnotationType | 'all'>('all')
  const navigate = useNavigate()

  // Sort by date desc (most recent first), take top 20
  const filtered = useMemo(() => {
    const base = activeFilter === 'all'
      ? annotations
      : annotations.filter((a) => a.type === activeFilter)
    return [...base]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 20)
  }, [annotations, activeFilter])

  // Group by month for visual separation
  const grouped = useMemo(() => {
    const groups: { month: string; items: GrowthAnnotation[] }[] = []
    for (const a of filtered) {
      const d = new Date(a.date + 'T00:00:00')
      const month = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      const last = groups[groups.length - 1]
      if (last && last.month === month) {
        last.items.push(a)
      } else {
        groups.push({ month, items: [a] })
      }
    }
    return groups
  }, [filtered])

  if (annotations.length === 0) return null

  const handleItemClick = (annotation: GrowthAnnotation) => {
    if (annotation.type === 'long_form_publish' && annotation.videoId) {
      navigate(`/videos?video=${annotation.videoId}`)
    } else {
      onMomentClick(annotation.date)
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h3 className="font-[var(--font-clash)] text-lg font-semibold text-text-primary">
            Moments clés
          </h3>
          <span className="text-xs font-[var(--font-satoshi)] text-text-tertiary tabular-nums">
            {filtered.length} événement{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Type filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={13} className="text-text-tertiary mr-0.5" />
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium font-[var(--font-satoshi)] transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-text-primary text-page'
                : 'text-text-tertiary hover:text-text-secondary hover:bg-border-light/50'
            }`}
          >
            Tout
          </button>
          {ALL_TYPES.map((type) => {
            const cfg = TYPE_CONFIG[type]
            const isActive = activeFilter === type
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(isActive ? 'all' : type)}
                className="px-2.5 py-1.5 rounded-md text-[11px] font-medium font-[var(--font-satoshi)] transition-colors cursor-pointer"
                style={{
                  color: isActive ? cfg.color : undefined,
                  backgroundColor: isActive ? `${cfg.color}15` : undefined,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = `${cfg.color}10`
                    e.currentTarget.style.color = cfg.color
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = ''
                    e.currentTarget.style.color = ''
                  }
                }}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline content */}
      <div
        role="list"
        aria-label="Moments clés de croissance"
        className="max-h-[480px] overflow-y-auto -mr-2 pr-2 space-y-5"
      >
        <AnimatePresence mode="popLayout">
          {grouped.map((group) => (
            <motion.div
              key={group.month}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              layout
            >
              {/* Month header */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-[var(--font-bebas)] text-xs tracking-wider text-text-tertiary uppercase">
                  {group.month}
                </span>
                <div className="flex-1 h-px bg-border-light" />
              </div>

              {/* Items */}
              <div className="space-y-1.5">
                {group.items.map((annotation, i) => {
                  const config = TYPE_CONFIG[annotation.type]
                  const Icon = config.icon
                  const isVideo = annotation.type === 'long_form_publish' && !!annotation.videoId

                  return (
                    <motion.button
                      role="listitem"
                      key={`${annotation.date}-${annotation.type}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      layout
                      onClick={() => handleItemClick(annotation)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left cursor-pointer hover:bg-border-light/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200"
                    >
                      {/* Icon */}
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                        style={{ backgroundColor: `${config.color}15` }}
                      >
                        <Icon size={18} style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-[var(--font-clash)] text-sm font-semibold text-text-primary">
                            {annotation.title}
                          </p>
                          {isVideo && (
                            <ExternalLink
                              size={12}
                              className="shrink-0 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </div>
                        <p className="font-[var(--font-satoshi)] text-xs text-text-secondary mt-0.5">
                          {formatDetail(annotation)}
                        </p>
                      </div>

                      {/* Date + badge */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-[var(--font-satoshi)] text-[11px] text-text-tertiary whitespace-nowrap">
                          {formatDate(annotation.date)}
                        </span>
                        <span
                          className="font-[var(--font-bebas)] text-[9px] tracking-wider rounded px-1.5 py-0.5 whitespace-nowrap"
                          style={{
                            color: config.color,
                            backgroundColor: `${config.color}12`,
                          }}
                        >
                          {config.label}
                        </span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-text-tertiary font-[var(--font-satoshi)]">
              Aucun moment pour ce filtre
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
