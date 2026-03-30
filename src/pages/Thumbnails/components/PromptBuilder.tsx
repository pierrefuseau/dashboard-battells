import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, ChevronDown, Sparkles } from 'lucide-react'
import { FORMAT_TAGS } from '@/lib/constants'
import { buildPrompt } from '@/lib/thumbnail-templates'
import type { ThumbnailTemplate, ThumbnailPlatform, ThumbnailQuality, GenerateThumbnailRequest } from '@/types/thumbnails'

const EMOTIONS = ['choque', 'emerveille', 'affame', 'degoute', 'excite', 'suspicieux', 'impressionne']

interface PromptBuilderProps {
  template: ThumbnailTemplate | null
  platform: ThumbnailPlatform
  onGenerate: (req: GenerateThumbnailRequest) => void
  loading: boolean
  initialTitle?: string
  initialFormat?: string
}

export default function PromptBuilder({
  template,
  platform,
  onGenerate,
  loading,
  initialTitle = '',
  initialFormat = '',
}: PromptBuilderProps) {
  const [title, setTitle] = useState(initialTitle)
  const [subject, setSubject] = useState('')
  const [emotion, setEmotion] = useState('')
  const [formatTag, setFormatTag] = useState(initialFormat)
  const [quality, setQuality] = useState<ThumbnailQuality>('2K')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const previewPrompt = template
    ? buildPrompt(template.id, {
        title: title || 'BATTELLS',
        subject: subject || '[ton plat ici]',
        emotion: emotion || 'shocked',
      })
    : ''

  const handleGenerate = () => {
    if (!template || !subject.trim()) return

    const req: GenerateThumbnailRequest = {
      template_id: template.id,
      title: title || undefined,
      subject,
      platform,
      quality,
      format_tag: formatTag || undefined,
      custom_prompt: showAdvanced && customPrompt.trim() ? customPrompt : undefined,
    }

    onGenerate(req)
  }

  if (!template) {
    return (
      <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5">
        <div className="text-center py-8 text-text-tertiary text-sm font-[var(--font-satoshi)]">
          <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary/40" />
          Selectionne un template pour commencer
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-4">
      <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
        Personnalise
      </h2>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Titre de la video
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: J'ai teste le restaurant le plus cher de Paris"
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-2.5 text-text-primary font-[var(--font-satoshi)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Plat / Sujet *
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ex: burger geant au foie gras, pizza 4 fromages, sushi"
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-2.5 text-text-primary font-[var(--font-satoshi)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Emotion (for challenge/reaction templates) */}
      {template.category === 'challenge' && (
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
            Emotion
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmotion(emotion === e ? '' : e)}
                className={`px-3 py-1 rounded-full text-xs font-bold font-[var(--font-clash)] transition-all ${
                  emotion === e
                    ? 'bg-primary/15 text-primary'
                    : 'bg-page text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Format tag + Quality row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
            Format
          </label>
          <select
            value={formatTag}
            onChange={(e) => setFormatTag(e.target.value)}
            className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-3 py-2 text-text-primary font-[var(--font-satoshi)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Aucun</option>
            {Object.entries(FORMAT_TAGS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
            Qualite
          </label>
          <div className="flex gap-2">
            {(['1K', '2K'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`flex-1 py-2 rounded-[var(--radius-input)] text-xs font-bold font-[var(--font-clash)] transition-all ${
                  quality === q
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-page text-text-tertiary border border-border/60 hover:text-text-secondary'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced prompt toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary font-[var(--font-clash)] transition-colors"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        Prompt avance
      </button>

      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <textarea
              value={customPrompt || previewPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
              className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-3 text-text-primary font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-[10px] text-text-tertiary mt-1 font-[var(--font-satoshi)]">
              Modifie le prompt genere ou ecris le tien. Ce prompt sera envoye directement a Gemini.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGenerate}
        disabled={loading || !subject.trim()}
        className={`w-full py-3 rounded-xl font-bold font-[var(--font-clash)] text-sm flex items-center justify-center gap-2 transition-all ${
          loading || !subject.trim()
            ? 'bg-border/30 text-text-tertiary cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20 hover:shadow-primary/30'
        }`}
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            Generation en cours...
          </>
        ) : (
          <>
            <Rocket className="w-4 h-4" />
            Generer la miniature
          </>
        )}
      </motion.button>
    </div>
  )
}
