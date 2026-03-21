-- Watched channels for scraping
CREATE TABLE IF NOT EXISTS watched_channels (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok')),
  channel_id TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_url TEXT,
  avg_views_30d INTEGER DEFAULT 0,
  category TEXT CHECK (category IN ('food_fr', 'food_intl', 'shorts_food', 'entertainment')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (platform, channel_id)
);

-- Detected viral videos from scraping
CREATE TABLE IF NOT EXISTS detected_videos (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok')),
  video_url TEXT NOT NULL UNIQUE,
  video_id TEXT,
  title TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_id TEXT,
  thumbnail_url TEXT,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  published_at TIMESTAMPTZ,
  overperformance_ratio REAL DEFAULT 1.0,
  heat_score REAL DEFAULT 0.0,
  detected_at TIMESTAMPTZ DEFAULT now(),
  is_dismissed BOOLEAN DEFAULT false
);

-- Extend video_ideas table
ALTER TABLE video_ideas
  ADD COLUMN IF NOT EXISTS detected_video_id INTEGER REFERENCES detected_videos(id),
  ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS user_notes TEXT;
