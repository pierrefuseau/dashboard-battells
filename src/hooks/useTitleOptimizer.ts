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

  return { result, history, loading, historyLoading, error, optimize, runAbTest, abTestResult, fetchHistory }
}
