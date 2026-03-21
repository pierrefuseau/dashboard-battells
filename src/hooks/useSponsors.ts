import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Sponsor } from '@/types/database'

interface UseSponsorsParams {
  status?: string
}

interface PipelineStats {
  countByStatus: Record<string, number>
  amountByStatus: Record<string, number>
}

interface UseSponsorsReturn {
  sponsors: Sponsor[]
  pipeline: PipelineStats
  loading: boolean
  error: string | null
  refetch: () => void
  addSponsor: (sponsor: Omit<Sponsor, 'id' | 'created_at'>) => Promise<Sponsor>
  updateSponsor: (id: number, updates: Partial<Sponsor>) => Promise<void>
}

export function useSponsors({ status }: UseSponsorsParams = {}): UseSponsorsReturn {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from('sponsors')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error: err } = await query

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSponsors((data as Sponsor[]) ?? [])
    setLoading(false)
  }, [status])

  useEffect(() => {
    fetch()
  }, [fetch])

  const pipeline = useMemo<PipelineStats>(() => {
    const countByStatus: Record<string, number> = {}
    const amountByStatus: Record<string, number> = {}

    for (const s of sponsors) {
      countByStatus[s.status] = (countByStatus[s.status] ?? 0) + 1
      amountByStatus[s.status] = (amountByStatus[s.status] ?? 0) + (s.amount ?? 0)
    }

    return { countByStatus, amountByStatus }
  }, [sponsors])

  const addSponsor = useCallback(async (sponsor: Omit<Sponsor, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase
      .from('sponsors')
      .insert(sponsor)
      .select()
      .single()

    if (err) throw new Error(err.message)
    const created = data as Sponsor
    setSponsors((prev) => [created, ...prev])
    return created
  }, [])

  const updateSponsor = useCallback(async (id: number, updates: Partial<Sponsor>) => {
    const { error: err } = await supabase
      .from('sponsors')
      .update(updates)
      .eq('id', id)

    if (err) throw new Error(err.message)
    setSponsors((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }, [])

  return { sponsors, pipeline, loading, error, refetch: fetch, addSponsor, updateSponsor }
}
