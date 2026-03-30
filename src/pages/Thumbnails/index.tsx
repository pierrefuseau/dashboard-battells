import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brush } from 'lucide-react'
import { useThumbnailGenerator } from '@/hooks/useThumbnailGenerator'
import type { ThumbnailTemplate, ThumbnailPlatform, GenerateThumbnailRequest } from '@/types/thumbnails'
import TemplateSelector from './components/TemplateSelector'
import PromptBuilder from './components/PromptBuilder'
import GenerationPreview from './components/GenerationPreview'
import ThumbnailHistory from './components/ThumbnailHistory'

export default function Thumbnails() {
  const [searchParams] = useSearchParams()
  const { result, history, loading, historyLoading, error, generate, fetchHistory, toggleFavorite, deleteGeneration } = useThumbnailGenerator()

  const [selectedTemplate, setSelectedTemplate] = useState<ThumbnailTemplate | null>(null)
  const [platform, setPlatform] = useState<ThumbnailPlatform>('youtube')
  const [lastRequest, setLastRequest] = useState<GenerateThumbnailRequest | null>(null)

  const initialTitle = searchParams.get('title') ? decodeURIComponent(searchParams.get('title')!) : ''
  const initialFormat = searchParams.get('format') || ''

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleGenerate = useCallback(async (req: GenerateThumbnailRequest) => {
    setLastRequest(req)
    await generate(req)
  }, [generate])

  const handleRegenerate = useCallback(() => {
    if (lastRequest) generate(lastRequest)
  }, [lastRequest, generate])

  const handleVary = useCallback(() => {
    if (lastRequest) {
      generate({ ...lastRequest, custom_prompt: undefined })
    }
  }, [lastRequest, generate])

  const handleSelectFromHistory = useCallback((_item: typeof history[number]) => {
    // Could expand to show detail in preview
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Brush className="w-7 h-7" />
        </div>
        <div>
          <h1 className="title-display text-text-primary">L'ATELIER MINIATURES</h1>
          <p className="text-sm text-text-tertiary font-[var(--font-satoshi)]">
            Generateur de miniatures IA — YouTube & TikTok
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <TemplateSelector
        selected={selectedTemplate}
        onSelect={setSelectedTemplate}
        platformFilter={platform}
        onPlatformChange={setPlatform}
      />

      {/* Two-column layout: Prompt Builder + Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PromptBuilder
          template={selectedTemplate}
          platform={platform}
          onGenerate={handleGenerate}
          loading={loading}
          initialTitle={initialTitle}
          initialFormat={initialFormat}
        />

        <GenerationPreview
          result={result}
          loading={loading}
          error={error}
          onRegenerate={handleRegenerate}
          onVary={handleVary}
        />
      </div>

      {/* History */}
      <ThumbnailHistory
        history={history}
        loading={historyLoading}
        onSelect={handleSelectFromHistory}
        onToggleFavorite={toggleFavorite}
        onDelete={deleteGeneration}
      />
    </motion.div>
  )
}
