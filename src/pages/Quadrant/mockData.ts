export interface QuadrantVideo {
  id: string
  title: string
  views: number
  revenue: number
  format: string
  engagement: number
}

// Quadrant réaliste : revenus basés sur RPM ~3.50€ pour long-form, ~0.50€ pour shorts
// Engagement = (likes / views) × 100
export const quadrantVideos: QuadrantVideo[] = [
  // ── ÉTOILES (vues hautes + revenu haut) ────────────────────────
  { id: 'v1', title: 'BATTELLS x Squeezie : le duel en cuisine', views: 7_400_000, revenue: 25_900, format: 'challenge', engagement: 6.0 },
  { id: 'v2', title: 'Le Chapeau de Tacos le plus GRAND du monde', views: 9_100_000, revenue: 31_850, format: 'challenge', engagement: 5.7 },
  { id: 'v3', title: "Dégustation à l'aveugle : McDo vs Chef étoilé", views: 6_800_000, revenue: 23_800, format: 'challenge', engagement: 5.7 },
  { id: 'v4', title: 'Le burger à 500€ vs le burger à 5€', views: 5_600_000, revenue: 19_600, format: 'challenge', engagement: 5.4 },
  { id: 'v5', title: 'Je copie les recettes de Gordon Ramsay', views: 4_700_000, revenue: 16_450, format: 'challenge', engagement: 6.0 },

  // ── PÉPITES CACHÉES (vues moyennes + revenu haut / engagement fort) ──
  { id: 'v6', title: "On teste les pires recettes de l'IA", views: 5_200_000, revenue: 18_200, format: 'reaction', engagement: 6.0 },
  { id: 'v7', title: 'Je cuisine pour 100 inconnus dans la rue', views: 3_800_000, revenue: 13_300, format: 'vlog', engagement: 6.1 },
  { id: 'v8', title: 'Dégustation aveugle avec ma mère', views: 3_200_000, revenue: 11_200, format: 'reaction', engagement: 7.2 },
  { id: 'v9', title: 'Je survis 7 jours avec la bouffe du Moyen-Âge', views: 2_300_000, revenue: 9_200, format: 'story', engagement: 6.6 },
  { id: 'v10', title: "J'ai invité un chef japonais chez moi", views: 2_600_000, revenue: 10_400, format: 'collab', engagement: 6.5 },

  // ── FAISEURS DE REACH (vues hautes + revenu bas = shorts) ─────
  { id: 'v11', title: 'Pizza maison en 30 secondes', views: 8_500_000, revenue: 4_250, format: 'short', engagement: 7.3 },
  { id: 'v12', title: "L'oeuf parfait en slow-mo", views: 6_300_000, revenue: 3_150, format: 'short', engagement: 7.6 },
  { id: 'v13', title: 'Quand tu mets trop de piment', views: 5_600_000, revenue: 2_800, format: 'short', engagement: 7.3 },
  { id: 'v14', title: 'Pancake flip parfait', views: 4_100_000, revenue: 2_050, format: 'short', engagement: 8.5 },
  { id: 'v15', title: 'Bento magique en 45 secondes', views: 3_200_000, revenue: 1_600, format: 'short', engagement: 7.7 },

  // ── SOUS-PERFORMEURS (vues basses + revenu bas) ───────────────
  { id: 'v16', title: 'Recette du Boeuf Bourguignon de ma grand-mère', views: 1_400_000, revenue: 5_600, format: 'tuto', engagement: 7.0 },
  { id: 'v17', title: 'Comment faire le VRAI Croissant parisien', views: 1_800_000, revenue: 7_200, format: 'tuto', engagement: 6.7 },
  { id: 'v18', title: 'Mon avis HONNÊTE sur le Thermomix', views: 1_600_000, revenue: 6_400, format: 'review', engagement: 6.6 },
  { id: 'v19', title: 'Cooking the PERFECT Steak (English ver.)', views: 980_000, revenue: 3_920, format: 'tuto', engagement: 6.3 },
  { id: 'v20', title: 'Le PODCAST cuisine #12 — Avec Norbert Tarayre', views: 420_000, revenue: 1_680, format: 'other', engagement: 7.6 },

  // ── CONTENU RÉCENT (données en cours) ─────────────────────────
  { id: 'v21', title: 'Le sandwich le plus cher de Paris (250€)', views: 3_100_000, revenue: 10_850, format: 'vlog', engagement: 6.3 },
  { id: 'v22', title: 'Tier List des Fast Foods français', views: 4_700_000, revenue: 16_450, format: 'review', engagement: 6.0 },
  { id: 'v23', title: 'Je mange uniquement VIOLET pendant 24h', views: 3_500_000, revenue: 12_250, format: 'challenge', engagement: 5.6 },
  { id: 'v24', title: 'Street Food TOUR à Bangkok — 15 plats en 1 jour', views: 2_100_000, revenue: 8_400, format: 'vlog', engagement: 6.9 },
  { id: 'v25', title: 'Je reproduis le Ramen de Naruto en 24h', views: 4_200_000, revenue: 12_600, format: 'challenge', engagement: 5.0 },
  { id: 'v26', title: 'Recette secrète des Donuts des Simpsons', views: 2_900_000, revenue: 10_150, format: 'tuto', engagement: 6.0 },
  { id: 'v27', title: 'Ce geste change TOUT en pâtisserie', views: 3_200_000, revenue: 1_600, format: 'short', engagement: 7.7 },
  { id: 'v28', title: 'Évènement : BATTELLS au Salon de l\'Agriculture', views: 1_200_000, revenue: 4_800, format: 'other', engagement: 7.1 },
  { id: 'v29', title: 'Road trip culinaire en Italie', views: 2_400_000, revenue: 8_400, format: 'vlog', engagement: 6.5 },
  { id: 'v30', title: '10 astuces cuisine que j\'aurais aimé connaître', views: 900_000, revenue: 3_150, format: 'tuto', engagement: 8.2 },
]
