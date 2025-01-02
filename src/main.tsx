import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './auth/CognitoAuthContext';
import { configureCognito } from './config/cognito';

// Configure Cognito once at app startup
configureCognito();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <App />
    </AuthProvider>
  </StrictMode>,
);
