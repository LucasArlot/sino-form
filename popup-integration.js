/**
 * Sino Form Popup Integration Script
 * Version: 1.0.0
 *
 * Usage:
 * <script src="https://lucasarlot.github.io/sino-form/popup-integration.js"></script>
 *
 * SinoFormPopup.open({
 *   onSuccess: (data) => console.log('Form submitted:', data),
 *   onClose: () => console.log('Popup closed')
 * });
 */

(function (global) {
  'use strict';

  // Configuration
  const CONFIG = {
    baseUrl: 'https://lucasarlot.github.io/sino-form',
    popupUrl: '/popup-simple.html', // Utiliser la version simple qui fonctionne
    popupId: 'sino-form-popup',
    overlayId: 'sino-form-overlay',
    iframeId: 'sino-form-iframe',
    zIndex: 999999,
    animationDuration: 300,
  };

  // CSS Styles for popup
  const POPUP_STYLES = `
    #${CONFIG.overlayId} {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: ${CONFIG.zIndex};
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity ${CONFIG.animationDuration}ms ease;
    }
    
    #${CONFIG.overlayId}.show {
      opacity: 1;
    }
    
    #${CONFIG.popupId} {
      position: relative;
      width: 95%;
      max-width: 1200px;
      height: 90vh;
      max-height: 800px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
      transform: scale(0.9) translateY(20px);
      transition: transform ${CONFIG.animationDuration}ms ease;
    }
    
    #${CONFIG.popupId}.show {
      transform: scale(1) translateY(0);
    }
    
    #${CONFIG.iframeId} {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }
    
    .sino-form-close {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: #666;
      z-index: 10;
      transition: all 0.2s ease;
    }
    
    .sino-form-close:hover {
      background: rgba(255, 255, 255, 1);
      color: #333;
      transform: scale(1.1);
    }
    
    .sino-form-close::before {
      content: '×';
      font-size: 24px;
      line-height: 1;
    }
    
    @media (max-width: 768px) {
      #${CONFIG.popupId} {
        width: 100%;
        height: 100%;
        max-height: none;
        border-radius: 0;
      }
      
      .sino-form-close {
        top: 10px;
        right: 10px;
        width: 35px;
        height: 35px;
        font-size: 18px;
      }
    }
  `;

  // Utility functions
  function injectStyles() {
    if (document.getElementById('sino-form-styles')) return;

    const style = document.createElement('style');
    style.id = 'sino-form-styles';
    style.textContent = POPUP_STYLES;
    document.head.appendChild(style);
  }

  function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    Object.assign(element, attributes);
    if (content) element.innerHTML = content;
    return element;
  }

  function removeElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  }

  function addEventListeners(overlay, popup, closeBtn, onClose) {
    // Close button click
    closeBtn.addEventListener('click', onClose);

    // Overlay click to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        onClose();
      }
    });

    // Escape key to close
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        document.removeEventListener('keydown', handleKeyDown);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
  }

  function removeEventListeners() {
    document.body.style.overflow = '';
  }

  function showPopup(overlay, popup) {
    // Force reflow
    overlay.offsetHeight;

    overlay.classList.add('show');
    popup.classList.add('show');
  }

  function hidePopup(overlay, popup, callback) {
    overlay.classList.remove('show');
    popup.classList.remove('show');

    setTimeout(() => {
      removeElement(CONFIG.overlayId);
      removeElement(CONFIG.popupId);
      removeEventListeners();
      if (callback) callback();
    }, CONFIG.animationDuration);
  }

  // Main popup class
  class SinoFormPopup {
    constructor() {
      this.isOpen = false;
      this.currentCallbacks = null;
    }

    open(options = {}) {
      if (this.isOpen) {
        console.warn('SinoFormPopup: Popup is already open');
        return;
      }

      this.currentCallbacks = {
        onSuccess: options.onSuccess || null,
        onClose: options.onClose || null,
        onError: options.onError || null,
      };

      this.createPopup();
      this.isOpen = true;
    }

    close() {
      if (!this.isOpen) return;

      const overlay = document.getElementById(CONFIG.overlayId);
      const popup = document.getElementById(CONFIG.popupId);

      if (overlay && popup) {
        hidePopup(overlay, popup, () => {
          this.isOpen = false;
          if (this.currentCallbacks && this.currentCallbacks.onClose) {
            this.currentCallbacks.onClose();
          }
          this.currentCallbacks = null;
        });
      }
    }

    createPopup() {
      // Inject styles
      injectStyles();

      // Create overlay
      const overlay = createElement('div', {
        id: CONFIG.overlayId,
      });

      // Create popup container
      const popup = createElement('div', {
        id: CONFIG.popupId,
      });

      // Create close button
      const closeBtn = createElement('button', {
        className: 'sino-form-close',
        title: 'Fermer',
      });

      // Create iframe
      const iframe = createElement('iframe', {
        id: CONFIG.iframeId,
        src: CONFIG.baseUrl + CONFIG.popupUrl,
        allow: 'camera; microphone; geolocation',
      });

      // Assemble popup
      popup.appendChild(closeBtn);
      popup.appendChild(iframe);
      overlay.appendChild(popup);
      document.body.appendChild(overlay);

      // Add event listeners
      addEventListeners(overlay, popup, closeBtn, () => this.close());

      // Show popup with animation
      setTimeout(() => showPopup(overlay, popup), 10);

      // Listen for messages from iframe
      this.setupMessageListener();
    }

    setupMessageListener() {
      const handleMessage = (event) => {
        // Security check - only accept messages from our domain
        if (event.origin !== CONFIG.baseUrl.replace('https://', '')) {
          return;
        }

        const { type, data } = event.data || {};

        switch (type) {
          case 'SINO_FORM_SUCCESS':
            if (this.currentCallbacks && this.currentCallbacks.onSuccess) {
              this.currentCallbacks.onSuccess(data);
            }
            this.close();
            break;

          case 'SINO_FORM_ERROR':
            if (this.currentCallbacks && this.currentCallbacks.onError) {
              this.currentCallbacks.onError(data);
            }
            break;

          case 'SINO_FORM_CLOSE':
            this.close();
            break;

          case 'SINO_FORM_READY':
            // Iframe is ready, can send initial data if needed
            console.log('Sino Form iframe is ready');
            break;
        }
      };

      window.addEventListener('message', handleMessage);

      // Store reference to remove listener later
      this.messageHandler = handleMessage;
    }

    // Public API methods
    static open(options = {}) {
      if (!window.SinoFormPopupInstance) {
        window.SinoFormPopupInstance = new SinoFormPopup();
      }
      window.SinoFormPopupInstance.open(options);
    }

    static close() {
      if (window.SinoFormPopupInstance) {
        window.SinoFormPopupInstance.close();
      }
    }

    static isOpen() {
      return window.SinoFormPopupInstance ? window.SinoFormPopupInstance.isOpen : false;
    }
  }

  // Expose to global scope
  global.SinoFormPopup = SinoFormPopup;

  // Auto-initialize if script is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('Sino Form Popup Integration loaded');
    });
  } else {
    console.log('Sino Form Popup Integration loaded');
  }
})(typeof window !== 'undefined' ? window : this);
