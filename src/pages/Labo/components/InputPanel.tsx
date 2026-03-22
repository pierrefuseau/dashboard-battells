import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, FlaskConical, Check } from 'lucide-react'
import { FORMAT_TAGS } from '@/lib/constants'
import type { OptimizeTitleRequest, OptimizeTitleResponse, TitleOptimization, TitleVariant } from '@/types/database'

const CONTENT_TYPES = ['Recette', 'Defi', 'Reaction', 'Vlog', 'Storytelling', 'Review', 'Mukbang', 'Street Food', 'Challenge 24h']
const PLATFORMS = ['youtube', 'tiktok', 'instagram'] as const

const STYLE_LABELS: Record<string, { label: string; color: string }> = {
  emotional: { label: 'Emotionnel', color: 'bg-red-500/20 text-red-400' },
  seo: { label: 'SEO', color: 'bg-blue-500/20 text-blue-400' },
  clickbait: { label: 'Clickbait', color: 'bg-yellow-500/20 text-yellow-400' },
  narrative: { label: 'Narratif', color: 'bg-purple-500/20 text-purple-400' },
  minimal: { label: 'Minimal', color: 'bg-green-500/20 text-green-400' },
}

interface InputPanelProps {
  formData: OptimizeTitleRequest
  onChange: (data: OptimizeTitleRequest) => void
  onOptimize: () => void
  onSelectVariant: (title: string) => void
  onAbTest: (titles: string[]) => void
  result: OptimizeTitleResponse | null
  abTestResult: TitleOptimization['ab_test_result']
  loading: boolean
}

export default function InputPanel({
  formData, onChange, onOptimize, onSelectVariant, onAbTest,
  result, abTestResult, loading,
}: InputPanelProps) {
  const [abSelected, setAbSelected] = useState<Set<number>>(new Set())

  const titleLength = formData.title.length
  const titleColor = titleLength === 0 ? 'text-text-tertiary'
    : titleLength <= 50 ? 'text-success'
    : titleLength <= 65 ? 'text-success'
    : titleLength <= 80 ? 'text-warning'
    : 'text-error'

  const togglePlatform = (p: string) => {
    const platforms = formData.platforms.includes(p)
      ? formData.platforms.filter((x) => x !== p)
      : [...formData.platforms, p]
    if (platforms.length > 0) onChange({ ...formData, platforms })
  }

  const toggleAbSelect = (idx: number) => {
    const next = new Set(abSelected)
    if (next.has(idx)) next.delete(idx)
    else if (next.size < 3) next.add(idx)
    setAbSelected(next)
  }

  const handleAbTest = () => {
    if (!result) return
    const titles = [...abSelected].map((i) => result.variants[i]?.title).filter(Boolean)
    if (titles.length >= 2) onAbTest(titles)
  }

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-5 overflow-y-auto max-h-[75vh]">
      <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
        Input
      </h2>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Titre de la video
        </label>
        <textarea
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          placeholder="Ex: J'ai teste le restaurant le plus cher de Paris..."
          rows={2}
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-3 text-text-primary font-[var(--font-satoshi)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs font-mono ${titleColor}`}>
            {titleLength} caracteres
          </span>
          <span className="text-xs text-text-tertiary">
            {titleLength <= 50 ? 'Court' : titleLength <= 65 ? 'Ideal' : titleLength <= 80 ? 'Long' : 'Trop long'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Description (optionnel)
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Description brute ou notes..."
          rows={3}
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-3 text-text-primary font-[var(--font-satoshi)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Format + Content Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">Format</label>
          <select
            value={formData.format_tag || ''}
            onChange={(e) => onChange({ ...formData, format_tag: e.target.value })}
            className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-3 py-2 text-sm text-text-primary font-[var(--font-satoshi)]"
          >
            <option value="">Tous</option>
            {Object.entries(FORMAT_TAGS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">Type</label>
          <select
            value={formData.content_type || ''}
            onChange={(e) => onChange({ ...formData, content_type: e.target.value })}
            className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-3 py-2 text-sm text-text-primary font-[var(--font-satoshi)]"
          >
            <option value="">Non precise</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t.toLowerCase()}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-2 block">Plateformes</label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={`px-3 py-1.5 text-xs font-bold font-[var(--font-clash)] rounded-[var(--radius-button)] border transition-all ${
                formData.platforms.includes(p)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-page text-text-secondary border-border/60 hover:border-primary/40'
              }`}
            >
              {p === 'youtube' ? 'YouTube' : p === 'tiktok' ? 'TikTok' : 'Instagram'}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Mot-cle SEO (optionnel)
        </label>
        <input
          type="text"
          value={formData.keyword || ''}
          onChange={(e) => onChange({ ...formData, keyword: e.target.value })}
          placeholder="Ex: recette, air fryer, street food..."
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-2.5 text-sm text-text-primary font-[var(--font-satoshi)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Gustavo toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => onChange({ ...formData, has_gustavo: !formData.has_gustavo })}
          className={`w-10 h-6 rounded-full transition-all relative ${
            formData.has_gustavo ? 'bg-primary' : 'bg-border'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            formData.has_gustavo ? 'translate-x-5' : 'translate-x-1'
          }`} />
        </div>
        <span className="text-sm text-text-secondary font-[var(--font-satoshi)]">Gustavo present</span>
      </label>

      {/* Optimize button */}
      <button
        onClick={onOptimize}
        disabled={loading || !formData.title.trim()}
        className="w-full py-3 rounded-[var(--radius-button)] bg-primary text-white font-bold font-[var(--font-clash)] text-sm shadow-[var(--shadow-glow)] hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'Analyse en cours...' : 'Optimiser'}
      </button>

      {/* Variants */}
      <AnimatePresence>
        {result && result.variants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                Variantes IA
              </h3>
              <button onClick={onOptimize} className="text-xs text-primary hover:text-primary-dark flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Regenerer
              </button>
            </div>
            {result.variants.map((v: TitleVariant, i: number) => {
              const style = STYLE_LABELS[v.style] || STYLE_LABELS.emotional
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectVariant(v.title)}
                  className="w-full text-left p-3 rounded-xl border border-border/40 bg-page hover:border-primary/40 hover:bg-primary-50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-text-primary font-[var(--font-satoshi)] leading-snug flex-1">
                      {v.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.color}`}>
                        {style.label}
                      </span>
                      <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-primary">
                        {v.score}
                      </span>
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleAbSelect(i) }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                          abSelected.has(i) ? 'bg-primary border-primary' : 'border-border hover:border-primary/60'
                        }`}
                      >
                        {abSelected.has(i) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">{v.reasoning}</p>
                </motion.button>
              )
            })}

            {abSelected.size >= 2 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleAbTest}
                disabled={loading}
                className="w-full py-2.5 rounded-[var(--radius-button)] bg-dark text-white font-bold font-[var(--font-clash)] text-xs flex items-center justify-center gap-2 hover:bg-dark-secondary transition-all"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                A/B Test Predictif ({abSelected.size} titres)
              </motion.button>
            )}

            {abTestResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-dark text-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold font-[var(--font-clash)] text-primary">
                    Gagnant predit — {abTestResult.confidence}% de confiance
                  </span>
                </div>
                <p className="text-sm font-[var(--font-satoshi)] text-white/80">
                  {abTestResult.reasoning}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
