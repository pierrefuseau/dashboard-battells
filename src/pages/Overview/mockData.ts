// ── Mock Data for Overview Page ─────────────────────────────────
// Données réalistes pour BATTELLS — 543K abonnés, YouTube food FR
// RPM moyen food FR : ~3.50€ | CTR moyen : 7-10%
// Revenu mensuel AdSense : ~€15K-25K | + sponsors : ~€25K-40K

/** Sparkline data: last 14 daily data points */
export const kpiData = {
  views: {
    value: 5_732_000,
    previousValue: 5_104_000,
    sparkline: [142000, 168000, 195000, 180000, 210000, 245000, 198000, 220000, 260000, 235000, 190000, 215000, 270000, 304000],
  },
  revenue: {
    value: 18_460,
    previousValue: 17_050,
    sparkline: [480, 520, 680, 590, 710, 820, 640, 730, 850, 760, 580, 690, 890, 1020],
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
  const revenue = Math.round((views / 1000) * 3.5 * 100) / 100 // RPM ~3.50€
  return {
    date: date.toISOString().slice(0, 10),
    dateLabel: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    views,
    revenue,
  }
})

/** Top 5 videos (last 30 days) — revenus basés sur RPM ~3.50€ */
export const topVideos = [
  { id: 'v022', title: 'BATTELLS x Squeezie : le duel en cuisine', views: 7_400_000, revenue: 25_900, thumbnail: null },
  { id: 'v003', title: 'Le Chapeau de Tacos le plus GRAND du monde', views: 9_100_000, revenue: 31_850, thumbnail: null },
  { id: 'v008', title: "On teste les pires recettes de l'IA", views: 5_200_000, revenue: 18_200, thumbnail: null },
  { id: 'v015', title: 'Tier List des Fast Foods français', views: 4_700_000, revenue: 16_450, thumbnail: null },
  { id: 'v002', title: "Dégustation à l'aveugle : McDonald's vs Chef étoilé", views: 6_800_000, revenue: 23_800, thumbnail: null },
]

/** Dark motivational card */
export const darkCardData = {
  emoji: '\uD83D\uDD25',
  title: 'DINGUERIE : 7.4M de vues en 72h',
  subtitle: 'La collab Squeezie explose tous les records',
  detail: 'RPM moyen : 3.50\u20AC \u2014 25 900\u20AC de revenu sur cette vidéo',
}

/** Monthly goals — objectifs réalistes pour 543K subs */
export const monthlyGoals = [
  { label: 'Long-form', current: 3, target: 4, color: '#FF6B00' },
  { label: 'Vues', current: 5_700_000, target: 8_000_000, color: '#FFB800' },
  { label: 'Revenu', current: 18_460, target: 25_000, color: '#FF6B00' },
]

/** Recent alerts */
export const recentAlerts = [
  {
    icon: '\u26A1',
    text: 'Spike de vues : +540% sur la collab Squeezie en 12h',
    badgeText: 'Critique',
    badgeVariant: 'error' as const,
    timestamp: 'Il y a 2h',
  },
  {
    icon: '\uD83D\uDCB0',
    text: 'Nouveau record : 25 900€ de revenu sur une seule vidéo',
    badgeText: 'Record',
    badgeVariant: 'success' as const,
    timestamp: 'Il y a 8h',
  },
  {
    icon: '\u26A0\uFE0F',
    text: 'CTR en baisse sur les 3 dernières vidéos (-1.2 pts)',
    badgeText: 'Attention',
    badgeVariant: 'warning' as const,
    timestamp: 'Il y a 1j',
  },
  {
    icon: '\uD83D\uDCA1',
    text: 'IA : "Les vidéos avec des chiffres dans le titre ont +23% de CTR"',
    badgeText: 'Insight',
    badgeVariant: 'info' as const,
    timestamp: 'Il y a 2j',
  },
]
