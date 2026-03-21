import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, Youtube, Film, Play } from 'lucide-react'
import type { ContentCalendarItem } from '@/types/database'
import { FORMAT_TAGS } from '@/lib/constants'
import { formatDate } from '@/lib/formatters'

const STATUS_COLORS: Record<ContentCalendarItem['status'], string> = {
  published: '#43A047',
  scheduled: '#2196F3',
  editing: '#FF6B00',
  filmed: '#FFB800',
  scripted: '#8B5CF6',
  planned: '#6B7280',
  idea: '#9CA3AF',
  cancelled: '#E53935',
}

const STATUS_LABELS: Record<ContentCalendarItem['status'], string> = {
  published: 'Publiee',
  scheduled: 'Programmee',
  editing: 'Montage',
  filmed: 'Tournee',
  scripted: 'Scriptee',
  planned: 'Planifiee',
  idea: 'Idee',
  cancelled: 'Annulee',
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const MONTH_NAMES = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre',
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

interface Props {
  items: ContentCalendarItem[]
}

export default function CalendarView({ items }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)) // March 2026
  const [selectedItem, setSelectedItem] = useState<ContentCalendarItem | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    // Monday = 0, Sunday = 6
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6

    const days: { date: number; month: number; year: number; isCurrentMonth: boolean }[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        month: month - 1,
        year: month === 0 ? year - 1 : year,
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: d, month, year, isCurrentMonth: true })
    }

    // Next month days to fill grid
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: d,
        month: month + 1,
        year: month === 11 ? year + 1 : year,
        isCurrentMonth: false,
      })
    }

    return days
  }, [year, month])

  const itemsByDate = useMemo(() => {
    const map = new Map<string, ContentCalendarItem[]>()
    for (const item of items) {
      if (!item.planned_date) continue
      const key = item.planned_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    return map
  }, [items])

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  function dateKey(day: { date: number; month: number; year: number }) {
    const m = day.month < 0 ? 11 : day.month > 11 ? 0 : day.month
    const y = day.month < 0 ? day.year - 1 : day.month > 11 ? day.year + 1 : day.year
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
    >
      {/* Month header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-[var(--radius-button)] border border-border flex items-center justify-center
                       text-text-secondary hover:bg-border-light hover:text-text-primary transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-[var(--font-clash)] text-2xl font-semibold text-text-primary min-w-[220px] text-center">
            {MONTH_NAMES[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-[var(--radius-button)] border border-border flex items-center justify-center
                       text-text-secondary hover:bg-border-light hover:text-text-primary transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {Object.entries(STATUS_LABELS).filter(([k]) => k !== 'cancelled').map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status as ContentCalendarItem['status']] }}
              />
              <span className="text-xs text-text-secondary font-[var(--font-satoshi)]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold text-text-secondary font-[var(--font-satoshi)] uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const key = dateKey(day)
            const isToday = key === todayStr
            const dayItems = itemsByDate.get(key) || []

            return (
              <div
                key={idx}
                className={`min-h-[120px] p-2 border-b border-r border-border-light relative
                  ${!day.isCurrentMonth ? 'bg-border-light/40' : 'bg-surface'}
                  ${isToday ? 'border-l-3 border-l-primary' : ''}
                `}
              >
                <span
                  className={`text-sm font-[var(--font-satoshi)] font-medium block mb-1
                    ${!day.isCurrentMonth ? 'text-text-tertiary' : isToday ? 'text-primary font-bold' : 'text-text-primary'}
                  `}
                >
                  {day.date}
                </span>

                <div className="flex flex-col gap-1">
                  {dayItems.map((item) => {
                    const formatInfo = item.format_tag && item.format_tag in FORMAT_TAGS
                      ? FORMAT_TAGS[item.format_tag as keyof typeof FORMAT_TAGS]
                      : null

                    return (
                      <button
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full text-left px-1.5 py-1 rounded-md text-[11px] font-[var(--font-satoshi)] font-medium
                          truncate cursor-pointer transition-all hover:scale-[1.02] hover:shadow-sm flex items-center gap-1
                          ${item.status === 'cancelled' ? 'line-through opacity-60' : ''}
                        `}
                        style={{
                          backgroundColor: STATUS_COLORS[item.status] + '18',
                          color: STATUS_COLORS[item.status],
                          borderLeft: `3px solid ${STATUS_COLORS[item.status]}`,
                        }}
                      >
                        {item.is_long_form && (
                          <span
                            className="flex-shrink-0 text-[9px] font-bold px-1 rounded"
                            style={{ backgroundColor: STATUS_COLORS[item.status] + '30' }}
                          >
                            LF
                          </span>
                        )}
                        {formatInfo && (
                          <span
                            className="flex-shrink-0 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: formatInfo.color }}
                          />
                        )}
                        <span className="truncate">
                          {item.title.length > 20 ? item.title.slice(0, 20) + '...' : item.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-surface rounded-[var(--radius-card-lg)] shadow-[var(--shadow-modal)] p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center
                           text-text-tertiary hover:text-text-primary hover:bg-border-light transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Status badge */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="badge text-white text-xs"
                  style={{ backgroundColor: STATUS_COLORS[selectedItem.status] }}
                >
                  {STATUS_LABELS[selectedItem.status]}
                </span>
                {selectedItem.is_long_form && (
                  <span className="badge bg-primary-50 text-primary text-xs">Long Format</span>
                )}
                {selectedItem.format_tag && selectedItem.format_tag in FORMAT_TAGS && (
                  <span
                    className="badge text-white text-xs"
                    style={{
                      backgroundColor: FORMAT_TAGS[selectedItem.format_tag as keyof typeof FORMAT_TAGS].color,
                    }}
                  >
                    {FORMAT_TAGS[selectedItem.format_tag as keyof typeof FORMAT_TAGS].label}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="font-[var(--font-clash)] text-xl font-semibold text-text-primary mb-4">
                {selectedItem.title}
              </h3>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mb-0.5">Date prevue</p>
                  <p className="text-sm text-text-primary font-[var(--font-satoshi)] font-medium">
                    {selectedItem.planned_date ? formatDate(selectedItem.planned_date) : 'Non definie'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mb-0.5">Creee le</p>
                  <p className="text-sm text-text-primary font-[var(--font-satoshi)] font-medium">
                    {formatDate(selectedItem.created_at)}
                  </p>
                </div>
              </div>

              {/* Platforms */}
              <div className="mb-4">
                <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mb-1.5">Plateformes</p>
                <div className="flex items-center gap-2">
                  {selectedItem.platforms.map((p) => (
                    <span
                      key={p}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-border-light text-text-secondary text-xs font-[var(--font-satoshi)] font-medium capitalize"
                    >
                      {platformIcon(p)}
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedItem.notes && (
                <div>
                  <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mb-1">Notes</p>
                  <p className="text-sm text-text-secondary font-[var(--font-satoshi)] leading-relaxed bg-border-light/50 rounded-lg p-3">
                    {selectedItem.notes}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
