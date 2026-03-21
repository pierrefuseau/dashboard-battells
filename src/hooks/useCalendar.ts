import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { ContentCalendarItem } from '@/types/database'

interface UseCalendarParams {
  month?: number
  year?: number
  status?: string
}

interface UseCalendarReturn {
  items: ContentCalendarItem[]
  loading: boolean
  error: string | null
  refetch: () => void
  addItem: (item: Omit<ContentCalendarItem, 'id' | 'created_at'>) => Promise<ContentCalendarItem>
  updateItem: (id: number, updates: Partial<ContentCalendarItem>) => Promise<void>
  deleteItem: (id: number) => Promise<void>
}

export function useCalendar({ month, year, status }: UseCalendarParams = {}): UseCalendarReturn {
  const [items, setItems] = useState<ContentCalendarItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    let query = supabase
      .from('content_calendar')
      .select('*')
      .order('planned_date', { ascending: true })

    if (status) query = query.eq('status', status)

    if (month !== undefined && year !== undefined) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const endDate = new Date(year, month, 0) // last day of month
      const end = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
      query = query.gte('planned_date', start).lte('planned_date', end)
    }

    const { data, error: err } = await query

    if (id !== fetchId.current) return
    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setItems((data as ContentCalendarItem[]) ?? [])
    setLoading(false)
  }, [month, year, status])

  useEffect(() => {
    fetch()
  }, [fetch])

  const addItem = useCallback(async (item: Omit<ContentCalendarItem, 'id' | 'created_at'>) => {
    const { data, error: err } = await supabase
      .from('content_calendar')
      .insert(item)
      .select()
      .single()

    if (err) throw new Error(err.message)
    const created = data as ContentCalendarItem
    setItems((prev) => [...prev, created].sort((a, b) =>
      (a.planned_date ?? '').localeCompare(b.planned_date ?? '')
    ))
    return created
  }, [])

  const updateItem = useCallback(async (id: number, updates: Partial<ContentCalendarItem>) => {
    const { error: err } = await supabase
      .from('content_calendar')
      .update(updates)
      .eq('id', id)

    if (err) throw new Error(err.message)
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, ...updates } : item))
        .sort((a, b) => (a.planned_date ?? '').localeCompare(b.planned_date ?? ''))
    )
  }, [])

  const deleteItem = useCallback(async (id: number) => {
    const { error: err } = await supabase
      .from('content_calendar')
      .delete()
      .eq('id', id)

    if (err) throw new Error(err.message)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return { items, loading, error, refetch: fetch, addItem, updateItem, deleteItem }
}
