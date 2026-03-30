import { motion, AnimatePresence } from 'framer-motion'
import { Download, RefreshCw, Shuffle, Heart, Copy, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { GenerateThumbnailResponse } from '@/types/thumbnails'

interface GenerationPreviewProps {
  result: GenerateThumbnailResponse | null
  loading: boolean
  error: string | null
  onRegenerate: () => void
  onVary: () => void
  onToggleFavorite?: () => void
}

const LOADING_MESSAGES = [
  'La DINGUERIE se prepare...',
  'Un BANGER en approche...',
  'MAGNIFICUS en generation...',
  'La MACHINE tourne...',
  'Un MONSTRE arrive...',
]

export default function GenerationPreview({
  result,
  loading,
  error,
  onRegenerate,
  onVary,
  onToggleFavorite,
}: GenerationPreviewProps) {
  const [showPrompt, setShowPrompt] = useState(false)
  const [loadingMsg] = useState(() =>
    LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]
  )

  if (!result && !loading && !error) {
    return null
  }

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-4">
      <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
        Resultat
      </h2>

      {/* Loading state */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="text-3xl">🎨</span>
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-bold font-[var(--font-clash)] text-primary">
                {loadingMsg}
              </p>
              <p className="text-xs text-text-tertiary font-[var(--font-satoshi)] mt-1">
                ~10-15 secondes
              </p>
            </div>
            <motion.div
              className="w-48 h-1 bg-border/30 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '90%' }}
                transition={{ duration: 12, ease: 'easeOut' }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-sm text-error font-[var(--font-satoshi)]">{error}</p>
            <button
              onClick={onRegenerate}
              className="mt-3 text-xs text-primary hover:text-primary-hover font-[var(--font-clash)] font-bold"
            >
              Reessayer
            </button>
          </motion.div>
        )}

        {/* Result */}
        {result && !loading && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Image */}
            <div className="relative rounded-xl overflow-hidden border border-border/40 bg-page">
              <img
                src={result.image_url}
                alt="Miniature generee"
                className="w-full object-contain"
              />
              <div className="absolute top-2 right-2 flex gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white font-bold font-[var(--font-clash)]">
                  {result.platform === 'youtube' ? '16:9' : '9:16'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <ActionButton
                icon={<Download className="w-3.5 h-3.5" />}
                label="Telecharger"
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = result.image_url
                  link.download = `battells-thumbnail-${Date.now()}.png`
                  link.click()
                }}
                primary
              />
              <ActionButton
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                label="Regenerer"
                onClick={onRegenerate}
              />
              <ActionButton
                icon={<Shuffle className="w-3.5 h-3.5" />}
                label="Varier"
                onClick={onVary}
              />
              {onToggleFavorite && (
                <ActionButton
                  icon={<Heart className="w-3.5 h-3.5" />}
                  label="Favori"
                  onClick={onToggleFavorite}
                />
              )}
            </div>

            {/* Prompt used */}
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center gap-2 text-xs text-text-tertiary hover:text-text-secondary font-[var(--font-clash)] transition-colors"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPrompt ? 'rotate-180' : ''}`} />
              Prompt utilise
            </button>
            <AnimatePresence>
              {showPrompt && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="relative bg-page rounded-lg p-3 border border-border/40">
                    <p className="text-xs text-text-secondary font-mono leading-relaxed pr-8">
                      {result.prompt_used}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.prompt_used)}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-surface-alt/50 text-text-tertiary hover:text-text-secondary transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ActionButton({
  icon,
  label,
  onClick,
  primary = false,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold font-[var(--font-clash)] transition-all ${
        primary
          ? 'bg-primary text-white hover:bg-primary-hover'
          : 'bg-page border border-border/60 text-text-secondary hover:text-text-primary hover:border-primary/30'
      }`}
    >
      {icon}
      {label}
    </motion.button>
  )
}
