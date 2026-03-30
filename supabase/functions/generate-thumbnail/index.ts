import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Nano Banana 2 uses gemini-3.1-flash-image-preview
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

// Baptiste (BATTELLS) face instruction — always included in prompts with people
const BAPTISTE_FACE = `The main person in the image is Baptiste, a young French man in his mid-20s with short brown hair, light stubble, warm brown eyes, friendly expressive face, slightly athletic build. He always wears casual streetwear (hoodie, cap, or t-shirt). His expressions are always exaggerated and theatrical for YouTube thumbnails.`

const TEMPLATES: Record<string, { basePrompt: string; includesBaptiste: boolean }> = {
  'food-closeup': {
    basePrompt: 'Hyperrealistic close-up photograph of {subject}, Caravaggio-style dramatic chiaroscuro lighting with deep shadows and warm golden highlights. Steam rising, ingredients glistening with moisture. Shot on medium format camera, shallow depth of field f/1.4. Dark moody background. Professional food editorial styling. 8K quality, ultra detailed textures. No text overlay.',
    includesBaptiste: false,
  },
  'split-before-after': {
    basePrompt: 'Split scene image divided vertically. Left side: raw messy {subject} ingredients scattered on dark counter, chaotic. Right side: beautiful plated {subject} with professional garnish and presentation. Bold contrasting colors between both sides. Clean dividing line. Dramatic lighting on both sides. Food photography, editorial quality. No text.',
    includesBaptiste: false,
  },
  'challenge-reaction': {
    basePrompt: '{BAPTISTE} with shocked exaggerated expression, mouth wide open, eyes bulging, looking at {subject}. Ultra photorealistic portrait photography. {subject} in foreground looking incredible. Dynamic composition with vibrant colors. Bold, playful, YouTube thumbnail style. Orange and warm tones (#FF6B00, #FFB800). Professional studio lighting.',
    includesBaptiste: true,
  },
  'cartoon-recipe': {
    basePrompt: 'Colorful cartoon style cooking scene featuring {subject} with floating ingredients in mid-air, whisk and utensils animated, vibrant saturated colors, playful composition, warm orange palette, food illustration style, magical sparkles and steam effects, cheerful energy. No text.',
    includesBaptiste: false,
  },
  'gustavo-scene': {
    basePrompt: '{BAPTISTE} dressed as a sarcastic chef with arms crossed and a smug expression, standing next to {subject}, dramatic studio lighting, ultra photorealistic, warm orange and gold tones, cinematic composition. Professional portrait photography.',
    includesBaptiste: true,
  },
  'blind-order': {
    basePrompt: '{BAPTISTE} with blindfold on, hands reaching for covered silver cloches on dark table, one cloche partially lifted revealing {subject}, dramatic fog and backlighting, question marks floating in air, cinematic moody atmosphere, suspenseful composition, blue and orange color contrast. Ultra photorealistic.',
    includesBaptiste: true,
  },
  'food-explosion': {
    basePrompt: 'Dynamic food explosion with {subject} ingredients suspended in mid-air against dark background, flying apart in slow motion with dramatic backlighting. Droplets of sauce and oil frozen in time. Professional commercial photography, high-speed capture effect. Vibrant colors, sharp details, studio lighting. No text.',
    includesBaptiste: false,
  },
  'text-bold': {
    basePrompt: "Bold typographic design with the word '{title}' in massive 3D brushstroke letters, orange gradient (#FF6B00 to #FFB800), food elements including {subject} scattered around text, dark background with particle effects, energetic and impactful, social media cover style.",
    includesBaptiste: false,
  },
  'comparison': {
    basePrompt: '{BAPTISTE} in the center looking amazed, split image comparison food photography of {subject}, left side: classic homemade version, right side: gourmet restaurant version, large VS text between them with fire effects, dramatic lighting on both sides, professional food styling, competitive energy. Ultra photorealistic.',
    includesBaptiste: true,
  },
  'cinematic-plate': {
    basePrompt: 'Cinematic overhead shot of {subject} on dark slate plate, professional food styling with herb garnish, moody atmospheric lighting with lens flare, shallow depth of field, film grain texture, editorial magazine quality, warm tones. No text.',
    includesBaptiste: false,
  },
  'defi-24h': {
    basePrompt: '{BAPTISTE} looking exhausted but determined, next to a large stylized clock showing 24H, surrounded by {subject} and various food items, dynamic composition, warm orange glow, energetic and challenging mood. Ultra photorealistic YouTube thumbnail style.',
    includesBaptiste: true,
  },
  'street-food': {
    basePrompt: 'Cinematic street food scene with motion blur, vendor preparing {subject} in French market stall, golden hour lighting, shallow depth of field, steam and smoke effects, dynamic movement feel, warm tones, professional travel photography style. No text.',
    includesBaptiste: false,
  },
  'ultra-photorealistic': {
    basePrompt: '{BAPTISTE} in a dramatic YouTube thumbnail pose reacting to {subject}. Ultra photorealistic, shot on Sony A7IV with 85mm f/1.4 lens, shallow depth of field, professional studio lighting with rim light and key light, skin texture visible, catchlights in eyes, 8K resolution. Cinematic color grading with warm tones. The food ({subject}) is styled by a professional food stylist with steam, glistening sauce, perfect plating.',
    includesBaptiste: true,
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
    return `Professional food photography of ${subject}, dramatic lighting, cinematic composition, ${platform === 'youtube' ? '16:9 landscape' : '9:16 portrait'} format. Ultra photorealistic. No text.`
  }

  let prompt = template.basePrompt
    .replace(/\{title\}/g, title || 'BATTELLS')
    .replace(/\{subject\}/g, subject)

  // Inject Baptiste's description if template includes him
  if (template.includesBaptiste) {
    prompt = prompt.replace(/\{BAPTISTE\}/g, 'Baptiste (a young French YouTuber)')
    prompt = `${BAPTISTE_FACE}\n\n${prompt}`
  }

  return prompt
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  try {
    const body = await req.json()
    const {
      template_id,
      title = '',
      subject,
      platform = 'youtube',
      custom_prompt,
      format_tag,
      quality = '2K',
      video_idea_id,
      calendar_item_id,
    } = body

    if (!subject) {
      return new Response(JSON.stringify({ error: 'subject is required' }), { status: 400, headers: CORS_HEADERS })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Build prompt from template or custom
    const finalPrompt = buildPrompt(template_id, title, subject, platform, custom_prompt)

    // Add aspect ratio and quality instructions
    const aspectRatio = platform === 'youtube' ? '16:9' : '9:16'
    const qualityInstruction = quality === '4K' ? 'Ultra high resolution 4K, maximum detail and sharpness.' : quality === '2K' ? 'High resolution 2K quality.' : ''
    const promptWithMeta = `${finalPrompt}\n\nAspect ratio: ${aspectRatio}. ${qualityInstruction}`

    // Call Gemini Image Generation API (same model as Nano Banana 2)
    const geminiPayload = {
      contents: [{ parts: [{ text: promptWithMeta }] }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        responseMimeType: 'text/plain',
      },
    }

    console.log('Calling Gemini with model gemini-3.1-flash-image-preview')
    console.log('Prompt:', promptWithMeta.slice(0, 200))

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error status:', geminiRes.status, errText.slice(0, 500))
      return new Response(JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, details: errText.slice(0, 200) }), { status: 502, headers: CORS_HEADERS })
    }

    const data = await geminiRes.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData)

    if (!imagePart?.inlineData?.data) {
      const textPart = parts.find((p: any) => p.text)
      console.error('No image in response. Text:', textPart?.text?.slice(0, 300))
      console.error('Parts count:', parts.length, 'Keys:', parts.map((p: any) => Object.keys(p)))
      return new Response(JSON.stringify({ error: 'No image generated', details: textPart?.text?.slice(0, 200) || 'Empty response' }), { status: 502, headers: CORS_HEADERS })
    }

    const base64Data = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/png'
    const ext = mimeType.includes('jpeg') ? 'jpeg' : 'png'

    // Upload to Supabase Storage
    const fileName = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, imageBuffer, { contentType: mimeType, upsert: false })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return new Response(JSON.stringify({ error: 'Storage upload failed', details: uploadError.message }), { status: 500, headers: CORS_HEADERS })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName)

    // Insert record into thumbnail_generations table
    const { error: insertError } = await supabase.from('thumbnail_generations').insert({
      template_id: template_id || 'custom',
      title: title || subject,
      prompt_used: finalPrompt,
      platform,
      aspect_ratio: aspectRatio,
      image_url: publicUrl,
      image_path: fileName,
      format_tag: format_tag || null,
      quality,
      metadata: { model: 'gemini-3.1-flash-image-preview' },
      video_idea_id: video_idea_id || null,
      calendar_item_id: calendar_item_id || null,
    })

    if (insertError) {
      console.error('DB insert error:', insertError)
    }

    return new Response(JSON.stringify({
      image_url: publicUrl,
      prompt_used: finalPrompt,
      template_id: template_id || 'custom',
      platform,
    }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: CORS_HEADERS })
  }
})
