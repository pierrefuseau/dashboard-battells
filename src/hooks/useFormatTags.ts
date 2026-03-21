import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { FormatTag } from '@/types/database'

interface UseFormatTagsReturn {
  tags: FormatTag[]
  loading: boolean
  error: string | null
  refetch: () => void
}

// Module-level cache so data is fetched only once across all component instances
let cachedTags: FormatTag[] | null = null
let cachePromise: Promise<void> | null = null

export function useFormatTags(): UseFormatTagsReturn {
  const [tags, setTags] = useState<FormatTag[]>(cachedTags ?? [])
  const [loading, setLoading] = useState(cachedTags === null)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const fetch = async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('format_tags')
      .select('*')
      .order('label', { ascending: true })

    if (!mounted.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    cachedTags = (data as FormatTag[]) ?? []
    setTags(cachedTags)
    setLoading(false)
  }

  useEffect(() => {
    if (cachedTags !== null) {
      setTags(cachedTags)
      setLoading(false)
      return
    }

    if (!cachePromise) {
      cachePromise = fetch().finally(() => { cachePromise = null })
    } else {
      cachePromise.then(() => {
        if (mounted.current && cachedTags) {
          setTags(cachedTags)
          setLoading(false)
        }
      })
    }
  }, [])

  const refetch = () => {
    cachedTags = null
    cachePromise = null
    fetch()
  }

  return { tags, loading, error, refetch }
}
