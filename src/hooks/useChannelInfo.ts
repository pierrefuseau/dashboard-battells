import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { YOUTUBE_CONFIG, type YouTubeChannelInfo } from '@/lib/youtube'

interface UseChannelInfoReturn {
  channelInfo: YouTubeChannelInfo
  loading: boolean
}

const defaultChannelInfo: YouTubeChannelInfo = {
  id: YOUTUBE_CONFIG.channelId,
  title: YOUTUBE_CONFIG.channelName,
  subscriberCount: YOUTUBE_CONFIG.subscriberCount,
  viewCount: YOUTUBE_CONFIG.totalViews,
  videoCount: YOUTUBE_CONFIG.videoCount,
  thumbnailUrl: '',
}

export function useChannelInfo(): UseChannelInfoReturn {
  const [liveSubscribers, setLiveSubscribers] = useState<number | null>(null)
  const [liveViews, setLiveViews] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLatest() {
      setLoading(true)

      const { data, error } = await supabase
        .from('yt_channel_daily')
        .select('subscribers, views')
        .order('date', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setLiveSubscribers(data[0].subscribers)
        setLiveViews(data[0].views)
      }

      setLoading(false)
    }

    fetchLatest()
  }, [])

  const channelInfo = useMemo<YouTubeChannelInfo>(
    () => ({
      ...defaultChannelInfo,
      subscriberCount: liveSubscribers ?? YOUTUBE_CONFIG.subscriberCount,
      viewCount: liveViews ?? YOUTUBE_CONFIG.totalViews,
    }),
    [liveSubscribers, liveViews]
  )

  return { channelInfo, loading }
}
