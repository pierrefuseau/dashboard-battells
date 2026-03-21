import { motion } from 'framer-motion'
import { Youtube, Instagram } from 'lucide-react'
import type { PlatformData } from '../mockData'

function TikTokIcon({ size = 32, color = '#000000' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.2 8.2 0 0 0 4.76 1.52V6.78a4.86 4.86 0 0 1-1-.09z"
        fill={color}
      />
    </svg>
  )
}

function PlatformIcon({ platform }: { platform: PlatformData }) {
  switch (platform.icon) {
    case 'youtube':
      return <Youtube size={32} color={platform.color} />
    case 'tiktok':
      return <TikTokIcon size={32} color={platform.color} />
    case 'instagram':
      return <Instagram size={32} color={platform.color} />
  }
}

interface Props {
  platform: PlatformData
}

export default function PlatformCard({ platform }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card p-6 flex-1 min-w-0"
    >
      {/* Icon */}
      <div className="mb-4">
        <PlatformIcon platform={platform} />
      </div>

      {/* Platform name */}
      <h3 className="font-[var(--font-clash)] text-2xl font-bold text-text-primary mb-1">
        {platform.name}
      </h3>

      {/* Subscriber count */}
      <p
        className="font-[var(--font-space-grotesk)] text-[32px] font-bold leading-tight mb-1"
        style={{ color: platform.color }}
      >
        {platform.subscribers}
      </p>
      <p className="text-sm text-text-secondary mb-6">{platform.subscriberLabel}</p>

      {/* Metrics */}
      <div className="space-y-3">
        {platform.metrics.map((metric) => (
          <div key={metric.label} className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{metric.label}</span>
            <span className="font-[var(--font-space-grotesk)] text-sm font-semibold text-text-primary">
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
