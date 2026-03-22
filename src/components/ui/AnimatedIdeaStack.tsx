import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Eye, FlaskConical, ArrowRight } from 'lucide-react'
import type { VideoIdea } from '@/types/database'

interface AnimatedIdeaStackProps {
  ideas: VideoIdea[]
  onCardClick: (idea: VideoIdea) => void
}

const positionStyles = [
  { scale: 1, y: 12 },
  { scale: 0.95, y: -16 },
  { scale: 0.9, y: -44 },
]

function IdeaCardContent({
  idea,
  onCardClick,
}: {
  idea: VideoIdea
  onCardClick: (idea: VideoIdea) => void
}) {
  const sourceLabel =
    idea.source === 'competitor'
      ? 'Concurrent'
      : idea.source === 'trend'
        ? 'Tendance'
        : idea.source === 'ai'
          ? 'IA'
          : 'Personnelle'

  return (
    <div className="flex h-full w-full flex-col gap-3 p-4">
      {/* Badges row */}
      <div className="flex items-center gap-2">
        <span className="badge bg-primary/15 text-primary font-bold flex items-center gap-1">
          <Play className="w-3 h-3" />
          {idea.is_long_form ? 'Long' : 'Short'}
        </span>
        <span className="badge bg-surface-light text-text-secondary border border-border/40 font-bold">
          {sourceLabel}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-[var(--font-clash)] font-bold text-text-primary leading-tight line-clamp-2 flex-1">
        {idea.title}
      </h3>

      {/* Stats row */}
      {idea.ai_analysis && (
        <div className="flex items-center gap-4 pt-2 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-text-tertiary" />
            <span className="text-sm font-bold text-text-secondary font-[var(--font-space-grotesk)]">
              {idea.ai_analysis.estimated_views
                ? (idea.ai_analysis.estimated_views / 1000).toFixed(0) + 'k vues'
                : '—'}
            </span>
          </div>
          {idea.ai_analysis.format_recommendation && (
            <div className="flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-sm text-text-tertiary truncate max-w-[120px]">
                {idea.ai_analysis.format_recommendation}
              </span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-bold">
          {new Date(idea.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCardClick(idea)
          }}
          className="flex h-8 shrink-0 cursor-pointer select-none items-center gap-1 rounded-[var(--radius-button)] bg-primary px-3 text-xs font-bold text-white shadow-[var(--shadow-button-primary)] transition-all hover:bg-primary-light hover:shadow-[var(--shadow-button-primary-hover)] active:scale-[0.98]"
        >
          Voir
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

function AnimatedCard({
  idea,
  index,
  isAnimating,
  onCardClick,
}: {
  idea: VideoIdea
  index: number
  isAnimating: boolean
  onCardClick: (idea: VideoIdea) => void
}) {
  const { scale, y } = positionStyles[index] ?? positionStyles[2]
  const zIndex = index === 0 && isAnimating ? 10 : 3 - index

  const exitAnim =
    index === 0
      ? { y: 340, scale: 1, zIndex: 10 }
      : undefined
  const initialAnim =
    index === 2
      ? { y: -16, scale: 0.9 }
      : undefined

  return (
    <motion.div
      key={idea.id}
      initial={initialAnim}
      animate={{ y, scale }}
      exit={exitAnim}
      transition={{ type: 'spring', duration: 1, bounce: 0 }}
      style={{
        zIndex,
        left: '50%',
        x: '-50%',
        bottom: 0,
      }}
      className="absolute flex w-[320px] sm:w-[480px] overflow-hidden rounded-t-[var(--radius-card)] border-x border-t border-border bg-surface shadow-[var(--shadow-card)] will-change-transform cursor-pointer"
      onClick={() => onCardClick(idea)}
    >
      <IdeaCardContent idea={idea} onCardClick={onCardClick} />
    </motion.div>
  )
}

export default function AnimatedIdeaStack({
  ideas,
  onCardClick,
}: AnimatedIdeaStackProps) {
  const [startIndex, setStartIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleNext = () => {
    if (ideas.length <= 1) return
    setIsAnimating(true)
    setStartIndex((prev) => (prev + 1) % ideas.length)
    setIsAnimating(false)
  }

  const handlePrev = () => {
    if (ideas.length <= 1) return
    setIsAnimating(true)
    setStartIndex((prev) => (prev - 1 + ideas.length) % ideas.length)
    setIsAnimating(false)
  }

  // Wrap around for stack display
  const getWrappedIdeas = () => {
    const result: VideoIdea[] = []
    for (let i = 0; i < Math.min(3, ideas.length); i++) {
      result.push(ideas[(startIndex + i) % ideas.length])
    }
    return result
  }

  const wrappedIdeas = getWrappedIdeas()

  return (
    <div className="flex w-full flex-col items-center justify-center pt-2">
      {/* Stack container */}
      <div className="relative h-[260px] w-full overflow-hidden sm:w-[560px]">
        <AnimatePresence initial={false}>
          {wrappedIdeas.map((idea, index) => (
            <AnimatedCard
              key={idea.id}
              idea={idea}
              index={index}
              isAnimating={isAnimating}
              onCardClick={onCardClick}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {ideas.length > 1 && (
        <div className="relative z-10 -mt-px flex w-full items-center justify-center gap-3 border-t border-border/40 py-4">
          <button
            onClick={handlePrev}
            className="flex h-9 cursor-pointer select-none items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-button)] border border-border bg-surface px-3 font-[var(--font-satoshi)] font-medium text-sm text-text-secondary transition-all hover:bg-primary-50 hover:border-primary/30 hover:text-primary active:scale-[0.98]"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Précédente
          </button>

          <span className="text-xs text-text-tertiary font-[var(--font-space-grotesk)] font-bold tabular-nums">
            {(startIndex % ideas.length) + 1} / {ideas.length}
          </span>

          <button
            onClick={handleNext}
            className="flex h-9 cursor-pointer select-none items-center justify-center gap-1 overflow-hidden rounded-[var(--radius-button)] border border-border bg-surface px-3 font-[var(--font-satoshi)] font-medium text-sm text-text-secondary transition-all hover:bg-primary-50 hover:border-primary/30 hover:text-primary active:scale-[0.98]"
          >
            Suivante
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
