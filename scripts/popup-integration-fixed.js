/**
 * Script d'intégration popup pour le formulaire de devis SINO Shipping
 * Version corrigée pour fonctionner avec embed.html existant
 * 
 * Usage:
 * 1. Inclure ce script sur votre page
 * 2. Appeler openQuoteFormPopup() pour ouvrir le formulaire
 * 
 * Exemple:
 * <script src="https://lucasarlot.github.io/sino-form/scripts/popup-integration-fixed.js"></script>
 * <script>
 *   document.getElementById('openForm').addEventListener('click', function() {
 *     openQuoteFormPopup({
 *       onFormSubmit: function(data) {
 *         console.log('Formulaire soumis:', data);
 *       }
 *     });
 *   });
 * </script>
 */

(function() {
    'use strict';

    // Configuration par défaut
    const DEFAULT_CONFIG = {
        baseUrl: 'https://lucasarlot.github.io/sino-form',
        popupUrl: '/embed.html',
        width: 1200,
        height: 800,
        onFormSubmit: null,
        onClose: null,
        onError: null,
        debug: false
    };

    // Classe principale pour gérer la popup
    class QuoteFormPopup {
        constructor(options = {}) {
            this.config = { ...DEFAULT_CONFIG, ...options };
            this.popup = null;
            this.isOpen = false;
            this.messageHandlers = new Map();
            
            this.log('QuoteFormPopup initialisé', this.config);
        }

        log(message, data = null) {
            if (this.config.debug) {
                console.log(`[QuoteFormPopup] ${message}`, data || '');
            }
        }

        open() {
            if (this.isOpen) {
                this.log('Popup déjà ouverte');
                return;
            }

            try {
                // Calculer les dimensions et position
                const dimensions = this.calculateDimensions();
                const position = this.calculatePosition(dimensions);
                
                // Options de la fenêtre
                const windowOptions = [
                    `width=${dimensions.width}`,
                    `height=${dimensions.height}`,
                    `left=${position.left}`,
                    `top=${position.top}`,
                    'scrollbars=yes',
                    'resizable=yes',
                    'toolbar=no',
                    'menubar=no',
                    'location=no',
                    'status=no'
                ].join(',');

                // URL complète du formulaire
                const formUrl = `${this.config.baseUrl}${this.config.popupUrl}`;
                
                this.log('Ouverture de la popup', { formUrl, dimensions, position });

                // Ouvrir la popup
                this.popup = window.open(formUrl, 'quoteFormPopup', windowOptions);
                
                if (!this.popup) {
                    throw new Error('Impossible d\'ouvrir la popup. Vérifiez que les popups ne sont pas bloquées.');
                }

                this.isOpen = true;
                this.setupEventListeners();
                this.focusPopup();

                this.log('Popup ouverte avec succès');

            } catch (error) {
                this.log('Erreur lors de l\'ouverture de la popup', error);
                this.handleError(error);
            }
        }

        close() {
            if (this.popup && !this.popup.closed) {
                this.popup.close();
            }
            this.cleanup();
        }

        calculateDimensions() {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            
            // Dimensions par défaut
            let width = this.config.width;
            let height = this.config.height;
            
            // Ajustement pour les petits écrans
            if (screenWidth < 1024) {
                width = Math.min(width, screenWidth - 40);
                height = Math.min(height, screenHeight - 40);
            }
            
            // Ajustement pour mobile
            if (screenWidth < 768) {
                width = screenWidth - 20;
                height = screenHeight - 20;
            }
            
            return { width, height };
        }

        calculatePosition(dimensions) {
            const screenWidth = window.screen.width;
            const screenHeight = window.screen.height;
            
            const left = Math.max(0, (screenWidth - dimensions.width) / 2);
            const top = Math.max(0, (screenHeight - dimensions.height) / 2);
            
            return { left, top };
        }

        focusPopup() {
            if (this.popup) {
                this.popup.focus();
            }
        }

        setupEventListeners() {
            // Écouter les messages de la popup
            this.messageHandler = (event) => {
                // Vérifier l'origine pour la sécurité
                const allowedOrigins = [
                    'https://lucasarlot.github.io',
                    'http://localhost:5173',
                    'http://localhost:3000'
                ];
                
                if (!allowedOrigins.some(origin => event.origin.startsWith(origin))) {
                    this.log('Message reçu d\'une origine non autorisée', event.origin);
                    return;
                }

                this.log('Message reçu de la popup', event.data);

                switch (event.data.type) {
                    case 'formSubmit':
                        this.handleFormSubmit(event.data.data);
                        break;
                    case 'formClose':
                        this.handleFormClose();
                        break;
                    case 'formError':
                        this.handleFormError(event.data.error);
                        break;
                    case 'popupReady':
                        this.handlePopupReady();
                        break;
                }
            };

            window.addEventListener('message', this.messageHandler);

            // Vérifier si la popup est fermée manuellement
            this.checkClosedInterval = setInterval(() => {
                if (this.popup && this.popup.closed) {
                    this.log('Popup fermée manuellement');
                    this.handleFormClose();
                }
            }, 1000);
        }

        handlePopupReady() {
            this.log('Popup prête');
            // La popup est chargée et prête
        }

        handleFormSubmit(data) {
            this.log('Formulaire soumis', data);
            
            if (this.config.onFormSubmit) {
                try {
                    this.config.onFormSubmit(data);
                } catch (error) {
                    this.log('Erreur dans le callback onFormSubmit', error);
                }
            }
        }

        handleFormClose() {
            this.log('Formulaire fermé');
            
            if (this.config.onClose) {
                try {
                    this.config.onClose();
                } catch (error) {
                    this.log('Erreur dans le callback onClose', error);
                }
            }
            
            this.cleanup();
        }

        handleFormError(error) {
            this.log('Erreur dans le formulaire', error);
            this.handleError(error);
        }

        handleError(error) {
            if (this.config.onError) {
                try {
                    this.config.onError(error);
                } catch (callbackError) {
                    this.log('Erreur dans le callback onError', callbackError);
                }
            } else {
                // Gestion d'erreur par défaut
                alert('Erreur lors de l\'ouverture du formulaire: ' + error.message);
            }
        }

        cleanup() {
            this.isOpen = false;
            
            if (this.messageHandler) {
                window.removeEventListener('message', this.messageHandler);
                this.messageHandler = null;
            }
            
            if (this.checkClosedInterval) {
                clearInterval(this.checkClosedInterval);
                this.checkClosedInterval = null;
            }
        }
    }

    // Fonction globale pour ouvrir la popup (méthode simple)
    window.openQuoteFormPopup = function(options = {}) {
        const popup = new QuoteFormPopup(options);
        popup.open();
        return popup;
    };

    // Exposer la classe pour usage avancé
    window.QuoteFormPopup = QuoteFormPopup;

    // Auto-initialisation si des éléments avec data-quote-form sont présents
    document.addEventListener('DOMContentLoaded', function() {
        const elements = document.querySelectorAll('[data-quote-form]');
        
        elements.forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                
                const options = {
                    onFormSubmit: function(data) {
                        console.log('Formulaire soumis:', data);
                    }
                };
                
                // Récupérer les options depuis les attributs data
                const configAttr = element.getAttribute('data-quote-form-config');
                if (configAttr) {
                    try {
                        const config = JSON.parse(configAttr);
                        Object.assign(options, config);
                    } catch (error) {
                        console.warn('Configuration invalide dans data-quote-form-config:', error);
                    }
                }
                
                openQuoteFormPopup(options);
            });
        });
    });

    // Log de chargement
    console.log('✅ Script d\'intégration popup SINO Shipping chargé (version corrigée)');

})();
