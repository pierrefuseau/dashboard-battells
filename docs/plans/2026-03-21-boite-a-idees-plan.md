# Boite a Idees BATTELLS — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an automated competitive intelligence radar that detects viral videos in the food/entertainment niche, suggests BATTELLS adaptations via Claude AI, and organizes ideas through a drag-and-drop kanban pipeline.

**Architecture:** New page `/idees` with two zones: a dark horizontal feed ("Le Radar") showing hot detections from the last 48h, and a light kanban board ("Le Kanban") with drag-and-drop columns for the production pipeline. A slide-in detail panel shows full analysis and AI coaching per idea. Data comes from Supabase tables fed by a daily n8n scraping workflow + manual URL input. Claude API via Edge Function provides analysis and adaptation suggestions.

**Tech Stack:** React 19, TypeScript, Tailwind 4, Framer Motion, React Spring (@react-spring/web), @dnd-kit/core + @dnd-kit/sortable (drag & drop), Supabase (DB + Edge Functions), n8n (scraping workflow)

---

## Task 1: Install @dnd-kit dependency

**Files:**
- Modify: `package.json`

**Step 1: Install @dnd-kit**

Run: `cd /Users/PierrePro/Documents/GitHub/dashboard-battells && npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

**Step 2: Verify install**

Run: `npm ls @dnd-kit/core`
Expected: `@dnd-kit/core@x.x.x`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit for kanban drag-and-drop"
```

---

## Task 2: Supabase schema — new tables and modified columns

**Files:**
- Create: `supabase/migrations/20260321_ideas_radar.sql`

**Step 1: Write the migration SQL**

```sql
-- Watched channels for scraping
CREATE TABLE IF NOT EXISTS watched_channels (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok')),
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  avg_views_30d INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('food_fr', 'food_intl', 'shorts_food', 'entertainment')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (platform, channel_id)
);

-- Detected viral videos from scraping
CREATE TABLE IF NOT EXISTS detected_videos (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok')),
  video_url TEXT NOT NULL UNIQUE,
  video_id TEXT,
  title TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_id TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  published_at TIMESTAMPTZ,
  overperformance_ratio REAL DEFAULT 1.0,
  heat_score REAL DEFAULT 0.0,
  detected_at TIMESTAMPTZ DEFAULT now(),
  is_dismissed BOOLEAN DEFAULT false
);

-- Extend video_ideas table
ALTER TABLE video_ideas
  ADD COLUMN IF NOT EXISTS detected_video_id INTEGER REFERENCES detected_videos(id),
  ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Update status enum check (drop old, add new)
-- Note: if status is a text column without constraint, this is a no-op
-- The app will enforce: 'backlog' | 'approved' | 'writing' | 'filmed' | 'editing' | 'published' | 'rejected'
```

**Step 2: Apply migration via Supabase MCP or dashboard**

Run migration against Supabase project.

**Step 3: Commit**

```bash
git add supabase/
git commit -m "feat(db): add watched_channels, detected_videos tables and extend video_ideas"
```

---

## Task 3: TypeScript types for new tables

**Files:**
- Modify: `src/types/database.ts`

**Step 1: Add types**

Add after the existing `VideoIdea` interface:

```typescript
export interface WatchedChannel {
  id: number
  platform: 'youtube' | 'tiktok'
  channel_id: string
  channel_name: string
  channel_url: string | null
  avg_views_30d: number
  category: 'food_fr' | 'food_intl' | 'shorts_food' | 'entertainment' | null
  is_active: boolean
  created_at: string
}

export interface DetectedVideo {
  id: number
  platform: 'youtube' | 'tiktok'
  video_url: string
  video_id: string | null
  title: string
  channel_name: string
  channel_id: string | null
  thumbnail_url: string | null
  views: number
  likes: number
  comments: number
  duration_seconds: number | null
  published_at: string | null
  overperformance_ratio: number
  heat_score: number
  detected_at: string
  is_dismissed: boolean
}
```

**Step 2: Update existing VideoIdea interface**

Add the new optional fields:

```typescript
export interface VideoIdea {
  // ... existing fields ...
  detected_video_id: number | null
  ai_analysis: {
    why_it_works?: string[]
    battells_adaptation?: string
    suggested_title?: string
    suggested_hook?: string
    gustavo_role?: string
    estimated_views?: number
    format_recommendation?: string
  } | null
  user_notes: string | null
}
```

**Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(types): add WatchedChannel, DetectedVideo types and extend VideoIdea"
```

---

## Task 4: Hook — useDetectedVideos

**Files:**
- Create: `src/hooks/useDetectedVideos.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Create the hook**

```typescript
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { DetectedVideo } from '@/types/database'

interface UseDetectedVideosParams {
  hoursBack?: number
  minHeatScore?: number
}

interface UseDetectedVideosReturn {
  videos: DetectedVideo[]
  loading: boolean
  error: string | null
  refetch: () => void
  dismiss: (id: number) => Promise<void>
}

export function useDetectedVideos({
  hoursBack = 48,
  minHeatScore = 0,
}: UseDetectedVideosParams = {}): UseDetectedVideosReturn {
  const [videos, setVideos] = useState<DetectedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

    const { data, error: err } = await supabase
      .from('detected_videos')
      .select('*')
      .eq('is_dismissed', false)
      .gte('detected_at', since)
      .gte('heat_score', minHeatScore)
      .order('heat_score', { ascending: false })

    if (id !== fetchId.current) return
    if (err) { setError(err.message); setLoading(false); return }

    setVideos((data as DetectedVideo[]) ?? [])
    setLoading(false)
  }, [hoursBack, minHeatScore])

  useEffect(() => { fetch() }, [fetch])

  const dismiss = useCallback(async (videoId: number) => {
    await supabase.from('detected_videos').update({ is_dismissed: true }).eq('id', videoId)
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }, [])

  return { videos, loading, error, refetch: fetch, dismiss }
}
```

**Step 2: Export from index**

Add to `src/hooks/index.ts`:
```typescript
export { useDetectedVideos } from './useDetectedVideos'
```

**Step 3: Commit**

```bash
git add src/hooks/useDetectedVideos.ts src/hooks/index.ts
git commit -m "feat(hooks): add useDetectedVideos for radar feed"
```

---

## Task 5: Hook — useWatchedChannels

**Files:**
- Create: `src/hooks/useWatchedChannels.ts`
- Modify: `src/hooks/index.ts`

**Step 1: Create the hook**

```typescript
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { WatchedChannel } from '@/types/database'

export function useWatchedChannels() {
  const [channels, setChannels] = useState<WatchedChannel[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('watched_channels')
      .select('*')
      .eq('is_active', true)
      .order('channel_name')

    setChannels((data as WatchedChannel[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const addChannel = useCallback(async (channel: Omit<WatchedChannel, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('watched_channels').insert(channel).select().single()
    if (error) throw new Error(error.message)
    setChannels((prev) => [...prev, data as WatchedChannel])
    return data as WatchedChannel
  }, [])

  return { channels, loading, refetch: fetch, addChannel }
}
```

**Step 2: Export from index**

Add to `src/hooks/index.ts`:
```typescript
export { useWatchedChannels } from './useWatchedChannels'
```

**Step 3: Commit**

```bash
git add src/hooks/useWatchedChannels.ts src/hooks/index.ts
git commit -m "feat(hooks): add useWatchedChannels for channel management"
```

---

## Task 6: Radar — HeatCard component

**Files:**
- Create: `src/pages/Ideas/components/HeatCard.tsx`

**Step 1: Create the component**

A dark glassmorphism card for the Radar feed. Shows thumbnail, channel, overperformance stats, and a heat indicator bar.

```typescript
import { motion } from 'framer-motion'
import { useSpring, animated } from '@react-spring/web'
import { ExternalLink, X } from 'lucide-react'
import type { DetectedVideo } from '@/types/database'

interface HeatCardProps {
  video: DetectedVideo
  index: number
  onSelect: (video: DetectedVideo) => void
  onDismiss: (id: number) => void
}

function heatColor(score: number): string {
  if (score >= 0.7) return 'var(--color-error)'       // rouge — viral
  if (score >= 0.4) return 'var(--color-primary)'      // orange — chaud
  return 'var(--color-secondary)'                       // jaune — tiede
}

function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
  const { number } = useSpring({ number: value, from: { number: 0 }, config: { duration: 800 } })
  return <animated.span>{number.to((n) => `${n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n)}${suffix}`)}</animated.span>
}

export default function HeatCard({ video, index, onSelect, onDismiss }: HeatCardProps) {
  const overPerf = Math.round((video.overperformance_ratio - 1) * 100)

  return (
    <motion.div
      className="relative flex-shrink-0 w-72 rounded-[var(--radius-card-lg)] overflow-hidden cursor-pointer group"
      style={{
        background: 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(12px)',
        border: `1px solid rgba(255, 255, 255, 0.08)`,
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
      {/* Heat indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[var(--radius-card-lg)]"
        style={{ backgroundColor: heatColor(video.heat_score) }}
      />

      {/* Dismiss button */}
      <button
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/40 hover:text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer"
        onClick={(e) => { e.stopPropagation(); onDismiss(video.id) }}
        aria-label="Ignorer cette detection"
      >
        <X size={14} />
      </button>

      {/* Thumbnail */}
      {video.thumbnail_url && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(13,13,13,0.9)] to-transparent" />
          {/* Platform badge */}
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

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs font-[var(--font-space-grotesk)]">
          <span className="text-white/70">
            <AnimatedStat value={video.views} /> vues
          </span>
          {overPerf > 0 && (
            <span
              className="font-bold"
              style={{ color: heatColor(video.heat_score) }}
            >
              +{overPerf}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/HeatCard.tsx
git commit -m "feat(ideas): add HeatCard component for radar feed"
```

