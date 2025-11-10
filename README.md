# Animations Physique-Chimie avec Deno et Three.js

Projet d'animations 3D interactives pour illustrer des concepts de physique-chimie.

## 🚀 Démarrage rapide

### Lancer le serveur de développement
```bash
deno task dev
```

Le serveur sera accessible sur http://localhost:8000

### Lancer le serveur en production
```bash
deno task start
```

## 📁 Structure du projet

```
physique_chimie/
├── deno.json              # Configuration Deno et tâches
├── main.ts                # Serveur HTTP
├── main_test.ts           # Tests
└── public/                # Fichiers statiques
    ├── index.html         # Page d'accueil
    ├── css/
    │   └── style.css      # Styles CSS
    ├── js/                # Scripts JavaScript (futurs)
    └── animations/        # Pages d'animations
        └── exemple.html   # Animation exemple avec Three.js
```

## 🎨 Créer une nouvelle animation

1. Créez un nouveau fichier HTML dans `public/animations/`
2. Copiez la structure de `exemple.html` comme point de départ
3. Modifiez le code Three.js selon vos besoins
4. Ajoutez un lien vers votre animation dans `public/index.html`

## 📚 Ressources

- [Documentation Deno](https://docs.deno.com/)
- [Documentation Three.js](https://threejs.org/docs/)
- [Exemples Three.js](https://threejs.org/examples/)

## 🛠️ Technologies

- **Deno**: Runtime JavaScript/TypeScript moderne et sécurisé
- **Three.js**: Bibliothèque 3D pour le web
- **HTML/CSS**: Interface utilisateur

## 📝 Idées d'animations

- Mouvement des planètes (mécanique céleste)
- Atomes et molécules (chimie)
- Ondes et oscillations (physique ondulatoire)
- Champs électromagnétiques
- Réactions chimiques
- Et bien plus encore !
