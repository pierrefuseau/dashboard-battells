import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { X, ExternalLink } from 'lucide-react'
import { formatCompact } from '@/lib/formatters'
import type { DetectedVideo } from '@/types/database'

interface HeatCardProps {
  video: DetectedVideo
  index: number
  onSelect: (video: DetectedVideo) => void
  onDismiss: (id: number) => void
}

function heatColor(score: number): string {
  if (score >= 0.7) return 'var(--color-error)'
  if (score >= 0.4) return 'var(--color-primary)'
  return 'var(--color-secondary)'
}

function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { number } = useSpring({ number: value, config: { duration: 800 } })
  return <animated.span>{number.to((n) => `${formatCompact(Math.round(n))}${suffix}`)}</animated.span>
}

export default function HeatCard({ video, index, onSelect, onDismiss }: HeatCardProps) {
  const overPerf = Math.round((video.overperformance_ratio - 1) * 100)

  return (
    <motion.div
      className="relative flex-shrink-0 w-72 rounded-[var(--radius-card-lg)] overflow-hidden cursor-pointer group"
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.08 }}
      onClick={() => onSelect(video)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(video)}
      role="button"
      aria-label={`Voir details: ${video.title}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-card-lg)]"
        style={{ backgroundColor: heatColor(video.heat_score) }}
      />

      <button
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onDismiss(video.id) }}
        aria-label="Ignorer cette detection"
      >
        <X size={14} />
      </button>

      {video.thumbnail_url && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,13,13,0.9)] to-transparent" />
          <span className="absolute top-2 left-3 badge bg-white/15 text-white/80 text-[10px] uppercase tracking-wider">
            {video.platform}
          </span>
        </div>
      )}

      <div className="p-4 pl-5 space-y-2">
        <h4 className="text-sm font-bold font-[var(--font-clash)] text-white leading-snug line-clamp-2">
          {video.title}
        </h4>
        <p className="text-[11px] text-white/50 font-[var(--font-satoshi)]">
          {video.channel_name}
        </p>
        <div className="flex items-center gap-3 text-xs font-[var(--font-space-grotesk)]">
          <span className="text-white/70">
            <AnimatedStat value={video.views} /> vues
          </span>
          {overPerf > 0 && (
            <span className="font-bold" style={{ color: heatColor(video.heat_score) }}>
              +{overPerf}%
            </span>
          )}
          <a
            href={video.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-white/40 hover:text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
            aria-label="Voir la video source"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  )
}
