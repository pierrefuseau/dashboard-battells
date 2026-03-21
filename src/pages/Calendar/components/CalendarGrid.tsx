import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ContentCalendarItem } from '@/types/database'
import { FORMAT_TAGS } from '@/lib/constants'

interface CalendarGridProps {
  month: number // 1-12
  year: number
  items: ContentCalendarItem[]
  onDayClick: (date: string) => void
  onItemClick: (item: ContentCalendarItem) => void
  today: string // YYYY-MM-DD
}

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const

const STATUS_DOTS: Record<string, string> = {
  idea: '#9CA3AF',
  planned: '#3B82F6',
  scripted: '#8B5CF6',
  filmed: '#F59E0B',
  editing: '#EC4899',
  scheduled: '#06B6D4',
  published: '#43A047',
  cancelled: '#E53935',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month - 1, 1).getDay()
  return day === 0 ? 6 : day - 1 // Monday = 0
}

export default function CalendarGrid({ month, year, items, onDayClick, onItemClick, today }: CalendarGridProps) {
  const { weeks } = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfWeek(year, month)
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const cellsArr: (number | null)[] = []

    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDay + 1
      cellsArr.push(day >= 1 && day <= daysInMonth ? day : null)
    }

    const weeksArr: (number | null)[][] = []
    for (let i = 0; i < cellsArr.length; i += 7) {
      weeksArr.push(cellsArr.slice(i, i + 7))
    }

    return { weeks: weeksArr }
  }, [month, year])

  const itemsByDate = useMemo(() => {
    const map: Record<string, ContentCalendarItem[]> = {}
    items.forEach((item) => {
      if (item.planned_date) {
        const key = item.planned_date
        if (!map[key]) map[key] = []
        map[key].push(item)
      }
    })
    return map
  }, [items])

  return (
    <div className="overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS_FR.map((d) => (
          <div
            key={d}
            className="text-center text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="flex flex-col gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day, di) => {
              if (day === null) {
                return <div key={di} className="min-h-[80px] sm:min-h-[100px]" />
              }

              const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayItems = itemsByDate[dateStr] || []
              const isToday = dateStr === today
              const isPast = dateStr < today

              return (
                <motion.div
                  key={di}
                  className={`
                    min-h-[80px] sm:min-h-[100px] rounded-[var(--radius-input)] p-1.5 sm:p-2 cursor-pointer
                    transition-all duration-200 group border
                    ${isToday
                      ? 'bg-primary-50 border-primary/30 shadow-sm'
                      : 'bg-surface border-border-light hover:border-primary/20 hover:shadow-sm'
                    }
                    ${isPast && !isToday ? 'opacity-60' : ''}
                  `}
                  onClick={() => onDayClick(dateStr)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Day number */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                        text-xs font-[var(--font-space-grotesk)] font-semibold
                        ${isToday
                          ? 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center'
                          : 'text-text-secondary'
                        }
                      `}
                    >
                      {day}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[9px] font-[var(--font-bebas)] tracking-wider text-text-tertiary">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  {/* Items */}
                  <AnimatePresence>
                    {dayItems.slice(0, 3).map((item) => {
                      const tag = item.format_tag as keyof typeof FORMAT_TAGS | null
                      const color = tag && FORMAT_TAGS[tag] ? FORMAT_TAGS[tag].color : '#6B7280'

                      return (
                        <motion.button
                          key={item.id}
                          className="w-full text-left mb-0.5 rounded px-1.5 py-0.5 truncate text-[10px] sm:text-[11px] font-[var(--font-satoshi)] font-medium transition-colors"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            borderLeft: `2px solid ${color}`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            onItemClick(item)
                          }}
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 4 }}
                          whileHover={{ x: 2 }}
                        >
                          <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" style={{ backgroundColor: STATUS_DOTS[item.status] }} />
                          {item.title}
                        </motion.button>
                      )
                    })}
                  </AnimatePresence>
                  {dayItems.length > 3 && (
                    <span className="text-[9px] text-text-tertiary font-[var(--font-satoshi)] pl-1">
                      +{dayItems.length - 3} de plus
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
