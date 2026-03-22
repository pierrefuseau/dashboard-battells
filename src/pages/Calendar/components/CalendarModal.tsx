import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, FlaskConical } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ContentCalendarItem } from '@/types/database'
import { FORMAT_TAGS } from '@/lib/constants'

type CalendarStatus = ContentCalendarItem['status']

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Omit<ContentCalendarItem, 'id' | 'created_at'>) => Promise<void>
  onUpdate: (id: number, updates: Partial<ContentCalendarItem>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  editItem?: ContentCalendarItem | null
  defaultDate?: string
}

const STATUS_OPTIONS: { value: CalendarStatus; label: string; color: string }[] = [
  { value: 'idea', label: 'Idée', color: '#9CA3AF' },
  { value: 'planned', label: 'Planifié', color: '#3B82F6' },
  { value: 'scripted', label: 'Scripté', color: '#8B5CF6' },
  { value: 'filmed', label: 'Tourné', color: '#F59E0B' },
  { value: 'editing', label: 'Montage', color: '#EC4899' },
  { value: 'scheduled', label: 'Programmé', color: '#06B6D4' },
  { value: 'published', label: 'Publié', color: '#43A047' },
  { value: 'cancelled', label: 'Annulé', color: '#E53935' },
]

const PLATFORM_OPTIONS = ['youtube', 'tiktok', 'instagram'] as const

export default function CalendarModal({
  isOpen, onClose, onSave, onUpdate, onDelete, editItem, defaultDate,
}: CalendarModalProps) {
  const [title, setTitle] = useState('')
  const [formatTag, setFormatTag] = useState<string>('other')
  const [isLongForm, setIsLongForm] = useState(true)
  const [plannedDate, setPlannedDate] = useState('')
  const [status, setStatus] = useState<CalendarStatus>('idea')
  const [notes, setNotes] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['youtube'])
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title)
      setFormatTag(editItem.format_tag || 'other')
      setIsLongForm(editItem.is_long_form)
      setPlannedDate(editItem.planned_date || '')
      setStatus(editItem.status)
      setNotes(editItem.notes || '')
      setPlatforms(editItem.platforms || ['youtube'])
    } else {
      setTitle('')
      setFormatTag('other')
      setIsLongForm(true)
      setPlannedDate(defaultDate || '')
      setStatus('idea')
      setNotes('')
      setPlatforms(['youtube'])
    }
  }, [editItem, defaultDate, isOpen])

  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      if (editItem) {
        await onUpdate(editItem.id, {
          title: title.trim(),
          format_tag: formatTag,
          is_long_form: isLongForm,
          planned_date: plannedDate || null,
          status,
          notes: notes.trim() || null,
          platforms,
        })
      } else {
        await onSave({
          title: title.trim(),
          format_tag: formatTag,
          is_long_form: isLongForm,
          planned_date: plannedDate || null,
          status,
          youtube_video_id: null,
          notes: notes.trim() || null,
          platforms,
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!editItem) return
    setSaving(true)
    try {
      await onDelete(editItem.id)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-[var(--z-modal)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-surface rounded-[var(--radius-card-lg)] shadow-[var(--shadow-modal)] w-full max-w-lg max-h-[85vh] overflow-y-auto"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h2 className="text-lg font-bold font-[var(--font-clash)] text-text-primary">
                  {editItem ? 'Modifier le contenu' : 'Nouveau contenu'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-border-light transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                    TITRE
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Ramen de Naruto en 24h"
                    className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Date + Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                      DATE
                    </label>
                    <input
                      type="date"
                      value={plannedDate}
                      onChange={(e) => setPlannedDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                      STATUT
                    </label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as CalendarStatus)}
                        className="w-full h-10 px-3 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none appearance-none transition-all"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Format tag */}
                <div>
                  <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                    FORMAT
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(FORMAT_TAGS).map(([key, { label, color }]) => (
                      <button
                        key={key}
                        onClick={() => setFormatTag(key)}
                        className="badge transition-all duration-150"
                        style={{
                          backgroundColor: formatTag === key ? `${color}25` : 'transparent',
                          color: formatTag === key ? color : 'var(--color-text-tertiary)',
                          border: `1.5px solid ${formatTag === key ? color : 'var(--color-border)'}`,
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Long form toggle + Platforms */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                      DURÉE
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsLongForm(true)}
                        className={`flex-1 h-9 rounded-[var(--radius-button)] text-xs font-[var(--font-satoshi)] font-medium transition-all ${
                          isLongForm ? 'bg-primary text-white' : 'bg-border-light text-text-secondary hover:bg-border'
                        }`}
                      >
                        Long
                      </button>
                      <button
                        onClick={() => setIsLongForm(false)}
                        className={`flex-1 h-9 rounded-[var(--radius-button)] text-xs font-[var(--font-satoshi)] font-medium transition-all ${
                          !isLongForm ? 'bg-primary text-white' : 'bg-border-light text-text-secondary hover:bg-border'
                        }`}
                      >
                        Short
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                      PLATEFORMES
                    </label>
                    <div className="flex gap-1.5">
                      {PLATFORM_OPTIONS.map((p) => (
                        <button
                          key={p}
                          onClick={() => togglePlatform(p)}
                          className={`h-9 px-3 rounded-[var(--radius-button)] text-xs font-[var(--font-satoshi)] font-medium capitalize transition-all ${
                            platforms.includes(p)
                              ? 'bg-primary/10 text-primary border border-primary/30'
                              : 'bg-border-light text-text-tertiary border border-transparent hover:bg-border'
                          }`}
                        >
                          {p === 'youtube' ? 'YT' : p === 'tiktok' ? 'TK' : 'IG'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-[var(--font-bebas)] tracking-[0.12em] text-text-tertiary mb-1.5">
                    NOTES
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes, liens, idées..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary placeholder:text-text-tertiary focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none transition-all"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-5 border-t border-border">
                <div className="flex items-center gap-2">
                  {editItem && (
                    <button
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex items-center gap-1.5 text-sm text-error hover:text-error-dark font-[var(--font-satoshi)] font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  )}
                  {title.trim() && (
                    <button
                      onClick={() => navigate(`/labo?title=${encodeURIComponent(title.trim())}${editItem ? `&calendar_id=${editItem.id}` : ''}${formatTag && formatTag !== 'other' ? `&format=${formatTag}` : ''}`)}
                      className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-button)] bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-bold font-[var(--font-clash)]"
                    >
                      <FlaskConical className="w-4 h-4" />
                      Le Labo
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={onClose} className="btn-secondary text-sm h-9 px-4">
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!title.trim() || saving}
                    className="btn-primary text-sm h-9 px-5"
                  >
                    {saving ? 'Enregistrement...' : editItem ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
