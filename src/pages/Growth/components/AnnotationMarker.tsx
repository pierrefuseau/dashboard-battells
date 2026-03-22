import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import type { GrowthAnnotation, AnnotationType } from '../hooks/useGrowthData'
import AnnotationCard from './AnnotationCard'

// ── Type colors ─────────────────────────────────────────────────────

const TYPE_COLORS: Record<AnnotationType, string> = {
  views_spike: '#FF6B00',
  revenue_spike: '#10B981',
  subscriber_milestone: '#8B5CF6',
  long_form_publish: '#3B82F6',
}

// ── Component ───────────────────────────────────────────────────────

interface AnnotationMarkerProps {
  annotation: GrowthAnnotation
  x: number
  y: number
  chartHeight: number
  onNavigate?: (videoId: string) => void
}

export default function AnnotationMarker({
  annotation,
  x,
  y,
  chartHeight,
  onNavigate,
}: AnnotationMarkerProps) {
  const [hovered, setHovered] = useState(false)

  const color = TYPE_COLORS[annotation.type]
  const isMilestone = annotation.type === 'subscriber_milestone'
  const isVideo = annotation.type === 'long_form_publish' && !!annotation.videoId
  const haloSize = isMilestone ? 24 : 20
  const dotSize = isMilestone ? 10 : 8

  // Dashed line from dot down to X axis
  const lineHeight = chartHeight - y

  const handleClick = () => {
    if (isVideo && annotation.videoId && onNavigate) {
      onNavigate(annotation.videoId)
    }
  }

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Dashed vertical line */}
      {lineHeight > 0 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2"
          style={{
            width: 1,
            height: lineHeight,
            background: `repeating-linear-gradient(
              to bottom,
              ${color}66 0px,
              ${color}66 4px,
              transparent 4px,
              transparent 8px
            )`,
          }}
        />
      )}

      {/* Touch target button */}
      <button
        type="button"
        aria-label={`${annotation.title}${isVideo ? ' — cliquer pour voir la vidéo' : ''}`}
        className={`relative flex items-center justify-center bg-transparent border-none p-0 ${isVideo ? 'cursor-pointer' : 'cursor-default'}`}
        style={{ width: 44, height: 44, marginLeft: -22, marginTop: -22 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        onClick={handleClick}
      >
        {/* Halo circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: hovered ? 1.3 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="absolute rounded-full"
          style={{
            width: haloSize,
            height: haloSize,
            backgroundColor: `${color}4D`,
          }}
        />

        {/* Solid dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.05 }}
          className="absolute rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: color,
          }}
        />

        {/* Video link indicator on hover */}
        {isVideo && hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-surface shadow-sm border border-border-light"
          >
            <ExternalLink size={8} className="text-text-secondary" />
          </motion.div>
        )}
      </button>

      {/* Annotation card on hover */}
      <AnimatePresence>
        {hovered && (
          <AnnotationCard
            annotation={annotation}
            isVideo={isVideo}
            style={{
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 8,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
