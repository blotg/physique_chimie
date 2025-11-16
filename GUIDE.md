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

## 📦 Assets statiques

Les scripts Three.js restent dans `public/js/`. Ils sont servis tels quels via `/js/...` et Vite les copie automatiquement dans le build. Pas besoin de les importer dans `src/`.

## ❓ Dépannage

- **Erreur Rollup "failed to resolve import /js/..."** : vérifiez que le script existe dans `public/js/` et que le chemin commence par `/js/`.
- **Le `<head>` ne s'affiche pas** : assurez-vous que le marqueur est bien présent et que le JSON est valide (guillemets doubles).
