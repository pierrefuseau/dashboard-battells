import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link as LinkIcon } from 'lucide-react'

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => Promise<void>
}

export default function AddLinkModal({ isOpen, onClose, onSubmit }: AddLinkModalProps) {
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = url.trim()
    if (!trimmed) return

    const isValid = /youtube\.com|youtu\.be|tiktok\.com/.test(trimmed)
    if (!isValid) {
      setError('Colle un lien YouTube ou TikTok valide')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setUrl('')
      onClose()
    } catch {
      setError("Erreur lors de l'ajout. Reessaie.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-[var(--z-modal)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-[var(--radius-card-lg)] shadow-[var(--shadow-modal)] z-[var(--z-modal)] p-6"
            initial={{ opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-[var(--radius-button)] text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <LinkIcon size={20} className="text-primary" />
              <h3 className="text-base font-bold font-[var(--font-clash)] text-text-primary">
                Ajouter une video
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou tiktok.com/..."
                  className="w-full h-11 px-4 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                {error && <p className="text-xs text-error mt-1.5">{error}</p>}
              </div>
              <button type="submit" disabled={submitting || !url.trim()} className="btn-primary w-full cursor-pointer">
                {submitting ? 'Analyse en cours...' : 'Analyser et ajouter'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
