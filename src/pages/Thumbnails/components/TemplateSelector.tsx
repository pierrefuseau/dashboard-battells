import { useState } from 'react'
import { motion } from 'framer-motion'
import * as Icons from 'lucide-react'
import { THUMBNAIL_CATEGORIES, THUMBNAIL_TEMPLATES } from '@/lib/thumbnail-templates'
import type { ThumbnailTemplate, ThumbnailPlatform } from '@/types/thumbnails'

interface TemplateSelectorProps {
  selected: ThumbnailTemplate | null
  onSelect: (template: ThumbnailTemplate) => void
  platformFilter: ThumbnailPlatform
  onPlatformChange: (platform: ThumbnailPlatform) => void
}

export default function TemplateSelector({
  selected,
  onSelect,
  platformFilter,
  onPlatformChange,
}: TemplateSelectorProps) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = THUMBNAIL_TEMPLATES.filter((t) => {
    const matchCategory = activeCategory === 'all' || t.category === activeCategory
    const matchPlatform = t.platforms.includes(platformFilter)
    return matchCategory && matchPlatform
  })

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
          Choisis ton style
        </h2>
        <div className="flex items-center gap-1 bg-page rounded-full p-1">
          <button
            onClick={() => onPlatformChange('youtube')}
            className={`px-3 py-1 rounded-full text-xs font-bold font-[var(--font-clash)] transition-all ${
              platformFilter === 'youtube'
                ? 'bg-red-500/20 text-red-400'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            YouTube
          </button>
          <button
            onClick={() => onPlatformChange('tiktok')}
            className={`px-3 py-1 rounded-full text-xs font-bold font-[var(--font-clash)] transition-all ${
              platformFilter === 'tiktok'
                ? 'bg-pink-500/20 text-pink-400'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            TikTok
          </button>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {THUMBNAIL_CATEGORIES.map((cat) => {
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[cat.icon]
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-[var(--font-clash)] whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-surface-alt/50'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((template, i) => {
          const isSelected = selected?.id === template.id
          const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[template.icon]

          return (
            <motion.button
              key={template.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect(template)}
              className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                isSelected
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(255,107,0,0.15)]'
                  : 'border-border/40 bg-page hover:border-primary/30 hover:bg-primary/5'
              }`}
            >
              {/* Preview or icon fallback */}
              <div
                className={`w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center ${
                  isSelected ? 'bg-primary/15' : 'bg-surface-alt/30'
                }`}
              >
                <TemplatePreview template={template} Icon={Icon} />
              </div>

              <span className="text-xs font-bold font-[var(--font-clash)] text-text-primary truncate w-full">
                {template.name}
              </span>

              <div className="flex gap-1">
                {template.platforms.map((p) => (
                  <span
                    key={p}
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      p === 'youtube' ? 'bg-red-500/15 text-red-400' : 'bg-pink-500/15 text-pink-400'
                    }`}
                  >
                    {p === 'youtube' ? 'YT' : 'TT'}
                  </span>
                ))}
              </div>

              {isSelected && (
                <motion.div
                  layoutId="template-check"
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                >
                  <Icons.Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-text-tertiary text-sm font-[var(--font-satoshi)]">
          Aucun template disponible pour cette combinaison
        </div>
      )}
    </div>
  )
}

function TemplatePreview({
  template,
  Icon,
}: {
  template: ThumbnailTemplate
  Icon: React.ComponentType<{ className?: string }> | undefined
}) {
  const [imgError, setImgError] = useState(false)

  if (imgError || !template.previewImage) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        {Icon ? <Icon className="w-8 h-8 text-text-tertiary" /> : <span className="text-2xl">🎨</span>}
      </div>
    )
  }

  return (
    <img
      src={template.previewImage}
      alt={template.name}
      className="w-full h-full object-cover"
      onError={() => setImgError(true)}
    />
  )
}
