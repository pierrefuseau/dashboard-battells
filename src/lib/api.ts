import { supabase } from '@/lib/supabase'
import type { YtVideo, YtDailyStat, YtChannelDaily } from '@/types/database'

/**
 * Retry a Supabase query function with exponential backoff.
 */
export async function fetchWithRetry<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>,
  retries = 3
): Promise<{ data: T | null; error: string | null }> {
  let lastError: string | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const { data, error } = await queryFn()
    if (!error) return { data, error: null }

    lastError = error.message
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 500))
    }
  }

  return { data: null, error: lastError }
}

/**
 * Upsert a single video into yt_videos (conflict on id).
 */
export async function upsertVideo(video: Partial<YtVideo> & { id: string }) {
  const { data, error } = await supabase
    .from('yt_videos')
    .upsert(video, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as YtVideo
}

/**
 * Bulk upsert daily stats into yt_daily_stats (conflict on video_id + date).
 */
export async function upsertDailyStats(stats: Array<Omit<YtDailyStat, 'id'>>) {
  const { data, error } = await supabase
    .from('yt_daily_stats')
    .upsert(stats, { onConflict: 'video_id,date' })
    .select()

  if (error) throw new Error(error.message)
  return data as YtDailyStat[]
}

/**
 * Bulk upsert channel daily stats into yt_channel_daily (conflict on date).
 */
export async function upsertChannelDaily(stats: YtChannelDaily[]) {
  const { data, error } = await supabase
    .from('yt_channel_daily')
    .upsert(stats, { onConflict: 'date' })
    .select()

  if (error) throw new Error(error.message)
  return data as YtChannelDaily[]
}
