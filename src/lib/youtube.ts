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

/**
 * Fetch recent videos directly from YouTube RSS using allorigins
 */
export async function fetchDirectRssVideos() {
  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CONFIG.channelId}`
    const response = await window.fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`)
    if (!response.ok) return []
    const data = await response.json()
    
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(data.contents, "text/xml")
    const entries = xmlDoc.querySelectorAll('entry')
    const newVideos = []
    
    for (const entry of Array.from(entries)) {
      const videoIdTag = Array.from(entry.children).find(c => c.nodeName === 'yt:videoId' || c.tagName === 'yt:videoId')
      const videoId = videoIdTag ? videoIdTag.textContent : null;
      const title = entry.querySelector('title')?.textContent
      const publishedAt = entry.querySelector('published')?.textContent
      
      let description = ''
      const mediaGroup = entry.querySelector('group, media\\:group')
      if (mediaGroup) {
        const descTag = mediaGroup.querySelector('description, media\\:description')
        if (descTag) description = descTag.textContent || ''
      }
      
      if (videoId && title && publishedAt) {
        newVideos.push({
          id: videoId,
          title,
          published_at: publishedAt,
          description,
          thumbnail_url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          duration_seconds: 0,
          is_short: false,
          language: 'fr',
          format_tag: 'react', // par défaut pour afficher un badge
          tags: [],
          platform: 'youtube',
          totalViews: 0,
          totalLikes: 0,
          totalRevenue: 0,
          rpm: 0,
          engagement: 0,
          avgViewDuration: 0,
          dailyStats: [],
          created_at: publishedAt
        })
      }
    }
    return newVideos
  } catch (err) {
    console.error('RSS fetch error:', err)
    return []
  }
}
