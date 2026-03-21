import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { IgPost } from '@/types/database'

interface UseInstagramPostsReturn {
  posts: IgPost[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useInstagramPosts(): UseInstagramPostsReturn {
  const [posts, setPosts] = useState<IgPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('ig_posts')
      .select('*')
      .order('published_at', { ascending: false })

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setPosts((data as IgPost[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { posts, loading, error, refetch: fetch }
}
