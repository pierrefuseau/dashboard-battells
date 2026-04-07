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

    let finalData = (data as YtVideo[]) ?? []
    
    // Si c'est sans offset (première page) et qu'on a moins de recents, on merge le flux RSS in-memory pour compenser la panne N8N
    if (offset === 0) {
      const { fetchDirectRssVideos } = await import('@/lib/youtube.ts')
      const rssVideos = await fetchDirectRssVideos()
      const merged = [...finalData]
      for (const rv of rssVideos) {
        if (!merged.find(m => m.id === rv.id)) {
          merged.push(rv as any)
        }
      }
      // Re-trier le flux consolidé
      merged.sort((a,b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
      finalData = merged
    }

    setVideos(finalData)
    setTotal(Math.max(count ?? 0, finalData.length))
    setLoading(false)
  }, [isShort, formatTag, language, search, limit, offset])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { videos, total, loading, error, refetch: fetch }
}
