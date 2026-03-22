import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Copy, Check, Hash, Zap, FileText, Youtube, Instagram } from 'lucide-react'
import type { OptimizeTitleRequest, OptimizeTitleResponse } from '@/types/database'

type PreviewTab = 'yt-search' | 'yt-home' | 'tiktok' | 'instagram'

interface OutputPanelProps {
  result: OptimizeTitleResponse | null
  formData: OptimizeTitleRequest
  loading: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="text-text-tertiary hover:text-primary transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function YouTubeSearchPreview({ title }: { title: string }) {
  const truncated = title.length > 70 ? title.slice(0, 70) + '...' : title
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white border border-border/30">
      <div className="w-40 h-[90px] bg-dark/10 rounded-lg flex items-center justify-center text-text-tertiary shrink-0">
        <Youtube className="w-8 h-8 opacity-20" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#030303] leading-snug line-clamp-2 font-[Arial,sans-serif]">
          {truncated}
        </p>
        <p className="text-[11px] text-[#606060] mt-1">BATTELLS</p>
        <p className="text-[11px] text-[#606060]">1,2M vues · il y a 2 jours</p>
      </div>
    </div>
  )
}

function YouTubeHomePreview({ title }: { title: string }) {
  const truncated = title.length > 60 ? title.slice(0, 60) + '...' : title
  return (
    <div className="rounded-lg overflow-hidden border border-border/30 bg-white">
      <div className="w-full h-36 bg-dark/10 flex items-center justify-center text-text-tertiary">
        <Youtube className="w-12 h-12 opacity-20" />
      </div>
      <div className="p-3 flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">B</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#030303] leading-snug line-clamp-2 font-[Arial,sans-serif]">
            {truncated}
          </p>
          <p className="text-[11px] text-[#606060] mt-0.5">BATTELLS · 1,2M vues · il y a 2 jours</p>
        </div>
      </div>
    </div>
  )
}

function TikTokPreview({ title, hashtags }: { title: string; hashtags: string[] }) {
  return (
    <div className="relative w-48 h-80 bg-dark rounded-2xl overflow-hidden mx-auto border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-3 right-10 space-y-1.5">
        <p className="text-xs font-bold text-white">@battells</p>
        <p className="text-[11px] text-white/90 leading-snug line-clamp-3">{title}</p>
        <p className="text-[10px] text-white/60 line-clamp-1">{hashtags.join(' ')}</p>
      </div>
    </div>
  )
}

function InstagramPreview({ title, hashtags }: { title: string; hashtags: string[] }) {
  const caption = `${title}\n\n${hashtags.slice(0, 10).join(' ')}${hashtags.length > 10 ? '...' : ''}`
  const preview = caption.length > 100 ? caption.slice(0, 100) + '... voir plus' : caption
  return (
    <div className="rounded-lg overflow-hidden border border-border/30 bg-white">
      <div className="w-full aspect-square bg-dark/10 flex items-center justify-center text-text-tertiary max-h-40">
        <Instagram className="w-10 h-10 opacity-20" />
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary" />
          <span className="text-xs font-bold text-[#262626]">battells</span>
        </div>
        <p className="text-[11px] text-[#262626] leading-snug whitespace-pre-line">{preview}</p>
      </div>
    </div>
  )
}

export default function OutputPanel({ result, formData, loading }: OutputPanelProps) {
  const [activePreview, setActivePreview] = useState<PreviewTab>('yt-search')
  const [showSection, setShowSection] = useState<'preview' | 'description' | 'tags' | 'hooks'>('preview')

  const displayTitle = result?.optimized_title || formData.title || 'Votre titre apparaitra ici...'
  const tiktokHashtags = result?.hashtags?.tiktok || []
  const instaHashtags = result?.hashtags?.instagram || []

  const previewTabs: { id: PreviewTab; label: string }[] = [
    { id: 'yt-search', label: 'YT Search' },
    { id: 'yt-home', label: 'YT Home' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'instagram', label: 'Insta' },
  ]

  const sections = [
    { id: 'preview' as const, label: 'Preview', icon: Eye },
    { id: 'description' as const, label: 'Description', icon: FileText },
    { id: 'tags' as const, label: 'Tags', icon: Hash },
    { id: 'hooks' as const, label: 'Hooks', icon: Zap },
  ]

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-4 overflow-y-auto max-h-[75vh]">
      <div className="flex gap-1 bg-page rounded-lg p-1">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setShowSection(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold font-[var(--font-clash)] rounded-md transition-all ${
              showSection === id
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="wait">
          {showSection === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex gap-1">
                {previewTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActivePreview(t.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold font-[var(--font-clash)] rounded-md transition-all ${
                      activePreview === t.id ? 'bg-dark text-white' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activePreview === 'yt-search' && <YouTubeSearchPreview title={displayTitle} />}
              {activePreview === 'yt-home' && <YouTubeHomePreview title={displayTitle} />}
              {activePreview === 'tiktok' && <TikTokPreview title={displayTitle} hashtags={tiktokHashtags} />}
              {activePreview === 'instagram' && <InstagramPreview title={displayTitle} hashtags={instaHashtags} />}
            </motion.div>
          )}

          {showSection === 'description' && result?.description_generated && (
            <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                  Description generee
                </span>
                <CopyButton text={result.description_generated} />
              </div>
              <div className="p-4 bg-page rounded-xl border border-border/30 max-h-64 overflow-y-auto">
                <pre className="text-xs text-text-primary font-[var(--font-satoshi)] whitespace-pre-wrap leading-relaxed">
                  {result.description_generated}
                </pre>
              </div>
            </motion.div>
          )}

          {showSection === 'tags' && result && (
            <motion.div key="tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {result.tags_generated.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                      Tags YouTube ({result.tags_generated.length})
                    </span>
                    <CopyButton text={result.tags_generated.join(', ')} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags_generated.map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {Object.entries(result.hashtags || {}).map(([platform, tags]) => (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)] capitalize">
                      Hashtags {platform} ({(tags as string[]).length})
                    </span>
                    <CopyButton text={(tags as string[]).join(' ')} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(tags as string[]).map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-info/10 text-info border border-info/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {showSection === 'hooks' && result?.hook_suggestions && (
            <motion.div key="hooks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                Hook — les 3 premieres secondes
              </span>
              {result.hook_suggestions.map((hook, i) => (
                <div key={i} className="p-3 rounded-xl bg-dark text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-primary font-[var(--font-bebas)] tracking-wider">
                      HOOK {i + 1}
                    </span>
                    <CopyButton text={hook} />
                  </div>
                  <p className="text-sm font-[var(--font-satoshi)] text-white/90 italic">
                    "{hook}"
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {!result && showSection !== 'preview' && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-text-tertiary">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Lance l'optimisation pour voir les resultats</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
