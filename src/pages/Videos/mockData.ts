import type { YtVideo, YtDailyStat } from '@/types/database.ts'

// ── Helper: generate daily stats for a video ──────────────────
function generateDailyStats(
  videoId: string,
  publishedAt: string,
  totalViews: number,
  totalRevenue: number,
  totalLikes: number,
  ctr: number,
  days: number = 30,
): YtDailyStat[] {
  const stats: YtDailyStat[] = []
  const startDate = new Date(publishedAt)

  // Exponential decay curve: day 1 gets most views
  const weights: number[] = []
  let weightSum = 0
  for (let i = 0; i < days; i++) {
    const w = Math.exp(-0.12 * i) + 0.05 * Math.random()
    weights.push(w)
    weightSum += w
  }

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const ratio = weights[i] / weightSum
    const dayViews = Math.round(totalViews * ratio)
    const dayRevenue = +(totalRevenue * ratio).toFixed(2)
    const dayLikes = Math.round(totalLikes * ratio)
    const impressions = Math.round(dayViews / (ctr / 100))

    stats.push({
      id: parseInt(videoId.replace(/\D/g, '') || '0', 10) * 1000 + i,
      video_id: videoId,
      date: date.toISOString().split('T')[0],
      views: dayViews,
      estimated_revenue: dayRevenue,
      likes: dayLikes,
      comments: Math.round(dayLikes * 0.08),
      shares: Math.round(dayLikes * 0.04),
      subscribers_gained: Math.round(dayViews * 0.002),
      subscribers_lost: Math.round(dayViews * 0.0002),
      avg_view_duration_seconds: Math.round(120 + Math.random() * 300),
      impressions,
      impressions_ctr: +(ctr + (Math.random() - 0.5) * 1.5).toFixed(2),
    })
  }
  return stats
}

// ── Video definitions ─────────────────────────────────────────
interface MockVideoInput {
  id: string
  title: string
  published_at: string
  duration_seconds: number
  is_short: boolean
  format_tag: string
  language: string
  tags: string[]
  totalViews: number
  totalRevenue: number
  totalLikes: number
  ctr: number
}

