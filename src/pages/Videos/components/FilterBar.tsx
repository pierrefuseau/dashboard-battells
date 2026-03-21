import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown } from 'lucide-react'
import { FORMAT_TAGS } from '@/lib/constants.ts'

// ── Types ─────────────────────────────────────────────────────
export interface Filters {
  platform: string
  format: string
  type: string
  language: string
  period: string
  search: string
}

export const DEFAULT_FILTERS: Filters = {
  platform: '',
  format: '',
  type: '',
  language: '',
  period: '',
  search: '',
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

// ── Options ───────────────────────────────────────────────────
const PLATFORM_OPTIONS = [
  { value: '', label: 'Toutes les plateformes' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
]

const FORMAT_OPTIONS = [
  { value: '', label: 'Tous les formats' },
  ...Object.entries(FORMAT_TAGS).map(([key, val]) => ({ value: key, label: val.label })),
]

const TYPE_OPTIONS = [
  { value: '', label: 'Tous les types' },
  { value: 'long', label: 'Long-form' },
  { value: 'short', label: 'Short' },
]

const LANGUAGE_OPTIONS = [
  { value: '', label: 'Toutes les langues' },
  { value: 'fr', label: 'Francais' },
  { value: 'en', label: 'English' },
]

const PERIOD_OPTIONS = [
  { value: '', label: 'Toute periode' },
  { value: '7d', label: '7 derniers jours' },
  { value: '30d', label: '30 derniers jours' },
  { value: '90d', label: '90 derniers jours' },
  { value: '1y', label: '1 an' },
]

// ── Select component ──────────────────────────────────────────
function FilterSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-10 pl-3 pr-9 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary cursor-pointer transition-colors hover:border-primary focus:border-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
      />
    </div>
  )
}

// ── Active filter labels ──────────────────────────────────────
function getActiveFilters(filters: Filters): { key: keyof Filters; label: string }[] {
  const active: { key: keyof Filters; label: string }[] = []

  if (filters.platform) {
    const opt = PLATFORM_OPTIONS.find((o) => o.value === filters.platform)
    if (opt) active.push({ key: 'platform', label: opt.label })
  }
  if (filters.format) {
    const fmt = FORMAT_TAGS[filters.format as keyof typeof FORMAT_TAGS]
    if (fmt) active.push({ key: 'format', label: fmt.label })
  }
  if (filters.type) {
    const opt = TYPE_OPTIONS.find((o) => o.value === filters.type)
    if (opt) active.push({ key: 'type', label: opt.label })
  }
  if (filters.language) {
    const opt = LANGUAGE_OPTIONS.find((o) => o.value === filters.language)
    if (opt) active.push({ key: 'language', label: opt.label })
  }
  if (filters.period) {
    const opt = PERIOD_OPTIONS.find((o) => o.value === filters.period)
    if (opt) active.push({ key: 'period', label: opt.label })
  }
  if (filters.search) {
    active.push({ key: 'search', label: `"${filters.search}"` })
  }

  return active
}

// ── Component ─────────────────────────────────────────────────
export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const activeFilters = getActiveFilters(filters)

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value })
  }

  const removeFilter = (key: keyof Filters) => {
    onChange({ ...filters, [key]: '' })
  }

  return (
    <div className="space-y-3">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          options={PLATFORM_OPTIONS}
          value={filters.platform}
          onChange={(v) => update('platform', v)}
        />
        <FilterSelect
          options={FORMAT_OPTIONS}
          value={filters.format}
          onChange={(v) => update('format', v)}
        />
        <FilterSelect
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(v) => update('type', v)}
        />
        <FilterSelect
          options={LANGUAGE_OPTIONS}
          value={filters.language}
          onChange={(v) => update('language', v)}
        />
        <FilterSelect
          options={PERIOD_OPTIONS}
          value={filters.period}
          onChange={(v) => update('period', v)}
        />

        {/* Search input */}
        <div
          className={`relative flex items-center h-10 rounded-[var(--radius-input)] border bg-surface transition-colors ${
            searchFocused ? 'border-primary' : 'border-border'
          }`}
        >
          <Search size={14} className="ml-3 text-text-tertiary" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Rechercher une video..."
            className="h-full px-2 bg-transparent text-sm font-[var(--font-satoshi)] text-text-primary placeholder:text-text-tertiary outline-none w-48"
          />
          {filters.search && (
            <button
              onClick={() => update('search', '')}
              className="mr-2 p-0.5 rounded text-text-tertiary hover:text-text-primary cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Active filter pills */}
      <div className="flex flex-wrap gap-2 min-h-[28px]">
        <AnimatePresence mode="popLayout">
          {activeFilters.map((f) => (
            <motion.button
              key={f.key}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={() => removeFilter(f.key)}
              className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary text-white text-xs font-medium font-[var(--font-satoshi)] cursor-pointer transition-colors hover:bg-primary-dark"
            >
              {f.label}
              <X size={12} />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
