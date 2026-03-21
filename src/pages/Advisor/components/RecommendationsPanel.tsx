import { motion } from 'framer-motion'
import { Lightbulb, BarChart3, Clock, TrendingUp, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { recommendations } from '../mockData'
import type { Recommendation } from '../mockData'
import type { ReactNode } from 'react'

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'

const iconMap: Record<Recommendation['icon'], ReactNode> = {
  lightbulb: <Lightbulb size={16} />,
  'bar-chart': <BarChart3 size={16} />,
  clock: <Clock size={16} />,
  'trending-up': <TrendingUp size={16} />,
  users: <Users size={16} />,
}

const iconBgMap: Record<Recommendation['icon'], string> = {
  lightbulb: 'bg-primary-50 text-primary',
  'bar-chart': 'bg-[#F3E8FF] text-[#8B5CF6]',
  clock: 'bg-info-50 text-info',
  'trending-up': 'bg-success-50 text-success',
  users: 'bg-secondary-50 text-secondary-dark',
}

const badgeVariantMap: Record<Recommendation['badgeColor'], string> = {
  orange: 'primary',
  blue: 'info',
  purple: 'warning',
  green: 'success',
  yellow: 'secondary',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function RecommendationsPanel() {
  return (
    <div className="space-y-4">
      <h2 className="font-[var(--font-clash)] text-xl font-bold text-text-primary">
        Recommandations
      </h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {recommendations.map((rec) => (
          <motion.div
            key={rec.id}
            variants={item}
            className="card card-hover p-4 flex gap-3 items-start cursor-default"
          >
            <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${iconBgMap[rec.icon]}`}>
              {iconMap[rec.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-[var(--font-satoshi)] text-sm font-bold text-text-primary truncate">
                  {rec.title}
                </span>
                <Badge variant={badgeVariantMap[rec.badgeColor] as BadgeVariant} size="sm">
                  {rec.badgeLabel}
                </Badge>
              </div>
              <p className="font-[var(--font-satoshi)] text-[13px] text-text-secondary leading-snug line-clamp-2">
                {rec.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
