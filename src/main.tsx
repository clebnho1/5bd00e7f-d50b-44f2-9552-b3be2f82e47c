
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Bloqueia TODOS os serviços de terceiros ANTES de qualquer outra coisa
import "./utils/blockAllThirdParty";
import "./utils/cleanupFirebase";

// Remove recursos não utilizados do navegador
if (typeof window !== 'undefined') {
  // Remove APIs não utilizadas para evitar warnings
  const unusedAPIs = ['webkitStorageInfo', 'webkitIndexedDB'];
  unusedAPIs.forEach(api => {
    try {
      // @ts-ignore
      if (window[api]) {
        // @ts-ignore
        delete window[api];
      }
    } catch (e) {
      // Silencioso - alguns APIs podem não ser deletáveis
    }
  });

  // Bloqueia setInterval e setTimeout para terceiros
  const originalSetInterval = window.setInterval;
  const originalSetTimeout = window.setTimeout;
  
  // @ts-ignore
  window.setInterval = function(callback: any, delay: any, ...args: any[]) {
    const callbackStr = callback.toString();
    if (callbackStr.includes('google') || callbackStr.includes('analytics') || callbackStr.includes('gtm') || callbackStr.includes('facebook')) {
      console.warn('🚫 Blocked third-party interval');
      return -1;
    }
    return originalSetInterval(callback, delay, ...args);
  };
  
  // @ts-ignore
  window.setTimeout = function(callback: any, delay: any, ...args: any[]) {
    const callbackStr = callback.toString();
    if (callbackStr.includes('google') || callbackStr.includes('analytics') || callbackStr.includes('gtm') || callbackStr.includes('facebook')) {
      console.warn('🚫 Blocked third-party timeout');
      return -1;
    }
    return originalSetTimeout(callback, delay, ...args);
  };

  // Override console para filtrar mensagens de terceiros
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('google') || message.includes('analytics') || message.includes('gtm') || message.includes('doubleclick')) {
      return; // Silencia erros de terceiros
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('google') || message.includes('analytics') || message.includes('gtm') || message.includes('doubleclick') || 
        message.includes('unrecognized feature') || message.includes('permission policy') || 
        message.includes('ambient-light-sensor') || message.includes('battery') || message.includes('vr')) {
      return; // Silencia warnings de terceiros e permissions policy
    }
    originalConsoleWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
