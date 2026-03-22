# Le Labo — Title & Description Optimizer — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-screen workshop page ("Le Labo") that lets Baptiste optimize video titles, descriptions, tags, hashtags and hooks using AI analysis of his 625+ videos and competitor data, with real-time multi-platform previews.

**Architecture:** New `/labo` route with 3-panel layout (Input | Intelligence | Output). Supabase Edge Function `optimize-title` calls Gemini 2.5 Pro with Baptiste's video patterns as context. New `title_optimizations` table tracks history and post-publication accuracy. Integration buttons added to Ideas and Calendar pages.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS v4 + Framer Motion + Recharts (radar chart) + Supabase Edge Function (Gemini 2.5 Pro)

---

## Task 1: Database Migration — `title_optimizations` table

**Files:**
- Create: `supabase/migrations/20260322_title_optimizations.sql`

**Step 1: Write the migration SQL**

```sql
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
```

**Step 2: Run migration on Supabase**

Run: Apply via Supabase dashboard SQL editor or `supabase db push`
Expected: Table created with indexes and RLS policy

**Step 3: Commit**

```bash
git add supabase/migrations/20260322_title_optimizations.sql
git commit -m "feat(labo): add title_optimizations table migration"
```

---

## Task 2: TypeScript Types — TitleOptimization interface

**Files:**
- Modify: `src/types/database.ts` (append after `FormatTag` interface, around line 197)

**Step 1: Add the TitleOptimization type**

Append to `src/types/database.ts`:

```typescript
export interface TitleOptimization {
  id: number
  original_title: string
  optimized_title: string | null
  description_generated: string | null
  tags_generated: string[]
  hashtags: {
    youtube?: string[]
    tiktok?: string[]
    instagram?: string[]
  }
  platform: string[]
  format_tag: string | null
  content_type: string | null
  score: number | null
  score_breakdown: {
    length?: number
    emotion?: number
    curiosity?: number
    seo?: number
    clickbait?: number
    brand_coherence?: number
  } | null
  variants: TitleVariant[]
  ab_test_result: {
    winner_index: number
    confidence: number
    reasoning: string
    comparison: {
      estimated_ctr: number
      estimated_engagement: number
      estimated_retention: number
      estimated_reach: number
    }[]
  } | null
  hook_suggestions: string[]
  title_gaps: {
    keyword: string
    volume_estimate: number
    opportunity_score: number
    video_suggestion: string
  }[]
  pattern_insights: {
    top_keywords?: { word: string; avg_views: number; count: number }[]
    optimal_length?: { min: number; max: number; sweet_spot: number }
    best_structures?: { type: string; avg_views: number; example: string }[]
    competitor_titles?: { title: string; views: number; channel: string }[]
  } | null
  video_idea_id: number | null
  calendar_item_id: number | null
  youtube_video_id: string | null
  published_title: string | null
  actual_ctr: number | null
  actual_views: number | null
  prediction_accuracy: number | null
  created_at: string
  published_at: string | null
}

export interface TitleVariant {
  title: string
  score: number
  style: 'emotional' | 'seo' | 'clickbait' | 'narrative' | 'minimal'
  reasoning: string
}

export interface OptimizeTitleRequest {
  title: string
  description?: string
  format_tag?: string
  content_type?: string
  platforms: string[]
  keyword?: string
  has_gustavo: boolean
  video_idea_id?: number
  calendar_item_id?: number
}

export interface OptimizeTitleResponse {
  score: number
  score_breakdown: TitleOptimization['score_breakdown']
  optimized_title: string
  variants: TitleVariant[]
  description_generated: string
  tags_generated: string[]
  hashtags: TitleOptimization['hashtags']
  hook_suggestions: string[]
  title_gaps: TitleOptimization['title_gaps']
  pattern_insights: TitleOptimization['pattern_insights']
}
```

**Step 2: Commit**

```bash
git add src/types/database.ts
git commit -m "feat(labo): add TitleOptimization types and request/response interfaces"
```

---

## Task 3: Hook — `useTitlePatterns` (analyse des patterns Baptiste)

**Files:**
- Create: `src/hooks/useTitlePatterns.ts`
- Modify: `src/hooks/index.ts` (add export)

**Step 1: Create the hook**

This hook pre-computes patterns from Baptiste's videos (top keywords, optimal length, best structures). It fetches yt_videos joined with aggregated yt_daily_stats.