---

## Task 7: Radar — RadarFeed section component

**Files:**
- Create: `src/pages/Ideas/components/RadarFeed.tsx`

**Step 1: Create the component**

The dark horizontal scrollable section with "DETECTIONS CHAUDES" title, scan button, and add-link button.

```typescript
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
      className="relative rounded-[var(--radius-card-lg)] overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-secondary) 100%)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse at 20% 50%, rgba(255,107,0,0.15) 0%, transparent 60%)',
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
            className="absolute left-2 top-1/2 translate-y-2 z-20 w-8 h-8 rounded-full bg-black/40 text-white/60 hover:text-white flex items-center justify-center cursor-pointer"
            aria-label="Defiler a gauche"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 translate-y-2 z-20 w-8 h-8 rounded-full bg-black/40 text-white/60 hover:text-white flex items-center justify-center cursor-pointer"
            aria-label="Defiler a droite"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Cards feed */}
      <div
        ref={scrollRef}
        className="relative z-10 flex gap-4 overflow-x-auto px-6 pb-5 pt-2 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
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
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/RadarFeed.tsx
git commit -m "feat(ideas): add RadarFeed section with horizontal scroll"
```

---

## Task 8: Kanban — KanbanCard component

**Files:**
- Create: `src/pages/Ideas/components/KanbanCard.tsx`

**Step 1: Create the component**

A draggable card for the kanban. Uses @dnd-kit/sortable.

```typescript
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui'
import { FORMAT_TAGS } from '@/lib/constants'
import type { VideoIdea } from '@/types/database'

interface KanbanCardProps {
  idea: VideoIdea
  onClick: (idea: VideoIdea) => void
}

export default function KanbanCard({ idea, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: idea.id,
    data: { idea },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    scale: isDragging ? '1.02' : '1',
  }

  const formatInfo = idea.format_tag
    ? FORMAT_TAGS[idea.format_tag as keyof typeof FORMAT_TAGS]
    : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="card card-hover p-3 space-y-2 cursor-grab active:cursor-grabbing"
      onClick={() => onClick(idea)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(idea)}
      aria-label={`Idee: ${idea.title}`}
    >
      <h4 className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary leading-snug line-clamp-2">
        {idea.title}
      </h4>

      {formatInfo && (
        <span
          className="badge text-[10px]"
          style={{ backgroundColor: `${formatInfo.color}15`, color: formatInfo.color }}
        >
          {formatInfo.label}
        </span>
      )}

      {idea.ai_analysis?.estimated_views && (
        <p className="text-[11px] text-text-tertiary font-[var(--font-space-grotesk)]">
          ~{(idea.ai_analysis.estimated_views / 1000).toFixed(0)}K vues estimees
        </p>
      )}

      {idea.source && (
        <span className="text-[10px] text-text-tertiary uppercase tracking-wider">
          {idea.source === 'ai' ? 'IA' : idea.source === 'competitor' ? 'Concurrent' : idea.source}
        </span>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/KanbanCard.tsx
git commit -m "feat(ideas): add KanbanCard draggable component"
```

---

## Task 9: Kanban — KanbanColumn component

**Files:**
- Create: `src/pages/Ideas/components/KanbanColumn.tsx`

**Step 1: Create the component**

