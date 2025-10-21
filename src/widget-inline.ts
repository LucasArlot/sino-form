// SinoForm Widget Inline - Formulaire direct sans popup
// Ce script injecte directement le formulaire dans un élément de la page

interface SinoFormInline {
  inject(targetElement: string | HTMLElement): void;
  remove(): void;
  isInjected(): boolean;
}

class SinoFormInlineWidget implements SinoFormInline {
  private container: HTMLElement | null = null;
  private isInjectedFlag = false;

  constructor() {
    this.init();
  }

  private init(): void {
    this.addStyles();
  }

  private addStyles(): void {
    if (document.getElementById('sino-form-inline-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'sino-form-inline-styles';
    style.textContent = `
      .sino-form-inline {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: transparent;
        width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
        border: none;
        outline: none;
        position: relative;
      }
      
      .sino-form-inline * {
        box-sizing: border-box;
      }
      
      /* Styles pour masquer les éléments de page wrapper */
      .sino-form-inline .page-header,
      .sino-form-inline .page-footer,
      .sino-form-inline .navigation,
      .sino-form-inline .progress-bar,
      .sino-form-inline .timeline {
        display: none !important;
      }
      
      /* Assurer que le formulaire prend toute la place disponible */
      .sino-form-inline .quote-form {
        width: 100%;
        background: transparent;
        border: none;
        margin: 0;
        padding: 0;
      }
      
      /* Styles pour les étapes du formulaire */
      .sino-form-inline .form-step {
        width: 100%;
        background: transparent;
        border: none;
        margin: 0;
        padding: 20px;
      }
      
      /* Masquer les éléments de navigation de page */
      .sino-form-inline .step-navigation,
      .sino-form-inline .page-controls {
        display: none !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  public inject(targetElement: string | HTMLElement): void {
    // Trouver l'élément cible
    let target: HTMLElement;
    
    if (typeof targetElement === 'string') {
      target = document.querySelector(targetElement) as HTMLElement;
      if (!target) {
        console.error(`SinoForm: Element "${targetElement}" not found`);
        return;
      }
    } else {
      target = targetElement;
    }

    // Nettoyer l'élément cible
    target.innerHTML = '';
    target.className = 'sino-form-inline';

    // Créer l'iframe qui contiendra le formulaire
    const iframe = document.createElement('iframe');
    iframe.src = 'https://lucasarlot.github.io/sino-form/widget.html';
    iframe.style.cssText = `
      width: 100%;
      height: 600px;
      border: none;
      background: transparent;
    `;
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', 'true');

    target.appendChild(iframe);
    this.container = target;
    this.isInjectedFlag = true;
  }

  public remove(): void {
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    this.isInjectedFlag = false;
  }

  public isInjected(): boolean {
    return this.isInjectedFlag;
  }
}

// Initialize the widget
const sinoFormInline = new SinoFormInlineWidget();

// Expose global API
declare global {
  interface Window {
    SinoFormInline: SinoFormInline;
  }
}

window.SinoFormInline = {
  inject: (target: string | HTMLElement) => sinoFormInline.inject(target),
  remove: () => sinoFormInline.remove(),
  isInjected: () => sinoFormInline.isInjected()
};

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Widget is already initialized
  });
}
