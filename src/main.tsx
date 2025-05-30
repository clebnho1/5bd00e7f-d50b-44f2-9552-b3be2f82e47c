
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Sistema de bloqueio unificado
import { initializeMasterBlocker } from "./utils/masterBlocker";

console.log('🚀 [MAIN] Inicializando aplicação');

// Ativar sistema de proteção ANTES de qualquer coisa
initializeMasterBlocker();

// Aguardar um ciclo para garantir que os sistemas estejam ativos
setTimeout(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}, 0);
