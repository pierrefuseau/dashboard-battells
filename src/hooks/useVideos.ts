import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { YtVideo } from '@/types/database'

interface UseVideosParams {
  isShort?: boolean
  formatTag?: string
  language?: string
  search?: string
  limit?: number
  offset?: number
}

interface UseVideosReturn {
  videos: YtVideo[]
  total: number
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useVideos(params: UseVideosParams = {}): UseVideosReturn {
  const { isShort, formatTag, language, search, limit = 50, offset = 0 } = params
  const [videos, setVideos] = useState<YtVideo[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from('yt_videos')
      .select('*', { count: 'exact' })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (isShort !== undefined) query = query.eq('is_short', isShort)
    if (formatTag) query = query.eq('format_tag', formatTag)
    if (language) query = query.eq('language', language)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error: err, count } = await query

    if (id !== fetchId.current) return // stale
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setVideos((data as YtVideo[]) ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [isShort, formatTag, language, search, limit, offset])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { videos, total, loading, error, refetch: fetch }
}
