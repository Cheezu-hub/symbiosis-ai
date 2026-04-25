import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

// ============================================
// Get Root Element from index.html
// ============================================
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element. Make sure index.html has <div id="root"></div>');
}

// ============================================
// Create React Root (React 18+)
// ============================================
const root = ReactDOM.createRoot(rootElement);

// ============================================
// Render App with Strict Mode
// ============================================
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ============================================
// Console Welcome Message
// ============================================
console.log(
  '%c🌿 SymbioTech Industrial Command%c v1.0',
  'background: linear-gradient(135deg, #58e077, #2ebd59); color: #002108; font-weight: bold; padding: 4px 8px; border-radius: 4px 0 0 4px;',
  'background: #1a1c1e; color: #e2e2e5; padding: 4px 8px; border-radius: 0 4px 4px 0;'
);