import { QuoteForm } from '@/features/lead';
import { QuoteFormProvider } from '@/features/lead/QuoteFormContext';
import { useEffect, useState } from 'react';
import '@/styles/main.css';

function EmbedApp() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    // Système de scaling responsive
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

      // Détecter si c'est un appareil mobile
      const isMobile = parentWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // Pas de scaling sur mobile - laisser les CSS responsive faire leur travail
        newScale = 1;
      } else {
        // Breakpoints de scaling pour desktop uniquement
        if (parentWidth >= 2560) {
          newScale = 1; // 100% - taille optimale pour 32"
        } else if (parentWidth >= 1920) {
          newScale = 0.85; // 85% pour 27"
        } else if (parentWidth >= 1440) {
          newScale = 0.75; // 75% pour 24"
        } else {
          newScale = 0.65; // 65% pour écrans plus petits
        }
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

    // Notifier le parent que le formulaire est prêt
    const notifyParent = () => {
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'sino-form-ready',
            data: {
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent
            }
          }, '*');
        }
      } catch (error) {
        console.warn('Impossible de notifier le parent:', error);
      }
    };

    // Notifier après un court délai pour s'assurer que tout est chargé
    setTimeout(notifyParent, 100);

    return () => {
      window.removeEventListener('resize', applyResponsiveScaling);
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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

export default EmbedApp;
