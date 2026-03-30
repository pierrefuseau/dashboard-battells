import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GEMINI_API_KEY}`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

const TEMPLATES: Record<string, { basePrompt: string }> = {
  'food-closeup': {
    basePrompt: 'Hyperrealistic close-up photograph of {subject}, Caravaggio-style dramatic chiaroscuro lighting with deep shadows and warm golden highlights. Steam rising, ingredients glistening with moisture. Shot on medium format camera, shallow depth of field f/1.4. Dark moody background. Professional food editorial styling. 8K quality, ultra detailed textures. No text overlay.',
  },
  'split-before-after': {
    basePrompt: 'Split scene image divided vertically. Left side: raw messy {subject} ingredients scattered on dark counter, chaotic. Right side: beautiful plated {subject} with professional garnish and presentation. Bold contrasting colors between both sides. Clean dividing line. Dramatic lighting on both sides. Food photography, editorial quality. No text.',
  },
  'challenge-reaction': {
    basePrompt: '3D cartoon character with shocked exaggerated expression, mouth wide open, eyes bulging, looking at {subject}. Colorful pop style, vibrant saturated colors. {subject} in foreground looking incredible. Dynamic composition with energy lines and sparkle effects. Bold, playful, YouTube thumbnail style. Orange and warm tones (#FF6B00, #FFB800). No text.',
  },
  'cartoon-recipe': {
    basePrompt: 'Colorful cartoon style cooking scene featuring {subject} with floating ingredients in mid-air, whisk and utensils animated, vibrant saturated colors, playful composition, warm orange palette, food illustration style, magical sparkles and steam effects, cheerful energy. No text.',
  },
  'gustavo-scene': {
    basePrompt: '3D animated cartoon character with exaggerated sarcastic expression wearing chef hat, arms crossed, standing next to {subject}, dramatic studio lighting, Pixar-quality rendering, warm orange and gold tones, cinematic composition. No text.',
  },
  'blind-order': {
    basePrompt: 'Mysterious food photography scene with covered silver cloches on dark table, one cloche partially lifted revealing {subject}, dramatic fog and backlighting, question marks floating in air, cinematic moody atmosphere, suspenseful composition, blue and orange color contrast. No text.',
  },
  'food-explosion': {
    basePrompt: 'Dynamic food explosion with {subject} ingredients suspended in mid-air against dark background, flying apart in slow motion with dramatic backlighting. Droplets of sauce and oil frozen in time. Professional commercial photography, high-speed capture effect. Vibrant colors, sharp details, studio lighting. No text.',
  },
  'text-bold': {
    basePrompt: "Bold typographic design with the word '{title}' in massive 3D brushstroke letters, orange gradient (#FF6B00 to #FFB800), food elements including {subject} scattered around text, dark background with particle effects, energetic and impactful, social media cover style.",
  },
  'comparison': {
    basePrompt: 'Split image comparison food photography of {subject}, left side: classic homemade version, right side: gourmet restaurant version, large VS text in center with fire effects, dramatic lighting on both sides, professional food styling, competitive energy.',
  },
  'cinematic-plate': {
    basePrompt: 'Cinematic overhead shot of {subject} on dark slate plate, professional food styling with herb garnish, moody atmospheric lighting with lens flare, shallow depth of field, film grain texture, editorial magazine quality, warm tones. No text.',
  },
  'defi-24h': {
    basePrompt: 'Creative food and time concept: large stylized clock face with {subject} elements replacing numbers, dynamic composition, 24H text prominently displayed, warm orange glow, energetic and challenging mood. YouTube thumbnail style.',
  },
  'street-food': {
    basePrompt: 'Cinematic street food scene with motion blur, vendor preparing {subject} in French market stall, golden hour lighting, shallow depth of field, steam and smoke effects, dynamic movement feel, warm tones, professional travel photography style. No text.',
  },
}

function buildPrompt(
  templateId: string | undefined,
  title: string,
  subject: string,
  platform: string,
  customPrompt?: string,
): string {
  if (customPrompt) return customPrompt

  const template = templateId ? TEMPLATES[templateId] : undefined
  if (!template) {
    return `Professional food photography of ${subject}, dramatic lighting, cinematic composition, ${platform === 'youtube' ? '16:9 landscape' : '9:16 portrait'} format. No text.`
  }

  return template.basePrompt
    .replace(/\{title\}/g, title)
    .replace(/\{subject\}/g, subject)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const {
      template_id,
      title,
      subject,
      platform = 'youtube',
      custom_prompt,
      format_tag,
      quality,
      video_idea_id,
      calendar_item_id,
    } = body

    if (!title || !subject) {
      return new Response(JSON.stringify({ error: 'title and subject required' }), { status: 400, headers: CORS_HEADERS })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Build prompt from template or custom
    const finalPrompt = buildPrompt(template_id, title, subject, platform, custom_prompt)

    // Add aspect ratio instruction
    const aspectRatio = platform === 'youtube' ? '16:9' : '9:16'
    const promptWithAspect = `${finalPrompt}\n\nAspect ratio: ${aspectRatio}`

    // Call Gemini Image Generation API
    const geminiPayload = {
      contents: [{ parts: [{ text: promptWithAspect }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        responseMimeType: 'text/plain',
      },
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

    const data = await geminiRes.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData)

    if (!imagePart?.inlineData?.data) {
      console.error('No image in Gemini response:', JSON.stringify(parts).slice(0, 500))
      return new Response(JSON.stringify({ error: 'No image generated' }), { status: 502, headers: CORS_HEADERS })
    }

    const base64Data = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/png'

    // Upload to Supabase Storage
    const fileName = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.png`
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, imageBuffer, { contentType: mimeType, upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(JSON.stringify({ error: 'Storage upload failed' }), { status: 500, headers: CORS_HEADERS })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName)

    // Insert record into thumbnail_generations table
    const { error: insertError } = await supabase.from('thumbnail_generations').insert({
      template_id,
      title,
      prompt_used: finalPrompt,
      platform,
      aspect_ratio: aspectRatio,
      image_url: publicUrl,
      image_path: fileName,
      format_tag,
      quality: quality || '1K',
      metadata: { model: 'gemini-2.0-flash-preview-image-generation' },
      video_idea_id: video_idea_id || null,
      calendar_item_id: calendar_item_id || null,
    })

    if (insertError) {
      console.error('DB insert error:', insertError)
      // Non-blocking: image was uploaded successfully, just log the DB error
    }

    return new Response(JSON.stringify({
      image_url: publicUrl,
      prompt_used: finalPrompt,
      template_id,
      platform,
    }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: CORS_HEADERS })
  }
})
