import { QuoteForm } from '@/features/lead';
import { QuoteFormProvider } from '@/features/lead/QuoteFormContext';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import '@/styles/main.css';

function PopupApp() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Attendre la fin de l'animation avant de fermer
    setTimeout(() => {
      if (window.parent && window.parent !== window) {
        // Si on est dans une iframe, envoyer un message au parent
        window.parent.postMessage({ type: 'closePopup' }, '*');
      } else {
        // Sinon, fermer la fenêtre
        window.close();
      }
    }, 300);
  };

  const handleFormSubmit = (data: Record<string, unknown>) => {
    // Envoyer les données au parent
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ 
        type: 'formSubmitted', 
        data 
      }, '*');
    }
  };

  return (
    <div
      className={`popup-container ${isVisible ? 'popup-visible' : 'popup-hidden'}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.3s ease-out',
      }}
    >
      <div className="popup-header">
        <h2 className="popup-title">Demande de devis</h2>
        <button 
          className="popup-close"
          onClick={handleClose}
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="popup-content">
        <QuoteFormProvider>
          <QuoteForm onFormSubmit={handleFormSubmit} />
        </QuoteFormProvider>
      </div>
    </div>
  );
}

export default PopupApp;