```typescript
// src/hooks/useTitlePatterns.ts
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

interface TitlePattern {
  topKeywords: { word: string; avgViews: number; count: number }[]
  optimalLength: { min: number; max: number; sweetSpot: number }
  bestStructures: { type: string; avgViews: number; example: string }[]
  topTitles: { title: string; views: number; format_tag: string | null }[]
}

export function useTitlePatterns() {
  const [videos, setVideos] = useState<{ title: string; views: number; format_tag: string | null }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      // Fetch all videos with their total views from a Supabase RPC or aggregate
      const { data } = await supabase
        .from('yt_videos')
        .select('title, format_tag')
        .order('published_at', { ascending: false })

      if (!data) { setLoading(false); return }

      // Fetch total views per video from yt_daily_stats
      const videoIds = data.map((v: { title: string }) => v.title) // we need IDs
      // Simpler approach: fetch videos with their IDs and then stats
      const { data: videosWithId } = await supabase
        .from('yt_videos')
        .select('id, title, format_tag')

      if (!videosWithId) { setLoading(false); return }

      const { data: stats } = await supabase
        .from('yt_daily_stats')
        .select('video_id, views')

      if (!stats) { setLoading(false); return }

      // Aggregate views per video
      const viewsMap: Record<string, number> = {}
      for (const s of stats) {
        viewsMap[s.video_id] = (viewsMap[s.video_id] || 0) + s.views
      }

      const merged = videosWithId.map((v) => ({
        title: v.title,
        views: viewsMap[v.id] || 0,
        format_tag: v.format_tag,
      }))

      setVideos(merged)
      setLoading(false)
    }
    fetch()
  }, [])

  const patterns = useMemo<TitlePattern>(() => {
    if (videos.length === 0) {
      return {
        topKeywords: [],
        optimalLength: { min: 40, max: 70, sweetSpot: 55 },
        bestStructures: [],
        topTitles: [],
      }
    }

    // Top titles by views
    const topTitles = [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 50)

    // Keyword analysis: extract words, compute avg views when present
    const wordStats: Record<string, { totalViews: number; count: number }> = {}
    const stopWords = new Set(['de', 'la', 'le', 'les', 'du', 'des', 'un', 'une', 'et', 'en', 'au', 'aux', 'a', 'à', 'je', 'mon', 'ma', 'mes', 'ce', 'cette', 'avec', 'pour', 'dans', 'sur', 'par', 'plus', 'pas', 'que', 'qui', 'ne', 'se', 'son', 'sa', 'ses', 'the', 'of', 'and', 'to', 'in', 'is', 'it', 'for', 'on', 'with'])

    for (const v of videos) {
      const words = v.title.toLowerCase()
        .replace(/[^a-zàâäéèêëïîôùûüÿç0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stopWords.has(w))

      const uniqueWords = [...new Set(words)]
      for (const w of uniqueWords) {
        if (!wordStats[w]) wordStats[w] = { totalViews: 0, count: 0 }
        wordStats[w].totalViews += v.views
        wordStats[w].count++
      }
    }

    const topKeywords = Object.entries(wordStats)
      .filter(([, s]) => s.count >= 3) // at least 3 uses
      .map(([word, s]) => ({ word, avgViews: Math.round(s.totalViews / s.count), count: s.count }))
      .sort((a, b) => b.avgViews - a.avgViews)
      .slice(0, 20)

    // Optimal length analysis
    const lengthBuckets: Record<string, { totalViews: number; count: number }> = {}
    for (const v of videos) {
      const len = v.title.length
      const bucket = len < 30 ? '0-30' : len < 45 ? '30-45' : len < 60 ? '45-60' : len < 75 ? '60-75' : '75+'
      if (!lengthBuckets[bucket]) lengthBuckets[bucket] = { totalViews: 0, count: 0 }
      lengthBuckets[bucket].totalViews += v.views
      lengthBuckets[bucket].count++
    }

    const bestBucket = Object.entries(lengthBuckets)
      .map(([range, s]) => ({ range, avgViews: s.totalViews / s.count }))
      .sort((a, b) => b.avgViews - a.avgViews)[0]

    const optimalLength = bestBucket?.range === '45-60'
      ? { min: 45, max: 60, sweetSpot: 52 }
      : bestBucket?.range === '30-45'
        ? { min: 30, max: 45, sweetSpot: 38 }
        : bestBucket?.range === '60-75'
          ? { min: 60, max: 75, sweetSpot: 65 }
          : { min: 40, max: 70, sweetSpot: 55 }

    // Structure analysis (question, list, exclamation, imperative)
    const structures: Record<string, { totalViews: number; count: number; example: string }> = {
      question: { totalViews: 0, count: 0, example: '' },
      exclamation: { totalViews: 0, count: 0, example: '' },
      list: { totalViews: 0, count: 0, example: '' },
      challenge: { totalViews: 0, count: 0, example: '' },
      narrative: { totalViews: 0, count: 0, example: '' },
    }

    for (const v of videos) {
      const t = v.title.toLowerCase()
      let matched = false
      if (t.includes('?') || t.startsWith('comment') || t.startsWith('pourquoi') || t.startsWith('est-ce')) {
        structures.question.totalViews += v.views
        structures.question.count++
        if (v.views > 100000 && !structures.question.example) structures.question.example = v.title
        matched = true
      }
      if (t.includes('!')) {
        structures.exclamation.totalViews += v.views
        structures.exclamation.count++
        if (v.views > 100000 && !structures.exclamation.example) structures.exclamation.example = v.title
        matched = true
      }
      if (/^\d+/.test(t) || t.includes('top ')) {
        structures.list.totalViews += v.views
        structures.list.count++
        if (v.views > 100000 && !structures.list.example) structures.list.example = v.title
        matched = true
      }
      if (t.includes('défi') || t.includes('challenge') || t.includes('24h') || t.includes('vs')) {
        structures.challenge.totalViews += v.views
        structures.challenge.count++
        if (v.views > 100000 && !structures.challenge.example) structures.challenge.example = v.title
        matched = true
      }
      if (!matched) {
        structures.narrative.totalViews += v.views
        structures.narrative.count++
        if (!structures.narrative.example) structures.narrative.example = v.title
      }
    }

    const bestStructures = Object.entries(structures)
      .filter(([, s]) => s.count > 0)
      .map(([type, s]) => ({
        type,
        avgViews: Math.round(s.totalViews / s.count),
        example: s.example || 'N/A',
      }))
      .sort((a, b) => b.avgViews - a.avgViews)

    return { topKeywords, optimalLength, bestStructures, topTitles }
  }, [videos])

  return { patterns, loading }
}
```

**Step 2: Add export to hooks index**

Add to `src/hooks/index.ts`:
```typescript
export { useTitlePatterns } from './useTitlePatterns'
```

**Step 3: Commit**

```bash
git add src/hooks/useTitlePatterns.ts src/hooks/index.ts
git commit -m "feat(labo): add useTitlePatterns hook for video pattern analysis"
```

---

## Task 4: Hook — `useTitleOptimizer` (appel Edge Function + CRUD)

**Files:**
- Create: `src/hooks/useTitleOptimizer.ts`
- Modify: `src/hooks/index.ts` (add export)

**Step 1: Create the hook**

```typescript
// src/hooks/useTitleOptimizer.ts
import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type {
  TitleOptimization,
  OptimizeTitleRequest,
  OptimizeTitleResponse,
} from '@/types/database'

interface UseTitleOptimizerReturn {
  result: OptimizeTitleResponse | null
  history: TitleOptimization[]
  loading: boolean
  historyLoading: boolean
  error: string | null
  optimize: (req: OptimizeTitleRequest) => Promise<void>
  runAbTest: (titles: string[]) => Promise<void>
  abTestResult: TitleOptimization['ab_test_result']
  fetchHistory: () => Promise<void>
  saveOptimization: (data: Partial<TitleOptimization>) => Promise<TitleOptimization>
}

export function useTitleOptimizer(): UseTitleOptimizerReturn {
  const [result, setResult] = useState<OptimizeTitleResponse | null>(null)
  const [history, setHistory] = useState<TitleOptimization[]>([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [abTestResult, setAbTestResult] = useState<TitleOptimization['ab_test_result']>(null)

  const optimize = useCallback(async (req: OptimizeTitleRequest) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-title`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(req),
        },
      )

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.status}`)
      }

      const data: OptimizeTitleResponse = await response.json()
      setResult(data)

      // Auto-save to history
      await supabase.from('title_optimizations').insert({
        original_title: req.title,
        optimized_title: data.optimized_title,
        description_generated: data.description_generated,
        tags_generated: data.tags_generated,
        hashtags: data.hashtags,
        platform: req.platforms,
        format_tag: req.format_tag || null,
        content_type: req.content_type || null,
        score: data.score,
        score_breakdown: data.score_breakdown,
        variants: data.variants,
        hook_suggestions: data.hook_suggestions,
        title_gaps: data.title_gaps,
        pattern_insights: data.pattern_insights,
        video_idea_id: req.video_idea_id || null,
        calendar_item_id: req.calendar_item_id || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const runAbTest = useCallback(async (titles: string[]) => {
    setLoading(true)
    setError(null)
    setAbTestResult(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/optimize-title`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ mode: 'ab_test', titles }),
        },
      )

      if (!response.ok) throw new Error(`A/B test failed: ${response.status}`)
      const data = await response.json()
      setAbTestResult(data.ab_test_result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    const { data } = await supabase
      .from('title_optimizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    setHistory((data as TitleOptimization[]) ?? [])
    setHistoryLoading(false)
  }, [])

  const saveOptimization = useCallback(async (updates: Partial<TitleOptimization>) => {
    const { data, error: err } = await supabase
      .from('title_optimizations')
      .insert(updates)
      .select()
      .single()

    if (err) throw new Error(err.message)
    return data as TitleOptimization
  }, [])

  return { result, history, loading, historyLoading, error, optimize, runAbTest, abTestResult, fetchHistory, saveOptimization }
}
```

**Step 2: Add export to hooks index**

Add to `src/hooks/index.ts`:
```typescript
export { useTitleOptimizer } from './useTitleOptimizer'
```

**Step 3: Commit**

```bash
git add src/hooks/useTitleOptimizer.ts src/hooks/index.ts
git commit -m "feat(labo): add useTitleOptimizer hook with optimize, A/B test, and history"
```

---

## Task 5: Edge Function — `optimize-title`

**Files:**
- Create: `supabase/functions/optimize-title/index.ts`

**Step 1: Write the Edge Function**

```typescript
// supabase/functions/optimize-title/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

