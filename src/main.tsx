
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Comentando temporariamente para eliminar warnings "Unrecognized feature"
// import "./utils/blockAllThirdParty";
// import "./utils/cleanupFirebase";

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

  // Override console para filtrar mensagens de terceiros e warnings obsoletos
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('google') || message.includes('analytics') || message.includes('gtm') || 
        message.includes('doubleclick') || message.includes('net::err_http2_protocol_error')) {
      return; // Silencia erros de terceiros e HTTP2
    }
    originalConsoleError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('google') || message.includes('analytics') || message.includes('gtm') || 
        message.includes('doubleclick') || message.includes('unrecognized feature') || 
        message.includes('permission policy') || message.includes('ambient-light-sensor') || 
        message.includes('battery') || message.includes('vr') || 
        message.includes('preloaded resource')) {
      return; // Silencia warnings de terceiros, permissions policy e preload
    }
    originalConsoleWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
