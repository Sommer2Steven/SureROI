/**
 * main.tsx
 *
 * Application entry point. Mounts the React app into the DOM.
 * React.StrictMode enables extra development-time checks (double-renders
 * to catch side effects, deprecation warnings, etc.) — has no effect in
 * the production build.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Tailwind CSS + custom scrollbar/print styles

// Mount the app into the <div id="root"> element in index.html
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
