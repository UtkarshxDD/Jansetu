import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './context/I18nContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <I18nProvider>
        <App />
        <Toaster/>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
