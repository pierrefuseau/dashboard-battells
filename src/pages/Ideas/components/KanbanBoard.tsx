import { useState, useCallback } from 'react'
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useVideoIdeas } from '@/hooks'
import type { VideoIdea } from '@/types/database'
import KanbanColumn, { type KanbanColumnDef } from './KanbanColumn'
import KanbanCard from './KanbanCard'

const COLUMNS: KanbanColumnDef[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--color-text-tertiary)' },
  { id: 'approved', label: 'Approuve', color: 'var(--color-primary)' },
  { id: 'writing', label: 'En ecriture', color: 'var(--color-info)' },
  { id: 'filmed', label: 'Filme', color: 'var(--color-secondary)' },
  { id: 'editing', label: 'Monte', color: '#8B5CF6' },
  { id: 'published', label: 'Publie', color: 'var(--color-success)' },
]

interface KanbanBoardProps {
  onCardClick: (idea: VideoIdea) => void
}

export default function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  const { ideas, loading, updateIdea } = useVideoIdeas()
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

    const newStatus = over.id as VideoIdea['status']
    const idea = ideas.find((i) => i.id === active.id)
    if (!idea || idea.status === newStatus) return

    const isColumn = COLUMNS.some((c) => c.id === newStatus)
    if (!isColumn) return

    await updateIdea(idea.id, { status: newStatus })
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
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
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
