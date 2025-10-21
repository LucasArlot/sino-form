# Formulaire de Devis Sino

Un formulaire moderne et responsive pour demander des devis de transport maritime, développé avec React, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

- **Interface multi-étapes** : Formulaire guidé avec navigation intuitive
- **Internationalisation** : Support multilingue (français/anglais)
- **Responsive Design** : Optimisé pour tous les appareils
- **Validation en temps réel** : Feedback immédiat sur les champs
- **Sélection de pays** : Interface intuitive pour choisir origine/destination
- **Gestion des ports** : Sélection dynamique des ports selon le pays
- **Mode embarqué** : Peut être intégré dans d'autres sites web

## 🛠️ Technologies

- **Frontend** : React 18 + TypeScript
- **Styling** : Tailwind CSS
- **Build Tool** : Vite
- **Icons** : Lucide React
- **Linting** : ESLint + Prettier
- **Testing** : Vitest

## 📦 Installation

```bash
# Cloner le projet
git clone https://github.com/lucasarlot/formulaire-sino.git
cd formulaire-sino

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## 🚀 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit la version de production
- `npm run build:embed` - Construit la version embarquée
- `npm run preview` - Prévisualise la version de production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run lint:fix` - Corrige automatiquement les erreurs de linting

## 🌐 Déploiement

Le projet peut être déployé sur n'importe quel service d'hébergement statique :

- **Vercel** : `vercel --prod`
- **Netlify** : Drag & drop du dossier `dist`
- **GitHub Pages** : Utiliser l'action GitHub Pages

## 📁 Structure du projet

```
src/
├── components/          # Composants réutilisables
├── features/           # Fonctionnalités métier
│   └── lead/          # Module de devis
├── hooks/             # Hooks personnalisés
├── lib/               # Utilitaires et helpers
├── shared/            # Composants partagés
└── styles/            # Fichiers CSS
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Lucas Arlot** - [@lucasarlot](https://github.com/lucasarlot)
# GitHub Pages Deployment
