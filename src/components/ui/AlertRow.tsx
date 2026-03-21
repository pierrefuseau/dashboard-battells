import Badge from '@/components/ui/Badge'

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'

interface AlertRowProps {
  icon: string
  text: string
  badgeText: string
  badgeVariant: BadgeVariant
  timestamp: string
}

export default function AlertRow({ icon, text, badgeText, badgeVariant, timestamp }: AlertRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border-light hover:bg-primary-50 transition-colors duration-150">
      <span className="text-lg shrink-0">{icon}</span>
      <p className="flex-1 text-sm font-[var(--font-satoshi)] text-text-primary truncate">
        {text}
      </p>
      <Badge variant={badgeVariant} size="sm">{badgeText}</Badge>
      <span className="text-xs text-text-tertiary font-[var(--font-satoshi)] shrink-0">
        {timestamp}
      </span>
    </div>
  )
}
