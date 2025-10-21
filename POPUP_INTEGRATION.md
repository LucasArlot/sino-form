# Intégration du Formulaire en Popup

Ce guide explique comment intégrer le formulaire de devis sur vos pages web en tant que popup.

## 🚀 Démarrage rapide

### 1. Inclure le script sur votre page

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ma Page</title>
</head>
<body>
    <!-- Votre contenu -->
    <button id="openQuoteForm">Demander un devis</button>
    
    <!-- Script d'intégration -->
    <script src="https://votre-domaine.com/scripts/popup-integration.js"></script>
</body>
</html>
```

### 2. Ouvrir le popup avec un bouton

```javascript
// Méthode simple
document.getElementById('openQuoteForm').addEventListener('click', function() {
    openQuoteFormPopup({
        baseUrl: 'https://votre-domaine.com',
        onFormSubmit: function(data) {
            console.log('Formulaire soumis:', data);
            // Traiter les données ici
        }
    });
});
```

## 📋 Options de configuration

### Options du popup

```javascript
const popup = new QuoteFormPopup({
    baseUrl: 'https://votre-domaine.com',    // URL de base de votre serveur
    popupUrl: '/popup.html',                 // Chemin vers le popup
    width: 1200,                             // Largeur du popup
    height: 800,                             // Hauteur du popup
    onFormSubmit: function(data) {           // Callback de soumission
        console.log('Données reçues:', data);
    },
    onClose: function() {                    // Callback de fermeture
        console.log('Popup fermé');
    }
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

### Exemple 3: Intégration avec un formulaire existant

```html
<form id="contactForm">
    <input type="text" name="name" placeholder="Nom" required>
    <input type="email" name="email" placeholder="Email" required>
    <button type="submit">Envoyer</button>
    <button type="button" id="quoteButton">Demander un devis</button>
</form>

<script>
// Ouvrir le popup de devis
document.getElementById('quoteButton').addEventListener('click', function() {
    openQuoteFormPopup({
        onFormSubmit: function(quoteData) {
            // Combiner avec les données du formulaire existant
            const formData = new FormData(document.getElementById('contactForm'));
            const combinedData = {
                contact: Object.fromEntries(formData),
                quote: quoteData
            };
            
            // Envoyer les données combinées
            fetch('/api/contact-with-quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(combinedData)
            });
        }
    });
});
</script>
```

### Exemple 4: Popup avec données pré-remplies

```javascript
// Ouvrir le popup avec des données pré-remplies
const popup = new QuoteFormPopup({
    onFormSubmit: function(data) {
        console.log('Données du formulaire:', data);
    }
});

// Pré-remplir le formulaire (nécessite modification du composant)
popup.open();
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

## 🎨 Personnalisation du style

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

Assurez-vous que votre serveur autorise les requêtes depuis vos domaines :

```javascript
// Exemple de configuration CORS pour Express.js
app.use(cors({
    origin: ['https://votre-domaine.com', 'https://autre-domaine.com'],
    credentials: true
}));
```

### Validation des messages

```javascript
// Vérifier l'origine des messages
window.addEventListener('message', function(event) {
    // Vérifier que le message vient de votre domaine
    if (event.origin !== 'https://votre-domaine.com') {
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
2. **Erreur CORS** : Vérifiez la configuration CORS de votre serveur
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
