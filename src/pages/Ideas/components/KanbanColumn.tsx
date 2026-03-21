import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import type { VideoIdea } from '@/types/database'
import KanbanCard from './KanbanCard'

export interface KanbanColumnDef {
  id: string
  label: string
  color: string
}

interface KanbanColumnProps {
  column: KanbanColumnDef
  ideas: VideoIdea[]
  onCardClick: (idea: VideoIdea) => void
}

export default function KanbanColumn({ column, ideas, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[240px] max-w-[280px] flex-1 rounded-[var(--radius-card)] transition-colors duration-200 ${
        isOver ? 'bg-primary-50' : 'bg-transparent'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
        <h3 className="text-xs font-[var(--font-clash)] font-bold text-text-primary uppercase tracking-wide">
          {column.label}
        </h3>
        <motion.span
          key={ideas.length}
          className="badge bg-border-light text-text-secondary text-[10px] !h-5 !px-1.5"
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {ideas.length}
        </motion.span>
      </div>

      {/* Cards */}
      <SortableContext items={ideas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-1 pb-2 min-h-[120px]">
          {ideas.length === 0 ? (
            <p className="text-[11px] text-text-tertiary text-center py-6 font-[var(--font-satoshi)] italic">
              {column.id === 'backlog' && 'Les nouvelles idees arrivent ici'}
              {column.id === 'approved' && "Glisse une idee ici pour l'approuver"}
              {column.id === 'writing' && "Idees en cours d'ecriture"}
              {column.id === 'filmed' && 'Videos tournees'}
              {column.id === 'editing' && 'En post-production'}
              {column.id === 'published' && 'Publiees — bravo !'}
            </p>
          ) : (
            ideas.map((idea) => (
              <KanbanCard key={idea.id} idea={idea} onClick={onCardClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
