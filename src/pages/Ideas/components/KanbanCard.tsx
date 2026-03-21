import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FORMAT_TAGS } from '@/lib/constants'
import type { VideoIdea } from '@/types/database'

interface KanbanCardProps {
  idea: VideoIdea
  onClick: (idea: VideoIdea) => void
}

export default function KanbanCard({ idea, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idea.id,
    data: { idea },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? '1.02' : '1',
  }

  const formatInfo = idea.format_tag
    ? FORMAT_TAGS[idea.format_tag as keyof typeof FORMAT_TAGS]
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card card-hover p-3 space-y-2 cursor-grab active:cursor-grabbing"
      onClick={() => onClick(idea)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(idea)}
      aria-label={`Idee: ${idea.title}`}
    >
      <h4 className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary leading-snug line-clamp-2">
        {idea.title}
      </h4>

      {formatInfo && (
        <span
          className="badge text-[10px]"
          style={{ backgroundColor: `${formatInfo.color}15`, color: formatInfo.color }}
        >
          {formatInfo.label}
        </span>
      )}

      {idea.ai_analysis?.estimated_views && (
        <p className="text-[11px] text-text-tertiary font-[var(--font-space-grotesk)]">
          ~{(idea.ai_analysis.estimated_views / 1000).toFixed(0)}K vues estimees
        </p>
      )}

      {idea.source && (
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
          {idea.source === 'ai' ? 'IA' : idea.source === 'competitor' ? 'Concurrent' : idea.source}
        </span>
      )}
    </div>
  )
}
