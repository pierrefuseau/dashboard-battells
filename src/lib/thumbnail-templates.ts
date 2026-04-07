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
    basePrompt: '[SCENE: EDITORIAL FOOD MACRO] Extreme close-up food photograph of {subject} filling 80% of the frame. Single Profoto B10 with 2-foot octabox at 45° upper-left creating Caravaggio-style chiaroscuro. Ingredients glistening with moisture droplets, visible steam rising in backlight. Phase One IQ4 150MP, Schneider 120mm f/4 Macro, focus-stacked. Dark moody negative-fill background. Professional food styling with micro-herbs and sauce artistry. Warm 3200K tungsten with cool shadow tones. 8K, ultra-detailed textures.',
    variables: ['subject'],
    previewImage: '/templates/template-food-closeup.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['hyperrealiste', 'food', 'gros plan', 'editorial', 'macro'],
    icon: 'Camera',
    description: 'Macro culinaire ultra-détaillé, éclairage Caravaggio. Le plat remplit 80% du cadre avec des détails microscopiques.',
  },
  {
    id: 'split-before-after',
    name: 'Avant / Après',
    category: 'food',
    platforms: ['youtube'],
    basePrompt: '[SCENE: TRANSFORMATION SPLIT] Split vertical. LEFT: chaotic raw {subject} ingredients on dark granite, flour dust mid-air, harsh flash. RIGHT: magnificent finished {subject}, matte black ceramic plate, professional garnish, soft diffused strobe at f/1.8, warm 3400K. Dramatic contrast between chaos and perfection.',
    variables: ['subject'],
    previewImage: '/templates/template-split-before-after.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['split', 'avant-apres', 'transformation', 'contraste'],
    icon: 'Columns2',
    description: 'Split vertical chaos → perfection. Contraste dramatique entre ingrédients bruts et plat final sublime.',
  },
  {
    id: 'challenge-reaction',
    name: 'Challenge Réaction',
    category: 'challenge',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '[SCENE: REACTION THUMBNAIL] Baptiste avec expression de choc exagérée, bouche ouverte, yeux écarquillés derrière ses lunettes dorées, regardant {subject} positionné en avant-plan droit. Two-light: warm key 3200K camera-left, cool fill camera-right. Canon R5, 35mm f/1.4. Dynamic diagonal composition. Vibrant.',
    variables: ['subject'],
    previewImage: '/templates/template-challenge-reaction.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['reaction', 'expressif', 'challenge', 'baptiste', 'emotion'],
    icon: 'Zap',
    description: 'Baptiste en réaction choquée face au plat. Composition diagonale dynamique, éclairage 2 sources.',
  },
  {
    id: 'cartoon-recipe',
    name: 'Recette Cartoon',
    category: 'cartoon',
    platforms: ['youtube'],
    basePrompt: '[SCENE: MAGICAL COOKING] Vibrant Pixar-meets-Ghibli cartoon illustration. {subject} ingredients floating in spiral vortex above bubbling copper cauldron. Volumetric golden light rays, cel-shading, sparkle particles. Warm orange palette (#FF6B00, #FFB800) with teal accents. Cheerful, magical energy.',
    variables: ['subject'],
    previewImage: '/templates/template-cartoon-recipe.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['cartoon', 'recette', 'colore', 'fun', 'pixar', 'ghibli'],
    icon: 'Palette',
    description: 'Scène de cuisine magique style Pixar × Ghibli. Ingrédients flottants, lumière volumétrique dorée.',
  },
  {
    id: 'gustavo-scene',
    name: 'Scène Gustavo',
    category: 'cartoon',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '[SCENE: SARCASTIC CHEF] Baptiste en chef sarcastique : veste blanche, toque, bras croisés, sourcil levé, smirk. {subject} à côté de lui sur dark slate, professionnellement stylé. Sony A1, 85mm GM f/2.0, Rembrandt lighting, warm amber kicker. Skin pores and stubble visible.',
    variables: ['subject'],
    previewImage: '/templates/template-gustavo-scene.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['gustavo', 'chef', 'personnage', 'sarcastique', 'portrait'],
    icon: 'UserRound',
    description: 'Portrait cinématique de Baptiste en chef arrogant. Éclairage Rembrandt, son plat comme preuve de maîtrise.',
  },
  {
    id: 'blind-order',
    name: 'Commande Aveugle',
    category: 'cinematic',
    platforms: ['youtube'],
    basePrompt: '[SCENE: MYSTERY REVEAL] Baptiste avec blindfold satin noir par-dessus ses lunettes, mains au-dessus de la table. Cloche argentée soulevée révélant {subject} avec steam. Amber candlelight from below, blue-gelled backlight. ARRI Alexa Mini, Cooke Anamorphic 50mm, oval bokeh. Volumetric fog.',
    variables: ['subject'],
    previewImage: '/templates/template-blind-order.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['mystere', 'aveugle', 'suspense', 'cinematique', 'luxe'],
    icon: 'Eye',
    description: 'Scène de suspense cinématique. Cloche soulevée révélant le plat dans la brume. Ambiance Michelin-star.',
  },
  {
    id: 'food-explosion',
    name: 'Food Explosion',
    category: 'food',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '[SCENE: HIGH-SPEED DECONSTRUCTED] Ultra-high-speed freeze-frame: {subject} ingredients suspended mid-air against pure black background. Sauce droplets as perfect spheres with refraction, cheese stretching. Triple-strobe: strong backlight for translucent edges, under-fill, key from upper-left. Phantom Flex4K at 10,000fps, Nikon 105mm f/2.8 macro.',
    variables: ['subject'],
    previewImage: '/templates/template-food-explosion.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['explosion', 'dynamique', 'slow-motion', 'ingredients', 'freeze'],
    icon: 'Sparkles',
    description: 'Explosion culinaire freeze-frame. Chaque ingrédient suspendu en l\'air avec physique réaliste.',
  },
  {
    id: 'text-bold',
    name: 'Titre Impact',
    category: 'typography',
    platforms: ['tiktok'],
    basePrompt: '[SCENE: TYPOGRAPHIC POSTER] Bold 3D brushstroke letters "{title}" avec texture de poils de pinceau. Orange-to-gold gradient (#FF6B00→#FFB800), specular metallic highlights. {subject} scattered between letters, some overlapping. Dark charcoal background (#1A1A1A) with bokeh ember particles. Social media vertical composition.',
    variables: ['title', 'subject'],
    previewImage: '/templates/template-text-bold.jpeg',
    aspectRatio: '9:16',
    suggestedSize: '2K',
    tags: ['texte', 'typographie', 'bold', 'tiktok', '3d'],
    icon: 'Type',
    description: 'Typographie 3D massive avec éléments food intégrés. Lettres brushstroke en gradient orange-or.',
  },
  {
    id: 'comparison',
    name: 'VS / Comparaison',
    category: 'comparison',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '[SCENE: ULTIMATE VS] Baptiste au centre, jaw-dropped. LEFT: rustic homemade {subject} on wooden board, warm incandescent light. RIGHT: haute-cuisine {subject} on black slate with gold leaf, studio lighting. Stark visual contrast between humble and extravagant. Canon R5, 24-70mm at 35mm.',
    variables: ['subject'],
    previewImage: '/templates/template-comparison.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['versus', 'comparaison', 'split', 'competition', 'contraste'],
    icon: 'ArrowLeftRight',
    description: 'Baptiste entre version maison et version gastronomique. Le contraste visuel raconte l\'histoire.',
  },
  {
    id: 'cinematic-plate',
    name: 'Assiette Cinéma',
    category: 'cinematic',
    platforms: ['youtube'],
    basePrompt: '[SCENE: EDITORIAL BIRD\'S EYE] Cinematic overhead: {subject} on dark hand-thrown ceramic plate, raw stone edges. Golden ratio spiral composition. Professional styling: micro-herbs, sauce swoosh, strategic negative space. Kodak Portra 400 color science. Tilt-shift DOF, anamorphic lens flare. Dark oak table with patina.',
    variables: ['subject'],
    previewImage: '/templates/template-cinematic-plate.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['cinema', 'overhead', 'editorial', 'plating', 'portra'],
    icon: 'Clapperboard',
    description: 'Vue plongeante magazine. Composition spirale dorée, couleurs Kodak Portra, éclairage d\'éditorial luxe.',
  },
  {
    id: 'defi-24h',
    name: 'Défi 24h',
    category: 'challenge',
    platforms: ['youtube'],
    basePrompt: '[SCENE: 24H ENDURANCE] Low-angle hero shot of Baptiste exhausted but determined: sleeves rolled, perspiration, disheveled hair, fierce eyes. Professional kitchen backdrop blurred. {subject} as his masterpiece beside him, steaming and spectacular. Vintage industrial clock blurred on wall behind (no numbers, abstract markers only). Warm key 3200K left, cool kitchen fill behind. Sony A7R V, 35mm f/1.4 at f/2.0.',
    variables: ['subject'],
    previewImage: '/templates/template-defi-24h.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '2K',
    tags: ['defi', '24h', 'endurance', 'challenge', 'hero'],
    icon: 'Clock',
    description: 'Portrait héroïque post-marathon culinaire. Baptiste épuisé mais victorieux, le plat comme trophée.',
  },
  {
    id: 'street-food',
    name: 'Street Food',
    category: 'food',
    platforms: ['tiktok'],
    basePrompt: '[SCENE: GOLDEN HOUR DOCUMENTARY] Cinematic street photography: vendor preparing {subject} at French market, golden hour backlight through steam creating god rays. Hands in motion blur at 1/30s, food sharp. Leica M11, Summilux 35mm f/1.4 wide open. Kodachrome palette. Cobblestone, stone buildings in deep bokeh.',
    variables: ['subject'],
    previewImage: '/templates/template-street-food.jpeg',
    aspectRatio: '9:16',
    suggestedSize: '2K',
    tags: ['street-food', 'marche', 'mouvement', 'tiktok', 'golden-hour'],
    icon: 'MapPin',
    description: 'Street food en golden hour. Motion blur sur les mains, rays volumétriques, palette Kodachrome.',
  },
  {
    id: 'ultra-photorealistic',
    name: 'Ultra Réaliste',
    category: 'food',
    platforms: ['youtube', 'tiktok'],
    basePrompt: '[SCENE: STUDIO-GRADE THUMBNAIL] Baptiste three-quarter portrait, genuine expression reacting to {subject}. 3-light setup: octabox key 45° (3200K), v-flat fill, amber rim/hair light. Food styled with persistent steam, glistening surfaces. Sony A7IV, 85mm f/1.4 GM. Skin fully resolved: pores, stubble, glasses reflections, catchlights. Rule of thirds composition. Cinematic warm grade.',
    variables: ['subject'],
    previewImage: '/templates/template-ultra-photorealistic.jpeg',
    aspectRatio: '16:9',
    suggestedSize: '4K',
    tags: ['ultra', 'photorealiste', 'baptiste', '4K', 'studio', 'premium'],
    icon: 'Focus',
    description: 'Le template ultime. Portrait studio de Baptiste + food styling professionnel. Maximum réalisme 4K.',
  },
]

/**
 * Build a preview prompt from template + variables.
 * Note: The actual generation uses the edge function's enhanced multi-layer prompt engine.
 * This frontend preview is simplified for display purposes.
 */
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
