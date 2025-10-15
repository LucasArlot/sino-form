import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import EmbedApp from './EmbedApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <EmbedApp />
  </StrictMode>
);
