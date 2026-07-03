import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from 'virtual:beingcamp-app';
import { logBackendStatus } from './lib/config';
import { installBackendBridge } from './services/bridge';

// One-line note in the console so it's obvious whether the real backend is wired.
logBackendStatus();
// Expose the Supabase bridge to the design layer (no-op without env keys).
installBackendBridge();

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
