import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Alert } from '@/types/database'

interface UseAlertsParams {
  unreadOnly?: boolean
  limit?: number
}

interface UseAlertsReturn {
  alerts: Alert[]
  loading: boolean
  error: string | null
  refetch: () => void
  markAsRead: (alertId: number) => Promise<void>
}

export function useAlerts({ unreadOnly = false, limit = 50 }: UseAlertsParams = {}): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) query = query.eq('is_read', false)

    const { data, error: err } = await query

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setAlerts((data as Alert[]) ?? [])
    setLoading(false)
  }, [unreadOnly, limit])

  useEffect(() => {
    fetch()
  }, [fetch])

  const markAsRead = useCallback(async (alertId: number) => {
    const { error: err } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', alertId)

    if (err) throw new Error(err.message)

    setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)))
  }, [])

  return { alerts, loading, error, refetch: fetch, markAsRead }
}
