import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ServiceYearProvider } from './context/ServiceYearContext'
import { UIProvider } from './context/UIContext'
import { NotificationsProvider } from './context/NotificationsContext'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { syncOfflineData } from './lib/sync'

// Register Service Worker
registerSW({ 
  immediate: true,
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      window.location.reload();
    }
  }
});

// Initial sync check
syncOfflineData();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ServiceYearProvider>
        <UIProvider>
          <NotificationsProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </NotificationsProvider>
        </UIProvider>
      </ServiceYearProvider>
    </AuthProvider>
  </StrictMode>,
)
