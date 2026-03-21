import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { VideoIdea } from '@/types/database'

interface UseVideoIdeasParams {
  status?: string
  source?: string
}

interface UseVideoIdeasReturn {
  ideas: VideoIdea[]
  loading: boolean
  error: string | null
  refetch: () => void
  addIdea: (idea: Omit<VideoIdea, 'id' | 'created_at'>) => Promise<VideoIdea>
  updateIdea: (id: number, updates: Partial<VideoIdea>) => Promise<void>
}

export function useVideoIdeas({ status, source }: UseVideoIdeasParams = {}): UseVideoIdeasReturn {
  const [ideas, setIdeas] = useState<VideoIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from('video_ideas')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (source) query = query.eq('source', source)

    const { data, error: err } = await query

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setIdeas((data as VideoIdea[]) ?? [])
    setLoading(false)
  }, [status, source])

  useEffect(() => {
    fetch()
  }, [fetch])

  const addIdea = useCallback(async (idea: Omit<VideoIdea, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase
      .from('video_ideas')
      .insert(idea)
      .select()
      .single()

    if (err) throw new Error(err.message)
    const created = data as VideoIdea
    setIdeas((prev) => [created, ...prev])
    return created
  }, [])

  const updateIdea = useCallback(async (id: number, updates: Partial<VideoIdea>) => {
    const { error: err } = await supabase
      .from('video_ideas')
      .update(updates)
      .eq('id', id)

    if (err) throw new Error(err.message)
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }, [])

  return { ideas, loading, error, refetch: fetch, addIdea, updateIdea }
}
