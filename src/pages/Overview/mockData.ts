// ── Mock Data for Overview Page ─────────────────────────────────
// Realistic values for a 543K subscriber French food YouTuber

/** Sparkline data: last 14 daily data points */
export const kpiData = {
  views: {
    value: 5_732_000,
    previousValue: 5_104_000,
    sparkline: [142000, 168000, 195000, 180000, 210000, 245000, 198000, 220000, 260000, 235000, 190000, 215000, 270000, 304000],
  },
  revenue: {
    value: 476,
    previousValue: 440,
    sparkline: [12, 14, 18, 15, 19, 22, 17, 20, 24, 21, 16, 19, 25, 28],
  },
  subscribers: {
    value: 543_800,
    previousValue: 531_100,
    sparkline: [538200, 538900, 539600, 540100, 540800, 541200, 541500, 542000, 542300, 542800, 543000, 543200, 543500, 543800],
  },
  ctr: {
    value: 8.3,
    previousValue: 8.8,
    sparkline: [8.1, 8.4, 8.6, 8.2, 8.5, 8.8, 8.3, 8.1, 8.0, 8.4, 8.6, 8.2, 8.3, 8.3],
  },
}

/** Views trend chart: 30 days of daily views + revenue */
export const viewsTrendData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date()
  date.setDate(date.getDate() - (29 - i))
  const base = 170000 + Math.sin(i / 4) * 50000
  const views = Math.round(base + Math.random() * 40000)
  const revenue = Math.round((views / 1000) * 0.08 * 100) / 100
  return {
    date: date.toISOString().slice(0, 10),
    dateLabel: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    views,
    revenue,
  }
})

/** Top 5 videos (last 30 days) */
export const topVideos = [
  { id: '1', title: 'J\'ai teste la street food la plus DANGEREUSE du monde', views: 1_240_000, revenue: 98.50, thumbnail: null },
  { id: '2', title: 'Ce restaurant 1 etoile sert le PIRE plat de ma vie', views: 890_000, revenue: 71.20, thumbnail: null },
  { id: '3', title: '24h a manger UNIQUEMENT des plats a 1 euro', views: 765_000, revenue: 61.10, thumbnail: null },
  { id: '4', title: 'Je reproduis les recettes de mon GRAND-PERE', views: 620_000, revenue: 49.60, thumbnail: null },
  { id: '5', title: 'La VERITE sur les restaurants "faits maison"', views: 510_000, revenue: 40.80, thumbnail: null },
]

/** Dark motivational card */
export const darkCardData = {
  emoji: '\uD83D\uDD25',
  title: 'DINGUERIE : 1.2M de vues en 48h',
  subtitle: 'Ta derniere video est un BANGER absolu',
  detail: 'RPM moyen : 7.80\u20AC \u2014 le meilleur de ce mois',
}

/** Monthly goals */
export const monthlyGoals = [
  { label: 'Long-form', current: 3, target: 4, color: '#FF6B00' },
  { label: 'Vues', current: 5_700_000, target: 10_000_000, color: '#FFB800' },
  { label: 'Revenu', current: 476, target: 2000, color: '#FF6B00' },
]

/** Recent alerts */
export const recentAlerts = [
  {
    icon: '\u26A1',
    text: 'Spike de vues : +340% sur "Street food dangereuse" en 6h',
    badgeText: 'Critique',
    badgeVariant: 'error' as const,
    timestamp: 'Il y a 2h',
  },
  {
    icon: '\u26A0\uFE0F',
    text: 'CTR en baisse sur les 3 dernieres videos (-1.2 pts)',
    badgeText: 'Attention',
    badgeVariant: 'warning' as const,
    timestamp: 'Il y a 5h',
  },
  {
    icon: '\uD83D\uDCA1',
    text: 'IA : "Les videos avec des chiffres dans le titre ont +23% de CTR"',
    badgeText: 'Insight',
    badgeVariant: 'info' as const,
    timestamp: 'Il y a 1j',
  },
]
