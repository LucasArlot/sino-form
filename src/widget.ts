// SinoForm Widget - Popup Integration Script
// This script creates a popup widget that loads the form from the embed page

interface SinoFormWidget {
  open(): void;
  close(): void;
  isOpen(): boolean;
}

class SinoFormPopup implements SinoFormWidget {
  private popup: HTMLElement | null = null;
  private iframe: HTMLIFrameElement | null = null;
  private isPopupOpen = false;

  constructor() {
    this.init();
  }

  private init(): void {
    // Create the popup HTML structure
    this.createPopupHTML();
    
    // Bind event listeners
    this.bindEvents();
  }

  private createPopupHTML(): void {
    // Check if popup already exists
    if (document.getElementById('sino-form-popup')) {
      this.popup = document.getElementById('sino-form-popup');
      this.iframe = this.popup?.querySelector('iframe') || null;
      return;
    }

    // Create popup container
    this.popup = document.createElement('div');
    this.popup.id = 'sino-form-popup';
    this.popup.className = 'sino-form-overlay';
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.className = 'sino-form-container';
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'sino-form-close';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Fermer le formulaire');
    
    // Create iframe
    this.iframe = document.createElement('iframe');
    this.iframe.className = 'sino-form-iframe';
    this.iframe.src = 'https://lucasarlot.github.io/sino-form/embed.html';
    this.iframe.title = 'Formulaire de devis SINOFORM';
    this.iframe.setAttribute('frameborder', '0');
    this.iframe.setAttribute('allowfullscreen', 'true');
    
    // Assemble the popup
    popupContent.appendChild(closeButton);
    popupContent.appendChild(this.iframe);
    this.popup.appendChild(popupContent);
    
    // Add to document
    document.body.appendChild(this.popup);
    
    // Add styles
    this.addStyles();
  }

  private addStyles(): void {
    // Check if styles already exist
    if (document.getElementById('sino-form-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'sino-form-styles';
    style.textContent = `
      .sino-form-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .sino-form-overlay.active {
        display: flex;
      }
      
      .sino-form-container {
        position: relative;
        width: 90%;
        max-width: 1200px;
        height: 90vh;
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: sino-form-fade-in 0.3s ease-out;
      }
      
      .sino-form-close {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s ease;
        font-weight: bold;
      }
      
      .sino-form-close:hover {
        background: rgba(0, 0, 0, 0.9);
      }
      
      .sino-form-iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      
      @keyframes sino-form-fade-in {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .sino-form-container {
          width: 95%;
          height: 95vh;
          border-radius: 8px;
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
    
    document.head.appendChild(style);
  }

  private bindEvents(): void {
    if (!this.popup) return;

    // Close button click
    const closeButton = this.popup.querySelector('.sino-form-close');
    closeButton?.addEventListener('click', () => this.close());

    // Overlay click to close
    this.popup.addEventListener('click', (e) => {
      if (e.target === this.popup) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isPopupOpen) {
        this.close();
      }
    });

    // Handle iframe load
    if (this.iframe) {
      this.iframe.addEventListener('load', () => {
        // Notify iframe of resize
        this.iframe?.contentWindow?.postMessage({ type: 'resize' }, '*');
      });
    }
  }

  public open(): void {
    if (!this.popup) return;
    
    if (this.isPopupOpen) return; // Prevent multiple opens
    
    this.isPopupOpen = true;
    this.popup.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll
    
    // Focus management for accessibility
    const closeButton = this.popup.querySelector('.sino-form-close') as HTMLElement;
    closeButton?.focus();
  }

  public close(): void {
    if (!this.popup || !this.isPopupOpen) return;
    
    this.isPopupOpen = false;
    this.popup.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore body scroll
  }

  public isOpen(): boolean {
    return this.isPopupOpen;
  }
}

// Initialize the widget
const sinoFormPopup = new SinoFormPopup();

// Expose global API
declare global {
  interface Window {
    SinoForm: SinoFormWidget;
  }
}

window.SinoForm = {
  open: () => sinoFormPopup.open(),
  close: () => sinoFormPopup.close(),
  isOpen: () => sinoFormPopup.isOpen()
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Widget is already initialized
  });
}
