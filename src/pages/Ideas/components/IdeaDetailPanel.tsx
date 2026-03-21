import { useState, useEffect } from 'react'
import { ExternalLink, Sparkles, Check, ThumbsDown } from 'lucide-react'
import { DetailPanel } from '@/components/ui'
import { FORMAT_TAGS } from '@/lib/constants'
import { formatCompact } from '@/lib/formatters'
import type { VideoIdea, DetectedVideo } from '@/types/database'

interface IdeaDetailPanelProps {
  idea: VideoIdea | null
  detectedVideo: DetectedVideo | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: number) => Promise<void>
  onReject: (id: number) => Promise<void>
  onUpdateNotes: (id: number, notes: string) => Promise<void>
}

export default function IdeaDetailPanel({
  idea, detectedVideo, isOpen, onClose, onApprove, onReject, onUpdateNotes,
}: IdeaDetailPanelProps) {
  const [notes, setNotes] = useState(idea?.user_notes ?? '')
  const [saving, setSaving] = useState(false)

  useEffect(() => { setNotes(idea?.user_notes ?? '') }, [idea?.id, idea?.user_notes])

  if (!idea) return null

  const analysis = idea.ai_analysis
  const formatInfo = idea.format_tag
    ? FORMAT_TAGS[idea.format_tag as keyof typeof FORMAT_TAGS]
    : null

  async function handleSaveNotes() {
    setSaving(true)
    await onUpdateNotes(idea!.id, notes)
    setSaving(false)
  }

  return (
    <DetailPanel isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Source video */}
        {detectedVideo && (
          <div className="space-y-3">
            {detectedVideo.thumbnail_url && (
              <a
                href={detectedVideo.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-[var(--radius-card)] overflow-hidden group border border-white/5 hover:border-white/20 transition-all cursor-pointer shadow-lg"
              >
                <img src={detectedVideo.thumbnail_url} alt={detectedVideo.title} className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent flex flex-col justify-end p-4">
                   <div className="flex items-center gap-2 text-white/90">
                     <span className="text-sm font-semibold truncate font-[var(--font-satoshi)]">{detectedVideo.channel_name}</span>
                   </div>
                </div>
                <div className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-white transition-colors opacity-0 group-hover:opacity-100">
                  <ExternalLink size={16} />
                </div>
              </a>
            )}
            <div>
              <p className="text-xs text-secondary tracking-widest font-[var(--font-space-grotesk)] uppercase mb-1">Source Inspector</p>
              <p className="text-base font-bold font-[var(--font-satoshi)] text-white leading-tight">{detectedVideo.title}</p>
              <div className="flex gap-4 mt-3 pt-3 border-t border-white/5 text-xs font-[var(--font-space-grotesk)] text-text-secondary">
                <span className="flex items-center gap-1.5"><strong className="text-white">{formatCompact(detectedVideo.views)}</strong> vues</span>
                <span className="flex items-center gap-1.5"><strong className="text-white">{formatCompact(detectedVideo.likes)}</strong> likes</span>
                {detectedVideo.overperformance_ratio > 1 && (
                  <span className="flex items-center gap-1.5 text-success">+{Math.round((detectedVideo.overperformance_ratio - 1) * 100)}% <span className="text-text-tertiary">vs moy</span></span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="h-px bg-border" />

        {/* Idea title */}
        <div>
          <h3 className="text-lg font-bold font-[var(--font-clash)] text-text-primary">{idea.title}</h3>
          {formatInfo && (
            <span className="badge mt-2 text-[10px]" style={{ backgroundColor: `${formatInfo.color}15`, color: formatInfo.color }}>
              {formatInfo.label}
            </span>
          )}
        </div>

        {/* AI Analysis — Why it works */}
        {analysis?.why_it_works && analysis.why_it_works.length > 0 && (
          <div className="space-y-3 bg-surface/50 p-4 rounded-[var(--radius-card)] border border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <p className="text-xs font-[var(--font-space-grotesk)] font-bold text-white uppercase tracking-wider">Pourquoi ca marche</p>
            </div>
            <ul className="space-y-2">
              {analysis.why_it_works.map((point, i) => (
                <li key={i} className="text-sm text-text-secondary font-[var(--font-satoshi)] flex gap-2 items-start">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Analysis — BATTELLS Adaptation */}
        {analysis?.battells_adaptation && (
          <div className="p-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[#1E2128] to-[#12141A] border border-white/10 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Sparkles size={64} className="text-primary" />
            </div>
            
            <p className="text-xs font-[var(--font-space-grotesk)] tracking-[0.1em] text-primary uppercase font-bold mb-3 relative z-10">Adaptation BATTELLS</p>
            <p className="text-sm text-white/90 font-[var(--font-satoshi)] leading-relaxed mb-4 relative z-10">{analysis.battells_adaptation}</p>
            
            <div className="space-y-3 relative z-10 bg-black/20 p-3 rounded-lg border border-white/5">
                {analysis.suggested_hook && (
                    <div>
                        <span className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1">Hook Suggéré</span>
                        <p className="text-sm text-white/80 italic border-l-2 border-secondary pl-2 text-balance">"{analysis.suggested_hook}"</p>
                    </div>
                )}
                {analysis.gustavo_role && (
                    <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] text-text-tertiary uppercase tracking-wider block mb-1">Rôle de Gustavo</span>
                        <p className="text-sm text-white/80">{analysis.gustavo_role}</p>
                    </div>
                )}
            </div>

            {analysis.estimated_views && (
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                    <span className="text-xs text-text-tertiary font-[var(--font-space-grotesk)]">Projection estimée</span>
                     <span className="text-lg font-bold font-[var(--font-clash)] text-white">
                        ~{formatCompact(analysis.estimated_views)} <span className="text-sm font-normal text-text-secondary">vues</span>
                     </span>
                </div>
            )}
          </div>
        )}

        {/* User notes */}
        <div className="space-y-3">
          <label className="text-xs font-[var(--font-space-grotesk)] tracking-[0.1em] text-white/50 uppercase font-bold pl-1">
            Notes de Baptiste
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoute tes idees, ton angle, tes notes..."
            className="w-full h-32 p-4 rounded-[var(--radius-card)] border border-white/5 bg-dark text-sm font-[var(--font-satoshi)] text-text-primary resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving || notes === (idea.user_notes ?? '')}
            className="btn btn-outline border-white/10 hover:border-white/20 hover:bg-white/5 !h-10 !text-sm w-full transition-all"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les notes'}
          </button>
        </div>

        {/* Action buttons */}
        {idea.status === 'backlog' && (
          <div className="flex gap-4 pt-4 mt-2 border-t border-white/5">
            <button onClick={() => onApprove(idea.id)} className="btn btn-primary flex-1 shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] transition-all">
              <Check size={18} className="mr-2" /> Approuver l'idée
            </button>
            <button onClick={() => onReject(idea.id)} className="btn btn-ghost text-error/80 hover:text-error hover:bg-error/10 flex-1 transition-all">
              <ThumbsDown size={18} className="mr-2" /> Rejeter
            </button>
          </div>
        )}
      </div>
    </DetailPanel>
  )
}
