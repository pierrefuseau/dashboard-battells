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

  const load = useCallback(async () => {
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

  useEffect(() => { load() }, [load])

  const dismiss = useCallback(async (videoId: number) => {
    await supabase.from('detected_videos').update({ is_dismissed: true }).eq('id', videoId)
    setVideos((prev) => prev.filter((v) => v.id !== videoId))
  }, [])

  return { videos, loading, error, refetch: load, dismiss }
}
