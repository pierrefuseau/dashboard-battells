import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { WatchedChannel } from '@/types/database'

export function useWatchedChannels() {
  const [channels, setChannels] = useState<WatchedChannel[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('watched_channels')
      .select('*')
      .eq('is_active', true)
      .order('channel_name')

    setChannels((data as WatchedChannel[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addChannel = useCallback(async (channel: Omit<WatchedChannel, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('watched_channels').insert(channel).select().single()
    if (error) throw new Error(error.message)
    setChannels((prev) => [...prev, data as WatchedChannel])
    return data as WatchedChannel
  }, [])

  return { channels, loading, refetch: load, addChannel }
}
