# CLAUDE.md - BATTELLS Command Center

## Description
Dashboard analytics + IA + outils creatifs pour la chaine YouTube BATTELLS (@battells, 543K abonnes). Combine YouTube Analytics API, scraping TikTok/Instagram, intelligence artificielle (Claude API), et outils de planification de contenu.

## Stack
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS v4
- Backend/DB: Supabase (PostgreSQL + Auth + Edge Functions + Storage)
- IA: Claude API via Supabase Edge Functions
- Charts: Recharts
- Animations: Framer Motion
- Scraping: yt-dlp (TikTok) + instaloader (Instagram)
- Automatisation: n8n
- Deploiement: Netlify (auto-deploy GitHub)
- Polices: Clash Display, Satoshi (Fontshare) + Space Grotesk, JetBrains Mono (Google Fonts)

## Commandes
```bash
npm run dev          # Serveur dev Vite
npm run build        # Build production
npm run preview      # Preview du build
npm run lint         # ESLint
npx tsc --noEmit     # Type check
```

## Deploiement
- Repo: pierrefuseau/dashboard-battells
- Netlify: dashboard-battells.netlify.app
- Supabase: iikppeldebhhqliepudo (eu-west-3, Paris)
- n8n: n8n.srv778298.hstgr.cloud

## Architecture
```
src/
├── components/       # Composants UI reutilisables
│   ├── ui/           # Design system (Button, Card, Badge, etc.)
│   ├── charts/       # Composants graphiques (AreaChart, Gauge, Heatmap, etc.)
│   └── layout/       # Layout (Sidebar, Header)
├── pages/            # Pages du dashboard (Overview, Videos, Import, etc.)
├── hooks/            # Custom hooks (useYouTubeAPI, useSupabase, etc.)
├── lib/              # Utilitaires (supabase client, constants, formatters)
├── types/            # Types TypeScript
└── styles/           # Styles globaux, Tailwind CSS config
```

## Conventions
- Langue: Toujours repondre en francais
- Composants: Functional components avec hooks, pas de class components
- State: React hooks + Supabase real-time, pas de Redux
- Styling: Tailwind CSS v4 (@theme pour les tokens), pas de CSS-in-JS
- Imports: Absolus via @ alias (ex: @/components/ui/Button)
- Nommage: PascalCase pour les composants, camelCase pour les fonctions/variables
- Fichiers: Un composant par fichier, index.tsx pour les pages
- Types: Interfaces dans src/types/
- API: Toutes les requetes via lib/, jamais directement dans les composants
- Supabase: Client initialise dans lib/supabase.ts, requetes via hooks custom
- Animations: Framer Motion, pas de CSS animations manuelles
- Polices: JAMAIS de polices systeme (Inter, system-ui, sans-serif). TOUJOURS Clash Display / Satoshi / Space Grotesk

## YouTube API
- Profil principal: owner (youtube_token_owner.json + client_secrets_owner.json)
- Channel ID: UCkNv8s6MAtA_4dKIY-0Q2aw
- Acces: Data API v3 + Analytics API v2 (revenus, CTR, retention, demographics)

## Regles critiques
- TOUJOURS verifier que le build passe avant de commit
- Ne JAMAIS deployer sans verification
- Ne JAMAIS exposer les tokens/secrets en frontend (VITE_ prefix = public)
- Polices originales OBLIGATOIRES
- Motion design sur TOUS les composants interactifs
- Dark card motivationnelle avec le lexique BATTELLS (Dinguerie, Banger, etc.)
