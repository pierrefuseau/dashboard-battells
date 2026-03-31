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

// Compressed Baptiste reference photos for multi-angle character consistency
const BAPTISTE_PHOTO_URLS = [
  'https://dashboard-battells.netlify.app/baptiste/ref1.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref2.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref3.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref4.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref5.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref6.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref7.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref8.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref9.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref10.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref11.jpeg',
  'https://dashboard-battells.netlify.app/baptiste/ref12.jpeg'
]

// ═══════════════════════════════════════════════════════════════
// LAYER 1: FACE IDENTITY LOCK (for Baptiste templates)
// ═══════════════════════════════════════════════════════════════
const FACE_LOCK = `[IDENTITY LOCK — MANDATORY]
You are reproducing a SPECIFIC REAL PERSON from the reference photograph. Match with forensic accuracy:

BONE STRUCTURE: Oval face, slightly angular jawline, medium-width chin with subtle cleft
EYES: Blue-grey irises, hooded lids, asymmetric — left eye slightly narrower. Natural crow's feet when smiling
GLASSES: Gold/tortoiseshell acetate-metal hybrid frames, rectangular with rounded corners, thin bridge. ALWAYS PRESENT. Never remove or change frame style
HAIR: Dark chestnut brown, curly-wavy texture, medium length on top with natural volume, shorter on sides. Natural hairline with slight recession at temples
FACIAL HAIR: Light brown stubble, 3-day growth, patchy on cheeks, fuller along jawline and chin
SKIN: Fair with warm undertone, natural redness on cheeks and nose bridge. Visible pores on nose and cheek area
BUILD: Slim, French male, mid-20s
EARS: Medium, slightly protruding, visible when hair is pushed back

The generated person MUST be immediately recognizable as the reference photo subject. Any deviation = failure.`

// ═══════════════════════════════════════════════════════════════
// LAYER 2: ANTI-AI PHOTOREALISM ENGINE
// ═══════════════════════════════════════════════════════════════
const ANTI_AI = `[PHOTOREALISM ENGINE — MANDATORY]
This image must pass as an authentic photograph. Apply ALL:

SKIN: Subsurface scattering visible in backlit ears/nostrils/fingers. Visible pores at 100% crop. Microvasculature showing through thin skin areas. Uneven pigmentation, sun damage spots, natural moles. Sebaceous shine on T-zone. Fine vellus hair on cheeks and arms visible in rim light.

OPTICS: Shoot-specific depth of field with mathematically correct circle of confusion. Bokeh shapes matching the specified aperture blade count. Chromatic aberration (purple fringing) on high-contrast edges. Natural barrel/pincushion distortion for the stated focal length. Lens flare matching the stated lens coating.

LIGHTING: Physically accurate inverse-square falloff. Light wrapping around edges with a soft penumbra. Color temperature mixing (warm practicals + cool ambient). Caustics from glass/liquid elements. Shadow contact points with ambient occlusion.

GRAIN & TEXTURE: Photographic grain (not digital noise) with luminance and chroma channels. Grain structure varying by ISO: fine at 100, medium at 400, coarse at 1600+. Slight motion blur on non-frozen elements matching stated shutter speed. Fabric weave pattern, wood grain, stone texture at micro level.

FOOD SPECIFICS: Asymmetric browning patterns. Fat rendering with irregular bubble formations. Sauce viscosity with natural drip patterns and meniscus curves. Condensation droplets with refraction of background. Steam following convection physics — rising, cooling, dissipating.

ENVIRONMENT: Dust motes in light beams. Condensation on cold surfaces. Ambient reflections on glossy surfaces showing the actual scene (not generic highlights). Surface wear patterns (scratches, patina) telling a story of use.

ABSOLUTE PROHIBITIONS: No plastic-smooth skin. No perfect bilateral symmetry. No HDR halo glow. No oversaturated neon colors. No floating objects without shadow contact. No impossible reflections. No uniform lighting without a source. No artificially sharp edges everywhere.`

// ═══════════════════════════════════════════════════════════════
// LAYER 3: COMPOSITION & FORMAT RULES
// ═══════════════════════════════════════════════════════════════
const YOUTUBE_COMPOSITION = `[YOUTUBE THUMBNAIL COMPOSITION — 16:9]
This is a HIGH-VIRALITY YouTube thumbnail. Design for MAXIMUM click-through rate (CTR) viewed at small scales:

- VISUAL STYLE: Hyper-vibrant, extreme clarity, "MrBeast" aesthetic. High Dynamic Range (HDR) look with over-the-top contrast.
- LIGHTING: Explosive rim lighting on the subject (bright glow around the edges), separating them completely from the background.
- PRIMARY SUBJECT: Occupies 50-70% of frame area. Massive, in-your-face perspective (slight wide-angle or fisheye distortion for dynamic feel).
- BACKGROUND: Slightly blurred (bokeh) to make the subject pop, but the theme must remain completely recognizable and epic.
- COLOR PSYCHOLOGY: Maximum saturation. Vibrant jewel tones. Use complementary colors clashing to grab attention (e.g., Orange/Teal, Red/Cyan).
- EXPECTATION OVERRIDE: Do not make this look like a standard "professional food photo". It must look like a crazy, high-budget YouTube challenge thumbnail.
- SCALE: Exaggerated proportions. The food or object of interest must look incredibly huge, epic, or dangerous.`

const TIKTOK_COMPOSITION = `[TIKTOK COVER COMPOSITION — 9:16]
Vertical format for mobile-first consumption:

- SUBJECT: Center-dominant, occupying 50-70% of vertical frame
- SAFE ZONES: Keep key elements away from top 15% (status bar) and bottom 20% (UI overlay)
- VERTICAL FLOW: Eye travels top-to-bottom naturally. Stack visual elements vertically
- IMMEDIACY: The "what is this?" must be answered in 0.5 seconds
- HIGH SATURATION: TikTok's feed compresses images. Push saturation 15-20% higher than natural`

