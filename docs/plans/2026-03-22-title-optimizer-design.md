# Design : Title & Description Optimizer — "Le Labo"

> Approuve le 2026-03-22

## Positionnement

- Nouvelle page dediee `/labo` dans la sidebar (section PRODUCTION)
- Acces rapide depuis Ideas (bouton sur idee approuvee) et Calendar (bouton sur item)
- Icone : beaker/flask (lucide: `FlaskConical`)

## Layout : Mode Workshop Full-Screen (3 panneaux)

```
┌──────────────────────────────────────────────────────────────────┐
│ LE LABO — Title & Description Optimizer                    [⛶]  │
├────────────┬─────────────────────┬───────────────────────────────┤
│  INPUT     │  INTELLIGENCE       │  OUTPUT & PREVIEW             │
│  PANEL     │  PANEL              │                               │
│            │                     │  Previews multi-plateforme    │
│  Titre     │  Score 0-100        │  - YouTube Search             │
│  Desc      │  Breakdown          │  - YouTube Home               │
│  Tags      │  Patterns gagnants  │  - TikTok Feed                │
│  Format    │  Title Gap          │  - Instagram Feed             │
│  Platform  │  Concurrence        │                               │
│            │                     │  Description generee          │
│  Variantes │                     │  Tags + Hashtags              │
│  IA (5)    │                     │  Hook 3 sec                   │
│            │                     │                               │
│  A/B Test  │                     │                               │
│  Predictif │                     │                               │
├────────────┴─────────────────────┴───────────────────────────────┤
│ HISTORIQUE DES OPTIMISATIONS                            [Filtrer]│
└──────────────────────────────────────────────────────────────────┘
```

## Panneau 1 — INPUT (gauche)

### Zone de saisie
- Titre provisoire (textarea, compteur chars, seuils colores 0-60-70-100)
- Description brute (textarea libre)
- Format tag (dropdown : Short, Long, Challenge, Tuto, Vlog, etc.)
- Plateforme cible (toggle multi : YouTube / TikTok / Instagram / Toutes)
- Type de contenu (Recette, Defi, Reaction, Vlog, Storytelling)
- Mot-cle principal (optionnel, force un axe SEO)
- Checkbox "Gustavo dans la video"

### Variantes IA (5 titres generes)
- Chaque variante = titre cliquable qui remplace l'input
- Badge score (0-100) + indicateur style (Emotionnel, SEO, Clickbait, Narratif, Minimaliste)
- Bouton "Regenerer" par variante
- Bouton "Regenerer tout"

### A/B Testing predictif
- Selectionner 2-3 titres → IA predit le gagnant avec % confiance
- Radar chart comparatif (CTR estime, engagement, retention, reach)
- Explication textuelle du choix

## Panneau 2 — INTELLIGENCE (centre)

### Score de titre (0-100) avec breakdown
| Critere | Description |
|---------|-------------|
| Longueur | Zone ideale 50-65 chars |
| Emotion | Mots declencheurs de curiosite/excitation |
| Curiosite | Structure question, suspense, revelation |
| SEO | Mot-cle en position forte |
| Clickbait calibre | Promesse forte mais tenable |
| Coherence marque | Style BATTELLS reconnaissable |

### Patterns gagnants de Baptiste
- Top 10 mots-cles les plus performants (vues moy quand present vs absent)
- Longueur optimale de titre (basee sur 625+ videos)
- Structures qui surperforment (Question, Liste, Defi, Exclamation)
- Heures de publication optimales par format

### Title Gap Analysis
- Mots-cles food populaires que Baptiste n'a JAMAIS utilises
- Volume estime + score d'opportunite
- Suggestion de video pour chaque gap

### Donnees concurrence
- Titres performants des detected_videos matchant le sujet
- Differences d'approche des concurrents sur ce theme

## Panneau 3 — OUTPUT & PREVIEW (droite)

### Previews multi-plateforme temps reel
1. **YouTube Search** — Rendu resultat de recherche (thumbnail, titre tronque, channel, vues, date)
2. **YouTube Home** — Rendu suggestion homepage (thumbnail large, titre 2 lignes, avatar)
3. **TikTok Feed** — Rendu mobile portrait (caption overlay, hashtags)
4. **Instagram Feed** — Rendu caption sous image (2 lignes + "...voir plus")

### Description generee (package complet)
- 2-3 premieres lignes SEO optimisees
- Corps structure
- Timestamps auto-generes (si longform)
- Tags YouTube (15-20, mix broad + niche)
- Hashtags (3 YouTube, 30 Instagram, 5-7 TikTok)
- Liens sociaux pre-remplis BATTELLS
- CTA adapte a la plateforme
- Section "A propos" standardisee

### Hook des 3 premieres secondes
- Texte du hook suggere
- Coherence hook <-> titre (score de match)
- 3 variantes de hook

## Base de donnees

```sql
CREATE TABLE title_optimizations (
  id SERIAL PRIMARY KEY,
  original_title TEXT NOT NULL,
  optimized_title TEXT,
  description_generated TEXT,
  tags_generated TEXT[],
  hashtags JSONB, -- {youtube: [], tiktok: [], instagram: []}
  platform TEXT[] DEFAULT '{youtube}',
  format_tag TEXT,
  content_type TEXT,
  score INTEGER, -- 0-100
  score_breakdown JSONB,
  variants JSONB, -- [{title, score, style}]
  ab_test_result JSONB,
  hook_suggestions TEXT[],
  title_gaps JSONB,
  pattern_insights JSONB,
  -- Tracking post-publication
  video_idea_id INTEGER REFERENCES video_ideas(id),
  calendar_item_id INTEGER REFERENCES content_calendar(id),
  youtube_video_id TEXT REFERENCES yt_videos(id),
  published_title TEXT,
  actual_ctr REAL,
  actual_views INTEGER,
  prediction_accuracy REAL,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);
```

## Edge Function — optimize-title

- Modele : Gemini 2.5 Pro (coherence avec analyze-video)
- Contexte injecte : top 50 titres Baptiste + metriques, patterns statistiques pre-calcules, detected_videos pertinents, tendances food
- Retourne JSON structure : score, variantes, description, tags, hooks, gaps

## Integrations
- **Ideas** : bouton "Optimiser le titre" sur idee approuvee → Le Labo pre-rempli
- **Calendar** : bouton "Optimiser" sur item → Le Labo pre-rempli
- **Historique** : tableau bas de page, tracking perf reelle vs predite

## Navigation sidebar
```
PRODUCTION
├── Boite a idees
├── Le Labo          ← NOUVEAU (FlaskConical)
└── Calendrier
```

## Stack technique
- React 18 + TypeScript + Tailwind CSS
- Framer Motion (animations)
- Recharts (radar chart A/B test)
- Supabase Edge Function (Gemini 2.5 Pro)
- Hooks custom : useVideoPatterns, useTitleOptimizer
