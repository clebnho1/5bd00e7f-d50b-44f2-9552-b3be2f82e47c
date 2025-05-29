
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Configuração de limpeza e otimização
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

  // Override console para filtrar mensagens desnecessárias
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleInfo = console.info;
  
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('google') || 
        message.includes('analytics') || 
        message.includes('gtm') || 
        message.includes('doubleclick') || 
        message.includes('net::err_http2_protocol_error') ||
        message.includes('permissions policy') ||
        message.includes('unrecognized feature')) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('google') || 
        message.includes('analytics') || 
        message.includes('gtm') || 
        message.includes('doubleclick') || 
        message.includes('unrecognized feature') || 
        message.includes('permission policy') || 
        message.includes('permissions policy') ||
        message.includes('ambient-light-sensor') || 
        message.includes('battery') || 
        message.includes('vr') || 
        message.includes('preloaded resource') ||
        message.includes('geolocation') ||
        message.includes('microphone') ||
        message.includes('camera')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };

  console.info = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('permissions policy') ||
        message.includes('unrecognized feature')) {
      return;
    }
    originalConsoleInfo.apply(console, args);
  };

  // Prevenção de recursos não utilizados
  window.addEventListener('beforeunload', () => {
    // Limpa recursos antes do unload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.scope.includes('google') || 
              registration.scope.includes('analytics')) {
            registration.unregister();
          }
        });
      });
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
