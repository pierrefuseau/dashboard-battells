import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Nano Banana 2 model
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

// Baptiste reference photo URLs (deployed on Netlify with the app)
const BAPTISTE_REFERENCE_URLS = [
  'https://dashboard-battells.netlify.app/baptiste/face-closeup.png',
  'https://dashboard-battells.netlify.app/baptiste/face-smile.png',
]

// Expert-level prompt engineering based on awesome-nano-banana-pro-prompts
// Each template uses specific photography/art direction techniques
const TEMPLATES: Record<string, { prompt: string; needsBaptiste: boolean }> = {
  'food-closeup': {
    needsBaptiste: false,
    prompt: `Hyperrealistic extreme close-up food photograph of {subject}. Caravaggio-style dramatic chiaroscuro lighting: single warm key light from upper left creating deep shadows and golden highlights on the food surface. Ingredients glistening with moisture droplets, visible steam rising in the backlight. Shot on Phase One IQ4 150MP medium format camera, Schneider Kreuznach 120mm f/3.5 macro lens at f/2.8, focus stacked for edge-to-edge sharpness on the hero element. Dark moody negative-fill background with subtle warm ambient bounce. Professional food stylist plating with micro-herbs, edible flowers, sauce drizzle artistry. Color temperature 3200K tungsten with 5600K rim. 8K resolution, ultra-detailed textures showing every grain, pore, and glistening surface. No text, no watermark, no UI elements.`,
  },

  'split-before-after': {
    needsBaptiste: false,
    prompt: `Perfectly split dual-scene food photograph divided by a precise clean vertical line at exact center. LEFT HALF: chaotic raw ingredient scene — {subject} ingredients scattered messily on a dark granite countertop, flour dust in air, eggshells cracked, vegetables unpeeled, raw meat visible, knife marks on cutting board, overhead flat-lay perspective with harsh direct flash creating documentary-style unflattering shadows. RIGHT HALF: the same {subject} as a magnificent finished dish, professionally plated on matte black ceramic, garnished with precision tweezers, shot with soft diffused studio strobe, shallow depth of field f/1.8, warm 3400K color temperature, hero lighting from 45-degree angle. The contrast between halves should be stark and immediately readable at thumbnail scale. Bold color contrast. No text. Professional editorial quality.`,
  },

  'challenge-reaction': {
    needsBaptiste: true,
    prompt: `YouTube thumbnail photograph featuring this exact person from the reference photo. The person has the EXACT same face, glasses, curly brown hair, and light stubble beard as in the reference image. They are making an extremely exaggerated shocked reaction — mouth wide open, eyes bulging behind their glasses, hands on cheeks or raised in disbelief — while looking at {subject} which is positioned prominently in the lower-right foreground. Shot with Canon R5 Mark II, 35mm f/1.4 lens wide open for environmental portrait bokeh. Two-light setup: orange-gelled key light camera-left (#FF6B00) and cool blue fill camera-right for color contrast. Dynamic diagonal composition following the rule of thirds. The food ({subject}) is styled to look over-the-top impressive with steam, height, and excess. Vibrant saturated colors pushed +20 in post. Energy and movement in the frame. YouTube thumbnail composition optimized for 1280x720 readability. No text overlay.`,
  },

  'cartoon-recipe': {
    needsBaptiste: false,
    prompt: `Vibrant cartoon illustration of a magical cooking scene featuring {subject}. Pixar-meets-Studio-Ghibli art style with volumetric lighting and atmospheric depth. Ingredients floating in mid-air in a spiral pattern as if summoned by magic — each ingredient perfectly rendered with cel-shading and specular highlights. Animated kitchen utensils (wooden spoon stirring by itself, whisk spinning, measuring cups pouring). Warm orange-dominant palette (#FF6B00, #FFB800, #FFF3E0) with complementary teal accents. Magical golden sparkle particles and swirling steam trails creating visual flow. A bubbling pot at center as the focal point with volumetric light beams streaming from above. Cheerful, energetic, inviting atmosphere. Professional animation key-frame quality. No text.`,
  },

  'gustavo-scene': {
    needsBaptiste: true,
    prompt: `Cinematic portrait photograph featuring this exact person from the reference photo, but styled as a sarcastic French chef character. The person has the EXACT same face, glasses, curly brown hair, and beard as in the reference image. They are wearing a professional white chef's double-breasted jacket and a tall toque blanche, arms crossed with a smug knowing smirk, one eyebrow slightly raised. Standing next to {subject} which is an elaborate culinary creation. Shot on Sony A1, 85mm GM f/1.4 at f/2.0, creating a creamy background bokeh. Rembrandt lighting pattern: warm key light at 45 degrees creating the signature triangle of light on the shadowed cheek. Deep rich shadows. Warm orange-gold color palette with the chef jacket providing a clean white anchor. Pixar-quality expressiveness in the face. Cinematic 2.39:1 feel within 16:9 frame. No text.`,
  },

  'blind-order': {
    needsBaptiste: true,
    prompt: `Cinematic suspense photograph featuring this exact person from the reference photo. The person has the EXACT same face, glasses, curly brown hair, and beard as in the reference image. They are wearing a black silk blindfold over their glasses, hands hovering uncertainly over two polished silver cloches on a dark mahogany table. One cloche is partially lifted, revealing a tantalizing glimpse of {subject} with steam escaping. Atmospheric fog machine haze at low level creating mystery. Lighting: strong blue-gelled backlight creating rim separation, warm amber key light from below (practical candles), floating translucent question mark shapes composited in the background with gaussian blur. Teal-and-orange cinematic color grade (complementary color theory). Shot on ARRI Alexa Mini, Cooke S7/i 50mm anamorphic for characteristic oval bokeh and lens flare streaks. Suspenseful, mysterious, cinematic atmosphere. No text.`,
  },

  'food-explosion': {
    needsBaptiste: false,
    prompt: `Ultra-high-speed freeze-frame food explosion photograph of {subject}. Every ingredient of {subject} captured suspended in mid-air at the apex of an explosive deconstructed burst — lettuce leaves caught mid-curl, sauce droplets as perfect spheres with surface tension visible, seeds and crumbs frozen in space, cheese stretching in mid-pull. Shot with Phantom Flex4K high-speed camera equivalent at 10,000fps, Nikon 105mm f/2.8 macro. Three-light setup: powerful backlight creating translucent edge glow through leafy ingredients, fill from below creating dramatic upward shadows, subtle key light for detail. Pure black background (negative fill V-flats). Each ingredient occupying its own depth plane creating a 3D layered effect. Sauce and oil droplets catching light like amber jewels. Maximum sharpness, maximum detail. Commercial advertising photography quality. No text.`,
  },

  'text-bold': {
    needsBaptiste: false,
    prompt: `Bold typographic poster design. The word "{title}" rendered in massive 3D hand-painted brushstroke letterforms, each letter with visible bristle texture and paint thickness variation. Orange-to-gold gradient paint (#FF6B00 transitioning to #FFB800) with metallic specular highlights suggesting wet paint. Letters arranged in a dynamic stacked composition with slight rotation for energy. Food elements ({subject}) artfully scattered between and around the letters — some overlapping in front, some tucked behind, creating depth layers. Dark charcoal background (#1A1A1A) with subtle bokeh particle effects (floating embers, dust motes catching light). Cinematic rim lighting on the 3D letter edges. Energetic, impactful, social media optimized vertical composition. Magazine cover art direction quality.`,
  },

  'comparison': {
    needsBaptiste: true,
    prompt: `Split-frame competitive comparison photograph featuring this exact person from the reference photo standing at center. The person has the EXACT same face, glasses, curly brown hair, and beard as in the reference image. They stand in the exact center with an amazed expression, acting as the human divider between two versions of {subject}. LEFT SIDE: rustic homemade version on a worn wooden board with checkered napkin, shot with flat lighting to look humble but honest. RIGHT SIDE: extravagant restaurant version on fine dining black slate with gold leaf and microgreens, shot with dramatic studio lighting to look premium. Large "VS" text rendered in the center with realistic fire and ember particle effects wrapping around the letters. Each side lit differently to emphasize the contrast. Competitive energy, dramatic tension. Shot on Canon R5, 24-70 f/2.8 at 35mm. No other text.`,
  },

  'cinematic-plate': {
    needsBaptiste: false,
    prompt: `Cinematic bird's-eye-view (directly overhead, 90-degree angle) photograph of {subject} on a handmade dark slate plate with raw stone edges. Professional food stylist plating: strategic negative space (50% plate visible), asymmetric composition following golden ratio spiral, micro-herbs placed with tweezers, sauce painted with an offset spatula in a single confident swoosh. Moody atmospheric lighting: soft overhead key with intentional lens flare streak from a practical candle at frame edge, shallow depth of field impossible at this angle (tilt-shift lens effect) blurring the far table elements. Anamorphic horizontal lens flare. Subtle film grain texture (Kodak Portra 400 emulation). Warm color temperature with cool shadow tones. Editorial magazine double-page-spread quality — Bon Appetit / Chef's Table aesthetic. Dark rustic oak table surface with patina. No text, no hands, no utensils in motion.`,
  },

  'defi-24h': {
    needsBaptiste: true,
    prompt: `Dynamic YouTube thumbnail photograph featuring this exact person from the reference photo. The person has the EXACT same face, glasses, curly brown hair, and beard as in the reference image. They look exhausted but fiercely determined — sweat on forehead, sleeves rolled up, slightly disheveled hair, dark circles under eyes but with a fierce competitive glint. A massive stylized industrial clock face dominates the background, showing 24 hours with food items replacing each hour number: position 12=croissant, 3=pizza slice, 6=burger, 9=sushi roll, other positions filled with {subject} and various foods. The clock hands are crossed utensils (fork and knife). "24H" displayed prominently in weathered metal industrial typography with warm orange LED glow (#FF6B00). Dynamic low-angle hero shot looking up at the person. High energy, challenge mood. No other text.`,
  },

  'street-food': {
    needsBaptiste: false,
    prompt: `Cinematic street photography of a French market food stall at golden hour. A vendor preparing {subject} — hands in motion with professional speed (natural motion blur on hands at 1/30s shutter), steam and smoke rising through golden backlight creating volumetric god-rays. Shot on Leica M11 with Summilux 35mm f/1.4 wide open, creating a dreamy shallow depth of field that isolates the food preparation action from the bustling market crowd (bokeh balls from string lights). French hand-painted market signage visible but soft. Warm Kodachrome color palette with rich yellows and deep shadows. The {subject} is the sharp focal point at center frame, glistening and fresh. Ambient atmosphere: cobblestone street, old stone buildings, copper pots. Golden hour rim light on steam. Travel photography meets food editorial. No text.`,
  },

  'ultra-photorealistic': {
    needsBaptiste: true,
    prompt: `Ultra-photorealistic YouTube thumbnail portrait featuring this exact person from the reference photo. The person has the EXACT same face, glasses, curly brown hair, and light stubble beard as in the reference image. Shot on Sony A7IV with Sony 85mm f/1.4 GM lens wide open. Three-point lighting setup: warm key light at 45 degrees (3200K, large octabox for soft wrap), cool fill at opposite 30 degrees (5600K, 1 stop under key), strong rim/hair light from behind-above creating separation from background. Skin texture fully resolved — every pore, stubble hair, and glasses reflection visible. Catchlights from octabox visible in both eyes. The person is reacting dramatically to {subject} which is positioned in the foreground at f/1.4 bokeh distance, styled by professional food stylist with steam wand, glycerin spray for moisture, and blowtorch caramelization. Cinematic color grade: lifted blacks, warm highlights, teal shadows (orange-teal complementary). 8K resolution downsampled for maximum perceived sharpness. No text, no graphics.`,
  },
}

