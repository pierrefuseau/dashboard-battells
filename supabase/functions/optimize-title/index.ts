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
  const { data: videos } = await supabase
    .from('yt_videos')
    .select('id, title, format_tag, is_short')

  if (!videos || videos.length === 0) return []

  const { data: stats } = await supabase
    .from('yt_daily_stats')
    .select('video_id, views, impressions_ctr, likes')

  if (!stats) return []

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
  "description_generated": "Description YouTube complete avec SEO, timestamps, CTA, liens sociaux BATTELLS, section A propos. Inclure les 2-3 premieres lignes optimisees SEO, le corps structure, et les liens sociaux.",
  "tags_generated": ["tag1", "tag2", "...15-20 tags pertinents food/YouTube"],
  "hashtags": {
    "youtube": ["#tag1", "#tag2", "#tag3"],
    "tiktok": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
    "instagram": ["#tag1", "...jusqu'a 30 hashtags pertinents food"]
  },
  "hook_suggestions": [
    "Hook 1 : les 3 premieres secondes de la video",
    "Hook 2 : variante alternative",
    "Hook 3 : variante audacieuse"
  ],
  "title_gaps": [
    {"keyword": "mot-cle food populaire non utilise par BATTELLS", "volume_estimate": 50000, "opportunity_score": 8, "video_suggestion": "Idee de video pour couvrir ce gap"}
  ],
  "pattern_insights": {
    "top_keywords": [{"word": "mot", "avg_views": 500000, "count": 12}],
    "optimal_length": {"min": 45, "max": 60, "sweet_spot": 52},
    "best_structures": [{"type": "question", "avg_views": 800000, "example": "Exemple de titre"}],
    "competitor_titles": [{"title": "Titre concurrent", "views": 1000000, "channel": "Nom de chaine"}]
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
