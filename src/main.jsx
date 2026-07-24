import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from 'virtual:beingcamp-app';
import { logBackendStatus } from './lib/config';
import { installBackendBridge } from './services/bridge';
import { installQR } from './lib/qr';

// One-line note in the console so it's obvious whether the real backend is wired.
logBackendStatus();
// Expose the Supabase bridge to the design layer (no-op without env keys).
installBackendBridge();
// Expose the QR generator (printable zone check-in codes).
installQR();

// When a new deploy's service worker takes over mid-session, offer a refresh
// instead of silently serving mixed old/new assets until the next visit.
if ('serviceWorker' in navigator) {
  let hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) {
      hadController = true; // first install, nothing to refresh
      return;
    }
    if (document.getElementById('bc-update-toast')) return;
    const el = document.createElement('button');
    el.id = 'bc-update-toast';
    el.textContent = 'Updated — tap to refresh';
    el.style.cssText =
      'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:99999;' +
      'background:#c9a84c;color:#1a1407;border:none;border-radius:999px;padding:11px 20px;' +
      'font:700 13px "Hanken Grotesk",sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.45)';
    el.onclick = () => location.reload();
    document.body.appendChild(el);
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
