# Vente Privée Automobile — BMW Sélection Privée
**Examen Technique — Réflexion sur l'utilisation de l'IA**

---

## Structure des fichiers

```
vente-privee-auto/
├── index.html          # HTML seul (sans CSS ni JS embarqués)
├── styles.css          # Tout le CSS
├── validation.js       # Fonctions pures : escapeHTML, validateEmail, validatePhone…
├── script.js           # DOM, handlers, soumission formulaire (importe validation.js)
├── config.js           # Généré par build.js — JAMAIS commité
├── build.js            # Génère config.js depuis les variables d'environnement
├── package.json        # Scripts : npm run build, npm test
├── vercel.json         # Commande de build pour le déploiement Vercel
├── .env                # Clés EmailJS locales — JAMAIS commité
├── .env.example        # Template des variables d'environnement
├── favicon.svg         # Roundel BMW (SVG)
├── tests/
│   └── validation.test.js  # Tests Vitest (36 tests)
└── email-template.html # Template HTML de l'email de confirmation
```

---

## Lancer le site en local

**Prérequis :** Node.js installé.

```powershell
cd "C:\Files\Exam_technique\vente-privee-auto"
npm install
cp .env.example .env         # puis renseigner les clés dans .env
npm run build                # génère config.js avec vos clés
```

**Ouvrir le site :**
- **Option A** — Live Server (VS Code) : clic droit sur `index.html` → *Open with Live Server*
- **Option B** — Python : `python -m http.server 8080` puis `http://localhost:8080`

> Sans clés EmailJS configurées, le site fonctionne en **mode démo** : le formulaire se soumet, la page de confirmation s'affiche, mais aucun email n'est envoyé.

---

## Tests

```powershell
npm test
```

**36 tests** couvrent les fonctions de `validation.js` : `escapeHTML`, `validateEmail`, `validatePhone`, `validateName`, `validateDate`, `validateMessage`, `formatDate`.

---

## Déploiement Vercel