// ═══════════════════════════════════════════════════════════════
// LAYER 4: ABSOLUTE TEXT PROHIBITION
// ═══════════════════════════════════════════════════════════════
const NO_TEXT = `[ABSOLUTE TEXT PROHIBITION]
DO NOT generate ANY text, letters, numbers, words, labels, signs, watermarks, logos, symbols, captions, titles, subtitles, or typography of any kind anywhere in the image. The image must contain ZERO readable characters. If a clock is present, use only abstract markers — never numerals. If a sign or label would naturally appear in the scene, make it illegibly blurred or cropped out. ANY visible text = complete failure.`

// ═══════════════════════════════════════════════════════════════
// LAYER 5: QUALITY-TIERED CAMERA SIMULATION
// ═══════════════════════════════════════════════════════════════
function getCameraProfile(quality: string): string {
  switch (quality) {
    case '4K':
      return 'Phase One IQ4 150MP with Schneider Kreuznach 80mm LS f/2.8 Blue Ring. 16-bit color depth. Capture One color science. Tethered studio shooting.'
    case '2K':
      return 'Sony A7R V with Sony 90mm f/2.8 Macro G OSS. 14-bit RAW processed in Lightroom with ProNeg Hi film simulation.'
    default:
      return 'Canon EOS R6 Mark II with RF 50mm f/1.2L USM. 10-bit HEIF with Canon Log 3.'
  }
}

// ═══════════════════════════════════════════════════════════════
// LAYER 6: FORMAT-AWARE ENRICHMENT
// ═══════════════════════════════════════════════════════════════
function getFormatEnrichment(formatTag?: string): string {
  if (!formatTag) return ''
  const enrichments: Record<string, string> = {
    vlog: 'Candid, behind-the-scenes energy. Handheld feel with slight dutch angle. Natural available light mixing with practicals.',
    tuto: 'Clean, well-lit workspace. Ingredients/tools organized with intentional mise en place. Educational clarity — each element identifiable.',
    challenge: 'Extreme competitive tension. Bold contrasts. Adrenaline energy — intense focus, potential motion blur on secondary elements. "Life or death" stakes visual vibe.',
    reaction: 'Peak emotion captured at the decisive moment. Wide eyes, open mouth, genuine surprise. The food must be spectacular enough to justify the reaction.',
    story: 'Cinematic narrative composition. Moody atmospheric lighting. A sense of unfolding story — the viewer wants to know what happens next.',
    review: 'Honest, critical eye. The food is the star — shot objectively with clinical precision. Beauty dish lighting, no heavy stylization.',
    event: 'Epic scale, crowd energy, environmental context. Wide establishing shot with telephoto compression showing depth of venue.',
    collab: 'Two-person dynamic composition. Both subjects at equal visual weight. Connection between them visible through body language or shared gaze toward the food.',
  }
  return enrichments[formatTag] ? `\n[FORMAT CONTEXT: ${formatTag.toUpperCase()}]\n${enrichments[formatTag]}` : ''
}

// ═══════════════════════════════════════════════════════════════
// LAYER 7: EMOTION DIRECTIVE (Baptiste expression control)
// ═══════════════════════════════════════════════════════════════
function getEmotionDirective(emotion?: string): string {
  if (!emotion) return ''
  const emotions: Record<string, string> = {
    choque: '[EXPRESSION OVERRIDE] Baptiste\'s face shows EXPLOSIVE SHOCK: mouth wide open (jaw literally dropped), eyes popping behind glasses, eyebrows shooting up toward hairline, both hands raised to the face in disbelief. Body recoiling backward. Maximum YouTube thumbnail shock face.',
    emerveille: '[EXPRESSION OVERRIDE] Baptiste\'s face radiates EXTREME WONDER: eyes sparkling and wide, huge open-mouth smile, eyebrows lifted high. Leaning forward intensely with fascination. This is a "this is the most incredible thing I\'ve ever seen" moment.',
    affame: '[EXPRESSION OVERRIDE] Baptiste looks RAVENOUSLY HUNGRY: intense predatory stare at the food, lip bite or lips parted, leaning forward aggressively. Pure primal food desire.',
    degoute: '[EXPRESSION OVERRIDE] Baptiste shows EXTREME DISGUST: nose wrinkled deeply, upper lip curled, head pulled way back, one eye squinting. Hand up in a defensive "keep it away" gesture. Visceral repulsion.',
    excite: '[EXPRESSION OVERRIDE] Baptiste is BURSTING WITH HYPER EXCITEMENT: huge genuine grinning shouting face, eyes wide with joy, fist-pumping or arms spread wide. Explosive energy, leaning toward camera. Pure "LET\'S GOOO" MrBeast energy.',
    suspicieux: '[EXPRESSION OVERRIDE] Baptiste looks deeply SUSPICIOUS: one eyebrow raised dramatically, head tilted, eyes narrowed to slits scrutinizing the food. Arms crossed. Extreme skeptical energy.',
    impressionne: '[EXPRESSION OVERRIDE] Baptiste is GENUINELY IMPRESSED: slow nod expression, pursed lips of deep approval, one eyebrow raised. Thoughtful, appreciative gaze. This is quiet respect — "okay, this is actually incredible."',
  }
  return emotions[emotion] || ''
}

