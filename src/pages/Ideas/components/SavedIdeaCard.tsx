import { motion } from 'framer-motion'
import { Play, Eye, Clock, Trash2, ShieldCheck } from 'lucide-react'
import type { VideoIdea } from '@/types/database'

interface SavedIdeaCardProps {
  idea: VideoIdea
  onClick: (idea: VideoIdea) => void
  onArchive: (idea: VideoIdea, e: React.MouseEvent) => void
}

export default function SavedIdeaCard({ idea, onClick, onArchive }: SavedIdeaCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col p-5 bg-surface rounded-[var(--radius-card)] border border-border/40 cursor-pointer overflow-hidden
                 shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300"
      onClick={() => onClick(idea)}
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Header Snippet with Type & Source */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex flex-wrap gap-2">
          {idea.is_long_form ? (
            <span className="badge badge-primary flex items-center gap-1 font-bold">
              <Play className="w-3 h-3" />
              Format Long
            </span>
          ) : (
            <span className="badge badge-secondary flex items-center gap-1 font-bold">
              <Play className="w-3 h-3" />
              Short
            </span>
          )}
          
          <span className="badge bg-surface-light text-text-secondary border border-border/40 font-bold flex items-center gap-1">
            {idea.source === 'competitor' ? (
              <><ShieldCheck className="w-3 h-3" /> Concurrent</>
            ) : idea.source === 'trend' ? 'Tendance'
              : 'Personnelle'}
          </span>
        </div>
        
        {/* Quick Delete/Archive Button */}
        <button
          onClick={(e) => onArchive(idea, e)}
          className="p-1.5 rounded-md text-text-tertiary hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
          title="Retirer de la sélection"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Idea Title */}
      <h3 className="text-xl font-[var(--font-clash)] font-bold text-text-primary mb-4 leading-tight group-hover:text-primary transition-colors flex-grow relative z-10">
        {idea.title}
      </h3>

      {/* Analytics/AI Snippet Details */}
      {idea.ai_analysis && (
        <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-border/40 relative z-10">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-bold flex items-center gap-1">
              <Eye className="w-3 h-3" /> Vues Est.
            </span>
            <span className="text-sm font-bold text-text-secondary font-[var(--font-space-grotesk)]">
              {idea.ai_analysis.estimated_views ? (idea.ai_analysis.estimated_views / 1000).toFixed(0) + 'k' : '-'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-bold">Format</span>
            <span className="text-sm font-bold text-text-secondary font-[var(--font-space-grotesk)] truncate">
              {idea.ai_analysis.format_recommendation || '-'}
            </span>
          </div>
        </div>
      )}

      {/* Fallback empty view if no AI analysis */}
      {!idea.ai_analysis && (
        <div className="mt-auto pt-4 border-t border-border/40 flex items-center gap-2 text-text-tertiary text-xs font-medium italic relative z-10">
          <Clock className="w-3 h-3" />
          En attente d'analyse...
        </div>
      )}
    </motion.div>
  )
}
