import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './components/AuthContext.tsx';
import { PDFProvider } from './components/PDFContext.tsx';
import { SettingsProvider } from './components/SettingsContext.tsx';
import { BrandIdentityProvider } from './context/BrandIdentityContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { setupClientApiFallback } from './utils/clientApiFallback.ts';
import './index.css';

// Initialisation immédiate du moteur de résilience et fallback de base de données locale
setupClientApiFallback();

// Intercepter les erreurs de rejet non gérées liées aux WebSockets / réseau
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason ? (event.reason.message || event.reason.toString?.() || '') : '';
  if (reasonStr.includes('WebSocket') || reasonStr.includes('websocket') || reasonStr.includes('Failed to fetch')) {
    (event as any).preventExtraErrorLogging?.();
    event.preventDefault();
  }
});

// Intercepter les erreurs globales d'événements WebSocket / réseau
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes('WebSocket') || msg.includes('websocket') || msg.includes('Failed to fetch')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <PDFProvider>
          <SettingsProvider>
            <BrandIdentityProvider>
              <App />
            </BrandIdentityProvider>
          </SettingsProvider>
        </PDFProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
