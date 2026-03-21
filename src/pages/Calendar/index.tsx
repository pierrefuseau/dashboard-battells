import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react'
import { useCalendar } from '@/hooks'
import type { ContentCalendarItem } from '@/types/database'
import CalendarGrid from './components/CalendarGrid'
import CalendarModal from './components/CalendarModal'
import StatusPipeline from './components/StatusPipeline'

const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
] as const

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

function getToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Calendar() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<ContentCalendarItem | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')

  const { items, loading, error, refetch, addItem, updateItem, deleteItem } = useCalendar({ month, year })
  const allItems = useCalendar({})

  const today = useMemo(() => getToday(), [])

  function goToPrev() {
    setMonth((m) => {
      if (m === 1) { setYear((y) => y - 1); return 12 }
      return m - 1
    })
  }

  function goToNext() {
    setMonth((m) => {
      if (m === 12) { setYear((y) => y + 1); return 1 }
      return m + 1
    })
  }

  function goToToday() {
    const current = new Date()
    setMonth(current.getMonth() + 1)
    setYear(current.getFullYear())
  }

  function handleDayClick(date: string) {
    setEditItem(null)
    setSelectedDate(date)
    setModalOpen(true)
  }

  function handleItemClick(item: ContentCalendarItem) {
    setEditItem(item)
    setSelectedDate('')
    setModalOpen(true)
  }

  async function handleSave(item: Omit<ContentCalendarItem, 'id' | 'created_at'>) {
    await addItem(item)
    refetch()
    allItems.refetch()
  }

  async function handleUpdate(id: number, updates: Partial<ContentCalendarItem>) {
    await updateItem(id, updates)
    refetch()
    allItems.refetch()
  }

  async function handleDelete(id: number) {
    await deleteItem(id)
    refetch()
    allItems.refetch()
  }

  const upcomingCount = items.filter((i) => i.planned_date && i.planned_date >= today && i.status !== 'cancelled').length

  return (
    <motion.div
      className="space-y-6"
      variants={stagger}
      initial="hidden"
      animate="show"
      key={`calendar-${month}-${year}`}
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="title-display !text-[clamp(28px,4vw,48px)] text-text-primary">
            Calendrier
          </h1>
          <p className="text-sm text-text-secondary font-[var(--font-satoshi)] mt-1">
            {upcomingCount > 0
              ? `${upcomingCount} contenu${upcomingCount > 1 ? 's' : ''} planifié${upcomingCount > 1 ? 's' : ''} ce mois`
              : 'Aucun contenu planifié ce mois'
            }
          </p>
        </div>

        <button
          onClick={() => { setEditItem(null); setSelectedDate(today); setModalOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Nouveau contenu
        </button>
      </motion.div>

      {/* Pipeline */}
      <motion.div variants={fadeUp}>
        <StatusPipeline items={allItems.items} />
      </motion.div>

      {/* Month navigation */}
      <motion.div variants={fadeUp} className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              className="w-9 h-9 rounded-[var(--radius-button)] border border-border flex items-center justify-center hover:bg-border-light transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold font-[var(--font-clash)] text-text-primary min-w-[200px] text-center">
              {MONTHS_FR[month - 1]} {year}
            </h2>

            <button
              onClick={goToNext}
              className="w-9 h-9 rounded-[var(--radius-button)] border border-border flex items-center justify-center hover:bg-border-light transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="btn-secondary text-sm h-9 px-3 flex items-center gap-1.5"
          >
            <CalendarIcon size={14} />
            Aujourd'hui
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-10">
            <p className="text-sm text-error font-[var(--font-satoshi)]">{error}</p>
            <button onClick={refetch} className="btn-secondary text-sm h-8 px-3 mt-2">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && (
          <CalendarGrid
            month={month}
            year={year}
            items={items}
            onDayClick={handleDayClick}
            onItemClick={handleItemClick}
            today={today}
          />
        )}
      </motion.div>

      {/* Legend */}
      <motion.div variants={fadeUp} className="card p-4">
        <h3 className="text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-2">
          LÉGENDE DES STATUTS
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Idée', color: '#9CA3AF' },
            { label: 'Planifié', color: '#3B82F6' },
            { label: 'Scripté', color: '#8B5CF6' },
            { label: 'Tourné', color: '#F59E0B' },
            { label: 'Montage', color: '#EC4899' },
            { label: 'Programmé', color: '#06B6D4' },
            { label: 'Publié', color: '#43A047' },
            { label: 'Annulé', color: '#E53935' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-text-secondary font-[var(--font-satoshi)]">{s.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Modal */}
      <CalendarModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditItem(null); setSelectedDate('') }}
        onSave={handleSave}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        editItem={editItem}
        defaultDate={selectedDate}
      />
    </motion.div>
  )
}