```typescript
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import type { VideoIdea } from '@/types/database'
import KanbanCard from './KanbanCard'

export interface KanbanColumnDef {
  id: string
  label: string
  color: string
}

interface KanbanColumnProps {
  column: KanbanColumnDef
  ideas: VideoIdea[]
  onCardClick: (idea: VideoIdea) => void
}

export default function KanbanColumn({ column, ideas, onCardClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[240px] max-w-[280px] flex-1 rounded-[var(--radius-card)] transition-colors duration-200 ${
        isOver ? 'bg-primary-50' : 'bg-transparent'
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
        <h3 className="text-xs font-[var(--font-clash)] font-bold text-text-primary uppercase tracking-wide">
          {column.label}
        </h3>
        <motion.span
          key={ideas.length}
          className="badge bg-border-light text-text-secondary text-[10px] !h-5 !px-1.5"
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {ideas.length}
        </motion.span>
      </div>

      {/* Cards */}
      <SortableContext items={ideas.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 px-1 pb-2 min-h-[120px]">
          {ideas.length === 0 ? (
            <p className="text-[11px] text-text-tertiary text-center py-6 font-[var(--font-satoshi)] italic">
              {column.id === 'backlog' && 'Les nouvelles idees arrivent ici'}
              {column.id === 'approved' && 'Glisse une idee ici pour l\'approuver'}
              {column.id === 'writing' && 'Idees en cours d\'ecriture'}
              {column.id === 'filmed' && 'Videos tournees'}
              {column.id === 'editing' && 'En post-production'}
              {column.id === 'published' && 'Publiees — bravo !'}
            </p>
          ) : (
            ideas.map((idea) => (
              <KanbanCard key={idea.id} idea={idea} onClick={onCardClick} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/KanbanColumn.tsx
git commit -m "feat(ideas): add KanbanColumn with droppable zone"
```

---

## Task 10: Kanban — KanbanBoard container

**Files:**
- Create: `src/pages/Ideas/components/KanbanBoard.tsx`

**Step 1: Create the component**

Manages DndContext, handles drag events, and dispatches status updates.

```typescript
import { useState, useCallback } from 'react'
import { DndContext, DragOverlay, closestCorners, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { useVideoIdeas } from '@/hooks'
import type { VideoIdea } from '@/types/database'
import KanbanColumn, { type KanbanColumnDef } from './KanbanColumn'
import KanbanCard from './KanbanCard'

const COLUMNS: KanbanColumnDef[] = [
  { id: 'backlog', label: 'Backlog', color: 'var(--color-text-tertiary)' },
  { id: 'approved', label: 'Approuve', color: 'var(--color-primary)' },
  { id: 'writing', label: 'En ecriture', color: 'var(--color-info)' },
  { id: 'filmed', label: 'Filme', color: 'var(--color-secondary)' },
  { id: 'editing', label: 'Monte', color: '#8B5CF6' },
  { id: 'published', label: 'Publie', color: 'var(--color-success)' },
]

interface KanbanBoardProps {
  onCardClick: (idea: VideoIdea) => void
}

export default function KanbanBoard({ onCardClick }: KanbanBoardProps) {
  const { ideas, loading, updateIdea } = useVideoIdeas()
  const [activeIdea, setActiveIdea] = useState<VideoIdea | null>(null)

  const ideasByStatus = useCallback(
    (status: string) => ideas.filter((i) => i.status === status),
    [ideas]
  )

  function handleDragStart(event: DragStartEvent) {
    const idea = ideas.find((i) => i.id === event.active.id)
    setActiveIdea(idea ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveIdea(null)
    const { active, over } = event
    if (!over) return

    const newStatus = over.id as string
    const idea = ideas.find((i) => i.id === active.id)
    if (!idea || idea.status === newStatus) return

    // Check if dropped on a column (not another card)
    const isColumn = COLUMNS.some((c) => c.id === newStatus)
    if (!isColumn) return

    await updateIdea(idea.id, { status: newStatus })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-[var(--font-bebas)] tracking-[0.15em] text-text-secondary uppercase">
          Pipeline de production
        </h2>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.id} className="min-w-[240px] max-w-[280px] flex-1 space-y-2">
              <div className="skeleton h-8 w-24 rounded" />
              <div className="skeleton h-24 rounded-[var(--radius-card)]" />
              <div className="skeleton h-24 rounded-[var(--radius-card)]" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                ideas={ideasByStatus(col.id)}
                onCardClick={onCardClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeIdea && <KanbanCard idea={activeIdea} onClick={() => {}} />}
          </DragOverlay>
        </DndContext>
      )}
    </motion.section>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/KanbanBoard.tsx
git commit -m "feat(ideas): add KanbanBoard with drag-and-drop pipeline"
```