// Fetch Baptiste's reference photo and convert to base64 for Gemini multimodal input
async function fetchBaptisteReference(): Promise<{ base64: string; mimeType: string } | null> {
  try {
    // Try the closeup first, fallback to smile
    for (const url of BAPTISTE_REFERENCE_URLS) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          const buffer = await res.arrayBuffer()
          const bytes = new Uint8Array(buffer)
          let binary = ''
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i])
          }
          const base64 = btoa(binary)
          const mimeType = res.headers.get('content-type') || 'image/png'
          console.log(`Fetched Baptiste reference from ${url} (${bytes.length} bytes)`)
          return { base64, mimeType }
        }
      } catch (e) {
        console.log(`Failed to fetch ${url}: ${e}`)
      }
    }
    return null
  } catch (e) {
    console.error('Failed to fetch any Baptiste reference:', e)
    return null
  }
}

function getPrompt(
  templateId: string | undefined,
  title: string,
  subject: string,
  platform: string,
  customPrompt?: string,
): { prompt: string; needsBaptiste: boolean } {
  if (customPrompt) return { prompt: customPrompt, needsBaptiste: false }

  const template = templateId ? TEMPLATES[templateId] : undefined
  if (!template) {
    return {
      prompt: `Professional food photography of ${subject}, dramatic lighting, cinematic composition, ${platform === 'youtube' ? '16:9 landscape' : '9:16 portrait'} format. Ultra photorealistic. No text.`,
      needsBaptiste: false,
    }
  }

  const prompt = template.prompt
    .replace(/\{title\}/g, title || 'BATTELLS')
    .replace(/\{subject\}/g, subject)

  return { prompt, needsBaptiste: template.needsBaptiste }
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

    // Build prompt
    const { prompt: basePrompt, needsBaptiste } = getPrompt(template_id, title, subject, platform, custom_prompt)

    // Add aspect ratio and quality
    const aspectRatio = platform === 'youtube' ? '16:9' : '9:16'
    const qualityMap: Record<string, string> = {
      '4K': 'Render at maximum 4K ultra-high resolution with extreme detail and sharpness.',
      '2K': 'Render at high 2K resolution with excellent detail.',
      '1K': 'Render at 1K resolution.',
    }
    const finalPrompt = `${basePrompt}\n\nOutput aspect ratio: ${aspectRatio}. ${qualityMap[quality] || qualityMap['2K']}`

    // Build Gemini API payload — multimodal if Baptiste reference needed
    const contentParts: any[] = []

    if (needsBaptiste) {
      const ref = await fetchBaptisteReference()
      if (ref) {
        // Send reference image FIRST, then the text prompt
        contentParts.push({
          inlineData: {
            mimeType: ref.mimeType,
            data: ref.base64,
          },
        })
        contentParts.push({
          text: `REFERENCE PHOTO: This is the exact person who MUST appear in the generated image. Reproduce this person's face, glasses, hair, and facial features with maximum fidelity. The generated person must be immediately recognizable as the same individual.\n\n${finalPrompt}`,
        })
        console.log('Sending multimodal request with Baptiste reference photo')
      } else {
        // Fallback: text-only with detailed description
        contentParts.push({ text: finalPrompt })
        console.log('Baptiste reference unavailable, using text-only prompt')
      }
    } else {
      contentParts.push({ text: finalPrompt })
    }

    const geminiPayload = {
      contents: [{ parts: contentParts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        responseMimeType: 'text/plain',
      },
    }

    console.log('Calling Gemini gemini-3.1-flash-image-preview')
    console.log('Template:', template_id, '| Baptiste:', needsBaptiste, '| Platform:', platform)

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

    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName)

    // Insert record
    const { error: insertError } = await supabase.from('thumbnail_generations').insert({
      template_id: template_id || 'custom',
      title: title || subject,
      prompt_used: basePrompt,
      platform,
      aspect_ratio: aspectRatio,
      image_url: publicUrl,
      image_path: fileName,
      format_tag: format_tag || null,
      quality,
      metadata: { model: 'gemini-3.1-flash-image-preview', baptiste_ref: needsBaptiste },
      video_idea_id: video_idea_id || null,
      calendar_item_id: calendar_item_id || null,
    })

    if (insertError) console.error('DB insert error:', insertError)

    return new Response(JSON.stringify({
      image_url: publicUrl,
      prompt_used: basePrompt,
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
