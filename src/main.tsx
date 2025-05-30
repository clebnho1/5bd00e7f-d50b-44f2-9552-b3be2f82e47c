
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Sistema de bloqueio unificado
import { initializeMasterBlocker } from "./utils/masterBlocker";

console.log('🚀 [MAIN] Inicializando aplicação');

// Verificar se já foi inicializado para evitar duplicação
if (!window.__APP_INITIALIZED__) {
  window.__APP_INITIALIZED__ = true;
  
  // Ativar sistema de proteção ANTES de qualquer coisa
  initializeMasterBlocker();

  // Aguardar um ciclo para garantir que os sistemas estejam ativos
  setTimeout(() => {
    const rootElement = document.getElementById("root");
    if (rootElement && !rootElement.hasChildNodes()) {
      createRoot(rootElement).render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
    }
  }, 0);
}
