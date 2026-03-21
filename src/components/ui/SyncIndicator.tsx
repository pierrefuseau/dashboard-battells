import { useState } from 'react'

type SyncStatus = 'ok' | 'syncing' | 'stale' | 'error'

interface SyncIndicatorProps {
  status: SyncStatus
  lastSync?: string | null
}

const STATUS_CONFIG: Record<SyncStatus, { color: string; pulseColor: string; label: string }> = {
  ok: {
    color: 'bg-success',
    pulseColor: 'bg-success/40',
    label: 'Sync OK',
  },
  syncing: {
    color: 'bg-warning',
    pulseColor: 'bg-warning/40',
    label: 'Sync en cours...',
  },
  stale: {
    color: 'bg-error',
    pulseColor: 'bg-error/40',
    label: 'Données obsolètes',
  },
  error: {
    color: 'bg-error',
    pulseColor: 'bg-error/40',
    label: 'Erreur de sync',
  },
}

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

export default function SyncIndicator({ status, lastSync }: SyncIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = STATUS_CONFIG[status]

  return (
    <div
      className="relative inline-flex items-center gap-1.5"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.pulseColor}`}
        />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${config.color}`} />
      </span>

      {/* Label */}
      <span className="text-[11px] font-medium text-text-secondary font-[var(--font-satoshi)]">
        {config.label}
      </span>

      {/* Tooltip */}
      {showTooltip && lastSync && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-bg-tertiary border border-border rounded-lg shadow-lg z-50 whitespace-nowrap">
          <span className="text-[11px] text-text-secondary font-[var(--font-satoshi)]">
            Dernière sync : {formatRelativeTime(lastSync)}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-bg-tertiary border-r border-b border-border rotate-45 -translate-y-1" />
          </div>
        </div>
      )}
    </div>
  )
}
