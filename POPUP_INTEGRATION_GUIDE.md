# 🚀 Guide d'Intégration SINO Form Popup

## Vue d'ensemble

Le système d'intégration popup permet d'intégrer facilement le formulaire SINO sur n'importe quel site web avec un seul script JavaScript. Le formulaire s'ouvre dans une popup élégante avec overlay sombre, sans éléments de page supplémentaires.

## 🎯 Fonctionnalités

- ✅ **Intégration en 1 ligne** : Un seul script à inclure
- ✅ **Popup élégante** : Overlay sombre + formulaire centré
- ✅ **Responsive** : Fonctionne sur mobile, tablette et desktop
- ✅ **Callbacks complets** : Écoutez les événements de soumission
- ✅ **Fermeture flexible** : Bouton X + clic en dehors + touche Escape
- ✅ **Communication bidirectionnelle** : Entre la popup et la page parent
- ✅ **Sécurité** : Vérification d'origine des messages
- ✅ **Performance** : Chargement optimisé et animations fluides

## 📦 Fichiers Requis

Pour utiliser l'intégration popup, vous devez avoir ces fichiers sur votre serveur :

```
sino-form/
├── popup-integration.js    # Script d'intégration principal
├── popup.html             # Page popup optimisée
└── dist/                  # Assets compilés (CSS, JS, etc.)
```

## 🚀 Intégration Rapide

### 1. Inclure le Script

Ajoutez cette ligne dans le `<head>` de votre page :

```html
<script src="https://lucasarlot.github.io/sino-form/popup-integration.js"></script>
```

### 2. Ouvrir le Formulaire

```html
<script>
SinoFormPopup.open({
  onSuccess: (data) => {
    console.log('Formulaire soumis:', data);
    // Rediriger vers une page de remerciement
    // window.location.href = '/merci';
  },
  onClose: () => {
    console.log('Formulaire fermé');
  }
});
</script>
```

### 3. Bouton de Déclenchement

```html
<button onclick="SinoFormPopup.open()">
  Demander un Devis
</button>
```

## 📋 API Complète

### `SinoFormPopup.open(options)`

Ouvre le formulaire en popup.

**Paramètres :**
- `options.onSuccess(data)` - Callback appelé lors de la soumission réussie
- `options.onClose()` - Callback appelé lors de la fermeture
- `options.onError(error)` - Callback appelé en cas d'erreur

**Exemple :**
```javascript
SinoFormPopup.open({
  onSuccess: (data) => {
    // Traiter les données du formulaire
    console.log('Données reçues:', data);
    
    // Rediriger vers une page de remerciement
    window.location.href = '/merci?ref=' + data.submissionId;
  },
  onClose: () => {
    // Actions à effectuer lors de la fermeture
    console.log('Formulaire fermé par l\'utilisateur');
  },
  onError: (error) => {
    // Gérer les erreurs
    console.error('Erreur du formulaire:', error);
    alert('Une erreur est survenue. Veuillez réessayer.');
  }
});
```

### `SinoFormPopup.close()`

Ferme le formulaire programmatiquement.

```javascript
SinoFormPopup.close();
```

### `SinoFormPopup.isOpen()`

Vérifie si le formulaire est actuellement ouvert.

```javascript
if (SinoFormPopup.isOpen()) {
  console.log('Le formulaire est ouvert');
}
```

## 🎨 Personnalisation

### Styles CSS

Le script injecte automatiquement ses styles. Pour les personnaliser, vous pouvez surcharger les classes CSS :

```css
/* Personnaliser l'overlay */
#sino-form-overlay {
  background: rgba(0, 0, 0, 0.8) !important;
}

/* Personnaliser la popup */
#sino-form-popup {
  border-radius: 20px !important;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4) !important;
}

/* Personnaliser le bouton de fermeture */
.sino-form-close {
  background: #ff6b6b !important;
  color: white !important;
}
```

### Configuration Avancée

```javascript
// Configuration personnalisée (optionnel)
const config = {
  baseUrl: 'https://lucasarlot.github.io/sino-form',
  popupUrl: '/popup.html',
  zIndex: 999999,
  animationDuration: 300
};

SinoFormPopup.open({
  onSuccess: (data) => {
    // Votre logique personnalisée
  }
});
```

## 📱 Responsive Design

Le système s'adapte automatiquement à tous les écrans :

- **Desktop (1920px+)** : Formulaire à 90% de la taille normale
- **Laptop (1440px+)** : Formulaire à 80% de la taille normale  
- **Tablette (1024px+)** : Formulaire à 75% de la taille normale
- **Mobile (<1024px)** : Formulaire en plein écran

