# Guide d'Intégration - Formulaire Popup SINO Shipping

Ce guide explique comment intégrer le formulaire de devis sur vos pages web en tant que popup.

## 🚀 Démarrage rapide

### Méthode 1: Intégration automatique (recommandée)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Page</title>
</head>
<body>
    <!-- Bouton avec intégration automatique -->
    <button data-quote-form>Demander un devis</button>
    
    <!-- Script d'intégration -->
    <script src="https://lucasarlot.github.io/sino-form/scripts/popup-integration.js"></script>
</body>
</html>
```

### Méthode 2: Intégration manuelle

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Page</title>
</head>
<body>
    <button id="openQuoteForm">Demander un devis</button>
    
    <!-- Script d'intégration -->
    <script src="https://lucasarlot.github.io/sino-form/scripts/popup-integration.js"></script>
    
    <script>
    document.getElementById('openQuoteForm').addEventListener('click', function() {
        openQuoteFormPopup({
            onFormSubmit: function(data) {
                console.log('Formulaire soumis:', data);
                // Traiter les données ici
            }
        });
    });
    </script>
</body>
</html>
```

## 📋 Options de configuration

### Options du popup

```javascript
const popup = new QuoteFormPopup({
    baseUrl: 'https://lucasarlot.github.io/sino-form',    // URL de base (par défaut)
    popupUrl: '/embed.html',                              // Chemin vers le popup (par défaut)
    width: 1200,                                          // Largeur du popup
    height: 800,                                         // Hauteur du popup
    onFormSubmit: function(data) {                       // Callback de soumission
        console.log('Données reçues:', data);
    },
    onClose: function() {                               // Callback de fermeture
        console.log('Popup fermé');
    },
    onError: function(error) {                          // Callback d'erreur
        console.error('Erreur:', error);
    },
    debug: false                                         // Mode debug
});
```

## 🎯 Exemples d'utilisation

### Exemple 1: Bouton simple

```html
<button id="quoteButton">Demander un devis</button>

<script>
document.getElementById('quoteButton').addEventListener('click', function() {
    openQuoteFormPopup({
        onFormSubmit: function(data) {
            alert('Merci pour votre demande !');
        }
    });
});
</script>
```

### Exemple 2: Lien avec gestion d'erreur

```html
<a href="#" id="quoteLink">Demander un devis</a>

<script>
document.getElementById('quoteLink').addEventListener('click', function(e) {
    e.preventDefault();
    
    try {
        openQuoteFormPopup({
            onFormSubmit: function(data) {
                // Envoyer les données à votre serveur
                fetch('/api/leads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
            }
        });
    } catch (error) {
        alert('Impossible d\'ouvrir le formulaire. Vérifiez que les popups ne sont pas bloquées.');
    }
});
</script>
```

### Exemple 3: Intégration avec data-attributes

```html
<!-- Configuration simple -->
<button data-quote-form>Demander un devis</button>

<!-- Configuration avancée -->
<button data-quote-form data-quote-form-config='{"width": 1400, "height": 900}'>
    Demander un devis
</button>

<script src="https://lucasarlot.github.io/sino-form/scripts/popup-integration.js"></script>
```

### Exemple 4: Popup avec données pré-remplies

```javascript
const popup = new QuoteFormPopup({
    onFormSubmit: function(data) {
        console.log('Données du formulaire:', data);
    }
});

// Ouvrir la popup
popup.open();

// Pré-remplir le formulaire (nécessite modification du composant)
popup.popup.postMessage({
    type: 'prefillData',
    data: {
        origin: 'France',
        destination: 'Chine',
        // ... autres données
    }
}, '*');
```

## 🔧 API avancée

### Méthodes de la classe QuoteFormPopup

```javascript
const popup = new QuoteFormPopup(options);

// Ouvrir le popup
popup.open();

// Fermer le popup
popup.close();

// Vérifier si le popup est ouvert
if (popup.isOpen) {
    console.log('Le popup est ouvert');
}
```

### Événements personnalisés

```javascript
const popup = new QuoteFormPopup({
    onFormSubmit: function(data) {
        // Traitement des données
        console.log('Données reçues:', data);
        
        // Exemple: envoi à un webhook
        fetch('https://votre-webhook.com/leads', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                source: 'popup',
                data: data,
                timestamp: new Date().toISOString()
            })
        });
    },
    
    onClose: function() {
        // Actions à effectuer à la fermeture
        console.log('Popup fermé');
        
        // Exemple: tracking analytics
        gtag('event', 'popup_closed', {
            event_category: 'engagement'
        });
    }
});
```

## 🎨 Personnalisation

### CSS personnalisé pour le popup

```css
/* Personnaliser l'apparence du popup */
.popup-container {
    border-radius: 16px !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
}

.popup-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
}

.popup-title {
    font-size: 20px !important;
    font-weight: 700 !important;
}
```

## 🔒 Sécurité

### Configuration CORS

Le script gère automatiquement la sécurité en vérifiant l'origine des messages.

### Validation des messages

```javascript
// Le script vérifie automatiquement l'origine des messages
window.addEventListener('message', function(event) {
    // Vérification automatique de l'origine
    if (event.origin !== 'https://lucasarlot.github.io') {
        return;
    }
    
    // Traiter le message
    console.log('Message reçu:', event.data);
});
```

## 📱 Responsive

Le popup s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : 1200x800px par défaut
- **Tablet** : 90% de la largeur/hauteur de l'écran
- **Mobile** : Plein écran

## 🐛 Dépannage

### Problèmes courants

1. **Popup bloquée** : Vérifiez que les popups ne sont pas bloquées dans le navigateur
2. **Erreur CORS** : Vérifiez que l'URL de base est correcte
3. **Messages non reçus** : Vérifiez que l'origine des messages est correcte

### Debug

```javascript
// Activer le mode debug
const popup = new QuoteFormPopup({
    debug: true, // Affiche les logs dans la console
    onFormSubmit: function(data) {
        console.log('Données reçues:', data);
    }
});
```

## 📞 Support

Pour toute question ou problème, consultez la documentation ou contactez l'équipe de développement.

## 🔗 Liens utiles

- [Exemple d'intégration simple](integration-simple.html)
- [Exemple d'intégration avancée](integration-example-popup.html)
- [Documentation complète](POPUP_INTEGRATION.md)
