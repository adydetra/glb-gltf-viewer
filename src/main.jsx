import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setConsoleFunction } from 'three';
import './assets/styles/index.css';
import App from './App.jsx';

setConsoleFunction((type, message, ...params) => {
  if (type === 'warn' && typeof message === 'string' && message.includes('Clock: This module has been deprecated')) {
    return;
  }
  console[type](message, ...params);
});

if (typeof window !== 'undefined' && window.MouseEvent) {
  ['mozPressure', 'mozInputSource'].forEach((prop) => {
    try {
      if (prop in MouseEvent.prototype) {
        Object.defineProperty(MouseEvent.prototype, prop, {
          configurable: true,
          enumerable: false,
          get() {
            return prop === 'mozPressure' ? (this.pressure ?? 0) : (this.pointerType ?? 0);
          },
        });
      }
    } catch {
      void 0;
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
