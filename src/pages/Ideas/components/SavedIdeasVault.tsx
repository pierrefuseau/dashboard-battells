import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, FolderOpen } from 'lucide-react'
import type { VideoIdea } from '@/types/database'
import AnimatedIdeaStack from '@/components/ui/AnimatedIdeaStack'

interface SavedIdeasVaultProps {
  ideas: VideoIdea[]
  loading: boolean
  onCardClick: (idea: VideoIdea) => void
  onArchiveIdea: (id: number) => Promise<void>
}

export default function SavedIdeasVault({
  ideas,
  loading,
  onCardClick,
}: SavedIdeasVaultProps) {
  const approvedIdeas = useMemo(() => {
    return ideas.filter((idea) => idea.status === 'approved')
      .sort((a, b) => {
        const potentialDiff = (b.ai_analysis?.estimated_views || 0) - (a.ai_analysis?.estimated_views || 0)
        return potentialDiff !== 0 ? potentialDiff : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
  }, [ideas])

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-20">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 pt-4">
      {/* Header section with gradient line */}
      <div className="flex items-center gap-4 relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-[var(--font-clash)] font-bold text-text-primary">
              La Sélection
            </h2>
            <p className="text-sm text-text-tertiary font-medium">
              Parcourez vos meilleures idées approuvées, prêtes à devenir des vidéos.
            </p>
          </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
        <div className="badge bg-surface text-text-secondary border border-border/40 font-bold px-3 py-1">
          {approvedIdeas.length} Idée{approvedIdeas.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Animated Card Stack */}
      {approvedIdeas.length > 0 ? (
        <AnimatedIdeaStack
          ideas={approvedIdeas}
          onCardClick={onCardClick}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-border/30 rounded-[var(--radius-card-lg)] bg-page/30"
        >
          <div className="w-16 h-16 rounded-full bg-page border border-border/40 flex items-center justify-center mb-4 text-text-tertiary">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-[var(--font-clash)] font-bold text-text-primary mb-2">
            Coffre-fort vide
          </h3>
          <p className="text-text-secondary max-w-sm">
            Approuvez des idées depuis le Radar Feed au-dessus pour construire votre bibliothèque de futurs hits.
          </p>
        </motion.div>
      )}
    </div>
  )
}
