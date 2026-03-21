export const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || 'UCkNv8s6MAtA_4dKIY-0Q2aw'

export const BATTELLS_LEXICON = [
  { word: 'DINGUERIE', emoji: '🔥', context: 'Viral performance, exceptional metric' },
  { word: 'BANGER', emoji: '💥', context: 'Video that significantly overperforms' },
  { word: 'MAGNIFICUS', emoji: '🌟', context: 'Outstanding achievement, milestone' },
  { word: 'ZINZIN', emoji: '⚡', context: 'Crazy growth rate, unexpected spike' },
  { word: 'LEGENDAIRE', emoji: '🏆', context: 'Subscriber milestone, historic best' },
  { word: 'MACHINE', emoji: '⚙️', context: 'Consistency streak, regular uploads' },
  { word: 'MONSTRE', emoji: '📈', context: 'Revenue milestone, sponsor deal' },
] as const

export const FORMAT_TAGS = {
  vlog: { label: 'Vlog', color: '#3B82F6' },
  tuto: { label: 'Tutoriel', color: '#10B981' },
  challenge: { label: 'Challenge', color: '#F59E0B' },
  reaction: { label: 'Reaction', color: '#EF4444' },
  podcast: { label: 'Podcast', color: '#8B5CF6' },
  short: { label: 'Short', color: '#EC4899' },
  collab: { label: 'Collaboration', color: '#06B6D4' },
  story: { label: 'Storytelling', color: '#F97316' },
  review: { label: 'Review', color: '#84CC16' },
  event: { label: 'Evenement', color: '#14B8A6' },
  other: { label: 'Autre', color: '#6B7280' },
} as const

export const NAV_SECTIONS = [
  {
    label: 'ANALYTICS',
    items: [
      { id: 'overview', label: 'Overview', icon: 'home', path: '/' },
      { id: 'videos', label: 'Videos', icon: 'video', path: '/videos' },
      { id: 'platforms', label: 'Plateformes', icon: 'bar-chart-3', path: '/compare' },
      { id: 'quadrant', label: 'Quadrant', icon: 'scatter-chart', path: '/quadrant' },
    ],
  },
  {
    label: 'CREATION',
    items: [
      { id: 'planner', label: 'Calendrier', icon: 'calendar', path: '/planner' },
      { id: 'ideas', label: 'Idees', icon: 'lightbulb', path: '/ideas' },
      { id: 'thumbnails', label: 'Thumbnails', icon: 'image', path: '/thumbnails' },
      { id: 'recycler', label: 'Recycler', icon: 'recycle', path: '/recycler' },
    ],
  },
  {
    label: 'INTELLIGENCE',
    items: [
      { id: 'advisor', label: 'IA Advisor', icon: 'message-circle', path: '/advisor' },
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
    label: 'DONNEES',
    items: [
      { id: 'import', label: 'Import CSV', icon: 'upload', path: '/import' },
    ],
  },
] as const
