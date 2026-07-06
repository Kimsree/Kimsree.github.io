# Personal Terminal — Portfolio (v1)

Portfolio one-page, thème "console de bord E.F.S.F." (terminal + cadre métal + LED),
bilingue FR/EN piloté par deux fichiers JSON.

## Structure du projet

```
index.html           -> squelette des 3 écrans (Welcome / Dashboard / Section)
css/style.css        -> tout le style (couleurs, cadre, LED, chanfreins, responsive)
js/script.js         -> navigation, chargement des langues, rendu des onglets
lang/en.json         -> tout le contenu texte en anglais
lang/fr.json         -> tout le contenu texte en français
assets/       -> tout les documents et images
```

Aucune donnée personnelle n'est écrite en dur dans le HTML : **tout le texte vient des
deux fichiers JSON**. Pour mettre à jour le site, tu n'as (presque) jamais besoin de
toucher au HTML/CSS/JS — seulement aux fichiers `lang/en.json` et `lang/fr.json`.

## Comment tester en local

⚠️ Important : les navigateurs bloquent `fetch()` sur des fichiers ouverts en
`file://` (double-clic sur index.html ne marchera pas pour charger les JSON).
Il faut servir le dossier via un petit serveur local :

```bash
cd portfolio
python3 -m http.server 8000
# puis ouvrir http://localhost:8000 dans le navigateur
```

(ou l'extension "Live Server" de VS Code, ou `npx serve`).

## Comment déployer sur GitHub Pages (username.github.io)

1. Crée un repo nommé exactement `username.github.io` (remplace par ton pseudo).
2. Mets tout le contenu de ce dossier (`index.html`, `css/`, `js/`, `lang/`) à la
   racine du repo.
3. Repo Settings → Pages → Branch: `main` / `root` → Save.
4. Le site sera en ligne sur `https://username.github.io` en 1-2 minutes.

Aucune étape de build : c'est du HTML/CSS/JS statique, GitHub Pages le sert tel quel.

## Personnaliser le contenu

Ouvre `lang/fr.json` (et son miroir `lang/en.json`) : chaque écran/onglet a
`heading`, `text`, et `bullets`. Remplace les `[texte entre crochets]` par tes
vraies infos. Garde la même structure (mêmes clés `id`) dans les deux fichiers,
sinon les onglets ne correspondront plus d'une langue à l'autre.

Exemple pour ajouter/retirer un onglet dans "Projects" : duplique un bloc
`{ "id": ..., "label": ..., ... }` dans les deux JSON avec le même `id`, le
JS génère les onglets automatiquement à partir de la liste — pas besoin de
toucher au HTML.

## Ajouter tes vraies images

Pour l'instant chaque section a un cadre "viewport" avec un visuel placeholder
(icône + "IMG // NO SIGNAL"), façon écran radar sans signal. Pour mettre une
vraie image :

1. Mets tes fichiers dans un dossier `img/`.
2. Dans `js/script.js`, fonction `selectTab()`, remplace le contenu de
   `.viewport-inner` par une balise `<img src="img/....jpg" alt="...">`
   (je peux te faire cette version si tu veux, avec fallback si l'image manque).

## Ce qui est déjà géré

- Un seul fichier HTML, navigation 100% en JS (pas de rechargement de page).
- Bilingue via JSON, bouton de langue sur l'écran d'accueil.
- Cadre métal avec rivets, bandeau de 3 LED clignotantes (PWR / NET / SYS).
- Chanfrein (coin coupé) répété sur tuiles / onglets / boutons comme signature visuelle.
- Bouton "Back" toujours présent (sauf écran d'accueil) : Section → Dashboard → Welcome.
- Message "tournez votre appareil" bloquant en mobile portrait (site pensé paysage).
- Compact automatiquement en mobile paysage bas (petits téléphones).
- `prefers-reduced-motion` respecté (coupe les animations si l'utilisateur le demande).

## Pistes pour une v2 (si tu veux itérer)

- Vraies photos/captures dans les "viewport".
- Vrai formulaire de contact (ou juste des liens mailto, déjà en place).
- Effet "machine à écrire" caractère par caractère sur le boot du terminal.
- Fichier CV en PDF téléchargeable réel.
