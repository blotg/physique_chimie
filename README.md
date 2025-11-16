# Animations Physique-Chimie avec Deno, Vite et Three.js

Projet d'animations 3D interactives pour illustrer des concepts de physique-chimie.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Développement avec Vite (Recommandé)

Vite permet le hot-reload et sert les fichiers depuis `src/` et `public/` :

```bash
deno task vite:dev
```

Le serveur démarre sur http://localhost:8000

**Avantages :**
- Hot-reload automatique : les modifications sont visibles instantanément
- Sert les templates depuis `src/` et les assets depuis `public/`
- En-têtes HTML co-localisés dans `src/animations/`
- Workflow fluide pour le développement

### Développement avec Deno (Fichiers statiques)

Pour servir directement le dossier `public/` sans hot-reload :

```bash
deno task dev
```

### Build pour la production

Générer le dossier `dist/` prêt pour le déploiement :

```bash
deno task build
```

La commande lance Vite en mode production et produit une version entièrement statique dans `dist/`.

```bash
npm run preview
# ou
deno task vite:preview
```

## 📁 Structure du projet

```
physique_chimie/
├── deno.json              # Configuration Deno & tâches (dev/build)
├── package.json           # Dépendances Vite
├── vite.config.ts         # Config Vite (multi-pages + partials)
├── main.ts                # Petit serveur Deno (optionnel)
├── src/
│   ├── index.html         # Page d'accueil (template)
│   ├── partials/
│   │   └── head.html      # En-tête partagé (utilisé partout)
│   ├── animations/
│   │   ├── coordonnées-cartésiennes.html
│   │   ├── coordonnées-cylindriques.html
│   │   └── coordonnées-sphériques.html
│   └── js/                # Scripts Three.js (importés dans les pages)
│       ├── coordonnées-cartésiennes-point.js
│       ├── ...
│       └── utils.js
├── public/                # Assets statiques (CSS, images, favicon)
│   ├── css/
│   └── images/
└── dist/                  # Build Vite (généré par `deno task build`)
```

## 🎨 Modifier l'en-tête commun

Chaque page inclut maintenant un marqueur `<!-- #head {...} -->` qui est automatiquement remplacé par le fichier `src/partials/head.html` lors du build ou du dev server. Exemple :

```html
<!-- #head {"title":"Coordonnées cartésiennes - Animations 3D","animationsCss":true} -->
```

### Modifier le contenu de l'en-tête

1. Éditez `src/partials/head.html` (une seule fois)
2. Les modifications sont injectées dans toutes les pages
3. Vous pouvez ajuster le titre ou ajouter la feuille `animations.css` page par page via le JSON du marqueur (`"animationsCss": true`)

Consultez [GUIDE.md](GUIDE.md) pour les options disponibles.

## 📚 Ressources

- [Documentation Deno](https://docs.deno.com/)
- [Documentation Three.js](https://threejs.org/docs/)
- [Documentation Vite](https://vitejs.dev/)

## 🛠️ Technologies

- **Deno**: Runtime JavaScript/TypeScript moderne et sécurisé
- **Vite**: Build tool et dev server avec hot-reload
- **Three.js**: Bibliothèque 3D pour le web
- **HTML/CSS**: Interface utilisateur

## 📝 Animations disponibles

- ✅ Coordonnées cartésiennes (point)
- ✅ Coordonnées cylindriques (point, surface r, surface z)
- ✅ Coordonnées sphériques (point, surface r)