---

## Task 11: Detail panel — IdeaDetailPanel

**Files:**
- Create: `src/pages/Ideas/components/IdeaDetailPanel.tsx`

**Step 1: Create the component**

Reuses the existing `DetailPanel` wrapper. Shows the full idea + detected video + AI analysis.

```typescript
import { useState } from 'react'
import { ExternalLink, Sparkles, Check, ThumbsDown } from 'lucide-react'
import { DetailPanel, Badge } from '@/components/ui'
import { FORMAT_TAGS } from '@/lib/constants'
import type { VideoIdea, DetectedVideo } from '@/types/database'

interface IdeaDetailPanelProps {
  idea: VideoIdea | null
  detectedVideo: DetectedVideo | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: number) => Promise<void>
  onReject: (id: number) => Promise<void>
  onUpdateNotes: (id: number, notes: string) => Promise<void>
}

export default function IdeaDetailPanel({
  idea, detectedVideo, isOpen, onClose, onApprove, onReject, onUpdateNotes,
}: IdeaDetailPanelProps) {
  const [notes, setNotes] = useState(idea?.user_notes ?? '')
  const [saving, setSaving] = useState(false)

  if (!idea) return null

  const analysis = idea.ai_analysis
  const formatInfo = idea.format_tag
    ? FORMAT_TAGS[idea.format_tag as keyof typeof FORMAT_TAGS]
    : null

  async function handleSaveNotes() {
    setSaving(true)
    await onUpdateNotes(idea!.id, notes)
    setSaving(false)
  }

  return (
    <DetailPanel isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* Source video */}
        {detectedVideo && (
          <div className="space-y-3">
            {detectedVideo.thumbnail_url && (
              <a
                href={detectedVideo.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-[var(--radius-card)] overflow-hidden group cursor-pointer"
              >
                <img src={detectedVideo.thumbnail_url} alt={detectedVideo.title} className="w-full aspect-video object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink size={24} className="text-white" />
                </div>
              </a>
            )}
            <div>
              <p className="text-xs text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">Video source</p>
              <p className="text-sm font-semibold font-[var(--font-satoshi)] text-text-primary">{detectedVideo.title}</p>
              <p className="text-xs text-text-secondary mt-1">{detectedVideo.channel_name} — {detectedVideo.platform}</p>
              <div className="flex gap-3 mt-2 text-xs font-[var(--font-space-grotesk)] text-text-secondary">
                <span>{(detectedVideo.views / 1000).toFixed(0)}K vues</span>
                <span>{(detectedVideo.likes / 1000).toFixed(0)}K likes</span>
                <span>+{Math.round((detectedVideo.overperformance_ratio - 1) * 100)}% vs moyenne</span>
              </div>
            </div>
          </div>
        )}

        {/* Separator */}
        <div className="h-px bg-border" />

        {/* Idea title */}
        <div>
          <h3 className="text-lg font-bold font-[var(--font-clash)] text-text-primary">{idea.title}</h3>
          {formatInfo && (
            <span className="badge mt-2 text-[10px]" style={{ backgroundColor: `${formatInfo.color}15`, color: formatInfo.color }}>
              {formatInfo.label}
            </span>
          )}
        </div>

        {/* AI Analysis — Why it works */}
        {analysis?.why_it_works && analysis.why_it_works.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <p className="text-xs font-[var(--font-bebas)] tracking-[0.1em] text-text-secondary uppercase">Pourquoi ca marche</p>
            </div>
            <ul className="space-y-1.5">
              {analysis.why_it_works.map((point, i) => (
                <li key={i} className="text-sm text-text-secondary font-[var(--font-satoshi)] flex gap-2">
                  <span className="text-primary mt-0.5">-</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* AI Analysis — BATTELLS Adaptation */}
        {analysis?.battells_adaptation && (
          <div className="card-accent p-4 space-y-2">
            <p className="text-xs font-[var(--font-bebas)] tracking-[0.1em] text-primary uppercase">Adaptation BATTELLS</p>
            <p className="text-sm text-text-primary font-[var(--font-satoshi)]">{analysis.battells_adaptation}</p>
            {analysis.suggested_hook && (
              <p className="text-xs text-text-secondary"><strong>Hook:</strong> {analysis.suggested_hook}</p>
            )}
            {analysis.gustavo_role && (
              <p className="text-xs text-text-secondary"><strong>Gustavo:</strong> {analysis.gustavo_role}</p>
            )}
            {analysis.estimated_views && (
              <p className="text-xs text-text-tertiary font-[var(--font-space-grotesk)]">
                ~{(analysis.estimated_views / 1000).toFixed(0)}K vues estimees
              </p>
            )}
          </div>
        )}

        {/* User notes */}
        <div className="space-y-2">
          <label className="text-xs font-[var(--font-bebas)] tracking-[0.1em] text-text-secondary uppercase">
            Notes de Baptiste
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajoute tes idees, ton angle, tes notes..."
            className="w-full h-24 p-3 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary resize-none focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSaveNotes}
            disabled={saving || notes === (idea.user_notes ?? '')}
            className="btn-secondary !h-8 !text-xs cursor-pointer"
          >
            {saving ? 'Sauvegarde...' : 'Sauvegarder les notes'}
          </button>
        </div>

        {/* Action buttons */}
        {idea.status === 'backlog' && (
          <div className="flex gap-3 pt-2">
            <button onClick={() => onApprove(idea.id)} className="btn-primary flex-1 cursor-pointer">
              <Check size={16} className="mr-2" /> Approuver
            </button>
            <button onClick={() => onReject(idea.id)} className="btn-secondary flex-1 cursor-pointer">
              <ThumbsDown size={16} className="mr-2" /> Rejeter
            </button>
          </div>
        )}
      </div>
    </DetailPanel>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/IdeaDetailPanel.tsx
git commit -m "feat(ideas): add IdeaDetailPanel with AI analysis and notes"
```

