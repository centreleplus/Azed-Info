import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './components/AuthContext.tsx';
import { PDFProvider } from './components/PDFContext.tsx';
import { SettingsProvider } from './components/SettingsContext.tsx';
import { setupClientApiFallback } from './utils/clientApiFallback.ts';
import './index.css';

// Initialisation immédiate du moteur de résilience et fallback de base de données locale
setupClientApiFallback();

// Intercepter les erreurs de rejet non gérées liées aux WebSockets pour éviter qu'elles n'apparaissent dans les logs
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = event.reason ? (event.reason.message || event.reason.toString?.() || '') : '';
  if (reasonStr.includes('WebSocket') || reasonStr.includes('websocket')) {
    (event as any).preventExtraErrorLogging?.();
    event.preventDefault();
  }
});

// Intercepter les erreurs globales d'événements WebSocket
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (msg.includes('WebSocket') || msg.includes('websocket')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PDFProvider>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </PDFProvider>
    </AuthProvider>
  </StrictMode>,
);
