import type { ThumbnailTemplate } from '@/types/thumbnails'

export const THUMBNAIL_CATEGORIES = [
  { id: 'all', label: 'Tous', icon: 'LayoutGrid' },
  { id: 'food', label: 'Food', icon: 'UtensilsCrossed' },
  { id: 'challenge', label: 'Challenge', icon: 'Zap' },
  { id: 'cartoon', label: 'Cartoon', icon: 'Palette' },
  { id: 'cinematic', label: 'Cinema', icon: 'Clapperboard' },
  { id: 'typography', label: 'Typo', icon: 'Type' },
  { id: 'comparison', label: 'VS', icon: 'ArrowLeftRight' },
] as const

export const THUMBNAIL_TEMPLATES: ThumbnailTemplate[] = [
  {
    id: 'food-closeup',
    name: 'Food Gros Plan',
    category: 'food',
    platforms: ['youtube', 'tiktok'],
    basePrompt: 'Hyperrealistic close-up photograph of {subject}, Caravaggio-style dramatic chiaroscuro lighting with deep shadows and warm golden highlights. Steam rising, ingredients glistening with moisture. Shot on medium format camera, shallow depth of field f/1.4. Dark moody background. Professional food editorial styling. 8K quality, ultra detailed textures. No text overlay.',
    variables: ['subject'],
    previewImage: '/templates/template-food-closeup.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['hyperrealiste', 'food', 'gros plan', 'editorial'],
    icon: 'Camera',
  },
  {
    id: 'split-before-after',
    name: 'Avant / Apres',
    category: 'food',
    platforms: ['youtube'],
    basePrompt: 'Split scene image divided vertically. Left side: raw messy {subject} ingredients scattered on dark counter, chaotic. Right side: beautiful plated {subject} with professional garnish and presentation. Bold contrasting colors between both sides. Clean dividing line. Dramatic lighting on both sides. Food photography, editorial quality. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-split-before-after.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['split', 'avant-apres', 'transformation'],
    icon: 'Columns2',
  },
  {
    id: 'challenge-reaction',
    name: 'Challenge Reaction',
    category: 'challenge',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '3D cartoon character with shocked exaggerated expression, mouth wide open, eyes bulging, looking at {subject}. Colorful pop style, vibrant saturated colors. {subject} in foreground looking incredible. Dynamic composition with energy lines and sparkle effects. Bold, playful, YouTube thumbnail style. Orange and warm tones (#FF6B00, #FFB800). No text.',
    variables: ['subject'],
    previewImage: '/templates/template-challenge-reaction.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['reaction', 'cartoon', 'expressif', 'challenge'],
    icon: 'Zap',
  },
  {
    id: 'cartoon-recipe',
    name: 'Recette Cartoon',
    category: 'cartoon',
    platforms: ['youtube'],
    basePrompt: 'Colorful cartoon style cooking scene featuring {subject} with floating ingredients in mid-air, whisk and utensils animated, vibrant saturated colors, playful composition, warm orange palette, food illustration style, magical sparkles and steam effects, cheerful energy. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-cartoon-recipe.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['cartoon', 'recette', 'colore', 'fun'],
    icon: 'Palette',
  },
  {
    id: 'gustavo-scene',
    name: 'Scene Gustavo',
    category: 'cartoon',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '3D animated cartoon character with exaggerated sarcastic expression wearing chef hat, arms crossed, standing next to {subject}, dramatic studio lighting, Pixar-quality rendering, warm orange and gold tones, cinematic composition. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-gustavo-scene.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['gustavo', '3d', 'personnage', 'sarcastique'],
    icon: 'UserRound',
  },
  {
    id: 'blind-order',
    name: 'Commande Aveugle',
    category: 'cinematic',
    platforms: ['youtube'],
    basePrompt: 'Mysterious food photography scene with covered silver cloches on dark table, one cloche partially lifted revealing {subject}, dramatic fog and backlighting, question marks floating in air, cinematic moody atmosphere, suspenseful composition, blue and orange color contrast. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-blind-order.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['mystere', 'aveugle', 'suspense', 'cinematique'],
    icon: 'Eye',
  },
  {
    id: 'food-explosion',
    name: 'Food Explosion',
    category: 'food',
    platforms: ['youtube', 'tiktok'],
    basePrompt: 'Dynamic food explosion with {subject} ingredients suspended in mid-air against dark background, flying apart in slow motion with dramatic backlighting. Droplets of sauce and oil frozen in time. Professional commercial photography, high-speed capture effect. Vibrant colors, sharp details, studio lighting. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-food-explosion.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['explosion', 'dynamique', 'slow-motion', 'ingredients'],
    icon: 'Sparkles',
  },
  {
    id: 'text-bold',
    name: 'Titre Impact',
    category: 'typography',
    platforms: ['tiktok'],
    basePrompt: "Bold typographic design with the word '{title}' in massive 3D brushstroke letters, orange gradient (#FF6B00 to #FFB800), food elements including {subject} scattered around text, dark background with particle effects, energetic and impactful, social media cover style.",
    variables: ['title', 'subject'],
    previewImage: '/templates/template-text-bold.jpeg',
    aspectRatio: '9:16',
    suggestedSize: '2K',
    tags: ['texte', 'typographie', 'bold', 'tiktok'],
    icon: 'Type',
  },
  {
    id: 'comparison',
    name: 'VS / Comparaison',
    category: 'comparison',
    platforms: ['youtube', 'tiktok'],
    basePrompt: 'Split image comparison food photography of {subject}, left side: classic homemade version, right side: gourmet restaurant version, large VS text in center with fire effects, dramatic lighting on both sides, professional food styling, competitive energy.',
    variables: ['subject'],
    previewImage: '/templates/template-comparison.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['versus', 'comparaison', 'split', 'competition'],
    icon: 'ArrowLeftRight',
  },
  {
    id: 'cinematic-plate',
    name: 'Assiette Cinema',
    category: 'cinematic',
    platforms: ['youtube'],
    basePrompt: 'Cinematic overhead shot of {subject} on dark slate plate, professional food styling with herb garnish, moody atmospheric lighting with lens flare, shallow depth of field, film grain texture, editorial magazine quality, warm tones. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-cinematic-plate.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['cinema', 'overhead', 'editorial', 'plating'],
    icon: 'Clapperboard',
  },
  {
    id: 'defi-24h',
    name: 'Defi 24h',
    category: 'challenge',
    platforms: ['youtube'],
    basePrompt: 'Creative food and time concept: large stylized clock face with {subject} elements replacing numbers, dynamic composition, 24H text prominently displayed, warm orange glow, energetic and challenging mood. YouTube thumbnail style.',
    variables: ['subject'],
    previewImage: '/templates/template-defi-24h.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['defi', '24h', 'horloge', 'challenge'],
    icon: 'Clock',
  },
  {
    id: 'street-food',
    name: 'Street Food',
    category: 'food',
    platforms: ['tiktok'],
    basePrompt: 'Cinematic street food scene with motion blur, vendor preparing {subject} in French market stall, golden hour lighting, shallow depth of field, steam and smoke effects, dynamic movement feel, warm tones, professional travel photography style. No text.',
    variables: ['subject'],
    previewImage: '/templates/template-street-food.jpeg',
    aspectRatio: '9:16',
    suggestedSize: '2K',
    tags: ['street-food', 'marche', 'mouvement', 'tiktok'],
    icon: 'MapPin',
  },
  {
    id: 'ultra-photorealistic',
    name: 'Ultra Realiste',
    category: 'food',
    platforms: ['youtube', 'tiktok'],
    basePrompt: 'Baptiste (a young French YouTuber) in a dramatic YouTube thumbnail pose reacting to {subject}. Ultra photorealistic, shot on Sony A7IV with 85mm f/1.4 lens, shallow depth of field, professional studio lighting with rim light and key light, skin texture visible, catchlights in eyes, 8K resolution. Cinematic color grading with warm tones. The food ({subject}) is styled by a professional food stylist with steam, glistening sauce, perfect plating.',
    variables: ['subject'],
    previewImage: '/templates/template-ultra-photorealistic.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '4K',
    tags: ['ultra', 'photorealiste', 'baptiste', '4K', 'studio'],
    icon: 'Focus',
  },
]

export function buildPrompt(templateId: string, variables: Record<string, string>): string {
  const template = THUMBNAIL_TEMPLATES.find(t => t.id === templateId)
  if (!template) throw new Error(`Template not found: ${templateId}`)

  let prompt = template.basePrompt
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replaceAll(`{${key}}`, value)
  }
  return prompt
}

export function getTemplatesByCategory(category: string): ThumbnailTemplate[] {
  if (category === 'all') return THUMBNAIL_TEMPLATES
  return THUMBNAIL_TEMPLATES.filter(t => t.category === category)
}

export function getTemplatesByPlatform(platform: 'youtube' | 'tiktok'): ThumbnailTemplate[] {
  return THUMBNAIL_TEMPLATES.filter(t => t.platforms.includes(platform))
}