---

## Task 12: Add Link modal — AddLinkModal

**Files:**
- Create: `src/pages/Ideas/components/AddLinkModal.tsx`

**Step 1: Create the component**

Simple modal to paste a YouTube/TikTok URL for manual detection.

```typescript
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link as LinkIcon } from 'lucide-react'

interface AddLinkModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (url: string) => Promise<void>
}

export default function AddLinkModal({ isOpen, onClose, onSubmit }: AddLinkModalProps) {
  const [url, setUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmed = url.trim()
    if (!trimmed) return

    const isValid = /youtube\.com|youtu\.be|tiktok\.com/.test(trimmed)
    if (!isValid) {
      setError('Colle un lien YouTube ou TikTok valide')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setUrl('')
      onClose()
    } catch {
      setError('Erreur lors de l\'ajout. Reessaie.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-[var(--z-modal)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface rounded-[var(--radius-card-lg)] shadow-[var(--shadow-modal)] z-[var(--z-modal)] p-6"
            initial={{ opacity: 0, scale: 0.95, y: '-48%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-[var(--radius-button)] text-text-secondary hover:text-text-primary cursor-pointer"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <LinkIcon size={20} className="text-primary" />
              <h3 className="text-base font-bold font-[var(--font-clash)] text-text-primary">
                Ajouter une video
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... ou tiktok.com/..."
                  className="w-full h-11 px-4 rounded-[var(--radius-input)] border border-border bg-surface text-sm font-[var(--font-satoshi)] text-text-primary focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
                {error && <p className="text-xs text-error mt-1.5">{error}</p>}
              </div>
              <button type="submit" disabled={submitting || !url.trim()} className="btn-primary w-full cursor-pointer">
                {submitting ? 'Analyse en cours...' : 'Analyser et ajouter'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/components/AddLinkModal.tsx
git commit -m "feat(ideas): add AddLinkModal for manual URL input"
```

---

## Task 13: Main page — Ideas index

**Files:**
- Create: `src/pages/Ideas/index.tsx`

**Step 1: Create the page**

Assembles RadarFeed + KanbanBoard + IdeaDetailPanel + AddLinkModal.

