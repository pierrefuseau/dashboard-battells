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
      const { data: videosWithId } = await supabase
        .from('yt_videos')
        .select('id, title, format_tag')

      if (!videosWithId) { setLoading(false); return }

      const { data: stats } = await supabase
        .from('yt_daily_stats')
        .select('video_id, views')

      if (!stats) { setLoading(false); return }

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

    const topTitles = [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 50)

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
      .filter(([, s]) => s.count >= 3)
      .map(([word, s]) => ({ word, avgViews: Math.round(s.totalViews / s.count), count: s.count }))
      .sort((a, b) => b.avgViews - a.avgViews)
      .slice(0, 20)

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
