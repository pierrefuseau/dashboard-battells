/**
 * YouTube API configuration and types for BATTELLS channel
 * Data is synced via n8n workflows into Supabase tables.
 * This file provides static config + TypeScript interfaces.
 */

export const YOUTUBE_CONFIG = {
  channelId: 'UCkNv8s6MAtA_4dKIY-0Q2aw',
  channelHandle: '@battells',
  channelName: 'BATTELLS',
  subscriberCount: 543_000,
  totalViews: 320_721_033,
  videoCount: 426,
  createdAt: '2019-07-10',
  gcpProject: 'analytics-youtube-490619',
  supabaseProject: 'iikppeldebhhqliepudo',
} as const

export interface YouTubeChannelInfo {
  id: string
  title: string
  subscriberCount: number
  viewCount: number
  videoCount: number
  thumbnailUrl: string
  bannerUrl?: string
}

export interface YouTubeSyncStatus {
  lastSync: string | null
  videosCount: number
  dailyStatsCount: number
  channelDailyCount: number
  isStale: boolean // true if last sync > 24h ago
}

/**
 * Format a subscriber count for display (e.g., 543000 -> "543K")
 */
export function formatSubscriberCount(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace('.0', '')}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(0)}K`
  }
  return count.toString()
}

/**
 * Format a view count for display (e.g., 321000000 -> "321M")
 */
export function formatViewCount(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1).replace('.0', '')}Md`
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(0)}M`
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(0)}K`
  }
  return count.toString()
}
