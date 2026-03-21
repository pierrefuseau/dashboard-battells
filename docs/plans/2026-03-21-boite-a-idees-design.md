# Design — Boite a Idees BATTELLS

## Contexte

Baptiste (543K YouTube, ~500K TikTok) a besoin d'un radar de veille concurrentielle automatise qui detecte les videos virales dans sa niche (food content + entertainment/humor) partout dans le monde, et lui propose des adaptations version BATTELLS avec coaching IA.

### Utilisateurs
- **Baptiste** : consultation rapide, validation/rejet d'idees, ajout de ses notes
- **Pierrot** : analyse strategique, ajout manuel de liens reperes

### Scope thematique
Food content + entertainment/humor adaptable en food (recettes virales, challenges culinaires, taste tests, food hacks, defis 24h, storytelling food, formats viraux transposables).

---

## Architecture de la page `/idees`

### Zone haute : "Le Radar" (Detections chaudes)

Feed horizontal scrollable affichant les detections des dernieres 24-48h.

Chaque carte contient :
- Thumbnail de la video originale
- Nom de la chaine source + plateforme (YouTube/TikTok)
- Stats de surperformance ("+340% vs moyenne de la chaine")
- Indicateur de chaleur visuel (barre coloree jaune > orange > rouge)
- Date de detection

Bouton "Scanner maintenant" en haut a droite pour lancer une detection manuelle.
Bouton "Ajouter un lien" pour coller manuellement une URL YouTube/TikTok.

### Zone basse : "Le Kanban" (Pipeline de production)

Colonnes drag & drop :
1. **Backlog** — Idees brutes (detectees ou manuelles)
2. **Approuve** — Baptiste veut faire ca
3. **En ecriture** — Script/concept en cours
4. **Filme** — Tourne
5. **Monte** — Post-production
6. **Publie** — Sorti

Chaque carte kanban affiche :
- Titre adapte BATTELLS
- Format tag (badge colore)
- Thumbnail de la video source
- Estimation de vues IA
- Statut actuel

### Panneau detail (overlay droit)

Slide-in depuis la droite avec backdrop blur. Contient :
- Embed/thumbnail de la video source (lien vers YouTube/TikTok)
- Stats completes de la video originale
- Section "Pourquoi ca marche" — analyse IA en bullet points
- Section "Adaptation BATTELLS" — suggestion Claude (titre, angle, hook, role de Gustavo, format)
- Champ texte editable pour notes de Baptiste
- Bouton principal "Approuver l'idee"

---

## Sources de donnees

### Flux automatique (quotidien via n8n)
- Scraping des nouvelles videos des chaines surveillees
- Detection de surperformance (vues vs moyenne 30j de la chaine)
- Enrichissement IA (analyse du format, suggestion d'adaptation)
- Insert dans table `video_ideas` Supabase

### Ajout manuel
- Coller un lien YouTube/TikTok
- Le systeme enrichit automatiquement (stats, analyse, suggestion)

### Chaines surveillees (curees par l'IA)
Selection des chaines les plus performantes dans la niche, a affiner dans l'outil.
Categories : food content FR, food content international, shorts viraux food, entertainment/humor adaptable.

---

## Design visuel

### Le Radar (dark)
- Fond gradient anime dark (`--color-dark` > `--color-dark-secondary`), pulse lent
- Cartes glassmorphism dark (fond semi-transparent, border lumineuse proportionnelle a la chaleur)
- Nouvelles detections : slide-in depuis la droite avec stagger (framer-motion)
- Indicateur chaleur : barre verticale gauche, palette `--color-secondary` > `--color-primary` > `--color-error`
- Compteurs animes (react-spring) pour les stats
- Titre "DETECTIONS CHAUDES" en Bebas Neue tracking large

### Le Kanban (clair)
- Fond `--color-page` pour contraste avec le Radar
- Headers colonnes en Clash Display bold + compteur anime
- Cartes : fond `--color-surface`, radius `--radius-card`, shadow `--shadow-card` > `--shadow-card-hover` au hover
- Drag & drop : scale 1.02 + shadow prononcee, colonne cible teintee `--color-primary-50`
- Celebration uniquement sur passage a "Publie" (particules dorees)
- Format tags avec couleurs `FORMAT_TAGS` existantes

### Panneau detail
- Slide-in droite, backdrop blur
- Sections structurees avec separateurs subtils
- Bouton action en gradient primary anime

### Motion design
- Page enter : Radar slide-in haut, Kanban fade-up bas, stagger 100ms
- Cartes : entrance stagger au premier render
- Boutons : scale subtil au clic
- `prefers-reduced-motion` respecte partout
- Pas d'animation continue (sauf loading states)
- `ease-out` entrees, `ease-in` sorties, jamais `linear`

### Responsive
- Desktop : layout tel que decrit
- Tablet : Radar scroll horizontal maintenu, kanban en 3 colonnes visibles
- Mobile : Radar scroll vertical, kanban en accordeon par colonne

### Accessibilite
- Focus states visibles (outline `--color-primary` 2px offset)
- Contraste texte 4.5:1 minimum sur glassmorphism
- Navigation clavier complete
- Empty states pedagogiques ("Glisse une idee ici quand elle est approuvee")

---

## Stack technique

- **Frontend** : React 19 + TypeScript + Tailwind 4 + Framer Motion + React Spring
- **Drag & drop** : @dnd-kit/core (accessible, performant, React-native)
- **Backend** : Supabase (table `video_ideas` existante + nouvelles tables)
- **Scraping** : n8n workflow quotidien
- **IA** : Claude API via Supabase Edge Function (analyse + suggestions)

### Tables Supabase (nouvelles/modifiees)

**`watched_channels`** (nouvelle)
- id, platform, channel_id, channel_name, avg_views_30d, category, is_active, created_at

**`detected_videos`** (nouvelle)
- id, platform, video_url, title, channel_name, thumbnail_url, views, likes, comments
- overperformance_ratio, heat_score, detected_at, is_dismissed

**`video_ideas`** (existante, colonnes ajoutees)
- + detected_video_id (FK vers detected_videos)
- + ai_analysis (jsonb : pourquoi_ca_marche, adaptation_battells, hook_suggere, gustavo_role)
- + user_notes
- Modification status : 'backlog' | 'approved' | 'writing' | 'filmed' | 'editing' | 'published' | 'rejected'

---

## Decisions cles

- Pipeline independant du Calendrier existant (tout reste dans la boite a idees)
- Veille quotidienne automatique via n8n
- Claude comme coach IA pour l'adaptation
- Feed chaud + kanban = deux modes de consommation complementaires
- Polices existantes du design system (Bebas, Clash, Satoshi, Space Grotesk)
- Pas de couleurs pink/creator recommandees par l'outil — on garde la palette BATTELLS (orange/jaune/rouge food)
