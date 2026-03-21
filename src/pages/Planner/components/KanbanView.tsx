import { motion } from 'framer-motion'
import { Youtube, Film, Play } from 'lucide-react'
import type { ContentCalendarItem } from '@/types/database'
import { FORMAT_TAGS } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'

const KANBAN_COLUMNS: {
  key: string
  label: string
  statuses: ContentCalendarItem['status'][]
  color: string
}[] = [
  { key: 'idea', label: 'IDEE', statuses: ['idea'], color: '#9CA3AF' },
  { key: 'planned', label: 'PLANIFIE', statuses: ['planned', 'scripted'], color: '#6B7280' },
  { key: 'filmed', label: 'TOURNAGE', statuses: ['filmed'], color: '#FFB800' },
  { key: 'editing', label: 'MONTAGE', statuses: ['editing'], color: '#FF6B00' },
  { key: 'scheduled', label: 'PROGRAMME', statuses: ['scheduled'], color: '#2196F3' },
  { key: 'published', label: 'PUBLIE', statuses: ['published'], color: '#43A047' },
]

function platformIcon(platform: string) {
  switch (platform) {
    case 'youtube':
      return <Youtube size={12} />
    case 'tiktok':
      return <Film size={12} />
    case 'instagram':
      return <Play size={12} />
    default:
      return null
  }
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 20, stiffness: 200 } },
}

interface Props {
  items: ContentCalendarItem[]
}

export default function KanbanView({ items }: Props) {
  // Filter out cancelled items
  const activeItems = items.filter((i) => i.status !== 'cancelled')

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-6 gap-4 min-h-[600px]"
    >
      {KANBAN_COLUMNS.map((col) => {
        const columnItems = activeItems.filter((item) => col.statuses.includes(item.status))

        return (
          <div key={col.key} className="flex flex-col">
            {/* Column header */}
            <div
              className="rounded-t-[var(--radius-card)] px-3 py-2.5 mb-3"
              style={{ borderTop: `3px solid ${col.color}`, backgroundColor: col.color + '0A' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-[var(--font-satoshi)] text-text-primary tracking-wider">
                  {col.label}
                </h3>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: col.color }}
                >
                  {columnItems.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <motion.div
              className="flex flex-col gap-3 flex-1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {columnItems.map((item) => {
                const formatInfo = item.format_tag && item.format_tag in FORMAT_TAGS
                  ? FORMAT_TAGS[item.format_tag as keyof typeof FORMAT_TAGS]
                  : null

                return (
                  <motion.div
                    key={item.id}
                    variants={cardVariants}
                    layout
                    className="bg-surface rounded-[var(--radius-card)] border border-border shadow-[var(--shadow-card)]
                               p-3.5 cursor-default transition-all duration-200
                               hover:shadow-[var(--shadow-card-hover)] hover:scale-[1.01]"
                  >
                    {/* Top row: format badge + LF */}
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      {formatInfo && (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold text-white font-[var(--font-satoshi)]"
                          style={{ backgroundColor: formatInfo.color }}
                        >
                          {formatInfo.label}
                        </span>
                      )}
                      {item.is_long_form && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold
                                         bg-primary-50 text-primary font-[var(--font-satoshi)]">
                          LF
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-[var(--font-satoshi)] font-medium text-text-primary leading-snug mb-2">
                      {item.title}
                    </p>

                    {/* Date */}
                    {item.planned_date && (
                      <p className="text-[11px] text-text-tertiary font-[var(--font-satoshi)] mb-2">
                        {formatDate(item.planned_date)}
                      </p>
                    )}

                    {/* Platforms */}
                    <div className="flex items-center gap-1.5">
                      {item.platforms.map((p) => (
                        <span
                          key={p}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-border-light text-text-tertiary text-[10px] font-[var(--font-satoshi)]"
                        >
                          {platformIcon(p)}
                          <span className="capitalize">{p}</span>
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}

              {columnItems.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-4">
                  <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] italic">Aucun contenu</p>
                </div>
              )}
            </motion.div>
          </div>
        )
      })}
    </motion.div>
  )
}