const SYSTEM_PROMPT = `Tu es un expert mondial en SEO YouTube, TikTok et Instagram, specialise dans le food content et l'entertainment.

Tu travailles pour BATTELLS (543K abonnes YouTube, 500K TikTok), createur food francais.
Son style : recettes cartoon, defis 24h, commandes a l'aveugle, personnage "Gustavo" (voix off sarcastique).
Son lexique : Dinguerie, Banger, Magnificus, Zinzin, Legendaire, Machine, Monstre.

Tu dois analyser et optimiser des titres de videos en utilisant :
1. Les patterns des titres les plus performants du createur (fournis en contexte)
2. Les meilleures pratiques SEO YouTube (longueur 50-65 chars, mots-cles en debut, emotion, curiosite)
3. Les techniques de clickbait calibre (promesse forte mais tenable)
4. L'adaptation multi-plateforme (YouTube titre long vs TikTok court vs Instagram caption)

Reponds UNIQUEMENT en JSON strict sans markdown.`

const AB_TEST_PROMPT = `Tu es un expert en A/B testing predictif de titres YouTube/TikTok.
Analyse les titres fournis et predit lequel performera le mieux.
Base ton analyse sur : CTR estime, potentiel d'engagement, retention estimee, reach potentiel.
Reponds UNIQUEMENT en JSON strict sans markdown.`

async function fetchTopTitles(supabase: ReturnType<typeof createClient>) {
  // Get top 50 performing videos with their titles
  const { data: videos } = await supabase
    .from('yt_videos')
    .select('id, title, format_tag, is_short')

  if (!videos || videos.length === 0) return []

  const { data: stats } = await supabase
    .from('yt_daily_stats')
    .select('video_id, views, impressions_ctr, likes')

  if (!stats) return []

  // Aggregate per video
  const agg: Record<string, { views: number; ctr: number; ctrCount: number; likes: number }> = {}
  for (const s of stats) {
    if (!agg[s.video_id]) agg[s.video_id] = { views: 0, ctr: 0, ctrCount: 0, likes: 0 }
    agg[s.video_id].views += s.views
    agg[s.video_id].ctr += s.impressions_ctr
    agg[s.video_id].ctrCount++
    agg[s.video_id].likes += s.likes
  }

  return videos
    .map((v) => ({
      title: v.title,
      format_tag: v.format_tag,
      is_short: v.is_short,
      views: agg[v.id]?.views ?? 0,
      avg_ctr: agg[v.id] ? agg[v.id].ctr / agg[v.id].ctrCount : 0,
      likes: agg[v.id]?.likes ?? 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 50)
}

async function fetchCompetitorTitles(supabase: ReturnType<typeof createClient>, keyword: string) {
  const { data } = await supabase
    .from('detected_videos')
    .select('title, views, channel_name')
    .ilike('title', `%${keyword}%`)
    .order('views', { ascending: false })
    .limit(10)

  return data ?? []
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // A/B test mode
    if (body.mode === 'ab_test' && body.titles) {
      const titlesText = body.titles.map((t: string, i: number) => `Titre ${i + 1}: "${t}"`).join('\n')

      const geminiPayload = {
        contents: [{
          parts: [{
            text: `${AB_TEST_PROMPT}\n\nCompare ces titres et predit le gagnant :\n${titlesText}\n\nReponds avec ce JSON :\n{\n  "ab_test_result": {\n    "winner_index": 0,\n    "confidence": 78,\n    "reasoning": "Explication...",\n    "comparison": [\n      {"estimated_ctr": 8.5, "estimated_engagement": 7.2, "estimated_retention": 6.8, "estimated_reach": 9.0}\n    ]\n  }\n}`
          }]
        }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      })

      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'Gemini error' }), { status: 502, headers: CORS_HEADERS })
      }

      const data = await res.json()
      const parts = data.candidates?.[0]?.content?.parts ?? []
      const textPart = parts.find((p: { text?: string }) => p.text) ?? parts[0]
      let parsed
      try { parsed = JSON.parse(textPart?.text ?? '{}') } catch { parsed = {} }

      return new Response(JSON.stringify(parsed), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      })
    }

    // Optimize mode
    const { title, description, format_tag, content_type, platforms, keyword, has_gustavo } = body

    if (!title) {
      return new Response(JSON.stringify({ error: 'title required' }), { status: 400, headers: CORS_HEADERS })
    }

    // Fetch context data
    const [topTitles, competitors] = await Promise.all([
      fetchTopTitles(supabase),
      keyword ? fetchCompetitorTitles(supabase, keyword) : Promise.resolve([]),
    ])

    const topTitlesContext = topTitles
      .map((t, i) => `${i + 1}. "${t.title}" — ${t.views} vues, CTR ${(t.avg_ctr * 100).toFixed(1)}%, ${t.format_tag || 'no tag'}`)
      .join('\n')

    const competitorContext = competitors.length > 0
      ? `\n\nTitres concurrents sur ce sujet :\n${competitors.map((c) => `- "${c.title}" (${c.views} vues, ${c.channel_name})`).join('\n')}`
      : ''

    const platformsList = (platforms || ['youtube']).join(', ')
    const gustavoNote = has_gustavo ? '\nGustavo (voix off sarcastique) est present dans cette video — adapte le ton.' : ''

    const userPrompt = `Optimise ce titre de video :

Titre actuel : "${title}"
${description ? `Description actuelle : "${description}"` : ''}
Format : ${format_tag || 'non precise'}
Type de contenu : ${content_type || 'non precise'}
Plateformes cibles : ${platformsList}
${keyword ? `Mot-cle principal : ${keyword}` : ''}${gustavoNote}

Voici les 50 titres les plus performants de BATTELLS pour comprendre son style :
${topTitlesContext}
${competitorContext}

Reponds avec ce JSON EXACT :
{
  "score": 72,
  "score_breakdown": {
    "length": 8,
    "emotion": 7,
    "curiosity": 6,
    "seo": 8,
    "clickbait": 7,
    "brand_coherence": 9
  },
  "optimized_title": "Le titre optimise",
  "variants": [
    {"title": "Variante 1", "score": 85, "style": "emotional", "reasoning": "Pourquoi cette variante marche"},
    {"title": "Variante 2", "score": 82, "style": "seo", "reasoning": "..."},
    {"title": "Variante 3", "score": 80, "style": "clickbait", "reasoning": "..."},
    {"title": "Variante 4", "score": 78, "style": "narrative", "reasoning": "..."},
    {"title": "Variante 5", "score": 75, "style": "minimal", "reasoning": "..."}
  ],
  "description_generated": "Description YouTube complete avec SEO, timestamps, CTA, liens",
  "tags_generated": ["tag1", "tag2", "...15-20 tags"],
  "hashtags": {
    "youtube": ["#tag1", "#tag2", "#tag3"],
    "tiktok": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "instagram": ["#tag1", "...jusqu'a 30 hashtags pertinents"]
  },
  "hook_suggestions": [
    "Hook 1 : les 3 premieres secondes",
    "Hook 2 : variante",
    "Hook 3 : variante"
  ],
  "title_gaps": [
    {"keyword": "mot-cle food populaire non utilise", "volume_estimate": 50000, "opportunity_score": 8, "video_suggestion": "Idee de video"}
  ],
  "pattern_insights": {
    "top_keywords": [{"word": "mot", "avg_views": 500000, "count": 12}],
    "optimal_length": {"min": 45, "max": 60, "sweet_spot": 52},
    "best_structures": [{"type": "question", "avg_views": 800000, "example": "Exemple"}],
    "competitor_titles": [{"title": "Titre concurrent", "views": 1000000, "channel": "Chaine"}]
  }
}`

    const geminiPayload = {
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' },
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', errText)
      return new Response(JSON.stringify({ error: 'Gemini API error' }), { status: 502, headers: CORS_HEADERS })
    }

    const geminiData = await geminiRes.json()
    const parts = geminiData.candidates?.[0]?.content?.parts ?? []
    const textPart = parts.find((p: { text?: string }) => p.text) ?? parts[0]
    const rawText = textPart?.text ?? '{}'

    let result
    try {
      result = JSON.parse(rawText)
    } catch {
      console.error('Failed to parse Gemini response:', rawText)
      result = { score: 0, optimized_title: title, variants: [], error: 'Parse error' }
    }

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS_HEADERS })
  }
})
```

**Step 2: Commit**

```bash
git add supabase/functions/optimize-title/index.ts
git commit -m "feat(labo): add optimize-title edge function with Gemini 2.5 Pro"
```

---

## Task 6: Page Component — Le Labo `index.tsx`

**Files:**
- Create: `src/pages/Labo/index.tsx`

**Step 1: Create the main page**

```typescript
// src/pages/Labo/index.tsx
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import { useTitleOptimizer, useTitlePatterns } from '@/hooks'
import type { OptimizeTitleRequest } from '@/types/database'
import InputPanel from './components/InputPanel'
import IntelligencePanel from './components/IntelligencePanel'
import OutputPanel from './components/OutputPanel'
import HistoryTable from './components/HistoryTable'

