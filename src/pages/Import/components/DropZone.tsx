import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, CheckCircle, X, Loader2, FileText } from 'lucide-react'

interface DropZoneProps {
  files: File[]
  onFilesAdded: (files: File[]) => void
  onFileRemoved: (index: number) => void
  isImporting: boolean
  importSuccess: boolean
  onImport: () => void
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(1)} Ko`
  return `${bytes} o`
}

export default function DropZone({
  files,
  onFilesAdded,
  onFileRemoved,
  isImporting,
  importSuccess,
  onImport,
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const csvFiles = Array.from(incoming).filter(
        (f) => f.name.endsWith('.csv') || f.type === 'text/csv'
      )
      const remaining = 3 - files.length
      if (remaining <= 0) return
      onFilesAdded(csvFiles.slice(0, remaining))
    },
    [files.length, onFilesAdded]
  )

  const onDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setIsDragging(false)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setIsDragging(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const onClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files)
        e.target.value = ''
      }
    },
    [handleFiles]
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="flex flex-col items-center gap-5"
    >
      {/* Drop zone */}
      <motion.div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onClick}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? '#FF6B00' : '#FF6B00',
          backgroundColor: isDragging ? '#FFE0C2' : '#FFF3E8',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-2xl cursor-pointer rounded-2xl border-2 border-dashed border-primary px-8 py-16 text-center transition-colors"
        style={{
          borderStyle: isDragging ? 'solid' : 'dashed',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={onInputChange}
          className="hidden"
        />

        <motion.div
          animate={{ y: isDragging ? -4 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{
              scale: isDragging ? 1.15 : 1,
              rotate: isDragging ? -8 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CloudUpload className="text-primary" size={48} strokeWidth={1.5} />
          </motion.div>

          <p className="font-[var(--font-satoshi)] text-base font-medium text-text-primary">
            Depose tes fichiers CSV YouTube Studio ici
          </p>
          <p className="font-[var(--font-satoshi)] text-sm text-text-tertiary">
            ou clique pour parcourir — 3 fichiers maximum
          </p>
        </motion.div>

        {/* Drag overlay glow */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(255,107,0,0.08) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* File pills */}
      <AnimatePresence mode="popLayout">
        {files.map((file, i) => (
          <motion.div
            key={`${file.name}-${file.size}`}
            layout
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex w-full max-w-2xl items-center gap-3 rounded-[var(--radius-button)] border border-border bg-surface px-4 py-3 shadow-[var(--shadow-card)]"
          >
            <FileText className="text-primary shrink-0" size={20} />
            <span className="flex-1 truncate font-[var(--font-mono)] text-sm text-text-primary">
              {file.name}
            </span>
            <span className="font-[var(--font-space-grotesk)] text-xs text-text-tertiary">
              {formatFileSize(file.size)}
            </span>
            <CheckCircle className="text-success shrink-0" size={18} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onFileRemoved(i)
              }}
              className="shrink-0 rounded-full p-1 text-text-tertiary transition-colors hover:bg-error-50 hover:text-error"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Action button */}
      <AnimatePresence mode="wait">
        {importSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 rounded-[var(--radius-button)] bg-success-50 px-6 py-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
            >
              <CheckCircle className="text-success" size={20} />
            </motion.div>
            <span className="font-[var(--font-satoshi)] font-medium text-success-dark">
              Import reussi !
            </span>
          </motion.div>
        ) : files.length > 0 ? (
          <motion.button
            key="import"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onImport}
            disabled={isImporting}
            className="btn-primary flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Import en cours...</span>
              </>
            ) : (
              <span>
                Importer {files.length} fichier{files.length > 1 ? 's' : ''}
              </span>
            )}
          </motion.button>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
