export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Recommendation {
  id: number
  icon: 'lightbulb' | 'bar-chart' | 'clock' | 'trending-up' | 'users'
  title: string
  description: string
  badgeLabel: string
  badgeColor: 'orange' | 'blue' | 'purple' | 'green' | 'yellow'
}

export const initialMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: 'Quelle est ma meilleure vidéo ce mois-ci ?',
    timestamp: '14:23',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      "Ta vidéo 'Chapeau de Tacos géant' domine avec 480K vues et un RPM de 3.92€. C'est ton meilleur ratio vues/revenus depuis 3 mois. Le format 'défi food extrême' surperforme de 40% par rapport à ta moyenne. Je recommande de doubler ce format.",
    timestamp: '14:23',
  },
  {
    id: '3',
    role: 'user',
    content: 'Quand poster ma prochaine vidéo ?',
    timestamp: '14:25',
  },
  {
    id: '4',
    role: 'assistant',
    content:
      "D'après l'analyse de tes 30 dernières publications, le créneau optimal est samedi 14h. Tes vidéos publiées le samedi entre 13h et 15h ont en moyenne 35% de vues en plus dans les 48 premières heures.",
    timestamp: '14:25',
  },
]

export const mockResponses: string[] = [
  "D'après tes données, le format 'défi food' génère en moyenne 2.3x plus de vues que les vlogs classiques. Je te recommande d'en publier au moins 2 par mois pour maximiser ta croissance.",
  "Ton audience est la plus active entre 13h et 16h le week-end. En semaine, le pic est à 18h. Pour maximiser les premières 24h de ta vidéo, vise ces créneaux.",
  "J'ai détecté une tendance : tes vidéos avec des thumbnails contenant du texte en gros plan performent 28% mieux en CTR. Continue dans cette direction !",
  "Tes Shorts ont gagné 12K abonnés ce mois-ci, soit 60% de tes gains totaux. Le format court est clairement ton levier de croissance principal en ce moment.",
  "Le RPM moyen de ta chaîne est de 3.15€, mais tes vidéos longues (>10min) montent à 4.80€. Pour maximiser les revenus, essaie de publier au moins une vidéo longue par semaine.",
]

export const recommendations: Recommendation[] = [
  {
    id: 1,
    icon: 'lightbulb',
    title: 'Double les défis food extrêmes',
    description: 'Ce format génère 2.3x plus de vues que ta moyenne. Passe de 1 à 2 par mois.',
    badgeLabel: 'Format',
    badgeColor: 'orange',
  },
  {
    id: 2,
    icon: 'clock',
    title: 'Publie le samedi 14h',
    description: '+35% de vues dans les 48h pour les vidéos publiées sur ce créneau.',
    badgeLabel: 'Timing',
    badgeColor: 'blue',
  },
  {
    id: 3,
    icon: 'bar-chart',
    title: 'Teste une vidéo en anglais',
    description: '68% de ton audience est francophone. Le potentiel international est sous-exploité.',
    badgeLabel: 'Langue',
    badgeColor: 'purple',
  },
  {
    id: 4,
    icon: 'trending-up',
    title: 'Format cartoon recipe en hausse',
    description: '+180% de recherches sur ce format en 30 jours. Tendance à capter rapidement.',
    badgeLabel: 'Tendance',
    badgeColor: 'green',
  },
  {
    id: 5,
    icon: 'users',
    title: 'Cible les 18-24 ans',
    description: "Segment en croissance de 22% sur ta chaîne. Adapte le ton et les références.",
    badgeLabel: 'Audience',
    badgeColor: 'yellow',
  },
]

export const questionPills = [
  { label: '📊 Performance ce mois', question: 'Quelle est ma performance globale ce mois-ci ?' },
  { label: '🎯 Meilleur format', question: 'Quel est mon meilleur format de vidéo actuellement ?' },
  { label: '⏰ Quand publier', question: 'Quel est le meilleur moment pour publier ma prochaine vidéo ?' },
  { label: '💡 Idées de vidéos', question: 'Propose-moi des idées de vidéos basées sur les tendances actuelles.' },
]
