import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CalendarDays, Columns3 } from 'lucide-react'
import CalendarView from './components/CalendarView'
import KanbanView from './components/KanbanView'
import { MOCK_CALENDAR_ITEMS } from './mockData'

type ViewMode = 'calendar' | 'kanban'

export default function Planner() {
  const [view, setView] = useState<ViewMode>('calendar')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="title-display text-text-primary">
          CALENDRIER DE CONTENU
        </h1>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View toggle */}
          <div className="flex items-center bg-border-light rounded-[var(--radius-button)] p-1">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-input)] text-sm font-[var(--font-satoshi)] font-medium
                transition-all duration-200 cursor-pointer
                ${view === 'calendar'
                  ? 'bg-primary text-white shadow-[var(--shadow-button-primary)]'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <CalendarDays size={15} />
              <span className="hidden sm:inline">Calendrier</span>
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-input)] text-sm font-[var(--font-satoshi)] font-medium
                transition-all duration-200 cursor-pointer
                ${view === 'kanban'
                  ? 'bg-primary text-white shadow-[var(--shadow-button-primary)]'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <Columns3 size={15} />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>

          {/* New video button */}
          <button className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} />
            <span className="hidden sm:inline">Nouvelle vidéo</span>
          </button>
        </div>
      </div>

      {/* View content */}
      <AnimatePresence mode="wait">
        {view === 'calendar' ? (
          <CalendarView key="calendar" items={MOCK_CALENDAR_ITEMS} />
        ) : (
          <KanbanView key="kanban" items={MOCK_CALENDAR_ITEMS} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
