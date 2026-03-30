import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GEMINI_API_KEY}`

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

// ALL Baptiste reference photos — multi-angle for maximum face fidelity
const BAPTISTE_PHOTOS = [
  'https://dashboard-battells.netlify.app/baptiste/face-closeup.png',
  'https://dashboard-battells.netlify.app/baptiste/face-smile.png',
  'https://dashboard-battells.netlify.app/baptiste/profile.jpg',
]

// Master face instruction — sent with EVERY Baptiste template
const FACE_LOCK_INSTRUCTION = `CRITICAL FACE IDENTITY INSTRUCTIONS:
You are provided with multiple reference photos of the SAME person named Baptiste.
Study these photos carefully and memorize EVERY facial detail:
- Exact face shape, jawline contour, chin shape
- Exact eye shape, color (blue-grey), spacing, and eyelid crease
- Exact nose shape, bridge width, nostril shape
- Exact lip shape, thickness, cupid's bow
- Exact eyebrow shape, thickness, arch position
- Round gold/tortoiseshell metal frame glasses — ALWAYS present
- Dark curly/wavy brown hair, short sides, volume on top
- Light brown stubble beard, patchy on cheeks, fuller on chin
- Fair/light skin tone with slight warmth
- Slight undereye area

The generated image MUST show this EXACT person. Not someone similar — THIS person.
Every facial proportion, every feature must match the reference photos precisely.
The glasses are NON-NEGOTIABLE — same frame shape and color.
If you cannot reproduce the exact face, prioritize the glasses + hair + jawline combo
as the strongest identity markers.`

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
    prompt: `Ultra-photorealistic YouTube thumbnail photograph. Baptiste (the person from the reference photos — SAME face, SAME glasses, SAME hair) is making an extremely exaggerated shocked reaction: mouth wide open showing teeth, eyes bulging wide behind his gold-frame glasses, hands on his cheeks or raised in disbelief. He is looking at {subject} which is positioned prominently in the lower-right foreground, styled to look spectacular with steam and height. Shot with Canon R5 Mark II, 35mm f/1.4 lens wide open. Two-light setup: warm orange key light camera-left (#FF6B00) creating rim on his face, cool blue fill camera-right for cinematic contrast. Dynamic diagonal composition. Vibrant saturated colors. YouTube thumbnail composition optimized for 1280x720 readability. No text overlay.`,
  },

  'cartoon-recipe': {
    needsBaptiste: false,
    prompt: `Vibrant cartoon illustration of a magical cooking scene featuring {subject}. Pixar-meets-Studio-Ghibli art style with volumetric lighting and atmospheric depth. Ingredients floating in mid-air in a spiral pattern as if summoned by magic — each ingredient perfectly rendered with cel-shading and specular highlights. Animated kitchen utensils (wooden spoon stirring by itself, whisk spinning, measuring cups pouring). Warm orange-dominant palette (#FF6B00, #FFB800, #FFF3E0) with complementary teal accents. Magical golden sparkle particles and swirling steam trails creating visual flow. A bubbling pot at center as the focal point with volumetric light beams streaming from above. Cheerful, energetic, inviting atmosphere. Professional animation key-frame quality. No text.`,
  },

  'gustavo-scene': {
    needsBaptiste: true,
    prompt: `Cinematic portrait photograph. Baptiste (the person from the reference photos — reproduce his EXACT face, glasses, hair, and beard) is dressed as a sarcastic French chef: professional white chef's double-breasted jacket and a tall toque blanche. Arms crossed with a smug knowing smirk, one eyebrow slightly raised. Standing next to {subject} which is an elaborate culinary creation. Shot on Sony A1, 85mm GM f/1.4 at f/2.0, creamy background bokeh. Rembrandt lighting pattern: warm key light at 45 degrees creating the signature triangle of light on the shadowed cheek. Deep rich shadows. Warm orange-gold color palette. The chef jacket is crisp white providing a clean anchor. Ultra photorealistic, every skin pore and stubble hair visible. No text.`,
  },

  'blind-order': {
    needsBaptiste: true,
    prompt: `Cinematic suspense photograph. Baptiste (the person from the reference photos — EXACT same face, gold-frame glasses, curly brown hair, stubble beard) is wearing a black silk blindfold OVER his glasses, hands hovering uncertainly over two polished silver cloches on a dark mahogany table. One cloche is partially lifted, revealing a tantalizing glimpse of {subject} with steam escaping. Atmospheric fog at low level creating mystery. Lighting: strong blue-gelled backlight creating rim separation, warm amber key light from below (practical candles), floating translucent question mark shapes in the background with blur. Teal-and-orange cinematic color grade. Shot on ARRI Alexa Mini, Cooke S7/i 50mm anamorphic for characteristic oval bokeh and lens flare streaks. Suspenseful, mysterious atmosphere. No text.`,
  },

  'food-explosion': {
    needsBaptiste: false,
    prompt: `Ultra-high-speed freeze-frame food explosion photograph of {subject}. Every ingredient captured suspended in mid-air at the apex of an explosive deconstructed burst — lettuce leaves caught mid-curl, sauce droplets as perfect spheres with surface tension visible, seeds and crumbs frozen in space, cheese stretching in mid-pull. Shot with Phantom Flex4K high-speed camera equivalent at 10,000fps, Nikon 105mm f/2.8 macro. Three-light setup: powerful backlight creating translucent edge glow through leafy ingredients, fill from below creating dramatic upward shadows, subtle key light for detail. Pure black background. Each ingredient occupying its own depth plane creating a 3D layered effect. Sauce and oil droplets catching light like amber jewels. Maximum sharpness, maximum detail. No text.`,
  },

  'text-bold': {
    needsBaptiste: false,
    prompt: `Bold typographic poster design. The word "{title}" rendered in massive 3D hand-painted brushstroke letterforms, each letter with visible bristle texture and paint thickness variation. Orange-to-gold gradient paint (#FF6B00 transitioning to #FFB800) with metallic specular highlights suggesting wet paint. Letters arranged in a dynamic stacked composition with slight rotation for energy. Food elements ({subject}) artfully scattered between and around the letters — some overlapping in front, some tucked behind, creating depth layers. Dark charcoal background (#1A1A1A) with subtle bokeh particle effects (floating embers, dust motes catching light). Cinematic rim lighting on the 3D letter edges. Energetic, impactful, social media optimized vertical composition.`,
  },

  'comparison': {
    needsBaptiste: true,
    prompt: `Split-frame competitive comparison photograph. Baptiste (the person from the reference photos — EXACT same face, gold glasses, curly brown hair, stubble) stands in the exact center with an amazed jaw-dropped expression, acting as the human divider between two versions of {subject}. LEFT SIDE: rustic homemade version on a worn wooden board with checkered napkin, shot with flat lighting to look humble. RIGHT SIDE: extravagant restaurant version on fine dining black slate with gold leaf and microgreens, dramatic studio lighting. Large "VS" text in the center with realistic fire and ember particle effects. Each side lit differently to emphasize the contrast. Shot on Canon R5, 24-70 f/2.8 at 35mm. Ultra photorealistic. No other text.`,
  },

  'cinematic-plate': {
    needsBaptiste: false,
    prompt: `Cinematic bird's-eye-view photograph of {subject} on a handmade dark slate plate with raw stone edges. Professional food stylist plating: strategic negative space, asymmetric composition following golden ratio spiral, micro-herbs placed with tweezers, sauce painted with an offset spatula in a single confident swoosh. Moody atmospheric lighting: soft overhead key with intentional lens flare streak from a practical candle at frame edge, shallow depth of field (tilt-shift lens effect). Anamorphic horizontal lens flare. Subtle film grain texture (Kodak Portra 400 emulation). Warm color temperature with cool shadow tones. Editorial magazine quality. Dark rustic oak table surface with patina. No text, no hands, no utensils in motion.`,
  },

  'defi-24h': {
    needsBaptiste: true,
    prompt: `Dynamic YouTube thumbnail photograph. Baptiste (the person from the reference photos — reproduce his EXACT face with gold glasses, curly brown hair, stubble beard) looks exhausted but fiercely determined — sweat on forehead, sleeves rolled up, slightly disheveled hair, dark circles under eyes but with a fierce competitive glint. A massive stylized industrial clock face dominates the background, showing 24 hours with food items replacing each hour number. The clock hands are crossed utensils (fork and knife). "24H" displayed prominently in weathered metal industrial typography with warm orange LED glow (#FF6B00). Surrounded by {subject} and various foods. Dynamic low-angle hero shot looking up at Baptiste. Ultra photorealistic. No other text.`,
  },

  'street-food': {
    needsBaptiste: false,
    prompt: `Cinematic street photography of a French market food stall at golden hour. A vendor preparing {subject} — hands in motion with professional speed (natural motion blur at 1/30s shutter), steam and smoke rising through golden backlight creating volumetric god-rays. Shot on Leica M11 with Summilux 35mm f/1.4 wide open, dreamy shallow depth of field isolating the food preparation from the bustling market crowd. French hand-painted market signage visible but soft. Warm Kodachrome color palette with rich yellows and deep shadows. The {subject} is the sharp focal point. Cobblestone street, old stone buildings, copper pots. Golden hour rim light on steam. No text.`,
  },

  'ultra-photorealistic': {
    needsBaptiste: true,
    prompt: `Ultra-photorealistic YouTube thumbnail portrait. Baptiste (the person from the reference photos — reproduce his EXACT face: blue-grey eyes, gold-frame glasses, dark curly brown hair, light stubble beard, fair skin) is reacting dramatically to {subject}. Shot on Sony A7IV with Sony 85mm f/1.4 GM lens wide open. Three-point lighting: warm key light at 45 degrees (3200K, large octabox for soft wrap), cool fill at opposite 30 degrees (5600K, 1 stop under key), strong rim/hair light from behind-above creating separation. Skin texture fully resolved — every pore, stubble hair, and glasses reflection visible. Catchlights from octabox visible in both eyes. The {subject} is in foreground at f/1.4 bokeh distance, styled with steam wand, glycerin spray for moisture, blowtorch caramelization. Cinematic color grade: lifted blacks, warm highlights, teal shadows. 8K resolution. No text.`,
  },
}

