import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb, ClipboardList, PenLine, Film, Scissors, CalendarCheck, Rocket,
} from 'lucide-react'
import type { ContentCalendarItem } from '@/types/database'
import { FORMAT_TAGS } from '@/lib/constants'

interface KanbanViewProps {
  items: ContentCalendarItem[]
  onItemClick: (item: ContentCalendarItem) => void
}

const COLUMNS: {
  status: ContentCalendarItem['status']
  label: string
  color: string
  icon: typeof Lightbulb
}[] = [
  { status: 'idea', label: 'Idées', color: '#9CA3AF', icon: Lightbulb },
  { status: 'planned', label: 'Planifié', color: '#3B82F6', icon: ClipboardList },
  { status: 'scripted', label: 'Scripté', color: '#8B5CF6', icon: PenLine },
  { status: 'filmed', label: 'Tourné', color: '#F59E0B', icon: Film },
  { status: 'editing', label: 'Montage', color: '#EC4899', icon: Scissors },
  { status: 'scheduled', label: 'Programmé', color: '#06B6D4', icon: CalendarCheck },
  { status: 'published', label: 'Publié', color: '#43A047', icon: Rocket },
]

function formatShortDate(date: string | null) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function KanbanView({ items, onItemClick }: KanbanViewProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {COLUMNS.map((col) => {
        const colItems = items.filter((i) => i.status === col.status)
        const Icon = col.icon

        return (
          <div
            key={col.status}
            className="flex-shrink-0 w-[200px] lg:w-[calc((100%-72px)/7)]"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <Icon size={14} style={{ color: col.color }} />
              <span className="text-[10px] font-[var(--font-bebas)] tracking-[0.1em] text-text-tertiary uppercase">
                {col.label}
              </span>
              {colItems.length > 0 && (
                <span
                  className="ml-auto text-[10px] font-bold font-[var(--font-space-grotesk)] w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${col.color}18`, color: col.color }}
                >
                  {colItems.length}
                </span>
              )}
            </div>

            {/* Column body */}
            <div
              className="min-h-[300px] rounded-[var(--radius-card)] p-2 space-y-2 border border-border-light"
              style={{ backgroundColor: `${col.color}06` }}
            >
              <AnimatePresence>
                {colItems.map((item) => {
                  const tag = item.format_tag as keyof typeof FORMAT_TAGS | null
                  const formatColor = tag && FORMAT_TAGS[tag] ? FORMAT_TAGS[tag].color : '#6B7280'
                  const formatLabel = tag && FORMAT_TAGS[tag] ? FORMAT_TAGS[tag].label : null

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onItemClick(item)}
                      className="w-full text-left bg-surface rounded-[var(--radius-input)] p-3 shadow-[var(--shadow-card)] border border-border-light cursor-pointer transition-all duration-200 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      {/* Title */}
                      <p className="text-xs font-medium font-[var(--font-satoshi)] text-text-primary line-clamp-2 leading-snug">
                        {item.title}
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {/* Format badge */}
                        {formatLabel && (
                          <span
                            className="text-[9px] font-semibold font-[var(--font-satoshi)] px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: `${formatColor}15`,
                              color: formatColor,
                            }}
                          >
                            {formatLabel}
                          </span>
                        )}

                        {/* Short/Long */}
                        <span className="text-[9px] font-[var(--font-satoshi)] text-text-tertiary">
                          {item.is_long_form ? 'Long' : 'Short'}
                        </span>

                        {/* Date */}
                        {item.planned_date && (
                          <span className="text-[9px] font-[var(--font-space-grotesk)] text-text-tertiary ml-auto">
                            {formatShortDate(item.planned_date)}
                          </span>
                        )}
                      </div>

                      {/* Platforms */}
                      {item.platforms.length > 0 && (
                        <div className="flex gap-1 mt-1.5">
                          {item.platforms.map((p) => (
                            <span
                              key={p}
                              className="text-[8px] font-[var(--font-bebas)] tracking-wider text-text-tertiary bg-border-light px-1.5 py-0.5 rounded uppercase"
                            >
                              {p === 'youtube' ? 'YT' : p === 'tiktok' ? 'TK' : 'IG'}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>

              {colItems.length === 0 && (
                <div className="flex items-center justify-center h-20 text-text-tertiary">
                  <p className="text-[10px] font-[var(--font-satoshi)] opacity-50">Aucun contenu</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