const videoInputs: MockVideoInput[] = [
  {
    id: 'v001', title: 'Je reproduis le Ramen de Naruto en 24h',
    published_at: '2026-01-15', duration_seconds: 1024, is_short: false,
    format_tag: 'challenge', language: 'fr', tags: ['ramen', 'naruto', 'challenge'],
    totalViews: 4_200_000, totalRevenue: 12_600, totalLikes: 210_000, ctr: 8.4,
  },
  {
    id: 'v002', title: "Degustation a l'aveugle : McDonald's vs Chef etoile",
    published_at: '2026-01-28', duration_seconds: 1320, is_short: false,
    format_tag: 'challenge', language: 'fr', tags: ['degustation', 'mcdonalds', 'chef'],
    totalViews: 6_800_000, totalRevenue: 23_800, totalLikes: 385_000, ctr: 10.2,
  },
  {
    id: 'v003', title: 'Le Chapeau de Tacos le plus GRAND du monde',
    published_at: '2026-02-05', duration_seconds: 960, is_short: false,
    format_tag: 'challenge', language: 'fr', tags: ['tacos', 'record', 'geant'],
    totalViews: 9_100_000, totalRevenue: 31_850, totalLikes: 520_000, ctr: 11.5,
  },
  {
    id: 'v004', title: 'Recette secrete des Donuts des Simpsons',
    published_at: '2026-02-12', duration_seconds: 780, is_short: false,
    format_tag: 'tuto', language: 'fr', tags: ['donuts', 'simpsons', 'recette'],
    totalViews: 2_900_000, totalRevenue: 10_150, totalLikes: 175_000, ctr: 7.6,
  },
  {
    id: 'v005', title: 'Je mange uniquement VIOLET pendant 24h',
    published_at: '2026-02-20', duration_seconds: 1140, is_short: false,
    format_tag: 'challenge', language: 'fr', tags: ['couleur', 'violet', '24h'],
    totalViews: 3_500_000, totalRevenue: 12_250, totalLikes: 195_000, ctr: 8.1,
  },
  {
    id: 'v006', title: 'Comment faire le VRAI Croissant parisien',
    published_at: '2026-02-28', duration_seconds: 1500, is_short: false,
    format_tag: 'tuto', language: 'fr', tags: ['croissant', 'patisserie', 'tuto'],
    totalViews: 1_800_000, totalRevenue: 7_200, totalLikes: 120_000, ctr: 6.8,
  },
  {
    id: 'v007', title: 'Street Food TOUR a Bangkok - 15 plats en 1 jour',
    published_at: '2026-03-02', duration_seconds: 1680, is_short: false,
    format_tag: 'vlog', language: 'fr', tags: ['bangkok', 'street-food', 'voyage'],
    totalViews: 2_100_000, totalRevenue: 8_400, totalLikes: 145_000, ctr: 7.2,
  },
  {
    id: 'v008', title: "On teste les pires recettes de l'IA",
    published_at: '2026-03-05', duration_seconds: 900, is_short: false,
    format_tag: 'reaction', language: 'fr', tags: ['ia', 'recette', 'test'],
    totalViews: 5_200_000, totalRevenue: 18_200, totalLikes: 310_000, ctr: 9.3,
  },
  {
    id: 'v009', title: 'Je cuisine pour 100 inconnus dans la rue',
    published_at: '2026-03-08', duration_seconds: 1260, is_short: false,
    format_tag: 'vlog', language: 'fr', tags: ['cuisine', 'rue', 'social'],
    totalViews: 3_800_000, totalRevenue: 13_300, totalLikes: 230_000, ctr: 8.7,
  },
  {
    id: 'v010', title: 'La VRAIE recette du Boeuf Bourguignon de ma grand-mere',
    published_at: '2026-03-10', duration_seconds: 1080, is_short: false,
    format_tag: 'tuto', language: 'fr', tags: ['boeuf', 'bourguignon', 'tradition'],
    totalViews: 1_400_000, totalRevenue: 5_600, totalLikes: 98_000, ctr: 6.4,
  },
  {
    id: 'v011', title: 'Pizza maison en 30 secondes',
    published_at: '2026-03-01', duration_seconds: 35, is_short: true,
    format_tag: 'short', language: 'fr', tags: ['pizza', 'rapide', 'short'],
    totalViews: 8_500_000, totalRevenue: 4_250, totalLikes: 620_000, ctr: 4.2,
  },
  {
    id: 'v012', title: 'Quand tu mets trop de piment',
    published_at: '2026-02-14', duration_seconds: 22, is_short: true,
    format_tag: 'short', language: 'fr', tags: ['piment', 'humour', 'short'],
    totalViews: 5_600_000, totalRevenue: 2_800, totalLikes: 410_000, ctr: 3.8,
  },
  {
    id: 'v013', title: 'Ce geste change TOUT en patisserie',
    published_at: '2026-03-12', duration_seconds: 45, is_short: true,
    format_tag: 'short', language: 'fr', tags: ['patisserie', 'astuce', 'short'],
    totalViews: 3_200_000, totalRevenue: 1_600, totalLikes: 245_000, ctr: 3.5,
  },
  {
    id: 'v014', title: 'J\'ai invite un chef japonais chez moi',
    published_at: '2026-03-14', duration_seconds: 1380, is_short: false,
    format_tag: 'collab', language: 'fr', tags: ['japon', 'chef', 'collab'],
    totalViews: 2_600_000, totalRevenue: 10_400, totalLikes: 168_000, ctr: 7.9,
  },
  {
    id: 'v015', title: 'Tier List des Fast Foods francais',
    published_at: '2026-03-16', duration_seconds: 1020, is_short: false,
    format_tag: 'review', language: 'fr', tags: ['tier-list', 'fast-food', 'classement'],
    totalViews: 4_700_000, totalRevenue: 16_450, totalLikes: 280_000, ctr: 9.0,
  },
  {
    id: 'v016', title: 'Le sandwich le plus cher de Paris (250 euros)',
    published_at: '2026-03-17', duration_seconds: 840, is_short: false,
    format_tag: 'vlog', language: 'fr', tags: ['paris', 'sandwich', 'luxe'],
    totalViews: 3_100_000, totalRevenue: 10_850, totalLikes: 195_000, ctr: 8.3,
  },
  {
    id: 'v017', title: 'Je survis 7 jours avec la bouffe du Moyen-Age',
    published_at: '2026-03-18', duration_seconds: 1440, is_short: false,
    format_tag: 'story', language: 'fr', tags: ['histoire', 'moyen-age', 'defi'],
    totalViews: 2_300_000, totalRevenue: 9_200, totalLikes: 152_000, ctr: 7.5,
  },
  {
    id: 'v018', title: 'Pancake flip parfait',
    published_at: '2026-03-10', duration_seconds: 18, is_short: true,
    format_tag: 'short', language: 'fr', tags: ['pancake', 'satisfying', 'short'],
    totalViews: 4_100_000, totalRevenue: 2_050, totalLikes: 350_000, ctr: 4.0,
  },
  {
    id: 'v019', title: 'Mon avis HONNETE sur le Thermomix',
    published_at: '2026-03-19', duration_seconds: 1200, is_short: false,
    format_tag: 'review', language: 'fr', tags: ['thermomix', 'avis', 'cuisine'],
    totalViews: 1_600_000, totalRevenue: 6_400, totalLikes: 105_000, ctr: 6.9,
  },
  {
    id: 'v020', title: 'Cooking the PERFECT Steak (English ver.)',
    published_at: '2026-03-13', duration_seconds: 720, is_short: false,
    format_tag: 'tuto', language: 'en', tags: ['steak', 'english', 'tutorial'],
    totalViews: 980_000, totalRevenue: 3_920, totalLikes: 62_000, ctr: 5.8,
  },
  {
    id: 'v021', title: 'Le PODCAST cuisine #12 - Avec Norbert Tarayre',
    published_at: '2026-03-15', duration_seconds: 3600, is_short: false,
    format_tag: 'podcast', language: 'fr', tags: ['podcast', 'norbert', 'interview'],
    totalViews: 420_000, totalRevenue: 1_680, totalLikes: 32_000, ctr: 4.5,
  },
  {
    id: 'v022', title: 'BATTELLS x Squeezie : le duel en cuisine',
    published_at: '2026-03-20', duration_seconds: 1560, is_short: false,
    format_tag: 'collab', language: 'fr', tags: ['squeezie', 'collab', 'duel'],
    totalViews: 7_400_000, totalRevenue: 25_900, totalLikes: 445_000, ctr: 10.8,
  },
  {
    id: 'v023', title: 'Evenement : BATTELLS au Salon de l\'Agriculture',
    published_at: '2026-03-06', duration_seconds: 1080, is_short: false,
    format_tag: 'event', language: 'fr', tags: ['salon', 'agriculture', 'event'],
    totalViews: 1_200_000, totalRevenue: 4_800, totalLikes: 85_000, ctr: 6.1,
  },
  {
    id: 'v024', title: 'L\'oeuf parfait en slow-mo',
    published_at: '2026-03-09', duration_seconds: 28, is_short: true,
    format_tag: 'short', language: 'fr', tags: ['oeuf', 'slowmo', 'satisfying'],
    totalViews: 6_300_000, totalRevenue: 3_150, totalLikes: 480_000, ctr: 3.9,
  },
]

