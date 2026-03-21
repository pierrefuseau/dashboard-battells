export interface PlatformData {
  id: string
  name: string
  icon: 'youtube' | 'tiktok' | 'instagram'
  color: string
  accent: string
  subscribers: string
  subscriberLabel: string
  metrics: {
    label: string
    value: string
  }[]
}

// Métriques réalistes cross-platform pour BATTELLS
// YouTube = plateforme principale | TikTok = croissance rapide | Instagram = vitrine
export const platforms: PlatformData[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    accent: '#FF0000',
    subscribers: '543K',
    subscriberLabel: 'abonnés',
    metrics: [
      { label: 'Vues totales', value: '321M' },
      { label: 'Moy. vues/vidéo', value: '1.15M' },
      { label: 'Taux engagement', value: '5.8%' },
      { label: 'RPM moyen', value: '3.50€' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    accent: '#000000',
    subscribers: '218K',
    subscriberLabel: 'followers',
    metrics: [
      { label: 'Vues totales', value: '145M' },
      { label: 'Moy. vues/vidéo', value: '420K' },
      { label: 'Taux engagement', value: '8.4%' },
      { label: 'Top vidéo', value: '12.3M vues' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    accent: '#E1306C',
    subscribers: '94.7K',
    subscriberLabel: 'followers',
    metrics: [
      { label: 'Vues Reels', value: '48.2M' },
      { label: 'Moy. vues/reel', value: '82K' },
      { label: 'Taux engagement', value: '4.2%' },
      { label: 'Top reel', value: '2.8M vues' },
    ],
  },
]

export const radarData = [
  { axis: 'Vues moyennes', youtube: 92, tiktok: 68, instagram: 35 },
  { axis: 'Engagement', youtube: 58, tiktok: 84, instagram: 42 },
  { axis: 'Croissance', youtube: 48, tiktok: 82, instagram: 38 },
  { axis: 'Régularité', youtube: 95, tiktok: 60, instagram: 45 },
  { axis: 'Monétisation', youtube: 98, tiktok: 25, instagram: 15 },
]
