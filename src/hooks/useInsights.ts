import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { AiInsight } from '@/types/database'

interface UseInsightsParams {
  type?: string
  unreadOnly?: boolean
  limit?: number
}

interface UseInsightsReturn {
  insights: AiInsight[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useInsights({ type, unreadOnly = false, limit = 50 }: UseInsightsParams = {}): UseInsightsReturn {
  const [insights, setInsights] = useState<AiInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from('ai_insights')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (type) query = query.eq('type', type)
    if (unreadOnly) query = query.eq('is_read', false)

    const { data, error: err } = await query

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setInsights((data as AiInsight[]) ?? [])
    setLoading(false)
  }, [type, unreadOnly, limit])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { insights, loading, error, refetch: fetch }
}