```typescript
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useVideoIdeas } from '@/hooks'
import type { VideoIdea, DetectedVideo } from '@/types/database'
import RadarFeed from './components/RadarFeed'
import KanbanBoard from './components/KanbanBoard'
import IdeaDetailPanel from './components/IdeaDetailPanel'
import AddLinkModal from './components/AddLinkModal'

export default function Ideas() {
  const { updateIdea } = useVideoIdeas()
  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null)
  const [selectedDetectedVideo, setSelectedDetectedVideo] = useState<DetectedVideo | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [linkModalOpen, setLinkModalOpen] = useState(false)

  const handleSelectDetectedVideo = useCallback(async (video: DetectedVideo) => {
    setSelectedDetectedVideo(video)

    // Check if an idea already exists for this detected video
    const { data } = await supabase
      .from('video_ideas')
      .select('*')
      .eq('detected_video_id', video.id)
      .single()

    if (data) {
      setSelectedIdea(data as VideoIdea)
    } else {
      // Create a new idea from the detection
      const { data: newIdea } = await supabase
        .from('video_ideas')
        .insert({
          title: video.title,
          source: 'competitor',
          detected_video_id: video.id,
          status: 'backlog',
          is_long_form: false,
        })
        .select()
        .single()

      setSelectedIdea(newIdea as VideoIdea)
    }
    setPanelOpen(true)
  }, [])

  const handleSelectIdea = useCallback(async (idea: VideoIdea) => {
    setSelectedIdea(idea)

    if (idea.detected_video_id) {
      const { data } = await supabase
        .from('detected_videos')
        .select('*')
        .eq('id', idea.detected_video_id)
        .single()
      setSelectedDetectedVideo(data as DetectedVideo | null)
    } else {
      setSelectedDetectedVideo(null)
    }
    setPanelOpen(true)
  }, [])

  const handleApprove = useCallback(async (id: number) => {
    await updateIdea(id, { status: 'approved' })
    setPanelOpen(false)
  }, [updateIdea])

  const handleReject = useCallback(async (id: number) => {
    await updateIdea(id, { status: 'rejected' })
    setPanelOpen(false)
  }, [updateIdea])

  const handleUpdateNotes = useCallback(async (id: number, notes: string) => {
    await updateIdea(id, { user_notes: notes } as Partial<VideoIdea>)
  }, [updateIdea])

  const handleAddLink = useCallback(async (url: string) => {
    // Insert as detected video, then create idea
    const platform = url.includes('tiktok') ? 'tiktok' : 'youtube'
    const { data: video } = await supabase
      .from('detected_videos')
      .insert({
        platform,
        video_url: url,
        title: 'Analyse en cours...',
        channel_name: 'Inconnu',
        heat_score: 0.5,
      })
      .select()
      .single()

    if (video) {
      const detected = video as DetectedVideo
      handleSelectDetectedVideo(detected)
    }
  }, [handleSelectDetectedVideo])

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <RadarFeed
        onSelectVideo={handleSelectDetectedVideo}
        onAddLink={() => setLinkModalOpen(true)}
      />

      <KanbanBoard onCardClick={handleSelectIdea} />

      <IdeaDetailPanel
        idea={selectedIdea}
        detectedVideo={selectedDetectedVideo}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onUpdateNotes={handleUpdateNotes}
      />

      <AddLinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onSubmit={handleAddLink}
      />
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Ideas/index.tsx
git commit -m "feat(ideas): add Ideas page assembling radar, kanban, panel, modal"
```

---

## Task 14: Wire up routing and navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/constants.ts`
- Modify: `src/components/layout/Sidebar.tsx`

**Step 1: Add route to App.tsx**

Add import and Route for Ideas page:

```typescript
// Add import
import Ideas from '@/pages/Ideas'

// Add route inside <Routes>
<Route path="/idees" element={<Ideas />} />
```

**Step 2: Add nav item to constants.ts**

Add to the 'PRODUCTION' section in NAV_SECTIONS:

```typescript
{
  label: 'PRODUCTION',
  items: [
    { id: 'ideas', label: 'Boite a idees', icon: 'lightbulb', path: '/idees' },
    { id: 'calendar', label: 'Calendrier', icon: 'calendar', path: '/calendrier' },
  ],
},
```

**Step 3: Verify Sidebar icon mapping**

Check that `lightbulb: Lightbulb` is already in the iconMap in Sidebar.tsx (it is — line 11).

**Step 4: Commit**

```bash
git add src/App.tsx src/lib/constants.ts
git commit -m "feat(routing): add /idees route and sidebar navigation"
```

---

## Task 15: Seed watched_channels with curated list

**Files:**
- Create: `supabase/seeds/watched_channels.sql`

**Step 1: Write the seed data**

A curated list of high-performing channels in the food + entertainment niche:

