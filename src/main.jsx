import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

console.log('🚀 [Main.jsx] Starting AyurPulse...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ [Main.jsx] Root element not found!');
} else {
  console.log('✅ [Main.jsx] Root element found');

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>,
    );
    console.log('✅ [Main.jsx] React app rendered successfully');
  } catch (error) {
    console.error('❌ [Main.jsx] Error rendering:', error);
  }
}
