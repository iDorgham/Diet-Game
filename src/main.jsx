import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles/components.css'

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Import the integrated app
import AppIntegrated from './AppIntegrated'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppIntegrated />
  </React.StrictMode>,
)
