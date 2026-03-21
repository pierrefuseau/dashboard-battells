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

export const platforms: PlatformData[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    color: '#FF0000',
    accent: '#FF0000',
    subscribers: '543.8K',
    subscriberLabel: 'abonnés',
    metrics: [
      { label: 'Vues totales', value: '127.4M' },
      { label: 'Moy. vues/vidéo', value: '385K' },
      { label: 'Taux engagement', value: '6.8%' },
      { label: 'Top vidéo', value: '4.2M vues' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'tiktok',
    color: '#000000',
    accent: '#000000',
    subscribers: '127.3K',
    subscriberLabel: 'followers',
    metrics: [
      { label: 'Vues totales', value: '89.1M' },
      { label: 'Moy. vues/vidéo', value: '142K' },
      { label: 'Taux engagement', value: '9.2%' },
      { label: 'Top vidéo', value: '7.8M vues' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    color: '#E1306C',
    accent: '#E1306C',
    subscribers: '89.2K',
    subscriberLabel: 'followers',
    metrics: [
      { label: 'Vues totales', value: '32.6M' },
      { label: 'Moy. vues/vidéo', value: '58K' },
      { label: 'Taux engagement', value: '4.5%' },
      { label: 'Top vidéo', value: '1.9M vues' },
    ],
  },
]

export const radarData = [
  { axis: 'Vues moyennes', youtube: 85, tiktok: 62, instagram: 40 },
  { axis: 'Engagement', youtube: 68, tiktok: 92, instagram: 45 },
  { axis: 'Croissance abonnés', youtube: 55, tiktok: 78, instagram: 42 },
  { axis: 'Régularité', youtube: 90, tiktok: 65, instagram: 50 },
  { axis: 'Monétisation', youtube: 95, tiktok: 35, instagram: 30 },
]
