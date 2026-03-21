import { useState, useCallback } from 'react'
import { celebratePublished } from '@/lib/confetti'
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import type { VideoIdea } from '@/types/database'
import KanbanColumn, { type KanbanColumnDef } from './KanbanColumn'
import KanbanCard from './KanbanCard'

const COLUMNS: KanbanColumnDef[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--color-text-tertiary)', emptyHint: 'Les nouvelles idees arrivent ici' },
  { id: 'approved', label: 'Approuve', color: 'var(--color-primary)', emptyHint: "Glisse une idee ici pour l'approuver" },
  { id: 'writing', label: 'En ecriture', color: 'var(--color-info)', emptyHint: "Idees en cours d'ecriture" },
  { id: 'filmed', label: 'Filme', color: 'var(--color-secondary)', emptyHint: 'Videos tournees' },
  { id: 'editing', label: 'Monte', color: 'var(--color-warning)', emptyHint: 'En post-production' },
  { id: 'published', label: 'Publie', color: 'var(--color-success)', emptyHint: 'Publiees — bravo !' },
]

interface KanbanBoardProps {
  ideas: VideoIdea[]
  loading: boolean
  onCardClick: (idea: VideoIdea) => void
  onUpdateIdea: (id: number, updates: Partial<VideoIdea>) => Promise<void>
}

export default function KanbanBoard({ ideas, loading, onCardClick, onUpdateIdea }: KanbanBoardProps) {
  const [activeIdea, setActiveIdea] = useState<VideoIdea | null>(null)

  const ideasByStatus = useCallback(
    (status: string) => ideas.filter((i) => i.status === status),
    [ideas]
  )

  function handleDragStart(event: DragStartEvent) {
    const idea = ideas.find((i) => i.id === event.active.id)
    setActiveIdea(idea ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveIdea(null)
    const { active, over } = event
    if (!over) return

    const idea = ideas.find((i) => i.id === active.id)
    if (!idea) return

    // Resolve target column: over.id can be a column ID or a card ID
    let targetColumn = COLUMNS.find((c) => c.id === over.id)
    if (!targetColumn) {
      // Dropped onto a card — find which column that card belongs to
      const targetIdea = ideas.find((i) => i.id === over.id)
      if (targetIdea) {
        targetColumn = COLUMNS.find((c) => c.id === targetIdea.status)
      }
    }
    if (!targetColumn || idea.status === targetColumn.id) return

    const newStatus = targetColumn.id as VideoIdea['status']
    await onUpdateIdea(idea.id, { status: newStatus })
    if (newStatus === 'published') {
      celebratePublished()
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-[var(--font-bebas)] tracking-[0.15em] text-text-secondary uppercase">
          Pipeline de production
        </h2>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="min-w-[240px] max-w-[280px] flex-1 space-y-2">
              <div className="skeleton h-8 w-24 rounded" />
              <div className="skeleton h-24 rounded-[var(--radius-card)]" />
              <div className="skeleton h-24 rounded-[var(--radius-card)]" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory sm:snap-none hide-scrollbar w-full" style={{ scrollSnapType: 'x mandatory' }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                ideas={ideasByStatus(col.id)}
                onCardClick={onCardClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeIdea && <KanbanCard idea={activeIdea} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      )}
    </motion.section>
  )
}
