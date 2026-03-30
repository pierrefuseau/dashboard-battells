export type ThumbnailPlatform = 'youtube' | 'tiktok'
export type ThumbnailCategory = 'food' | 'challenge' | 'cartoon' | 'cinematic' | 'typography' | 'comparison'
export type ThumbnailQuality = '1K' | '2K'

export interface ThumbnailTemplate {
  id: string
  name: string
  category: ThumbnailCategory
  platforms: ThumbnailPlatform[]
  basePrompt: string
  variables: string[]
  previewImage: string
  aspectRatio: '16:9' | '9:16'
  suggestedSize: ThumbnailQuality
  tags: string[]
  icon: string  // lucide icon name
}

export interface GenerateThumbnailRequest {
  template_id: string
  title?: string
  subject: string
  platform: ThumbnailPlatform
  custom_prompt?: string
  format_tag?: string
  quality?: ThumbnailQuality
  video_idea_id?: number
  calendar_item_id?: number
}

export interface GenerateThumbnailResponse {
  image_url: string
  prompt_used: string
  template_id: string
  platform: ThumbnailPlatform
}

export interface ThumbnailGeneration {
  id: number
  template_id: string
  title: string | null
  prompt_used: string
  platform: ThumbnailPlatform
  aspect_ratio: string
  image_url: string
  image_path: string
  format_tag: string | null
  quality: ThumbnailQuality
  metadata: Record<string, unknown>
  is_favorite: boolean
  video_idea_id: number | null
  calendar_item_id: number | null
  created_at: string
}