1. Pousser le projet sur GitHub
2. Connecter le dépôt à [vercel.com](https://vercel.com)
3. Dans **Settings → Environment Variables**, ajouter :
   - `EMAILJS_PUBLIC_KEY`
   - `EMAILJS_SERVICE_ID`
   - `EMAILJS_TEMPLATE_ID`
4. Vercel exécute automatiquement `npm install && node build.js` à chaque push (défini dans `vercel.json`)

**Rotation des clés recommandée :** si d'anciennes clés ont été exposées dans l'historique git, créez de nouvelles clés dans le dashboard EmailJS et invalidez les anciennes. Les clés révoquées dans l'historique ne présentent plus de risque.

---

## Template email (`email-template.html`)

Le fichier contient la mise en page HTML de l'email de confirmation. À coller dans le champ **"Email Content"** de votre template EmailJS (mode HTML). Variables remplacées automatiquement : `{{prenom}}`, `{{nom}}`, `{{date}}`, `{{creneau}}`, `{{modele}}`.

---

## Parcours utilisateur

```
Page d'accueil
    │
    ▼
① Hero section
   └─ Titre et informations de l'événement
   └─ Cliquer sur "Réserver Mon Créneau Privé" (ou scroller)
    │
    ▼
② Section Événement
   └─ Détails : dates, lieu, modèles disponibles (M3 CS · M5 CS · X5 M · M8 GC)
    │
    ▼
③ Formulaire de réservation
   └─ Prénom, Nom (lettres uniquement), Email, Téléphone (format FR)
   └─ Date (24 ou 25 mai 2026), Créneau, Modèle
   └─ Message optionnel (max 500 caractères)
   └─ Cliquer "Confirmer la Réservation"
    │
    ├─ [Champ invalide] → Message d'erreur spécifique + champ surligné en rouge
    │
    └─ [Formulaire valide]
        │
        ▼
④ Page de confirmation
   └─ Récapitulatif affiché (données échappées, protection XSS)
   └─ Email de confirmation envoyé (si EmailJS configuré)
   └─ Bouton "Nouvelle réservation"
```

---

## Mesures de cybersécurité

### 1. Protection des secrets — gestion des clés API

Les clés EmailJS ne sont jamais codées en dur dans le code source ni committées dans git.

- **`.env`** stocke les clés localement (gitignorée via `.gitignore`)
- **`build.js`** génère `config.js` à partir des variables d'environnement au moment du build
- **`config.js`** est lui aussi gitignorée — il n'existe que dans l'environnement d'exécution
- Sur Vercel, les clés sont injectées via **Settings → Environment Variables**, jamais dans le code
- En cas d'exposition accidentelle dans l'historique git : **rotation des clés** dans le dashboard EmailJS (les anciennes clés révoquées deviennent inutilisables, sans avoir à réécrire l'historique)

### 2. Prévention XSS (Cross-Site Scripting)

Toute donnée saisie par l'utilisateur est échappée avant affichage dans le DOM.

- La fonction `escapeHTML()` dans [`validation.js`](validation.js) neutralise les caractères spéciaux HTML (`<`, `>`, `"`, `'`, `&`) avant tout rendu
- La page de confirmation reconstruit le DOM via `createElement` / `textContent` plutôt que par injection directe dans `innerHTML` avec des données brutes
- Exemple de vecteur bloqué : saisir `<script>alert(1)</script>` comme prénom affiche le texte littéral, sans exécution

### 3. Content Security Policy (CSP)

Un en-tête CSP est déclaré dans [`index.html`](index.html) via une balise `<meta>` :

```
default-src 'self'
script-src 'self' https://cdn.jsdelivr.net
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src https://fonts.gstatic.com
connect-src https://api.emailjs.com
img-src 'self' https://mediapool.bmwgroup.com data:
```

Cette politique restreint les sources autorisées pour les scripts, styles, polices et requêtes réseau. Elle bloque l'injection de scripts depuis des domaines non listés.

### 4. Validation côté client

Les données du formulaire sont validées par des fonctions pures dans [`validation.js`](validation.js) avant toute soumission :

| Champ | Règle appliquée |
|-------|----------------|
| Prénom / Nom | Lettres uniquement (avec accents, tirets, apostrophes), 2–50 caractères |
| Email | Regex RFC-compliant (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) |
| Téléphone | Format français : `06 XX XX XX XX`, `+33XXXXXXXXX`, `0033XXXXXXXXX` |
| Date | Valeurs autorisées uniquement : `2026-05-24` ou `2026-05-25` (liste blanche stricte) |
| Message | Limité à 500 caractères (attribut HTML + contrôle JS) |

Chaque champ invalide affiche un message d'erreur spécifique et est surligné en rouge — sans révéler d'information système.

### 5. Métadonnées robots

La page déclare `<meta name="robots" content="noindex, nofollow">` pour éviter l'indexation par les moteurs de recherche — cohérent avec le caractère privé et sur invitation de l'événement.

---

## Qualité des prompts

Les prompts ont été rédigés avec un niveau de précision croissant au fil de la session. Le premier prompt posait un brief complet et structuré : type de page (landing page premium), références visuelles (BMW), liste exhaustive des fonctionnalités attendues (hero, formulaire, confirmation, email, responsive). Cette approche a permis à l'IA de produire une base solide dès la première génération, sans avoir à reformuler les intentions de fond (notamment en utilisant le mode Plan de claude code).

Les prompts suivants ont été progressivement plus ciblés : modification du template email, ajout d'images, changement de ton rédactionnel. Chaque demande portait sur un périmètre précis, ce qui a limité les effets de bord et les régressions non souhaitées.

---

## Réaction face aux bugs potentiels

Plusieurs situations à risque ont été rencontrées et traitées :

**Images Unsplash non garanties** : les premières URLs d'images pour les tuiles véhicules étaient des IDs Unsplash dont l'existence n'était pas certifiée. Anticipant des images cassées, une solution de repli CSS (`background-color: var(--card)`) a été mise en place dès la conception, rendant le rendu toujours acceptable même sans chargement d'image.

**Remplacement par des photos officielles** : plutôt que d'accepter des images génériques, une démarche proactive a consisté à interroger le portail officiel BMW Press (`press.bmwgroup.com`) via recherche web, extraire les photo IDs certifiés (P90492748, P90423697, P90495527, P90370710), vérifier que les URLs `mediapool.bmwgroup.com` servaient bien des JPEG sans authentification, puis remplacer les sources dans le code.

---

## Propreté du design

Le design suit une direction esthétique assumée et cohérente, nommée **"Salon Noir"** , l'univers d'une vente privée haut de gamme dans un hôtel particulier parisien. Chaque choix visuel découle de cette intention :

- **Palette restreinte** : obsidian `#08080F`, champagne gold `#C4A35A`, ivoire `#F2EDE4`. Trois couleurs, pas davantage, pour éviter la dispersion visuelle.
- **Typographie à deux niveaux** : Cormorant Garamond (serif élégant) pour les titres et les grandes masses textuelles ; Jost (géométrique, aérien) pour les labels, les formulaires et les micro-copies. Cette hiérarchie assure une lisibilité immédiate tout en maintenant le caractère premium.
- **Animations fonctionnelles** : les effets (rayons lumineux, dividers qui s'étendent, fade-in au scroll) ont chacun une justification narrative — ils évoquent les phares d'une BMW, la précision d'une montre de luxe. Aucune animation n'est purement décorative.
- **Email cohérent** : le template email respecte les mêmes contraintes de palette et de typographie, avec les limitations inhérentes aux clients mail (styles inline, `<table>`, pas d'animations). La cohérence visuelle est maintenue malgré ces contraintes.
- **Responsive réfléchi** : la grille passe de 2 colonnes à 1 colonne sur mobile, les tailles de texte utilisent `clamp()` pour une fluidité sans breakpoints rigides, et le formulaire adapte son grid naturellement.

---

## Méthodologie et réflexion

La démarche a suivi une progression logique en plusieurs phases :

**1. Planification avant exécution**  
Avant d'écrire la moindre ligne de code, une phase de plan a été conduite : choix de la stack (HTML/CSS/JS monofichier, sans build tool), du service d'email (EmailJS pour éviter un backend), de l'architecture des sections et de la direction artistique. Cette étape a permis d'aligner les attentes et d'éviter des refactors couteux en tokens.

**2. Itération incrémentale**  
Chaque fonctionnalité a été ajoutée séparément et vérifiée avant de passer à la suivante : d'abord la page, ensuite l'email, puis les images, puis le déploiement. Cette logique de petits incréments limite la surface d'erreur et facilite le débogage.

**3. Vérification des sources externes**  
Plutôt que d'utiliser des assets non vérifiés (images Unsplash au hasard), une recherche active sur le portail officiel BMW a été menée pour trouver des photos certifiées. L'URL de l'image a été testée avant d'être intégrée dans le code, confirmant qu'elle servait bien un JPEG sans authentification.

**4. Déploiement comme étape à part entière**  
Le déploiement sur Vercel via GitHub n'a pas été traité comme un détail final mais comme une étape structurée : initialisation git, commit propre, résolution du conflit de merge, connexion Vercel. Chaque sous-étape a été documentée et expliquée.

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Page web | HTML5 / CSS3 / JavaScript (ES Modules) |
| Polices | Google Fonts (Cormorant Garamond + Jost) |
| Email | EmailJS (envoi client-side, sans backend) |
| Images | BMW Press Club — mediapool.bmwgroup.com |
| Hébergement | Vercel (déploiement continu via GitHub) |
| Versionning | Git / GitHub |
| Tests | Vitest (36 tests unitaires) |

---

## Plugin Claude Code

| Plugin |
|------------|
| code-simplifier |
| context7 |
| frontend-design |
| playwright |
| superpowers |
