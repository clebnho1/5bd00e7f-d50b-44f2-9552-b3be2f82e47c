
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Sistemas de limpeza e bloqueio - ordem importante
import { initializeAggressiveCleanup } from "./utils/aggressiveCleanup";
import { initializeSuperBlocker } from "./utils/superBlocker";

console.log('🚀 [MAIN] Inicializando aplicação');

// Ativar sistemas de proteção ANTES de qualquer coisa
initializeAggressiveCleanup();
initializeSuperBlocker();

// Aguardar um ciclo para garantir que os sistemas estejam ativos
setTimeout(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}, 0);
