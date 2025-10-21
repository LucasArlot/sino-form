import { QuoteForm } from '@/features/lead';
import { QuoteFormProvider } from '@/features/lead/QuoteFormContext';
import { useEffect, useState } from 'react';
import '@/styles/main.css';

interface PopupAppProps {
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
  onClose?: () => void;
}

function PopupApp({ onSuccess, onError, onClose }: PopupAppProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Système de scaling responsive pour popup
    function applyResponsiveScaling() {
      let parentWidth;

      try {
        // Essayer de détecter la largeur de l'écran parent
        if (window.parent && window.parent !== window) {
          parentWidth = window.parent.innerWidth;
        } else if (window.top && window.top !== window) {
          parentWidth = window.top.innerWidth;
        } else {
          parentWidth = window.screen.width;
        }
      } catch {
        // Fallback si on ne peut pas accéder au parent
        parentWidth = window.screen.width;
      }

      let newScale = 1;

      // Breakpoints de scaling optimisés pour popup
      if (parentWidth >= 2560) {
        newScale = 1; // 100% - taille optimale pour 32"
      } else if (parentWidth >= 1920) {
        newScale = 0.9; // 90% pour 27" (légèrement plus grand en popup)
      } else if (parentWidth >= 1440) {
        newScale = 0.8; // 80% pour 24"
      } else if (parentWidth >= 1024) {
        newScale = 0.75; // 75% pour tablettes
      } else {
        newScale = 1; // 100% pour mobile (pas de scaling)
      }

      setScale(newScale);
    }

    // Appliquer le scaling au chargement
    applyResponsiveScaling();

    // Réappliquer le scaling si la fenêtre est redimensionnée
    window.addEventListener('resize', applyResponsiveScaling);

    // Écouter les messages du parent pour les mises à jour
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'resize') {
        applyResponsiveScaling();
      }
    };

    window.addEventListener('message', handleMessage);

    // Gérer les événements de communication avec le parent
    const handleFormSuccess = (data: unknown) => {
      if (onSuccess) {
        onSuccess(data);
      }
      
      // Envoyer un message au parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'SINO_FORM_SUCCESS',
          data: data
        }, '*');
      }
    };

    const handleFormError = (error: unknown) => {
      if (onError) {
        onError(error);
      }
      
      // Envoyer un message au parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'SINO_FORM_ERROR',
          data: error
        }, '*');
      }
    };

    const handleFormClose = () => {
      if (onClose) {
        onClose();
      }
      
      // Envoyer un message au parent
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'SINO_FORM_CLOSE'
        }, '*');
      }
    };

    // Écouter les événements personnalisés du formulaire
    const handleSinoFormSuccess = (event: CustomEvent) => {
      handleFormSuccess(event.detail);
    };

    const handleSinoFormError = (event: CustomEvent) => {
      handleFormError(event.detail);
    };

    const handleSinoFormClose = () => {
      handleFormClose();
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('SinoFormSuccess', handleSinoFormSuccess as EventListener);
    document.addEventListener('SinoFormError', handleSinoFormError as EventListener);
    document.addEventListener('SinoFormClose', handleSinoFormClose);

    // Notifier le parent que l'iframe est prête
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'SINO_FORM_READY'
      }, '*');
    }

    return () => {
      window.removeEventListener('resize', applyResponsiveScaling);
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('SinoFormSuccess', handleSinoFormSuccess as EventListener);
      document.removeEventListener('SinoFormError', handleSinoFormError as EventListener);
      document.removeEventListener('SinoFormClose', handleSinoFormClose);
    };
  }, [onSuccess, onError, onClose]);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
        transition: 'transform 0.3s ease',
        width: '100%',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: 'white',
      }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        <QuoteFormProvider>
          <QuoteForm />
        </QuoteFormProvider>
      </div>
    </div>
  );
}

export default PopupApp;