// ── Build final data ──────────────────────────────────────────

export interface MockVideo extends YtVideo {
  platform: 'youtube' | 'tiktok' | 'instagram'
  totalViews: number
  totalLikes: number
  totalRevenue: number
  ctr: number
  rpm: number
  engagement: number
  dailyStats: YtDailyStat[]
}

export const MOCK_VIDEOS: MockVideo[] = videoInputs.map((v) => {
  const rpm = v.totalViews > 0 ? (v.totalRevenue / v.totalViews) * 1000 : 0
  const engagement = v.totalViews > 0 ? (v.totalLikes / v.totalViews) * 100 : 0
  const days = v.is_short ? 14 : 30
  const dailyStats = generateDailyStats(
    v.id, v.published_at, v.totalViews, v.totalRevenue, v.totalLikes, v.ctr, days,
  )

  return {
    id: v.id,
    title: v.title,
    published_at: v.published_at,
    duration_seconds: v.duration_seconds,
    is_short: v.is_short,
    format_tag: v.format_tag,
    language: v.language,
    thumbnail_url: null,
    description: null,
    tags: v.tags,
    created_at: v.published_at,
    platform: 'youtube' as const,
    totalViews: v.totalViews,
    totalLikes: v.totalLikes,
    totalRevenue: v.totalRevenue,
    ctr: v.ctr,
    rpm: +rpm.toFixed(2),
    engagement: +engagement.toFixed(2),
    dailyStats,
  }
})
