import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import DropZone from './components/DropZone'
import ImportHistory from './components/ImportHistory'
import { mockImportHistory } from './mockData'

export default function Import() {
  const [files, setFiles] = useState<File[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState(false)

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    setImportSuccess(false)
    setFiles((prev) => {
      const combined = [...prev, ...newFiles]
      return combined.slice(0, 3)
    })
  }, [])

  const handleFileRemoved = useCallback((index: number) => {
    setImportSuccess(false)
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleImport = useCallback(() => {
    setIsImporting(true)
    // Simulate import
    setTimeout(() => {
      setIsImporting(false)
      setImportSuccess(true)
      setFiles([])
    }, 2000)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 sm:gap-10"
    >
      {/* Page title */}
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="title-display text-text-primary"
      >
        IMPORT CSV
      </motion.h1>

      {/* Drop zone section */}
      <DropZone
        files={files}
        onFilesAdded={handleFilesAdded}
        onFileRemoved={handleFileRemoved}
        isImporting={isImporting}
        importSuccess={importSuccess}
        onImport={handleImport}
      />

      {/* Import history */}
      <ImportHistory imports={mockImportHistory} />
    </motion.div>
  )
}
