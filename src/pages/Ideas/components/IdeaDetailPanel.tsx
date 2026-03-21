import { useState } from 'react'
import { ExternalLink, Sparkles, Check, ThumbsDown } from 'lucide-react'
import { DetailPanel } from '@/components/ui'
import { FORMAT_TAGS } from '@/lib/constants'
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
                className="block relative rounded-[var(--radius-card)] overflow-hidden group cursor-pointer"
              >
                <img src={detectedVideo.thumbnail_url} alt={detectedVideo.title} className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={24} className="text-white" />
                </div>
              </a>
            )}
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">Video source</p>
              <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">{detectedVideo.title}</p>
              <p className="text-xs text-text-secondary mt-1">{detectedVideo.channel_name} — {detectedVideo.platform}</p>
              <div className="flex gap-3 mt-2 text-xs font-[var(--font-space-grotesk)] text-text-secondary">
                <span>{(detectedVideo.views / 1000).toFixed(0)}K vues</span>
                <span>{(detectedVideo.likes / 1000).toFixed(0)}K likes</span>
                <span>+{Math.round((detectedVideo.overperformance_ratio - 1) * 100)}% vs moyenne</span>
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <p className="text-xs font-[var(--font-bebas)] tracking-[0.1em] text-text-secondary uppercase">Pourquoi ca marche</p>
            </div>
            <ul className="space-y-1.5">
              {analysis.why_it_works.map((point, i) => (
                <li key={i} className="text-sm text-text-secondary font-[var(--font-satoshi)] flex gap-2">
                  <span className="text-primary mt-0.5">-</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Analysis — BATTELLS Adaptation */}
        {analysis?.battells_adaptation && (
          <div className="card-accent p-4 space-y-2">
            <p className="text-xs font-[var(--font-bebas)] tracking-[0.1em] text-primary uppercase">Adaptation BATTELLS</p>
            <p className="text-sm text-text-primary font-[var(--font-satoshi)]">{analysis.battells_adaptation}</p>
            {analysis.suggested_hook && (
              <p className="text-xs text-text-secondary"><strong>Hook:</strong> {analysis.suggested_hook}</p>
            )}
            {analysis.gustavo_role && (
              <p className="text-xs text-text-secondary"><strong>Gustavo:</strong> {analysis.gustavo_role}</p>
            )}
            {analysis.estimated_views && (
              <p className="text-xs text-text-tertiary font-[var(--font-space-grotesk)]">
                ~{(analysis.estimated_views / 1000).toFixed(0)}K vues estimees
              </p>
            )}
          </div>
        )}

        {/* User notes */}
        <div className="space-y-2">
          <label className="text-xs font-[var(--font-bebas)] tracking-[0.1em] text-text-secondary uppercase">
            Notes de Baptiste
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoute tes idees, ton angle, tes notes..."
            className="w-full h-24 p-3 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary resize-none focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving || notes === (idea.user_notes ?? '')}
            className="btn-secondary !h-8 !text-xs cursor-pointer"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les notes'}
          </button>
        </div>

        {/* Action buttons */}
        {idea.status === 'backlog' && (
          <div className="flex gap-3 pt-2">
            <button onClick={() => onApprove(idea.id)} className="btn-primary flex-1 cursor-pointer">
              <Check size={16} className="mr-2" /> Approuver
            </button>
            <button onClick={() => onReject(idea.id)} className="btn-secondary flex-1 cursor-pointer">
              <ThumbsDown size={16} className="mr-2" /> Rejeter
            </button>
          </div>
        )}
      </div>
    </DetailPanel>
  )
}
