export interface Trend {
  id: number
  name: string
  source: 'google' | 'tiktok' | 'youtube'
  sparkline: number[]
  status: 'opportunity' | 'covered'
}

export interface Character {
  id: number
  name: string
  emoji: string
  color: string
  score: number
}

export const trends: Trend[] = [
  { id: 1, name: 'Dubai Chocolate', source: 'tiktok', sparkline: [10, 25, 40, 65, 90, 95, 85], status: 'opportunity' },
  { id: 2, name: 'Mukbang ASMR', source: 'youtube', sparkline: [50, 55, 60, 58, 62, 70, 75], status: 'covered' },
  { id: 3, name: 'Recette anti-gaspi', source: 'google', sparkline: [5, 12, 20, 35, 50, 65, 80], status: 'opportunity' },
  { id: 4, name: 'Street food Corée', source: 'tiktok', sparkline: [30, 40, 55, 70, 80, 75, 72], status: 'covered' },
  { id: 5, name: 'Bento aesthetique', source: 'tiktok', sparkline: [15, 20, 30, 45, 60, 78, 90], status: 'opportunity' },
  { id: 6, name: 'Cuisine au feu de bois', source: 'youtube', sparkline: [20, 25, 30, 35, 40, 50, 55], status: 'opportunity' },
  { id: 7, name: 'Food truck challenge', source: 'google', sparkline: [60, 58, 55, 52, 50, 48, 45], status: 'covered' },
  { id: 8, name: 'Pâtisserie japonaise', source: 'tiktok', sparkline: [8, 15, 25, 40, 55, 70, 88], status: 'opportunity' },
]

export const characters: Character[] = [
  { id: 1, name: 'Ratatouille', emoji: '🍜', color: '#FF6B00', score: 5 },
  { id: 2, name: 'Pizza Planet', emoji: '🍕', color: '#E53935', score: 4 },
  { id: 3, name: 'Totoro Bento', emoji: '🍰', color: '#43A047', score: 4 },
  { id: 4, name: 'Taco Luchador', emoji: '🌮', color: '#F59E0B', score: 3 },
  { id: 5, name: 'Burger Boss', emoji: '🍔', color: '#8B5CF6', score: 5 },
  { id: 6, name: 'Donut Queen', emoji: '🍩', color: '#EC4899', score: 3 },
]
