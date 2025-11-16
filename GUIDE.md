# Guide de développement

## ⚙️ Workflow

- **Développement** : `deno task vite:dev` (hot reload, remplacement automatique du `<head>`)
- **Build production** : `deno task build` (Vite génère `dist/`)
- **Preview production** : `deno task vite:preview`

## 🧩 En-tête partagé

Chaque page HTML contient un marqueur qui appelle le partial `src/partials/head.html` :

```html
<!-- #head {"title":"Coordonnées cartésiennes - Animations 3D","animationsCss":true} -->
```

Le JSON accepte aujourd'hui :

| Clé | Type | Description |
| --- | --- | --- |
| `title` | string | Titre de l'onglet |
| `animationsCss` | booléen | Ajoute `css/animations.css` quand `true` |

Pour modifier la structure de l'en-tête (meta, liens, etc.), éditez **une seule fois** `src/partials/head.html`.

## ➕ Ajouter une nouvelle page

1. Créez un fichier dans `src/` ou `src/animations/`
2. Ajoutez le marqueur `<!-- #head {...} -->`
3. Ajoutez votre contenu
4. Ajoutez l'entrée correspondante dans `vite.config.ts` (`htmlInputs`)
5. Relancez `deno task vite:dev` si nécessaire

## 📦 Scripts & assets

- Les scripts Three.js vivent désormais dans `src/js/` (mêmes noms de fichiers qu'avant). Comme ils sont sous `src/`, Vite les bundle automatiquement (tree-shaking, minification, HMR, etc.).
- Depuis les pages HTML de `src/animations/`, importez-les via un chemin relatif :

```html
<script type="module">
	import { initAnimation } from "../js/coordonnées-cartésiennes-point.js";
	initAnimation("animation-point");
</script>
```

- `public/` ne contient plus que les assets statiques purs (CSS, images, favicon...). Ils sont copiés tels quels dans `dist/`.

## ❓ Dépannage

- **Erreur Vite "Cannot import non-asset file /js/..."** : cela signifie qu'un import pointe encore vers l'ancien dossier `public/js`. Corrigez le chemin en `../js/...` (ou importez directement le module dans un fichier `.ts/.js`).
- **Le `<head>` ne s'affiche pas** : assurez-vous que le marqueur est bien présent et que le JSON est valide (guillemets doubles).
