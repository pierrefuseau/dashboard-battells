import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchDirectRssVideos } from '@/lib/youtube'
import type { YouTubeSyncStatus } from '@/lib/youtube'

interface UseYouTubeSyncReturn {
  syncStatus: YouTubeSyncStatus
  loading: boolean
  isSyncingDirectly: boolean
  error: string | null
  refetch: () => void
  forceApiSync: () => Promise<boolean>
}

const emptySyncStatus: YouTubeSyncStatus = {
  lastSync: null,
  videosCount: 0,
  dailyStatsCount: 0,
  channelDailyCount: 0,
  isStale: true,
}

const STALE_THRESHOLD_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useYouTubeSync(): UseYouTubeSyncReturn {
  const [syncStatus, setSyncStatus] = useState<YouTubeSyncStatus>(emptySyncStatus)
  const [loading, setLoading] = useState(true)
  const [isSyncingDirectly, setIsSyncingDirectly] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fetchId = useRef(0)

  const fetch = useCallback(async () => {
    const id = ++fetchId.current
    setLoading(true)
    setError(null)

    try {
      // Run all count queries in parallel
      const [videosRes, dailyStatsRes, channelDailyRes, lastSyncRes] = await Promise.all([
        supabase.from('yt_videos').select('id', { count: 'exact', head: true }),
        supabase.from('yt_daily_stats').select('id', { count: 'exact', head: true }),
        supabase.from('yt_channel_daily').select('date', { count: 'exact', head: true }),
        supabase
          .from('yt_channel_daily')
          .select('date')
          .order('date', { ascending: false })
          .limit(1),
      ])

      if (id !== fetchId.current) return

      // Check for errors
      const firstError =
        videosRes.error || dailyStatsRes.error || channelDailyRes.error || lastSyncRes.error
      if (firstError) {
        setError(firstError.message)
        setLoading(false)
        return
      }

      const lastSyncDate =
        lastSyncRes.data && lastSyncRes.data.length > 0 ? lastSyncRes.data[0].date : null

      // Determine if data is stale
      let isStale = true
      if (lastSyncDate) {
        const lastSyncTime = new Date(lastSyncDate).getTime()
        const now = Date.now()
        isStale = now - lastSyncTime > STALE_THRESHOLD_MS
      }

      setSyncStatus({
        lastSync: lastSyncDate,
        videosCount: videosRes.count ?? 0,
        dailyStatsCount: dailyStatsRes.count ?? 0,
        channelDailyCount: channelDailyRes.count ?? 0,
        isStale,
      })
      setLoading(false)
    } catch (err) {
      if (id !== fetchId.current) return
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }, [])

  const forceApiSync = useCallback(async () => {
    try {
      setIsSyncingDirectly(true)
      setError(null)
      // Teste simplement la connexion (optionnel) ou recharge via la nouvelle fonction globale
      await fetchDirectRssVideos()
      
      // Force une relecture locale pour actualiser le status principal
      await fetch()
      return true
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      return false
    } finally {
      setIsSyncingDirectly(false)
    }
  }, [fetch])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { syncStatus, loading, isSyncingDirectly, error, refetch: fetch, forceApiSync }
}