// ═══════════════════════════════════════════════════════════════
// LAYER 8: THEMATIC UNIVERSE ENRICHMENT
// Detects cultural/thematic references in title/subject and
// adds contextual scene elements automatically
// ═══════════════════════════════════════════════════════════════
function getThemeEnrichment(title: string, subject: string): string {
  const combined = `${title} ${subject}`.toLowerCase()
  const themes: Array<{ keywords: string[]; enrichment: string }> = [
    {
      keywords: ['asterix', 'obelix', 'astérix', 'obélix', 'gaulois', 'gaule'],
      enrichment: `[THEMATIC UNIVERSE: ASTÉRIX & OBÉLIX — ULTIMATE VIRAL TRIBUTE]
The ENTIRE scene must be an EXPLOSIVE, hyper-realistic tribute to the Gaulish universe:
- CHARACTER STYLING: Baptiste MUST have visual nods to the universe! Add a thick, drooping red or blonde Gaulish mustache to his face. Dress him in a blue-and-white vertically striped bottom garment (Obélix style) or a rustic fur-trimmed green vest. EXTREME YouTube makeover!
- FOOD: A comically GIGANTIC, perfectly roasted wild boar on a wooden spit, dripping with juice and fire flames licking it. Size must be exaggerated 3X normal size. Mountains of feasting food.
- SETTING: Epic Ancient Gaulish village background — massive stone menhirs towering like skyscrapers, thatched round huts, deep green mystical forest. Optional: A glowing green magical potion cauldron bubbling in the background.
- ATMOSPHERE: High-adrenaline comic-book energy brought into 3D hyper-reality. Epic ancient feast with "I SURVIVED 24H IN GAUL" vibe.
- COLOR PALETTE: Hyper-vibrant primary colors — bright sky blue, intense red, emerald green, and neon magical green glow.`,
    },
    {
      keywords: ['medieval', 'moyen age', 'moyen-age', 'chevalier', 'chateau', 'château'],
      enrichment: `[THEMATIC UNIVERSE: MEDIEVAL]
Immerse the scene in medieval atmosphere:
- SETTING: Castle great hall or medieval kitchen — stone walls, iron chandeliers with candles, heraldic tapestries
- PROPS: Pewter goblets, wooden trencher plates, iron cooking implements, roaring fireplace
- LIGHTING: Warm candlelight and fireplace glow. Dramatic shadows on stone walls
- CLOTHING (if person present): Subtle medieval touches — leather vest, linen shirt`,
    },
    {
      keywords: ['japon', 'japonais', 'sushi', 'ramen', 'tokyo', 'izakaya', 'manga', 'anime'],
      enrichment: `[THEMATIC UNIVERSE: JAPANESE]
Immerse the scene in Japanese food culture:
- SETTING: Intimate izakaya, ramen bar counter, or elegant kaiseki room — wood, paper screens, warm lantern light
- PROPS: Ceramic bowls with kintsugi repairs, bamboo chopsticks, sake carafe, noren curtains
- LIGHTING: Warm paper lantern glow, steam rising dramatically. Moody atmospheric
- ATMOSPHERE: The focused intimacy of Japanese dining`,
    },
    {
      keywords: ['italie', 'italien', 'pizza', 'pasta', 'naple', 'napoli', 'rome', 'toscane'],
      enrichment: `[THEMATIC UNIVERSE: ITALIAN]
Immerse the scene in Italian cuisine atmosphere:
- SETTING: Rustic trattoria, wood-fired pizza oven, Tuscan countryside kitchen — terracotta floors, olive wood tables
- PROPS: San Marzano tomato cans, fresh basil bunches, Parmigiano wheel, copper pots, wine bottles
- LIGHTING: Warm Mediterranean sunlight streaming through shuttered windows, golden hour warmth
- ATMOSPHERE: La dolce vita — casual elegance, family warmth, generosity`,
    },
    {
      keywords: ['mexic', 'taco', 'burrito', 'enchilada', 'guacamole', 'aztec'],
      enrichment: `[THEMATIC UNIVERSE: MEXICAN]
Immerse the scene in Mexican food culture:
- SETTING: Colorful mercado, street taqueria, or hacienda kitchen — painted tiles (talavera), vibrant walls
- PROPS: Molcajete (stone mortar), clay plates, lime wedges, chile peppers, tortilla press, fresh cilantro bunches
- LIGHTING: Warm overhead with saturated colors popping. Sunset warmth or colorful market lighting
- COLOR PALETTE: Vibrant reds, greens, oranges, yellows — the full Mexican color spectrum`,
    },
    {
      keywords: ['luxe', 'gastronomie', 'etoile', 'étoilé', 'michelin', 'palace', 'grand chef'],
      enrichment: `[THEMATIC UNIVERSE: HAUTE GASTRONOMIE]
Elevate to Michelin-star luxury:
- SETTING: Minimalist fine dining room — immaculate white tablecloths, crystal glassware, silver service
- PLATING: Architectural precision, tweezered micro-herbs, sauce art, negative space as design element
- LIGHTING: Soft overhead with focused accent on plate. Candlelight ambiance in background
- ATMOSPHERE: Hushed reverence. Every detail is intentional. Pure elegance`,
    },
    {
      keywords: ['usa', 'americain', 'burger', 'bbq', 'texas', 'new york', 'diner', 'fast food', 'fast-food'],
      enrichment: `[THEMATIC UNIVERSE: AMERICAN]
Immerse in American food culture:
- SETTING: Classic diner, BBQ smokehouse, or NYC street scene — neon signs (blurred, unreadable), checkered tiles, chrome surfaces
- PROPS: Red baskets with wax paper, squeeze bottles, milkshake glasses, napkin dispensers
- LIGHTING: Warm neon glow, overhead diner fluorescents mixed with warm practicals
- ENERGY: Bold, generous, unapologetic abundance. Bigger is better`,
    },
  ]

  const matches = themes.filter(t => t.keywords.some(k => combined.includes(k)))
  return matches.map(m => m.enrichment).join('\n\n')
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE DEFINITIONS — CINEMATOGRAPHIC PRECISION
// ═══════════════════════════════════════════════════════════════
const TEMPLATES: Record<string, { prompt: string; needsBaptiste: boolean }> = {

  'food-closeup': {
    needsBaptiste: false,
    prompt: `[SCENE: EDITORIAL FOOD MACRO]
Extreme close-up food photograph of {subject} filling 80% of the frame.

LIGHTING: Single Profoto B10 with 2-foot octabox at 45-degree angle from upper-left, creating dramatic Caravaggio-style chiaroscuro. Fill card (white foam core) at camera right returning 0.5 stops. No backlight — just dark fall-off into pure black background.

STYLING: {subject} at peak visual moment — cross-section revealing interior layers. Sauce pooling with visible viscosity and surface tension. Micro-herbs (chervil, micro basil) placed with tweezers for scale. Glistening oil droplets catching the key light. Steam rising through the backlight zone, illuminated as a translucent veil.

CAMERA: Phase One IQ4 150MP, Schneider 120mm f/4 Macro, focus-stacked (12 frames), tripod-mounted. Aperture f/5.6 for stacking. Focus plane on the most textured area — crust, cross-section, or caramelization.

MOOD: Dark, moody, seductive. Like a Michelin-starred dish photographed for Bon Appétit's cover. Warm color temperature (3200K tungsten) with cool shadow tones creating teal-orange contrast.

COMPOSITION: Ultra-tight crop. The edge of the plate or surface barely visible. Background is pure darkness — no distracting elements. The food IS the entire frame.`,
  },

  'split-before-after': {
    needsBaptiste: false,
    prompt: `[SCENE: TRANSFORMATION SPLIT]
Perfectly divided dual image — clean vertical split at exact center of 16:9 frame.

LEFT HALF — "BEFORE" (chaotic):
Raw {subject} ingredients scattered on dark granite countertop in deliberate chaos. Cracked eggshells, flour dust cloud frozen mid-air, spilled liquids, scattered herbs. Overhead flat-lay angle. Harsh on-camera flash creating unflattering direct light with hard shadows. Cluttered, messy, appetizing in its raw potential. Desaturated color grading — muted, clinical.

RIGHT HALF — "AFTER" (beautiful):
The finished {subject} impeccably plated on a matte black handmade ceramic plate. Professional garnish: micro-greens at 2 o'clock position, sauce swoosh at 6 o'clock. Shot at 45-degree angle with shallow DOF (f/1.8). Soft diffused strobe through silk, warm 3400K color temp. Hero lighting at 45 degrees creating appetizing shadows. Rich, saturated warmth. Steam and aromatic haze.

DIVIDING LINE: Razor-sharp vertical divide. The contrast between the two halves must be DRAMATIC — it should look like chaos vs perfection, amateur vs master.`,
  },

  'challenge-reaction': {
    needsBaptiste: true,
    prompt: `[SCENE: REACTION THUMBNAIL — PEAK EMOTION]
YouTube thumbnail photograph capturing a frozen moment of genuine shock.

BAPTISTE: Standing/leaning into frame from left third, body angled 30 degrees toward camera. REACTION: Mouth wide open (genuine amazement, not comedy), eyes widened behind glasses, eyebrows raised high, one hand reaching toward the food, the other gripping the edge of frame. Body language radiating "I can't believe this exists." Wearing simple dark t-shirt (charcoal or black).

FOOD: {subject} positioned in the right third of frame, slightly lower than Baptiste's eyeline, creating a natural gaze path for the viewer. Styled to look absolutely spectacular — professional presentation with steam, glistening surfaces, perfect plating. The food must justify the reaction.

LIGHTING: Two-light setup. Warm key light (3200K, large softbox 45deg camera-left) sculpting Baptiste's face with Rembrandt triangle. Cool fill (5600K, 2 stops under) camera-right for separation. Strong orange-gelled rim light from behind creating edge definition. Background falls to near-black.

CAMERA: Canon R5 Mark II, 35mm f/1.4L at f/2.0. Distance: 4 feet. Slight upward angle (5 degrees) for heroic feel. Fast shutter (1/500) freezing Baptiste's expression and hand motion.

COMPOSITION: Dynamic diagonal from Baptiste's eyes → food → lower right corner. Negative space in upper right for contrast. The viewer's eye path: Baptiste's face → his gaze direction → the food.`,
  },

  'cartoon-recipe': {
    needsBaptiste: false,
    prompt: `[SCENE: MAGICAL COOKING ILLUSTRATION]
Vibrant cartoon illustration in Pixar-meets-Studio-Ghibli style of a magical cooking scene.

CENTER: A bubbling copper cauldron or professional kitchen pot with {subject} being assembled by invisible magic — ingredients floating in a mesmerizing spiral vortex above it, each ingredient at a different height and rotation angle. Volumetric golden light rays beaming upward from the pot.

INGREDIENTS: Each component of {subject} individually rendered with cel-shading and specular highlights — identifiable and appetizing even in cartoon style. Herbs spinning slowly, liquids in graceful arcs, proteins tumbling in slow-motion.

ENVIRONMENT: Warm French kitchen backdrop (copper pans, stone walls, wooden beams) rendered in soft Ghibli watercolor style, out of focus. Magical sparkle particles (warm golden, not cold white) floating throughout. Steam trails with personality — curling into playful shapes.

COLOR PALETTE: Dominant warm orange (#FF6B00, #FFB800) with teal accents (#0891B2) for complementary contrast. Rich saturated colors throughout. Golden hour warmth permeating the scene.

STYLE: Smooth 3D render quality with hand-painted texture overlay. Cheerful, appetizing, magical. Makes cooking look like an enchanting adventure. Studio-quality character-free scene — the food and magic are the characters.`,
  },

  'gustavo-scene': {
    needsBaptiste: true,
    prompt: `[SCENE: THE SARCASTIC CHEF PORTRAIT]
Cinematic three-quarter portrait of Baptiste as a smug, confident chef.

BAPTISTE: Wearing crisp white double-breasted chef's jacket (impeccable — no stains, brass buttons gleaming). Tall toque blanche atop his curly hair. EXPRESSION: One eyebrow raised, knowing smirk — the "I told you so" face. Arms crossed confidently. Head tilted 5 degrees. Eyes looking directly at camera with sarcastic amusement. His expression says: "You didn't think I could make this? Watch and learn."

FOOD: {subject} positioned on the counter beside him at waist height, on a dark slate plate, professionally styled and looking extraordinary. Subtle steam rising. The food is his evidence — proof of mastery.

LIGHTING: Classic Rembrandt portrait lighting. Large octabox key at 45 degrees camera-left creating the signature triangle of light on the shadow-side cheek. Subtle fill from a white v-flat camera-right at 2 stops under. Warm amber kicker from behind-right separating him from the background. Background: dark kitchen with copper pots and hanging utensils in deep bokeh.

CAMERA: Sony A1, 85mm GM at f/2.0. Creamy circular bokeh (11-blade aperture). Shot at eye level. Warm color grade — blacks lifted slightly, highlights tinged golden. Skin rendered with full detail: pores, stubble catching light, glasses reflecting the softbox.

MOOD: Confident, slightly arrogant, masterful. The energy of a chef who knows they've created something exceptional.`,
  },

  'blind-order': {
    needsBaptiste: true,
    prompt: `[SCENE: MYSTERY REVEAL — CINEMATIC SUSPENSE]
A moment of cinematic tension as a hidden dish is about to be revealed.

BAPTISTE: Seated at a dark mahogany dining table, wearing an elegant black satin blindfold OVER his glasses (glasses still visible beneath). Both hands hovering above the table, palms down, fingers spread with anticipation. Expression: lips slightly parted, head tilted as if listening/smelling. Wearing a simple dark crew-neck.

THE REVEAL: Two polished silver cloches on the table. The right cloche is being lifted (by an unseen hand entering from frame right), partially revealing {subject} beneath. Steam and aromatic haze billowing from under the lifting cloche, backlit to glow gold. The {subject} is styled impeccably — the first glimpse should make the viewer's mouth water.

LIGHTING: Atmospheric and moody. Warm amber key from below (practical candles on table) illuminating Baptiste's face from chin up — creating dramatic under-lighting. Blue-gelled hair light from behind for cinematic teal-orange contrast. Background: deep shadows with faint warm bokeh spots (distant candles, wall sconces). Volumetric low fog at table level.

CAMERA: ARRI Alexa Mini LF, Cooke Anamorphic 50mm T2.3. Characteristic oval bokeh, horizontal lens flare catching the candlelight. Teal-orange cinematic color grade. Slight film grain (200T equivalent). Wide composition — environmental portrait showing the full table scene.

MOOD: Luxurious mystery. Michelin-star dining ambiance. The moment before revelation — maximum anticipation.`,
  },

  'food-explosion': {
    needsBaptiste: false,
    prompt: `[SCENE: HIGH-SPEED FOOD DECONSTRUCTED]
Ultra-high-speed freeze-frame photograph capturing {subject} exploding apart in mid-air.

COMPOSITION: Every ingredient of {subject} suspended at different heights and distances from center, frozen at the peak moment of expansion. Center of frame: the assembled core. Radiating outward: individual components caught mid-flight. Sauce droplets frozen as perfect spheres with internal refraction. Cheese stretching with visible protein strands. Lettuce leaves mid-curl with water droplets on surface. Bread/pastry fragments with interior crumb structure visible on fracture surfaces.

LIGHTING: Triple-strobe setup on pure black background (#000000).
— Strong backlight (bare strobe, 1 stop over key): Creates translucent edges on leaves, sauce droplets as glowing amber jewels, steam frozen as crystalline structures
— Under-fill (strip softbox from below): Lifts shadow detail, makes bottom elements readable
— Key (gridded beauty dish, 45deg upper-left): Main modeling light creating depth and dimension

PHYSICS: Ingredients at multiple depth planes (foreground sharp, mid-ground sharp, background soft). Droplets showing different sizes based on distance from center. Oil splatter patterns following realistic fluid dynamics. Some elements showing motion blur at their trailing edges while leading edges are tack-sharp.

CAMERA: Phantom Flex4K equivalent at 10,000fps, Nikon 105mm f/2.8 VR Micro. Focus: center out to 8 inches. Background: mathematically pure black void.

ENERGY: Explosive but beautiful. Controlled chaos. Every flying element is appetizing.`,
  },

  'text-bold': {
    needsBaptiste: false,
    prompt: `[SCENE: TYPOGRAPHIC FOOD POSTER — VERTICAL]
Bold 3D typographic design for vertical (9:16) social format.

TYPOGRAPHY: The phrase "{title}" rendered as massive 3D extruded brushstroke letters. Each letter has visible bristle texture from a thick calligraphy brush. Orange-to-gold gradient (#FF6B00 to #FFB800) with metallic specular highlights catching a virtual key light from upper-left. Letters are stacked dynamically with slight rotation (2-5 degrees alternating) and varying scale, creating energetic visual rhythm. Drop shadows grounding letters in 3D space.

FOOD INTEGRATION: {subject} elements artfully scattered between and overlapping the letters — some in front, some behind — creating depth and integration. Each food element is photograph-quality while the letters are stylized. Steam, sauce drips, and crumbs create visual bridges between food and typography.

BACKGROUND: Deep charcoal (#1A1A1A) to pure black gradient. Bokeh particle effects (warm embers, golden dust motes) floating throughout. Subtle radial light gradient behind the main letters creating focus.

ENERGY: Impactful, bold, immediate. The typography should hit like a shout. Social media scroll-stopping energy. The food elements add context and appetizing appeal without cluttering the message.`,
  },

  'comparison': {
    needsBaptiste: true,
    prompt: `[SCENE: ULTIMATE VS COMPARISON]
Split comparison photograph with Baptiste as the dramatic divide.

BAPTISTE: Center of frame, facing camera with jaw-dropped amazement. Looking slightly down at both dishes (one in each hand or flanking him on surfaces). Genuine "I can't believe the difference" expression. Eyes wide, mouth open, slight lean back. Wearing casual dark clothing.

LEFT THIRD — HOMEMADE VERSION:
Rustic version of {subject} on a worn wooden cutting board with a checkered cloth napkin. Charming but humble: visible imperfections, homestyle plating, warm incandescent kitchen lighting (single overhead bulb, 2700K). Shot feels like your grandmother's kitchen. Appetizing in its honesty.

RIGHT THIRD — RESTAURANT VERSION:
Extravagant haute-cuisine version of {subject} on a jet-black slate plate with gold leaf accents and precision sauce work. Dramatic professional photography lighting: large softbox above, accent lights creating sparkle on garnishes. Shot feels like a 3-Michelin-star restaurant. Aspirational, elevated, spectacular.

VISUAL BRIDGE: The contrast between left and right should be startling. Different color temperatures (warm left, cool-white right), different plating philosophies, different levels of refinement. Baptiste's reaction at center sells the gap between them.

CAMERA: Canon R5, 24-70mm f/2.8L at 35mm, f/4 for both sides in focus. Shot at chest height. Wide enough to show both plates and Baptiste's full upper body reaction.

NOTES: Subtle ember and particle effects at the division point. Warm orange-gold overall grade. NO text, NO "VS" graphic — the comparison speaks through the visual contrast alone.`,
  },

  'cinematic-plate': {
    needsBaptiste: false,
    prompt: `[SCENE: EDITORIAL BIRD'S EYE — MAGAZINE COVER QUALITY]
Cinematic perfect overhead shot for food editorial.

PLATING: {subject} centered on a dark hand-thrown ceramic plate with raw stone edges and subtle kiln glazing. Plate on a dark oak table with visible grain, knots, and patina of age. Professional styling following golden ratio spiral: protein at phi point, garnish arcing along the spiral, sauce in a dynamic swoosh at counterpoint.

NEGATIVE SPACE: 40% of the plate is intentional empty space with faint sauce kiss marks or herb oil drops — the emptiness is as important as the food. Surrounding table visible at frame edges with strategic props: linen napkin corner, vintage fork, sea salt in a dark ceramic pinch bowl.

LIGHTING: Large overhead softbox as key (slightly off-center creating gentle directional shadow). Single candle at frame edge creating a warm lens flare. Soft tilt-shift depth effect — center pin-sharp, edges gently soft. Atmospheric haze adding a film-like quality.

POST-PROCESSING: Kodak Portra 400 color science: warm highlights, cool shadows, lifted blacks, gentle desaturation in midtones. Subtle horizontal anamorphic lens flare. Fine film grain overlay (not digital noise). Color palette: warm earth tones, muted greens from herbs, deep amber from the food.

MOOD: Contemplative luxury. Like the opening frame of a Netflix food documentary. Makes the viewer pause and study every detail.`,
  },

  'defi-24h': {
    needsBaptiste: true,
    prompt: `[SCENE: THE 24-HOUR CHALLENGE — ENDURANCE PORTRAIT]
A cinematic hero shot capturing the exhaustion and determination of a marathon cooking challenge.

BAPTISTE: Low-angle hero shot (camera at waist height, shooting upward 15 degrees). Standing in a professional kitchen after hours of cooking. EXHAUSTION SIGNS: Sleeves rolled to elbows, forearms showing flour dust and minor sauce stains. Forehead glistening with perspiration droplets catching rim light. Hair slightly disheveled (curls looser, some sticking). Dark circles beginning under eyes BUT fierce determined glint — this is someone who won't quit. Chef apron over dark t-shirt, apron showing battle scars of cooking.

ENVIRONMENT: Behind him, a busy kitchen scene in deep bokeh: stainless steel prep tables with mise en place, hanging copper pots catching warm light, the warm glow of commercial ovens. On the counter beside him: the magnificent finished {subject} — his masterpiece after 24 hours — styled perfectly, steaming, looking spectacular. The contrast between his exhaustion and the food's perfection tells the story.

BACKGROUND ELEMENT: A large vintage industrial clock on the wall behind him (blurred), with its hands suggesting the passage of time. The clock face is weathered, analog, atmospheric — purely visual, no readable numbers, just abstract markers and aged patina. Warm orange-amber light emanating from its vicinity (practical lamp).

LIGHTING: Warm key light from camera-left (large softbox, 3200K) creating dramatic shadows. Cooler fill from the kitchen fluorescents behind (5000K) creating teal-orange contrast. Strong rim light from upper-right separating Baptiste from the background. Volumetric steam/kitchen haze catching light beams.

CAMERA: Sony A7R V, 35mm f/1.4 GM at f/2.0. Shallow DOF keeping Baptiste sharp, background beautifully blurred. Low perspective makes him look heroic and monumental.

MOOD: Triumphant exhaustion. The "I did it" moment. Rocky Balboa in a kitchen. The food is the trophy.`,
  },

  'street-food': {
    needsBaptiste: false,
    prompt: `[SCENE: GOLDEN HOUR STREET FOOD — DOCUMENTARY]
Cinematic street photography at a French market or food truck during magic hour.

ACTION: A vendor's hands in motion preparing {subject} — captured at 1/30 second for intentional motion blur on the hands while the food remains sharp. Flames or heat haze from the grill/plancha adding dynamic energy. Onlookers blurred in background (medium telephoto compression). The food at the moment of action: being flipped, sliced, assembled, or handed over.

ENVIRONMENT: Authentic French market atmosphere. Cobblestone ground (shallow DOF, foreground texture). Stone building facades and market stall fabric in deep background blur. Other stalls' warm lights creating bokeh orbs (oranges, golds, warm whites). Handwritten chalk menus and vintage market signage (all illegibly blurred, out of focus — no readable text).

LIGHTING: Natural golden hour — sun at 10-15 degrees above horizon, creating long warm light rays. Backlight through steam = volumetric god rays. Warm Kodachrome color palette: saturated oranges and reds, warm shadows, lifted blacks. Fill from reflected light off stone walls.

THE HERO: {subject} at center of frame, sharp and detailed, catching golden light on its surfaces. Steam and aroma visualized through haze. Crispy textures catching specular highlights. Sauce with visible viscosity.

CAMERA: Leica M11-P, Summilux 35mm f/1.4 wide open. Hyperfocal feel: subject sharp, everything else dreamily soft. Warm Kodachrome processing. Slight vignetting from the fast lens.

MOOD: Wanderlust. The romance of French food culture. Makes the viewer smell the scene.`,
  },

  'ultra-photorealistic': {
    needsBaptiste: true,
    prompt: `[SCENE: STUDIO-GRADE YOUTUBE THUMBNAIL — MAXIMUM REALISM]
The definitive YouTube thumbnail combining perfect portrait photography with food styling.

BAPTISTE: Three-quarter portrait, body angled 30 degrees camera-left, face turned toward camera. Upper body and head filling left 55% of frame. EXPRESSION: Choose the most engaging for {subject} context — could be anticipation (lip bite, raised eyebrows, eyes locked on food), amazement (slight smile, eyes wide), or confident approval (knowing smirk, single raised eyebrow). Expression must feel GENUINE, not performed. Wearing a simple premium cotton crew-neck tee (charcoal or navy).

THE FOOD: {subject} positioned in the right portion of frame, slightly below Baptiste's eyeline. Styled by an invisible professional food stylist: steam rising (glycerin method for persistent steam), glistening surfaces catching lights, sauce at perfect viscosity, garnish placed with tweezers. Temperature-appropriate visual cues: hot food steaming, cold food with condensation.

LIGHTING: Professional 3-light portrait + food setup:
— Key: Large 4-foot octabox at 45 degrees camera-left, 3200K (warm). Creates main modeling on face with Rembrandt triangle
— Fill: V-flat bounce camera-right, 2 stops under key (1:4 ratio). Enough to see detail in shadows, not enough to flatten
— Rim/Hair: Strip softbox from behind-upper-right, gelled warm amber. Creates edge separation, makes hair glow, catches steam
— Food accent: Small snoot/gridspot highlighting {subject} with concentrated beam

CAMERA: Sony A7IV, 85mm f/1.4 GM wide open. Tethered shooting, Capture One processing. Focus: Baptiste's camera-side eye (point focus, not zone). Food at f/1.4 bokeh = creamy but identifiable. Background: dark grey seamless paper with subtle warm gradient.

SKIN RENDERING: Full resolution. Visible pores on nose and cheeks. Stubble individual hairs catching rim light. Glasses reflecting the octabox shape in both lenses. Catchlights in both eyes (octabox shape). Natural skin imperfections visible — slight redness on cheek, pores, fine lines when expressing.

COLOR GRADE: Cinematic with warmth. Lifted blacks (never true black). Warm highlights (push toward amber). Cool shadow tones (subtle teal). Overall warm — makes food and skin look appetizing. Light film grain texture (100-200 ISO equivalent).

COMPOSITION: Baptiste's eyes at upper-left power point (rule of thirds). Food at lower-right power point. Diagonal flow from eyes → gaze → food. Generous negative space in upper-right for visual breathing room.`,
  },
}

// ═══════════════════════════════════════════════════════════════
// PROMPT ASSEMBLY ENGINE
// ═══════════════════════════════════════════════════════════════
// Helper to efficiently encode large ArrayBuffers without out-of-memory errors
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 8192) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 8192)));
  }
  return btoa(binary);
}

