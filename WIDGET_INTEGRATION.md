# 🚢 SINOFORM Widget - Guide d'intégration

## Vue d'ensemble

Le widget SINOFORM permet d'intégrer facilement le formulaire de devis de transport sur n'importe quelle page web. Il s'ouvre en popup responsive et charge le formulaire depuis notre serveur.

## 🚀 Intégration rapide

### 1. Ajouter le script

Copiez et collez ces deux lignes dans votre page HTML, juste avant la balise `</body>` :

```html
<script src="https://lucasarlot.github.io/sino-form/sino-form-widget.js"></script>
<button onclick="window.SinoForm.open()">📋 Obtenir un devis</button>
```

### 2. C'est tout !

Le widget est maintenant intégré. Cliquez sur le bouton pour ouvrir le formulaire en popup.

## 🎨 Personnalisation

### Bouton personnalisé

Vous pouvez utiliser n'importe quel élément HTML pour déclencher l'ouverture :

```html
<!-- Bouton personnalisé -->
<button class="my-custom-button" onclick="window.SinoForm.open()">
  Demander un devis de transport
</button>

<!-- Lien personnalisé -->
<a href="#" onclick="window.SinoForm.open(); return false;">
  Cliquez ici pour un devis
</a>

<!-- Image cliquable -->
<img src="devis-button.png" onclick="window.SinoForm.open()" 
     style="cursor: pointer;" alt="Obtenir un devis">
```

### Styles CSS pour votre bouton

```css
.my-custom-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.my-custom-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
```

## 📚 API JavaScript

### Méthodes disponibles

```javascript
// Ouvrir le formulaire
window.SinoForm.open();

// Fermer le formulaire
window.SinoForm.close();

// Vérifier si le formulaire est ouvert
if (window.SinoForm.isOpen()) {
  console.log('Le formulaire est ouvert');
}
```

### Exemple d'utilisation avancée

```html
<script>
// Ouvrir automatiquement après 5 secondes
setTimeout(() => {
  window.SinoForm.open();
}, 5000);

// Ouvrir sur scroll
window.addEventListener('scroll', () => {
  if (window.scrollY > 1000) {
    window.SinoForm.open();
  }
});

// Ouvrir sur sortie de souris (exit intent)
document.addEventListener('mouseleave', (e) => {
  if (e.clientY <= 0) {
    window.SinoForm.open();
  }
});
</script>
```

## 🎯 Fonctionnalités

### ✅ Responsive automatique
- S'adapte à tous les écrans (mobile, tablette, desktop)
- Breakpoints optimisés pour chaque taille d'écran
- Interface tactile sur mobile

### ✅ Accessibilité
- Navigation au clavier (Tab, Escape)
- Support des lecteurs d'écran
- Focus management
- Bouton de fermeture accessible

### ✅ Performance
- Chargement asynchrone
- Pas de conflit avec vos scripts existants
- Code minifié et optimisé
- Cache navigateur

### ✅ Sécurité
- Communication sécurisée avec le serveur
- Pas d'accès aux données de votre site
- HTTPS obligatoire

## 🔧 Configuration avancée

### Préchargement du formulaire

Pour améliorer les performances, vous pouvez précharger le formulaire :

```html
<script>
// Précharger le formulaire au chargement de la page
window.addEventListener('load', () => {
  // Le widget se charge automatiquement
  console.log('Widget SINOFORM prêt');
});
</script>
```

### Gestion des événements

```html
<script>
// Écouter l'ouverture du formulaire
const originalOpen = window.SinoForm.open;
window.SinoForm.open = function() {
  console.log('Formulaire ouvert');
  // Votre code personnalisé ici
  originalOpen();
};

// Écouter la fermeture du formulaire
const originalClose = window.SinoForm.close;
window.SinoForm.close = function() {
  console.log('Formulaire fermé');
  // Votre code personnalisé ici
  originalClose();
};
</script>
```

## 🌐 Compatibilité

### Navigateurs supportés
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile Safari 12+
- ✅ Chrome Mobile 60+

### Prérequis
- Aucun framework requis
- Fonctionne avec React, Vue, Angular, jQuery, ou HTML pur
- Compatible avec tous les CMS (WordPress, Drupal, etc.)

## 🐛 Dépannage

### Le formulaire ne s'ouvre pas

1. **Vérifiez la console** : Ouvrez les outils de développement (F12) et regardez s'il y a des erreurs
2. **Vérifiez la connexion** : Assurez-vous que votre site peut charger des ressources externes
3. **Testez l'URL** : Vérifiez que `https://lucasarlot.github.io/sino-form/sino-form-widget.js` est accessible

### Le formulaire ne se ferme pas

1. **Vérifiez les conflits CSS** : Assurez-vous qu'aucun CSS ne bloque le popup
2. **Testez les événements** : Vérifiez que les événements clavier et souris fonctionnent

### Problèmes de style

1. **Z-index** : Le popup utilise `z-index: 10000`. Si vous avez des éléments avec un z-index plus élevé, ils peuvent masquer le popup
2. **Overflow** : Assurez-vous que le body n'a pas `overflow: hidden` de manière permanente

## 📞 Support

Pour toute question ou problème :
- 📧 Email : [votre-email]
- 🐛 Issues : [GitHub Issues]
- 📖 Documentation : [lien vers la doc complète]

## 🔄 Mises à jour

Le widget se met à jour automatiquement. Aucune action requise de votre part.

---

**Version du widget :** 1.0.0  
**Dernière mise à jour :** $(date)  
**URL du widget :** https://lucasarlot.github.io/sino-form/sino-form-widget.js
