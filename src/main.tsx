import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './auth/SupabaseAuthContext';
import { initSentry } from './lib/sentry';
import { initPostHog } from './lib/posthog';

// Initialize monitoring and analytics
initSentry();
initPostHog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
