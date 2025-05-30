
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Sistema de bloqueio unificado
import { initializeMasterBlocker } from "./utils/masterBlocker";

console.log('🚀 [MAIN] Inicializando aplicação');

// Prevenir inicialização dupla
const APP_INIT_KEY = '__CHAT_WHATSAPP_INITIALIZED__';

if (!window[APP_INIT_KEY]) {
  window[APP_INIT_KEY] = true;
  
  console.log('🔧 [MAIN] Primeira inicialização - ativando proteções');
  
  // Ativar sistema de proteção ANTES de qualquer coisa
  initializeMasterBlocker();

  // Renderizar imediatamente sem delay
  const rootElement = document.getElementById("root");
  if (rootElement && !rootElement.hasChildNodes()) {
    console.log('✅ [MAIN] Renderizando React App');
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } else {
    console.log('⚠️ [MAIN] Root element já possui conteúdo, ignorando renderização');
  }
} else {
  console.log('⚠️ [MAIN] Inicialização duplicada detectada - ignorando');
}