export default function Labo() {
  const [searchParams] = useSearchParams()
  const { result, history, loading, historyLoading, error, optimize, runAbTest, abTestResult, fetchHistory } = useTitleOptimizer()
  const { patterns, loading: patternsLoading } = useTitlePatterns()

  const [formData, setFormData] = useState<OptimizeTitleRequest>({
    title: '',
    description: '',
    format_tag: '',
    content_type: '',
    platforms: ['youtube'],
    keyword: '',
    has_gustavo: false,
  })

  // Pre-fill from URL params (from Ideas or Calendar)
  useEffect(() => {
    const title = searchParams.get('title')
    const ideaId = searchParams.get('idea_id')
    const calendarId = searchParams.get('calendar_id')
    const format = searchParams.get('format')

    if (title) {
      setFormData((prev) => ({
        ...prev,
        title: decodeURIComponent(title),
        video_idea_id: ideaId ? Number(ideaId) : undefined,
        calendar_item_id: calendarId ? Number(calendarId) : undefined,
        format_tag: format || prev.format_tag,
      }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleOptimize = useCallback(async () => {
    if (!formData.title.trim()) return
    await optimize(formData)
  }, [formData, optimize])

  const handleSelectVariant = useCallback((title: string) => {
    setFormData((prev) => ({ ...prev, title }))
  }, [])

  const handleAbTest = useCallback(async (titles: string[]) => {
    await runAbTest(titles)
  }, [runAbTest])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <FlaskConical className="w-7 h-7" />
        </div>
        <div>
          <h1 className="title-display text-text-primary">LE LABO</h1>
          <p className="text-sm text-text-tertiary font-[var(--font-satoshi)]">
            Title & Description Optimizer — Optimise chaque mot pour maximiser l'impact
          </p>
        </div>
      </div>

      {/* 3-Panel Workshop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 xl:gap-6 min-h-[70vh]">
        <InputPanel
          formData={formData}
          onChange={setFormData}
          onOptimize={handleOptimize}
          onSelectVariant={handleSelectVariant}
          onAbTest={handleAbTest}
          result={result}
          abTestResult={abTestResult}
          loading={loading}
        />
        <IntelligencePanel
          result={result}
          patterns={patterns}
          patternsLoading={patternsLoading}
          loading={loading}
        />
        <OutputPanel
          result={result}
          formData={formData}
          loading={loading}
        />
      </div>

      {/* History */}
      <HistoryTable
        history={history}
        loading={historyLoading}
        onSelect={(opt) => setFormData((prev) => ({
          ...prev,
          title: opt.original_title,
        }))}
      />

      {/* Error toast */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-error text-white px-6 py-3 rounded-xl shadow-[var(--shadow-toast)] font-[var(--font-satoshi)] text-sm z-50"
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Labo/index.tsx
git commit -m "feat(labo): add Le Labo main page component with 3-panel layout"
```

---

## Task 7: InputPanel Component

**Files:**
- Create: `src/pages/Labo/components/InputPanel.tsx`

**Step 1: Create the InputPanel**

This is the left panel with: title input with char counter, description, format/platform/content type selectors, keyword input, Gustavo toggle, optimize button, variants list, and A/B test.

```typescript
// src/pages/Labo/components/InputPanel.tsx
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, FlaskConical, Check } from 'lucide-react'
import { FORMAT_TAGS } from '@/lib/constants'
import type { OptimizeTitleRequest, OptimizeTitleResponse, TitleOptimization, TitleVariant } from '@/types/database'

const CONTENT_TYPES = ['Recette', 'Defi', 'Reaction', 'Vlog', 'Storytelling', 'Review', 'Mukbang', 'Street Food', 'Challenge 24h']
const PLATFORMS = ['youtube', 'tiktok', 'instagram'] as const

const STYLE_LABELS: Record<string, { label: string; color: string }> = {
  emotional: { label: 'Emotionnel', color: 'bg-red-500/20 text-red-400' },
  seo: { label: 'SEO', color: 'bg-blue-500/20 text-blue-400' },
  clickbait: { label: 'Clickbait', color: 'bg-yellow-500/20 text-yellow-400' },
  narrative: { label: 'Narratif', color: 'bg-purple-500/20 text-purple-400' },
  minimal: { label: 'Minimal', color: 'bg-green-500/20 text-green-400' },
}

interface InputPanelProps {
  formData: OptimizeTitleRequest
  onChange: (data: OptimizeTitleRequest) => void
  onOptimize: () => void
  onSelectVariant: (title: string) => void
  onAbTest: (titles: string[]) => void
  result: OptimizeTitleResponse | null
  abTestResult: TitleOptimization['ab_test_result']
  loading: boolean
}

export default function InputPanel({
  formData, onChange, onOptimize, onSelectVariant, onAbTest,
  result, abTestResult, loading,
}: InputPanelProps) {
  const [abSelected, setAbSelected] = useState<Set<number>>(new Set())

  const titleLength = formData.title.length
  const titleColor = titleLength === 0 ? 'text-text-tertiary'
    : titleLength <= 50 ? 'text-success'
    : titleLength <= 65 ? 'text-success'
    : titleLength <= 80 ? 'text-warning'
    : 'text-error'

  const togglePlatform = (p: string) => {
    const platforms = formData.platforms.includes(p)
      ? formData.platforms.filter((x) => x !== p)
      : [...formData.platforms, p]
    if (platforms.length > 0) onChange({ ...formData, platforms })
  }

  const toggleAbSelect = (idx: number) => {
    const next = new Set(abSelected)
    if (next.has(idx)) next.delete(idx)
    else if (next.size < 3) next.add(idx)
    setAbSelected(next)
  }

  const handleAbTest = () => {
    if (!result) return
    const titles = [...abSelected].map((i) => result.variants[i]?.title).filter(Boolean)
    if (titles.length >= 2) onAbTest(titles)
  }

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-5 overflow-y-auto max-h-[75vh]">
      <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
        Input
      </h2>

      {/* Title */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Titre de la video
        </label>
        <textarea
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
          placeholder="Ex: J'ai teste le restaurant le plus cher de Paris..."
          rows={2}
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-3 text-text-primary font-[var(--font-satoshi)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <div className="flex justify-between mt-1">
          <span className={`text-xs font-mono ${titleColor}`}>
            {titleLength} caracteres
          </span>
          <span className="text-xs text-text-tertiary">
            {titleLength <= 50 ? 'Court' : titleLength <= 65 ? 'Ideal' : titleLength <= 80 ? 'Long' : 'Trop long'}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Description (optionnel)
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Description brute ou notes..."
          rows={3}
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-3 text-text-primary font-[var(--font-satoshi)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Format + Content Type */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">Format</label>
          <select
            value={formData.format_tag || ''}
            onChange={(e) => onChange({ ...formData, format_tag: e.target.value })}
            className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-3 py-2 text-sm text-text-primary font-[var(--font-satoshi)]"
          >
            <option value="">Tous</option>
            {Object.entries(FORMAT_TAGS).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">Type</label>
          <select
            value={formData.content_type || ''}
            onChange={(e) => onChange({ ...formData, content_type: e.target.value })}
            className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-3 py-2 text-sm text-text-primary font-[var(--font-satoshi)]"
          >
            <option value="">Non precise</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t.toLowerCase()}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Platforms */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-2 block">Plateformes</label>
        <div className="flex gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              className={`px-3 py-1.5 text-xs font-bold font-[var(--font-clash)] rounded-[var(--radius-button)] border transition-all ${
                formData.platforms.includes(p)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-page text-text-secondary border-border/60 hover:border-primary/40'
              }`}
            >
              {p === 'youtube' ? 'YouTube' : p === 'tiktok' ? 'TikTok' : 'Instagram'}
            </button>
          ))}
        </div>
      </div>

      {/* Keyword */}
      <div>
        <label className="text-xs font-bold text-text-secondary font-[var(--font-clash)] mb-1 block">
          Mot-cle SEO (optionnel)
        </label>
        <input
          type="text"
          value={formData.keyword || ''}
          onChange={(e) => onChange({ ...formData, keyword: e.target.value })}
          placeholder="Ex: recette, air fryer, street food..."
          className="w-full bg-page border border-border/60 rounded-[var(--radius-input)] px-4 py-2.5 text-sm text-text-primary font-[var(--font-satoshi)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Gustavo toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div
          onClick={() => onChange({ ...formData, has_gustavo: !formData.has_gustavo })}
          className={`w-10 h-6 rounded-full transition-all relative ${
            formData.has_gustavo ? 'bg-primary' : 'bg-border'
          }`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            formData.has_gustavo ? 'translate-x-5' : 'translate-x-1'
          }`} />
        </div>
        <span className="text-sm text-text-secondary font-[var(--font-satoshi)]">Gustavo present</span>
      </label>

      {/* Optimize button */}
      <button
        onClick={onOptimize}
        disabled={loading || !formData.title.trim()}
        className="w-full py-3 rounded-[var(--radius-button)] bg-primary text-white font-bold font-[var(--font-clash)] text-sm shadow-[var(--shadow-glow)] hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {loading ? 'Analyse en cours...' : 'Optimiser'}
      </button>

      {/* Variants */}
      <AnimatePresence>
        {result && result.variants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                Variantes IA
              </h3>
              <button onClick={onOptimize} className="text-xs text-primary hover:text-primary-dark flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Regenerer
              </button>
            </div>
            {result.variants.map((v: TitleVariant, i: number) => {
              const style = STYLE_LABELS[v.style] || STYLE_LABELS.emotional
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => onSelectVariant(v.title)}
                  className="w-full text-left p-3 rounded-xl border border-border/40 bg-page hover:border-primary/40 hover:bg-primary-50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-text-primary font-[var(--font-satoshi)] leading-snug flex-1">
                      {v.title}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.color}`}>
                        {style.label}
                      </span>
                      <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-primary">
                        {v.score}
                      </span>
                      {/* A/B test checkbox */}
                      <div
                        onClick={(e) => { e.stopPropagation(); toggleAbSelect(i) }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                          abSelected.has(i) ? 'bg-primary border-primary' : 'border-border hover:border-primary/60'
                        }`}
                      >
                        {abSelected.has(i) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">{v.reasoning}</p>
                </motion.button>
              )
            })}

            {/* A/B Test button */}
            {abSelected.size >= 2 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleAbTest}
                disabled={loading}
                className="w-full py-2.5 rounded-[var(--radius-button)] bg-dark text-white font-bold font-[var(--font-clash)] text-xs flex items-center justify-center gap-2 hover:bg-dark-secondary transition-all"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                A/B Test Predictif ({abSelected.size} titres)
              </motion.button>
            )}

            {/* A/B Test result */}
            {abTestResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-dark text-white"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FlaskConical className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold font-[var(--font-clash)] text-primary">
                    Gagnant predit — {abTestResult.confidence}% de confiance
                  </span>
                </div>
                <p className="text-sm font-[var(--font-satoshi)] text-white/80">
                  {abTestResult.reasoning}
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Labo/components/InputPanel.tsx
git commit -m "feat(labo): add InputPanel with title input, variants, and A/B test"
```

---

## Task 8: IntelligencePanel Component

**Files:**
- Create: `src/pages/Labo/components/IntelligencePanel.tsx`

**Step 1: Create the IntelligencePanel**

Center panel showing: score gauge, breakdown, patterns, title gaps, competitor data.

```typescript
// src/pages/Labo/components/IntelligencePanel.tsx
import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react'
import type { OptimizeTitleResponse } from '@/types/database'

interface IntelligencePanelProps {
  result: OptimizeTitleResponse | null
  patterns: {
    topKeywords: { word: string; avgViews: number; count: number }[]
    optimalLength: { min: number; max: number; sweetSpot: number }
    bestStructures: { type: string; avgViews: number; example: string }[]
    topTitles: { title: string; views: number; format_tag: string | null }[]
  }
  patternsLoading: boolean
  loading: boolean
}

const BREAKDOWN_LABELS: Record<string, string> = {
  length: 'Longueur',
  emotion: 'Emotion',
  curiosity: 'Curiosite',
  seo: 'SEO',
  clickbait: 'Clickbait',
  brand_coherence: 'Marque',
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-error'
  const bgColor = score >= 80 ? 'bg-success/10' : score >= 60 ? 'bg-warning/10' : 'bg-error/10'
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-border/30" />
          <motion.circle
            cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6"
            strokeLinecap="round"
            className={color}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className={`text-3xl font-bold font-[var(--font-clash)] ${color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className={`mt-2 text-xs font-bold px-3 py-1 rounded-full ${bgColor} ${color}`}>
        {score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : 'A ameliorer'}
      </span>
    </div>
  )
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export default function IntelligencePanel({ result, patterns, patternsLoading, loading }: IntelligencePanelProps) {
  const breakdown = result?.score_breakdown
  const radarData = breakdown
    ? Object.entries(breakdown).map(([key, val]) => ({
        criterion: BREAKDOWN_LABELS[key] || key,
        score: val ?? 0,
        fullMark: 10,
      }))
    : []

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-5 overflow-y-auto max-h-[75vh]">
      <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase flex items-center gap-2">
        <Brain className="w-4 h-4" /> Intelligence
      </h2>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {/* Score + Radar */}
      {result && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="flex justify-center">
            <ScoreGauge score={result.score} />
          </div>

          {/* Radar Chart */}
          {radarData.length > 0 && (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--color-border)" strokeOpacity={0.3} />
                  <PolarAngleAxis
                    dataKey="criterion"
                    tick={{ fontSize: 10, fill: 'var(--color-text-tertiary)' }}
                  />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="score"
                    stroke="var(--color-primary)"
                    fill="var(--color-primary)"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Breakdown bars */}
          <div className="space-y-2">
            {Object.entries(result.score_breakdown || {}).map(([key, val]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary font-[var(--font-satoshi)] w-20 shrink-0">
                  {BREAKDOWN_LABELS[key] || key}
                </span>
                <div className="flex-1 h-2 bg-border/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${((val ?? 0) / 10) * 100}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
                <span className="text-xs font-bold font-[var(--font-space-grotesk)] text-text-primary w-6 text-right">
                  {val ?? 0}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Patterns (always visible) */}
      {!patternsLoading && patterns.topKeywords.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-border/30">
          <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> Patterns gagnants
          </h3>

          {/* Top keywords */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
              Mots-cles performants
            </span>
            <div className="flex flex-wrap gap-1.5">
              {patterns.topKeywords.slice(0, 10).map((k) => (
                <span
                  key={k.word}
                  className="text-[11px] font-[var(--font-satoshi)] px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                  title={`${formatViews(k.avgViews)} vues moy. (${k.count}x)`}
                >
                  {k.word} <span className="text-primary/60">{formatViews(k.avgViews)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Optimal length */}
          <div className="text-xs text-text-secondary font-[var(--font-satoshi)]">
            <span className="text-text-tertiary">Longueur ideale :</span>{' '}
            <span className="font-bold text-primary">{patterns.optimalLength.sweetSpot} chars</span>
            <span className="text-text-tertiary"> ({patterns.optimalLength.min}-{patterns.optimalLength.max})</span>
          </div>

          {/* Best structures */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
              Meilleures structures
            </span>
            {patterns.bestStructures.slice(0, 4).map((s) => (
              <div key={s.type} className="flex items-center justify-between text-xs">
                <span className="text-text-secondary capitalize">{s.type}</span>
                <span className="font-bold font-[var(--font-space-grotesk)] text-text-primary">
                  {formatViews(s.avgViews)} vues moy.
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Title Gaps */}
      {result?.title_gaps && result.title_gaps.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" /> Title Gaps
          </h3>
          {result.title_gaps.slice(0, 5).map((gap, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-warning-50 border border-warning/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-primary">"{gap.keyword}"</span>
                <span className="text-[10px] font-bold text-warning">
                  Opportunite {gap.opportunity_score}/10
                </span>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">{gap.video_suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {/* Competitor titles */}
      {result?.pattern_insights?.competitor_titles && result.pattern_insights.competitor_titles.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border/30">
          <h3 className="text-xs font-bold text-text-secondary font-[var(--font-clash)] flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-info" /> Concurrence
          </h3>
          {result.pattern_insights.competitor_titles.slice(0, 5).map((c, i) => (
            <div key={i} className="text-xs text-text-secondary">
              <span className="text-text-primary font-medium">"{c.title}"</span>
              <br />
              <span className="text-text-tertiary">{c.channel} — {formatViews(c.views)} vues</span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !patternsLoading && patterns.topKeywords.length === 0 && (
        <div className="text-center py-16 text-text-tertiary">
          <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-[var(--font-satoshi)]">
            Entre un titre et lance l'optimisation pour voir l'analyse
          </p>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Labo/components/IntelligencePanel.tsx
git commit -m "feat(labo): add IntelligencePanel with score gauge, radar chart, patterns, gaps"
```

---

## Task 9: OutputPanel Component (Previews + Description + Hooks)

**Files:**
- Create: `src/pages/Labo/components/OutputPanel.tsx`

**Step 1: Create the OutputPanel**

Right panel with multi-platform previews, generated description, tags, hashtags, hooks.

```typescript
// src/pages/Labo/components/OutputPanel.tsx
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Copy, Check, Hash, Zap, FileText, Youtube, Instagram } from 'lucide-react'
import type { OptimizeTitleRequest, OptimizeTitleResponse } from '@/types/database'

type PreviewTab = 'yt-search' | 'yt-home' | 'tiktok' | 'instagram'

interface OutputPanelProps {
  result: OptimizeTitleResponse | null
  formData: OptimizeTitleRequest
  loading: boolean
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="text-text-tertiary hover:text-primary transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

function YouTubeSearchPreview({ title }: { title: string }) {
  const truncated = title.length > 70 ? title.slice(0, 70) + '...' : title
  return (
    <div className="flex gap-3 p-3 rounded-lg bg-white border border-border/30">
      <div className="w-40 h-[90px] bg-dark/10 rounded-lg flex items-center justify-center text-text-tertiary shrink-0">
        <Youtube className="w-8 h-8 opacity-20" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#030303] leading-snug line-clamp-2 font-[Arial,sans-serif]">
          {truncated}
        </p>
        <p className="text-[11px] text-[#606060] mt-1">BATTELLS</p>
        <p className="text-[11px] text-[#606060]">1,2M vues · il y a 2 jours</p>
      </div>
    </div>
  )
}

function YouTubeHomePreview({ title }: { title: string }) {
  const truncated = title.length > 60 ? title.slice(0, 60) + '...' : title
  return (
    <div className="rounded-lg overflow-hidden border border-border/30 bg-white">
      <div className="w-full h-36 bg-dark/10 flex items-center justify-center text-text-tertiary">
        <Youtube className="w-12 h-12 opacity-20" />
      </div>
      <div className="p-3 flex gap-2.5">
        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">B</div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-[#030303] leading-snug line-clamp-2 font-[Arial,sans-serif]">
            {truncated}
          </p>
          <p className="text-[11px] text-[#606060] mt-0.5">BATTELLS · 1,2M vues · il y a 2 jours</p>
        </div>
      </div>
    </div>
  )
}

function TikTokPreview({ title, hashtags }: { title: string; hashtags: string[] }) {
  return (
    <div className="relative w-48 h-80 bg-dark rounded-2xl overflow-hidden mx-auto border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-3 right-10 space-y-1.5">
        <p className="text-xs font-bold text-white">@battells</p>
        <p className="text-[11px] text-white/90 leading-snug line-clamp-3">{title}</p>
        <p className="text-[10px] text-white/60 line-clamp-1">{hashtags.join(' ')}</p>
      </div>
    </div>
  )
}

function InstagramPreview({ title, hashtags }: { title: string; hashtags: string[] }) {
  const caption = `${title}\n\n${hashtags.slice(0, 10).join(' ')}${hashtags.length > 10 ? '...' : ''}`
  const preview = caption.length > 100 ? caption.slice(0, 100) + '... voir plus' : caption
  return (
    <div className="rounded-lg overflow-hidden border border-border/30 bg-white">
      <div className="w-full aspect-square bg-dark/10 flex items-center justify-center text-text-tertiary max-h-40">
        <Instagram className="w-10 h-10 opacity-20" />
      </div>
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary" />
          <span className="text-xs font-bold text-[#262626]">battells</span>
        </div>
        <p className="text-[11px] text-[#262626] leading-snug whitespace-pre-line">{preview}</p>
      </div>
    </div>
  )
}

export default function OutputPanel({ result, formData, loading }: OutputPanelProps) {
  const [activePreview, setActivePreview] = useState<PreviewTab>('yt-search')
  const [showSection, setShowSection] = useState<'preview' | 'description' | 'tags' | 'hooks'>('preview')

  const displayTitle = result?.optimized_title || formData.title || 'Votre titre apparaitra ici...'
  const tiktokHashtags = result?.hashtags?.tiktok || []
  const instaHashtags = result?.hashtags?.instagram || []

  const previewTabs: { id: PreviewTab; label: string }[] = [
    { id: 'yt-search', label: 'YT Search' },
    { id: 'yt-home', label: 'YT Home' },
    { id: 'tiktok', label: 'TikTok' },
    { id: 'instagram', label: 'Insta' },
  ]

  const sections = [
    { id: 'preview' as const, label: 'Preview', icon: Eye },
    { id: 'description' as const, label: 'Description', icon: FileText },
    { id: 'tags' as const, label: 'Tags', icon: Hash },
    { id: 'hooks' as const, label: 'Hooks', icon: Zap },
  ]

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5 space-y-4 overflow-y-auto max-h-[75vh]">
      {/* Section tabs */}
      <div className="flex gap-1 bg-page rounded-lg p-1">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setShowSection(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold font-[var(--font-clash)] rounded-md transition-all ${
              showSection === id
                ? 'bg-surface text-primary shadow-sm'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="wait">
          {/* PREVIEW section */}
          {showSection === 'preview' && (
            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex gap-1">
                {previewTabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActivePreview(t.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold font-[var(--font-clash)] rounded-md transition-all ${
                      activePreview === t.id ? 'bg-dark text-white' : 'text-text-tertiary hover:text-text-secondary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activePreview === 'yt-search' && <YouTubeSearchPreview title={displayTitle} />}
              {activePreview === 'yt-home' && <YouTubeHomePreview title={displayTitle} />}
              {activePreview === 'tiktok' && <TikTokPreview title={displayTitle} hashtags={tiktokHashtags} />}
              {activePreview === 'instagram' && <InstagramPreview title={displayTitle} hashtags={instaHashtags} />}
            </motion.div>
          )}

          {/* DESCRIPTION section */}
          {showSection === 'description' && result?.description_generated && (
            <motion.div key="desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                  Description generee
                </span>
                <CopyButton text={result.description_generated} />
              </div>
              <div className="p-4 bg-page rounded-xl border border-border/30 max-h-64 overflow-y-auto">
                <pre className="text-xs text-text-primary font-[var(--font-satoshi)] whitespace-pre-wrap leading-relaxed">
                  {result.description_generated}
                </pre>
              </div>
            </motion.div>
          )}

          {/* TAGS section */}
          {showSection === 'tags' && result && (
            <motion.div key="tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* YouTube Tags */}
              {result.tags_generated.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                      Tags YouTube ({result.tags_generated.length})
                    </span>
                    <CopyButton text={result.tags_generated.join(', ')} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags_generated.map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-red-500/10 text-red-600 border border-red-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Hashtags per platform */}
              {Object.entries(result.hashtags || {}).map(([platform, tags]) => (
                <div key={platform}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)] capitalize">
                      Hashtags {platform} ({(tags as string[]).length})
                    </span>
                    <CopyButton text={(tags as string[]).join(' ')} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(tags as string[]).map((tag, i) => (
                      <span key={i} className="text-[11px] px-2 py-1 rounded-lg bg-info/10 text-info border border-info/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* HOOKS section */}
          {showSection === 'hooks' && result?.hook_suggestions && (
            <motion.div key="hooks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <span className="text-xs font-bold text-text-secondary font-[var(--font-clash)]">
                Hook — les 3 premieres secondes
              </span>
              {result.hook_suggestions.map((hook, i) => (
                <div key={i} className="p-3 rounded-xl bg-dark text-white">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-primary font-[var(--font-bebas)] tracking-wider">
                      HOOK {i + 1}
                    </span>
                    <CopyButton text={hook} />
                  </div>
                  <p className="text-sm font-[var(--font-satoshi)] text-white/90 italic">
                    "{hook}"
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Empty state */}
          {!result && showSection !== 'preview' && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-text-tertiary">
              <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Lance l'optimisation pour voir les resultats</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Labo/components/OutputPanel.tsx
git commit -m "feat(labo): add OutputPanel with multi-platform previews, description, tags, hooks"
```

---

## Task 10: HistoryTable Component

**Files:**
- Create: `src/pages/Labo/components/HistoryTable.tsx`

**Step 1: Create the HistoryTable**

Bottom section showing past optimizations with performance tracking.

```typescript
// src/pages/Labo/components/HistoryTable.tsx
import { motion } from 'framer-motion'
import { History, ArrowUpRight } from 'lucide-react'
import type { TitleOptimization } from '@/types/database'

interface HistoryTableProps {
  history: TitleOptimization[]
  loading: boolean
  onSelect: (opt: TitleOptimization) => void
}

export default function HistoryTable({ history, loading, onSelect }: HistoryTableProps) {
  if (loading) {
    return (
      <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 p-6 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (history.length === 0) return null

  return (
    <div className="bg-surface rounded-[var(--radius-card-lg)] border border-border/40 shadow-[var(--shadow-card)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-4 h-4 text-text-tertiary" />
        <h2 className="text-sm font-bold font-[var(--font-bebas)] tracking-widest text-text-tertiary uppercase">
          Historique des optimisations
        </h2>
        <span className="text-xs text-text-tertiary">({history.length})</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Titre original
              </th>
              <th className="text-left py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Titre optimise
              </th>
              <th className="text-center py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Score
              </th>
              <th className="text-center py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Plateformes
              </th>
              <th className="text-right py-2 px-3 text-[10px] font-bold text-text-tertiary uppercase tracking-wider font-[var(--font-bebas)]">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((opt) => (
              <motion.tr
                key={opt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => onSelect(opt)}
                className="border-b border-border/20 hover:bg-primary-50 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-3">
                  <span className="text-xs text-text-secondary font-[var(--font-satoshi)] line-clamp-1">
                    {opt.original_title}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-xs text-text-primary font-medium font-[var(--font-satoshi)] line-clamp-1 flex items-center gap-1">
                    {opt.optimized_title || '—'}
                    <ArrowUpRight className="w-3 h-3 text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  {opt.score !== null ? (
                    <span className={`text-xs font-bold font-[var(--font-space-grotesk)] ${
                      (opt.score ?? 0) >= 80 ? 'text-success' : (opt.score ?? 0) >= 60 ? 'text-warning' : 'text-error'
                    }`}>
                      {opt.score}
                    </span>
                  ) : '—'}
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    {opt.platform.map((p) => (
                      <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-border/30 text-text-tertiary uppercase">
                        {p.slice(0, 2)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-xs text-text-tertiary font-[var(--font-satoshi)]">
                    {new Date(opt.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add src/pages/Labo/components/HistoryTable.tsx
git commit -m "feat(labo): add HistoryTable component with past optimizations"
```

---

## Task 11: Routing & Navigation — Wire Le Labo into the app

**Files:**
- Modify: `src/App.tsx` (add route)
- Modify: `src/lib/constants.ts` (add nav item)
- Modify: `src/components/layout/Sidebar.tsx` (add FlaskConical icon)

**Step 1: Add route to App.tsx**

Add import at line 15:
```typescript
import Labo from '@/pages/Labo'
```

Add route after the `/idees` route (line 62):
```typescript
<Route path="/labo" element={<Labo />} />
```

**Step 2: Add nav item to constants.ts**

In `NAV_SECTIONS`, add `labo` item to the PRODUCTION section (after `ideas`, before `calendar`):

```typescript
{ id: 'labo', label: 'Le Labo', icon: 'flask-conical', path: '/labo' },
```

**Step 3: Add icon mapping to Sidebar.tsx**

Import `FlaskConical` in the import from `lucide-react` (line 3).

Add to `iconMap` object:
```typescript
'flask-conical': FlaskConical,
```

**Step 4: Commit**

```bash
git add src/App.tsx src/lib/constants.ts src/components/layout/Sidebar.tsx
git commit -m "feat(labo): wire Le Labo route and navigation"
```

---

## Task 12: Integration buttons — Ideas + Calendar

**Files:**
- Modify: `src/pages/Ideas/components/SavedIdeaCard.tsx` (add "Optimiser" button)
- Modify: `src/pages/Calendar/components/CalendarModal.tsx` (add "Optimiser" button)

**Step 1: Add button to SavedIdeaCard**

Read the file first, then add a Link to `/labo?title=...&idea_id=...` button after the archive button. Use `useNavigate` or a `<Link>` from react-router-dom.

Add a small flask icon button that navigates to:
```
/labo?title=${encodeURIComponent(idea.title)}&idea_id=${idea.id}&format=${idea.format_tag || ''}
```

**Step 2: Add button to CalendarModal**

Add a similar button that navigates to:
```
/labo?title=${encodeURIComponent(item.title)}&calendar_id=${item.id}&format=${item.format_tag || ''}
```

**Step 3: Commit**

```bash
git add src/pages/Ideas/components/SavedIdeaCard.tsx src/pages/Calendar/components/CalendarModal.tsx
git commit -m "feat(labo): add 'Optimiser dans Le Labo' buttons to Ideas and Calendar"
```

---

## Task 13: Update backlog status

**Files:**
- Modify: `docs/plans/features-backlog.md`

**Step 1: Update status**

Change "Optimiseur de titres & descriptions" status from "A faire" to "FAIT".

**Step 2: Commit**

```bash
git add docs/plans/features-backlog.md
git commit -m "docs: mark title optimizer as done in backlog"
```

---

## Execution Notes

- **Total tasks**: 13
- **Total commits**: 13
- **New files**: 8 (1 migration, 2 hooks, 1 edge function, 4 components + page)
- **Modified files**: 5 (types, hooks/index, App, constants, Sidebar)
- **No new dependencies** — uses existing recharts, framer-motion, lucide-react
- **Edge function**: Deploy with `supabase functions deploy optimize-title` after commit
