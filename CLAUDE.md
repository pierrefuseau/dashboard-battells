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

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **dashboard-battells** (671 symbols, 1143 relationships, 20 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/dashboard-battells/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/dashboard-battells/context` | Codebase overview, check index freshness |
| `gitnexus://repo/dashboard-battells/clusters` | All functional areas |
| `gitnexus://repo/dashboard-battells/processes` | All execution flows |
| `gitnexus://repo/dashboard-battells/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