async function fetchBaptistePhotos(): Promise<Array<{ base64: string; mimeType: string }>> {
  const photos = []
  // Process sequentially to limit peak memory usage since edge functions have low RAM
  for (const url of BAPTISTE_PHOTO_URLS) {
    try {
      const res = await fetch(url)
      if (!res.ok) { console.error('Failed to fetch photo:', url, res.status); continue }
      const buffer = await res.arrayBuffer()
      
      photos.push({
        base64: arrayBufferToBase64(buffer),
        mimeType: res.headers.get('content-type') || 'image/jpeg',
      })
      console.log(`Baptiste ref loaded: ${buffer.byteLength} bytes from ${url}`)
    } catch (err) {
      console.error('Error fetching photo:', url, err)
    }
  }
  return photos
}

function assemblePrompt(
  templateId: string | undefined,
  title: string,
  subject: string,
  platform: string,
  quality: string,
  formatTag?: string,
  customPrompt?: string,
  emotion?: string,
): { prompt: string; needsBaptiste: boolean } {
  // Custom prompt bypass — still add anti-AI and no-text
  if (customPrompt) {
    return {
      prompt: `${customPrompt}\n\n${NO_TEXT}\n\n${ANTI_AI}`,
      needsBaptiste: false,
    }
  }

  const template = templateId ? TEMPLATES[templateId] : undefined
  if (!template) {
    return {
      prompt: `Professional food photograph of ${subject}. Dramatic editorial lighting, cinematic composition. ${platform === 'youtube' ? '16:9 landscape' : '9:16 portrait'} format.\n\n${NO_TEXT}\n\n${ANTI_AI}`,
      needsBaptiste: false,
    }
  }

  // Replace variables in template prompt
  let scenePrompt = template.prompt
    .replace(/\{title\}/g, title || 'BATTELLS')
    .replace(/\{subject\}/g, subject)

  // Detect theme and emotion BEFORE assembling
  const themeEnrichment = getThemeEnrichment(title, subject)
  const emotionDirective = template.needsBaptiste ? getEmotionDirective(emotion) : ''

  // ── CRITICAL: When theme is detected, STRIP conflicting environment lines from template ──
  if (themeEnrichment) {
    // Remove ENVIRONMENT/SETTING/BACKGROUND lines from the scene template
    // so the theme's setting takes priority without conflict
    scenePrompt = scenePrompt
      .split('\n')
      .filter(line => {
        const l = line.trim().toUpperCase()
        // Remove lines that describe setting/environment that would conflict with theme
        if (l.startsWith('ENVIRONMENT:')) return false
        if (l.startsWith('BACKGROUND ELEMENT:')) return false
        if (l.startsWith('BACKGROUND:')) return false
        // Keep lines describing the environment contents (bokeh, etc) only if they don't specify a location
        if (l.includes('PROFESSIONAL KITCHEN') || l.includes('STAINLESS STEEL') || l.includes('COMMERCIAL OVEN')) return false
        if (l.includes('DARK GREY SEAMLESS PAPER') || l.includes('DARK KITCHEN WITH COPPER')) return false
        return true
      })
      .join('\n')
    console.log('Theme detected — stripped conflicting environment lines from scene template')
  }

  // ── CRITICAL: When emotion is set, STRIP conflicting expression lines from template ──
  if (emotionDirective) {
    scenePrompt = scenePrompt
      .split('\n')
      .filter(line => {
        const l = line.trim().toUpperCase()
        // Remove lines that prescribe a specific expression/emotion
        if (l.startsWith('EXPRESSION:')) return false
        if (l.startsWith('REACTION:')) return false
        if (l.includes('EXHAUSTION SIGNS:')) return false
        if (l.includes('FIERCE DETERMINED GLINT')) return false
        if (l.includes('LOOKING EXHAUSTED BUT DETERMINED')) return false
        if (l.includes('JAW-DROPPED')) return false
        if (l.includes('GENUINE SHOCK')) return false
        if (l.includes('SMUG, CONFIDENT')) return false
        return true
      })
      .join('\n')
    console.log(`Emotion override "${emotion}" — stripped conflicting expression lines from scene template`)
  }

  // Assemble ALL layers — theme and emotion FIRST (highest priority for Gemini)
  const compositionLayer = platform === 'youtube' ? YOUTUBE_COMPOSITION : TIKTOK_COMPOSITION
  const cameraProfile = getCameraProfile(quality)
  const formatContext = getFormatEnrichment(formatTag)

  const assembledPrompt = [
    // Priority layers FIRST — Gemini weighs early instructions more heavily
    themeEnrichment ? `[CRITICAL — HIGHEST PRIORITY DIRECTIVE]\n${themeEnrichment}\nThe above thematic universe MUST define the visual setting, props, atmosphere, and color palette. Any conflicting environment descriptions below are VOID.` : '',
    emotionDirective ? `[CRITICAL — EXPRESSION OVERRIDE]\n${emotionDirective}\nThe above expression MUST be used for Baptiste. Any conflicting facial expression descriptions below are VOID.` : '',
    // Scene template (with conflicting lines already stripped)
    scenePrompt,
    formatContext,
    compositionLayer,
    `\n[CAMERA HARDWARE]\n${cameraProfile}`,
    NO_TEXT,
    ANTI_AI,
  ].filter(Boolean).join('\n\n')

  const layerNames = ['scene']
  if (emotionDirective) layerNames.unshift(`emotion(${emotion})`)
  if (themeEnrichment) layerNames.unshift('THEME-OVERRIDE')
  layerNames.push('composition', 'camera', 'no_text', 'anti_ai')
  if (formatContext) layerNames.push('format')
  console.log(`Prompt layers: ${layerNames.join(' → ')} | Total: ${assembledPrompt.length} chars`)

  return { prompt: assembledPrompt, needsBaptiste: template.needsBaptiste }
}

