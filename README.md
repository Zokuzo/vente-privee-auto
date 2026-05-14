# Vente Privée Automobile — BMW Sélection Privée
**Examen Technique — Réflexion sur l'utilisation de l'IA**

---

## Qualité des prompts

Les prompts ont été rédigés avec un niveau de précision croissant au fil de la session. Le premier prompt posait un brief complet et structuré : type de page (landing page premium), références visuelles (BMW), liste exhaustive des fonctionnalités attendues (hero, formulaire, confirmation, email, responsive). Cette approche a permis à l'IA de produire une base solide dès la première génération, sans avoir à reformuler les intentions de fond.

Les prompts suivants ont été progressivement plus ciblés : modification du template email, ajout d'images, changement de ton rédactionnel. Chaque demande portait sur un périmètre précis, ce qui a limité les effets de bord et les régressions non souhaitées.

**Point d'amélioration identifié** : le premier prompt sur l'email ne spécifiait pas assez le *type* d'email attendu (confirmation de RDV vs. formulaire d'évaluation). L'IA a produit un email de notation par étoiles, ce qui a nécessité une correction. Un prompt plus explicite — *"email de confirmation de rendez-vous, pas de feedback"* — aurait évité cette itération.

---

## Réaction face aux bugs potentiels

Plusieurs situations à risque ont été rencontrées et traitées :

**Fichier non créé** : lors de la première tentative de création du template email, le fichier `email-template.html` n'a pas été écrit sur le disque malgré un retour de succès de l'outil. Le bug a été détecté lors d'une vérification PowerShell (`Get-ChildItem`). La réaction a été de recréer le fichier sans panique, en conservant le contenu attendu.

**Images Unsplash non garanties** : les premières URLs d'images pour les tuiles véhicules étaient des IDs Unsplash dont l'existence n'était pas certifiée. Anticipant des images cassées, une solution de repli CSS (`background-color: var(--card)`) a été mise en place dès la conception, rendant le rendu toujours acceptable même sans chargement d'image.

**Remplacement par des photos officielles** : plutôt que d'accepter des images génériques, une démarche proactive a consisté à interroger le portail officiel BMW Press (`press.bmwgroup.com`) via recherche web, extraire les photo IDs certifiés (P90492748, P90423697, P90495527, P90370710), vérifier que les URLs `mediapool.bmwgroup.com` servaient bien des JPEG sans authentification, puis remplacer les sources dans le code.

**Conflit git** : lors du `git push`, une erreur `non-fast-forward` a été rencontrée car GitHub avait initialisé le dépôt avec un README. La solution appliquée — `git pull --allow-unrelated-histories` puis push — est la résolution standard, sans recours au force push qui aurait pu supprimer du contenu distant.

---

## Propreté du design

Le design suit une direction esthétique assumée et cohérente, nommée **"Salon Noir"** — l'univers d'une vente privée haut de gamme dans un hôtel particulier parisien. Chaque choix visuel découle de cette intention :

- **Palette restreinte** : obsidian `#08080F`, champagne gold `#C4A35A`, ivoire `#F2EDE4`. Trois couleurs, pas davantage, pour éviter la dispersion visuelle.
- **Typographie à deux niveaux** : Cormorant Garamond (serif élégant) pour les titres et les grandes masses textuelles ; Jost (géométrique, aérien) pour les labels, les formulaires et les micro-copies. Cette hiérarchie assure une lisibilité immédiate tout en maintenant le caractère premium.
- **Animations fonctionnelles** : les effets (rayons lumineux, dividers qui s'étendent, fade-in au scroll) ont chacun une justification narrative — ils évoquent les phares d'une BMW, la précision d'une montre de luxe. Aucune animation n'est purement décorative.
- **Email cohérent** : le template email respecte les mêmes contraintes de palette et de typographie, avec les limitations inhérentes aux clients mail (styles inline, `<table>`, pas d'animations). La cohérence visuelle est maintenue malgré ces contraintes.
- **Responsive réfléchi** : la grille passe de 2 colonnes à 1 colonne sur mobile, les tailles de texte utilisent `clamp()` pour une fluidité sans breakpoints rigides, et le formulaire adapte son grid naturellement.

---

## Méthodologie et réflexion

La démarche a suivi une progression logique en plusieurs phases :

**1. Planification avant exécution**  
Avant d'écrire la moindre ligne de code, une phase de plan a été conduite : choix de la stack (HTML/CSS/JS monofichier, sans build tool), du service d'email (EmailJS pour éviter un backend), de l'architecture des sections et de la direction artistique. Cette étape a permis d'aligner les attentes et d'éviter des refactors coûteux.

**2. Itération incrémentale**  
Chaque fonctionnalité a été ajoutée séparément et vérifiée avant de passer à la suivante : d'abord la page, ensuite l'email, puis les images, puis le déploiement. Cette logique de petits incréments limite la surface d'erreur et facilite le débogage.

**3. Vérification des sources externes**  
Plutôt que d'utiliser des assets non vérifiés (images Unsplash au hasard), une recherche active sur le portail officiel BMW a été menée pour trouver des photos certifiées. L'URL de l'image a été testée avant d'être intégrée dans le code, confirmant qu'elle servait bien un JPEG sans authentification.

**4. Déploiement comme étape à part entière**  
Le déploiement sur Vercel via GitHub n'a pas été traité comme un détail final mais comme une étape structurée : initialisation git, commit propre, résolution du conflit de merge, connexion Vercel. Chaque sous-étape a été documentée et expliquée.

**5. Séparation des responsabilités**  
Le code de la page (`index.html`) et le template email (`email-template.html`) sont deux fichiers distincts avec des contraintes techniques différentes. Cette séparation permet de modifier l'un sans risquer de casser l'autre, et reflète une logique de maintenabilité même sur un projet de démonstration.

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Page web | HTML5 / CSS3 / JavaScript vanilla |
| Polices | Google Fonts (Cormorant Garamond + Jost) |
| Email | EmailJS (envoi client-side, sans backend) |
| Images | BMW Press Club — mediapool.bmwgroup.com |
| Hébergement | Vercel (déploiement continu via GitHub) |
| Versionning | Git / GitHub |
