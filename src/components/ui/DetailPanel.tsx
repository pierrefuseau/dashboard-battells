import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface DetailPanelProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

export default function DetailPanel({ isOpen, onClose, children }: DetailPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — no pointer blocking so cards behind remain clickable */}
          <motion.div
            className="fixed inset-0 bg-black/20 z-[calc(var(--z-panel)-1)] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.aside
            className="fixed top-0 right-0 h-full bg-surface shadow-[var(--shadow-panel-left)] z-[var(--z-panel)] overflow-y-auto"
            style={{ width: 'var(--spacing-detail-panel)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-[var(--radius-button)] text-text-secondary hover:text-text-primary hover:bg-border-light transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
            <div className="p-6 pt-14">
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