// ═══════════════════════════════════════════════════════════════
// EDGE FUNCTION HANDLER
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS })

  try {
    const body = await req.json()
    const {
      template_id,
      title = '',
      subject,
      platform = 'youtube',
      custom_prompt,
      format_tag,
      emotion,
      quality = '2K',
      video_idea_id,
      calendar_item_id,
    } = body

    if (!subject) {
      return new Response(
        JSON.stringify({ error: 'subject is required' }),
        { status: 400, headers: CORS_HEADERS },
      )
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Assemble the multi-layered prompt
    const { prompt: assembledPrompt, needsBaptiste } = assemblePrompt(
      template_id, title, subject, platform, quality, format_tag, custom_prompt, emotion,
    )

    // Build multimodal content parts
    const contentParts: any[] = []

    if (needsBaptiste) {
      const photos = await fetchBaptistePhotos()
      if (photos.length > 0) {
        for (const photo of photos) {
          contentParts.push({ inlineData: { mimeType: photo.mimeType, data: photo.base64 } })
        }
        contentParts.push({ text: `${FACE_LOCK}\n\n${assembledPrompt}` })
        console.log(`Multimodal: ${photos.length} Baptiste refs + layered prompt`)
      } else {
        contentParts.push({ text: assembledPrompt })
        console.log('Fallback: text-only (no Baptiste refs available)')
      }
    } else {
      contentParts.push({ text: assembledPrompt })
    }

    console.log(`Template: ${template_id} | Baptiste: ${needsBaptiste} | Quality: ${quality} | Platform: ${platform} | Format: ${format_tag || 'none'}`)
    console.log(`Prompt length: ${assembledPrompt.length} chars`)

    // Call Gemini
    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: contentParts }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          responseMimeType: 'text/plain',
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini error:', geminiRes.status, errText.slice(0, 500))
      return new Response(
        JSON.stringify({ error: `Gemini: ${geminiRes.status}`, details: errText.slice(0, 300) }),
        { status: 502, headers: CORS_HEADERS },
      )
    }

    const data = await geminiRes.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const imagePart = parts.find((p: any) => p.inlineData)

    if (!imagePart?.inlineData?.data) {
      const txt = parts.find((p: any) => p.text)?.text?.slice(0, 300) || 'Empty response'
      console.error('No image in response:', txt)
      return new Response(
        JSON.stringify({ error: 'No image generated', details: txt }),
        { status: 502, headers: CORS_HEADERS },
      )
    }

    // Upload to Supabase Storage
    const base64Data = imagePart.inlineData.data
    const mime = imagePart.inlineData.mimeType || 'image/png'
    const ext = mime.includes('jpeg') ? 'jpeg' : 'png'
    const fileName = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))

    const { error: uploadErr } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, imageBuffer, { contentType: mime, upsert: false })

    if (uploadErr) {
      console.error('Upload error:', uploadErr)
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: uploadErr.message }),
        { status: 500, headers: CORS_HEADERS },
      )
    }

    const { data: { publicUrl } } = supabase.storage.from('thumbnails').getPublicUrl(fileName)

    // Save generation to database — log the FULL assembled prompt, not just the template
    const themeDetected = getThemeEnrichment(title, subject) ? true : false
    const promptForLog = assembledPrompt.slice(0, 4000) // Full prompt context for debugging

    const activeLayers = ['scene', 'composition', 'camera', 'no_text', 'anti_ai']
    if (emotion) activeLayers.unshift(`emotion:${emotion}`)
    if (themeDetected) activeLayers.unshift('THEME-OVERRIDE')
    if (format_tag) activeLayers.push(`format:${format_tag}`)

    await supabase.from('thumbnail_generations').insert({
      template_id: template_id || 'custom',
      title: title || subject,
      prompt_used: promptForLog,
      platform,
      aspect_ratio: platform === 'youtube' ? '16:9' : '9:16',
      image_url: publicUrl,
      image_path: fileName,
      format_tag: format_tag || null,
      quality,
      metadata: {
        model: 'gemini-3.1-flash-image-preview',
        baptiste_ref: needsBaptiste,
        prompt_layers: activeLayers,
        prompt_length: assembledPrompt.length,
        emotion: emotion || null,
        theme_override: themeDetected,
      },
      video_idea_id: video_idea_id || null,
      calendar_item_id: calendar_item_id || null,
    }).then(({ error }) => { if (error) console.error('DB insert error:', error) })

    return new Response(
      JSON.stringify({
        image_url: publicUrl,
        prompt_used: promptForLog,
        template_id: template_id || 'custom',
        platform,
        layers: activeLayers,
      }),
      { headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
    )
  } catch (err) {
    console.error('Unhandled error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal error', details: String(err) }),
      { status: 500, headers: CORS_HEADERS },
    )
  }
})
