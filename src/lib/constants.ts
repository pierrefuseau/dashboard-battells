export const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || 'UCkNv8s6MAtA_4dKIY-0Q2aw'

export const BATTELLS_LEXICON = [
  { word: 'DINGUERIE', emoji: '🔥', context: 'Performance virale, métrique exceptionnelle' },
  { word: 'BANGER', emoji: '💥', context: 'Vidéo qui surperforme grave' },
  { word: 'MAGNIFICUS', emoji: '🌟', context: 'Accomplissement de ouf, palier atteint' },
  { word: 'ZINZIN', emoji: '⚡', context: 'Croissance folle, pic inattendu' },
  { word: 'LÉGENDAIRE', emoji: '🏆', context: 'Palier abonnés, record historique' },
  { word: 'MACHINE', emoji: '⚙️', context: 'Série de régularité, uploads constants' },
  { word: 'MONSTRE', emoji: '📈', context: 'Palier revenu, deal sponsor signé' },
] as const

export const FORMAT_TAGS = {
  vlog: { label: 'Vlog', color: '#3B82F6' },
  tuto: { label: 'Tutoriel', color: '#10B981' },
  challenge: { label: 'Challenge', color: '#F59E0B' },
  reaction: { label: 'Réaction', color: '#EF4444' },
  podcast: { label: 'Podcast', color: '#8B5CF6' },
  short: { label: 'Short', color: '#EC4899' },
  collab: { label: 'Collaboration', color: '#06B6D4' },
  story: { label: 'Storytelling', color: '#F97316' },
  review: { label: 'Review', color: '#84CC16' },
  event: { label: 'Événement', color: '#14B8A6' },
  other: { label: 'Autre', color: '#6B7280' },
} as const

export const NAV_SECTIONS = [
  {
    label: 'ANALYTICS',
    items: [
      { id: 'overview', label: 'Vue d\'ensemble', icon: 'home', path: '/' },
      { id: 'videos', label: 'Vidéos', icon: 'video', path: '/videos' },
      { id: 'platforms', label: 'Plateformes', icon: 'bar-chart-3', path: '/compare' },
      { id: 'quadrant', label: 'Quadrant', icon: 'scatter-chart', path: '/quadrant' },
    ],
  },
  {
    label: 'CRÉATION',
    items: [
      { id: 'planner', label: 'Calendrier', icon: 'calendar', path: '/planner' },
      { id: 'ideas', label: 'Idées', icon: 'lightbulb', path: '/ideas' },
      { id: 'thumbnails', label: 'Thumbnails', icon: 'image', path: '/thumbnails' },
      { id: 'recycler', label: 'Recycler', icon: 'recycle', path: '/recycler' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { id: 'advisor', label: 'Conseiller IA', icon: 'message-circle', path: '/advisor' },
      { id: 'comments', label: 'Commentaires', icon: 'message-square', path: '/comments' },
      { id: 'trends', label: 'Tendances', icon: 'trending-up', path: '/trends' },
      { id: 'competitors', label: 'Concurrents', icon: 'users', path: '/competitors' },
    ],
  },
  {
    label: 'BUSINESS',
    items: [
      { id: 'sponsors', label: 'Sponsors', icon: 'handshake', path: '/sponsors' },
      { id: 'simulator', label: 'Simulateur', icon: 'calculator', path: '/simulator' },
    ],
  },
  {
    label: 'DONNÉES',
    items: [
      { id: 'import', label: 'Import CSV', icon: 'upload', path: '/import' },
    ],
  },
] as const
