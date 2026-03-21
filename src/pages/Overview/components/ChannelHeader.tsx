import { motion } from 'framer-motion'
import SyncIndicator from '@/components/ui/SyncIndicator'
import { useChannelInfo } from '@/hooks/useChannelInfo'
import { useYouTubeSync } from '@/hooks/useYouTubeSync'
import { YOUTUBE_CONFIG, formatSubscriberCount, formatViewCount } from '@/lib/youtube'

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return "à l'instant"
  if (diffMinutes < 60) return `il y a ${diffMinutes}min`
  if (diffHours < 24) return `il y a ${diffHours}h`
  if (diffDays === 1) return 'il y a 1 jour'
  return `il y a ${diffDays} jours`
}

export default function ChannelHeader() {
  const { channelInfo, loading: channelLoading } = useChannelInfo()
  const { syncStatus, loading: syncLoading } = useYouTubeSync()

  const syncIndicatorStatus = syncLoading
    ? 'syncing'
    : syncStatus.isStale
      ? 'stale'
      : 'ok'

  if (channelLoading) {
    return (
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="skeleton w-14 h-14 rounded-full" />
          <div className="flex-1">
            <div className="skeleton h-6 w-32 mb-2 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="card p-5 mb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        {/* Left: Avatar + Name + Handle */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Channel avatar placeholder */}
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            <span className="text-lg sm:text-2xl font-bold text-white font-[var(--font-clash)]">B</span>
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-text-primary font-[var(--font-clash)] truncate">
              {YOUTUBE_CONFIG.channelName}
            </h2>
            <span className="text-xs sm:text-sm text-text-secondary font-[var(--font-satoshi)]">
              {YOUTUBE_CONFIG.channelHandle}
            </span>
          </div>
        </div>

        {/* Center: Mini stats — scrollable on mobile */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 sm:pb-0">
          <StatPill
            label="abonnés"
            value={formatSubscriberCount(channelInfo.subscriberCount)}
          />
          <div className="w-px h-5 sm:h-6 bg-border shrink-0" />
          <StatPill
            label="vues"
            value={formatViewCount(channelInfo.viewCount)}
          />
          <div className="w-px h-5 sm:h-6 bg-border shrink-0" />
          <StatPill
            label="vidéos"
            value={YOUTUBE_CONFIG.videoCount.toString()}
          />
        </div>

        {/* Right: Sync status — hidden on mobile, shown on sm+ */}
        <div className="hidden sm:flex flex-col items-end gap-1">
          <SyncIndicator
            status={syncIndicatorStatus}
            lastSync={syncStatus.lastSync}
          />
          {syncStatus.lastSync && (
            <span className="text-[10px] text-text-tertiary font-[var(--font-satoshi)]">
              Dernière sync : {formatRelativeTime(syncStatus.lastSync)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1 sm:gap-1.5 shrink-0">
      <span className="text-sm sm:text-lg font-bold text-text-primary font-[var(--font-space-grotesk)]">
        {value}
      </span>
      <span className="text-[10px] sm:text-xs text-text-tertiary font-[var(--font-satoshi)]">{label}</span>
    </div>
  )
}
