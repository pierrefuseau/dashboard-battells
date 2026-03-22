import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import { useTitleOptimizer, useTitlePatterns } from '@/hooks'
import type { OptimizeTitleRequest } from '@/types/database'
import InputPanel from './components/InputPanel'
import IntelligencePanel from './components/IntelligencePanel'
import OutputPanel from './components/OutputPanel'
import HistoryTable from './components/HistoryTable'

export default function Labo() {
  const [searchParams] = useSearchParams()
  const { result, history, loading, historyLoading, error, optimize, runAbTest, abTestResult, fetchHistory } = useTitleOptimizer()
  const { patterns, loading: patternsLoading } = useTitlePatterns()

  const [formData, setFormData] = useState<OptimizeTitleRequest>({
    title: '',
    description: '',
    format_tag: '',
    content_type: '',
    platforms: ['youtube'],
    keyword: '',
    has_gustavo: false,
  })

  useEffect(() => {
    const title = searchParams.get('title')
    const ideaId = searchParams.get('idea_id')
    const calendarId = searchParams.get('calendar_id')
    const format = searchParams.get('format')

    if (title) {
      setFormData((prev) => ({
        ...prev,
        title: decodeURIComponent(title),
        video_idea_id: ideaId ? Number(ideaId) : undefined,
        calendar_item_id: calendarId ? Number(calendarId) : undefined,
        format_tag: format || prev.format_tag,
      }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleOptimize = useCallback(async () => {
    if (!formData.title.trim()) return
    await optimize(formData)
  }, [formData, optimize])

  const handleSelectVariant = useCallback((title: string) => {
    setFormData((prev) => ({ ...prev, title }))
  }, [])

  const handleAbTest = useCallback(async (titles: string[]) => {
    await runAbTest(titles)
  }, [runAbTest])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <FlaskConical className="w-7 h-7" />
        </div>
        <div>
          <h1 className="title-display text-text-primary">LE LABO</h1>
          <p className="text-sm text-text-tertiary font-[var(--font-satoshi)]">
            Title & Description Optimizer — Optimise chaque mot pour maximiser l'impact
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 min-h-[70vh]">
        <InputPanel
          formData={formData}
          onChange={setFormData}
          onOptimize={handleOptimize}
          onSelectVariant={handleSelectVariant}
          onAbTest={handleAbTest}
          result={result}
          abTestResult={abTestResult}
          loading={loading}
        />
        <IntelligencePanel
          result={result}
          patterns={patterns}
          patternsLoading={patternsLoading}
          loading={loading}
        />
        <OutputPanel
          result={result}
          formData={formData}
          loading={loading}
        />
      </div>

      <HistoryTable
        history={history}
        loading={historyLoading}
        onSelect={(opt) => setFormData((prev) => ({
          ...prev,
          title: opt.original_title,
        }))}
      />

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-error text-white px-6 py-3 rounded-xl shadow-[var(--shadow-toast)] font-[var(--font-satoshi)] text-sm z-50"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  )
}
