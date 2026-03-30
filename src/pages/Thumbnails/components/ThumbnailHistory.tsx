import { motion } from 'framer-motion'
import { Heart, Trash2, Clock, ExternalLink } from 'lucide-react'
import type { ThumbnailGeneration } from '@/types/thumbnails'

interface ThumbnailHistoryProps {
  history: ThumbnailGeneration[]
  loading: boolean
  onSelect: (item: ThumbnailGeneration) => void
  onToggleFavorite: (id: number, current: boolean) => void
  onDelete: (id: number) => void
}

export default function ThumbnailHistory({
  history,
  loading,
  onSelect,
  onToggleFavorite,
  onDelete,
}: ThumbnailHistoryProps) {
  if (loading) {
    return (
      <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5">
        <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase mb-3">
          Historique
        </h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-40 h-24 rounded-lg bg-page animate-pulse shrink-0"
            />
          ))}
        </div>
      </div>
    )
  }

  if (history.length === 0) {
    return null
  }

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
          Historique
        </h2>
        <span className="text-xs text-text-tertiary font-[var(--font-satoshi)]">
          {history.length} generation{history.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {history.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group relative shrink-0 cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="w-44 rounded-lg overflow-hidden border border-border/40 hover:border-primary/30 transition-all">
              <div className="relative">
                <img
                  src={item.image_url}
                  alt={item.title || item.template_id}
                  className="w-full h-24 object-cover"
                />
                {/* Platform badge */}
                <span className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                  item.platform === 'youtube' ? 'bg-red-500/80 text-white' : 'bg-pink-500/80 text-white'
                }`}>
                  {item.platform === 'youtube' ? 'YT' : 'TT'}
                </span>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleFavorite(item.id, item.is_favorite)
                    }}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <Heart className={`w-3.5 h-3.5 ${item.is_favorite ? 'fill-red-400 text-red-400' : 'text-white'}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(item.id)
                    }}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-red-500/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <a
                    href={item.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </a>
                </div>
              </div>

              <div className="p-2 bg-page">
                <p className="text-[10px] font-bold font-[var(--font-clash)] text-text-primary truncate">
                  {item.title || item.template_id}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-2.5 h-2.5 text-text-tertiary" />
                  <span className="text-[9px] text-text-tertiary font-[var(--font-satoshi)]">
                    {new Date(item.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {item.is_favorite && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
