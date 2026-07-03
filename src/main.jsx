import './styles/global.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from 'virtual:beingcamp-app';
import { logBackendStatus } from './lib/config';

// One-line note in the console so it's obvious whether the real backend is wired.
logBackendStatus();

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
