import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely catch cross-origin script errors from Google Maps API activation failures
window.addEventListener('error', (event) => {
  if (
    event.message === 'Script error.' ||
    (event.filename && event.filename.includes('maps.googleapis.com')) ||
    (event.message && event.message.includes('ApiNotActivatedMapError'))
  ) {
    // Suppress unhandled fatal popups for external Google Maps auth errors
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(<App />);

// Register Service Worker for offline PWA functionality
if ('serviceWorker' in navigator && !window.location.host.includes('localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
