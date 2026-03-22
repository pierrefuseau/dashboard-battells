import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Radar, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDetectedVideos } from '@/hooks'
import type { DetectedVideo } from '@/types/database'
import HeatCard from './HeatCard'

interface RadarFeedProps {
  onSelectVideo: (video: DetectedVideo) => void
  onAddLink: () => void
}

export default function RadarFeed({ onSelectVideo, onAddLink }: RadarFeedProps) {
  const { videos, loading, refetch, dismiss } = useDetectedVideos()
  const [scanning, setScanning] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function handleScan() {
    setScanning(true)
    await refetch()
    setScanning(false)
  }

  function scroll(direction: 'left' | 'right') {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    })
  }

  return (
    <motion.section
      className="relative rounded-[var(--radius-card-lg)] overflow-hidden bg-surface border border-white/5 shadow-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(255,107,0,0.15) 0%, transparent 50%)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <Radar size={20} className="text-primary" />
          <h2 className="text-sm font-[var(--font-bebas)] tracking-[0.15em] text-white/60 uppercase">
            Detections chaudes
          </h2>
          {videos.length > 0 && (
            <span className="badge bg-primary/20 text-primary text-[10px]">
              {videos.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAddLink} className="btn-secondary !h-8 !px-3 !text-xs !border-white/20 !text-white/60 hover:!text-white cursor-pointer">
            <Plus size={14} className="mr-1.5" /> Ajouter un lien
          </button>
          <button
            onClick={handleScan}
            disabled={scanning}
            className="btn-primary !h-8 !px-3 !text-xs cursor-pointer"
          >
            <Radar size={14} className={`mr-1.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scan...' : 'Scanner'}
          </button>
        </div>
      </div>

      {/* Scroll arrows */}
      {videos.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:scale-110 hover:bg-black/80 flex items-center justify-center cursor-pointer transition-all border border-white/10 shadow-xl"
            aria-label="Defiler a gauche"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-[55%] -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:scale-110 hover:bg-black/80 flex items-center justify-center cursor-pointer transition-all border border-white/10 shadow-xl"
            aria-label="Defiler a droite"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Cards feed */}
      <div
        ref={scrollRef}
        className="relative z-10 flex gap-5 overflow-x-auto px-6 pb-6 pt-2 snap-x snap-mandatory hide-scrollbar"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-72 h-56 rounded-[var(--radius-card-lg)] skeleton" />
          ))
        ) : videos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <Radar size={32} className="text-white/20 mb-3" />
            <p className="text-sm text-white/40 font-[var(--font-satoshi)]">
              Aucune detection recente. Lance un scan ou ajoute un lien manuellement.
            </p>
          </div>
        ) : (
          videos.map((video, i) => (
            <HeatCard
              key={video.id}
              video={video}
              index={i}
              onSelect={onSelectVideo}
              onDismiss={dismiss}
            />
          ))
        )}
      </div>
    </motion.section>
  )
}
