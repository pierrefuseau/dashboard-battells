# BATTELLS Dashboard — Backlog Features

> Document de suivi des idees de features pour le dashboard BATTELLS.
> Classees par categorie et priorite.

---

## ANALYTICS AVANCES (au-dela de YouTube Studio)

### Revenue Optimizer
**Priorite : Haute** | Statut : A faire
Croisement format_tag x RPM x engagement x subscribersGained. Tableau comparatif : "Les videos format X rapportent 3x plus par vue que format Y". Scatter RPM vs Views par format. YouTube Studio ne fait jamais ce croisement.

### Viral Score & Prediction
**Priorite : Haute** | Statut : A faire
Score composite (0-100) par video base sur : ratio likes/views, shares/views, subscribersGained/views. Videos triees par potentiel viral. YouTube ne donne aucun score agrege.

### Meilleur jour/heure de publication
**Priorite : Moyenne** | Statut : A faire
Analyse des 625 videos par jour de semaine et heure de publication. Quel creneau performe le mieux en vues/engagement dans les 48h. Heatmap jour x heure.

### Shorts vs Long-form Dashboard
**Priorite : Haute** | Statut : A faire
Comparaison cote a cote avec KPIs dedies : RPM moyen, engagement moyen, subscribers gagnes par vue, revenue par minute produite.

### Bangers caches
**Priorite : Moyenne** | Statut : A faire
Videos avec un ratio engagement/vues anormalement eleve mais peu de vues. Contenu sous-exploite qui meriterait d'etre remis en avant ou decline.

### Courbe de croissance de la chaine
**Priorite : Haute** | Statut : A faire
Graphique interactif avec 363 jours de donnees quotidiennes : vues, revenus, abonnes cumules, avec annotations automatiques sur les pics.

---

## OUTILS DE CROISSANCE & CONTENU

### Calendrier editorial intelligent
**Priorite : CRITIQUE** | Statut : EN COURS
Calendrier avec suggestions de publication (jour/heure optimaux), alternance Shorts/Long, drag & drop, statuts (idee > script > tournage > montage > publie). Outil quotidien.

### Generateur d'idees IA contextuel
**Priorite : Haute** | Statut : A faire
L'IA analyse les 625 videos (titres, formats, performances) et genere des idees basees sur : ce qui marche chez Baptiste, tendances food du moment, et trous dans le catalogue.

### Optimiseur de titres & descriptions
**Priorite : Haute** | Statut : FAIT
Entrer un titre provisoire > comparaison aux patterns des titres les plus performants (longueur, mots-cles, structure) > 5 variantes optimisees. SEO descriptions YouTube.

### Recycleur de contenu
**Priorite : Haute** | Statut : A faire
Selectionner une video longue > identifier les moments forts (duree moy. visionnage, pics engagement) > suggestions de decoupes pour Shorts/Reels/TikToks > planifier dans le calendrier.

---

## CROSS-PLATFORM

### Hub multi-plateforme (YouTube + TikTok + Instagram)
**Priorite : Haute** | Statut : A faire
Un seul ecran avec performances de toutes les plateformes. Tables tiktok_videos et ig_posts deja en base Supabase. Comparaison cross-platform par contenu.

### Detecteur de tendances Food
**Priorite : Moyenne** | Statut : A faire
Scraping trending topics food sur YouTube, TikTok, Google Trends. Alertes : "Le mot-cle 'air fryer' explose cette semaine — tu n'as pas encore de video dessus."

### Benchmarking concurrence
**Priorite : Basse** | Statut : A faire
Suivi de 3-5 chaines food concurrentes : frequence, formats, sujets. Identifier les opportunites non couvertes par Baptiste.

---

## MONETISATION & BUSINESS

### Simulateur de revenus avance
**Priorite : Moyenne** | Statut : A faire
"Si je publie 2 Shorts/jour + 1 long/semaine pendant 6 mois, avec mon RPM actuel et ma croissance, combien je gagne ?" Courbes de projection.

### Tracker de deals sponsoring (CRM)
**Priorite : Moyenne** | Statut : A faire
Pipeline sponsors : contact > nego > signe > livre > paye. Table `sponsors` deja en base. Dashboard CA sponsoring vs AdSense.

---

## COMMUNAUTE & ENGAGEMENT

### Analyseur de commentaires IA
**Priorite : Basse** | Statut : A faire
Analyse sentimentale des commentaires. Idees de videos cachees dans les commentaires, questions recurrentes. "15 personnes ont demande ta recette de tiramisu ce mois-ci."

---

## Legende statuts
- **A faire** : Pas commence
- **EN COURS** : En developpement
- **FAIT** : Deploye et fonctionnel
- **ABANDONNE** : Idee ecartee (avec raison)
