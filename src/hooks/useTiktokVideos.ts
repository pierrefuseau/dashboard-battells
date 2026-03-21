import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { TiktokVideo } from '@/types/database'

interface UseTiktokVideosReturn {
  videos: TiktokVideo[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTiktokVideos(): UseTiktokVideosReturn {
  const [videos, setVideos] = useState<TiktokVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('tiktok_videos')
      .select('*')
      .order('published_at', { ascending: false })

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setVideos((data as TiktokVideo[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { videos, loading, error, refetch: fetch }
}