```sql
INSERT INTO watched_channels (platform, channel_id, channel_name, channel_url, category, is_active) VALUES
-- Food FR
('youtube', 'UCun3kLMBjOe_YALSaKxarIg', 'FastGoodCuisine', 'https://youtube.com/@FastGoodCuisine', 'food_fr', true),
('youtube', 'UCT0RY6LDFIH-UwaqfbwQFTQ', 'Gastronogeek', 'https://youtube.com/@Gastronogeek', 'food_fr', true),
('youtube', 'UCJmhFGl8YjlFhJl0ltFZ59Q', 'IbraTV', 'https://youtube.com/@IbraTV', 'food_fr', true),
('youtube', 'UCVJnSxQo8F7d9LT-I97W9Ig', 'Valouzz', 'https://youtube.com/@Valouzz', 'food_fr', true),

-- Food International
('youtube', 'UCMyOj6fhvKFMjxUCpkVj3dg', 'Nick DiGiovanni', 'https://youtube.com/@NickDigiovanni', 'food_intl', true),
('youtube', 'UCcjhYlDx7Kp_GXophkLaFNg', 'Mythical Kitchen', 'https://youtube.com/@mythicalkitchen', 'food_intl', true),
('youtube', 'UChBEbMKI1eCcejTtmI32UEw', 'Joshua Weissman', 'https://youtube.com/@JoshuaWeissman', 'food_intl', true),
('youtube', 'UCDq5v10l4wkV5-ZBIJJFbzQ', 'CZN Burak', 'https://youtube.com/@cznburak', 'food_intl', true),

-- Shorts Food Viral
('youtube', 'UCIwFjwMjI0y7PDBVEO9-bkQ', 'Bayashi', 'https://youtube.com/@BayashiTV', 'shorts_food', true),
('youtube', 'UCe5bH4EPQY-dPp10nDuePbQ', 'That Little Puff', 'https://youtube.com/@ThatLittlePuff', 'shorts_food', true),
('youtube', 'UCJHA_jMfCvEnv-3kRjTCQXw', 'Binging with Babish', 'https://youtube.com/@BabishCulinaryUniverse', 'shorts_food', true),

-- Entertainment/Humor (formats adaptables food)
('youtube', 'UCWOA1ZGiwLbDQJk2xYePJTA', 'Squeezie', 'https://youtube.com/@Squeezie', 'entertainment', true),
('youtube', 'UCWeg2Pkate69NFdBeuRFTAw', 'Michou', 'https://youtube.com/@Michou', 'entertainment', true),
('youtube', 'UCmtOvXHn0WKJB8AZ8e6WHaQ', 'ZHC', 'https://youtube.com/@ZHC', 'entertainment', true),
('youtube', 'UCX6OQ3DkcsbYNE6H8uQQuVA', 'MrBeast', 'https://youtube.com/@MrBeast', 'entertainment', true),

-- TikTok food
('tiktok', 'bayashi.tiktok', 'Bayashi', 'https://tiktok.com/@bayashi.tiktok', 'shorts_food', true),
('tiktok', 'cznburak', 'CZN Burak', 'https://tiktok.com/@cznburak', 'shorts_food', true),
('tiktok', 'nick.digiovanni', 'Nick DiGiovanni', 'https://tiktok.com/@nick.digiovanni', 'food_intl', true),
('tiktok', 'khaby.lame', 'Khaby Lame', 'https://tiktok.com/@khaby.lame', 'entertainment', true)
ON CONFLICT (platform, channel_id) DO NOTHING;
```

**Step 2: Apply seed via Supabase**

**Step 3: Commit**

```bash
git add supabase/seeds/
git commit -m "feat(db): seed watched_channels with curated creator list"
```

---

## Task 16: Build verification

**Step 1: Run build**

```bash
cd /Users/PierrePro/Documents/GitHub/dashboard-battells && npm run build
```

Expected: Build succeeds with no TypeScript errors.

**Step 2: Fix any type errors**

If build fails, fix errors and re-run.

**Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve build errors for Ideas module"
```

---

## Future Tasks (Phase 2 — not in this plan)

These are documented for later implementation:

- **n8n scraping workflow** — daily cron that scrapes watched_channels, computes overperformance_ratio and heat_score, inserts into detected_videos
- **Supabase Edge Function** — Claude API integration for AI analysis (why_it_works, battells_adaptation, suggested_hook, gustavo_role)
- **Enrichment on manual add** — when user pastes a URL, call Edge Function to fetch video metadata + run AI analysis
- **Celebration animation** — confetti particles on "published" status change
- **Mobile responsive** — accordion kanban for mobile viewport
- **Published confetti** — canvas-confetti library for celebration moment
