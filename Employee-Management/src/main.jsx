import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import './styles/globals.css';
import App from './App.jsx';

document.documentElement.setAttribute('data-theme', localStorage.getItem('ems_theme') || 'dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </StrictMode>,
);
