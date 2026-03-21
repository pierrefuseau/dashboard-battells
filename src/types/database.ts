export interface YtVideo {
  id: string
  title: string
  published_at: string
  duration_seconds: number
  is_short: boolean
  format_tag: string | null
  language: string
  thumbnail_url: string | null
  description: string | null
  tags: string[]
  created_at: string
}

export interface YtDailyStat {
  id: number
  video_id: string
  date: string
  views: number
  estimated_revenue: number
  likes: number
  comments: number
  shares: number
  subscribers_gained: number
  subscribers_lost: number
  avg_view_duration_seconds: number
  impressions: number
  impressions_ctr: number
}

export interface YtChannelDaily {
  date: string
  views: number
  estimated_revenue: number
  subscribers: number
  watch_time_minutes: number
  impressions: number
  avg_ctr: number
}

export interface TiktokVideo {
  id: string
  title: string | null
  published_at: string | null
  duration_seconds: number
  views: number
  likes: number
  comments: number
  shares: number
  scraped_at: string
}

export interface IgPost {
  id: string
  shortcode: string | null
  caption: string | null
  published_at: string | null
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REEL'
  views: number
  likes: number
  comments: number
  scraped_at: string
}

export interface CsvImport {
  id: number
  filename: string
  file_type: string
  rows_imported: number
  imported_at: string
  imported_by: string
}

export interface AiInsight {
  id: number
  type: 'trend' | 'anomaly' | 'recommendation' | 'summary' | 'alert'
  title: string
  body: string
  priority: number
  data: Record<string, unknown>
  is_read: boolean
  is_actioned: boolean
  created_at: string
}

export interface Alert {
  id: number
  type: 'spike' | 'drop' | 'milestone' | 'revenue' | 'engagement' | 'competitor'
  title: string
  body: string | null
  video_id: string | null
  threshold_value: number | null
  actual_value: number | null
  is_read: boolean
  created_at: string
}

export interface ContentCalendarItem {
  id: number
  title: string
  format_tag: string | null
  is_long_form: boolean
  planned_date: string | null
  status: 'idea' | 'planned' | 'scripted' | 'filmed' | 'editing' | 'scheduled' | 'published' | 'cancelled'
  youtube_video_id: string | null
  notes: string | null
  platforms: string[]
  created_at: string
}

export interface Sponsor {
  id: number
  brand_name: string
  contact_name: string | null
  contact_email: string | null
  sector: string | null
  status: 'lead' | 'contacted' | 'negotiating' | 'signed' | 'delivered' | 'paid' | 'lost'
  deal_type: 'integration' | 'dedicated' | 'affiliate' | 'barter' | 'other' | null
  amount: number | null
  video_id: string | null
  notes: string | null
  created_at: string
}

export interface VideoIdea {
  id: number
  title: string
  format_tag: string | null
  source: 'ai' | 'manual' | 'trend' | 'comment' | 'competitor' | 'sponsor' | null
  rationale: string | null
  estimated_views: number | null
  is_long_form: boolean
  status: 'backlog' | 'approved' | 'rejected' | 'in_calendar'
  created_at: string
}

/** Video with computed stats from yt_daily_stats join */
export interface VideoWithStats extends YtVideo {
  platform: 'youtube'
  totalViews: number
  totalLikes: number
  totalRevenue: number
  ctr: number
  rpm: number
  engagement: number
  dailyStats: YtDailyStat[]
}

export interface FormatTag {
  tag: string
  label: string
  color: string
  description: string | null
}