// Fetch ALL Baptiste reference photos and convert to base64
async function fetchAllBaptistePhotos(): Promise<Array<{ base64: string; mimeType: string }>> {
  const photos: Array<{ base64: string; mimeType: string }> = []

  for (const url of BAPTISTE_PHOTOS) {
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const buffer = await res.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
      }
      const base64 = btoa(binary)
      const mimeType = res.headers.get('content-type') || 'image/png'
      photos.push({ base64, mimeType })
      console.log(`Loaded Baptiste ref: ${url} (${bytes.length} bytes)`)
    } catch (e) {
      console.log(`Failed to fetch ${url}: ${e}`)
    }
  }

  return photos
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
    const { prompt: basePrompt, needsBaptiste } = getPrompt(template_id, title, subject, platform, custom_prompt)

    const aspectRatio = platform === 'youtube' ? '16:9' : '9:16'
    const qualityMap: Record<string, string> = {
      '4K': 'Render at maximum 4K ultra-high resolution. Every texture, pore, and detail must be razor sharp.',
      '2K': 'Render at high 2K resolution with excellent detail.',
      '1K': 'Render at 1K resolution.',
    }
    const finalPrompt = `${basePrompt}\n\nOutput aspect ratio: ${aspectRatio}. ${qualityMap[quality] || qualityMap['2K']}`

    // Build multimodal content parts
    const contentParts: any[] = []

    if (needsBaptiste) {
      // Fetch ALL reference photos for maximum face fidelity
      const photos = await fetchAllBaptistePhotos()

      if (photos.length > 0) {
        // Send each photo as a separate image part
        for (let i = 0; i < photos.length; i++) {
          contentParts.push({
            inlineData: {
              mimeType: photos[i].mimeType,
              data: photos[i].base64,
            },
          })
        }

        // Then the master face instruction + prompt
        contentParts.push({
          text: `${FACE_LOCK_INSTRUCTION}\n\nThe ${photos.length} photos above show Baptiste from different angles. You MUST reproduce this EXACT person in the image below.\n\n${finalPrompt}`,
        })

        console.log(`Sending ${photos.length} Baptiste reference photos + prompt`)
      } else {
        contentParts.push({ text: finalPrompt })
        console.log('No Baptiste refs available, text-only')
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

    console.log('Calling gemini-3.1-flash-image-preview |', template_id, '| Baptiste:', needsBaptiste)

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', geminiRes.status, errText.slice(0, 500))
      return new Response(JSON.stringify({ error: `Gemini API error: ${geminiRes.status}`, details: errText.slice(0, 200) }), { status: 502, headers: CORS_HEADERS })
    }

    const data = await geminiRes.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData)

    if (!imagePart?.inlineData?.data) {
      const textPart = parts.find((p: any) => p.text)
      console.error('No image. Text:', textPart?.text?.slice(0, 300))
      return new Response(JSON.stringify({ error: 'No image generated', details: textPart?.text?.slice(0, 200) || 'Empty response' }), { status: 502, headers: CORS_HEADERS })
    }

    const base64Data = imagePart.inlineData.data
    const mimeType = imagePart.inlineData.mimeType || 'image/png'
    const ext = mimeType.includes('jpeg') ? 'jpeg' : 'png'

    const fileName = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
    const imageBuffer = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0))

    const { error: uploadError } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, imageBuffer, { contentType: mimeType, upsert: false })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return new Response(JSON.stringify({ error: 'Storage upload failed', details: uploadError.message }), { status: 500, headers: CORS_HEADERS })
    }

    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName)

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
      metadata: { model: 'gemini-3.1-flash-image-preview', baptiste_refs: needsBaptiste ? BAPTISTE_PHOTOS.length : 0 },
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
    console.error('Error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), { status: 500, headers: CORS_HEADERS })
  }
})
