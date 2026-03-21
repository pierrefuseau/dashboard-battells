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
      { id: 'quadrant', label: 'Quadrant', icon: 'scatter-chart', path: '/quadrant' },
    ],
  },
  {
    label: 'AUDIENCE',
    items: [
      { id: 'audience', label: 'Audience', icon: 'users', path: '/audience' },
      { id: 'traffic', label: 'Sources de trafic', icon: 'trending-up', path: '/trafic' },
    ],
  },
  {
    label: 'PRODUCTION',
    items: [
      { id: 'ideas', label: 'Boite a idees', icon: 'lightbulb', path: '/idees' },
      { id: 'calendar', label: 'Calendrier', icon: 'calendar', path: '/calendrier' },
    ],
  },
  {
    label: 'OUTILS',
    items: [
      { id: 'simulator', label: 'Simulateur', icon: 'calculator', path: '/simulateur' },
      { id: 'import', label: 'Import CSV', icon: 'upload', path: '/import' },
    ],
  },
] as const
