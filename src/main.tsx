
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('🚀 [MAIN] Inicializando aplicação');

// Configuração otimizada para evitar warnings desnecessários
if (typeof window !== 'undefined') {
  // Override console para filtrar mensagens específicas, mas manter essenciais
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    // Filtra apenas erros muito específicos de third-party
    if (message.includes('net::err_http2_protocol_error') ||
        message.includes('permissions policy') && message.includes('unrecognized feature')) {
      return;
    }
    originalError.apply(console, args);
  };
  
  console.warn = function(...args: any[]) {
    const message = args.join(' ').toLowerCase();
    // Filtra apenas warnings muito específicos
    if (message.includes('permissions policy') && message.includes('unrecognized feature')) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
