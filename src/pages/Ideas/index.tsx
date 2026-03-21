import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { FORMAT_TAGS } from '@/lib/constants'
import { formatCompact } from '@/lib/formatters'
import { mockIdeas } from './mockData'
import type { VideoIdea } from '@/types/database'

type StatusFilter = 'all' | VideoIdea['status']

const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'backlog', label: 'Backlog' },
  { key: 'approved', label: 'Approuve' },
  { key: 'rejected', label: 'Rejete' },
]

const STATUS_CONFIG: Record<VideoIdea['status'], { color: string; label: string }> = {
  backlog: { color: '#6B7280', label: 'Backlog' },
  approved: { color: '#43A047', label: 'Approuve' },
  rejected: { color: '#E53935', label: 'Rejete' },
  in_calendar: { color: '#2196F3', label: 'Planifie' },
}

const SOURCE_BADGES: Record<string, { label: string; variant: 'info' | 'neutral' | 'success' | 'primary' | 'error' }> = {
  ai: { label: 'IA', variant: 'info' },
  manual: { label: 'Manuel', variant: 'neutral' },
  trend: { label: 'Tendance', variant: 'success' },
  comment: { label: 'Commentaire', variant: 'primary' },
  competitor: { label: 'Concurrent', variant: 'error' },
  sponsor: { label: 'Sponsor', variant: 'warning' as 'info' },
}

export default function Ideas() {
  const [activeTab, setActiveTab] = useState<StatusFilter>('all')

  const filtered = activeTab === 'all'
    ? mockIdeas
    : mockIdeas.filter((idea) => idea.status === activeTab)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-[var(--font-clash)] text-text-primary">
          Idees de Videos
        </h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Nouvelle idee
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`h-8 px-4 rounded-full text-sm font-[var(--font-satoshi)] font-medium transition-all cursor-pointer ${
              activeTab === tab.key
                ? 'bg-primary text-white shadow-[var(--shadow-button-primary)]'
                : 'bg-surface border border-border text-text-secondary hover:bg-page'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ideas grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((idea, i) => {
          const formatInfo = idea.format_tag
            ? FORMAT_TAGS[idea.format_tag as keyof typeof FORMAT_TAGS]
            : null
          const statusInfo = STATUS_CONFIG[idea.status]
          const sourceInfo = idea.source ? SOURCE_BADGES[idea.source] : null

          return (
            <motion.div
              key={idea.id}
              className="card p-5 flex flex-col gap-3 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05, ease: 'easeOut' as const }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Title */}
              <h3 className="font-[var(--font-satoshi)] font-bold text-base text-text-primary leading-snug line-clamp-2">
                {idea.title}
              </h3>

              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                {formatInfo && (
                  <span
                    className="badge text-white"
                    style={{ backgroundColor: formatInfo.color }}
                  >
                    {formatInfo.label}
                  </span>
                )}
                {sourceInfo && (
                  <Badge variant={sourceInfo.variant} size="sm">
                    {sourceInfo.label}
                  </Badge>
                )}
                <Badge variant={idea.is_long_form ? 'info' : 'primary'} size="sm">
                  {idea.is_long_form ? 'LF' : 'Short'}
                </Badge>
              </div>

              {/* Estimated views */}
              {idea.estimated_views && (
                <p className="font-[var(--font-space-grotesk)] text-sm text-text-primary">
                  ~{formatCompact(idea.estimated_views)} vues
                </p>
              )}

              {/* Rationale */}
              {idea.rationale && (
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                  {idea.rationale}
                </p>
              )}

              {/* Status */}
              <div className="flex items-center gap-2 mt-auto pt-1">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: statusInfo.color }}
                />
                <span className="text-xs font-[var(--font-satoshi)] font-medium text-text-secondary">
                  {statusInfo.label}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
