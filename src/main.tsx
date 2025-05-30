
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { cleanupConsole } from "./utils/cleanupConsole";
import "./utils/blockAllThirdParty";

console.log('🚀 [MAIN] Inicializando aplicação');

// Ativa limpeza de console antes de qualquer coisa
cleanupConsole();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