## 🔒 Sécurité

- **Vérification d'origine** : Seuls les messages du domaine autorisé sont acceptés
- **CSP Compatible** : Respecte les Content Security Policies
- **HTTPS Requis** : Fonctionne uniquement en HTTPS
- **Isolation** : La popup est isolée dans un iframe

## 🚨 Gestion d'Erreurs

### Erreurs Communes

1. **Script non chargé**
   ```javascript
   if (typeof SinoFormPopup === 'undefined') {
     console.error('Script d\'intégration non chargé');
   }
   ```

2. **Popup déjà ouverte**
   ```javascript
   if (SinoFormPopup.isOpen()) {
     console.warn('Popup déjà ouverte');
     return;
   }
   ```

3. **Erreur de chargement**
   ```javascript
   SinoFormPopup.open({
     onError: (error) => {
       console.error('Erreur:', error);
       // Afficher un message à l'utilisateur
     }
   });
   ```

## 🧪 Tests et Débogage

### Console de Débogage

```javascript
// Activer les logs détaillés
window.SinoFormDebug = true;

SinoFormPopup.open({
  onSuccess: (data) => {
    console.log('✅ Soumission réussie:', data);
  },
  onError: (error) => {
    console.error('❌ Erreur:', error);
  }
});
```

### Vérification de l'État

```javascript
// Vérifier si le script est chargé
console.log('Script chargé:', typeof SinoFormPopup !== 'undefined');

// Vérifier l'état de la popup
console.log('Popup ouverte:', SinoFormPopup.isOpen());
```

## 📊 Exemples d'Intégration

### E-commerce

```html
<!-- Bouton sur une page produit -->
<button onclick="openQuoteForm()" class="btn btn-primary">
  Demander un Devis de Transport
</button>

<script>
function openQuoteForm() {
  SinoFormPopup.open({
    onSuccess: (data) => {
      // Envoyer les données à votre CRM
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Rediriger vers la page de remerciement
      window.location.href = '/merci';
    }
  });
}
</script>
```

### Landing Page

```html
<!-- CTA principal -->
<div class="hero">
  <h1>Transport International</h1>
  <p>Obtenez un devis personnalisé en 2 minutes</p>
  <button onclick="SinoFormPopup.open()" class="cta-button">
    Commencer Maintenant
  </button>
</div>
```

### Intégration WordPress

```php
// Dans votre template WordPress
function add_sino_form_script() {
    ?>
    <script src="https://lucasarlot.github.io/sino-form/popup-integration.js"></script>
    <script>
    function openSinoForm() {
        SinoFormPopup.open({
            onSuccess: (data) => {
                // Envoyer à votre CRM WordPress
                wp.ajax.post('save_lead', data);
            }
        });
    }
    </script>
    <?php
}
add_action('wp_footer', 'add_sino_form_script');
```

## 🔧 Maintenance

### Mise à Jour

Pour mettre à jour le script, remplacez simplement l'URL :

```html
<!-- Ancienne version -->
<script src="https://lucasarlot.github.io/sino-form/popup-integration.js?v=1.0.0"></script>

<!-- Nouvelle version -->
<script src="https://lucasarlot.github.io/sino-form/popup-integration.js?v=1.1.0"></script>
```

### Monitoring

```javascript
// Surveiller les performances
const startTime = performance.now();

SinoFormPopup.open({
  onSuccess: (data) => {
    const loadTime = performance.now() - startTime;
    console.log(`Formulaire chargé en ${loadTime}ms`);
    
    // Envoyer les métriques à votre analytics
    gtag('event', 'form_completion', {
      'load_time': loadTime,
      'submission_id': data.submissionId
    });
  }
});
```

## 📞 Support

Pour toute question ou problème :

1. **Vérifiez la console** pour les erreurs JavaScript
2. **Testez en local** avec le fichier `example-integration.html`
3. **Vérifiez la connectivité** vers `https://lucasarlot.github.io/sino-form/`
4. **Contactez le support** avec les détails de l'erreur

## 🎉 Félicitations !

Vous avez maintenant intégré le formulaire SINO sur votre site. Le système est :
- ✅ **Sécurisé** et **performant**
- ✅ **Responsive** sur tous les appareils  
- ✅ **Facile à maintenir** et **évolutif**

Vos utilisateurs peuvent maintenant demander des devis directement depuis votre site ! 🚀
