-- Title optimizations history for Le Labo
CREATE TABLE IF NOT EXISTS title_optimizations (
  id SERIAL PRIMARY KEY,
  original_title TEXT NOT NULL,
  optimized_title TEXT,
  description_generated TEXT,
  tags_generated TEXT[] DEFAULT '{}',
  hashtags JSONB DEFAULT '{}',
  platform TEXT[] DEFAULT '{youtube}',
  format_tag TEXT,
  content_type TEXT,
  score INTEGER,
  score_breakdown JSONB DEFAULT '{}',
  variants JSONB DEFAULT '[]',
  ab_test_result JSONB,
  hook_suggestions TEXT[] DEFAULT '{}',
  title_gaps JSONB DEFAULT '[]',
  pattern_insights JSONB DEFAULT '{}',
  video_idea_id INTEGER REFERENCES video_ideas(id),
  calendar_item_id INTEGER REFERENCES content_calendar(id),
  youtube_video_id TEXT REFERENCES yt_videos(id),
  published_title TEXT,
  actual_ctr REAL,
  actual_views INTEGER,
  prediction_accuracy REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

ALTER TABLE title_optimizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON title_optimizations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_title_optimizations_created ON title_optimizations(created_at DESC);
CREATE INDEX idx_title_optimizations_idea ON title_optimizations(video_idea_id);
