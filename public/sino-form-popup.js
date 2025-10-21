/**
 * Sino Form Popup Integration Script
 * 
 * Ce script permet d'intégrer le formulaire de devis SINO Shipping
 * sur n'importe quelle page web via une popup.
 * 
 * Usage:
 * <script src="https://lucasarlot.github.io/sino-form/sino-form-popup.js"></script>
 * <button onclick="openSinoForm()">Demander un devis</button>
 */

(function() {
    'use strict';

    // Configuration par défaut
    const DEFAULT_CONFIG = {
        baseUrl: 'https://lucasarlot.github.io/sino-form',
        embedUrl: 'https://lucasarlot.github.io/sino-form/embed.html',
        width: '90vw',
        height: '90vh',
        maxWidth: '1200px',
        maxHeight: '800px',
        zIndex: 9999,
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animationDuration: '300ms'
    };

    /**
     * Classe principale pour gérer la popup du formulaire
     */
    class SinoFormPopup {
        constructor(options = {}) {
            this.config = { ...DEFAULT_CONFIG, ...options };
            this.isOpen = false;
            this.overlay = null;
            this.iframe = null;
            this.closeButton = null;
            this.messageHandler = null;
            
            // Bind des méthodes
            this.close = this.close.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleOverlayClick = this.handleOverlayClick.bind(this);
            this.handleMessage = this.handleMessage.bind(this);
        }

        /**
         * Ouvre la popup avec le formulaire
         */
        open() {
            if (this.isOpen) {
                return;
            }

            this.createOverlay();
            this.createIframe();
            this.createCloseButton();
            this.setupEventListeners();
            this.showPopup();
            
            this.isOpen = true;
            
            // Callback d'ouverture
            if (this.config.onOpen) {
                this.config.onOpen();
            }
        }

        /**
         * Ferme la popup
         */
        close() {
            if (!this.isOpen) {
                return;
            }

            this.hidePopup();
            this.cleanup();
            
            this.isOpen = false;
            
            // Callback de fermeture
            if (this.config.onClose) {
                this.config.onClose();
            }
        }

        /**
         * Crée l'overlay de fond
         */
        createOverlay() {
            this.overlay = document.createElement('div');
            this.overlay.className = 'sino-popup-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: ${this.config.overlayColor};
                z-index: ${this.config.zIndex};
                display: flex;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity ${this.config.animationDuration} ease;
                cursor: pointer;
            `;
            
            document.body.appendChild(this.overlay);
        }

        /**
         * Crée l'iframe contenant le formulaire
         */
        createIframe() {
            this.iframe = document.createElement('iframe');
            this.iframe.src = this.config.embedUrl;
            this.iframe.style.cssText = `
                width: ${this.config.width};
                height: ${this.config.height};
                max-width: ${this.config.maxWidth};
                max-height: ${this.config.maxHeight};
                border: none;
                border-radius: ${this.config.borderRadius};
                box-shadow: ${this.config.boxShadow};
                background: white;
                position: relative;
                z-index: ${this.config.zIndex + 1};
                transform: scale(0.95);
                transition: transform ${this.config.animationDuration} ease;
            `;
            
            this.overlay.appendChild(this.iframe);
        }

        /**
         * Crée le bouton de fermeture
         */
        createCloseButton() {
            this.closeButton = document.createElement('button');
            this.closeButton.innerHTML = '✕';
            this.closeButton.className = 'sino-popup-close';
            this.closeButton.style.cssText = `
                position: absolute;
                top: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                border: none;
                border-radius: 50%;
                background: rgba(0, 0, 0, 0.7);
                color: white;
                font-size: 18px;
                font-weight: bold;
                cursor: pointer;
                z-index: ${this.config.zIndex + 2};
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
                backdrop-filter: blur(10px);
            `;
            
            // Hover effects
            this.closeButton.addEventListener('mouseenter', () => {
                this.closeButton.style.background = 'rgba(0, 0, 0, 0.9)';
                this.closeButton.style.transform = 'scale(1.1)';
            });
            
            this.closeButton.addEventListener('mouseleave', () => {
                this.closeButton.style.background = 'rgba(0, 0, 0, 0.7)';
                this.closeButton.style.transform = 'scale(1)';
            });
            
            this.overlay.appendChild(this.closeButton);
        }

        /**
         * Configure les écouteurs d'événements
         */
        setupEventListeners() {
            // Fermeture par clic sur overlay
            this.overlay.addEventListener('click', this.handleOverlayClick);
            
            // Fermeture par clic sur bouton
            this.closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
            
            // Fermeture par clic sur iframe (ne ferme pas)
            this.iframe.addEventListener('click', (e) => {
                e.stopPropagation();
            });
            
            // Fermeture par touche ESC
            document.addEventListener('keydown', this.handleKeyDown);
            
            // Communication avec l'iframe
            this.messageHandler = this.handleMessage;
            window.addEventListener('message', this.messageHandler);
        }

        /**
         * Affiche la popup avec animation
         */
        showPopup() {
            // Force reflow
            this.overlay.offsetHeight;
            
            // Animation d'apparition
            this.overlay.style.opacity = '1';
            this.iframe.style.transform = 'scale(1)';
            
            // Focus sur le bouton de fermeture pour l'accessibilité
            setTimeout(() => {
                this.closeButton.focus();
            }, 100);
        }

        /**
         * Cache la popup avec animation
         */
        hidePopup() {
            this.overlay.style.opacity = '0';
            this.iframe.style.transform = 'scale(0.95)';
        }

        /**
         * Nettoie les éléments DOM et événements
         */
        cleanup() {
            // Supprimer les écouteurs d'événements
            document.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('message', this.messageHandler);
            
            // Supprimer l'overlay du DOM
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            
            // Réinitialiser les références
            this.overlay = null;
            this.iframe = null;
            this.closeButton = null;
            this.messageHandler = null;
        }

        /**
         * Gère les clics sur l'overlay
         */
        handleOverlayClick(e) {
            if (e.target === this.overlay) {
                this.close();
            }
        }

        /**
         * Gère les touches du clavier
         */
        handleKeyDown(e) {
            if (e.key === 'Escape') {
                this.close();
            }
        }

        /**
         * Gère les messages de l'iframe
         */
        handleMessage(event) {
            // Vérifier l'origine pour la sécurité
            if (event.origin !== this.config.baseUrl) {
                return;
            }

            const { type, data } = event.data || {};

            switch (type) {
                case 'sino-form-ready':
                    // Le formulaire est prêt
                    if (this.config.onFormReady) {
                        this.config.onFormReady();
                    }
                    break;

                case 'sino-form-submitted':
                    // Le formulaire a été soumis
                    if (this.config.onSubmit) {
                        this.config.onSubmit(data);
                    }
                    break;

                case 'sino-form-height-change':
                    // Ajuster la hauteur si nécessaire
                    if (data && data.height) {
                        this.iframe.style.height = Math.min(data.height, this.config.maxHeight) + 'px';
                    }
                    break;
            }
        }
    }

    /**
     * Fonction helper pour ouvrir rapidement la popup
     */
    function openSinoForm(options = {}) {
        const popup = new SinoFormPopup(options);
        popup.open();
        return popup;
    }

    // Exposer les fonctions globalement
    window.SinoFormPopup = SinoFormPopup;
    window.openSinoForm = openSinoForm;

    // Auto-initialisation si des éléments avec data-sino-form sont présents
    document.addEventListener('DOMContentLoaded', function() {
        const elements = document.querySelectorAll('[data-sino-form]');
        elements.forEach(element => {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                const options = {};
                
                // Récupérer les options depuis les data-attributes
                const onSubmit = element.getAttribute('data-on-submit');
                const onClose = element.getAttribute('data-on-close');
                
                if (onSubmit && window[onSubmit]) {
                    options.onSubmit = window[onSubmit];
                }
                if (onClose && window[onClose]) {
                    options.onClose = window[onClose];
                }
                
                openSinoForm(options);
            });
        });
    });

    // Styles CSS additionnels pour le responsive
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .sino-popup-overlay iframe {
                width: 95vw !important;
                height: 95vh !important;
                max-width: none !important;
                max-height: none !important;
                border-radius: 0 !important;
            }
            
            .sino-popup-close {
                top: 10px !important;
                right: 10px !important;
                width: 35px !important;
                height: 35px !important;
                font-size: 16px !important;
            }
        }
        
        @media (max-width: 480px) {
            .sino-popup-overlay iframe {
                width: 100vw !important;
                height: 100vh !important;
            }
        }
    `;
    document.head.appendChild(style);

})();
