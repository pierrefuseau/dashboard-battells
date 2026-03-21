import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_PROMPT = `Tu es un expert en stratégie de contenu YouTube/TikTok, spécialisé dans le food content et l'entertainment.

Tu analyses des vidéos virales pour le créateur BATTELLS (543K abonnés YouTube, 500K TikTok).
BATTELLS fait du food content : recettes cartoon, défis 24h, commandes à l'aveugle, avec un personnage récurrent "Gustavo" (voix off sarcastique).
Son lexique : Dinguerie, Banger, Magnificus, Zinzin, Légendaire, Machine, Monstre.

Pour chaque vidéo analysée, tu dois fournir un JSON STRICT avec ces champs :
{
  "why_it_works": ["raison 1", "raison 2", "raison 3"],
  "battells_adaptation": "Description détaillée de comment adapter cette vidéo en version BATTELLS",
  "suggested_title": "Titre YouTube accrocheur style BATTELLS",
  "suggested_hook": "Les 3 premières secondes du hook",
  "gustavo_role": "Comment Gustavo intervient dans cette vidéo (ou null si pas pertinent)",
  "estimated_views": 500000,
  "format_recommendation": "short | long | both"
}

Réponds UNIQUEMENT avec le JSON, sans markdown, sans explication.`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    })
  }

  try {
    const { detected_video_id } = await req.json()
    if (!detected_video_id) {
      return new Response(JSON.stringify({ error: 'detected_video_id required' }), { status: 400 })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch the detected video
    const { data: video, error: videoErr } = await supabase
      .from('detected_videos')
      .select('*')
      .eq('id', detected_video_id)
      .single()

    if (videoErr || !video) {
      return new Response(JSON.stringify({ error: 'Video not found' }), { status: 404 })
    }

    // Call Gemini 2.5 Pro
    const geminiPayload = {
      contents: [{
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nAnalyse cette vidéo :\n- Titre : ${video.title}\n- Chaîne : ${video.channel_name}\n- Plateforme : ${video.platform}\n- Vues : ${video.views}\n- Likes : ${video.likes}\n- Commentaires : ${video.comments}\n- Surperformance : +${Math.round((video.overperformance_ratio - 1) * 100)}% vs moyenne de la chaîne\n- URL : ${video.video_url}`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      }
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', errText)
      return new Response(JSON.stringify({ error: 'Gemini API error' }), { status: 502 })
    }

    const geminiData = await geminiRes.json()
    // Gemini 2.5 Pro thinking model may return parts with thought + text
    const parts = geminiData.candidates?.[0]?.content?.parts ?? []
    const textPart = parts.find((p: { text?: string }) => p.text) ?? parts[0]
    const rawText = textPart?.text ?? '{}'

    let analysis
    try {
      analysis = JSON.parse(rawText)
    } catch {
      console.error('Failed to parse Gemini response:', rawText)
      analysis = { why_it_works: ['Analyse indisponible'], battells_adaptation: rawText }
    }

    // Find or create the video_idea linked to this detection
    const { data: existingIdea } = await supabase
      .from('video_ideas')
      .select('id')
      .eq('detected_video_id', detected_video_id)
      .single()

    if (existingIdea) {
      // Update existing idea with AI analysis
      await supabase
        .from('video_ideas')
        .update({ ai_analysis: analysis })
        .eq('id', existingIdea.id)
    } else {
      // Create new idea with analysis
      await supabase
        .from('video_ideas')
        .insert({
          title: analysis.suggested_title || video.title,
          source: 'competitor',
          detected_video_id,
          status: 'backlog',
          is_long_form: analysis.format_recommendation === 'long' || analysis.format_recommendation === 'both',
          ai_analysis: analysis,
        })
    }

    return new Response(JSON.stringify({ success: true, analysis }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
